using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace SportHub.Identity.Application;

/// <summary>
/// Registers all Identity Application layer services.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds Identity Application layer services including MediatR handlers,
    /// FluentValidation validators, and AutoMapper profiles.
    /// </summary>
    /// <param name="services">The service collection.</param>
    /// <returns>The service collection for chaining.</returns>
    public static IServiceCollection AddIdentityApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly);
        });

        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        return services;
    }
}
