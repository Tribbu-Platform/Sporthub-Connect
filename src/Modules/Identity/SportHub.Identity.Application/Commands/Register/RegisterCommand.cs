using SportHub.Identity.Application.DTOs;
using SportHub.Shared.Abstractions;

namespace SportHub.Identity.Application.Commands.Register;

/// <summary>
/// Command to register a new user with email and password.
/// </summary>
public sealed class RegisterCommand : ICommand<RegisterResponse>
{
    /// <summary>Email address for the new account.</summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>Password for the new account.</summary>
    public string Password { get; set; } = string.Empty;

    /// <summary>Acceptance of terms and conditions.</summary>
    public bool AcceptTerms { get; set; }
}
