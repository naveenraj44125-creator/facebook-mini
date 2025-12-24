# AWS Lightsail Automated Deployment System

A complete, production-ready deployment automation system for AWS Lightsail with GitHub Actions. Deploy LAMP, Node.js, Python, React, and NGINX applications with a single command.

## 🚀 Quick Start

### For New Projects

Create a new repository with automated deployment:

```bash
./setup-new-repo.sh
```

### For Existing Projects

Add deployment automation to your existing repository:

```bash
cd /path/to/your/repo
./integrate-lightsail-actions.sh
```

Or download and run:

```bash
curl -sL https://raw.githubusercontent.com/naveenraj44125-creator/lamp-stack-lightsail/main/integrate-lightsail-actions.sh | bash
```

## ✨ Features

### 🎯 One-Command Setup
- **Automated OIDC Configuration** - Creates IAM roles and policies automatically
- **GitHub Integration** - Sets up workflows and variables
- **Interactive Wizard** - Guides you through configuration
- **Zero Manual Steps** - Everything configured automatically

### 🛠️ Supported Application Types
- **LAMP Stack** - Apache + PHP + MySQL/PostgreSQL
- **NGINX** - Static sites and reverse proxy
- **Node.js** - Express, Next.js, NestJS, APIs
- **Python** - Flask, Django, FastAPI
- **React** - CRA, Vite, Next.js static exports
- **🐳 Docker** - Multi-container applications with Docker Compose

### 🗄️ Database Support
- **Local Installation** - MySQL or PostgreSQL on instance
- **AWS RDS Integration** - Managed database service
- **Automatic Configuration** - Connection strings and credentials
- **Migration Support** - Database initialization scripts

### 🪣 S3 Bucket Integration
- **Automatic Creation** - Buckets created if they don't exist
- **Instance Attachment** - Credentials configured automatically
- **Access Control** - Read-only or read-write permissions
- **Multiple Sizes** - 250GB, 500GB, or 1TB storage options
- **Web Interface** - Upload/download files via browser

### 🔐 Security & Authentication
- **OIDC Authentication** - No long-lived credentials needed
- **IAM Role Management** - Proper least-privilege policies
- **Firewall Configuration** - Automatic port management
- **SSL Support** - Let's Encrypt integration ready

### 📊 Monitoring & Health Checks
- **Deployment Verification** - Automatic health checks
- **Service Monitoring** - Status tracking for all services
- **Performance Metrics** - Response time and resource usage
- **Detailed Logging** - Complete deployment audit trail

## 📖 Complete Example: LAMP Stack Deployment

Let's walk through deploying a LAMP stack application from scratch.

### Step 1: Create New Repository

```bash
./setup-new-repo.sh
```

The interactive wizard will ask:

```
Repository name: my-lamp-app
Application type: 1 (LAMP Stack)
AWS Region: 1 (us-east-1)
Database: 3 (PostgreSQL)
Use RDS: y
RDS instance name: my-lamp-db
Database name: app_db
Enable bucket: y
Bucket name: my-lamp-bucket
Bucket access: 2 (read_write)
Bucket size: 1 (small - 250GB)
```

### Step 2: Automatic Setup

The script automatically:
- ✅ Creates GitHub repository
- ✅ Sets up OIDC provider in AWS
- ✅ Creates IAM role with policies
- ✅ Configures GitHub variables
- ✅ Generates deployment config
- ✅ Copies workflow files
- ✅ Pushes initial commit

### Step 3: Deployment Configuration

The generated `deployment-lamp.config.yml`:

```yaml
lightsail:
  instance_name: "my-lamp-app"
  bucket:
    enabled: true
    name: "my-lamp-bucket"
    access_level: "read_write"
    bundle_id: "small_1_0"

dependencies:
  apache:
    enabled: true
    config:
      document_root: "/var/www/html"
      enable_rewrite: true
  
  php:
    enabled: true
    version: "8.3"
    config:
      extensions:
        - "pgsql"      # PostgreSQL driver
        - "curl"       # HTTP client
        - "mbstring"   # String handling
        - "xml"        # XML support
        - "zip"        # Archive support
        - "redis"      # Redis client
      enable_composer: true
  
  postgresql:
    enabled: true
    external: true
    rds:
      database_name: "my-lamp-db"
      region: "us-east-1"
      master_database: "app_db"
  
  redis:
    enabled: true
    config:
      bind_all_interfaces: false
  
  git:
    enabled: true
  
  firewall:
    enabled: true
    config:
      allowed_ports:
        - "22"    # SSH
        - "80"    # HTTP
        - "443"   # HTTPS
```

### Step 4: Customize Dependencies

Want to add more services? Just edit the config:

