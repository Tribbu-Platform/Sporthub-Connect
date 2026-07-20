using FluentAssertions;
using SportHub.Identity.Domain.ValueObjects;

namespace SportHub.Identity.UnitTests.Domain.ValueObjects.PasswordHashTests;

public class EdgeCaseTests
{
    [Theory]
    [InlineData("ABCD1234!")]
    [InlineData("abcdefgh!")]
    [InlineData("ABCDefgh!")]
    [InlineData("ABCDefg1!")]
    public void Should_AcceptPassword_When_MeetsAllRequirements(string password)
    {
        // Arrange & Act --------------------------------------------------
        var passwordHash = PasswordHash.Create(password);

        // Assert ----------------------------------------------------------
        passwordHash.Should().NotBeNull();
        passwordHash.Value.Should().NotBeNullOrWhiteSpace();
        passwordHash.Value.Should().NotBe(password);
    }

    [Theory]
    [InlineData("Short1!A")] // 8 chars exactly (minimum)
    [InlineData("ExactLength8!")] // 13 chars
    public void Should_AcceptPassword_When_AtMinimumLength(string password)
    {
        // Arrange & Act --------------------------------------------------
        var act = () => PasswordHash.Create(password);

        // Assert ----------------------------------------------------------
        act.Should().NotThrow<ArgumentException>();
    }

    [Fact]
    public void Should_ReturnFalse_When_VerifyCalledWithNull()
    {
        // Arrange --------------------------------------------------------
        var passwordHash = PasswordHash.Create("Maria2026!Segura");

        // Act ------------------------------------------------------------
        var result = passwordHash.Verify(null!);

        // Assert ----------------------------------------------------------
        result.Should().BeFalse();
    }

    [Fact]
    public void Should_ReturnFalse_When_VerifyCalledWithEmptyString()
    {
        // Arrange --------------------------------------------------------
        var passwordHash = PasswordHash.Create("Maria2026!Segura");

        // Act ------------------------------------------------------------
        var result = passwordHash.Verify(string.Empty);

        // Assert ----------------------------------------------------------
        result.Should().BeFalse();
    }

    [Fact]
    public void Should_ReturnFalse_When_VerifyCalledWithWhitespace()
    {
        // Arrange --------------------------------------------------------
        var passwordHash = PasswordHash.Create("Maria2026!Segura");

        // Act ------------------------------------------------------------
        var result = passwordHash.Verify("   ");

        // Assert ----------------------------------------------------------
        result.Should().BeFalse();
    }

    [Fact]
    public void Should_FromHash_When_ValidBcryptHash()
    {
        // Arrange --------------------------------------------------------
        const string validHash = "$2a$11$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12345";

        // Act ------------------------------------------------------------
        var passwordHash = PasswordHash.FromHash(validHash);

        // Assert ----------------------------------------------------------
        passwordHash.Should().NotBeNull();
        passwordHash.Value.Should().Be(validHash);
    }

    [Fact]
    public void Should_ThrowArgumentException_When_FromHashWithNull()
    {
        // Arrange --------------------------------------------------------
        string? nullHash = null;

        // Act ------------------------------------------------------------
        var act = () => PasswordHash.FromHash(nullHash!);

        // Assert ----------------------------------------------------------
        act.Should().Throw<ArgumentException>()
            .WithMessage("*hash*contraseña*");
    }

    [Fact]
    public void Should_ThrowArgumentException_When_FromHashWithEmptyString()
    {
        // Arrange --------------------------------------------------------
        var act = () => PasswordHash.FromHash(string.Empty);

        // Assert ----------------------------------------------------------
        act.Should().Throw<ArgumentException>()
            .WithMessage("*hash*contraseña*");
    }
}
