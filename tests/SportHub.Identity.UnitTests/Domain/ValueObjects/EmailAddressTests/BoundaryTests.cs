using FluentAssertions;
using SportHub.Identity.Domain.ValueObjects;

namespace SportHub.Identity.UnitTests.Domain.ValueObjects.EmailAddressTests;

public class BoundaryTests
{
    [Fact]
    public void Should_CreateEmail_When_EmailWithSubdomain()
    {
        // Arrange --------------------------------------------------------
        const string emailWithSubdomain = "user@sub.domain.com";

        // Act ------------------------------------------------------------
        var email = EmailAddress.From(emailWithSubdomain);

        // Assert ----------------------------------------------------------
        email.Value.Should().Be(emailWithSubdomain.ToLowerInvariant());
    }

    [Fact]
    public void Should_CreateEmail_When_EmailWithPlusAddressing()
    {
        // Arrange --------------------------------------------------------
        const string emailWithPlus = "maria+test@example.com";

        // Act ------------------------------------------------------------
        var email = EmailAddress.From(emailWithPlus);

        // Assert ----------------------------------------------------------
        email.Value.Should().Be(emailWithPlus.ToLowerInvariant());
    }

    [Fact]
    public void Should_CreateEmail_When_EmailWithDots()
    {
        // Arrange --------------------------------------------------------
        const string emailWithDots = "maria.ana.gomez@example.com";

        // Act ------------------------------------------------------------
        var email = EmailAddress.From(emailWithDots);

        // Assert ----------------------------------------------------------
        email.Value.Should().Be(emailWithDots.ToLowerInvariant());
    }

    [Fact]
    public void Should_ThrowArgumentException_When_EmailHasMultipleAtSymbols()
    {
        // Arrange --------------------------------------------------------
        const string invalidEmail = "user@domain@example.com";

        // Act ------------------------------------------------------------
        var act = () => EmailAddress.From(invalidEmail);

        // Assert ----------------------------------------------------------
        act.Should().Throw<ArgumentException>()
            .WithMessage("*formato*email*");
    }

    [Fact]
    public void Should_ThrowArgumentException_When_EmailStartsWithAt()
    {
        // Arrange --------------------------------------------------------
        const string invalidEmail = "@example.com";

        // Act ------------------------------------------------------------
        var act = () => EmailAddress.From(invalidEmail);

        // Assert ----------------------------------------------------------
        act.Should().Throw<ArgumentException>()
            .WithMessage("*formato*email*");
    }

    [Fact]
    public void Should_ThrowArgumentException_When_EmailEndsWithAt()
    {
        // Arrange --------------------------------------------------------
        const string invalidEmail = "user@";

        // Act ------------------------------------------------------------
        var act = () => EmailAddress.From(invalidEmail);

        // Assert ----------------------------------------------------------
        act.Should().Throw<ArgumentException>()
            .WithMessage("*formato*email*");
    }

    [Fact]
    public void Should_TrimEmail_When_EmailHasWhitespace()
    {
        // Arrange --------------------------------------------------------
        const string emailWithSpaces = "  maria@example.com  ";

        // Act ------------------------------------------------------------
        var email = EmailAddress.From(emailWithSpaces);

        // Assert ----------------------------------------------------------
        email.Value.Should().Be("maria@example.com");
    }
}
