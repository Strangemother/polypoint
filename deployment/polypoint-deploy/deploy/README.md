# Polypoint deployment guide (new host → live)

This guide covers a clean deployment of the Polypoint Django site (sources under `site/`) onto a new Ubuntu server, including creating a dedicated site user, SSH hardening, Django best practices, ports and pattern mapping, systemd, Nginx, TLS, and a standard deploy workflow. Examples reference `polypoint.io` and `polypointjs.com` on host `178.128.172.154` but apply to any host.

## Quick checklist

- [ ] Create site user with sudo and SSH keys (`site` shown below)
- [ ] Update and secure the host; install base packages (Python, Nginx, Postgres optional)
- [ ] Create Python venv, install requirements
- [ ] Configure environment (secrets, DB URL, ALLOWED_HOSTS, etc.)
- [ ] Create systemd service (Gunicorn, bound to 127.0.0.1:8001+)
- [ ] Configure Nginx reverse proxy, static/media, TLS via Let’s Encrypt
- [ ] Open firewall for SSH, HTTP/HTTPS; close everything else
- [ ] Migrate DB, collect static, start services
- [ ] Verify health, logs, and set up backups and monitoring

---

## 1) Create a dedicated site user with sudo + SSH

Use a non-root user (example: `site`) to run the app and manage deployments.

```bash
sudo adduser --gecos "Polypoint Site" site
sudo usermod -aG sudo site

sudo -u site mkdir -p /home/site/.ssh
sudo -u site chmod 700 /home/site/.ssh
sudo -u site touch /home/site/.ssh/authorized_keys
sudo -u site chmod 600 /home/site/.ssh/authorized_keys
# Paste your public key into authorized_keys
```

Harden SSH (optional but recommended):

```bash
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
sudoedit /etc/ssh/sshd_config
# Recommended changes:
#   PasswordAuthentication no
#   PermitRootLogin no
#   PubkeyAuthentication yes
#   AllowUsers site
sudo systemctl reload ssh
```

## 2) OS prep and base packages

```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y install build-essential git ufw ca-certificates \
          python3 python3-venv python3-dev \
          nginx
# Optional: PostgreSQL
sudo apt -y install postgresql postgresql-contrib libpq-dev
```

Firewall (UFW):

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status
```

## 3) Code checkout and Python environment

As `site` user:

```bash
sudo -iu site
mkdir -p ~/apps && cd ~/apps
# If the repo is already present on the host, skip clone and just pull
git clone https://github.com/Strangemother/polypoint.git
cd polypoint
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip wheel
pip install -r requirements.txt
```

## 4) Environment configuration (Django)

Use per-domain env files; don’t commit secrets.

- Example env directory: `/etc/polypoint/`
- Example files: `/etc/polypoint/polypoint.io.env`, `/etc/polypoint/polypointjs.com.env`

Example variables:

```bash
DJANGO_SETTINGS_MODULE=site.settings
DJANGO_SECRET_KEY=change-me
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=polypoint.io,polypointjs.com,178.128.172.154
CSRF_TRUSTED_ORIGINS=https://polypoint.io,https://polypointjs.com
DATABASE_URL=postgres://polypoint:strongpass@127.0.0.1:5432/polypoint
DJANGO_SECURE_SSL_REDIRECT=True
DJANGO_SESSION_COOKIE_SECURE=True
DJANGO_CSRF_COOKIE_SECURE=True
DJANGO_SECURE_HSTS_SECONDS=31536000
DJANGO_SECURE_HSTS_INCLUDE_SUBDOMAINS=True
DJANGO_SECURE_HSTS_PRELOAD=True
```

Best practices:

- DEBUG=False in production
- Strict ALLOWED_HOSTS and CSRF_TRUSTED_ORIGINS
- Store secrets in root-only readable files, loaded by systemd EnvironmentFile
- Use Sentry or similar for error reporting
- Keep requirements pinned and up-to-date; rebuild venv on major upgrades

## 5) Database (PostgreSQL example)

```bash
sudo -iu postgres createuser --pwprompt polypoint
sudo -iu postgres createdb -O polypoint polypoint
# Optionally restrict local connections to peer/md5 as needed
```

Apply migrations and create a superuser later in the deploy step.

## 6) Gunicorn via systemd

Run Gunicorn on localhost, unique port per site. Example: `polypoint.io` → 127.0.0.1:8001, `polypointjs.com` → 127.0.0.1:8002.

Example unit `/etc/systemd/system/polypoint-io.service`:

```ini
[Unit]
Description=Gunicorn for polypoint.io
After=network.target

[Service]
User=site
Group=www-data
WorkingDirectory=/home/site/apps/polypoint/site
EnvironmentFile=/etc/polypoint/polypoint.io.env
RuntimeDirectory=polypoint-io
ExecStart=/home/site/apps/polypoint/.venv/bin/gunicorn \
  --bind 127.0.0.1:8001 --workers 3 --threads 2 --timeout 60 \
  site.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
