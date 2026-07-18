using Microsoft.EntityFrameworkCore;
using SportHub.Identity.Domain;

namespace SportHub.Identity.Infrastructure;

/// <summary>
/// EF Core implementation of the HealthCheck repository.
/// Provides persistence for HealthCheck entities using SQLite.
/// </summary>
internal sealed class HealthCheckRepository : IHealthCheckRepository
{
    private readonly IdentityDbContext _context;

    public HealthCheckRepository(IdentityDbContext context)
    {
        _context = context;
    }

    public async Task<HealthCheck?> GetLatestAsync(CancellationToken ct = default)
    {
        return await _context.HealthChecks
            .OrderByDescending(h => h.CheckedAt)
            .FirstOrDefaultAsync(ct);
    }

    public async Task AddAsync(HealthCheck healthCheck, CancellationToken ct = default)
    {
        await _context.HealthChecks.AddAsync(healthCheck, ct);
        await _context.SaveChangesAsync(ct);
    }
}
