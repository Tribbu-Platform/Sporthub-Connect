using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SportHub.Identity.Domain;
using SportHub.Identity.Domain.Common;
using SportHub.Identity.Domain.Repositories;
using SportHub.Identity.Infrastructure.Repositories;
using SportHub.Identity.Infrastructure.Services;
using SportHub.Identity.Application.Services;
using SportHub.Shared.Abstractions;

namespace SportHub.Identity.Infrastructure;

/// <summary>
/// Registers all Identity Infrastructure layer services.
/// Auto-detects SQLite vs PostgreSQL based on connection string.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Registers Identity infrastructure services including DbContext, repositories,
    /// and external service integrations.
    /// </summary>
    /// <param name="services">The service collection.</param>
    /// <param name="connectionString">Database connection string.</param>
    /// <returns>The service collection for chaining.</returns>
    public static IServiceCollection AddIdentityInfrastructure(
        this IServiceCollection services,
        string connectionString)
    {
        // Database context
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

        // Unit of Work (DbContext implements IIdentityUnitOfWork)
        services.AddScoped<IIdentityUnitOfWork>(sp =>
            sp.GetRequiredService<IdentityDbContext>());

        // Repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IHealthCheckRepository, HealthCheckRepository>();

        return services;
    }

    /// <summary>
    /// Registers Identity external services (Auth0, JWT) with configuration binding.
    /// </summary>
    /// <param name="services">The service collection.</param>
    /// <param name="configuration">The application configuration.</param>
    /// <returns>The service collection for chaining.</returns>
    public static IServiceCollection AddIdentityExternalServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Auth0
        services.Configure<Auth0Options>(configuration.GetSection("Auth0"));
        services.AddHttpClient<IAuth0Service, Auth0Service>();

        // JWT
        services.Configure<JwtSettings>(configuration.GetSection("Jwt"));
        services.AddSingleton<ITokenService, TokenService>();

        return services;
    }
}
