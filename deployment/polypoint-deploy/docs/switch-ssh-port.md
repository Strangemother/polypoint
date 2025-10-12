# Change SSH Port

Change SSH from default port 22 to a non-standard port.

## Prerequisites

- Root or sudo access to the server
- **Note**: Keep your current SSH session open while making changes.

## Choose a Port

Pick a good port:

- **Recommended range**: 1024-65535 (unprivileged ports)
- This setup port: `32432`

## Step 1: Check Port Availability

Using the `ss` command:

```bash
sudo ss -tlnp | grep :32432
```

If nothing is returned, the port is free. If you see output, choose a different port.

## Step 2: Backup SSH Config

```bash
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
```

## Step 3: Disable Socket Activation (Ubuntu 24.04+)

Modern Ubuntu uses systemd socket activation which overrides the port in `sshd_config`. Disable it:

```bash
sudo systemctl stop ssh.socket
sudo systemctl disable ssh.socket
sudo systemctl mask ssh.socket
```

Verify it's disabled:

```bash
sudo systemctl status ssh.socket
```

Should show `Loaded: masked` and `Active: inactive (dead)`.

## Step 4: Edit SSH Configuration

```bash
sudo nano /etc/ssh/sshd_config
```

Find the line:

```
#Port 22
```

Change it to (uncomment and set your port):

```
Port 32432
```

Save and close the file.

## Step 5: Update Firewall (UFW)

Allow the new SSH port:

```bash
sudo ufw allow 32432/tcp
sudo ufw status
```

Verify you see:

```bash
32432/tcp                  ALLOW       Anywhere
```

> **Note**: Do not remove port 22 from firewall yet. 
>
> Test the new port first.

## Step 6: Restart SSH Service

```bash
sudo systemctl restart ssh
```

Check the status:

```bash
sudo systemctl status ssh
```

Should show `Active: active (running)` and **should NOT show** `TriggeredBy: ● ssh.socket`.

Verify SSH is listening on new port:

```bash
sudo ss -tlnp | grep sshd
```

Should show `:32432` NOT `:22`. Example output:

```
LISTEN 0      128    0.0.0.0:32432    0.0.0.0:*    users:(("sshd",pid=5159,fd=3))
LISTEN 0      128       [::]:32432       [::]:*    users:(("sshd",pid=5159,fd=4))
```

## Step 7: Test New Port

> **Do not close your current ssh session until success.**

From another terminal/window on your local machine, test the new port:

```bash
ssh -p 32432 root@178.128.172.154
```

Or with a different user:

```bash
ssh -p 32432 site@polypointjs.com
```

If it fails, you still have your original session to fix it.

## Step 8: Remove Old Port from Firewall

**Only after confirming the new port works!**

```bash
sudo ufw delete allow 22/tcp
sudo ufw status
```

Verify port 22 is removed and 32432 is still there.

## Step 9: Verify Configuration

Check SSH is only listening on new port:

```bash
sudo ss -tlnp | grep sshd
```

Should only show the new port (32432), not 22.

Confirm socket activation is disabled:

```bash
sudo systemctl status ssh.socket
```

Should show `Loaded: masked` and `Active: inactive (dead)`.

## Quick Reference

After setup, your connections will use:

```bash
# Direct connection
ssh -p 32432 user@server

# With SSH config
ssh polypointjs

# SCP with custom port
scp -P 32432 file user@server:/path/

# Git with custom port
git clone ssh://git@github.com:32432/user/repo.git
```

## Reverting Changes

If you need to go back to port 22:

```bash
sudo nano /etc/ssh/sshd_config
# Change Port back to 22

sudo systemctl restart sshd
sudo ufw allow 22/tcp
sudo ufw delete allow 32432/tcp
```

