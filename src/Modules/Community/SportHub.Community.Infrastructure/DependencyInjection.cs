using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SportHub.Community.Domain;

namespace SportHub.Community.Infrastructure;

/// <summary>
/// Registers all Community Infrastructure layer services.
/// Auto-detects SQLite vs PostgreSQL based on connection string.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddCommunityInfrastructure(
        this IServiceCollection services,
        string connectionString)
    {
        services.AddDbContext<CommunityDbContext>(options =>
        {
            if (connectionString.Contains("Host=", StringComparison.OrdinalIgnoreCase) ||
                connectionString.Contains("Server=", StringComparison.OrdinalIgnoreCase) ||
                connectionString.Contains("Port=", StringComparison.OrdinalIgnoreCase))
            {
                options.UseNpgsql(connectionString, npgsqlOptions =>
                {
                    npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "community");
                });
            }
            else
            {
                options.UseSqlite(connectionString);
            }
        });

        services.AddScoped<ICommunityRepository, CommunityRepository>();

        return services;
    }
}
