using Microsoft.EntityFrameworkCore;
using SportHub.Identity.Domain;

namespace SportHub.Identity.Infrastructure;

/// <summary>
/// EF Core database context for the Identity bounded context.
/// Manages persistence for identity-related aggregates and entities.
/// </summary>
public class IdentityDbContext : DbContext
{
    /// <inheritdoc/>
    public DbSet<HealthCheck> HealthChecks => Set<HealthCheck>();

    /// <inheritdoc/>
    public IdentityDbContext(DbContextOptions<IdentityDbContext> options) : base(options) { }

    /// <inheritdoc/>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("identity");
        modelBuilder.Entity<HealthCheck>(entity =>
        {
            entity.ToTable("health_checks");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ServiceName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Status).HasMaxLength(50).IsRequired();
            entity.Property(e => e.CheckedAt).IsRequired();
        });
    }
}
