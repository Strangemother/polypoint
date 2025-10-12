# Deployment App

This application is a pre-cursor to the "trim deployment" tools, to manage deployment of polypoint - and in the future other apps.

This content start with a working deployment (see [docs/readme.md](./docs/readme.md)) and will be refactored to use the trim deployment tools.

It also includes modular "bits" that can be run independently as needed, generally covered in the primary [readme file](./docs/bits/readme.md).

---

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


## Tooling

The capabilities will be slightly offset to the standard functionality of other deployment tools, in a hopes to provide a more streamlined deployment process for both user and robots.

Usually we need ensure the server is setup correctly, then deploy the application. This tool will run these steps if required but this leads to a chicken-and-egg problem.

Therefore this tool should run from within the target server. Upon deployment the tool will run a _robot_ on the server - of which is just a bunch of scripts to run the deployment steps.

## Example Usage

+ **left-side**: The deployment tool on the initiator system, such as the developers local machine, or a CI/CD system.
+ **right-side**: The target system, such as a fresh Ubuntu server, but specifically referring to _this tools_ target system.
+ **Initiator**: The system that initiates the deployment, usually the left-side system, AKA _local_, developer, client. Generally the _left-side_ system.
+ **Target**: The system that is the target of the deployment, usually the right-side system, AKA _remote_, server, production. Generally the _right-side_ system.
+ **DIE**: Deployment Integrated Environment - A moniker used to refer to the suite of tools used for deployment, including its interface.


> For this example we'll use Windows as the left-side system, and Ubuntu as the right-side system to make it easy to follow.

Install the deployment tool. We assume basic python (because it's on ubuntu by default):

```bash
https://myendpoint/grab-bot | bash
```

This receives the installation script, of which downloads the deployment tool, and runs it.

If the system is automated, the _left side_ tool must be run as root (e.g. via sudo). This is done through a pre-config of the site setup.

Left side (initiator system):

```bash
$> deploy-tool -f myapp/deploy/config.yaml
# ... Reading new config
```

This will inspect the deployment config, and determine the target system (e.g. IP address, domain name, etc). and perform a connection. 

## Ideaology

+ as automated as possible, with sensible defaults - but with options for customization.
+ idempotent, so it can be run multiple times without causing issues.
+ modular, with each module isolated to a specific task.
+ extensible, with the ability to add new modules and functionality easily.

Fundamentally it should be fire-and-forget, with minimal user input. Given access to domain management tools, it can also verify domain records.

I'd like to avoid using tools like Ansible, as they add complexity and dependencies. Instead, the tool should be a standalone, the dev should be to _just run it_. and it should handle everything else.


## Tool Tools

The initial target is a Django application, but the tool should be modular enough to handle other applications in the future.

It should also be modular enough to handle different services, such as nginx, apache, etc, with sensible defaults.

The tool is modular, with each module isolated to a specific task.