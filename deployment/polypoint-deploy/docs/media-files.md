# Media Files Setup

Configure Django media files (user uploads) with nginx serving.

## Step 1: Configure Django Settings

In your Django settings (`site/beta/primary/settings/`):

```python
# Media files (user uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

## Step 2: Create Media Directory

```bash
mkdir -p /home/site/apps/polypoint/site/beta/media
chmod 755 /home/site/apps/polypoint/site/beta/media
```

## Step 3: Update Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/polypointjs.com.conf
```

Add the media location block:

```nginx
server {
    # ... existing config ...
    
    location /static/ {
        alias /home/site/apps/polypoint/site/beta/static/;
    }
    
    # Add this for media files
    location /media/ {
        alias /home/site/apps/polypoint/site/beta/media/;
    }
    
    location / {
        include proxy_params;
        proxy_pass http://unix:/run/gunicorn/polypointjs.sock;
    }
}
```

## Step 4: Test and Reload Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Step 5: Update URLs (if needed)

In your main `urls.py` (for development serving):

```python
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ... your patterns ...
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

> **Note:** In production, nginx serves media files directly (configured above).

## File Upload Limits

### Nginx Upload Size Limit

Add to your nginx server block:

```nginx
server {
    # ... existing config ...
    
    # Allow uploads up to 100MB
    client_max_body_size 100M;
}
```

Common sizes:
- **10M**: Small images only
- **100M**: General files, videos
- **500M**: Large media files
- **0**: Unlimited (not recommended)

### Reload Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Security Considerations

### Restrict File Types

In your Django views/forms:

```python
from django.core.validators import FileExtensionValidator

class MyModel(models.Model):
    file = models.FileField(
        upload_to='uploads/',
        validators=[FileExtensionValidator(['pdf', 'jpg', 'png'])]
    )
```

### Prevent Script Execution in Media Directory

Add to nginx media location:

```nginx
location /media/ {
    alias /home/site/apps/polypoint/site/beta/media/;
    
    # Prevent script execution
    location ~ \.(php|py|pl|sh)$ {
        deny all;
    }
}
```

## Organize Media Files

Use `upload_to` with subdirectories:

```python
class Profile(models.Model):
    avatar = models.ImageField(upload_to='avatars/')
    
class Document(models.Model):
    file = models.FileField(upload_to='documents/%Y/%m/')  # Organized by date
```

## Backup Media Files

Add to your backup script:

```bash
# Backup media files
tar -czf media-backup-$(date +%Y%m%d).tar.gz \
    /home/site/apps/polypoint/site/beta/media/
```

## Clean Up Old/Unused Files

Django doesn't automatically delete old files when you change/delete models. Use a package like `django-cleanup`:

```bash
pip install django-cleanup
```

Add to `INSTALLED_APPS`:

```python
INSTALLED_APPS = [
    # ... other apps ...
    'django_cleanup.apps.CleanupConfig',
]
```

## CDN Setup (Optional)

For better performance, use a CDN like AWS S3 or Cloudflare:

```bash
pip install django-storages boto3
```

This is more complex but provides:
- Better performance
- Scalability
- Reduced server load
- Automatic backups

## Test Media Upload

1. Create a Django model with FileField or ImageField
2. Upload a file through Django admin
3. Verify it's accessible at: `https://polypointjs.com/media/path/to/file.jpg`

## Directory Structure

```
/home/site/apps/polypoint/site/beta/
├── media/
│   ├── avatars/
│   ├── documents/
│   │   ├── 2025/
│   │   │   └── 10/
│   └── uploads/
├── static/
└── ...
```

## Permissions

Media directory should be writable by the `site` user (who runs gunicorn):

```bash
# Already owned by site user, but verify:
ls -la /home/site/apps/polypoint/site/beta/ | grep media

# Should show: drwxr-xr-x ... site site ... media
```

If gunicorn can't write to media:

```bash
chmod 755 /home/site/apps/polypoint/site/beta/media
```
