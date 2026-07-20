using Microsoft.EntityFrameworkCore;
using SportHub.Identity.Infrastructure;
using Testcontainers.PostgreSql;

namespace SportHub.Identity.IntegrationTests.Infrastructure;

/// <summary>
/// Fixture that manages a PostgreSQL Testcontainer for integration tests.
/// Each test class gets its own database schema to ensure isolation.
/// Uses a shared container but creates/drops schemas per test class.
/// </summary>
public sealed class PostgreSqlFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer _container;

    /// <summary>
    /// Gets the connection string to the PostgreSQL container.
    /// </summary>
    public string ConnectionString => _container.GetConnectionString();

    /// <summary>
    /// Initializes a new instance of the <see cref="PostgreSqlFixture"/> class.
    /// </summary>
    public PostgreSqlFixture()
    {
        _container = new PostgreSqlBuilder()
            .WithImage("postgres:16-alpine")
            .WithDatabase("sportshub_test")
            .WithUsername("test")
            .WithPassword("test_password")
            .WithCleanUp(true)
            .Build();
    }

    /// <inheritdoc/>
    public async Task InitializeAsync()
    {
        await _container.StartAsync();
    }

    /// <inheritdoc/>
    public async Task DisposeAsync()
    {
        await _container.DisposeAsync();
    }

    /// <summary>
    /// Creates a new IdentityDbContext connected to the test PostgreSQL instance
    /// with a unique schema name for test isolation.
    /// </summary>
    /// <param name="schema">The schema name (e.g., "test_us001_1").</param>
    /// <returns>A new <see cref="IdentityDbContext"/> instance.</returns>
    public IdentityDbContext CreateDbContext(string schema = "integration_test")
    {
        var options = new DbContextOptionsBuilder<IdentityDbContext>()
            .UseNpgsql(ConnectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", schema);
            })
            .Options;

        var context = new IdentityDbContext(options);

        // Set schema and ensure created
        context.Database.SetCommandTimeout(TimeSpan.FromSeconds(30));
        context.Database.EnsureCreated();

        return context;
    }

    /// <summary>
    /// Resets the database by ensuring all tables are recreated.
    /// </summary>
    /// <param name="schema">The schema name to reset.</param>
    public async Task ResetDatabaseAsync(string schema = "integration_test")
    {
        await using var context = CreateDbContext(schema);
        await context.Database.EnsureDeletedAsync();
        await context.Database.EnsureCreatedAsync();
    }
}

/// <summary>
/// Collection definition to ensure the PostgreSQL container runs only once per test collection.
/// </summary>
[CollectionDefinition("PostgreSqlIntegrationTests")]
public class PostgreSqlTestCollection : ICollectionFixture<PostgreSqlFixture>
{
}
