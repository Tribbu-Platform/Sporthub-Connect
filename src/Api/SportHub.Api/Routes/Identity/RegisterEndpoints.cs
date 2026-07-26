using System.Threading.RateLimiting;
using MediatR;
using Microsoft.AspNetCore.RateLimiting;
using SportHub.Identity.Application.Commands.Register;
using SportHub.Identity.Application.DTOs;

namespace SportHub.Api.Routes.Identity;

/// <summary>
/// Maps the identity registration endpoints.
/// </summary>
internal static class RegisterEndpoints
{
    /// <summary>
    /// Maps the POST /api/identity/register endpoint.
    /// </summary>
    public static void MapIdentityEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/identity")
            .WithTags("Identity")
            .WithName("Identity")
            .AllowAnonymous();

        group.MapPost("/register", async (
            RegisterCommand command,
            IMediator mediator,
            CancellationToken ct) =>
        {
            var result = await mediator.Send(command, ct);

            return result.IsSuccess
                ? Results.Created($"/api/identity/users/{result.Value.UserId}", result.Value)
                : result.Error!.Code switch
                {
                    "Validation" => Results.Problem(
                        statusCode: StatusCodes.Status400BadRequest,
                        title: "Error de validación",
                        detail: result.Error.Description),
                    "Conflict" => Results.Problem(
                        statusCode: StatusCodes.Status409Conflict,
                        title: "Conflicto",
                        detail: result.Error.Description),
                    _ => Results.Problem(
                        statusCode: StatusCodes.Status500InternalServerError,
                        title: "Error interno",
                        detail: result.Error.Description)
                };
        })
        .WithName("RegisterUser")
        .WithSummary("Registra un nuevo usuario con email y contraseña")
        .WithDescription("Crea una cuenta local con email y contraseña. Requiere aceptar términos y condiciones. Retorna tokens JWT para autenticación inmediata.")
        .Accepts<RegisterCommand>("application/json")
        .Produces<RegisterResponse>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status409Conflict)
        .ProducesProblem(StatusCodes.Status500InternalServerError)
        .RequireRateLimiting("IdentityRegistration");
    }
}