```yaml
dependencies:
  # Add Memcached
  memcached:
    enabled: true
    version: "latest"
  
  # Add Docker
  docker:
    enabled: true
    config:
      enable_compose: true
  
  # Enable SSL
  ssl_certificates:
    enabled: true
    config:
      provider: "letsencrypt"
      domains:
        - "myapp.example.com"
```

### Step 5: Deploy

Push to trigger deployment:

```bash
git add .
git commit -m "Update configuration"
git push origin main
```

GitHub Actions automatically:
1. ✅ Creates Lightsail instance (if needed)
2. ✅ Installs Apache, PHP 8.3, PostgreSQL client
3. ✅ Configures Redis cache
4. ✅ Creates S3 bucket
5. ✅ Attaches bucket to instance
6. ✅ Connects to RDS database
7. ✅ Deploys application files
8. ✅ Configures firewall
9. ✅ Runs health checks

### Step 6: Access Your Application

After deployment (5-10 minutes):

```
Application: http://your-instance-ip/
Bucket Manager: http://your-instance-ip/bucket-manager.php
Health Status: http://your-instance-ip/
```

## 🔧 Dependency Selection Guide

### Available Dependencies

All dependencies are controlled by simple `enabled: true/false` flags:

#### Web Servers
```yaml
dependencies:
  apache:
    enabled: true
    version: "latest"
    config:
      document_root: "/var/www/html"
      enable_ssl: false
      enable_rewrite: true
  
  nginx:
    enabled: false  # Can't use both Apache and NGINX
    version: "latest"
    config:
      document_root: "/var/www/html"
```

#### Programming Languages
```yaml
  php:
    enabled: true
    version: "8.3"
    config:
      extensions:
        - "pgsql"      # PostgreSQL
        - "mysql"      # MySQL (if using MySQL)
        - "curl"
        - "mbstring"
        - "xml"
        - "zip"
        - "redis"
      enable_composer: true
  
  python:
    enabled: false
    version: "3.9"
    config:
      pip_packages:
        - "flask"
        - "gunicorn"
      virtual_env: true
  
  nodejs:
    enabled: false
    version: "18"
    config:
      npm_packages:
        - "pm2"
      package_manager: "npm"  # or "yarn"
```

#### Databases
```yaml
  mysql:
    enabled: false
    external: false  # true for RDS
    rds:
      database_name: "my-rds-instance"
      region: "us-east-1"
      master_database: "app_db"
  
  postgresql:
    enabled: true
    external: true  # Using RDS
    rds:
      database_name: "my-postgres-db"
      region: "us-east-1"
      master_database: "app_db"
```

#### Caching & Additional Services
```yaml
  redis:
    enabled: true
    version: "latest"
    config:
      bind_all_interfaces: false
  
  memcached:
    enabled: false
    version: "latest"
  
  docker:
    enabled: false
    version: "latest"
    config:
      enable_compose: true
```

#### System Services
```yaml
  git:
    enabled: true
    config:
      install_lfs: false
  
  firewall:
    enabled: true
    config:
      allowed_ports:
        - "22"    # SSH
        - "80"    # HTTP
        - "443"   # HTTPS
      deny_all_other: true
  
  ssl_certificates:
    enabled: false
    config:
      provider: "letsencrypt"
      domains:
        - "example.com"
```

### Common Dependency Combinations

#### LAMP Stack (Linux, Apache, MySQL, PHP)
```yaml
dependencies:
  apache: { enabled: true }
  php: { enabled: true, version: "8.3" }
  mysql: { enabled: true, external: false }
  redis: { enabled: true }
  git: { enabled: true }
  firewall: { enabled: true }
```

#### LEMP Stack (Linux, NGINX, MySQL, PHP)
```yaml
dependencies:
  nginx: { enabled: true }
  php: { enabled: true, version: "8.3" }
  mysql: { enabled: true, external: false }
  redis: { enabled: true }
  git: { enabled: true }
  firewall: { enabled: true }
```

#### Node.js API Server
```yaml
dependencies:
  nodejs: { enabled: true, version: "18" }
  postgresql: { enabled: true, external: true }
  redis: { enabled: true }
  git: { enabled: true }
  firewall: { enabled: true }
```

### Node.js Entry Point Detection

The deployment system automatically detects your Node.js application's entry point using intelligent detection:

#### Detection Priority

1. **package.json scripts** - Parses `scripts.start` or `scripts.server` for `node <file>` patterns
   ```json
   {
     "scripts": {
       "start": "node server/index.js",
       "server": "node src/app.js"
     }
   }
   ```

2. **package.json main field** - Uses the `main` field if specified
   ```json
   {
     "main": "dist/index.js"
   }
   ```

3. **Common file locations** - Checks in order:
   - `server/index.js`
   - `src/index.js`
   - `server.js`
   - `app.js`
   - `index.js`

#### ES Modules Support

