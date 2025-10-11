sudo systemctl stop gunicorn-polypointjs-com.service
sudo systemctl disable gunicorn-polypointjs-com.service
sudo systemctl stop nginx

# Remove systemd service
sudo rm /etc/systemd/system/gunicorn-polypointjs-com.service
sudo systemctl daemon-reload

# Remove nginx config
sudo rm /etc/nginx/sites-enabled/polypointjs.com.conf
sudo rm /etc/nginx/sites-available/polypointjs.com.conf

# Remove application files (as site user)
sudo rm -rf /home/site/apps/polypoint

# Remove logs
sudo rm -rf /var/log/gunicorn

# Restart nginx with default config
sudo systemctl start nginx