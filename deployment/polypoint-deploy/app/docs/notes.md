# Notes

This application should perform:

- A full deployment of a Django application
- Manage nginx, and hopefully other services (e.g. Porkbun or Namescheap domains)
- Use systemd to manage services (gunicorn, celery, etc)

Generally we want to go from _nothing_ to _a working deployment_ with minimal user input, in a hopes to replicate something like a _heroku_ experience - but on a VPS.

## Expectations 

- The user has a fresh Ubuntu server (20.04+)
- The user has a domain name pointed at the server IP
- The user has SSH access to the server

The tool will:

- Install required packages (nginx, python3, etc)
- Create a site user
- Clone the application code from GitHub
- setup an environment (python venv, etc)
- Setup nginx configuration
- Setup SSL with Let's Encrypt
- Setup systemd services (gunicorn, celery, etc)
- Setup firewall (ufw)
- Setup log rotation    
- Setup monitoring (e.g. Uptime Kuma)
- Setup basic security (fail2ban, etc)

All tools will be as automated as possible, with sensible defaults - but with options for customization.

Then other optionals: 

- switch SSH port
- setup a swap file
- setup a database (PostgreSQL, etc)
- setup a CDN (Cloudflare, etc)
- setup a backup solution (e.g. rsync, etc)
- setup a CI/CD pipeline (GitHub Actions, etc)
- setup a caching solution (Redis, etc)
- setup a task queue (Celery, etc)
