namespace SportHub.Identity.Application.Services;

/// <summary>
/// Service interface for Auth0 identity provider integration.
/// Handles user management and authentication with Auth0.
/// </summary>
public interface IAuth0Service
{
    /// <summary>Creates a user in Auth0 with email and password.</summary>
    Task<string> CreateUserAsync(string email, string passwordHash, CancellationToken cancellationToken = default);

    /// <summary>Authenticates a user with email and password, returning tokens.</summary>
    Task<Auth0TokenResult?> GetTokenAsync(string email, string password, CancellationToken cancellationToken = default);

    /// <summary>Refreshes an access token using a refresh token.</summary>
    Task<Auth0TokenResult?> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);

    /// <summary>Revokes a refresh token.</summary>
    Task RevokeTokenAsync(string refreshToken, CancellationToken cancellationToken = default);

    /// <summary>Links an OAuth provider account to an existing user.</summary>
    Task LinkAccountAsync(string userId, string provider, string code, CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of an Auth0 token operation.
/// </summary>
public sealed class Auth0TokenResult
{
    /// <summary>JWT access token.</summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>Refresh token.</summary>
    public string RefreshToken { get; set; } = string.Empty;

    /// <summary>Token type (usually "Bearer").</summary>
    public string TokenType { get; set; } = "Bearer";

    /// <summary>TTL of the access token in seconds.</summary>
    public int ExpiresIn { get; set; }
}
