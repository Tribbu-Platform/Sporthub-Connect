namespace SportHub.Identity.Domain;

/// <summary>
/// Repository contract for HealthCheck persistence.
/// Defined in the Domain layer, implemented in Infrastructure.
/// </summary>
public interface IHealthCheckRepository
{
    /// <inheritdoc/>
    Task<HealthCheck?> GetLatestAsync(CancellationToken ct = default);
    /// <inheritdoc/>
    Task AddAsync(HealthCheck healthCheck, CancellationToken ct = default);
}
