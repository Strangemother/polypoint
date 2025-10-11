# Django Deployment Guide - polypointjs.com

Complete step-by-step guide to deploy the Django application with Gunicorn and Nginx.

## Prerequisites

- Ubuntu server with root access
- SSH key setup: [first-ssh-key-setup.md](../first-ssh-key-setup.md)
- Site user created: [create-site-user.md](../create-site-user.md)
- Domain DNS pointed to server IP

Post-requisites:

- Python virtual environment setup: [python-venv-setup.md](./python-venv-setup.md)
- GitHub SSH setup: [github-ssh-setup.md](./github-ssh-setup.md)
- Switch SSH port (optional): [switch-ssh-port.md](./switch-ssh-port.md)
- SSL with Let's Encrypt (optional): [https-setup.md](./https-setup.md)

> **Note:** All commands below should be run on the remote server. Connect using SSH with your configured key.

## Step 1: Initial Server Setup

### Install required packages
```bash
apt update
apt install -y python3 python3-pip python3-venv nginx git
```

### Configure firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status
```

> **Note**: This allows SSH (22), HTTP (80), and HTTPS (443) through the firewall.

## Step 2: Deploy Application Code

### Switch to site user and create apps directory
```bash
su - site
mkdir -p ~/apps
cd ~/apps
```

### Clone the application

see [GITHUB-SSH-SETUP.md](./GITHUB-SSH-SETUP.md)

```bash
git clone https://github.com/Strangemother/polypoint
cd polypoint
```

### Set directory permissions for nginx
```bash
chmod 755 /home/site/apps/polypoint
```

### Create and activate virtual environment
Create a Python virtual environment (see [Python venv setup guide](./docs/python-venv-setup.md) for details).

```bash
python3 -m venv .venv
source /home/site/apps/polypoint/.venv/bin/activate
```

> **Note:** Ensure the virtual environment is activated before running subsequent commands.

### Install dependencies
```bash
pip install -r /home/site/apps/polypoint/site/beta/requirements.txt
```

## Step 3: Configure Django

### Collect static files
```bash
cd /home/site/apps/polypoint/site/beta
python manage.py collectstatic --noinput
```

### Set static file permissions
```bash
chmod -R 755 /home/site/apps/polypoint/site/beta/static
```

## Step 4: Setup Logging

### Create log directory
```bash
sudo mkdir -p /var/log/gunicorn
sudo chown site:site /var/log/gunicorn
sudo chmod 755 /var/log/gunicorn
```

## Step 5: Prepare Gunicorn Configuration

The configuration files are in the cloned repository at `deployment/polypoint-deploy/deploy/` and will be used directly.

### Make start script executable
```bash
sudo chmod +x /home/site/apps/polypoint/deployment/polypoint-deploy/deploy/gunicorn/start.sh
```

## Step 6: Deploy Systemd Service

### Copy systemd service file
```bash
sudo cp /home/site/apps/polypoint/deployment/polypoint-deploy/deploy/systemd/gunicorn-polypointjs-com.service /etc/systemd/system/gunicorn-polypointjs-com.service
```

### Enable and start the service
```bash
sudo systemctl daemon-reload
sudo systemctl enable gunicorn-polypointjs-com.service
sudo systemctl start gunicorn-polypointjs-com.service
```

### Check service status
```bash
sudo systemctl status gunicorn-polypointjs-com.service
```

### Verify socket was created
```bash
ls -la /run/gunicorn/
```

You should see `polypointjs.sock` with permissions `srwxrwx---`

## Step 7: Configure Nginx

### Copy nginx configuration
```bash
sudo cp /home/site/apps/polypoint/deployment/polypoint-deploy/deploy/nginx/polypointjs.com.conf /etc/nginx/sites-available/polypointjs.com.conf
```

### Enable the site
```bash
sudo ln -s /etc/nginx/sites-available/polypointjs.com.conf /etc/nginx/sites-enabled/polypointjs.com.conf
```

### Remove default site (optional)
```bash
sudo rm /etc/nginx/sites-enabled/default
```

### Test nginx configuration
```bash
sudo nginx -t
```

### Reload nginx
```bash
sudo systemctl reload nginx
```

## Step 8: Verify Deployment

### Check gunicorn is running
```bash
sudo systemctl status gunicorn-polypointjs-com.service
```

### Check nginx is running
```bash
sudo systemctl status nginx
```

### Test the socket connection
```bash
curl --unix-socket /run/gunicorn/polypointjs.sock http://localhost/
```

### Test via HTTP
```bash
curl http://localhost
curl http://polypointjs.com
```

### Setup HTTPS with Let's Encrypt

Install certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Run certbot to automatically configure SSL for your domains:

```bash
sudo certbot --nginx -d polypointjs.com -d www.polypointjs.com -m polypoint@strangemother.com --agree-tos
```

Verify auto-renewal is enabled:

```bash
sudo systemctl status certbot.timer
```

```bash
# 6. Reload nginx (only if config changed)
sudo systemctl reload nginx
```

## File Locations Reference

| Purpose | Location |
|---------|----------|
| Application Root | `/home/site/apps/polypoint/` |
| Virtual Environment | `/home/site/apps/polypoint/.venv/` |
| Django Project | `/home/site/apps/polypoint/site/beta/` |
| Static Files | `/home/site/apps/polypoint/site/beta/static/` |
| Deployment Configs | `/home/site/apps/polypoint/deployment/polypoint-deploy/deploy/` |
| Gunicorn Socket | `/run/gunicorn/polypointjs.sock` |
| Gunicorn Logs | `/var/log/gunicorn/` |
| Nginx Config | `/etc/nginx/sites-available/polypointjs.com.conf` |
| Nginx Logs | `/var/log/nginx/` |
| Systemd Service | `/etc/systemd/system/gunicorn-polypointjs-com.service` |

## Next Steps (Optional)

- **HTTPS/SSL**: Set up Let's Encrypt SSL certificates with certbot
- **Database**: Configure PostgreSQL or your preferred database
- **Media Files**: Set up media file serving in nginx
- **Monitoring**: Set up monitoring and alerting
- **Backups**: Configure automated backups
- **Firewall**: Configure UFW firewall rules

---

## Key Configuration Files

These files are in `/workspaces/polypoint/deployment/polypoint-deploy/deploy/`:

- `gunicorn/start.sh` - Gunicorn startup script
- `gunicorn/polypointjs_com_gunicorn.conf.py` - Gunicorn configuration
- `systemd/gunicorn-polypointjs-com.service` - Systemd service definition
- `nginx/polypointjs.com.conf` - Nginx server configuration

Make sure these are properly configured before copying to the server.
