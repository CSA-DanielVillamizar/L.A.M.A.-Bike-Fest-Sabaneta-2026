# Deployment Plan

## Status

Awaiting Approval

## Project

L.A.M.A. Bike Fest Sabaneta 2026

## Deployment Mode

MODIFY existing Next.js application for Azure deployment

## Azure Context

- Subscription: Patrocinio de Microsoft Azure (`a90e8a4a-74dd-4f34-bd61-24e59885a3ac`)
- Tenant: Default Directory (`msazdanielvillamizaroutl822.onmicrosoft.com`)
- Resource Group: `RG-ANIVERSARIOMED2026-PROD`
- Primary Region: `East US 2`

## Requirements

- Keep infrastructure at free or minimum practical cost
- Deploy the public site on Azure Static Web Apps
- Persist registrations in Azure SQL Database
- Preserve the current Next.js App Router application and Prisma data model
- Keep the deployment reproducible with infrastructure and app configuration in the repo

## Current Workspace Assessment

- Next.js 16 application with App Router
- API routes implemented under `src/app/api/register/*`
- Prisma configured for SQL Server
- `.env` still contains a placeholder `DATABASE_URL`
- `swa-cli.config.json` exists for local emulation
- `azure.yaml` and `infra/` do not exist yet

## Proposed Architecture

- Resource Group: `RG-ANIVERSARIOMED2026-PROD`
- Web hosting: Azure Static Web Apps, SKU `Free`
- Database server: Azure SQL logical server in `East US 2`
- Database: Azure SQL single database using the lowest practical cost SKU available in region
- App configuration: Static Web App application settings with `DATABASE_URL`
- Source deployment path: Azure Developer CLI (`azd`) with repo-based infrastructure

## Cost Strategy

- Use Azure Static Web Apps `Free`
- Reuse one resource group for all production resources
- Use the smallest Azure SQL option that supports the app reliably
- Do not add paid extras such as Front Door, Key Vault, Application Insights, or App Service unless required later

## Constraint Identified

- Azure SQL Database is not a permanently free resource in this architecture. It can still be deployed at minimum cost, but it will consume Azure credits or billable usage.

## Planned Artifacts

- `azure.yaml`
- `infra/` Bicep templates for Static Web Apps and Azure SQL resources
- Environment and deployment configuration updates needed for Azure

## Execution Steps

1. Prepare Azure deployment artifacts for the existing Next.js app
2. Add `azure.yaml` for `azd`
3. Add `infra/` with resource group scoped Bicep for Static Web App and Azure SQL
4. Configure deployment parameters for `East US 2`
5. Update plan status to `Ready for Validation`
6. Run Azure validation before any provisioning
7. Provision and deploy after validation approval

## Approval Request

Approve this plan to let me generate the Azure deployment files. Provisioning will happen only after validation and your next confirmation.
