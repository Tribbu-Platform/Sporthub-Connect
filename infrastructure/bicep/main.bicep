// ============================================================
// SportHub Connect — Azure Infrastructure (Bicep)
// Environment: Staging
// Deploy: az deployment group create --resource-group rg-sporthub-staging --template-file main.bicep --parameters parameters.staging.json
// ============================================================

targetScope = 'resourceGroup'

// ============================================================
// Parameters
// ============================================================
@description('Environment name (staging, production)')
param environmentName string

@description('Location for all resources')
param location string = resourceGroup().location

@description('PostgreSQL administrator password')
@secure()
param postgresAdminPassword string

@description('Redis SKU (family/Capacity): C0-C6 for Basic, C1-C6 for Standard, P1-P5 for Premium')
param redisSku string = 'Standard'
param redisFamily string = 'C'
param redisCapacity int = 1

@description('Container App scale limits')
param apiMinReplicas int = 0
param apiMaxReplicas int = 10
param webMinReplicas int = 0
param webMaxReplicas int = 5

@description('GHCR image tags to deploy initially')
param apiImageTag string = 'staging'
param webImageTag string = 'staging'

@description('GitHub Container Registry credentials for image pull')
@secure()
param ghcrUsername string = ''
@secure()
param ghcrPassword string = ''

@description('Auth0 configuration')
@secure()
param auth0Domain string = ''
@secure()
param auth0Audience string = ''
@secure()
param auth0ClientId string = ''
@secure()
param auth0ClientSecret string = ''

@description('Connection strings (overrides for managed services)')
param postgresConnectionStringOverride string = ''
param redisConnectionStringOverride string = ''
param serviceBusConnectionStringOverride string = ''

@description('Next.js public API URL for web frontend')
param nextPublicApiUrl string = ''

// ============================================================
// Naming conventions
// ============================================================
var namePrefix = 'sport-${environmentName}'
var uniqueSuffix = substring(uniqueString(resourceGroup().id), 0, 6)
var tags = {
  environment: environmentName
  project: 'sport-hub-connect'
  managedBy: 'bicep'
}

// ============================================================
// Log Analytics Workspace (required by Container Apps Environment)
// ============================================================
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: 'log-${namePrefix}-${uniqueSuffix}'
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// ============================================================
// Application Insights
// ============================================================
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'appi-${namePrefix}-${uniqueSuffix}'
  location: location
  kind: 'web'
  tags: tags
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
    IngestionMode: 'LogAnalytics'
  }
}

// ============================================================
// Container Apps Environment
// ============================================================
resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: 'cae-${namePrefix}-${uniqueSuffix}'
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
    // Enable Dapr for future microservices communication
    daprAIInstrumentationKey: appInsights.properties.InstrumentationKey
  }
}

// ============================================================
// PostgreSQL Flexible Server
// ============================================================
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2022-12-01' = {
  name: 'psql-${namePrefix}-${uniqueSuffix}'
  location: location
  tags: tags
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: 'sporthub_admin'
    administratorLoginPassword: postgresAdminPassword
    version: '16'
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
}

// Allow Azure services to access PostgreSQL
resource postgresFirewallAllowAzure 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2022-12-01' = {
  parent: postgresServer
  name: 'AllowAllAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// ============================================================
// Azure Cache for Redis
// ============================================================
resource redisCache 'Microsoft.Cache/redis@2023-08-01' = {
  name: 'redis-${namePrefix}-${uniqueSuffix}'
  location: location
  tags: tags
  properties: {
    sku: {
      name: redisSku
      family: redisFamily
      capacity: redisCapacity
    }
    enableNonSslPort: false
    redisConfiguration: {
      'maxmemory-policy': 'allkeys-lru'
    }
  }
}

// ============================================================
// Service Bus Namespace (replaces RabbitMQ in cloud)
// ============================================================
resource serviceBusNamespace 'Microsoft.ServiceBus/namespaces@2022-10-01-preview' = {
  name: 'sb-${namePrefix}-${uniqueSuffix}'
  location: location
  tags: tags
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
}

// Topic for domain events (equivalent to RabbitMQ topic exchange)
resource domainEventsTopic 'Microsoft.ServiceBus/namespaces/topics@2022-10-01-preview' = {
  parent: serviceBusNamespace
  name: 'domain-events'
  properties: {
    defaultMessageTimeToLive: 'P7D'
    maxSizeInMegabytes: 1024
    requiresDuplicateDetection: false
    supportOrdering: false
  }
}

