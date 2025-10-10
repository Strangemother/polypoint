# Deployment Instructions for Polypoint Project

This document outlines the steps required to set up and deploy the Polypoint Django project located in the `site/beta/` directory to a development server. The server will be configured to serve two domains: `polypoint.io` and `polypointjs.com`. 

## Prerequisites

1. **Server Access**: Ensure you have SSH access to the server with the IP address `178.128.172.154`.
2. **Python Environment**: Make sure Python 3 and pip are installed on the server.
3. **System Packages**: Install necessary system packages including Nginx and Gunicorn.

## Environment Setup

1. **Clone the Repository**: Clone the Polypoint repository to your server.

   ```bash
   git clone <repository-url>
   cd polypoint-deploy
   ```

2. **Create Virtual Environment**: Set up a Python virtual environment.

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install Requirements**: Install the required Python packages.

   ```bash
   pip install -r requirements.txt
   ```

## Configuration

1. **Environment Variables**: Configure environment variables for both domains.

   - Edit `deploy/env/polypoint.io.env` and `deploy/env/polypointjs.com.env` to include necessary settings such as `SECRET_KEY`, `DEBUG`, and database configurations.

2. **Nginx Configuration**: Set up Nginx to serve the applications.

   - Copy the Nginx configuration files to the appropriate directory.

   ```bash
   sudo cp deploy/nginx/polypoint.io.conf /etc/nginx/sites-available/
   sudo cp deploy/nginx/polypointjs.com.conf /etc/nginx/sites-available/
   ```

   - Create symbolic links to enable the sites.

   ```bash
   sudo ln -s /etc/nginx/sites-available/polypoint.io.conf /etc/nginx/sites-enabled/
   sudo ln -s /etc/nginx/sites-available/polypointjs.com.conf /etc/nginx/sites-enabled/
   ```

3. **Gunicorn Configuration**: Set up Gunicorn to serve the Django application.

   - Copy the Gunicorn service files to the systemd directory.

   ```bash
   sudo cp deploy/systemd/gunicorn-polypoint-io.service /etc/systemd/system/
   sudo cp deploy/systemd/gunicorn-polypointjs-com.service /etc/systemd/system/
   ```

## Deployment Steps

1. **Run Migrations**: Apply database migrations.

   ```bash
   bash deploy/scripts/migrate.sh
   ```

2. **Collect Static Files**: Gather static files for serving.

   ```bash
   bash deploy/scripts/collectstatic.sh
   ```

3. **Start Gunicorn Services**: Start the Gunicorn services for both domains.

   ```bash
   sudo systemctl start gunicorn-polypoint-io
   sudo systemctl start gunicorn-polypointjs-com
   ```

   - Enable the services to start on boot.

   ```bash
   sudo systemctl enable gunicorn-polypoint-io
   sudo systemctl enable gunicorn-polypointjs-com
   ```

4. **Restart Nginx**: Restart Nginx to apply the new configurations.

   ```bash
   sudo systemctl restart nginx
   ```

## Notes

- Ensure that your DNS records for `polypoint.io` and `polypointjs.com` point to the server's IP address.
- Monitor the logs for both Nginx and Gunicorn to troubleshoot any issues that arise during deployment.

## Conclusion

Following these steps will set up and deploy the Polypoint Django project on the specified server, allowing it to serve requests for both domains. For further customization and configuration, refer to the respective documentation for Django, Nginx, and Gunicorn.