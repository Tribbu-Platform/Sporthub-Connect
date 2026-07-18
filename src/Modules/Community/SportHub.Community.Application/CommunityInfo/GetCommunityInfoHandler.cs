using MediatR;
using SportHub.Community.Domain;
using SportHub.Shared.Abstractions;

namespace SportHub.Community.Application.CommunityInfo;

/// <summary>
/// Handles the GetCommunityInfoQuery by retrieving the default community
/// from the repository and mapping it to a DTO.
/// </summary>
public sealed class GetCommunityInfoHandler : IRequestHandler<GetCommunityInfoQuery, Result<CommunityInfoDto>>
{
    private readonly ICommunityRepository _repository;

    /// <inheritdoc/>
    public GetCommunityInfoHandler(ICommunityRepository repository)
    {
        _repository = repository;
    }

    /// <inheritdoc/>
    public async Task<Result<CommunityInfoDto>> Handle(GetCommunityInfoQuery request, CancellationToken ct)
    {
        var community = await _repository.GetDefaultAsync(ct);

        return Result<CommunityInfoDto>.Ok(new CommunityInfoDto(
            community.Name,
            community.Description,
            community.MemberCount,
            community.CreatedAt,
            "Connected"));
    }
}
