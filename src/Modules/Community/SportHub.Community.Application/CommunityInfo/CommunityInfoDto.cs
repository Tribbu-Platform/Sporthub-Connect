namespace SportHub.Community.Application.CommunityInfo;

/// <summary>
/// DTO representing community information returned to API consumers.
/// </summary>
public record CommunityInfoDto(
    string Name,
    string Description,
    int MemberCount,
    DateTime CreatedAt,
    string Status);
