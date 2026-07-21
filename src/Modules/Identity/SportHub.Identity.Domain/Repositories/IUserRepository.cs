using SportHub.Identity.Domain.Entities;
using SportHub.Identity.Domain.ValueObjects;

namespace SportHub.Identity.Domain.Repositories;

/// <summary>
/// Repository interface for the User aggregate root.
/// Defines persistence operations for users in the Identity bounded context.
/// </summary>
public interface IUserRepository
{
    /// <summary>
    /// Gets a user by their unique identifier.
    /// </summary>
    /// <param name="id">The user's unique identifier.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The user if found; otherwise null.</returns>
    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a user by their email address.
    /// </summary>
    /// <param name="email">The email address.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The user if found; otherwise null.</returns>
    Task<User?> GetByEmailAsync(EmailAddress email, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new user to the repository.
    /// </summary>
    /// <param name="user">The user to add.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task AddAsync(User user, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing user in the repository.
    /// </summary>
    /// <param name="user">The user to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task UpdateAsync(User user, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a user exists with the given email address.
    /// </summary>
    /// <param name="email">The email address to check.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if a user with the given email exists; otherwise false.</returns>
    Task<bool> ExistsByEmailAsync(EmailAddress email, CancellationToken cancellationToken = default);
}
