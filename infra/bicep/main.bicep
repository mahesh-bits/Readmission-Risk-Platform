
param namePrefix string = 'rrm'
param location string = resourceGroup().location

var acrName = toLower(format('{0}acr', namePrefix))
var laName = format('{0}-law', namePrefix)
var aiName = format('{0}-appi', namePrefix)
var kvName = toLower(format('{0}-kv', namePrefix))
var pgName = toLower(format('{0}-pg', namePrefix))
var envName = format('{0}-cae', namePrefix)

// Log Analytics
resource law 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: laName
  location: location
  properties: { retentionInDays: 30 }
}

// App Insights
resource appi 'microsoft.insights/components@2020-02-02' = {
  name: aiName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: law.id
  }
}

// Key Vault
resource kv 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: kvName
  location: location
  properties: {
    enabledForDeployment: true
    enableSoftDelete: true
    tenantId: subscription().tenantId
    sku: { name: 'standard', family: 'A' }
    accessPolicies: [] // assign later via RBAC
    publicNetworkAccess: 'Enabled'
  }
}

// ACR
resource acr 'Microsoft.ContainerRegistry/registries@2023-06-01-preview' = {
  name: acrName
  location: location
  sku: { name: 'Basic' }
  properties: { adminUserEnabled: true }
}

// Container Apps Env
resource cae 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: envName
  location: location
  properties: {
    appLogsConfiguration: { destination: 'log-analytics', logAnalyticsConfiguration: { customerId: law.properties.customerId, sharedKey: law.listKeys().primarySharedKey } }
  }
}

// PostgreSQL Flexible Server
resource pg 'Microsoft.DBforPostgreSQL/flexibleServers@2023-03-01-preview' = {
  name: pgName
  location: location
  sku: { name: 'Standard_B1ms', tier: 'Burstable', capacity: 1 }
  properties: {
    administratorLogin: 'appadmin'
    administratorLoginPassword: 'ChangeMe123!'
    version: '16'
    network: { publicNetworkAccess: 'Enabled' }
    storage: { storageSizeGB: 64 }
  }
}

output appInsightsConnectionString string = appi.properties.ConnectionString
output keyVaultName string = kvName
output acrLoginServer string = acr.properties.loginServer
output containerAppsEnvName string = envName
