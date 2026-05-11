
# Azure DevOps Pipelines (Iteration 2)

Variables expected:
- `AZURE_SUBSCRIPTION` (service connection)
- `AZURE_RESOURCE_GROUP` (existing or to be created)
- `AZURE_LOCATION`
- `ACR_NAME`
- `CONTAINERAPPS_ENV`
- `KEYVAULT_NAME`
- `POSTGRES_HOST`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` (move to Key Vault asap)

## Secrets in Key Vault
Store these secrets in Key Vault and reference them in your deployments:
- `JwtPublicKey` (contents of your **public** key PEM)
- `DbPassword` (password)
- `AppInsightsConnectionString`

The sample YAML includes comments showing where to fetch secrets via `AzureKeyVault@2` or Azure CLI.
