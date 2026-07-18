namespace SportHub.Community.Domain;

/// <summary>
/// Repository contract for Community persistence.
/// Defined in the Domain layer, implemented in Infrastructure.
/// </summary>
public interface ICommunityRepository
{
    /// <summary>
    /// Gets the default community. If none exists, creates one with default values.
    /// </summary>
    Task<CommunityAggregate> GetDefaultAsync(CancellationToken ct = default);
}
