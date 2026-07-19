-- Identity Schema Migration
CREATE SCHEMA IF NOT EXISTS identity;

-- Migration History table
CREATE TABLE IF NOT EXISTS identity."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

-- HealthChecks table
CREATE TABLE IF NOT EXISTS identity.health_checks (
    id uuid NOT NULL,
    service_name character varying(200) NOT NULL,
    status character varying(50) NOT NULL,
    checked_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT "PK_health_checks" PRIMARY KEY (id)
);

-- Record migration
INSERT INTO identity."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260719012743_InitialCreate', '10.0.10')
ON CONFLICT ("MigrationId") DO NOTHING;
