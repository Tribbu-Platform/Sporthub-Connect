using SportHub.Identity.Domain.Common;
using SportHub.Identity.Domain.Events;
using SportHub.Identity.Domain.ValueObjects;
using SportHub.Shared.Abstractions;

namespace SportHub.Identity.Domain.Entities;

/// <summary>
/// Aggregate root for the UserProfile aggregate.
/// Represents a registered user in the platform with their authentication
/// and profile information.
/// </summary>
public sealed class User : Entity
{
    /// <summary>
    /// Gets the user's email address.
    /// </summary>
    public EmailAddress Email { get; private set; }

    /// <summary>
    /// Gets whether the email has been verified.
    /// </summary>
    public bool EmailVerified { get; private set; }

    /// <summary>
    /// Gets the authentication provider used for registration.
    /// </summary>
    public AuthProvider AuthProvider { get; private set; }

    /// <summary>
    /// Gets the BCrypt password hash. Null for OAuth-only users.
    /// </summary>
    public PasswordHash? PasswordHash { get; private set; }

    /// <summary>
    /// Gets the number of consecutive failed login attempts.
    /// </summary>
    public int FailedLoginAttempts { get; private set; }

    /// <summary>
    /// Gets the timestamp until which the account is locked.
    /// Null if not currently locked.
    /// </summary>
    public DateTime? LockedUntil { get; private set; }

    /// <summary>
    /// Gets whether the account is active.
    /// </summary>
    public bool IsActive { get; private set; }

    /// <summary>
    /// Gets the timestamp of the last successful login.
    /// Null if never logged in.
    /// </summary>
    public DateTime? LastLoginAt { get; private set; }

    // EF Core parameterless constructor
    private User() { }

    /// <summary>
    /// Creates a new user with email and password authentication.
    /// </summary>
    /// <param name="email">The user's email address.</param>
    /// <param name="passwordHash">The BCrypt password hash.</param>
    /// <returns>A new <see cref="User"/> instance.</returns>
    /// <exception cref="ArgumentNullException">Thrown when email or passwordHash is null.</exception>
    public static User Create(EmailAddress email, PasswordHash passwordHash)
    {
        ArgumentNullException.ThrowIfNull(email);
        ArgumentNullException.ThrowIfNull(passwordHash);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = passwordHash,
            EmailVerified = false,
            AuthProvider = AuthProvider.Email,
            IsActive = true,
            FailedLoginAttempts = 0,
            LockedUntil = null,
            LastLoginAt = null,
            CreatedAt = DateTime.UtcNow
        };

        user.AddDomainEvent(new UserRegisteredEvent(user.Id, user.Email.Value));

        return user;
    }

    /// <summary>
    /// Marks the user's email as verified.
    /// </summary>
    public void VerifyEmail()
    {
        EmailVerified = true;
    }
}
