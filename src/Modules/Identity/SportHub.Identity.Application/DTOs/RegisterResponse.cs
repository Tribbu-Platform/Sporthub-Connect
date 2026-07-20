namespace SportHub.Identity.Application.DTOs;

/// <summary>
/// Response DTO for the user registration endpoint.
/// Contains the created user details and authentication tokens.
/// </summary>
public sealed class RegisterResponse
{
    /// <summary>ID of the created user.</summary>
    public Guid UserId { get; set; }

    /// <summary>Email address of the created user.</summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>JWT access token for immediate authentication.</summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>Refresh token for token renewal.</summary>
    public string RefreshToken { get; set; } = string.Empty;

    /// <summary>TTL of the access token in seconds.</summary>
    public int ExpiresIn { get; set; }

    /// <summary>Whether the email has been verified.</summary>
    public bool EmailVerified { get; set; }

    /// <summary>Whether the user accepted the terms and conditions.</summary>
    public bool AcceptedTerms { get; set; }

    /// <summary>Success message for the user.</summary>
    public string Message { get; set; } = string.Empty;
}
