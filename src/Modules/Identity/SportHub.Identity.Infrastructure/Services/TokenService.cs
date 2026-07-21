using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SportHub.Identity.Application.Services;
using SportHub.Identity.Domain.Entities;

namespace SportHub.Identity.Infrastructure.Services;

/// <summary>
/// Service for generating JWT access tokens and refresh tokens.
/// Uses HMAC-SHA256 symmetric signing for token integrity.
/// </summary>
internal sealed class TokenService : ITokenService
{
    private readonly JwtSettings _settings;

    /// <summary>
    /// Initializes a new instance of the <see cref="TokenService"/> class.
    /// </summary>
    /// <param name="settings">JWT configuration options.</param>
    public TokenService(IOptions<JwtSettings> settings)
    {
        _settings = settings?.Value ?? throw new ArgumentNullException(nameof(settings));
    }

    /// <inheritdoc/>
    public string GenerateAccessToken(User user)
    {
        ArgumentNullException.ThrowIfNull(user);

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SecretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email.Value),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new("email_verified", user.EmailVerified.ToString().ToLowerInvariant()),
            new("auth_provider", user.AuthProvider.ToString().ToLowerInvariant()),
            new("name", user.Email.Value.Split('@')[0])
        };

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_settings.AccessTokenExpirationMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <inheritdoc/>
    public string GenerateRefreshToken()
    {
        var randomBytes = new byte[32]; // 256 bits
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    /// <inheritdoc/>
    public Task<Guid?> ValidateRefreshTokenAsync(string token)
    {
        // Refresh token validation is handled by checking against the stored hash in the database.
        // This method will be implemented with full validation logic when the refresh token
        // endpoint is built (US-003).
        throw new NotImplementedException("Refresh token validation requires database lookup. Implement in US-003.");
    }
}
