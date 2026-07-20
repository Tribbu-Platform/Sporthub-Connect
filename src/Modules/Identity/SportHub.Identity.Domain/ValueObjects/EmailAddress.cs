using System.Text.RegularExpressions;

namespace SportHub.Identity.Domain.ValueObjects;

/// <summary>
/// Value Object representing an email address with format validation.
/// Emails are normalized to lowercase for consistency.
/// </summary>
public sealed class EmailAddress : IEquatable<EmailAddress>
{
    private static readonly Regex EmailRegex = new(
        @"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    /// <summary>
    /// Gets the normalized email address value.
    /// </summary>
    public string Value { get; }

    private EmailAddress(string value)
    {
        Value = value;
    }

    /// <summary>
    /// Creates an <see cref="EmailAddress"/> from the given string.
    /// Validates the format and normalizes to lowercase per RFC 5321.
    /// </summary>
    /// <param name="email">The email address string.</param>
    /// <returns>A new <see cref="EmailAddress"/> instance.</returns>
    /// <exception cref="ArgumentException">Thrown when email is null, empty, or has invalid format.</exception>
    public static EmailAddress From(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("El email es obligatorio", nameof(email));

        // Normalize to lowercase per RFC 5321 (local-part is case-sensitive in theory,
        // but in practice all major email providers treat it as case-insensitive)
        var normalized = email.Trim().ToLowerInvariant();

        if (!EmailRegex.IsMatch(normalized))
            throw new ArgumentException("El formato del email no es válido", nameof(email));

        return new EmailAddress(normalized);
    }

    /// <inheritdoc />
    public override string ToString() => Value;

    /// <inheritdoc />
    public bool Equals(EmailAddress? other)
    {
        if (other is null) return false;
        return string.Equals(Value, other.Value, StringComparison.OrdinalIgnoreCase);
    }

    /// <inheritdoc />
    public override bool Equals(object? obj)
    {
        return obj is EmailAddress other && Equals(other);
    }

    /// <inheritdoc />
    public override int GetHashCode()
    {
        return StringComparer.OrdinalIgnoreCase.GetHashCode(Value);
    }

    /// <inheritdoc />
    public static bool operator ==(EmailAddress? left, EmailAddress? right)
    {
        if (left is null && right is null) return true;
        if (left is null || right is null) return false;
        return left.Equals(right);
    }

    /// <inheritdoc />
    public static bool operator !=(EmailAddress? left, EmailAddress? right)
    {
        return !(left == right);
    }
}
