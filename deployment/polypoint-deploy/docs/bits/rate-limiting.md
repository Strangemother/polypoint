# Rate Limiting Setup

Configure nginx rate limiting to protect against abuse and DDoS.

## Update Nginx Configuration

Edit your nginx config:

```bash
sudo nano /etc/nginx/sites-available/polypointjs.com.conf
```

Add rate limiting zones at the top (before the `server` block):

```nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
limit_req_zone $binary_remote_addr zone=static:10m rate=50r/s;

server {
    # ... existing config ...
    
    # Apply rate limiting to main site
    location / {
        limit_req zone=general burst=20 nodelay;
        limit_req_status 429;
        
        include proxy_params;
        proxy_pass http://unix:/run/gunicorn/polypointjs.sock;
    }
    
    # Less strict for static files
    location /static/ {
        limit_req zone=static burst=100 nodelay;
        alias /home/site/apps/polypoint/site/beta/static/;
    }
    
    # More strict for API endpoints (if you have any)
    location /api/ {
        limit_req zone=api burst=50 nodelay;
        limit_req_status 429;
        
        include proxy_params;
        proxy_pass http://unix:/run/gunicorn/polypointjs.sock;
    }
}
```

## Rate Limit Explanation

- **rate=10r/s**: 10 requests per second
- **burst=20**: Allow bursts up to 20 requests
- **nodelay**: Process burst requests immediately
- **limit_req_status 429**: Return HTTP 429 (Too Many Requests)

## Test Configuration

```bash
sudo nginx -t
```

## Apply Changes

```bash
sudo systemctl reload nginx
```

## Test Rate Limiting

From another machine:

```bash
# This should get rate limited after ~30 requests
for i in {1..50}; do curl -w "\n" https://polypointjs.com/; done
```

You'll start seeing 429 errors after the limit is hit.

## Adjust Limits

Common configurations:

| Use Case | Rate | Burst |
|----------|------|-------|
| General browsing | 10r/s | 20 |
| API endpoints | 30r/s | 50 |
| Static files | 50r/s | 100 |
| Strict API | 1r/s | 5 |
| Public API | 100r/s | 200 |

## Whitelist IPs (Optional)

To exclude certain IPs from rate limiting:

```nginx
geo $limit {
    default 1;
    10.0.0.0/8 0;
    192.168.0.0/16 0;
    # Your office IP
    1.2.3.4 0;
}

map $limit $limit_key {
    0 "";
    1 $binary_remote_addr;
}

limit_req_zone $limit_key zone=general:10m rate=10r/s;
```

## Monitor Rate Limiting

Check nginx error log for rate limit messages:

```bash
sudo tail -f /var/log/nginx/error.log | grep limiting
```

## Custom Error Page for Rate Limiting

Add to your nginx config:

```nginx
error_page 429 /429.html;
location = /429.html {
    root /home/site/apps/polypoint/site/beta/templates;
    internal;
}
```

Then create a custom 429 error page in your Django templates.
