# Log Rotation Setup

Configure logrotate to prevent log files from filling up disk space.

## Create Logrotate Config

```bash
sudo nano /etc/logrotate.d/gunicorn-polypointjs
```

Add this content:

```
/var/log/gunicorn/polypointjs_com_*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 site site
    sharedscripts
    postrotate
        systemctl reload gunicorn-polypointjs-com.service > /dev/null 2>&1 || true
    endscript
}
```

## Test the Configuration

```bash
sudo logrotate -d /etc/logrotate.d/gunicorn-polypointjs
```

## Force a Rotation (for testing)

```bash
sudo logrotate -f /etc/logrotate.d/gunicorn-polypointjs
```

This will:
- Rotate logs daily
- Keep 14 days of logs
- Compress old logs
- Create new logs with correct permissions
- Reload gunicorn after rotation
