using MediatR;
using SportHub.Shared.Abstractions;

namespace SportHub.Community.Application.CommunityInfo;

/// <summary>
/// Query to retrieve the default community information.
/// Used by the landing page to display community data from the database.
/// </summary>
public record GetCommunityInfoQuery : IRequest<Result<CommunityInfoDto>>;
