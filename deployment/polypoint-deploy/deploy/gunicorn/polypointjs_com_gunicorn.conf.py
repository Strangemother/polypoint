# From the server, in the deployment directory
sudo cp /home/site/apps/polypoint/deployment/polypoint-deploy/deploy/gunicorn/start.sh \
    /home/site/apps/polypoint/deploy/gunicorn/start.sh

sudo cp /home/site/apps/polypoint/deployment/polypoint-deploy/deploy/gunicorn/polypointjs_com_gunicorn.conf.py \
    /home/site/apps/polypoint/deploy/gunicorn/polypointjs_com_gunicorn.conf.pybind = "unix:/run/gunicorn/polypointjs.sock"
workers = 3
user = "www-data"
group = "www-data"
timeout = 30
accesslog = "/var/log/gunicorn/polypointjs_com_access.log"
errorlog = "/var/log/gunicorn/polypointjs_com_error.log"
loglevel = "info"
chdir = "/home/site/apps/polypoint/site/beta"