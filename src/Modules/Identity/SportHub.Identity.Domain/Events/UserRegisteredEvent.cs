using SportHub.Shared.Abstractions;

namespace SportHub.Identity.Domain.Events;

/// <summary>
/// Domain event raised when a new user registers in the system.
/// Published to the outbox and consumed by other bounded contexts
/// (e.g., Gamification for welcome badge, Notifications for verification email).
/// </summary>
public sealed class UserRegisteredEvent : IDomainEvent
{
    /// <summary>
    /// Gets the ID of the registered user.
    /// </summary>
    public Guid UserId { get; }

    /// <summary>
    /// Gets the email address of the registered user.
    /// </summary>
    public string Email { get; }

    /// <summary>
    /// Gets the UTC timestamp when the registration occurred.
    /// </summary>
    public DateTime RegisteredAt { get; }

    /// <inheritdoc />
    public Guid EventId { get; }

    /// <inheritdoc />
    public DateTime OccurredOn { get; }

    /// <summary>
    /// Initializes a new instance of the <see cref="UserRegisteredEvent"/> class.
    /// </summary>
    public UserRegisteredEvent(Guid userId, string email)
    {
        UserId = userId;
        Email = email;
        RegisteredAt = DateTime.UtcNow;
        EventId = Guid.NewGuid();
        OccurredOn = DateTime.UtcNow;
    }
}
