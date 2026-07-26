namespace SportHub.Identity.Infrastructure.Services;

/// <summary>
/// Configuration options for Auth0 integration.
/// Maps to the "Auth0" section in appsettings.json.
/// </summary>
public sealed class Auth0Options
{
    /// <summary>Auth0 tenant domain (e.g., "dev-xxx.us.auth0.com").</summary>
    public string Domain { get; set; } = string.Empty;

    /// <summary>Auth0 Management API client ID.</summary>
    public string ClientId { get; set; } = string.Empty;

    /// <summary>Auth0 Management API client secret.</summary>
    public string ClientSecret { get; set; } = string.Empty;

    /// <summary>Auth0 Management API audience (e.g., "https://dev-xxx.us.auth0.com/api/v2/").</summary>
    public string Audience { get; set; } = string.Empty;

    /// <summary>Auth0 database connection name (usually "Username-Password-Authentication").</summary>
    public string Connection { get; set; } = "Username-Password-Authentication";
}
