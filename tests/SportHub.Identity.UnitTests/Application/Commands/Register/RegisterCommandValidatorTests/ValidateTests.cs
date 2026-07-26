using FluentAssertions;
using FluentValidation.TestHelper;
using SportHub.Identity.Application.Commands.Register;

namespace SportHub.Identity.UnitTests.Application.Commands.Register.RegisterCommandValidatorTests;

public class ValidateTests
{
    private readonly RegisterCommandValidator _validator = new();

    [Fact]
    public void Should_PassValidation_When_CommandIsValid()
    {
        // Arrange --------------------------------------------------------
        var command = new RegisterCommand
        {
            Email = "maria@example.com",
            Password = "Maria2026!Segura",
            AcceptTerms = true
        };

        // Act ------------------------------------------------------------
        var result = _validator.TestValidate(command);

        // Assert ----------------------------------------------------------
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Should_FailValidation_When_EmailIsEmpty()
    {
        // Arrange --------------------------------------------------------
        var command = new RegisterCommand
        {
            Email = string.Empty,
            Password = "Maria2026!Segura",
            AcceptTerms = true
        };

        // Act ------------------------------------------------------------
        var result = _validator.TestValidate(command);

        // Assert ----------------------------------------------------------
        result.IsValid.Should().BeFalse();
        result.ShouldHaveValidationErrorFor(c => c.Email)
            .WithErrorMessage("El email es obligatorio");
    }

    [Fact]
    public void Should_FailValidation_When_EmailIsInvalid()
    {
        // Arrange --------------------------------------------------------
        var command = new RegisterCommand
        {
            Email = "email-invalido",
            Password = "Maria2026!Segura",
            AcceptTerms = true
        };

        // Act ------------------------------------------------------------
        var result = _validator.TestValidate(command);

        // Assert ----------------------------------------------------------
        result.IsValid.Should().BeFalse();
        result.ShouldHaveValidationErrorFor(c => c.Email)
            .WithErrorMessage("El formato del email no es válido");
    }

    [Fact]
    public void Should_FailValidation_When_PasswordIsEmpty()
    {
        // Arrange --------------------------------------------------------
        var command = new RegisterCommand
        {
            Email = "maria@example.com",
            Password = string.Empty,
            AcceptTerms = true
        };

        // Act ------------------------------------------------------------
        var result = _validator.TestValidate(command);

        // Assert ----------------------------------------------------------
        result.IsValid.Should().BeFalse();
        result.ShouldHaveValidationErrorFor(c => c.Password)
            .WithErrorMessage("La contraseña es obligatoria");
    }

    [Fact]
    public void Should_FailValidation_When_PasswordTooShort()
    {
        // Arrange --------------------------------------------------------
        var command = new RegisterCommand
        {
            Email = "maria@example.com",
            Password = "Ab1!",
            AcceptTerms = true
        };

        // Act ------------------------------------------------------------
        var result = _validator.TestValidate(command);

        // Assert ----------------------------------------------------------
        result.IsValid.Should().BeFalse();
        result.ShouldHaveValidationErrorFor(c => c.Password)
            .WithErrorMessage("La contraseña debe tener al menos 8 caracteres");
    }

    [Fact]
    public void Should_FailValidation_When_PasswordMissingUppercase()
    {
        // Arrange --------------------------------------------------------
        var command = new RegisterCommand
        {
            Email = "maria@example.com",
            Password = "maria2026!segura",
            AcceptTerms = true
        };

        // Act ------------------------------------------------------------
        var result = _validator.TestValidate(command);

        // Assert ----------------------------------------------------------
        result.IsValid.Should().BeFalse();
        result.ShouldHaveValidationErrorFor(c => c.Password)
            .WithErrorMessage("La contraseña debe contener al menos una letra mayúscula");
    }

    [Fact]
    public void Should_FailValidation_When_PasswordMissingLowercase()
    {
        // Arrange --------------------------------------------------------
        var command = new RegisterCommand
        {
            Email = "maria@example.com",
            Password = "MARIA2026!SEGURA",
            AcceptTerms = true
        };

        // Act ------------------------------------------------------------
        var result = _validator.TestValidate(command);

        // Assert ----------------------------------------------------------
        result.IsValid.Should().BeFalse();
        result.ShouldHaveValidationErrorFor(c => c.Password)
            .WithErrorMessage("La contraseña debe contener al menos una letra minúscula");
    }

    [Fact]
    public void Should_FailValidation_When_PasswordMissingDigit()
    {
        // Arrange --------------------------------------------------------
        var command = new RegisterCommand
        {
            Email = "maria@example.com",
            Password = "MariaSegura!",
            AcceptTerms = true
        };

        // Act ------------------------------------------------------------
        var result = _validator.TestValidate(command);

        // Assert ----------------------------------------------------------
        result.IsValid.Should().BeFalse();
        result.ShouldHaveValidationErrorFor(c => c.Password)
            .WithErrorMessage("La contraseña debe contener al menos un número");
    }

    [Fact]
    public void Should_FailValidation_When_PasswordMissingSpecialChar()
    {
        // Arrange --------------------------------------------------------
        var command = new RegisterCommand
        {
            Email = "maria@example.com",
            Password = "Maria2026Segura",
            AcceptTerms = true
        };

        // Act ------------------------------------------------------------
        var result = _validator.TestValidate(command);

        // Assert ----------------------------------------------------------
        result.IsValid.Should().BeFalse();
        result.ShouldHaveValidationErrorFor(c => c.Password)
            .WithErrorMessage("La contraseña debe contener al menos un carácter especial");
    }

    [Fact]
    public void Should_FailValidation_When_AcceptTermsIsFalse()
    {
        // Arrange --------------------------------------------------------
        var command = new RegisterCommand
        {
            Email = "maria@example.com",
            Password = "Maria2026!Segura",
            AcceptTerms = false
        };

        // Act ------------------------------------------------------------
        var result = _validator.TestValidate(command);

        // Assert ----------------------------------------------------------
        result.IsValid.Should().BeFalse();
        result.ShouldHaveValidationErrorFor(c => c.AcceptTerms)
            .WithErrorMessage("Debe aceptar los términos y condiciones");
    }
}
