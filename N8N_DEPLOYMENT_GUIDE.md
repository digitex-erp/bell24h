# 🚀 N8N Server Deployment Guide for Bell24h
## Complete Production Setup & Configuration

---

## 🎯 **RECOMMENDED SERVER ARCHITECTURE**

### **Option 1: DigitalOcean Droplet (Recommended)**
```yaml
Specifications:
  - CPU: 2-4 cores
  - RAM: 4-8 GB
  - Storage: 50-100 GB SSD
  - OS: Ubuntu 20.04 LTS
  - Cost: $20-40/month

Benefits:
  - Easy setup and management
  - Good performance for N8N
  - Reliable uptime
  - Easy scaling
  - Good documentation
```

### **Option 2: Railway.app (Budget Option)**
```yaml
Specifications:
  - CPU: 1-2 cores
  - RAM: 2-4 GB
  - Storage: 10-20 GB
  - Cost: $5-20/month

Benefits:
  - Very affordable
  - Easy deployment
  - Automatic SSL
  - Good for development/testing
```

### **Option 3: AWS EC2 (Enterprise)**
```yaml
Specifications:
  - Instance: t3.medium
  - CPU: 2 cores
  - RAM: 4 GB
  - Storage: 30 GB EBS
  - Cost: $30-50/month

Benefits:
  - Enterprise-grade reliability
  - Advanced monitoring
  - Easy integration with other AWS services
  - High availability options
```

---

## 🔧 **STEP-BY-STEP DEPLOYMENT**

### **Phase 1: Server Setup (30 minutes)**

#### **1.1 Create Server Instance**
```bash
# For DigitalOcean
1. Go to DigitalOcean Dashboard
2. Click "Create Droplet"
3. Choose Ubuntu 20.04 LTS
4. Select 2-4 CPU, 4-8 GB RAM
5. Add SSH key
6. Create droplet

# For Railway
1. Go to Railway.app
2. Connect GitHub repository
3. Select "Deploy from GitHub"
4. Choose your Bell24h repository
5. Configure environment variables
6. Deploy
```

#### **1.2 Initial Server Configuration**
```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y curl wget git nginx certbot python3-certbot-nginx

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install N8N globally
npm install -g n8n
```

### **Phase 2: Database Setup (15 minutes)**

#### **2.1 Install PostgreSQL**
```bash
# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create N8N database and user
sudo -u postgres psql
CREATE DATABASE n8n_production;
CREATE USER n8n_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE n8n_production TO n8n_user;
\q
```

#### **2.2 Configure PostgreSQL**
```bash
# Edit PostgreSQL configuration
nano /etc/postgresql/12/main/postgresql.conf

# Add these lines:
listen_addresses = 'localhost'
port = 5432
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB

# Restart PostgreSQL
systemctl restart postgresql
```

### **Phase 3: N8N Configuration (20 minutes)**

#### **3.1 Create N8N User and Directory**
```bash
# Create N8N user
useradd -m -s /bin/bash n8n
usermod -aG sudo n8n

# Create N8N directory
mkdir -p /opt/n8n
chown n8n:n8n /opt/n8n
cd /opt/n8n
```

#### **3.2 Create N8N Configuration**
```bash
# Create .env file
nano /opt/n8n/.env
```

**N8N Environment Configuration:**
```bash
# N8N Core Configuration
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin@bell24h.com
N8N_BASIC_AUTH_PASSWORD=bell24h-n8n-2024-secure

# Database Configuration
DB_TYPE=postgresql
DB_POSTGRESDB_HOST=localhost
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n_production
DB_POSTGRESDB_USER=n8n_user
DB_POSTGRESDB_PASSWORD=your-secure-password

# Webhook Configuration
WEBHOOK_URL=https://n8n.bell24h.com
N8N_WEBHOOK_URL=https://n8n.bell24h.com

# Bell24h Integration
BELL24H_API_URL=https://www.bell24h.com/api
BELL24H_WEBHOOK_SECRET=bell24h-webhook-secret-2024
BELL24H_DATABASE_URL=your-bell24h-database-url

# External Services
OPENAI_API_KEY=your-openai-key
MSG91_API_KEY=your-msg91-key
RAZORPAY_API_KEY=your-razorpay-key
SENDGRID_API_KEY=your-sendgrid-key

# Security
N8N_ENCRYPTION_KEY=your-32-char-encryption-key-here
N8N_JWT_SECRET=your-jwt-secret-here

# Performance
N8N_PAYLOAD_SIZE_MAX=16
N8N_METRICS=true
N8N_LOG_LEVEL=info
N8N_PORT=5678

# Production Settings
NODE_ENV=production
N8N_HOST=0.0.0.0
N8N_PROTOCOL=https
```

