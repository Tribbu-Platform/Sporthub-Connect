using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using SportHub.Identity.Domain.Entities;
using SportHub.Identity.Domain.ValueObjects;
using SportHub.Identity.Infrastructure;
using SportHub.Identity.Infrastructure.Repositories;

namespace SportHub.Identity.UnitTests.Infrastructure.Repositories.UserRepositoryTests;

public class CrudTests
{
    private static IdentityDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<IdentityDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new IdentityDbContext(options);
    }

    [Fact]
    public async Task Should_AddAndRetrieveUser_When_ValidUser()
    {
        // Arrange --------------------------------------------------------
        var dbContext = CreateDbContext();
        var repository = new UserRepository(dbContext);
        var email = EmailAddress.From("maria@example.com");
        var passwordHash = PasswordHash.Create("Maria2026!Segura");
        var user = User.Create(email, passwordHash);

        // Act ------------------------------------------------------------
        await repository.AddAsync(user, CancellationToken.None);
        await dbContext.SaveChangesAsync(CancellationToken.None);

        // Assert ----------------------------------------------------------
        var retrieved = await repository.GetByIdAsync(user.Id, CancellationToken.None);
        retrieved.Should().NotBeNull();
        retrieved!.Id.Should().Be(user.Id);
        retrieved.Email.Should().Be(email);
        retrieved.PasswordHash.Should().Be(passwordHash);
        retrieved.IsActive.Should().BeTrue();
        retrieved.EmailVerified.Should().BeFalse();
    }

    [Fact]
    public async Task Should_GetByEmail_When_UserExists()
    {
        // Arrange --------------------------------------------------------
        var dbContext = CreateDbContext();
        var repository = new UserRepository(dbContext);
        var email = EmailAddress.From("juan@example.com");
        var user = User.Create(email, PasswordHash.Create("Juan2026!Segura"));

        await repository.AddAsync(user, CancellationToken.None);
        await dbContext.SaveChangesAsync(CancellationToken.None);

        // Act ------------------------------------------------------------
        var retrieved = await repository.GetByEmailAsync(email, CancellationToken.None);

        // Assert ----------------------------------------------------------
        retrieved.Should().NotBeNull();
        retrieved!.Id.Should().Be(user.Id);
        retrieved.Email.Should().Be(email);
    }

    [Fact]
    public async Task Should_ReturnNull_When_UserNotFound()
    {
        // Arrange --------------------------------------------------------
        var dbContext = CreateDbContext();
        var repository = new UserRepository(dbContext);
        var nonExistentEmail = EmailAddress.From("noexiste@example.com");

        // Act ------------------------------------------------------------
        var retrieved = await repository.GetByEmailAsync(nonExistentEmail, CancellationToken.None);

        // Assert ----------------------------------------------------------
        retrieved.Should().BeNull();
    }

    [Fact]
    public async Task Should_ReturnNull_When_GetByIdNotFound()
    {
        // Arrange --------------------------------------------------------
        var dbContext = CreateDbContext();
        var repository = new UserRepository(dbContext);

        // Act ------------------------------------------------------------
        var retrieved = await repository.GetByIdAsync(Guid.NewGuid(), CancellationToken.None);

        // Assert ----------------------------------------------------------
        retrieved.Should().BeNull();
    }

    [Fact]
    public async Task Should_ReturnTrue_When_EmailExists()
    {
        // Arrange --------------------------------------------------------
        var dbContext = CreateDbContext();
        var repository = new UserRepository(dbContext);
        var email = EmailAddress.From("existente@example.com");
        var user = User.Create(email, PasswordHash.Create("Existente2026!"));

        await repository.AddAsync(user, CancellationToken.None);
        await dbContext.SaveChangesAsync(CancellationToken.None);

        // Act ------------------------------------------------------------
        var exists = await repository.ExistsByEmailAsync(email, CancellationToken.None);

        // Assert ----------------------------------------------------------
        exists.Should().BeTrue();
    }

    [Fact]
    public async Task Should_ReturnFalse_When_EmailDoesNotExist()
    {
        // Arrange --------------------------------------------------------
        var dbContext = CreateDbContext();
        var repository = new UserRepository(dbContext);
        var nonExistentEmail = EmailAddress.From("noexiste@example.com");

        // Act ------------------------------------------------------------
        var exists = await repository.ExistsByEmailAsync(nonExistentEmail, CancellationToken.None);

        // Assert ----------------------------------------------------------
        exists.Should().BeFalse();
    }

    [Fact]
    public async Task Should_UpdateUser_When_UserModified()
    {
        // Arrange --------------------------------------------------------
        var dbContext = CreateDbContext();
        var repository = new UserRepository(dbContext);
        var email = EmailAddress.From("actualizar@example.com");
        var user = User.Create(email, PasswordHash.Create("Actualizar2026!"));

        await repository.AddAsync(user, CancellationToken.None);
        await dbContext.SaveChangesAsync(CancellationToken.None);

        // Act ------------------------------------------------------------
        user.VerifyEmail();
        await repository.UpdateAsync(user, CancellationToken.None);
        await dbContext.SaveChangesAsync(CancellationToken.None);

        // Assert ----------------------------------------------------------
        var retrieved = await repository.GetByIdAsync(user.Id, CancellationToken.None);
        retrieved.Should().NotBeNull();
        retrieved!.EmailVerified.Should().BeTrue();
    }

    [Fact]
    public async Task Should_AddMultipleUsers_When_QueriedReturnsCorrectCount()
    {
        // Arrange --------------------------------------------------------
        var dbContext = CreateDbContext();
        var repository = new UserRepository(dbContext);

        var user1 = User.Create(
            EmailAddress.From("uno@example.com"),
            PasswordHash.Create("Password2026!A"));
        var user2 = User.Create(
            EmailAddress.From("dos@example.com"),
            PasswordHash.Create("Password2026!B"));

        await repository.AddAsync(user1, CancellationToken.None);
        await repository.AddAsync(user2, CancellationToken.None);
        await dbContext.SaveChangesAsync(CancellationToken.None);

        // Act ------------------------------------------------------------
        var retrieved1 = await repository.GetByEmailAsync(
            EmailAddress.From("uno@example.com"), CancellationToken.None);
        var retrieved2 = await repository.GetByEmailAsync(
            EmailAddress.From("dos@example.com"), CancellationToken.None);

        // Assert ----------------------------------------------------------
        retrieved1.Should().NotBeNull();
        retrieved2.Should().NotBeNull();
        retrieved1!.Id.Should().NotBe(retrieved2!.Id);
    }
}
