using MediatR;
using SportHub.Shared.Abstractions;

namespace SportHub.Identity.Application.HealthChecks;

/// <summary>
/// Query to retrieve the current health status of the system.
/// Writes a health check record to the database and returns the latest status.
/// </summary>
public record GetHealthStatusQuery : IRequest<Result<HealthStatusDto>>;
