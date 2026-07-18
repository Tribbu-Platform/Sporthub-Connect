namespace SportHub.Shared.Contracts;

/// <summary>
/// Base class for integration events shared between bounded contexts.
/// These events are published via RabbitMQ and consumed by other modules.
/// </summary>
public abstract record IntegrationEvent
{
    public Guid EventId { get; init; } = Guid.NewGuid();
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;
    public Guid CorrelationId { get; init; }
    public Guid CausationId { get; init; }

    protected IntegrationEvent()
    {
    }

    protected IntegrationEvent(Guid correlationId, Guid causationId)
    {
        CorrelationId = correlationId;
        CausationId = causationId;
    }
}
