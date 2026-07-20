using FluentAssertions;
using SportHub.Identity.Domain.Common;
using SportHub.Identity.Domain.Entities;
using SportHub.Identity.Domain.ValueObjects;

namespace SportHub.Identity.UnitTests.Domain.Entities.UserTests;

public class CreateTests
{
    [Fact]
    public void Should_CreateUser_When_ValidEmailAndPasswordHash()
    {
        // Arrange --------------------------------------------------------
        var email = EmailAddress.From("maria@example.com");
        var passwordHash = PasswordHash.Create("Maria2026!Segura");

        // Act ------------------------------------------------------------
        var user = User.Create(email, passwordHash);

        // Assert ----------------------------------------------------------
        user.Should().NotBeNull();
        user.Id.Should().NotBeEmpty();
        user.Email.Should().Be(email);
        user.PasswordHash.Should().Be(passwordHash);
        user.EmailVerified.Should().BeFalse();
        user.AuthProvider.Should().Be(AuthProvider.Email);
        user.IsActive.Should().BeTrue();
        user.FailedLoginAttempts.Should().Be(0);
        user.LockedUntil.Should().BeNull();
        user.LastLoginAt.Should().BeNull();
        user.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        user.DomainEvents.Should().ContainSingle(e => e.GetType().Name == "UserRegisteredEvent");
    }

    [Fact]
    public void Should_ThrowArgumentNullException_When_EmailIsNull()
    {
        // Arrange --------------------------------------------------------
        EmailAddress? nullEmail = null;
        var passwordHash = PasswordHash.Create("Maria2026!Segura");

        // Act ------------------------------------------------------------
        var act = () => User.Create(nullEmail!, passwordHash);

        // Assert ----------------------------------------------------------
        act.Should().Throw<ArgumentNullException>()
            .WithMessage("*email*", because: "email is required to create a user");
    }

    [Fact]
    public void Should_ThrowArgumentNullException_When_PasswordHashIsNull()
    {
        // Arrange --------------------------------------------------------
        var email = EmailAddress.From("maria@example.com");

        // Act ------------------------------------------------------------
        var act = () => User.Create(email, null!);

        // Assert ----------------------------------------------------------
        act.Should().Throw<ArgumentNullException>()
            .WithMessage("*passwordHash*", because: "password hash is required to create a user");
    }
}
