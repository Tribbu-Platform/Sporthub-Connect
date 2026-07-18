using MediatR;

namespace SportHub.Shared.Abstractions;

/// <summary>
/// Base interface for CQRS Commands.
/// Commands represent write operations that mutate state.
/// </summary>
public interface ICommand : IRequest<Result>
{
}

/// <summary>
/// Base interface for CQRS Commands with a return value.
/// </summary>
/// <typeparam name="TResponse">The response type.</typeparam>
public interface ICommand<TResponse> : IRequest<Result<TResponse>>
{
}

/// <summary>
/// Base interface for CQRS Queries.
/// Queries represent read operations that do not mutate state.
/// </summary>
/// <typeparam name="TResponse">The response type.</typeparam>
public interface IQuery<TResponse> : IRequest<Result<TResponse>>
{
}