Projects using ES modules (`"type": "module"` in package.json) are fully supported:

- PM2 ecosystem config automatically uses `.cjs` extension
- Entry point detection works with both CommonJS and ES module projects
- No manual configuration needed

**Example ES module project:**
```json
{
  "name": "my-api",
  "type": "module",
  "scripts": {
    "start": "node server/index.js"
  }
}
```

The system will:
1. Detect `"type": "module"` in package.json
2. Create `ecosystem.config.cjs` (CommonJS for PM2)
3. Set entry point to `server/index.js` from scripts
4. Start the app correctly with PM2

#### Python Web Application
```yaml
dependencies:
  python: { enabled: true, version: "3.9" }
  nginx: { enabled: true }
  postgresql: { enabled: true, external: true }
  redis: { enabled: true }
  git: { enabled: true }
  firewall: { enabled: true }
```

#### Static Site (React/Vue/Angular)
```yaml
dependencies:
  nginx: { enabled: true }
  nodejs: { enabled: true }  # For build process
  git: { enabled: true }
  firewall: { enabled: true }
```

## 📁 Project Structure

```
lamp-stack-lightsail/
├── 🔧 Setup Scripts
│   ├── setup-new-repo.sh              # Create new repository with deployment
│   ├── integrate-lightsail-actions.sh # Add to existing repository
│   └── setup-github-oidc.sh           # Manual OIDC setup (if needed)
│
├── 📋 Configuration
│   ├── deployment-lamp-stack.config.yml
│   ├── deployment-nginx.config.yml
│   ├── deployment-nodejs.config.yml
│   ├── deployment-python.config.yml
│   └── deployment-react.config.yml
│
├── 🤖 GitHub Actions Workflows
│   └── .github/workflows/
│       ├── deploy-generic-reusable.yml  # Main deployment engine
│       └── aws-deploy.yml               # Workflow trigger
│
├── 🐍 Deployment Automation
│   └── workflows/
│       ├── config_loader.py             # Configuration parser
│       ├── dependency_manager.py        # Service installation
│       ├── deploy-pre-steps-generic.py  # Pre-deployment tasks
│       ├── deploy-post-steps-generic.py # Post-deployment tasks
│       ├── deployment_monitor.py        # Health checks
│       ├── lightsail_common.py          # Lightsail operations
│       ├── lightsail_rds.py             # RDS integration
│       ├── lightsail_bucket.py          # S3 bucket management
│       └── view_command_log.py          # Logging utilities
│
├── 📱 Example Applications
│   ├── example-lamp-app/
│   │   ├── index.php
│   │   ├── bucket-manager.php           # S3 file manager
│   │   ├── bucket-demo.php              # S3 usage examples
│   │   ├── config/database.php
│   │   └── config/cache.php
│   ├── example-nginx-app/
│   ├── example-nodejs-app/
│   ├── example-python-app/
│   ├── example-react-app/
│   ├── example-social-media-app/        # Employee Social Network
│   │   ├── server.js                   # Root entry point (deployment fix)
│   │   ├── backend/server.js           # Main Express server
│   │   ├── frontend/                   # React-like interface
│   │   └── database/                   # SQLite database
│   ├── 🐳 example-docker-app/           # Basic Docker LAMP stack
│   └── 🐳 example-recipe-docker-app/    # Recipe Manager with S3
│
└── 📚 Documentation
    ├── README.md                        # This file
    ├── INTEGRATION-GUIDE.md             # Integration documentation
    ├── BUCKET-INTEGRATION.md            # S3 bucket guide
    ├── DOCKER-DEPLOYMENT-GUIDE.md       # Docker deployment guide
    ├── DOCKER-EXAMPLES-GUIDE.md         # Docker examples comparison
    ├── GITHUB-ACTIONS-OIDC-GUIDE.md     # OIDC setup guide
    └── REUSABLE_WORKFLOWS.md            # Workflow documentation
```

## 🔄 Deployment Process

