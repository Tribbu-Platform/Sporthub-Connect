using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using SportHub.Identity.Domain;

namespace SportHub.Identity.Infrastructure;

/// <summary>
/// Registers all Identity Infrastructure layer services.
/// Auto-detects SQLite vs PostgreSQL based on connection string.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddIdentityInfrastructure(
        this IServiceCollection services,
        string connectionString)
    {
        services.AddDbContext<IdentityDbContext>(options =>
        {
            if (connectionString.Contains("Host=", StringComparison.OrdinalIgnoreCase) ||
                connectionString.Contains("Server=", StringComparison.OrdinalIgnoreCase) ||
                connectionString.Contains("Port=", StringComparison.OrdinalIgnoreCase))
            {
                options.UseNpgsql(connectionString, npgsqlOptions =>
                {
                    npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "identity");
                });
            }
            else
            {
                options.UseSqlite(connectionString);
            }
        });

        services.AddScoped<IHealthCheckRepository, HealthCheckRepository>();

        return services;
    }
}
