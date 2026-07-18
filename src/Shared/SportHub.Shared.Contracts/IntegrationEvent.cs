namespace SportHub.Shared.Contracts;

/// <summary>
/// Base class for integration events shared between bounded contexts.
/// These events are published via RabbitMQ and consumed by other modules.
/// </summary>
public abstract record IntegrationEvent
{
    /// <inheritdoc/>
    public Guid EventId { get; init; } = Guid.NewGuid();
    /// <inheritdoc/>
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;
    /// <inheritdoc/>
    public Guid CorrelationId { get; init; }
    /// <inheritdoc/>
    public Guid CausationId { get; init; }

    /// <inheritdoc/>
    protected IntegrationEvent()
    {
    }

    /// <inheritdoc/>
    protected IntegrationEvent(Guid correlationId, Guid causationId)
    {
        CorrelationId = correlationId;
        CausationId = causationId;
    }
}
