namespace SportHub.Shared.Abstractions;

/// <summary>
/// Result pattern for operations that can succeed or fail.
/// Avoids throwing exceptions for expected business rule violations.
/// </summary>
public class Result
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public Error? Error { get; }
    public IReadOnlyList<Error> Errors { get; }

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

    public static Result Success() => new(true, null);
    public static Result Ok() => new(true, null);
    public static Result Failure(Error error) => new(false, error);

    public static implicit operator Result(Error error) => Failure(error);
}

/// <summary>
/// Result pattern with a typed value.
/// </summary>
public class Result<T> : Result
{
    private readonly T? _value;

    public T Value => IsSuccess
        ? _value!
        : throw new InvalidOperationException("Cannot access Value of a failed result.");

    protected internal Result(T? value, bool isSuccess, Error? error)
        : base(isSuccess, error)
    {
        _value = value;
    }

    public static Result<T> Success(T value) => new(value, true, null);
    public static Result<T> Ok(T value) => new(value, true, null);
    public new static Result<T> Failure(Error error) => new(default, false, error);

    public static implicit operator Result<T>(T value) => Success(value);
    public static implicit operator Result<T>(Error error) => Failure(error);
}

/// <summary>
/// Represents an error with a code and description.
/// </summary>
public sealed record Error(string Code, string Description)
{
    public string Message => Description;

    public static readonly Error None = new(string.Empty, string.Empty);

    public static Error NotFound(string description) => new("NotFound", description);
    public static Error Validation(string description) => new("Validation", description);
    public static Error Conflict(string description) => new("Conflict", description);
    public static Error Unauthorized(string description) => new("Unauthorized", description);
    public static Error Forbidden(string description) => new("Forbidden", description);
}
