using System.Net;
using System.Text.Json;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Moq.Protected;
using SportHub.Identity.Infrastructure.Services;

namespace SportHub.Identity.UnitTests.Infrastructure.Services.Auth0ServiceTests;

public class CreateUserAsyncTests
{
    private readonly Mock<HttpMessageHandler> _httpHandlerMock = new();
    private readonly HttpClient _httpClient;
    private readonly Auth0Options _options;
    private readonly Auth0Service _sut;

    public CreateUserAsyncTests()
    {
        _options = new Auth0Options
        {
            Domain = "test.auth0.com",
            ClientId = "test-client-id",
            ClientSecret = "test-client-secret",
            Audience = "https://test.auth0.com/api/v2/",
            Connection = "Username-Password-Authentication"
        };

        _httpClient = new HttpClient(_httpHandlerMock.Object)
        {
            BaseAddress = new Uri($"https://{_options.Domain}/")
        };

        var loggerMock = new Mock<ILogger<Auth0Service>>();
        _sut = new Auth0Service(Options.Create(_options), _httpClient, loggerMock.Object);
    }

    [Fact]
    public async Task Should_CreateUser_When_ValidData()
    {
        // Arrange --------------------------------------------------------
        var tokenResponse = new
        {
            access_token = "mgmt-token-123",
            token_type = "Bearer",
            expires_in = 86400
        };

        var createUserResponse = new
        {
            user_id = "auth0|654321",
            email = "newuser@example.com",
            email_verified = false
        };

        _httpHandlerMock.Protected()
            .SetupSequence<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(JsonSerializer.Serialize(tokenResponse))
            })
            .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.Created)
            {
                Content = new StringContent(JsonSerializer.Serialize(createUserResponse))
            });

        // Act ------------------------------------------------------------
        var result = await _sut.CreateUserAsync(
            "newuser@example.com",
            "$2a$11$hashedpassword",
            CancellationToken.None);

        // Assert ----------------------------------------------------------
        result.Should().Be("auth0|654321");
    }

    [Fact]
    public async Task Should_ThrowException_When_Auth0ReturnsError()
    {
        // Arrange --------------------------------------------------------
        var tokenResponse = new
        {
            access_token = "mgmt-token-123",
            token_type = "Bearer",
            expires_in = 86400
        };

        _httpHandlerMock.Protected()
            .SetupSequence<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(JsonSerializer.Serialize(tokenResponse))
            })
            .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.BadRequest)
            {
                Content = new StringContent("{\"error\":\"invalid_input\",\"message\":\"Invalid input\"}")
            });

        // Act ------------------------------------------------------------
        var act = () => _sut.CreateUserAsync(
            "existing@example.com",
            "$2a$11$hashedpassword",
            CancellationToken.None);

        // Assert ----------------------------------------------------------
        await act.Should().ThrowAsync<HttpRequestException>()
            .WithMessage("*400*");
    }
}
