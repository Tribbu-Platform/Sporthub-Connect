using System.IdentityModel.Tokens.Jwt;
using FluentAssertions;
using Microsoft.Extensions.Options;
using SportHub.Identity.Domain.Entities;
using SportHub.Identity.Domain.ValueObjects;
using SportHub.Identity.Infrastructure.Services;

namespace SportHub.Identity.UnitTests.Infrastructure.Services.TokenServiceTests;

public class GenerateAccessTokenTests
{
    private readonly JwtSettings _settings;
    private readonly TokenService _sut;

    public GenerateAccessTokenTests()
    {
        _settings = new JwtSettings
        {
            SecretKey = "ThisIsASuperSecretKeyForTestingPurposesOnly!@#$%",
            Issuer = "SportHub",
            Audience = "SportHub-API",
            AccessTokenExpirationMinutes = 60,
            RefreshTokenExpirationDays = 7
        };

        _sut = new TokenService(Options.Create(_settings));
    }

    [Fact]
    public void Should_GenerateValidToken_When_UserProvided()
    {
        // Arrange --------------------------------------------------------
        var user = User.Create(
            EmailAddress.From("testuser@example.com"),
            PasswordHash.Create("TestPass2026!Secure"));

        // Act ------------------------------------------------------------
        var token = _sut.GenerateAccessToken(user);

        // Assert ----------------------------------------------------------
        token.Should().NotBeNullOrEmpty();

        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        jwtToken.Should().NotBeNull();
        jwtToken.Subject.Should().Be(user.Id.ToString());
        jwtToken.Issuer.Should().Be("SportHub");
        jwtToken.Audiences.Should().Contain("SportHub-API");
        jwtToken.Claims.Should().Contain(c => c.Type == "email" && c.Value == "testuser@example.com");
        jwtToken.Claims.Should().Contain(c => c.Type == "email_verified" && c.Value == "false");
    }

    [Fact]
    public void Should_IncludeClaims_When_TokenGenerated()
    {
        // Arrange --------------------------------------------------------
        var user = User.Create(
            EmailAddress.From("claims@example.com"),
            PasswordHash.Create("ClaimsTest2026!"));

        // Act ------------------------------------------------------------
        var token = _sut.GenerateAccessToken(user);

        // Assert ----------------------------------------------------------
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        jwtToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Sub);
        jwtToken.Claims.Should().Contain(c => c.Type == JwtRegisteredClaimNames.Email);
        jwtToken.Claims.Should().Contain(c => c.Type == "email_verified");
        jwtToken.Claims.Should().Contain(c => c.Type == "auth_provider");
    }

    [Fact]
    public void Should_HaveExpiration_When_TokenGenerated()
    {
        // Arrange --------------------------------------------------------
        var user = User.Create(
            EmailAddress.From("expiry@example.com"),
            PasswordHash.Create("ExpiryTest2026!"));

        // Act ------------------------------------------------------------
        var token = _sut.GenerateAccessToken(user);

        // Assert ----------------------------------------------------------
        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        jwtToken.ValidTo.Should().BeAfter(DateTime.UtcNow);
        jwtToken.ValidTo.Should().BeBefore(DateTime.UtcNow.AddHours(2));
    }
}
