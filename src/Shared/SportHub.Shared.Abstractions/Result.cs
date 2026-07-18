namespace SportHub.Shared.Abstractions;

/// <summary>
/// Result pattern for operations that can succeed or fail.
/// Avoids throwing exceptions for expected business rule violations.
/// </summary>
public class Result
{
    /// <inheritdoc/>
    public bool IsSuccess { get; }
    /// <inheritdoc/>
    public bool IsFailure => !IsSuccess;
    /// <inheritdoc/>
    public Error? Error { get; }
    /// <inheritdoc/>
    public IReadOnlyList<Error> Errors { get; }

    /// <inheritdoc/>
    protected Result(bool isSuccess, Error? error)
    {
        if (isSuccess && error is not null)
            throw new InvalidOperationException("A successful result cannot have an error.");
        if (!isSuccess && error is null)
            throw new InvalidOperationException("A failed result must have an error.");

        IsSuccess = isSuccess;
        Error = error;
        Errors = error is not null ? new[] { error } : Array.Empty<Error>();
    }

    /// <inheritdoc/>
    public static Result Success() => new(true, null);
    /// <inheritdoc/>
    public static Result Ok() => new(true, null);
    /// <inheritdoc/>
    public static Result Failure(Error error) => new(false, error);

    public static implicit operator     /// <inheritdoc/>
/// <inheritdoc/>
Result(Error error) => Failure(error);

    /// <inheritdoc/>
    public Result ToResult()
    {
        throw new NotImplementedException();
    }
}

/// <summary>
/// Result pattern with a typed value.
/// </summary>
public class Result<T> : Result
{
    private readonly T? _value;

    /// <inheritdoc/>
    public T Value => IsSuccess
        ? _value!
        : throw new InvalidOperationException("Cannot access Value of a failed result.");

    /// <inheritdoc/>
    protected internal Result(T? value, bool isSuccess, Error? error)
        : base(isSuccess, error)
    {
        _value = value;
    }

    /// <inheritdoc/>
    public static Result<T> Success(T value) => new(value, true, null);
    /// <inheritdoc/>
    public static Result<T> Ok(T value) => new(value, true, null);
    /// <inheritdoc/>
    public new static Result<T> Failure(Error error) => new(default, false, error);

    public static implicit operator     /// <inheritdoc/>
/// <inheritdoc/>
Result<T>(T value) => Success(value);
    public static implicit operator     /// <inheritdoc/>
/// <inheritdoc/>
Result<T>(Error error) => Failure(error);

    /// <inheritdoc/>
    public new Result<T> ToResult()
    {
        throw new NotImplementedException();
    }
}

/// <summary>
/// Represents an error with a code and description.
/// </summary>
public sealed record Error(string Code, string Description)
{
    /// <inheritdoc/>
    public string Message => Description;

    public static readonly Error     /// <inheritdoc/>
/// <inheritdoc/>
None = new(string.Empty, string.Empty);

    /// <inheritdoc/>
    public static Error NotFound(string description) => new("NotFound", description);
    /// <inheritdoc/>
    public static Error Validation(string description) => new("Validation", description);
    /// <inheritdoc/>
    public static Error Conflict(string description) => new("Conflict", description);
    /// <inheritdoc/>
    public static Error Unauthorized(string description) => new("Unauthorized", description);
    /// <inheritdoc/>
    public static Error Forbidden(string description) => new("Forbidden", description);
}
