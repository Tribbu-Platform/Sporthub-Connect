using FluentAssertions;
using SportHub.Identity.Domain.ValueObjects;

namespace SportHub.Identity.UnitTests.Domain.ValueObjects.PasswordHashTests;

public class CreateAndVerifyTests
{
    [Fact]
    public void Should_CreatePasswordHash_When_ValidPasswordProvided()
    {
        // Arrange --------------------------------------------------------
        const string password = "Maria2026!Segura";

        // Act ------------------------------------------------------------
        var passwordHash = PasswordHash.Create(password);

        // Assert ----------------------------------------------------------
        passwordHash.Should().NotBeNull();
        passwordHash.Value.Should().NotBeNullOrWhiteSpace();
        passwordHash.Value.Should().NotBe(password, "password should not be stored in plain text");
    }

    [Fact]
    public void Should_ReturnTrue_When_PasswordMatchesHash()
    {
        // Arrange --------------------------------------------------------
        const string password = "Maria2026!Segura";
        var passwordHash = PasswordHash.Create(password);

        // Act ------------------------------------------------------------
        var matches = passwordHash.Verify(password);

        // Assert ----------------------------------------------------------
        matches.Should().BeTrue();
    }

    [Fact]
    public void Should_ReturnFalse_When_PasswordDoesNotMatchHash()
    {
        // Arrange --------------------------------------------------------
        var passwordHash = PasswordHash.Create("Maria2026!Segura");

        // Act ------------------------------------------------------------
        var matches = passwordHash.Verify("DifferentPassword123!");

        // Assert ----------------------------------------------------------
        matches.Should().BeFalse();
    }

    [Fact]
    public void Should_ThrowArgumentException_When_PasswordIsEmpty()
    {
        // Arrange --------------------------------------------------------
        var emptyPassword = string.Empty;

        // Act ------------------------------------------------------------
        var act = () => PasswordHash.Create(emptyPassword);

        // Assert ----------------------------------------------------------
        act.Should().Throw<ArgumentException>()
            .WithMessage("*contraseña*", because: "empty password should be rejected");
    }

    [Fact]
    public void Should_ThrowArgumentException_When_PasswordIsNull()
    {
        // Arrange --------------------------------------------------------
        string? nullPassword = null;

        // Act ------------------------------------------------------------
        var act = () => PasswordHash.Create(nullPassword!);

        // Assert ----------------------------------------------------------
        act.Should().Throw<ArgumentException>()
            .WithMessage("*contraseña*", because: "null password should be rejected");
    }

    [Fact]
    public void Should_ThrowArgumentException_When_PasswordIsTooShort()
    {
        // Arrange --------------------------------------------------------
        const string shortPassword = "Ab1!";

        // Act ------------------------------------------------------------
        var act = () => PasswordHash.Create(shortPassword);

        // Assert ----------------------------------------------------------
        act.Should().Throw<ArgumentException>()
            .WithMessage("*8 caracteres*", because: "password must be at least 8 characters");
    }

    [Fact]
    public void Should_GenerateDifferentHashes_ForSamePassword_WhenCalledMultipleTimes()
    {
        // Arrange --------------------------------------------------------
        const string password = "Maria2026!Segura";

        // Act ------------------------------------------------------------
        var hash1 = PasswordHash.Create(password);
        var hash2 = PasswordHash.Create(password);

        // Assert ----------------------------------------------------------
        // BCrypt generates different salts each time, so hashes differ
        hash1.Value.Should().NotBe(hash2.Value);
        // But both should verify against the original password
        hash1.Verify(password).Should().BeTrue();
        hash2.Verify(password).Should().BeTrue();
    }

    [Fact]
    public void Should_BeEqual_When_SameHashValue()
    {
        // Arrange --------------------------------------------------------
        var hash1 = PasswordHash.FromHash("$2a$11$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12345");
        var hash2 = PasswordHash.FromHash("$2a$11$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12345");

        // Act & Assert ----------------------------------------------------
        hash1.Should().Be(hash2);
        (hash1 == hash2).Should().BeTrue();
        hash1.GetHashCode().Should().Be(hash2.GetHashCode());
    }

    [Fact]
    public void Should_NotBeEqual_When_DifferentHashValue()
    {
        // Arrange --------------------------------------------------------
        var hash1 = PasswordHash.FromHash("$2a$11$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12345");
        var hash2 = PasswordHash.FromHash("$2a$11$zyxwvutsrqponmlkjihgfedcbaABCDEFGHIJKLMNOPQRSTUVWXYZ12345");

        // Act & Assert ----------------------------------------------------
        hash1.Should().NotBe(hash2);
        (hash1 != hash2).Should().BeTrue();
    }
}
