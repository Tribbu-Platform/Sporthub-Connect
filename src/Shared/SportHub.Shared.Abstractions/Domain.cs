namespace SportHub.Shared.Abstractions;

/// <summary>
/// Base interface for all domain events.
/// Domain events represent something that happened in the domain that
/// other bounded contexts may be interested in.
/// </summary>
public interface IDomainEvent
{
    /// <summary>Unique identifier for this event instance.</summary>
    Guid EventId { get; }

    /// <summary>UTC timestamp when the event occurred.</summary>
    DateTime OccurredOn { get; }
}

/// <summary>
/// Marker interface for aggregate roots.
/// Aggregate roots are the entry points to domain aggregates
/// and ensure consistency boundaries.
/// </summary>
public interface IAggregateRoot
{
    /// <summary>Collection of domain events raised by this aggregate.</summary>
    IReadOnlyCollection<IDomainEvent> DomainEvents { get; }

    /// <summary>Clear all domain events after they have been dispatched.</summary>
    void ClearDomainEvents();
}

/// <summary>
/// Generic repository interface for aggregate roots.
/// </summary>
/// <typeparam name="T">The aggregate root type.</typeparam>
public interface IRepository<T> where T : IAggregateRoot
{
    /// <inheritdoc/>
    Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    /// <inheritdoc/>
    Task AddAsync(T aggregate, CancellationToken cancellationToken = default);
    /// <inheritdoc/>
    void Update(T aggregate);
    /// <inheritdoc/>
    void Delete(T aggregate);
}

/// <summary>
/// Unit of Work pattern for coordinating persistence operations.
/// </summary>
public interface IUnitOfWork
{
    /// <inheritdoc/>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    /// <inheritdoc/>
    Task<bool> SaveEntitiesAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Base class for entities with a strongly-typed identifier.
/// </summary>
public abstract class Entity
{
    /// <inheritdoc/>
    public Guid Id { get; protected set; }
    /// <inheritdoc/>
    public DateTime CreatedAt { get; protected set; }
    /// <inheritdoc/>
    public DateTime? UpdatedAt { get; protected set; }

    private readonly List<IDomainEvent> _domainEvents = [];

    /// <inheritdoc/>
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    /// <inheritdoc/>
    protected void AddDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    /// <inheritdoc/>
    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }

    /// <inheritdoc/>
    public override bool Equals(object? obj)
    {
        if (obj is not Entity other)
            return false;

        if (ReferenceEquals(this, other))
            return true;

        if (GetType() != other.GetType())
            return false;

        return Id != Guid.Empty && Id == other.Id;
    }

    /// <inheritdoc/>
    public override int GetHashCode()
    {
        return Id.GetHashCode();
    }

    /// <inheritdoc/>
    public static bool operator ==(Entity? left, Entity? right)
    {
        if (left is null && right is null)
            return true;
        if (left is null || right is null)
            return false;
        return left.Equals(right);
    }

    /// <inheritdoc/>
    public static bool operator !=(Entity? left, Entity? right)
    {
        return !(left == right);
    }
}

/// <summary>
/// Base class for Value Objects (immutable, compared by structural equality).
/// </summary>
public abstract class ValueObject
{
    /// <inheritdoc/>
    protected abstract IEnumerable<object> GetEqualityComponents();

    /// <inheritdoc/>
    public override bool Equals(object? obj)
    {
        if (obj is null || obj.GetType() != GetType())
            return false;

        var other = (ValueObject)obj;
        return GetEqualityComponents().SequenceEqual(other.GetEqualityComponents());
    }

    /// <inheritdoc/>
    public override int GetHashCode()
    {
        return GetEqualityComponents()
            .Select(x => x?.GetHashCode() ?? 0)
            .Aggregate((x, y) => x ^ y);
    }

    /// <inheritdoc/>
    public static bool operator ==(ValueObject? left, ValueObject? right)
    {
        if (left is null && right is null)
            return true;
        if (left is null || right is null)
            return false;
        return left.Equals(right);
    }

    /// <inheritdoc/>
    public static bool operator !=(ValueObject? left, ValueObject? right)
    {
        return !(left == right);
    }
}
