using Microsoft.EntityFrameworkCore;
using SportHub.Community.Domain;

namespace SportHub.Community.Infrastructure;

/// <summary>
/// EF Core database context for the Community bounded context.
/// Manages persistence for community aggregates and entities.
/// </summary>
public class CommunityDbContext : DbContext
{
    /// <inheritdoc/>
    public DbSet<CommunityAggregate> Communities => Set<CommunityAggregate>();

    /// <inheritdoc/>
    public CommunityDbContext(DbContextOptions<CommunityDbContext> options) : base(options) { }

    /// <inheritdoc/>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("community");
        modelBuilder.Entity<CommunityAggregate>(entity =>
        {
            entity.ToTable("communities");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(2000).IsRequired();
            entity.Property(e => e.MemberCount).HasColumnName("member_count").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        });
    }
}
