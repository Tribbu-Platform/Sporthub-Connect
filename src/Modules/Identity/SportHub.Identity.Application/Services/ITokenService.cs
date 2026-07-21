using SportHub.Identity.Domain.Entities;

namespace SportHub.Identity.Application.Services;

/// <summary>
/// Service interface for JWT token generation and validation.
/// </summary>
public interface ITokenService
{
    /// <summary>Generates a JWT access token for the given user.</summary>
    /// <param name="user">The user to generate the token for.</param>
    /// <returns>A JWT access token string.</returns>
    string GenerateAccessToken(User user);

    /// <summary>Generates a cryptographically secure refresh token.</summary>
    /// <returns>A refresh token string.</returns>
    string GenerateRefreshToken();

    /// <summary>Validates and returns the user ID from a refresh token.</summary>
    /// <param name="token">The refresh token to validate.</param>
    /// <returns>The user ID if valid; otherwise null.</returns>
    Task<Guid?> ValidateRefreshTokenAsync(string token);
}
