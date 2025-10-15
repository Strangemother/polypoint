# Adding a New Domain

Verify DNS propagation:

```bash
dig +short yourdomain.com
```

Should return: `178.128.172.154`

### 1. Update Nginx Configuration (Local)

Edit the Nginx config file locally:

**File:** `/deploy/nginx/polypointjs.com.conf`

Add your domain to **both** the HTTP (redirect) and HTTPS server blocks:

```nginx
server {
    server_name polypointjs.com www.polypointjs.com 
                newdomain.com  www.newdomain.com; 
}
```

### 2. Deploy to Server

In the server:

```bash
# Pull latest changes

# Copy updated config to nginx
sudo cp /home/site/apps/polypoint/deployment/polypoint-deploy/deploy/nginx/polypointjs.com.conf /etc/nginx/sites-available/polypointjs.com.conf

# Test nginx configuration
sudo nginx -t
```

### 3. Add Domain to SSL Certificate

Expand the existing Let's Encrypt certificate to include the new domain:

```bash
sudo certbot certonly --nginx \
  -d polypointjs.com -d www.polypointjs.com \
  -d newdomain.com -d www.newdomain.com \
  --expand
```

**Important:** Include ALL existing domains plus your new domain in the command. The `--expand` flag tells certbot to expand the existing certificate.

You should see:

```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/polypointjs.com/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/polypointjs.com/privkey.pem
This certificate expires on [DATE].
```

### 4. Reload Nginx

Apply all changes:

```bash
sudo systemctl reload nginx
# Or if reload doesn't work:
sudo systemctl restart nginx
```

### 5. Verify HTTPS

Test your new domain:

```bash
# Check certificate includes your domain
echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -text | grep -A2 "Subject Alternative Name"
```

You should see your domain listed in the output.

Visit in browser.

