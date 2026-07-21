using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Moq;
using SportHub.Identity.Application.Commands.Register;
using SportHub.Identity.Application.DTOs;
using SportHub.Identity.Application.Services;
using SportHub.Identity.Domain.Common;
using SportHub.Identity.Domain.Entities;
using SportHub.Identity.Domain.Repositories;
using SportHub.Identity.Domain.ValueObjects;

namespace SportHub.Identity.UnitTests.Application.Commands.Register.RegisterCommandHandlerTests;

public class HandleAsyncTests
{
    private readonly Mock<IUserRepository> _userRepoMock = new();
    private readonly Mock<IIdentityUnitOfWork> _uowMock = new();
    private readonly Mock<IAuth0Service> _auth0Mock = new();
    private readonly Mock<ITokenService> _tokenServiceMock = new();
    private readonly Mock<IValidator<RegisterCommand>> _validatorMock = new();
    private readonly RegisterCommandHandler _sut;

    public HandleAsyncTests()
    {
        _sut = new RegisterCommandHandler(
            _userRepoMock.Object,
            _uowMock.Object,
            _auth0Mock.Object,
            _tokenServiceMock.Object,
            _validatorMock.Object);
    }

    [Fact]
    public async Task Should_RegisterUser_When_ValidCommand()
    {
        // Arrange --------------------------------------------------------
        var command = new RegisterCommand
        {
            Email = "maria@example.com",
            Password = "Maria2026!Segura",
            AcceptTerms = true
        };

        _validatorMock
            .Setup(v => v.ValidateAsync(It.IsAny<RegisterCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());

        _userRepoMock
            .Setup(r => r.ExistsByEmailAsync(It.IsAny<EmailAddress>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _auth0Mock
            .Setup(a => a.CreateUserAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("auth0|12345");

        _tokenServiceMock
            .Setup(t => t.GenerateAccessToken(It.IsAny<User>()))
            .Returns("access-token-123");

        _tokenServiceMock
            .Setup(t => t.GenerateRefreshToken())
            .Returns("refresh-token-456");

        _userRepoMock
            .Setup(r => r.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _uowMock
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act ------------------------------------------------------------
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert ----------------------------------------------------------
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Email.Should().Be("maria@example.com");
        result.Value.AccessToken.Should().Be("access-token-123");
        result.Value.RefreshToken.Should().Be("refresh-token-456");
        result.Value.AcceptedTerms.Should().BeTrue();
        result.Value.Message.Should().Be("Registro exitoso");
    }

    [Fact]
    public async Task Should_Fail_When_EmailAlreadyExists()
    {
        // Arrange --------------------------------------------------------
        var command = new RegisterCommand
        {
            Email = "existente@example.com",
            Password = "Maria2026!Segura",
            AcceptTerms = true
        };

        _validatorMock
            .Setup(v => v.ValidateAsync(It.IsAny<RegisterCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());

        _userRepoMock
            .Setup(r => r.ExistsByEmailAsync(It.IsAny<EmailAddress>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act ------------------------------------------------------------
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert ----------------------------------------------------------
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().NotBeNull();
        result.Error!.Code.Should().Be("Conflict");
        result.Error.Description.Should().Be("Ya existe un usuario registrado con este email");
    }

    [Fact]
    public async Task Should_Fail_When_ValidationFails()
    {
        // Arrange --------------------------------------------------------
        var command = new RegisterCommand
        {
            Email = string.Empty,
            Password = "short",
            AcceptTerms = false
        };

        var validationFailures = new List<ValidationFailure>
        {
            new("Email", "El email es obligatorio"),
            new("Password", "La contraseña debe tener al menos 8 caracteres")
        };

        _validatorMock
            .Setup(v => v.ValidateAsync(It.IsAny<RegisterCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult(validationFailures));

        // Act ------------------------------------------------------------
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert ----------------------------------------------------------
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().NotBeNull();
        result.Error!.Code.Should().Be("Validation");
    }

    [Fact]
    public async Task Should_PublishDomainEvent_When_UserCreated()
    {
        // Arrange --------------------------------------------------------
        var command = new RegisterCommand
        {
            Email = "nuevo@example.com",
            Password = "Maria2026!Segura",
            AcceptTerms = true
        };

        User? capturedUser = null;

        _validatorMock
            .Setup(v => v.ValidateAsync(It.IsAny<RegisterCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());

        _userRepoMock
            .Setup(r => r.ExistsByEmailAsync(It.IsAny<EmailAddress>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _userRepoMock
            .Setup(r => r.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
            .Callback<User, CancellationToken>((u, _) => capturedUser = u)
            .Returns(Task.CompletedTask);

        _auth0Mock
            .Setup(a => a.CreateUserAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("auth0|12345");

        _tokenServiceMock
            .Setup(t => t.GenerateAccessToken(It.IsAny<User>()))
            .Returns("token");

        _tokenServiceMock
            .Setup(t => t.GenerateRefreshToken())
            .Returns("refresh");

        _uowMock
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act ------------------------------------------------------------
        await _sut.Handle(command, CancellationToken.None);

        // Assert ----------------------------------------------------------
        capturedUser.Should().NotBeNull();
        capturedUser!.DomainEvents.Should().Contain(e => e.GetType().Name == "UserRegisteredEvent");
    }
}
