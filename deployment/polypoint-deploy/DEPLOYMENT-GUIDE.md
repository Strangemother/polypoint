# Django Deployment Guide - polypointjs.com

Complete step-by-step guide to deploy the Django application with Gunicorn and Nginx.

## Prerequisites

- Ubuntu server with root access
- SSH key setup (see [first-ssh-key-setup.md](../first-ssh-key-setup.md))
- Site user created (see [create-site-user.md](../create-site-user.md))
- Domain DNS pointed to server IP

> **Note:** All commands below should be run on the remote server. Connect using SSH with your configured key.

## Step 1: Initial Server Setup

### Install required packages
```bash
apt update
apt install -y python3 python3-pip python3-venv nginx git
```

### Create application directory
```bash
mkdir -p /home/site/apps/polypoint
chown -R site:site /home/site/apps/polypoint
```

## Step 2: Deploy Application Code

### Switch to site user
```bash
su - site
cd /home/site/apps
```

### Clone the application
```bash
git clone https://github.com/Strangemother/polypoint
cd polypoint
```

### Create and activate virtual environment
Create a Python virtual environment (see [Python venv setup guide](./docs/python-venv-setup.md) for details).

```bash
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
sudo chown -R site:www-data /home/site/apps/polypoint/site/beta/static
sudo chmod -R 755 /home/site/apps/polypoint/site/beta/static
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
sudo cp /home/site/apps/polypoint/deployment/polypoint-deploy/deploy/systemd/gunicorn-polypointjs-com.service \
    /etc/systemd/system/gunicorn-polypointjs-com.service
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
sudo cp /home/site/apps/polypoint/deployment/polypoint-deploy/deploy/nginx/polypointjs.com.conf \
    /etc/nginx/sites-available/polypointjs.com.conf
```

### Enable the site
```bash
sudo ln -s /etc/nginx/sites-available/polypointjs.com.conf \
    /etc/nginx/sites-enabled/polypointjs.com.conf
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

## Step 9: Troubleshooting

### View gunicorn logs
```bash
# Error logs
tail -f /var/log/gunicorn/polypointjs_com_error.log

# Access logs
tail -f /var/log/gunicorn/polypointjs_com_access.log

# System logs
sudo journalctl -u gunicorn-polypointjs-com.service -f
```

### View nginx logs
```bash
# Error logs
tail -f /var/log/nginx/error.log

# Access logs
tail -f /var/log/nginx/access.log

# Filter for errors only
tail -f /var/log/syslog | grep -i error
```

### Restart services
```bash
# Restart gunicorn
sudo systemctl restart gunicorn-polypointjs-com.service

# Restart nginx
sudo systemctl restart nginx

# Reload nginx (for config changes)
sudo systemctl reload nginx
```

### Check socket permissions
```bash
ls -la /run/gunicorn/
# Should show: srwxrwx--- 1 www-data www-data
```

If permissions are wrong:
```bash
sudo systemctl restart gunicorn-polypointjs-com.service
```

## Common Issues & Fixes

### Issue: Permission denied connecting to socket
**Fix:** Ensure nginx user is in the correct group
```bash
sudo usermod -a -G www-data site
sudo systemctl restart gunicorn-polypointjs-com.service
```

### Issue: Static files return 404
**Fix:** Verify static files were collected and nginx config uses `alias`
```bash
cd /home/site/apps/polypoint/site/beta
source /home/site/apps/polypoint/.venv/bin/activate
python manage.py collectstatic --noinput
```

```bash
sudo systemctl reload nginx
```

### Issue: Gunicorn fails to start
**Fix:** Check the error logs
```bash
sudo journalctl -u gunicorn-polypointjs-com.service -n 50
tail -f /var/log/gunicorn/polypointjs_com_error.log
```

### Issue: Wrong WSGI module
**Fix:** Verify the Django project name matches in `start.sh`
```bash
# Find wsgi.py location
find /home/site/apps/polypoint/site/beta/ -name "wsgi.py"
# Update start.sh with correct module name (e.g., primary.wsgi:application)
```

## Updating Your Application

When you make changes to your application:

```bash
# 1. Update code (git pull or copy files)
cd /home/site/apps/polypoint
git pull  # or copy updated files
```

```bash
# 2. Activate virtual environment
source /home/site/apps/polypoint/.venv/bin/activate
```

```bash
# 3. Install any new dependencies
pip install -r /home/site/apps/polypoint/site/beta/requirements.txt
```

```bash
# 4. Collect static files
cd /home/site/apps/polypoint/site/beta
python manage.py collectstatic --noinput
```

```bash
# 5. Restart gunicorn
sudo systemctl restart gunicorn-polypointjs-com.service
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
