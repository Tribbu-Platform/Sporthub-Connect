using FluentAssertions;
using Moq;
using SportHub.Community.Application.CommunityInfo;
using SportHub.Community.Domain;

namespace SportHub.Community.UnitTests.Application.CommunityInfo.GetCommunityInfoHandlerTests;

/// <summary>
/// Unit tests for GetCommunityInfoHandler.Handle method.
/// </summary>
public class HandleAsyncTests
{
    private readonly Mock<ICommunityRepository> _repositoryMock = new();
    private readonly GetCommunityInfoHandler _sut;

    /// <inheritdoc/>
    public HandleAsyncTests()
    {
        _sut = new GetCommunityInfoHandler(_repositoryMock.Object);
    }

    /// <inheritdoc/>
    [Fact]
    public async Task Should_ReturnCommunityInfo_When_CommunityExists()
    {
        // Arrange --------------------------------------------------------
        var existingCommunity = CommunityAggregate.Create(
            "SportHub Community",
            "Welcome to SportHub Connect - Your sports community platform");

        _repositoryMock
            .Setup(r => r.GetDefaultAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingCommunity);

        var query = new GetCommunityInfoQuery();

        // Act ------------------------------------------------------------
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert ----------------------------------------------------------
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Name.Should().Be("SportHub Community");
        result.Value.Description.Should().Be("Welcome to SportHub Connect - Your sports community platform");
        result.Value.MemberCount.Should().Be(0);
        result.Value.Status.Should().Be("Connected");
    }

    /// <inheritdoc/>
    [Fact]
    public async Task Should_ReturnCommunityInfo_WithCorrectTimestamp_When_CommunityReturned()
    {
        // Arrange --------------------------------------------------------
        var community = CommunityAggregate.Create("Test Community", "A test description");
        _repositoryMock
            .Setup(r => r.GetDefaultAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(community);

        var query = new GetCommunityInfoQuery();

        // Act ------------------------------------------------------------
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert ----------------------------------------------------------
        result.IsSuccess.Should().BeTrue();
        result.Value.CreatedAt.Should().Be(community.CreatedAt);
        result.Value.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }
}
