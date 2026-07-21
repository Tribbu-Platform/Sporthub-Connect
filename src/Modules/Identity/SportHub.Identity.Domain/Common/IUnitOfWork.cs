using SportHub.Shared.Abstractions;

namespace SportHub.Identity.Domain.Common;

/// <summary>
/// Unit of Work for the Identity bounded context.
/// Coordinates persistence and domain event dispatch.
/// </summary>
public interface IIdentityUnitOfWork : IUnitOfWork
{
}
