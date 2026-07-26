using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using SportHub.Identity.Application.Commands.Register;
using SportHub.Identity.Application.DTOs;
using SportHub.Identity.Application.Services;
using SportHub.Identity.Domain.Common;
using SportHub.Identity.Domain.Repositories;
using SportHub.Identity.Infrastructure.Repositories;
using SportHub.Identity.IntegrationTests.Infrastructure;

namespace SportHub.Identity.IntegrationTests.Handlers;

/// <summary>
/// Integration tests for <see cref="RegisterCommandHandler"/>.
/// Tests the full registration flow with a real PostgreSQL database.
/// Auth0 and TokenService are mocked as they are external dependencies.
/// </summary>
[Collection("PostgreSqlIntegrationTests")]
public class RegisterCommandHandlerIntegrationTests
{
    private readonly PostgreSqlFixture _fixture;
    private readonly string _schema;

    public RegisterCommandHandlerIntegrationTests(PostgreSqlFixture fixture)
    {
        _fixture = fixture;
        _schema = $"test_handler_{Guid.NewGuid():N}"[..25];
    }

    [Fact]
    public async Task Should_RegisterUserInDatabase_When_CommandIsValid()
    {
        // Arrange --------------------------------------------------------
        await using var context = _fixture.CreateDbContext(_schema);
        var repository = new UserRepository(context);
        var uow = (IIdentityUnitOfWork)context;

        var auth0Mock = new Mock<IAuth0Service>();
        auth0Mock
            .Setup(a => a.CreateUserAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("auth0|integration_test");

        var tokenServiceMock = new Mock<ITokenService>();
        tokenServiceMock
            .Setup(t => t.GenerateAccessToken(It.IsAny<Domain.Entities.User>()))
            .Returns("test-access-token");
        tokenServiceMock
            .Setup(t => t.GenerateRefreshToken())
            .Returns("test-refresh-token");

        var validator = new RegisterCommandValidator();

        var handler = new RegisterCommandHandler(
            repository, uow, auth0Mock.Object, tokenServiceMock.Object, validator);

        var command = new RegisterCommand
        {
            Email = "integration-test@example.com",
            Password = "Integration2026!Test",
            AcceptTerms = true
        };

        // Act ------------------------------------------------------------
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert ----------------------------------------------------------
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Email.Should().Be("integration-test@example.com");
        result.Value.AccessToken.Should().Be("test-access-token");
        result.Value.RefreshToken.Should().Be("test-refresh-token");
        result.Value.ExpiresIn.Should().Be(3600);
        result.Value.EmailVerified.Should().BeFalse();
        result.Value.AcceptedTerms.Should().BeTrue();
        result.Value.Message.Should().Be("Registro exitoso");

        // Verify user was persisted in the database
        var persisted = await repository.GetByEmailAsync(
            Domain.ValueObjects.EmailAddress.From("integration-test@example.com"),
            CancellationToken.None);
        persisted.Should().NotBeNull();
        persisted!.IsActive.Should().BeTrue();
        persisted.EmailVerified.Should().BeFalse();
        persisted.AuthProvider.Should().Be(AuthProvider.Email);
    }

    [Fact]
    public async Task Should_RejectDuplicateEmail_When_UserAlreadyExists()
    {
        // Arrange --------------------------------------------------------
        await using var context = _fixture.CreateDbContext(_schema);
        var repository = new UserRepository(context);
        var uow = (IIdentityUnitOfWork)context;

        var auth0Mock = new Mock<IAuth0Service>();
        auth0Mock
            .Setup(a => a.CreateUserAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("auth0|dup_test");

        var tokenServiceMock = new Mock<ITokenService>();
        tokenServiceMock
            .Setup(t => t.GenerateAccessToken(It.IsAny<Domain.Entities.User>()))
            .Returns("token");
        tokenServiceMock
            .Setup(t => t.GenerateRefreshToken())
            .Returns("refresh");

        var validator = new RegisterCommandValidator();
        var handler = new RegisterCommandHandler(
            repository, uow, auth0Mock.Object, tokenServiceMock.Object, validator);

        // First registration - success
        var firstCommand = new RegisterCommand
        {
            Email = "duplicate@example.com",
            Password = "Duplicate2026!Test",
            AcceptTerms = true
        };
        await handler.Handle(firstCommand, CancellationToken.None);

        // Reset mocks for second call
        auth0Mock.Invocations.Clear();
        tokenServiceMock.Invocations.Clear();

        // Act - second registration with same email
        var secondCommand = new RegisterCommand
        {
            Email = "duplicate@example.com",
            Password = "OtherPass2026!Test",
            AcceptTerms = true
        };
        var result = await handler.Handle(secondCommand, CancellationToken.None);

        // Assert ----------------------------------------------------------
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().NotBeNull();
        result.Error!.Code.Should().Be("Conflict");
        result.Error.Description.Should().Be("Ya existe un usuario registrado con este email");

        // Verify Auth0 was NOT called the second time
        auth0Mock.Verify(
            a => a.CreateUserAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Never);

        // Verify only one user exists with that email
        var users = await repository.ExistsByEmailAsync(
            Domain.ValueObjects.EmailAddress.From("duplicate@example.com"),
            CancellationToken.None);
        users.Should().BeTrue();
    }

    [Fact]
    public async Task Should_HandleConcurrentRegistration_When_SameEmailUsedSimultaneously()
    {
        // Arrange --------------------------------------------------------
        await using var context = _fixture.CreateDbContext(_schema);
        var repository = new UserRepository(context);
        var uow = (IIdentityUnitOfWork)context;

        var auth0Mock = new Mock<IAuth0Service>();
        auth0Mock
            .Setup(a => a.CreateUserAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("auth0|concurrent");

        var tokenServiceMock = new Mock<ITokenService>();
        tokenServiceMock
            .Setup(t => t.GenerateAccessToken(It.IsAny<Domain.Entities.User>()))
            .Returns("token");
        tokenServiceMock
            .Setup(t => t.GenerateRefreshToken())
            .Returns("refresh");

        var validator = new RegisterCommandValidator();

        // Create two handlers sharing the same repository
        var handler1 = new RegisterCommandHandler(
            repository, uow, auth0Mock.Object, tokenServiceMock.Object, validator);
        var handler2 = new RegisterCommandHandler(
            repository, uow, auth0Mock.Object, tokenServiceMock.Object, validator);

        var command = new RegisterCommand
        {
            Email = "concurrent@example.com",
            Password = "Concurrent2026!Test",
            AcceptTerms = true
        };

        // Act - simulate concurrent registration
        var task1 = handler1.Handle(command, CancellationToken.None);
        var task2 = handler2.Handle(command, CancellationToken.None);

        var results = await Task.WhenAll(task1, task2);

        // Assert ----------------------------------------------------------
        // Exactly one should succeed, one should fail with Conflict
        var successCount = results.Count(r => r.IsSuccess);
        var failCount = results.Count(r => r.IsSuccess == false);

        successCount.Should().Be(1, "only one registration should succeed for the same email");
        failCount.Should().Be(1, "the second registration should fail with duplicate email");

        var failedResult = results.First(r => !r.IsSuccess);
        failedResult.Error!.Code.Should().Be("Conflict");
    }
}
