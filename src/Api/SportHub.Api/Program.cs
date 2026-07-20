using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using SportHub.Api.Routes;
using SportHub.Api.Routes.Identity;
using SportHub.Community.Application;
using SportHub.Community.Infrastructure;
using SportHub.Identity.Application;
using SportHub.Identity.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// ============================================================
// Service Configuration
// ============================================================

// JSON Serialization
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
});

// OpenAPI
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Info.Title = "SportHub Connect API";
        document.Info.Version = "v1";
        document.Info.Description = "API Gateway for SportHub Connect - SaaS platform for sports communities";
        return Task.CompletedTask;
    });
});

// Health Checks
builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("PostgreSQL")!, name: "postgresql", tags: ["database"])
    .AddRedis(builder.Configuration.GetConnectionString("Redis")!, name: "redis", tags: ["cache"]);

// Problem Details
builder.Services.AddProblemDetails();

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("fixed", config =>
    {
        config.PermitLimit = 100;
        config.Window = TimeSpan.FromMinutes(1);
        config.QueueProcessingOrder = System.Threading.RateLimiting.QueueProcessingOrder.OldestFirst;
        config.QueueLimit = 10;
    });

    // Strict rate limit for registration endpoint (5 requests/min per IP)
    options.AddFixedWindowLimiter("IdentityRegistration", config =>
    {
        config.PermitLimit = 5;
        config.Window = TimeSpan.FromMinutes(1);
        config.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        config.QueueLimit = 0;
    });
});

// ============================================================
// Module Registration
// ============================================================

// Identity Module
var identityConnectionString = builder.Configuration.GetConnectionString("Identity")
    ?? "Data Source=sport-hub.db";

builder.Services
    .AddIdentityInfrastructure(identityConnectionString)
    .AddIdentityExternalServices(builder.Configuration)
    .AddIdentityApplication();

// Community Module — Landing Page Integration
var communityConnectionString = builder.Configuration.GetConnectionString("Community")
    ?? builder.Configuration.GetConnectionString("PostgreSQL")
    ?? "Data Source=sport-hub.db";

builder.Services
    .AddCommunityInfrastructure(communityConnectionString)
    .AddCommunityApplication();

// TODO: Register remaining modules when implemented
// builder.Services
//     .AddCommunityModule(builder.Configuration)
//     .AddEventPlanningModule(builder.Configuration)
//     .AddGamificationModule(builder.Configuration)
//     .AddLeaderboardsModule(builder.Configuration)
//     .AddPaymentsModule(builder.Configuration)
//     .AddNotificationsModule(builder.Configuration)
//     .AddIntegrationsModule(builder.Configuration);

var app = builder.Build();

// ============================================================
// Database Initialization (Development)
// ============================================================
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var identityDb = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();
    await identityDb.Database.EnsureCreatedAsync();

    var communityDb = scope.ServiceProvider.GetRequiredService<CommunityDbContext>();
    await communityDb.Database.EnsureCreatedAsync();
}

// ============================================================
// Middleware Pipeline
// ============================================================

// Error handling
app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Security
app.UseHttpsRedirection();
app.UseCors();
app.UseRateLimiter();

// Authentication & Authorization
// TODO: Configure JWT Bearer authentication with Auth0
// app.UseAuthentication();
// app.UseAuthorization();

// ============================================================
// Endpoints
// ============================================================

// Health Checks
app.MapHealthChecks("/health", new HealthCheckOptions
{
    Predicate = _ => false // Liveness: just check the process is alive
}).WithName("health");

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = _ => true // Readiness: check all dependencies
}).WithName("health-ready");

// Root info
app.MapGet("/", () => Results.Ok(new
{
    service = "SportHub Connect API",
    version = "1.0.0",
    status = "healthy",
    timestamp = DateTimeOffset.UtcNow
})).WithName("root").ExcludeFromDescription();

// Identity Endpoints
app.MapIdentityEndpoints();

// Identity Health Endpoints — Walking Skeleton
app.MapHealthEndpoints();

// Community Endpoints — Landing Page Integration
app.MapCommunityEndpoints();

app.Run();