Restart=on-failure
RestartSec=2
ProtectSystem=full
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

Repeat for `polypointjs.com` with `EnvironmentFile=/etc/polypoint/polypointjs.com.env` and port 8002.

```bash
sudo systemctl daemon-reload
sudo systemctl enable polypoint-io
sudo systemctl start polypoint-io
sudo systemctl status --no-pager polypoint-io
```

Worker sizing: `workers = min(2, CPU*2+1)` is a common start. Use `--graceful-timeout` for smoother restarts.

## 7) Nginx reverse proxy (+ static/media)

Serve TLS, proxy to Gunicorn, and serve static/media directly.

Example `/etc/nginx/sites-available/polypoint.io`:

```nginx
server {
  listen 80;
  server_name polypoint.io;
  location / { return 301 https://$host$request_uri; }
}

server {
  listen 443 ssl http2;
  server_name polypoint.io;

  # ssl_certificate and ssl_certificate_key will be managed by certbot

  client_max_body_size 20m;
  gzip on;

  # Static files (adjust paths to your collectstatic output)
  location /static/ {
    alias /home/site/apps/polypoint/site/static/;
    access_log off;
    expires 7d;
  }
  location /media/ {
    alias /home/site/apps/polypoint/site/media/;
    expires 7d;
  }

  # App
  location / {
    proxy_pass http://127.0.0.1:8001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 65s;
  }
}
```

Enable the site and test:

```bash
sudo ln -s /etc/nginx/sites-available/polypoint.io /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 8) TLS with Let’s Encrypt

```bash
sudo apt -y install certbot python3-certbot-nginx
sudo certbot --nginx -d polypoint.io -d www.polypoint.io --redirect --agree-tos -m admin@polypoint.io
sudo systemctl status certbot.timer
```

Repeat for `polypointjs.com` with its own Nginx site and Gunicorn port (8002).

## 9) Ports and pattern mapping (how to wire multiple apps)

Common patterns:

1) Multi-domain → separate upstream ports

- `polypoint.io` → Gunicorn on `127.0.0.1:8001`
- `polypointjs.com` → Gunicorn on `127.0.0.1:8002`

Nginx: create one server block per domain; each proxies to its port.

2) Path-based routing within one domain

```nginx
server {
  listen 443 ssl http2;
  server_name polypoint.io;

  location /api/ { proxy_pass http://127.0.0.1:8001; }
  location /app2/ { proxy_pass http://127.0.0.1:8002; }

  location /static/ { alias /home/site/apps/polypoint/site/static/; }
}
```

3) WebSockets (if used)

```nginx
location /ws/ {
  proxy_pass http://127.0.0.1:8001;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
}
```

Firewall: keep ports 8001/8002 closed to the internet; only Nginx listens on 80/443.

## 10) First deploy (migrate, collect static, start)

From repo root as `site` user:

```bash
source .venv/bin/activate
python manage.py check --deploy
python manage.py migrate --noinput
python manage.py collectstatic --noinput
sudo systemctl restart polypoint-io
```

Repeat for the second site (if any) and confirm with curl or browser.

## 11) Ongoing deploy workflow

```bash
cd ~/apps/polypoint
git pull --ff-only
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate --noinput
python manage.py collectstatic --noinput
sudo systemctl reload polypoint-io  # graceful if supported; else restart
```

Zero-downtime tips: use `ExecReload` and Gunicorn HUP for graceful reloads; prestart app with health checks.

## 12) Logging, monitoring, backups

- Logs: `journalctl -u polypoint-io -f` and `/var/log/nginx/*`
- Fail2ban (optional) to protect SSH and Nginx
- Monitoring: uptime checks, error reporting (Sentry), metrics (Netdata/Prometheus)
- Backups: DB dumps (pg_dump), media files; store off-host on a schedule

## 13) Django production best practices (summary)

- DEBUG=False; secure cookies; HSTS; SSL redirect
- Strict hosts and CSRF origins
- Use WhiteNoise or Nginx for static; media behind auth if needed
- Separate writeable dirs (media) from code; proper permissions (owned by `site`, group `www-data` where Nginx needs read)
- Keep secrets out of VCS; load via systemd env files
- Pin dependencies; scan for vulns periodically

## 14) Troubleshooting

```bash
sudo systemctl status polypoint-io --no-pager
journalctl -u polypoint-io -e --no-pager
sudo nginx -t && sudo systemctl reload nginx
sudo tail -n 200 /var/log/nginx/error.log
curl -I https://polypoint.io/
```

---

## Repo-specific notes

- Project layout here places Django under `site/`. Adjust `WorkingDirectory`, static/media paths, and `DJANGO_SETTINGS_MODULE` accordingly.
- Example host: `178.128.172.154`. Domains: `polypoint.io`, `polypointjs.com`.
- If using the existing `deploy/` materials (gunicorn/nginx/systemd), ensure the ports match the mapping section above and environment files are correctly referenced.