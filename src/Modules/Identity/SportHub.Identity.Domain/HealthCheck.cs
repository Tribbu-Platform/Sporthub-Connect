namespace SportHub.Identity.Domain;

/// <summary>
/// Represents a health check record stored in the database.
/// Each request to /api/health/details creates a new record, allowing
/// verification of the full pipeline (API → DB → API).
/// </summary>
public sealed class HealthCheck : Shared.Abstractions.Entity
{
    /// <inheritdoc/>
    public string ServiceName { get; private set; } = string.Empty;
    /// <inheritdoc/>
    public string Status { get; private set; } = string.Empty;
    /// <inheritdoc/>
    public DateTime CheckedAt { get; private set; }

    // EF Core parameterless constructor
    private HealthCheck() { }

    /// <inheritdoc/>
    public static HealthCheck Create(string serviceName)
    {
        return new HealthCheck
        {
            Id = Guid.NewGuid(),
            ServiceName = serviceName,
            Status = "Healthy",
            CheckedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };
    }
}
