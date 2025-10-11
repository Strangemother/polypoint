# Create Site User Guide

Create a dedicated `site` user for running the application with sudo access but restricted SSH login.

## User Requirements

- Username: `site`
- Sudo access: Yes (for deployment tasks)
- SSH access: No (security - prevent direct remote login)
- Shell: `/bin/bash` (for local `su - site` access)
- Password: Set interactively during creation

## Step 1: Create the User

Run as root or with sudo:

```bash
sudo adduser --gecos "Polypoint Site" site
```

You'll be prompted to set a password. Enter a strong password and confirm it.

> **Important**: Save this password securely. You'll need it for local `su - site` access.

## Step 2: Grant Sudo Access

```bash
sudo usermod -aG sudo site
```

## Step 3: Ensure Interactive Shell

```bash
sudo usermod -s /bin/bash site
```

Verify the shell:

```bash
getent passwd site | cut -d: -f1,7
# Expected output: site:/bin/bash
```

## Step 4: Set Directory Permissions for Nginx

Allow nginx (www-data) to traverse the directory path to reach static files:

```bash
sudo chmod 755 /home/site
sudo chmod 755 /home/site/apps
```

> **Note**: These permissions allow nginx to traverse directories while keeping files secure.

## Step 5: Create SSH Directory (Optional)

> **Note**: This step is optional. Running `ssh-keygen` later will create this directory automatically.

```bash
sudo -u site mkdir -p /home/site/.ssh
sudo -u site chmod 700 /home/site/.ssh
```

This SSH directory is for GitHub deploy keys, not for SSH login to the server.

## Step 6: Block SSH Login for Site User

### Option A: Deny Site User Specifically (Recommended)

```bash
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
echo "DenyUsers site" | sudo tee -a /etc/ssh/sshd_config
sudo systemctl reload ssh
```

### Option B: Allow Only Specific Admin Group

```bash
# Create admin group for SSH access
sudo groupadd -f sshadmins

# Add your admin user to the group
sudo usermod -aG sshadmins <your-admin-username>

# Configure SSH to only allow this group
echo "AllowGroups sshadmins" | sudo tee -a /etc/ssh/sshd_config
sudo systemctl reload ssh
```

> **Note**: With Option B, ensure the `site` user is NOT in the `sshadmins` group.

## Step 7: Verify Configuration

### Test local access (should work)

```bash
su - site
# Enter the password you set
# Should get a shell prompt as site user
exit
```

### Test SSH access (should fail)

From another machine:

```bash
ssh site@your-server-ip
# Should be denied
```

### Verify sudo works

```bash
su - site
sudo whoami
# Enter site user's password
# Should output: root
exit
```

## Complete Setup Script

Run this entire block as root:

```bash
# Create user with interactive password prompt
adduser --gecos "Polypoint Site" site

# Grant sudo access
usermod -aG sudo site

# Ensure interactive shell
usermod -s /bin/bash site

# Add user to www-data group
usermod -a -G www-data site

# Set directory permissions for nginx access
chmod 755 /home/site

# Create SSH directory for GitHub keys
sudo -u site mkdir -p /home/site/.ssh
sudo -u site chmod 700 /home/site/.ssh

# Block SSH login
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
grep -q "^DenyUsers" /etc/ssh/sshd_config || echo "DenyUsers site" >> /etc/ssh/sshd_config
systemctl reload ssh

# Verify
echo "=== Verification ==="
getent passwd site | cut -d: -f1,7
echo "Try: su - site"
echo "SSH should be denied from remote hosts"
```

## Troubleshooting

### Can't su to site user

Check the shell:
```bash
getent passwd site | cut -d: -f7
```

If it shows `/usr/sbin/nologin`, fix it:
```bash
sudo usermod -s /bin/bash site
```

### SSH block not working

Verify SSH config:
```bash
sudo grep -E "DenyUsers|AllowGroups" /etc/ssh/sshd_config
```

Check SSH is reloaded:
```bash
sudo systemctl status ssh
```

Test from remote:
```bash
ssh -v site@your-server-ip
# Should see "Access denied" or similar
```

### Sudo not working

Check group membership:
```bash
groups site
# Should include: sudo
```

If missing:
```bash
sudo usermod -aG sudo site
```

## Next Steps

After creating the site user:

1. Switch to site user: `su - site`
2. Create apps directory: `mkdir -p ~/apps`
3. Set up GitHub SSH keys for cloning (see [github-ssh-setup.md](./github-ssh-setup.md))
4. Continue with application deployment