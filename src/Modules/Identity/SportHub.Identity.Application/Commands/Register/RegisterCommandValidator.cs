using FluentValidation;

namespace SportHub.Identity.Application.Commands.Register;

/// <summary>
/// Validator for <see cref="RegisterCommand"/>.
/// Ensures email, password, and terms acceptance are valid.
/// </summary>
public sealed class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("El email es obligatorio")
            .EmailAddress().WithMessage("El formato del email no es válido");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La contraseña es obligatoria")
            .MinimumLength(8).WithMessage("La contraseña debe tener al menos 8 caracteres")
            .Must(p => p.Any(char.IsUpper)).WithMessage("La contraseña debe contener al menos una letra mayúscula")
            .Must(p => p.Any(char.IsLower)).WithMessage("La contraseña debe contener al menos una letra minúscula")
            .Must(p => p.Any(char.IsDigit)).WithMessage("La contraseña debe contener al menos un número")
            .Must(p => p.Any(IsSpecialChar)).WithMessage("La contraseña debe contener al menos un carácter especial");

        RuleFor(x => x.AcceptTerms)
            .Equal(true).WithMessage("Debe aceptar los términos y condiciones");
    }

    private static bool IsSpecialChar(char c)
        => !char.IsLetterOrDigit(c);
}
