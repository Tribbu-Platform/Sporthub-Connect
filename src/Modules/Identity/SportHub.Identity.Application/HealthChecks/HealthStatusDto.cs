namespace SportHub.Identity.Application.HealthChecks;

/// <summary>
/// Detailed health status of the SportHub Connect system.
/// </summary>
public record HealthStatusDto(
    string ServiceName,
    string Status,
    DateTime CheckedAt,
    string DatabaseStatus,
    string Uptime,
    DateTime ServerTime);
