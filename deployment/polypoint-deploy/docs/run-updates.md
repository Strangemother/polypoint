# Updating Your Application

+ Update Source: `sudo systemctl restart gunicorn-polypointjs-com`
+ Update nginx config: `sudo systemctl reload nginx`

---

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

---

Update nginx:

```bash
# Copy the updated config with new domains
sudo cp /home/site/apps/polypoint/deployment/polypoint-deploy/deploy/nginx/polypointjs.com.conf /etc/nginx/sites-available/polypointjs.com.conf

# Test the config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

---

refresh 

```bash
# 3. Restart gunicorn
sudo systemctl restart gunicorn-polypointjs-com.service

# 4. Restart nginx
sudo systemctl restart nginx

# 5. Check the status
sudo systemctl status gunicorn-polypointjs-com.service
```