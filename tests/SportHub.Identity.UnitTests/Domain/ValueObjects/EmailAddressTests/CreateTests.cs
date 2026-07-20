using FluentAssertions;
using SportHub.Identity.Domain.ValueObjects;

namespace SportHub.Identity.UnitTests.Domain.ValueObjects.EmailAddressTests;

public class CreateTests
{
    [Fact]
    public void Should_CreateEmailAddress_When_ValidEmailProvided()
    {
        // Arrange --------------------------------------------------------
        const string validEmail = "maria@example.com";

        // Act ------------------------------------------------------------
        var email = EmailAddress.From(validEmail);

        // Assert ----------------------------------------------------------
        email.Should().NotBeNull();
        email.Value.Should().Be(validEmail.ToLowerInvariant());
    }

    [Fact]
    public void Should_ThrowArgumentException_When_EmailIsEmpty()
    {
        // Arrange --------------------------------------------------------
        var emptyEmail = string.Empty;

        // Act ------------------------------------------------------------
        var act = () => EmailAddress.From(emptyEmail);

        // Assert ----------------------------------------------------------
        act.Should().Throw<ArgumentException>()
            .WithMessage("*email*", because: "empty email should be rejected");
    }

    [Fact]
    public void Should_ThrowArgumentException_When_EmailIsNull()
    {
        // Arrange --------------------------------------------------------
        string? nullEmail = null;

        // Act ------------------------------------------------------------
        var act = () => EmailAddress.From(nullEmail!);

        // Assert ----------------------------------------------------------
        act.Should().Throw<ArgumentException>()
            .WithMessage("*email*", because: "null email should be rejected");
    }

    [Fact]
    public void Should_ThrowArgumentException_When_EmailHasInvalidFormat()
    {
        // Arrange --------------------------------------------------------
        const string invalidEmail = "email-invalido";

        // Act ------------------------------------------------------------
        var act = () => EmailAddress.From(invalidEmail);

        // Assert ----------------------------------------------------------
        act.Should().Throw<ArgumentException>()
            .WithMessage("*formato*email*", because: "invalid email format should be rejected");
    }

    [Fact]
    public void Should_NormalizeEmailToLowercase_When_EmailHasUpperCase()
    {
        // Arrange --------------------------------------------------------
        const string mixedCaseEmail = "Maria@Example.COM";

        // Act ------------------------------------------------------------
        var email = EmailAddress.From(mixedCaseEmail);

        // Assert ----------------------------------------------------------
        email.Value.Should().Be("maria@example.com");
    }

    [Fact]
    public void Should_BeEqual_When_SameEmail()
    {
        // Arrange --------------------------------------------------------
        var email1 = EmailAddress.From("maria@example.com");
        var email2 = EmailAddress.From("maria@example.com");

        // Act & Assert ----------------------------------------------------
        email1.Should().Be(email2);
        (email1 == email2).Should().BeTrue();
        email1.GetHashCode().Should().Be(email2.GetHashCode());
    }

    [Fact]
    public void Should_NotBeEqual_When_DifferentEmail()
    {
        // Arrange --------------------------------------------------------
        var email1 = EmailAddress.From("maria@example.com");
        var email2 = EmailAddress.From("juan@example.com");

        // Act & Assert ----------------------------------------------------
        email1.Should().NotBe(email2);
        (email1 != email2).Should().BeTrue();
    }

    [Fact]
    public void Should_ReturnStringValue_When_ToStringCalled()
    {
        // Arrange --------------------------------------------------------
        const string emailString = "test@example.com";
        var email = EmailAddress.From(emailString);

        // Act ------------------------------------------------------------
        var toStringResult = email.ToString();

        // Assert ----------------------------------------------------------
        toStringResult.Should().Be(emailString.ToLowerInvariant());
    }
}
