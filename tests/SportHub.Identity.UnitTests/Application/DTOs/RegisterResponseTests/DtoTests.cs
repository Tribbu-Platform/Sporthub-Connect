using FluentAssertions;

namespace SportHub.Identity.UnitTests.Application.DTOs.RegisterResponseTests;

public class DtoTests
{
    [Fact]
    public void Should_HaveAllProperties()
    {
        // Arrange --------------------------------------------------------
        var userId = Guid.NewGuid();
        const string email = "maria@example.com";
        const string accessToken = "eyJhbGci...";
        const string refreshToken = "v1.abc123...";
        const int expiresIn = 3600;
        const bool emailVerified = false;
        const bool acceptedTerms = true;
        const string message = "Cuenta creada exitosamente";

        // Act ------------------------------------------------------------
        var dto = new SportHub.Identity.Application.DTOs.RegisterResponse
        {
            UserId = userId,
            Email = email,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresIn = expiresIn,
            EmailVerified = emailVerified,
            AcceptedTerms = acceptedTerms,
            Message = message
        };

        // Assert ----------------------------------------------------------
        dto.UserId.Should().Be(userId);
        dto.Email.Should().Be(email);
        dto.AccessToken.Should().Be(accessToken);
        dto.RefreshToken.Should().Be(refreshToken);
        dto.ExpiresIn.Should().Be(expiresIn);
        dto.EmailVerified.Should().Be(emailVerified);
        dto.AcceptedTerms.Should().Be(acceptedTerms);
        dto.Message.Should().Be(message);
    }
}
