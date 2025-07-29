# CI/CD Documentation

This directory contains the CI/CD configuration for the Message Board application.

## Overview

The CI/CD pipeline is built using GitHub Actions and includes:

- **Continuous Integration**: Automated testing, linting, and security scanning
- **Continuous Deployment**: Automated deployment to staging and production
- **Code Quality**: SonarCloud integration and CodeQL analysis
- **Dependency Management**: Automated dependency updates with Dependabot
- **Release Management**: Automated releases with Docker image publishing

## Workflows

### 1. CI/CD Pipeline (`ci.yml`)

**Triggers**: Push to `main`/`develop`, Pull requests to `main`

**Jobs**:
- **Lint**: ESLint, Prettier, TypeScript checks
- **Test**: Unit and integration tests with coverage
- **Build**: Next.js application build
- **Security**: npm audit, Trivy vulnerability scanning
- **Docker**: Docker image build and test
- **E2E**: End-to-end tests with Playwright
- **Deploy Staging**: Deploy to staging (develop branch)
- **Deploy Production**: Deploy to production (main branch)

### 2. Code Quality (`code-quality.yml`)

**Triggers**: Push to `main`/`develop`, Pull requests to `main`

**Features**:
- ESLint with SARIF output
- SonarCloud analysis
- CodeQL security analysis
- Results uploaded to GitHub Security tab

### 3. Release Management (`release.yml`)

**Triggers**: Git tags matching `v*`

**Features**:
- Automated changelog generation
- Docker image building and publishing
- GitHub release creation
- Semantic versioning support

### 4. Dependabot Auto-merge (`dependabot-auto-merge.yml`)

**Triggers**: Dependabot pull requests

**Features**:
- Auto-approval for minor/patch updates
- Auto-merge after CI passes
- Manual review required for major updates

## Configuration Files

### Branch Protection (`branch-protection.md`)
Detailed configuration for protecting main and develop branches.

### Dependabot (`dependabot.yml`)
Automated dependency updates for:
- npm packages (weekly)
- Docker base images (weekly)
- GitHub Actions (weekly)

### Issue Templates
- Bug reports (`ISSUE_TEMPLATE/bug_report.md`)
- Feature requests (`ISSUE_TEMPLATE/feature_request.md`)

### Pull Request Template (`pull_request_template.md`)
Standardized PR template with checklists and requirements.

### Code Owners (`CODEOWNERS`)
Automatic review assignment based on file paths.

## Secrets and Variables

### Required Secrets

Set these in repository Settings → Secrets and variables → Actions:

```bash
# SonarCloud integration
SONAR_TOKEN=your_sonarcloud_token

# Code coverage (optional)
CODECOV_TOKEN=your_codecov_token

# Deployment secrets (add as needed)
STAGING_DEPLOY_KEY=your_staging_key
PRODUCTION_DEPLOY_KEY=your_production_key
```

### Environment Variables

Configure in repository Settings → Environments:

#### Staging Environment
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

#### Production Environment
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Setup Instructions

### 1. Initial Repository Setup

```bash
# Clone the repository
git clone https://github.com/your-username/message-board.git
cd message-board

# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Edit .env.local with your values
```

### 2. Configure GitHub Repository

1. **Enable GitHub Actions**:
   - Go to Settings → Actions → General
   - Allow all actions and reusable workflows

2. **Set up Branch Protection**:
   - Follow instructions in `branch-protection.md`
   - Protect `main` and `develop` branches

3. **Configure Secrets**:
   - Add required secrets in Settings → Secrets and variables

4. **Set up Environments**:
   - Create `staging` and `production` environments
   - Add environment-specific variables

### 3. SonarCloud Integration

1. **Create SonarCloud Project**:
   - Go to [SonarCloud](https://sonarcloud.io)
   - Import your GitHub repository
   - Get the project key and organization

2. **Update Configuration**:
   - Edit `sonar-project.properties`
   - Update project key and organization
   - Add `SONAR_TOKEN` secret

### 4. Dependabot Configuration

1. **Update Dependabot Config**:
   - Edit `.github/dependabot.yml`
   - Replace `your-github-username` with actual username

2. **Configure Auto-merge**:
   - Ensure branch protection allows auto-merge
   - Review auto-merge settings in workflow

### 5. Code Owners Setup

1. **Update CODEOWNERS**:
   - Edit `.github/CODEOWNERS`
   - Replace `your-github-username` with actual usernames
   - Add team members as needed

## Workflow Customization

### Adding New Environments

1. **Create Environment**:
   ```yaml
   deploy-new-env:
     name: Deploy to New Environment
     runs-on: ubuntu-latest
     needs: [lint, test, build, security, docker, e2e]
     if: github.ref == 'refs/heads/feature-branch'
     environment:
       name: new-environment
       url: https://new-env.yourdomain.com
   ```

2. **Add Environment Variables**:
   - Configure in GitHub repository settings
   - Add to workflow environment section

### Custom Deployment Steps

Replace the deployment placeholder with your specific deployment commands:

```yaml
- name: Deploy to production
  run: |
    # Example: Deploy to AWS ECS
    aws ecs update-service \
      --cluster production-cluster \
      --service message-board-service \
      --force-new-deployment
    
    # Example: Deploy to Kubernetes
    kubectl set image deployment/message-board \
      message-board=${{ steps.meta.outputs.tags }}
    
    # Example: Deploy to Docker Swarm
    docker service update \
      --image ${{ steps.meta.outputs.tags }} \
      message-board_app
```

### Adding New Quality Checks

```yaml
- name: Custom Quality Check
  run: |
    # Add your custom quality checks here
    npm run custom-lint
    npm run security-audit
    npm run performance-test
```

## Monitoring and Maintenance

### Workflow Status

Monitor workflow status in:
- Repository → Actions tab
- Pull request checks
- Branch protection status

### Quality Metrics

Track quality metrics in:
- SonarCloud dashboard
- GitHub Security tab
- Code coverage reports

### Dependency Updates

Monitor dependency updates:
- Dependabot pull requests
- Security alerts
- Outdated package notifications

## Troubleshooting

### Common Issues

1. **Workflow Failures**:
   ```bash
   # Check workflow logs
   # Fix failing tests or linting issues
   # Ensure all required secrets are set
   ```

2. **SonarCloud Issues**:
   ```bash
   # Verify SONAR_TOKEN is correct
   # Check project key and organization
   # Ensure coverage reports are generated
   ```

3. **Deployment Failures**:
   ```bash
   # Check environment variables
   # Verify deployment credentials
   # Review deployment logs
   ```

### Getting Help

- Check GitHub Actions documentation
- Review workflow logs for specific errors
- Consult SonarCloud documentation for quality issues
- Check Dependabot documentation for dependency issues

## Best Practices

1. **Keep workflows fast**: Optimize build times and test execution
2. **Use caching**: Cache dependencies and build artifacts
3. **Fail fast**: Run quick checks before expensive operations
4. **Security first**: Always scan for vulnerabilities
5. **Monitor regularly**: Review workflow performance and success rates
6. **Update dependencies**: Keep actions and tools up to date
7. **Document changes**: Update this documentation when modifying workflows