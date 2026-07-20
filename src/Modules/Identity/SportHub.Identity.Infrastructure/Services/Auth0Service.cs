using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;
using SportHub.Identity.Application.Services;

namespace SportHub.Identity.Infrastructure.Services;

/// <summary>
/// Service for interacting with Auth0 Management API and Authentication API.
/// Uses OAuth 2.0 Client Credentials flow to obtain management API tokens.
/// </summary>
internal sealed class Auth0Service : IAuth0Service
{
    private readonly Auth0Options _options;
    private readonly HttpClient _httpClient;

    /// <summary>
    /// Initializes a new instance of the <see cref="Auth0Service"/> class.
    /// </summary>
    /// <param name="options">Auth0 configuration options.</param>
    /// <param name="httpClient">HTTP client configured with Auth0 base URL.</param>
    public Auth0Service(IOptions<Auth0Options> options, HttpClient httpClient)
    {
        _options = options?.Value ?? throw new ArgumentNullException(nameof(options));
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
    }

    /// <inheritdoc/>
    public async Task<string> CreateUserAsync(string email, string passwordHash, CancellationToken cancellationToken = default)
    {
        var accessToken = await GetManagementApiTokenAsync(cancellationToken);

        var request = new
        {
            email,
            password = passwordHash,
            connection = _options.Connection,
            email_verified = false,
            verify_email = false
        };

        var httpRequest = new HttpRequestMessage(HttpMethod.Post, $"https://{_options.Domain}/api/v2/users")
        {
            Headers = { { "Authorization", $"Bearer {accessToken}" } },
            Content = JsonContent.Create(request)
        };

        var response = await _httpClient.SendAsync(httpRequest, cancellationToken);
        response.EnsureSuccessStatusCode();

        var responseBody = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: cancellationToken);
        return responseBody.GetProperty("user_id").GetString()
               ?? responseBody.GetProperty("_id").GetString()
               ?? throw new InvalidOperationException("Auth0 did not return a user ID");
    }

    /// <inheritdoc/>
    public async Task<Auth0TokenResult?> GetTokenAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        var request = new
        {
            grant_type = "password",
            username = email,
            password,
            audience = _options.Audience,
            client_id = _options.ClientId,
            client_secret = _options.ClientSecret,
            scope = "openid profile email"
        };

        var httpRequest = new HttpRequestMessage(HttpMethod.Post, $"https://{_options.Domain}/oauth/token")
        {
            Content = JsonContent.Create(request)
        };

        var response = await _httpClient.SendAsync(httpRequest, cancellationToken);
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadFromJsonAsync<Auth0TokenResult>(cancellationToken: cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<Auth0TokenResult?> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var request = new
        {
            grant_type = "refresh_token",
            refresh_token = refreshToken,
            client_id = _options.ClientId,
            client_secret = _options.ClientSecret
        };

        var httpRequest = new HttpRequestMessage(HttpMethod.Post, $"https://{_options.Domain}/oauth/token")
        {
            Content = JsonContent.Create(request)
        };

        var response = await _httpClient.SendAsync(httpRequest, cancellationToken);
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadFromJsonAsync<Auth0TokenResult>(cancellationToken: cancellationToken);
    }

    /// <inheritdoc/>
    public async Task RevokeTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var request = new
        {
            token = refreshToken,
            client_id = _options.ClientId,
            client_secret = _options.ClientSecret
        };

        var httpRequest = new HttpRequestMessage(HttpMethod.Post, $"https://{_options.Domain}/oauth/revoke")
        {
            Content = JsonContent.Create(request)
        };

        var response = await _httpClient.SendAsync(httpRequest, cancellationToken);
        response.EnsureSuccessStatusCode();
    }

    /// <inheritdoc/>
    public async Task LinkAccountAsync(string userId, string provider, string code, CancellationToken cancellationToken = default)
    {
        var accessToken = await GetManagementApiTokenAsync(cancellationToken);

        var request = new
        {
            provider,
            connection_id = code,
            user_id = userId
        };

        var httpRequest = new HttpRequestMessage(HttpMethod.Post, $"https://{_options.Domain}/api/v2/users/{userId}/identities")
        {
            Headers = { { "Authorization", $"Bearer {accessToken}" } },
            Content = JsonContent.Create(request)
        };

        var response = await _httpClient.SendAsync(httpRequest, cancellationToken);
        response.EnsureSuccessStatusCode();
    }

    private async Task<string> GetManagementApiTokenAsync(CancellationToken cancellationToken)
    {
        var request = new
        {
            grant_type = "client_credentials",
            client_id = _options.ClientId,
            client_secret = _options.ClientSecret,
            audience = _options.Audience
        };

        var httpRequest = new HttpRequestMessage(HttpMethod.Post, $"https://{_options.Domain}/oauth/token")
        {
            Content = JsonContent.Create(request)
        };

        var response = await _httpClient.SendAsync(httpRequest, cancellationToken);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<Auth0ManagementTokenResponse>(cancellationToken: cancellationToken);
        return result?.AccessToken ?? throw new InvalidOperationException("Failed to obtain Auth0 management API token");
    }
}

/// <summary>
/// Response from Auth0 OAuth token endpoint for client credentials flow.
/// </summary>
internal sealed class Auth0ManagementTokenResponse
{
    [JsonPropertyName("access_token")]
    public string AccessToken { get; set; } = string.Empty;

    [JsonPropertyName("token_type")]
    public string TokenType { get; set; } = string.Empty;

    [JsonPropertyName("expires_in")]
    public int ExpiresIn { get; set; }
}
