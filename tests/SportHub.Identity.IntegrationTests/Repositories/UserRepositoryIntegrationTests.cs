using Microsoft.EntityFrameworkCore;
using SportHub.Identity.Domain.Entities;
using SportHub.Identity.Domain.ValueObjects;
using SportHub.Identity.Infrastructure.Repositories;
using SportHub.Identity.IntegrationTests.Infrastructure;

namespace SportHub.Identity.IntegrationTests.Repositories;

/// <summary>
/// Integration tests for <see cref="UserRepository"/> against a real PostgreSQL database.
/// </summary>
[Collection("PostgreSqlIntegrationTests")]
public class UserRepositoryIntegrationTests
{
    private readonly PostgreSqlFixture _fixture;
    private readonly string _schema;

    /// <summary>
    /// Initializes a new instance.
    /// </summary>
    public UserRepositoryIntegrationTests(PostgreSqlFixture fixture)
    {
        _fixture = fixture;
        _schema = $"test_ur_{Guid.NewGuid():N}"[..20]; // Unique schema per test run
    }

    [Fact]
    public async Task Should_PersistAndRetrieveUser_When_AddedToDatabase()
    {
        // Arrange --------------------------------------------------------
        await using var context = _fixture.CreateDbContext(_schema);
        var repository = new UserRepository(context);
        var email = EmailAddress.From("integration@example.com");
        var passwordHash = PasswordHash.Create("Integration2026!Test");
        var user = User.Create(email, passwordHash);

        // Act ------------------------------------------------------------
        await repository.AddAsync(user, CancellationToken.None);
        await context.SaveChangesAsync(CancellationToken.None);

        // Assert ----------------------------------------------------------
        var retrieved = await repository.GetByIdAsync(user.Id, CancellationToken.None);
        retrieved.Should().NotBeNull();
        retrieved!.Email.Should().Be(email);
        retrieved.PasswordHash.Should().Be(passwordHash);
        retrieved.IsActive.Should().BeTrue();
        retrieved.EmailVerified.Should().BeFalse();
        retrieved.AuthProvider.Should().Be(Domain.Common.AuthProvider.Email);
        retrieved.DomainEvents.Should().Contain(e => e.GetType().Name == "UserRegisteredEvent");
    }

    [Fact]
    public async Task Should_RetrieveUserByEmail_When_UserExists()
    {
        // Arrange --------------------------------------------------------
        await using var context = _fixture.CreateDbContext(_schema);
        var repository = new UserRepository(context);
        var email = EmailAddress.From("findbyemail@example.com");
        var user = User.Create(email, PasswordHash.Create("FindByEmail2026!"));

        await repository.AddAsync(user, CancellationToken.None);
        await context.SaveChangesAsync(CancellationToken.None);

        // Act ------------------------------------------------------------
        var retrieved = await repository.GetByEmailAsync(email, CancellationToken.None);

        // Assert ----------------------------------------------------------
        retrieved.Should().NotBeNull();
        retrieved!.Id.Should().Be(user.Id);
        retrieved.Email.Value.Should().Be("findbyemail@example.com");
    }

    [Fact]
    public async Task Should_ReturnNull_When_UserNotFoundByEmail()
    {
        // Arrange --------------------------------------------------------
        await using var context = _fixture.CreateDbContext(_schema);
        var repository = new UserRepository(context);
        var nonExistentEmail = EmailAddress.From("noexiste@example.com");

        // Act ------------------------------------------------------------
        var retrieved = await repository.GetByEmailAsync(nonExistentEmail, CancellationToken.None);

        // Assert ----------------------------------------------------------
        retrieved.Should().BeNull();
    }

    [Fact]
    public async Task Should_ReturnTrue_When_EmailExists()
    {
        // Arrange --------------------------------------------------------
        await using var context = _fixture.CreateDbContext(_schema);
        var repository = new UserRepository(context);
        var email = EmailAddress.From("exists@example.com");
        var user = User.Create(email, PasswordHash.Create("ExistsTest2026!"));

        await repository.AddAsync(user, CancellationToken.None);
        await context.SaveChangesAsync(CancellationToken.None);

        // Act ------------------------------------------------------------
        var exists = await repository.ExistsByEmailAsync(email, CancellationToken.None);

        // Assert ----------------------------------------------------------
        exists.Should().BeTrue();
    }

    [Fact]
    public async Task Should_ReturnFalse_When_EmailDoesNotExist()
    {
        // Arrange --------------------------------------------------------
        await using var context = _fixture.CreateDbContext(_schema);
        var repository = new UserRepository(context);

        // Act ------------------------------------------------------------
        var exists = await repository.ExistsByEmailAsync(
            EmailAddress.From("noexiste@example.com"), CancellationToken.None);

        // Assert ----------------------------------------------------------
        exists.Should().BeFalse();
    }

    [Fact]
    public async Task Should_UpdateUser_When_UserModified()
    {
        // Arrange --------------------------------------------------------
        await using var context = _fixture.CreateDbContext(_schema);
        var repository = new UserRepository(context);
        var email = EmailAddress.From("updateable@example.com");
        var user = User.Create(email, PasswordHash.Create("UpdateTest2026!"));

        await repository.AddAsync(user, CancellationToken.None);
        await context.SaveChangesAsync(CancellationToken.None);

        // Act ------------------------------------------------------------
        user.VerifyEmail();
        await repository.UpdateAsync(user, CancellationToken.None);
        await context.SaveChangesAsync(CancellationToken.None);

        // Assert ----------------------------------------------------------
        var retrieved = await repository.GetByIdAsync(user.Id, CancellationToken.None);
        retrieved.Should().NotBeNull();
        retrieved!.EmailVerified.Should().BeTrue();
    }

    [Fact]
    public async Task Should_EnforceEmailUniqueness_When_TryingToAddDuplicate()
    {
        // Arrange --------------------------------------------------------
        await using var context = _fixture.CreateDbContext(_schema);
        var repository = new UserRepository(context);
        var email = EmailAddress.From("duplicate@example.com");
        var user1 = User.Create(email, PasswordHash.Create("FirstUser2026!"));
        var user2 = User.Create(email, PasswordHash.Create("SecondUser2026!"));

        await repository.AddAsync(user1, CancellationToken.None);
        await context.SaveChangesAsync(CancellationToken.None);

        await repository.AddAsync(user2, CancellationToken.None);

        // Act ------------------------------------------------------------
        var act = () => context.SaveChangesAsync(CancellationToken.None);

        // Assert ----------------------------------------------------------
        // EF Core should throw a DbUpdateException due to unique index on Email
        await act.Should().ThrowAsync<DbUpdateException>();
    }
}
