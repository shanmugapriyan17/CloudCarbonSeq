@description('Project name used as prefix for all resources')
param projectName string = 'carbonseq'

@description('Azure region for resources')
param location string = resourceGroup().location

@description('App Service Plan SKU')
@allowed(['F1', 'B1', 'S1', 'P1v2'])
param appServiceSku string = 'F1'

var uniqueSuffix = uniqueString(resourceGroup().id, projectName)
var appServicePlanName = '${projectName}-plan-${uniqueSuffix}'
var appServiceName = '${projectName}-app-${uniqueSuffix}'

// 1. APP SERVICE PLAN
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: appServicePlanName
  location: location
  sku: { name: appServiceSku }
  kind: 'linux'
  properties: { reserved: true }
}

// 2. APP SERVICE (Web App & API Backend)
resource appService 'Microsoft.Web/sites@2023-01-01' = {
  name: appServiceName
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'PYTHON|3.11'
      appSettings: [
        { name: 'SCM_DO_BUILD_DURING_DEPLOYMENT', value: '1' }
      ]
    }
    httpsOnly: true
  }
}

// OUTPUTS
output appServiceUrl string = 'https://${appService.properties.defaultHostName}'
output appServiceName string = appService.name
