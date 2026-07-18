using Microsoft.Extensions.DependencyInjection;

namespace SportHub.Identity.Application;

/// <summary>
/// Registers all Identity Application layer services.
/// </summary>
public static class DependencyInjection
{
    /// <inheritdoc/>
    public static IServiceCollection AddIdentityApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly);
        });

        return services;
    }
}