### Automatic Deployment Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Push to GitHub (main branch)                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. GitHub Actions Triggered                                │
│     • Checkout code                                         │
│     • Configure AWS credentials (OIDC)                      │
│     • Load deployment configuration                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Pre-Deployment Steps                                    │
│     • Update system packages                                │
│     • Install dependencies (Apache, PHP, etc.)              │
│     • Configure services                                    │
│     • Set up database connections                           │
│     • Create S3 bucket (if enabled)                         │
│     • Attach bucket to instance                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Application Deployment                                  │
│     • Package application files                             │
│     • Transfer to Lightsail instance                        │
│     • Extract and set permissions                           │
│     • Create environment files                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Post-Deployment Steps                                   │
│     • Configure web server                                  │
│     • Set up database schema                                │
│     • Restart services                                      │
│     • Clear caches                                          │
│     • Optimize performance                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  6. Health Checks & Verification                            │
│     • Test HTTP endpoints                                   │
│     • Verify service status                                 │
│     • Check database connectivity                           │
│     • Validate bucket access                                │
│     • Generate deployment report                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  7. Deployment Complete ✅                                   │
│     • Application accessible                                │
│     • Monitoring active                                     │
│     • Logs available in GitHub Actions                      │
└─────────────────────────────────────────────────────────────┘
```

## 🪣 S3 Bucket Integration

### Automatic Bucket Setup

When enabled, the system automatically:
1. Creates Lightsail bucket (if doesn't exist)
2. Attaches bucket to instance with credentials
3. Configures access permissions
4. Deploys web-based file manager

### Configuration

```yaml
lightsail:
  bucket:
    enabled: true
    name: "my-app-bucket"
    access_level: "read_write"  # or "read_only"
    bundle_id: "small_1_0"      # 250GB storage
```

### Bucket Sizes

| Bundle ID | Storage | Transfer/Month | Use Case |
|-----------|---------|----------------|----------|
| small_1_0 | 250GB | 100GB | Small apps, testing |
| medium_1_0 | 500GB | 250GB | Medium apps, production |
| large_1_0 | 1TB | 500GB | Large apps, heavy usage |

## 💻 Instance Size Configuration

### Bundle ID Configuration

Control your Lightsail instance size with the `bundle_id` parameter:

```yaml
lightsail:
  instance_name: my-app-v3
  static_ip: ""
  
  # Instance size configuration (optional)
  # If not specified, defaults are: small_3_0 (2GB) for traditional apps, medium_3_0 (4GB) for Docker apps
  bundle_id: "small_3_0"  # 2GB RAM, 2 vCPU, 60GB SSD
```

### Available Instance Bundles

| Bundle ID | RAM | vCPU | Storage | Price/Month | Best For |
|-----------|-----|------|---------|-------------|----------|
| `nano_3_0` | 512MB | 1 | 20GB SSD | $3.50 | Minimal testing, development |
| `micro_3_0` | 1GB | 2 | 40GB SSD | $7.00 | Light workloads |
| `small_3_0` | 2GB | 2 | 60GB SSD | $12.00 | **Traditional apps (default)**, LAMP, Node.js |
| `medium_3_0` | 4GB | 2 | 80GB SSD | $24.00 | **Docker apps (default)**, heavy workloads |
| `large_3_0` | 8GB | 2 | 160GB SSD | $44.00 | High-traffic applications |
| `xlarge_3_0` | 16GB | 4 | 320GB SSD | $88.00 | Enterprise applications |
| `2xlarge_3_0` | 32GB | 8 | 640GB SSD | $176.00 | Large-scale production |

### Automatic Bundle Selection

If you don't specify `bundle_id`, the system automatically chooses:

- **Docker deployments**: `medium_3_0` (4GB RAM for better performance)
- **Traditional deployments**: `small_3_0` (2GB RAM for good performance)

### Docker Requirements

⚠️ **Important**: Docker deployments require **minimum 2GB RAM** (`small_3_0` or larger)

The system will **automatically block deployment** if you try to deploy Docker to an instance with insufficient RAM to prevent freezing.

### Configuration Examples

**Static Site (Nginx):**
```yaml
lightsail:
  bundle_id: "small_3_0"  # 2GB - Good performance for static content
```

**LAMP Stack:**
```yaml
lightsail:
  bundle_id: "small_3_0"  # 2GB - Good for Apache + PHP + Database
```

**Docker Application:**
```yaml
lightsail:
  bundle_id: "medium_3_0"  # 4GB - Better performance for Docker
```

**High-Traffic Production:**
```yaml
lightsail:
  bundle_id: "large_3_0"  # 8GB - High performance under load
```

### Using the Bucket

**Web Interface:**
- Upload files: `http://your-ip/bucket-manager.php`
- View examples: `http://your-ip/bucket-demo.php`

**AWS CLI:**
```bash
# List files
aws s3 ls s3://my-app-bucket/

# Upload file
aws s3 cp file.txt s3://my-app-bucket/

# Download file
aws s3 cp s3://my-app-bucket/file.txt ./
```

**PHP Code:**
```php
use Aws\S3\S3Client;

$s3 = new S3Client([
    'version' => 'latest',
    'region'  => 'us-east-1'
]);

// Upload
$s3->putObject([
    'Bucket' => 'my-app-bucket',
    'Key'    => 'uploads/photo.jpg',
    'Body'   => fopen('photo.jpg', 'r')
]);
```

## 🔐 AWS Authentication (OIDC)

### Automatic Setup

Both `setup-new-repo.sh` and `integrate-lightsail-actions.sh` automatically:

