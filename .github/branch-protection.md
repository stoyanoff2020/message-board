# Branch Protection Configuration

This document outlines the recommended branch protection rules for the Message Board repository.

## Main Branch Protection

Configure the following settings for the `main` branch:

### General Settings
- ✅ Restrict pushes that create files larger than 100 MB
- ✅ Restrict pushes that create files larger than 100 MB to Git LFS

### Branch Protection Rules

#### Protect matching branches
- Branch name pattern: `main`

#### Restrict pushes that create files larger than a specified limit
- ✅ Enable
- File size limit: 100 MB

#### Require a pull request before merging
- ✅ Enable
- ✅ Require approvals: 1
- ✅ Dismiss stale reviews when new commits are pushed
- ✅ Require review from code owners (if CODEOWNERS file exists)
- ✅ Restrict reviews to users with write access
- ✅ Allow specified actors to bypass required pull requests: (none)

#### Require status checks to pass before merging
- ✅ Enable
- ✅ Require branches to be up to date before merging
- Required status checks:
  - `Code Quality & Linting`
  - `Unit & Integration Tests`
  - `Build Application`
  - `Security Scan`
  - `Docker Build & Test`
  - `End-to-End Tests`

#### Require conversation resolution before merging
- ✅ Enable

#### Require signed commits
- ✅ Enable (recommended for security)

#### Require linear history
- ✅ Enable (keeps git history clean)

#### Require deployments to succeed before merging
- ❌ Disable (unless you have staging deployments)

#### Lock branch
- ❌ Disable

#### Do not allow bypassing the above settings
- ✅ Enable
- Allow specified actors to bypass: (repository administrators only)

#### Restrict pushes that create files larger than a specified limit
- ✅ Enable
- File size limit: 100 MB

## Develop Branch Protection

Configure the following settings for the `develop` branch:

### Branch Protection Rules

#### Protect matching branches
- Branch name pattern: `develop`

#### Require a pull request before merging
- ✅ Enable
- ✅ Require approvals: 1
- ✅ Dismiss stale reviews when new commits are pushed
- ❌ Require review from code owners
- ✅ Restrict reviews to users with write access

#### Require status checks to pass before merging
- ✅ Enable
- ✅ Require branches to be up to date before merging
- Required status checks:
  - `Code Quality & Linting`
  - `Unit & Integration Tests`
  - `Build Application`
  - `Security Scan`

#### Require conversation resolution before merging
- ✅ Enable

#### Require linear history
- ✅ Enable

## Feature Branch Naming Convention

Enforce the following branch naming patterns:

- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical fixes
- `chore/*` - Maintenance tasks
- `docs/*` - Documentation updates

## Additional Recommendations

### CODEOWNERS File
Create a `.github/CODEOWNERS` file to automatically request reviews from specific team members:

```
# Global owners
* @your-username

# Frontend components
/src/components/ @frontend-team

# API routes
/src/app/api/ @backend-team

# Docker configuration
/Dockerfile @devops-team
/docker-compose*.yml @devops-team

# CI/CD workflows
/.github/workflows/ @devops-team

# Documentation
/docs/ @tech-writers
*.md @tech-writers
```

### Repository Settings

#### General
- ✅ Allow merge commits
- ✅ Allow squash merging
- ❌ Allow rebase merging (to maintain linear history)
- ✅ Always suggest updating pull request branches
- ✅ Allow auto-merge
- ✅ Automatically delete head branches

#### Security
- ✅ Enable vulnerability alerts
- ✅ Enable security updates
- ✅ Enable secret scanning
- ✅ Enable push protection for secrets

#### Integrations
- Configure SonarCloud integration
- Configure CodeQL analysis
- Configure Dependabot security updates

## Implementation Steps

1. Go to repository Settings → Branches
2. Click "Add rule" for each branch
3. Configure the settings as outlined above
4. Create the CODEOWNERS file
5. Update repository settings
6. Test the configuration with a test PR

## Monitoring and Maintenance

- Review branch protection effectiveness monthly
- Update required status checks when adding new CI jobs
- Monitor for bypass attempts and adjust permissions as needed
- Keep CODEOWNERS file updated with team changes