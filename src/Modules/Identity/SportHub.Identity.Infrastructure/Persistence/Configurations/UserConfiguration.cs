using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SportHub.Identity.Domain.Common;
using SportHub.Identity.Domain.Entities;
using SportHub.Identity.Domain.ValueObjects;

namespace SportHub.Identity.Infrastructure.Persistence.Configurations;

/// <summary>
/// EF Core Fluent API configuration for the <see cref="User"/> entity.
/// Maps to the "users" table in the "identity" schema.
/// </summary>
public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    /// <inheritdoc/>
    public void Configure(EntityTypeBuilder<User> builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        builder.ToTable("users");

        // Primary key
        builder.HasKey(u => u.Id);

        // EmailAddress — stored as string column with value converter
        builder.Property(u => u.Email)
            .HasConversion(
                email => email.Value,
                value => EmailAddress.From(value))
            .HasMaxLength(256)
            .IsRequired();

        builder.HasIndex(u => u.Email)
            .IsUnique()
            .HasDatabaseName("ix_users_email");

        // PasswordHash — stored as nullable string column with value converter
        builder.Property(u => u.PasswordHash)
            .HasConversion(
                hash => hash!.Value,
                value => PasswordHash.FromHash(value))
            .HasMaxLength(256)
            .IsRequired(false);

        // AuthProvider — stored as string
        builder.Property(u => u.AuthProvider)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        // Primitive properties
        builder.Property(u => u.EmailVerified)
            .IsRequired();

        builder.Property(u => u.FailedLoginAttempts)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(u => u.LockedUntil)
            .IsRequired(false);

        builder.Property(u => u.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(u => u.LastLoginAt)
            .IsRequired(false);

        // Shadow properties for audit fields (from Entity base class)
        builder.Property(u => u.CreatedAt)
            .IsRequired();

        builder.Property(u => u.UpdatedAt)
            .IsRequired(false);

        // Ignore domain events (not persisted)
        builder.Ignore(u => u.DomainEvents);
    }
}