#### **3.3 Create N8N Startup Script**
```bash
# Create startup script
nano /opt/n8n/start-n8n.sh
```

**Startup Script:**
```bash
#!/bin/bash
cd /opt/n8n
export NODE_ENV=production
n8n start
```

```bash
# Make script executable
chmod +x /opt/n8n/start-n8n.sh
```

### **Phase 4: PM2 Process Management (10 minutes)**

#### **4.1 Create PM2 Configuration**
```bash
# Create PM2 ecosystem file
nano /opt/n8n/ecosystem.config.js
```

**PM2 Configuration:**
```javascript
module.exports = {
  apps: [{
    name: 'bell24h-n8n',
    script: 'n8n',
    cwd: '/opt/n8n',
    env: {
      NODE_ENV: 'production',
      N8N_PORT: 5678,
      N8N_HOST: '0.0.0.0'
    },
    env_file: '/opt/n8n/.env',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    error_file: '/opt/n8n/logs/err.log',
    out_file: '/opt/n8n/logs/out.log',
    log_file: '/opt/n8n/logs/combined.log',
    time: true
  }]
};
```

#### **4.2 Start N8N with PM2**
```bash
# Create logs directory
mkdir -p /opt/n8n/logs
chown n8n:n8n /opt/n8n/logs

# Start N8N
pm2 start /opt/n8n/ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### **Phase 5: Nginx Reverse Proxy (15 minutes)**

#### **5.1 Configure Nginx**
```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/n8n.bell24h.com
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name n8n.bell24h.com;

    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

#### **5.2 Enable Site and SSL**
```bash
# Enable site
ln -s /etc/nginx/sites-available/n8n.bell24h.com /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Install SSL certificate
certbot --nginx -d n8n.bell24h.com
```

### **Phase 6: Firewall Configuration (5 minutes)**

#### **6.1 Configure UFW Firewall**
```bash
# Enable UFW
ufw enable

# Allow SSH
ufw allow ssh

# Allow HTTP and HTTPS
ufw allow 80
ufw allow 443

# Allow N8N port (if needed)
ufw allow 5678

# Check status
ufw status
```

---

## 📋 **WORKFLOW DEPLOYMENT**

### **1. Import Bell24h Workflows**
```bash
# Create workflows directory
mkdir -p /opt/n8n/workflows
chown n8n:n8n /opt/n8n/workflows

# Copy workflow files
cp /path/to/your/n8n/workflows/*.json /opt/n8n/workflows/
```

### **2. Import Workflows via N8N UI**
1. Open `https://n8n.bell24h.com`
2. Login with admin credentials
3. Go to Workflows → Import
4. Import each workflow file:
   - `bell24h-integration.workflow.json`
   - `rfq.workflow.json`
   - `user.onboarding.workflow.json`
   - `escrow.workflow.json`
   - `category-analytics.workflow.json`
   - `mock-order-generation.workflow.json`
   - `category-seo-automation.workflow.json`

### **3. Configure Workflow Credentials**
1. Go to Credentials in N8N UI
2. Add credentials for:
   - Bell24h API
   - Email services (SendGrid, SMTP)
   - SMS services (MSG91, Twilio)
   - External APIs (OpenAI, etc.)

---

## 🔍 **MONITORING & MAINTENANCE**

### **1. PM2 Monitoring**
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs bell24h-n8n

# Restart N8N
pm2 restart bell24h-n8n

