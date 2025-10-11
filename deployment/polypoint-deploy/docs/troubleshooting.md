
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