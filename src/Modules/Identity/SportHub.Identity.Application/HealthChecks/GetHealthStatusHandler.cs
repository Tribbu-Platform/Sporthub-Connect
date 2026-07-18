using MediatR;
using SportHub.Identity.Domain;
using SportHub.Shared.Abstractions;

namespace SportHub.Identity.Application.HealthChecks;

/// <summary>
/// Handles the GetHealthStatusQuery by creating a new health check record
/// and returning the current system health status.
/// </summary>
public sealed class GetHealthStatusHandler : IRequestHandler<GetHealthStatusQuery, Result<HealthStatusDto>>
{
    private readonly IHealthCheckRepository _repository;

    /// <inheritdoc/>
    public GetHealthStatusHandler(IHealthCheckRepository repository)
    {
        _repository = repository;
    }

    /// <inheritdoc/>
    public async Task<Result<HealthStatusDto>> Handle(GetHealthStatusQuery request, CancellationToken ct)
    {
        var healthCheck = HealthCheck.Create("SportHub Connect");
        await _repository.AddAsync(healthCheck, ct);

        var latest = await _repository.GetLatestAsync(ct);

        return Result<HealthStatusDto>.Ok(new HealthStatusDto(
            latest!.ServiceName,
            latest.Status,
            latest.CheckedAt,
            "Connected",
            $"{Environment.TickCount64 / 1000}s",
            DateTime.UtcNow
        ));
    }
}
