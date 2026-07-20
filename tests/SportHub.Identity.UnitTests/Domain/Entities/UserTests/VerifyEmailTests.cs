using FluentAssertions;
using SportHub.Identity.Domain.Entities;
using SportHub.Identity.Domain.ValueObjects;

namespace SportHub.Identity.UnitTests.Domain.Entities.UserTests;

public class VerifyEmailTests
{
    [Fact]
    public void Should_SetEmailVerified_When_VerifyEmailCalled()
    {
        // Arrange --------------------------------------------------------
        var email = EmailAddress.From("maria@example.com");
        var passwordHash = PasswordHash.Create("Maria2026!Segura");
        var user = User.Create(email, passwordHash);

        // Act ------------------------------------------------------------
        user.VerifyEmail();

        // Assert ----------------------------------------------------------
        user.EmailVerified.Should().BeTrue();
    }

    [Fact]
    public void Should_RemainVerified_When_VerifyEmailCalledMultipleTimes()
    {
        // Arrange --------------------------------------------------------
        var user = User.Create(
            EmailAddress.From("maria@example.com"),
            PasswordHash.Create("Maria2026!Segura"));

        // Act ------------------------------------------------------------
        user.VerifyEmail();
        user.VerifyEmail();

        // Assert ----------------------------------------------------------
        user.EmailVerified.Should().BeTrue();
    }
}
