using MediatR;
using SportHub.Community.Application.CommunityInfo;

namespace SportHub.Api.Routes;

/// <summary>
/// Maps the Community endpoints for the SportHub Connect API.
/// Provides community information to the frontend landing page.
/// </summary>
internal static class CommunityRoutes
{
    /// <inheritdoc/>
    public static void MapCommunityEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/community")
            .WithTags("Community")
            .WithName("Community")
            .AllowAnonymous();

        group.MapGet("/info", async (IMediator mediator, CancellationToken ct) =>
        {
            var result = await mediator.Send(new GetCommunityInfoQuery(), ct);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.Problem(result.Errors.First().Message);
        })
        .WithName("GetCommunityInfo")
        .WithSummary("Obtiene la informacion de la comunidad por defecto")
        .Produces<CommunityInfoDto>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status500InternalServerError);
    }
}
