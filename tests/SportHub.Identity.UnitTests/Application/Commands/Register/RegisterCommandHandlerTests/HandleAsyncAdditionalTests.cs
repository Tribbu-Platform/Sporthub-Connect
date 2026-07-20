using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using Moq;
using SportHub.Identity.Application.Commands.Register;
using SportHub.Identity.Application.DTOs;
using SportHub.Identity.Application.Services;
using SportHub.Identity.Domain.Entities;
using SportHub.Identity.Domain.Common;
using SportHub.Identity.Domain.Repositories;
using SportHub.Identity.Domain.ValueObjects;

namespace SportHub.Identity.UnitTests.Application.Commands.Register.RegisterCommandHandlerTests;

public class HandleAsyncAdditionalTests
{
    private readonly Mock<IUserRepository> _userRepoMock = new();
    private readonly Mock<IIdentityUnitOfWork> _uowMock = new();
    private readonly Mock<IAuth0Service> _auth0Mock = new();
    private readonly Mock<ITokenService> _tokenServiceMock = new();
    private readonly Mock<IValidator<RegisterCommand>> _validatorMock = new();
    private readonly RegisterCommandHandler _sut;

    public HandleAsyncAdditionalTests()
    {
        _sut = new RegisterCommandHandler(
            _userRepoMock.Object,
            _uowMock.Object,
            _auth0Mock.Object,
            _tokenServiceMock.Object,
            _validatorMock.Object);
    }

    [Fact]
    public async Task Should_Fail_When_Auth0ServiceThrows()
    {
        // Arrange --------------------------------------------------------
        var command = new RegisterCommand
        {
            Email = "nuevo@example.com",
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
            .ThrowsAsync(new HttpRequestException("Auth0 API error"));

        // Act ------------------------------------------------------------
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert ----------------------------------------------------------
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().NotBeNull();
        result.Error!.Code.Should().Be("ExternalService");
        result.Error.Description.Should().Be("No se pudo crear la cuenta en el proveedor de autenticación");
    }

    [Fact]
    public async Task Should_ReturnAcceptedTerms_When_CommandIsValid()
    {
        // Arrange --------------------------------------------------------
        var command = new RegisterCommand
        {
            Email = "terminos@example.com",
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
            .ReturnsAsync("auth0|test123");

        _tokenServiceMock
            .Setup(t => t.GenerateAccessToken(It.IsAny<User>()))
            .Returns("token");

        _tokenServiceMock
            .Setup(t => t.GenerateRefreshToken())
            .Returns("refresh");

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
        result.Value.AcceptedTerms.Should().BeTrue();
        result.Value.Message.Should().Be("Registro exitoso");
    }

    [Fact]
    public async Task Should_IncludeEmailInResponse_When_RegistrationSucceeds()
    {
        // Arrange --------------------------------------------------------
        var command = new RegisterCommand
        {
            Email = "respuesta@example.com",
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
            .ReturnsAsync("auth0|resp");

        _tokenServiceMock
            .Setup(t => t.GenerateAccessToken(It.IsAny<User>()))
            .Returns("token-resp");

        _tokenServiceMock
            .Setup(t => t.GenerateRefreshToken())
            .Returns("refresh-resp");

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
        result.Value.Email.Should().Be("respuesta@example.com");
        result.Value.AccessToken.Should().Be("token-resp");
        result.Value.RefreshToken.Should().Be("refresh-resp");
        result.Value.ExpiresIn.Should().Be(3600);
        result.Value.EmailVerified.Should().BeFalse();
    }

    [Fact]
    public async Task Should_NotCreateAuth0User_When_EmailAlreadyExists()
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
        result.Error!.Code.Should().Be("Conflict");
        _auth0Mock.Verify(
            a => a.CreateUserAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Never);
        _userRepoMock.Verify(
            r => r.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Should_PersistUser_OnlyAfterAuth0Success()
    {
        // Arrange --------------------------------------------------------
        var command = new RegisterCommand
        {
            Email = "persistir@example.com",
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
            .ReturnsAsync("auth0|persist");

        _tokenServiceMock
            .Setup(t => t.GenerateAccessToken(It.IsAny<User>()))
            .Returns("token");

        _tokenServiceMock
            .Setup(t => t.GenerateRefreshToken())
            .Returns("refresh");

        _userRepoMock
            .Setup(r => r.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _uowMock
            .Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act ------------------------------------------------------------
        await _sut.Handle(command, CancellationToken.None);

        // Assert ----------------------------------------------------------
        _userRepoMock.Verify(
            r => r.AddAsync(It.IsAny<User>(), It.IsAny<CancellationToken>()),
            Times.Once);
        _uowMock.Verify(
            u => u.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }
}
