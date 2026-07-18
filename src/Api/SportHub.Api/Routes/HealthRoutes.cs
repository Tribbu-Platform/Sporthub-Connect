using MediatR;
using SportHub.Identity.Application.HealthChecks;

namespace SportHub.Api.Routes;

/// <summary>
/// Maps the health check endpoints for the SportHub Connect API.
/// Demonstrates the full walking skeleton: API → Application → Domain → Infrastructure → Database.
/// </summary>
internal static class HealthRoutes
{
    /// <inheritdoc/>
    public static void MapHealthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/health")
            .WithTags("Health")
            .WithName("Health")
            .AllowAnonymous();

        group.MapGet("/details", async (IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(new GetHealthStatusQuery(), ct);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.Problem(result.Errors.First().Message);
        })
        .WithName("GetHealthDetails")
        .WithSummary("Obtiene el estado de salud detallado del sistema")
        .Produces<HealthStatusDto>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status500InternalServerError);
    }
}