// ============================================================
// API Container App
// ============================================================
resource apiContainerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'ca-${namePrefix}-api-${uniqueSuffix}'
  location: location
  tags: tags
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 8080
        transport: 'http'
        traffic: [
          {
            latestRevision: true
            weight: 100
          }
        ]
        corsPolicy: {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
          allowedHeaders: ['*']
          exposeHeaders: ['*']
          allowCredentials: false
        }
      }
      registries: !empty(ghcrUsername) ? [
        {
          server: 'ghcr.io'
          username: ghcrUsername
          passwordSecretRef: 'ghcr-password'
        }
      ] : []
      secrets: [
        {
          name: 'ghcr-password'
          value: ghcrPassword
        }
      ]
    }
    template: {
      containers: [
        {
          image: 'ghcr.io/tribbu-platform/sporthub-connect/api:${apiImageTag}'
          name: 'api'
          env: [
            { name: 'ASPNETCORE_ENVIRONMENT', value: environmentName == 'production' ? 'Production' : 'Staging' }
            { name: 'ASPNETCORE_URLS', value: 'http://+:8080' }
            { name: 'ConnectionStrings__PostgreSQL', value: !empty(postgresConnectionStringOverride) ? postgresConnectionStringOverride : 'Host=${postgresServer.properties.fullyQualifiedDomainName};Port=5432;Database=sporthub;Username=sporthub_admin;Password=${postgresAdminPassword};SSL Mode=Require;Trust Server Certificate=true' }
            { name: 'ConnectionStrings__Redis', value: !empty(redisConnectionStringOverride) ? redisConnectionStringOverride : '${redisCache.properties.hostName}:6380,password=${redisCache.listKeys().primaryKey},ssl=True,abortConnect=False' }
            { name: 'ConnectionStrings__RabbitMQ', value: 'amqp://sporthub:placeholder@localhost:5672' }
            { name: 'Auth0__Domain', value: auth0Domain }
            { name: 'Auth0__Audience', value: auth0Audience }
            { name: 'Auth0__ClientId', value: auth0ClientId }
            { name: 'Auth0__ClientSecret', value: auth0ClientSecret }
            { name: 'ServiceBus__ConnectionString', value: !empty(serviceBusConnectionStringOverride) ? serviceBusConnectionStringOverride : sbKey.listKeys().primaryConnectionString }
            { name: 'ApplicationInsights__InstrumentationKey', value: appInsights.properties.InstrumentationKey }
            { name: 'OTEL_EXPORTER_OTLP_ENDPOINT', value: 'https://api.diagnostics.azure.com/' }
          ]
          resources: {
            cpu: json('1.0')
            memory: '2Gi'
          }
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/health'
                port: 8080
                scheme: 'HTTP'
              }
              initialDelaySeconds: 10
              periodSeconds: 15
              timeoutSeconds: 5
              failureThreshold: 5
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/health/ready'
                port: 8080
                scheme: 'HTTP'
              }
              initialDelaySeconds: 5
              periodSeconds: 10
              timeoutSeconds: 3
              failureThreshold: 3
            }
            {
              type: 'Startup'
              httpGet: {
                path: '/health'
                port: 8080
                scheme: 'HTTP'
              }
              initialDelaySeconds: 0
              periodSeconds: 5
              timeoutSeconds: 3
              failureThreshold: 30
            }
          ]
        }
      ]
      scale: {
        minReplicas: apiMinReplicas
        maxReplicas: apiMaxReplicas
        rules: [
          {
            name: 'http-scale-rule'
            http: {
              metadata: {
                concurrentRequests: '50'
              }
            }
          }
        ]
      }
    }
  }
}

// Service Bus key for connection string (already exists by default)
resource sbKey 'Microsoft.ServiceBus/namespaces/authorizationRules@2022-10-01-preview' existing = {
  parent: serviceBusNamespace
  name: 'RootManageSharedAccessKey'
}

// ============================================================
// Web (Next.js) Container App
// ============================================================
resource webContainerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'ca-${namePrefix}-web-${uniqueSuffix}'
  location: location
  tags: tags
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 3000
        transport: 'http'
        traffic: [
          {
            latestRevision: true
            weight: 100
          }
        ]
      }
      registries: !empty(ghcrUsername) ? [
        {
          server: 'ghcr.io'
          username: ghcrUsername
          passwordSecretRef: 'ghcr-password'
        }
      ] : []
      secrets: [
        {
          name: 'ghcr-password'
          value: ghcrPassword
        }
      ]
    }
    template: {
      containers: [
        {
          image: 'ghcr.io/tribbu-platform/sporthub-connect/web:${webImageTag}'
          name: 'web'
          env: [
            { name: 'NODE_ENV', value: environmentName == 'production' ? 'production' : 'production' }
            { name: 'NEXT_PUBLIC_API_URL', value: !empty(nextPublicApiUrl) ? nextPublicApiUrl : 'https://${apiContainerApp.properties.configuration.ingress.fqdn}' }
            { name: 'NEXT_TELEMETRY_DISABLED', value: '1' }
            { name: 'HOSTNAME', value: '0.0.0.0' }
            { name: 'PORT', value: '3000' }
          ]
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/api/health'
                port: 3000
                scheme: 'HTTP'
              }
              initialDelaySeconds: 10
              periodSeconds: 15
              timeoutSeconds: 5
              failureThreshold: 5
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/api/health'
                port: 3000
                scheme: 'HTTP'
              }
              initialDelaySeconds: 5
              periodSeconds: 10
              timeoutSeconds: 3
              failureThreshold: 3
            }
            {
              type: 'Startup'
              httpGet: {
                path: '/api/health'
                port: 3000
                scheme: 'HTTP'
              }
              initialDelaySeconds: 0
              periodSeconds: 5
              timeoutSeconds: 3
              failureThreshold: 30
            }
          ]
        }
      ]
      scale: {
        minReplicas: webMinReplicas
        maxReplicas: webMaxReplicas
        rules: [
          {
            name: 'http-scale-rule'
            http: {
              metadata: {
                concurrentRequests: '100'
              }
            }
          }
        ]
      }
    }
  }
}

// ============================================================
// Outputs
// ============================================================
output apiUrl string = 'https://${apiContainerApp.properties.configuration.ingress.fqdn}'
output webUrl string = 'https://${webContainerApp.properties.configuration.ingress.fqdn}'
output apiName string = apiContainerApp.name
output webName string = webContainerApp.name
output environmentName string = containerAppsEnvironment.name
output postgresHost string = postgresServer.properties.fullyQualifiedDomainName
output redisHost string = redisCache.properties.hostName
output serviceBusConnectionString string = sbKey.listKeys().primaryConnectionString
output appInsightsInstrumentationKey string = appInsights.properties.InstrumentationKey
output logAnalyticsWorkspaceId string = logAnalytics.id
