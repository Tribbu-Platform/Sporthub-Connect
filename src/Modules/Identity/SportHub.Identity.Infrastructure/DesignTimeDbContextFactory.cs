using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace SportHub.Identity.Infrastructure;

/// <summary>
/// Design-time factory for <see cref="IdentityDbContext"/>.
/// Used by EF Core CLI tools (dotnet ef migrations) to create context instances.
/// </summary>
internal sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<IdentityDbContext>
{
    /// <inheritdoc/>
    public IdentityDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<IdentityDbContext>();
        optionsBuilder.UseSqlite("Data Source=sport-hub.db");

        return new IdentityDbContext(optionsBuilder.Options);
    }
}
