using FluentAssertions;
using Microsoft.Extensions.Options;
using SportHub.Identity.Infrastructure.Services;

namespace SportHub.Identity.UnitTests.Infrastructure.Services.TokenServiceTests;

public class GenerateRefreshTokenTests
{
    private readonly TokenService _sut;

    public GenerateRefreshTokenTests()
    {
        var settings = new JwtSettings
        {
            SecretKey = "ThisIsASuperSecretKeyForTestingPurposesOnly!@#$%",
            Issuer = "SportHub",
            Audience = "SportHub-API",
            AccessTokenExpirationMinutes = 60,
            RefreshTokenExpirationDays = 7
        };

        _sut = new TokenService(Options.Create(settings));
    }

    [Fact]
    public void Should_GenerateSecureToken_When_Called()
    {
        // Act ------------------------------------------------------------
        var token = _sut.GenerateRefreshToken();

        // Assert ----------------------------------------------------------
        token.Should().NotBeNullOrEmpty();
        token.Length.Should().BeGreaterThan(32);
    }

    [Fact]
    public void Should_GenerateUniqueTokens_When_CalledMultipleTimes()
    {
        // Act ------------------------------------------------------------
        var token1 = _sut.GenerateRefreshToken();
        var token2 = _sut.GenerateRefreshToken();

        // Assert ----------------------------------------------------------
        token1.Should().NotBe(token2);
    }

    [Fact]
    public void Should_ReturnBase64EncodedToken_When_Called()
    {
        // Act ------------------------------------------------------------
        var token = _sut.GenerateRefreshToken();

        // Assert ----------------------------------------------------------
        var bytes = Convert.FromBase64String(token);
        bytes.Length.Should().Be(32); // 256 bits
    }
}
