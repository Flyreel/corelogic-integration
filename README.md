# CoreLogic Integration

A TypeScript repo contains all CoreLogic integration logics.

## Prerequisites

**Install Serverless Framework via npm:**

```bash
npm install -g serverless
```

**Set Credentials:**

_Configure a GCP project and service account if one does not already exist:_

- Select your GCP project.
- Create an IAM member with at least a minimum set of roles: `Deployment Manager Editor`, `Storage Admin`, `Logging Admin`, `Cloud Functions Developer` and any others needed for your resources.
- Create a service account for your project.
- Create, download and save private_key.json. You will use it as your credentials in the serverless.yml.

Credentials are stored in **1Password** for existing projects.

## Environments Variables

| Variable    | Usage                                                    |
| ----------- | -------------------------------------------------------- |
| SLS_STAGE   | Serverless Stage, valid parameters are `dev` and `prod`. |
| GCP_PROJECT | Project ID to deploy to.                                 |
| GCP_REGION  | Region to deploy to.                                     |

## Serverless CLI

### Deploy

```bash
npm i
sls deploy
```

### Remove a deployment

```bash
sls remove
```
