# HTTPS/SSL Setup Guide - polypointjs.com

Guide to add Let's Encrypt SSL certificates for HTTPS support.

## Prerequisites

- Working deployment following [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)
- Domain DNS properly pointed to your server
- Port 80 and 443 open in firewall

## Step 1: Install Certbot

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

## Step 2: Obtain SSL Certificate

Certbot will automatically configure nginx for HTTPS.

```bash
sudo certbot --nginx -d polypointjs.com -d www.polypointjs.com
```

You'll be prompted for:
1. **Email address**: For renewal notifications
2. **Terms of Service**: Accept (Y)
3. **Email sharing**: Your choice (Y/N)
4. **Redirect HTTP to HTTPS**: Choose option 2 (Redirect)

## Step 3: Verify HTTPS is Working

```bash
curl https://polypointjs.com
```

Or visit in your browser: https://polypointjs.com

## Step 4: Test Auto-Renewal

Certbot automatically sets up renewal. Test it:

```bash
sudo certbot renew --dry-run
```

If successful, your certificates will auto-renew before expiry.

## Step 5: Check Certificate Status

```bash
sudo certbot certificates
```

Shows certificate details and expiry date.

## Firewall Configuration (if using UFW)

If you're using UFW firewall:

```bash
# Allow HTTPS
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

## What Certbot Changed

Certbot modified your nginx config at `/etc/nginx/sites-available/polypointjs.com.conf`:
- Added SSL certificate paths
- Added HTTPS server block (port 443)
- Added HTTP to HTTPS redirect (if you chose that option)
- Added SSL configuration

## Troubleshooting

### Issue: Certificate request fails

**Fix:** Check DNS is properly configured
```bash
# Verify DNS resolves to your server
dig polypointjs.com
dig www.polypointjs.com
```

### Issue: Port 80/443 blocked

**Fix:** Ensure ports are open
```bash
# Check if ports are listening
sudo netstat -tlnp | grep ':80\|:443'

# If using UFW
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Issue: Domain validation fails

**Fix:** Temporarily disable your app to let Certbot use port 80
```bash
sudo systemctl stop nginx
sudo certbot certonly --standalone -d polypointjs.com -d www.polypointjs.com
sudo systemctl start nginx
```

## Manual Certificate Renewal

Certificates auto-renew, but to manually renew:

```bash
sudo certbot renew
```

After renewal, reload nginx:

```bash
sudo systemctl reload nginx
```

## View Modified Nginx Config

```bash
cat /etc/nginx/sites-available/polypointjs.com.conf
```

You'll see Certbot added lines marked with "managed by Certbot" comments.

## Revert to HTTP Only (if needed)

To remove HTTPS:

```bash
sudo certbot delete --cert-name polypointjs.com
```

Then restore your original nginx config from the repo.

## Certificate Locations

| Item | Location |
|------|----------|
| Certificates | `/etc/letsencrypt/live/polypointjs.com/` |
| Certificate | `fullchain.pem` |
| Private Key | `privkey.pem` |
| Renewal Config | `/etc/letsencrypt/renewal/polypointjs.com.conf` |

## Auto-Renewal Details

- **Cron job**: `/etc/cron.d/certbot`
- **Timer**: `certbot.timer` (systemd)
- **Runs**: Twice daily
- **Renews**: When certificate has <30 days left

Check timer status:
```bash
sudo systemctl status certbot.timer
```

## Next Steps

- ✅ HTTPS is now working
- ✅ Auto-renewal is configured
- Consider: HSTS headers for additional security
- Consider: CAA DNS records

---

**Note:** Let's Encrypt certificates are valid for 90 days and auto-renew at 60 days.
