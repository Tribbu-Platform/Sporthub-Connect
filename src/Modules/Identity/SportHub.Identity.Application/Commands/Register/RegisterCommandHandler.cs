using FluentValidation;
using MediatR;
using SportHub.Identity.Application.DTOs;
using SportHub.Identity.Application.Services;
using SportHub.Identity.Domain.Common;
using SportHub.Identity.Domain.Entities;
using SportHub.Identity.Domain.Repositories;
using SportHub.Identity.Domain.ValueObjects;
using SportHub.Shared.Abstractions;

namespace SportHub.Identity.Application.Commands.Register;

/// <summary>
/// Handles the registration of a new user with email and password.
/// Validates input, checks for duplicates, creates the user, and returns tokens.
/// </summary>
public sealed class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<RegisterResponse>>
{
    private readonly IUserRepository _userRepository;
    private readonly IIdentityUnitOfWork _unitOfWork;
    private readonly IAuth0Service _auth0Service;
    private readonly ITokenService _tokenService;
    private readonly IValidator<RegisterCommand> _validator;

    /// <summary>
    /// Initializes a new instance of the <see cref="RegisterCommandHandler"/> class.
    /// </summary>
    public RegisterCommandHandler(
        IUserRepository userRepository,
        IIdentityUnitOfWork unitOfWork,
        IAuth0Service auth0Service,
        ITokenService tokenService,
        IValidator<RegisterCommand> validator)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _auth0Service = auth0Service;
        _tokenService = tokenService;
        _validator = validator;
    }

    /// <inheritdoc/>
    public async Task<Result<RegisterResponse>> Handle(RegisterCommand command, CancellationToken cancellationToken)
    {
        // 1. Validate input
        var validationResult = await _validator.ValidateAsync(command, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .Select(e => e.ErrorMessage);
            return Result<RegisterResponse>.Failure(
                Error.Validation(string.Join("; ", errors)));
        }

        // 2. Create Value Objects
        EmailAddress email;
        PasswordHash passwordHash;

        try
        {
            email = EmailAddress.From(command.Email);
            passwordHash = PasswordHash.Create(command.Password);
        }
        catch (ArgumentException ex)
        {
            return Result<RegisterResponse>.Failure(
                Error.Validation(ex.Message));
        }

        // 3. Check for duplicate email
        var exists = await _userRepository.ExistsByEmailAsync(email, cancellationToken);
        if (exists)
        {
            return Result<RegisterResponse>.Failure(
                Error.Conflict("Ya existe un usuario registrado con este email"));
        }

        // 4. Create user (domain event is added inside the factory)
        var user = User.Create(email, passwordHash);

        // 5. Create user in Auth0
        try
        {
            await _auth0Service.CreateUserAsync(
                email.Value,
                passwordHash.Value,
                cancellationToken);
        }
        catch (Exception)
        {
            return Result<RegisterResponse>.Failure(
                new Error("ExternalService", "No se pudo crear la cuenta en el proveedor de autenticación"));
        }

        // 6. Generate tokens
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        // 7. Persist user
        await _userRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // 8. Return response
        return Result<RegisterResponse>.Success(new RegisterResponse
        {
            UserId = user.Id,
            Email = email.Value,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresIn = 3600,
            EmailVerified = user.EmailVerified,
            AcceptedTerms = command.AcceptTerms,
            Message = "Registro exitoso"
        });
    }
}
