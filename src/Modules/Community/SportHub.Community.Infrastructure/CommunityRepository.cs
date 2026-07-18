using Microsoft.EntityFrameworkCore;
using SportHub.Community.Domain;

namespace SportHub.Community.Infrastructure;

/// <summary>
/// EF Core implementation of the Community repository.
/// Implements GetDefaultAsync with a "create if not exists" pattern.
/// </summary>
internal sealed class CommunityRepository : ICommunityRepository
{
    private readonly CommunityDbContext _context;

    public CommunityRepository(CommunityDbContext context)
    {
        _context = context;
    }

    public async Task<CommunityAggregate> GetDefaultAsync(CancellationToken ct = default)
    {
        var community = await _context.Communities
            .OrderBy(c => c.CreatedAt)
            .FirstOrDefaultAsync(ct);

        if (community is not null)
            return community;

        // Create default community if none exists
        community = CommunityAggregate.Create(
            "SportHub Community",
            "Welcome to SportHub Connect - Your sports community platform");

        await _context.Communities.AddAsync(community, ct);
        await _context.SaveChangesAsync(ct);

        return community;
    }
}
