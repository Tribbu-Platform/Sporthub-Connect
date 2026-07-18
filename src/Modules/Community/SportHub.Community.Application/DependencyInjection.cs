using Microsoft.Extensions.DependencyInjection;

namespace SportHub.Community.Application;

/// <summary>
/// Registers all Community Application layer services.
/// </summary>
public static class DependencyInjection
{
    /// <inheritdoc/>
    public static IServiceCollection AddCommunityApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly);
        });

        return services;
    }
}