1. **Create OIDC Provider** (if doesn't exist)
   ```
   URL: token.actions.githubusercontent.com
   Audience: sts.amazonaws.com
   ```

2. **Create IAM Role**
   ```
   Name: GitHubActionsRole-{instance-name}
   Trust: repo:{owner}/{repo}:ref:refs/heads/main
   ```

3. **Attach Policies**
   - `ReadOnlyAccess` (AWS managed)
   - Custom Lightsail policy (full access)

4. **Set GitHub Variable**
   ```
   AWS_ROLE_ARN: arn:aws:iam::123456789:role/GitHubActionsRole-...
   ```

### Manual Setup (if needed)

If automatic setup fails, run:

```bash
./setup-github-oidc.sh
```

Or follow: [GITHUB-ACTIONS-OIDC-GUIDE.md](GITHUB-ACTIONS-OIDC-GUIDE.md)

## 🔍 Monitoring & Troubleshooting

### View Deployment Logs

1. Go to GitHub repository
2. Click "Actions" tab
3. Select latest workflow run
4. View step-by-step logs

### Check Instance Status

```bash
# SSH into instance
ssh ubuntu@your-instance-ip

# Check service status
sudo systemctl status apache2
sudo systemctl status redis-server

# View logs
sudo tail -f /var/log/apache2/error.log
```

### Verify Bucket Integration

```bash
# On the instance
./verify-bucket-integration.sh
```

### Common Issues

**Deployment fails with "Access Denied"**
- Check AWS_ROLE_ARN is set in GitHub variables
- Verify IAM role has proper permissions
- Ensure trust policy includes your repository

**Database connection fails**
- Verify RDS instance is running
- Check security group allows connections
- Confirm DB credentials in GitHub secrets

**Bucket operations fail**
- Verify bucket is attached to instance
- Check access level (read_only vs read_write)
- Ensure AWS CLI is installed on instance

## 📊 Comparison: setup-new-repo.sh vs integrate-lightsail-actions.sh

| Feature | setup-new-repo.sh | integrate-lightsail-actions.sh |
|---------|-------------------|--------------------------------|
| **Use Case** | Create new repository | Add to existing repository |
| **Git Init** | ✅ Creates new repo | ❌ Uses existing |
| **GitHub Repo** | ✅ Creates on GitHub | ❌ Uses existing |
| **Example App** | ✅ Includes sample code | ❌ Uses your code |
| **Workflows** | ✅ Copies from template | ✅ Downloads/copies |
| **Config** | ✅ Generates | ✅ Generates |
| **OIDC Setup** | ✅ Automatic | ✅ Automatic |
| **GitHub Variables** | ✅ Sets automatically | ✅ Sets automatically |
| **Initial Push** | ✅ Pushes to GitHub | ❌ You push manually |
| **Best For** | Starting from scratch | Existing projects |

Both scripts provide identical deployment capabilities!

## 🎓 Advanced Usage

### Custom Environment Variables

```yaml
application:
  environment_variables:
    APP_ENV: production
    API_KEY: "your-key"
    CACHE_DRIVER: redis
    SESSION_LIFETIME: 120
```

### Multiple Environments

Create separate configs:
- `deployment-staging.config.yml`
- `deployment-production.config.yml`

Update workflow to use different configs per branch.

### Custom Deployment Steps

```yaml
deployment:
  steps:
    post_deployment:
      common:
        enabled: true
        verify_extraction: true
        create_env_file: true
        cleanup_temp_files: true
      dependencies:
        enabled: true
        configure_application: true
        set_permissions: true
        restart_services: true
```

### Health Check Configuration

```yaml
monitoring:
  health_check:
    endpoint: "/health"
    expected_content: "OK"
    max_attempts: 10
    wait_between_attempts: 10
```

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - Feel free to use and modify for your projects.

## 🆘 Support

- **Documentation**: See guides in repository
- **Issues**: [GitHub Issues](https://github.com/naveenraj44125-creator/lamp-stack-lightsail/issues)
- **Examples**: Check `example-*-app` directories

## 🐳 Docker Deployment Examples

Two complete Docker examples demonstrating containerized deployments:

### 1. Basic Docker LAMP Stack (`example-docker-app/`)
**Perfect for learning Docker basics**

- Multi-container architecture (Apache, MySQL, Redis, phpMyAdmin)
- Service health monitoring dashboard
- Container networking demonstration
- Persistent data volumes
- Quick deployment testing

```bash
cd example-docker-app
docker-compose up -d
open http://localhost
```

### 2. Recipe Manager with S3 (`example-recipe-docker-app/`)
**Production-ready application with AWS integration**

- Complete recipe management system
- Admin panel with authentication
- Image upload to AWS Lightsail buckets
- RESTful API with CRUD operations
- Session management with Redis
- Responsive modern UI

```bash
cd example-recipe-docker-app
cp .env.example .env
# Edit .env with your bucket name
docker-compose up -d
open http://localhost
open http://localhost/admin/  # admin/admin123
```

**Features Demonstrated**:
- ✅ Docker Compose orchestration
- ✅ AWS S3 bucket integration
- ✅ File upload handling
- ✅ Database relationships
- ✅ Authentication & sessions
- ✅ RESTful API design
- ✅ Production deployment patterns

**Deployment**: Use `deployment-docker.config.yml` or `deployment-recipe-docker.config.yml`

### 🚨 Important: Instance Size Requirements

Docker requires **minimum 2GB RAM** to operate reliably. The deployment system automatically:
- ✅ Validates instance size before deployment
- ✅ Creates instances with appropriate bundle size (small_3_0 for Docker)
- ✅ Blocks deployment on undersized instances to prevent freezing
- ✅ Displays helpful error messages with upgrade instructions

**Recommended bundles for Docker:**
- `small_3_0` - 2GB RAM, $12/month (minimum)
- `medium_3_0` - 4GB RAM, $24/month (recommended)
- `large_3_0` - 8GB RAM, $44/month (production)

### ⚡ Pre-Built Images (Optional)

Speed up deployments by building images on GitHub Actions instead of Lightsail:

**Benefits:**
- 85% faster deployments (3-4 minutes vs 20+ minutes)
- Build on powerful GitHub runners (8GB RAM) instead of Lightsail
- No timeout issues
- Layer caching for faster subsequent builds

**Setup:**
1. Create Docker Hub account (free): https://hub.docker.com/
2. Generate access token: Account Settings → Security → New Access Token
3. Add GitHub secrets:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub access token
4. Push code - workflow automatically builds and pushes images

**How it works:**
```
GitHub Actions (fast) → Build image → Push to Docker Hub
                                           ↓
Lightsail (fast) → Pull pre-built image → Start containers
```

**Without pre-built images:** Lightsail builds locally (slower but still works)

---

## 🎉 Success Stories

This system successfully deploys:
- ✅ LAMP applications with PostgreSQL RDS
- ✅ Node.js APIs with Redis caching
- ✅ Python web apps with S3 storage
- ✅ React SPAs with NGINX
- ✅ Multi-service applications with Docker
- ✅ Containerized apps with S3 integration

Ready to deploy? Run `./setup-new-repo.sh` or `./integrate-lightsail-actions.sh` now! 🚀

---

## 📚 Additional Documentation

### Integration Guide

For detailed integration instructions, see the sections above or use the integration script:

```bash
./integrate-lightsail-actions.sh
```

The script automatically adds all necessary workflows, configurations, and documentation to your repository.

### Reusable Workflows

This repository provides reusable GitHub Actions workflows that can be used across multiple repositories.

#### Using Reusable Workflow

```yaml
name: Deploy Application

on:
  push:
    branches: [main]

jobs:
  deploy:
    uses: YOUR-USERNAME/YOUR-REPO/.github/workflows/deploy-generic-reusable.yml@main
    with:
      config_file: 'deployment-generic.config.yml'
    secrets:
      AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

#### Workflow Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `config_file` | No | `deployment-generic.config.yml` | Path to deployment config |
| `aws_region` | No | (from config) | AWS region override |
| `instance_name` | No | (from config) | Instance name override |
| `skip_tests` | No | `false` | Skip test execution |
| `environment` | No | - | GitHub environment name |

#### Multi-Environment Example

```yaml
jobs:
  deploy-staging:
    if: github.ref == 'refs/heads/staging'
    uses: YOUR-USERNAME/YOUR-REPO/.github/workflows/deploy-generic-reusable.yml@main
    with:
      config_file: 'deployment-staging.config.yml'
      environment: 'staging'
  
  deploy-production:
    if: github.ref == 'refs/heads/main'
    uses: YOUR-USERNAME/YOUR-REPO/.github/workflows/deploy-generic-reusable.yml@main
    with:
      config_file: 'deployment-production.config.yml'
      environment: 'production'
```

### GitHub Actions OIDC Authentication

The system uses OpenID Connect (OIDC) for secure authentication between GitHub Actions and AWS, eliminating the need for long-lived credentials.

#### How OIDC Works

1. GitHub generates a JWT token when workflow runs
2. Workflow exchanges token with AWS STS
3. AWS validates token against OIDC provider
4. AWS returns temporary credentials (~1 hour)
5. Workflow uses credentials to access AWS services

#### Automatic OIDC Setup

Both setup scripts automatically configure OIDC:

1. **Create OIDC Provider** (if doesn't exist)
   - URL: `token.actions.githubusercontent.com`
   - Audience: `sts.amazonaws.com`

2. **Create IAM Role**
   - Name: `GitHubActionsRole-{instance-name}`
   - Trust: Only allows authentication from `main` branch

3. **Attach Policies**
   - `ReadOnlyAccess` (AWS managed)
   - Custom Lightsail policy (full access)

4. **Set GitHub Variable**
   - `AWS_ROLE_ARN`: Role ARN for authentication

#### Benefits

- ✅ No stored AWS credentials in GitHub
- ✅ Short-lived tokens (expire after ~1 hour)
- ✅ Better security with branch restrictions
- ✅ Audit trail in CloudTrail
- ✅ Fine-grained access control

#### Manual OIDC Setup

If automatic setup fails:

```bash
./setup-github-oidc.sh
```

#### Trust Policy Configuration

**Allow only main branch:**
```json
"token.actions.githubusercontent.com:sub": "repo:owner/repo:ref:refs/heads/main"
```

**Allow specific environment:**
```json
"token.actions.githubusercontent.com:sub": "repo:owner/repo:environment:production"
```

**Allow any branch:**
```json
"token.actions.githubusercontent.com:sub": "repo:owner/repo:*"
```

#### Troubleshooting OIDC

**Authentication fails:**
- Verify trust policy has correct repository name
- Check OIDC provider exists in AWS
- Ensure `permissions: id-token: write` is in workflow
- Confirm role ARN is correct

**Missing permissions:**
- Check IAM policies attached to role
- Verify policy allows required actions
- Review CloudTrail logs for denied actions

### Lightsail Bucket Integration

Complete S3-compatible object storage integration with automatic setup and web-based management.

#### Bucket Features

- **Automatic Creation** - Buckets created if they don't exist
- **Instance Attachment** - Credentials configured automatically
- **Access Control** - Read-only or read-write permissions
- **Multiple Sizes** - 250GB, 500GB, or 1TB storage
- **Web Interface** - Upload/download files via browser

#### Configuration

```yaml
lightsail:
  bucket:
    enabled: true
    name: "my-app-bucket"
    access_level: "read_write"  # or "read_only"
    bundle_id: "small_1_0"      # 250GB storage
```

#### Bucket Sizes and Pricing

| Bundle ID | Storage | Transfer/Month | Monthly Cost | Use Case |
|-----------|---------|----------------|--------------|----------|
| small_1_0 | 250GB | 100GB | $3 | Small apps, testing |
| medium_1_0 | 500GB | 250GB | $5 | Medium apps, production |
| large_1_0 | 1TB | 500GB | $10 | Large apps, heavy usage |

#### Using Buckets

**Web Interface:**
```
Upload files: http://your-ip/bucket-manager.php
View examples: http://your-ip/bucket-demo.php
```

**AWS CLI:**
```bash
# List files
aws s3 ls s3://my-app-bucket/

# Upload file
aws s3 cp file.txt s3://my-app-bucket/

# Download file
aws s3 cp s3://my-app-bucket/file.txt ./
```

**PHP with AWS SDK:**
```php
use Aws\S3\S3Client;

$s3 = new S3Client([
    'version' => 'latest',
    'region'  => 'us-east-1'
]);

// Upload
$s3->putObject([
    'Bucket' => 'my-app-bucket',
    'Key'    => 'uploads/photo.jpg',
    'Body'   => fopen('photo.jpg', 'r')
]);

// Download
$result = $s3->getObject([
    'Bucket' => 'my-app-bucket',
    'Key'    => 'uploads/photo.jpg'
]);
```

#### Common Use Cases

1. **User File Uploads** - Store user-uploaded images, documents
2. **Database Backups** - Automated backup storage
3. **Static Assets** - CDN-style asset delivery
4. **Log Archival** - Long-term log storage
5. **Media Storage** - Video and audio files

#### Security Best Practices

- Use read-only access when possible
- Implement file type validation
- Set up lifecycle policies for old files
- Monitor bucket usage and costs
- Use signed URLs for temporary access

#### Deployment Flow

```
1. GitHub Actions reads bucket config
2. Check if bucket exists
3. Create bucket if missing (with tags)
4. Wait for bucket to be active
5. Attach bucket to instance
6. Configure access permissions (read-only or read-write)
7. Deploy bucket manager interface
8. Verify bucket access
```

#### Monitoring Bucket Setup

Check GitHub Actions logs for:
```
🪣 Setting up Lightsail bucket...
📦 Creating Lightsail bucket: my-app-bucket
✅ Bucket created successfully
🔗 Attaching bucket to instance...
✅ Instance access configured
✅ Bucket Setup Complete
```

---

## 🔧 Troubleshooting

### Common Issues

#### Deployment Fails

1. **Check GitHub Actions logs**
   - Go to Actions tab
   - Click on failed workflow
   - Review step-by-step logs

2. **Verify AWS credentials**
   - Ensure AWS_ROLE_ARN is set
   - Check IAM role permissions
   - Verify trust policy

3. **Check instance status**
   - Log into AWS Lightsail console
   - Verify instance is running
   - Check firewall rules

#### Connection Issues

```bash
# SSH into instance
ssh ubuntu@<instance-ip>

# Check service status
sudo systemctl status apache2  # or nginx, pm2, etc.

# View logs
sudo tail -f /var/log/apache2/error.log
```

#### Database Connection Fails

1. Verify RDS instance is running
2. Check security group rules
3. Verify database credentials in GitHub secrets
4. Test connection from instance

#### Bucket Operations Fail

1. Verify bucket is attached to instance
2. Check access level (read_only vs read_write)
3. Ensure AWS CLI is installed on instance
4. Test with: `aws s3 ls s3://bucket-name/`

#### Docker Deployment Issues

**Instance freezes during build:**
- Instance too small (needs minimum 2GB RAM)
- Upgrade to `small_3_0` or larger bundle
- Use pre-built images from Docker Hub

**Build timeout:**
- Enable pre-built images
- Build on GitHub Actions instead of Lightsail
- Use layer caching

**Container won't start:**
- Check logs: `docker-compose logs`
- Verify environment variables
- Check port conflicts

#### Node.js ES Module Issues

**Error: "require is not defined in ES module scope"**
- Your project has `"type": "module"` in package.json
- The deployment system now handles this automatically
- If using an older deployment, redeploy to get the fix

**App shows "online" in PM2 but port not listening:**
- Check PM2 logs: `pm2 logs --lines 50`
- Verify entry point is correct: `pm2 show nodejs-app`
- The entry point should match your package.json scripts

**Wrong entry point detected:**
- Add explicit `"main"` field to package.json
- Or ensure `scripts.start` has `node <your-file.js>` pattern
- Supported patterns: `server/index.js`, `src/index.js`, `server.js`, `app.js`, `index.js`

### Verification Steps

1. **Check OIDC Provider**:
   ```bash
   aws iam list-open-id-connect-providers
   ```

2. **Verify Role Trust Policy**:
   ```bash
   aws iam get-role --role-name GitHubActionsRole
   ```

3. **Test AWS Access**:
   ```yaml
   - name: Test AWS Access
     run: |
       aws sts get-caller-identity
       aws lightsail get-regions
   ```

4. **Verify Bucket Integration**:
   ```bash
   # On the instance
   ./verify-bucket-integration.sh
   ```

---

## 🤖 MCP Server Integration

Use AI assistants (Claude, Kiro, etc.) to manage Lightsail deployments through the Model Context Protocol server.

### Option 1: Deploy on Lightsail (Recommended for Teams)

Run the MCP server on your Lightsail instance for remote access:

```bash
cd mcp-server-new
./deploy-to-lightsail.sh your-instance-ip
```

Benefits:
- ✅ No local installation needed
- ✅ Centralized for entire team
- ✅ Always available
- ✅ Secure with token authentication

Client configuration:
```json
{
  "mcpServers": {
    "lightsail-deployment": {
      "url": "http://your-instance-ip:3000/sse",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}
```

See [mcp-server-new/README.md](mcp-server-new/README.md) for complete guide.

### Option 2: Local with NPX (Zero Install)

Add to your MCP client config:

```json
{
  "mcpServers": {
    "lightsail-deployment": {
      "command": "npx",
      "args": ["-y", "lightsail-deployment-mcp"]
    }
  }
}
```

### Option 3: Global Install

```bash
npm install -g lightsail-deployment-mcp
```

Then configure:
```json
{
  "mcpServers": {
    "lightsail-deployment": {
      "command": "lightsail-deployment-mcp"
    }
  }
}
```

### Available AI Commands

- **"Create a new Node.js app deployed to Lightsail"** - Sets up complete repository
- **"Add Lightsail deployment to my existing repo"** - Integrates with existing projects
- **"Generate a deployment config for Python with Redis"** - Creates configuration files
- **"Set up OIDC for my repository"** - Configures AWS authentication
- **"Check my deployment status"** - Monitors workflow runs
- **"What example applications are available?"** - Lists templates
- **"Diagnose my deployment setup"** - Troubleshoots issues automatically

### Documentation

- [Complete Guide](mcp-server-new/README.md) - Full documentation
- [Integration Guide](mcp-server-new/CLINE-INTEGRATION-GUIDE.md) - Cline/Claude setup
- [Examples](mcp-server-new/EXAMPLES.md) - Usage examples

---

## 📖 Additional Resources

- [AWS Lightsail Documentation](https://docs.aws.amazon.com/lightsail/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [AWS SDK for PHP](https://docs.aws.amazon.com/sdk-for-php/)
- [GitHub OIDC Guide](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [Model Context Protocol](https://modelcontextprotocol.io/)
