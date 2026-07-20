using Microsoft.EntityFrameworkCore;
using SportHub.Identity.Domain;
using SportHub.Identity.Domain.Common;
using SportHub.Identity.Domain.Entities;
using SportHub.Identity.Infrastructure.Persistence.Configurations;
using SportHub.Shared.Abstractions;

namespace SportHub.Identity.Infrastructure;

/// <summary>
/// EF Core database context for the Identity bounded context.
/// Manages persistence for identity-related aggregates and entities.
/// Also implements <see cref="IIdentityUnitOfWork"/> to coordinate
/// persistence and domain event dispatch.
/// </summary>
public class IdentityDbContext : DbContext, IIdentityUnitOfWork
{
    /// <summary>
    /// Gets the Users table set.
    /// </summary>
    public DbSet<User> Users => Set<User>();

    /// <summary>
    /// Gets the HealthChecks table set.
    /// </summary>
    public DbSet<HealthCheck> HealthChecks => Set<HealthCheck>();

    /// <inheritdoc/>
    public IdentityDbContext(DbContextOptions<IdentityDbContext> options) : base(options) { }

    /// <inheritdoc/>
    public async Task<bool> SaveEntitiesAsync(CancellationToken cancellationToken = default)
    {
        // Dispatch domain events before persisting
        var domainEntities = ChangeTracker
            .Entries<Entity>()
            .Where(e => e.Entity.DomainEvents.Count != 0)
            .ToList();

        var domainEvents = domainEntities
            .SelectMany(e => e.Entity.DomainEvents)
            .ToList();

        // Clear domain events before saving
        foreach (var entity in domainEntities)
        {
            entity.Entity.ClearDomainEvents();
        }

        // Save to database
        var result = await base.SaveChangesAsync(cancellationToken);

        // TODO: Publish domain events to outbox/message bus
        // This will be implemented when the outbox pattern is added

        return result > 0;
    }

    /// <inheritdoc/>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ArgumentNullException.ThrowIfNull(modelBuilder);

        modelBuilder.HasDefaultSchema("identity");
        modelBuilder.ApplyConfiguration(new UserConfiguration());

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
