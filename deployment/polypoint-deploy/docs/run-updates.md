# Updating Your Application

When you make changes to your application:

```bash
# 1. Update code (git pull or copy files)
cd /home/site/apps/polypoint
git pull  # or copy updated files
```

```bash
# 2. Activate virtual environment
source /home/site/apps/polypoint/.venv/bin/activate
```

```bash
# 3. Install any new dependencies
pip install -r /home/site/apps/polypoint/site/beta/requirements.txt
```

```bash
# 4. Collect static files
cd /home/site/apps/polypoint/site/beta
python manage.py collectstatic --noinput
```

```bash
# 5. Restart gunicorn
sudo systemctl restart gunicorn-polypointjs-com.service
```
