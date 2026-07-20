namespace SportHub.Identity.Domain.Common;

/// <summary>
/// Authentication provider for user accounts.
/// Indicates how the user registered and authenticates.
/// </summary>
public enum AuthProvider
{
    /// <summary>Email and password authentication (local account).</summary>
    Email,
    /// <summary>Google OAuth2 authentication.</summary>
    Google,
    /// <summary>Microsoft OAuth2 authentication.</summary>
    Microsoft,
    /// <summary>Facebook OAuth2 authentication.</summary>
    Facebook,
    /// <summary>Instagram OAuth2 authentication.</summary>
    Instagram
}
