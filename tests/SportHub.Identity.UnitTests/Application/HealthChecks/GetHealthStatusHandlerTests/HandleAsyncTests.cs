using FluentAssertions;
using Moq;
using SportHub.Identity.Application.HealthChecks;
using SportHub.Identity.Domain;

namespace SportHub.Identity.UnitTests.Application.HealthChecks.GetHealthStatusHandlerTests;

/// <summary>
/// Unit tests for GetHealthStatusHandler.Handle method.
/// </summary>
public class HandleAsyncTests
{
    private readonly Mock<IHealthCheckRepository> _repositoryMock = new();
    private readonly GetHealthStatusHandler _sut;

    public HandleAsyncTests()
    {
        _sut = new GetHealthStatusHandler(_repositoryMock.Object);
    }

    [Fact]
    public async Task Should_ReturnHealthStatus_When_ServiceIsHealthy()
    {
        // Arrange --------------------------------------------------------
        HealthCheck? captured = null;
        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<HealthCheck>(), It.IsAny<CancellationToken>()))
            .Callback<HealthCheck, CancellationToken>((h, _) => captured = h)
            .Returns(Task.CompletedTask);

        _repositoryMock
            .Setup(r => r.GetLatestAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => captured);

        var query = new GetHealthStatusQuery();

        // Act ------------------------------------------------------------
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert ----------------------------------------------------------
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.ServiceName.Should().Be("SportHub Connect");
        result.Value.Status.Should().Be("Healthy");
        result.Value.DatabaseStatus.Should().Be("Connected");
        result.Value.ServerTime.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task Should_StoreHealthCheck_InDatabase()
    {
        // Arrange --------------------------------------------------------
        HealthCheck? captured = null;
        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<HealthCheck>(), It.IsAny<CancellationToken>()))
            .Callback<HealthCheck, CancellationToken>((h, _) => captured = h)
            .Returns(Task.CompletedTask);

        _repositoryMock
            .Setup(r => r.GetLatestAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => captured);

        var query = new GetHealthStatusQuery();

        // Act ------------------------------------------------------------
        await _sut.Handle(query, CancellationToken.None);

        // Assert ----------------------------------------------------------
        _repositoryMock.Verify(
            r => r.AddAsync(It.IsAny<HealthCheck>(), It.IsAny<CancellationToken>()),
            Times.Once);
        captured.Should().NotBeNull();
        captured!.ServiceName.Should().Be("SportHub Connect");
        captured.Status.Should().Be("Healthy");
        captured.CheckedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }
}
