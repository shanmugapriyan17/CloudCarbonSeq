// ============================================================================
// Azure Bicep Template — Carbon Credit Monitoring System
// ============================================================================
// Provisions all Azure resources required for the system:
//   - Azure Data Lake Storage Gen2 (satellite data & processed files)
//   - Azure Machine Learning Workspace (biomass estimation models)
//   - Azure App Service (FastAPI backend + React dashboard)
//   - Azure Synapse Analytics Workspace (data warehouse)
//   - Azure Monitor / Application Insights (observability)
//   - Supporting resources (Key Vault, Storage, Log Analytics)
//
// Deploy:
//   az deployment group create \
//     --resource-group carbon-monitor-rg \
//     --template-file azure-deploy.bicep \
//     --parameters projectName=carbonseq
// ============================================================================

@description('Project name used as prefix for all resources')
param projectName string = 'carbonseq'

@description('Azure region for resources')
param location string = resourceGroup().location

@description('App Service Plan SKU')
@allowed(['B1', 'S1', 'P1v2'])
param appServiceSku string = 'B1'

@description('Administrator login for Synapse SQL')
param synapseSqlAdminLogin string = 'sqladmin'

@secure()
@description('Administrator password for Synapse SQL')
param synapseSqlAdminPassword string

// ---- Variables ----
var uniqueSuffix = uniqueString(resourceGroup().id, projectName)
var storageAccountName = '${projectName}stor${uniqueSuffix}'
var adlsAccountName = '${projectName}adls${uniqueSuffix}'
var keyVaultName = '${projectName}-kv-${uniqueSuffix}'
var appInsightsName = '${projectName}-insights'
var logAnalyticsName = '${projectName}-logs'
var appServicePlanName = '${projectName}-plan'
var appServiceName = '${projectName}-app'
var mlWorkspaceName = '${projectName}-ml'
var synapseWorkspaceName = '${projectName}-synapse'

// ============================================================================
// 1. LOG ANALYTICS WORKSPACE (for Azure Monitor)
// ============================================================================
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsName
  location: location
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 30
  }
}

// ============================================================================
// 2. APPLICATION INSIGHTS (Azure Monitor)
// ============================================================================
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
}

// ============================================================================
// 3. STORAGE ACCOUNT (for Azure ML and general storage)
// ============================================================================
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
  }
}

// ============================================================================
// 4. AZURE DATA LAKE STORAGE GEN2 (satellite data & processed files)
// ============================================================================
resource adlsAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: adlsAccountName
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    isHnsEnabled: true       // Hierarchical namespace for ADLS Gen2
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
  }
}

// ADLS containers
resource adlsRawContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  name: '${adlsAccount.name}/default/satellite-raw'
  properties: { publicAccess: 'None' }
}

resource adlsProcessedContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  name: '${adlsAccount.name}/default/satellite-processed'
  properties: { publicAccess: 'None' }
}

resource adlsFeaturesContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  name: '${adlsAccount.name}/default/features'
  properties: { publicAccess: 'None' }
}

// ============================================================================
// 5. KEY VAULT (secrets management)
// ============================================================================
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    sku: { family: 'A', name: 'standard' }
    tenantId: subscription().tenantId
    accessPolicies: []
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
  }
}

// ============================================================================
// 6. AZURE MACHINE LEARNING WORKSPACE
// ============================================================================
resource mlWorkspace 'Microsoft.MachineLearningServices/workspaces@2023-10-01' = {
  name: mlWorkspaceName
  location: location
  identity: { type: 'SystemAssigned' }
  properties: {
    friendlyName: 'Carbon Credit ML Workspace'
    description: 'ML workspace for biomass estimation and carbon prediction models'
    storageAccount: storageAccount.id
    keyVault: keyVault.id
    applicationInsights: appInsights.id
  }
}

// ML Compute cluster
resource mlCompute 'Microsoft.MachineLearningServices/workspaces/computes@2023-10-01' = {
  parent: mlWorkspace
  name: 'training-cluster'
  location: location
  properties: {
    computeType: 'AmlCompute'
    properties: {
      vmSize: 'STANDARD_DS3_V2'
      scaleSettings: {
        minNodeCount: 0
        maxNodeCount: 4
      }
    }
  }
}

// ============================================================================
// 7. APP SERVICE PLAN & WEB APP
// ============================================================================
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: appServicePlanName
  location: location
  sku: { name: appServiceSku }
  kind: 'linux'
  properties: { reserved: true }
}

resource appService 'Microsoft.Web/sites@2023-01-01' = {
  name: appServiceName
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'PYTHON|3.11'
      appSettings: [
        { name: 'APPINSIGHTS_INSTRUMENTATIONKEY', value: appInsights.properties.InstrumentationKey }
        { name: 'ADLS_ACCOUNT_NAME', value: adlsAccount.name }
        { name: 'AZURE_ML_WORKSPACE', value: mlWorkspace.name }
      ]
    }
    httpsOnly: true
  }
  identity: { type: 'SystemAssigned' }
}

// ============================================================================
// 8. AZURE SYNAPSE ANALYTICS WORKSPACE
// ============================================================================
resource synapseWorkspace 'Microsoft.Synapse/workspaces@2021-06-01' = {
  name: synapseWorkspaceName
  location: location
  identity: { type: 'SystemAssigned' }
  properties: {
    defaultDataLakeStorage: {
      accountUrl: 'https://${adlsAccount.name}.dfs.core.windows.net'
      filesystem: 'synapse'
    }
    sqlAdministratorLogin: synapseSqlAdminLogin
    sqlAdministratorLoginPassword: synapseSqlAdminPassword
  }
}

// Synapse SQL Pool (serverless is default, dedicated pool is optional)
resource synapseSqlPool 'Microsoft.Synapse/workspaces/sqlPools@2021-06-01' = {
  parent: synapseWorkspace
  name: 'carbonpool'
  location: location
  sku: { name: 'DW100c' }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
  }
}

// ============================================================================
// 9. AZURE MONITOR - Alerts
// ============================================================================
resource cpuAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: '${projectName}-high-cpu'
  location: 'global'
  properties: {
    description: 'Alert when App Service CPU exceeds 80%'
    severity: 2
    enabled: true
    scopes: [ appService.id ]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT15M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'HighCPU'
          metricName: 'CpuPercentage'
          operator: 'GreaterThan'
          threshold: 80
          timeAggregation: 'Average'
          criterionType: 'StaticThresholdCriterion'
        }
      ]
    }
  }
}

// ============================================================================
// OUTPUTS
// ============================================================================
output appServiceUrl string = 'https://${appService.properties.defaultHostName}'
output adlsEndpoint string = 'https://${adlsAccount.name}.dfs.core.windows.net'
output mlWorkspaceId string = mlWorkspace.id
output synapseEndpoint string = synapseWorkspace.properties.connectivityEndpoints.sql
output appInsightsKey string = appInsights.properties.InstrumentationKey
