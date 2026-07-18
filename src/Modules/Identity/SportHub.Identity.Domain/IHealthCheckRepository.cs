namespace SportHub.Identity.Domain;

/// <summary>
/// Repository contract for HealthCheck persistence.
/// Defined in the Domain layer, implemented in Infrastructure.
/// </summary>
public interface IHealthCheckRepository
{
    Task<HealthCheck?> GetLatestAsync(CancellationToken ct = default);
    Task AddAsync(HealthCheck healthCheck, CancellationToken ct = default);
}
