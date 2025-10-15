## Troubleshooting

### "Certificate not valid for domain"

- Check that you ran the certbot command with ALL domains including the new one
- Verify nginx was reloaded after getting the new certificate
- Check nginx config has the domain in the `server_name` directive

### "Connection refused" or site not loading

- Verify DNS is pointing to correct IP: `dig +short yourdomain.com`
- Check nginx config syntax: `sudo nginx -t`
- Check nginx is running: `sudo systemctl status nginx`
- Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### "Too many certificates already issued"

Let's Encrypt has rate limits. If you hit this, you'll need to wait a week or use their staging environment for testing.

## Quick Reference

Full command sequence on server:

```bash
# Pull code
cd /home/site/apps/polypoint && git pull origin main

# Update nginx config
sudo cp /home/site/apps/polypoint/deployment/polypoint-deploy/deploy/nginx/polypointjs.com.conf /etc/nginx/sites-available/polypointjs.com.conf

# Expand SSL certificate (replace with your actual domains)
sudo certbot certonly --nginx -d polypointjs.com -d www.polypointjs.com -d polypoint.xyz -d www.polypoint.xyz -d poly.ink -d www.poly.ink -d blackboard.ink -d www.blackboard.ink -d yourdomain.com -d www.yourdomain.com --expand

# Reload nginx
sudo nginx -t && sudo systemctl reload nginx
```

## Notes

- The certificate is stored at `/etc/letsencrypt/live/polypointjs.com/` and covers all domains
- Certbot auto-renews certificates before expiry
- All domains share the same certificate and nginx configuration
- The HTTP block redirects all domains to HTTPS automatically
