namespace SportHub.Identity.Infrastructure.Services;

/// <summary>
/// Configuration options for JWT token generation.
/// Maps to the "Jwt" section in appsettings.json.
/// </summary>
public sealed class JwtSettings
{
    /// <summary>Secret key used for signing JWTs (minimum 32 characters).</summary>
    public string SecretKey { get; set; } = string.Empty;

    /// <summary>Token issuer (usually the API URL or application name).</summary>
    public string Issuer { get; set; } = string.Empty;

    /// <summary>Token audience (usually the API name).</summary>
    public string Audience { get; set; } = string.Empty;

    /// <summary>Access token expiration time in minutes.</summary>
    public int AccessTokenExpirationMinutes { get; set; } = 60;

    /// <summary>Refresh token expiration time in days.</summary>
    public int RefreshTokenExpirationDays { get; set; } = 7;
}
