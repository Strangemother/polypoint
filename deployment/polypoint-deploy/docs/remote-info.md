# Remote Info

tail logs:

```bash
tail -f /var/log/syslog | grep -i error
```

Source:

```bash
cd /home/site/apps/polypoint
source ./.venv/bin/activate
```

Site:

```bash
/home/site/apps/polypoint/site/beta
# manage.py 
```

Deploy Content:

```bash
/home/site/apps/polypoint/deployment/polypoint-deploy/deploy/
```

refresh 

```bash
# 1. Copy the updated config to the server
sudo cp /home/site/apps/polypoint/deployment/polypoint-deploy/deploy/gunicorn/polypointjs_com_gunicorn.conf.py \
    /home/site/apps/polypoint/deploy/gunicorn/polypointjs_com_gunicorn.conf.py

# 2. Add nginx to the site group (so it can access the socket)
sudo usermod -a -G site www-data

# 3. Restart gunicorn
sudo systemctl restart gunicorn-polypointjs-com.service

# 4. Restart nginx
sudo systemctl restart nginx

# 5. Check the status
sudo systemctl status gunicorn-polypointjs-com.service
```

Key issue:
Wipe the key from remote and reconnect:

    ssh-keygen -R 178.128.172.154

example:

    gunicorn --bind 0.0.0.0:8000 myproject.wsgi:application