# Monitor resources
pm2 monit
```

### **2. N8N Health Checks**
```bash
# Check N8N API
curl -X GET https://n8n.bell24h.com/api/health

# Check workflow status
curl -X GET https://n8n.bell24h.com/api/workflows
```

### **3. Database Maintenance**
```bash
# Backup database
pg_dump n8n_production > n8n_backup_$(date +%Y%m%d).sql

# Restore database
psql n8n_production < n8n_backup_20241201.sql
```

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues & Solutions**

#### **1. N8N Won't Start**
```bash
# Check logs
pm2 logs bell24h-n8n

# Check environment variables
cat /opt/n8n/.env

# Test database connection
psql -h localhost -U n8n_user -d n8n_production
```

#### **2. Database Connection Issues**
```bash
# Check PostgreSQL status
systemctl status postgresql

# Check database exists
sudo -u postgres psql -c "\l"

# Check user permissions
sudo -u postgres psql -c "\du"
```

#### **3. Nginx Issues**
```bash
# Check Nginx status
systemctl status nginx

# Test configuration
nginx -t

# Check error logs
tail -f /var/log/nginx/error.log
```

#### **4. SSL Certificate Issues**
```bash
# Check certificate status
certbot certificates

# Renew certificate
certbot renew --dry-run

# Force renewal
certbot renew --force-renewal
```

---

## 📊 **PERFORMANCE OPTIMIZATION**

### **1. Database Optimization**
```sql
-- Add indexes for better performance
CREATE INDEX idx_execution_entity_workflow_id ON execution_entity(workflow_id);
CREATE INDEX idx_execution_entity_finished_at ON execution_entity(finished_at);
CREATE INDEX idx_workflow_entity_active ON workflow_entity(active);
```

### **2. N8N Configuration Optimization**
```bash
# Add to .env file
N8N_PAYLOAD_SIZE_MAX=16
N8N_METRICS=true
N8N_LOG_LEVEL=info
N8N_DIAGNOSTICS_ENABLED=true
```

### **3. System Resource Monitoring**
```bash
# Install monitoring tools
apt install -y htop iotop nethogs

# Monitor resources
htop
iotop
nethogs
```

---

## 🔒 **SECURITY HARDENING**

### **1. Firewall Rules**
```bash
# Only allow necessary ports
ufw deny 5678  # Block direct access to N8N
ufw allow from 127.0.0.1 to any port 5678  # Allow local access only
```

### **2. SSL/TLS Configuration**
```nginx
# Add to Nginx configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

### **3. Regular Updates**
```bash
# Update system packages
apt update && apt upgrade -y

# Update N8N
npm update -g n8n

# Restart services
pm2 restart bell24h-n8n
systemctl restart nginx
```

---

## 📈 **SCALING CONSIDERATIONS**

### **1. Horizontal Scaling**
```yaml
Load Balancer:
  - Nginx with multiple N8N instances
  - Redis for session sharing
  - Database clustering

Multiple Instances:
  - 2-3 N8N instances
  - Load balancer distribution
  - Shared database
```

### **2. Vertical Scaling**
```yaml
Server Upgrade:
  - Increase CPU cores
  - Add more RAM
  - Upgrade storage to SSD
  - Optimize database configuration
```

---

## 🎯 **SUCCESS METRICS**

### **Technical Metrics**
- **Uptime**: 99.9%
- **Response Time**: <2 seconds
- **Error Rate**: <1%
- **Workflow Execution**: <5 seconds

### **Business Metrics**
- **Workflow Success Rate**: 95%+
- **Category Updates**: Daily
- **SEO Optimization**: Weekly
- **Mock Order Generation**: Every 4 hours

---

## 📞 **NEXT STEPS**

1. **Choose your server provider** (DigitalOcean recommended)
2. **Deploy following this guide** step by step
3. **Import all workflows** from the n8n/workflows directory
4. **Test all integrations** with your Bell24h platform
5. **Monitor performance** and optimize as needed
6. **Scale based on usage** and business growth

**Your N8N automation server will be the backbone of your Bell24h platform, handling everything from category management to user engagement! 🚀**
