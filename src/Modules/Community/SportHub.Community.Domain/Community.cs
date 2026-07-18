namespace SportHub.Community.Domain;

/// <summary>
/// Represents a sports community aggregate root.
/// Each community has members, events, and gamification features.
/// </summary>
public sealed class CommunityAggregate : Shared.Abstractions.Entity
{
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public int MemberCount { get; private set; }

    // EF Core parameterless constructor
    private CommunityAggregate() { }

    public static CommunityAggregate Create(string name, string description, int memberCount = 0)
    {
        return new CommunityAggregate
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = description,
            MemberCount = memberCount,
            CreatedAt = DateTime.UtcNow
        };
    }
}
