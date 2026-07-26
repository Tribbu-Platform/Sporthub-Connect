using BCrypt.Net;

namespace SportHub.Identity.Domain.ValueObjects;

/// <summary>
/// Value Object representing a BCrypt password hash.
/// Provides factory methods for creating hashes from plaintext passwords
/// and verification against stored hashes.
/// </summary>
public sealed class PasswordHash : IEquatable<PasswordHash>
{
    private const int WorkFactor = 11;

    /// <summary>
    /// Gets the BCrypt hash string value.
    /// </summary>
    public string Value { get; }

    private PasswordHash(string value)
    {
        Value = value;
    }

    /// <summary>
    /// Creates a <see cref="PasswordHash"/> from a plaintext password.
    /// Validates that the password meets minimum length requirements
    /// and generates a BCrypt hash.
    /// </summary>
    /// <param name="password">The plaintext password.</param>
    /// <returns>A new <see cref="PasswordHash"/> instance.</returns>
    /// <exception cref="ArgumentException">Thrown when password is null, empty, or too short.</exception>
    public static PasswordHash Create(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            throw new ArgumentException("La contraseña es obligatoria", nameof(password));

        if (password.Length < 8)
            throw new ArgumentException("La contraseña debe tener al menos 8 caracteres", nameof(password));

        var hash = BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);
        return new PasswordHash(hash);
    }

    /// <summary>
    /// Creates a <see cref="PasswordHash"/> from an existing BCrypt hash string.
    /// Used when reconstructing from persistence.
    /// </summary>
    /// <param name="hash">The existing BCrypt hash.</param>
    /// <returns>A new <see cref="PasswordHash"/> instance.</returns>
    /// <exception cref="ArgumentException">Thrown when hash is null or empty.</exception>
    public static PasswordHash FromHash(string hash)
    {
        if (string.IsNullOrWhiteSpace(hash))
            throw new ArgumentException("El hash de contraseña es obligatorio", nameof(hash));

        return new PasswordHash(hash);
    }

    /// <summary>
    /// Verifies a plaintext password against the stored hash.
    /// </summary>
    /// <param name="password">The plaintext password to verify.</param>
    /// <returns>True if the password matches the hash; otherwise false.</returns>
    public bool Verify(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            return false;

        return BCrypt.Net.BCrypt.Verify(password, Value);
    }

    /// <inheritdoc />
    public override string ToString() => Value;

    /// <inheritdoc />
    public bool Equals(PasswordHash? other)
    {
        if (other is null) return false;
        return string.Equals(Value, other.Value, StringComparison.Ordinal);
    }

    /// <inheritdoc />
    public override bool Equals(object? obj)
    {
        return obj is PasswordHash other && Equals(other);
    }

    /// <inheritdoc />
    public override int GetHashCode()
    {
        return StringComparer.Ordinal.GetHashCode(Value);
    }

    /// <inheritdoc />
    public static bool operator ==(PasswordHash? left, PasswordHash? right)
    {
        if (left is null && right is null) return true;
        if (left is null || right is null) return false;
        return left.Equals(right);
    }

    /// <inheritdoc />
    public static bool operator !=(PasswordHash? left, PasswordHash? right)
    {
        return !(left == right);
    }
}
