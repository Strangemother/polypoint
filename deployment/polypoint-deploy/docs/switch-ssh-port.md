# Change SSH Port - Security Hardening

Quick guide to change SSH from default port 22 to a non-standard port to reduce automated attack attempts.

## Why Change the SSH Port?

- Reduces automated brute-force attacks targeting port 22
- Makes port scans less likely to identify SSH service
- Adds security through obscurity (not a replacement for proper auth!)
- Keeps logs cleaner from constant attack attempts

## Prerequisites

- Root or sudo access to the server
- Current SSH connection working on port 22
- **IMPORTANT**: Keep your current SSH session open while making changes!

## Choose a Port

Pick a high-numbered port that's not in use:
- **Recommended range**: 1024-65535 (unprivileged ports)
- **Common choices**: 2222, 2022, 32022, 49152
- **Example we'll use**: 32432

Avoid these ports:
- Below 1024 (privileged, may conflict with services)
- Common service ports (3306, 5432, 8080, etc.)
- Ports already in use

## Step 1: Check Port Availability

First, install `netstat` if needed (or use the `ss` alternative):

```bash
# Option 1: Install netstat (part of net-tools)
sudo apt update && sudo apt install -y net-tools

# Then check the port
sudo netstat -tlnp | grep :32432

# Option 2: Use ss (pre-installed, modern alternative)
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

## Step 5: Update Firewall (UFW)

Allow the new SSH port:

```bash
sudo ufw allow 32432/tcp
sudo ufw status
```

Verify you see:
```
32432/tcp                  ALLOW       Anywhere
```

> **CRITICAL**: Do NOT remove port 22 from firewall yet! Test the new port first.

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
# Using ss (pre-installed)
sudo ss -tlnp | grep sshd
```

Should show `:32432` NOT `:22`. Example output:
```
LISTEN 0      128    0.0.0.0:32432    0.0.0.0:*    users:(("sshd",pid=5159,fd=3))
LISTEN 0      128       [::]:32432       [::]:*    users:(("sshd",pid=5159,fd=4))
```

## Step 7: Test New Port (CRITICAL!)

**DO NOT CLOSE YOUR CURRENT SSH SESSION YET!**

From another terminal/window on your local machine, test the new port:

```bash
ssh -p 32432 root@178.128.172.154
```

Or with a different user:

```bash
ssh -p 32432 site@polypointjs.com
```

If this works, proceed to Step 8. If it fails, you still have your original session to fix it!

## Step 8: Update SSH Config on Local Machine (Optional)

For easier connections, add to `~/.ssh/config` on your **local machine**:

```bash
nano ~/.ssh/config
```

Add:

```
Host polypointjs
    HostName 178.128.172.154
    User root
    Port 32432
    IdentityFile ~/.ssh/id_ed25519

Host polypointjs-site
    HostName 178.128.172.154
    User site
    Port 32432
    IdentityFile ~/.ssh/id_ed25519
```

Now you can connect with:

```bash
ssh polypointjs
ssh polypointjs-site
```

## Step 9: Remove Old Port from Firewall

**Only after confirming the new port works!**

```bash
sudo ufw delete allow 22/tcp
sudo ufw status
```

Verify port 22 is removed and 32432 is still there.

## Step 10: Verify Configuration

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

## Troubleshooting

### Can't connect on new port

**Don't panic!** You should still have your original SSH session open.

1. Check SSH is running:
```bash
sudo systemctl status sshd
```

2. Check firewall allows new port:
```bash
sudo ufw status | grep 32432
```

3. Check SSH config:
```bash
grep "^Port" /etc/ssh/sshd_config
```

4. Check what ports SSH is actually listening on:
```bash
# Using netstat (if installed)
sudo netstat -tlnp | grep sshd

# Or using ss (pre-installed)
sudo ss -tlnp | grep sshd
```

5. Check for errors:
```bash
sudo journalctl -u sshd -n 50
```

### Locked out completely

If you closed your session before testing:

1. Use DigitalOcean console (web-based terminal)
2. Revert the SSH config:
```bash
sudo cp /etc/ssh/sshd_config.backup /etc/ssh/sshd_config
sudo systemctl restart sshd
```

3. Re-open port 22 in firewall:
```bash
sudo ufw allow 22/tcp
```

### Firewall blocking connections

If you forgot to open the new port:

```bash
sudo ufw allow 32432/tcp
sudo ufw reload
```

### SELinux blocking (if enabled)

On systems with SELinux:

```bash
sudo semanage port -a -t ssh_port_t -p tcp 32432
```

## Security Notes

1. **Not a complete solution**: Changing the port helps reduce noise, but proper security requires:
   - Strong SSH keys (not passwords)
   - Fail2ban or similar intrusion prevention
   - Regular security updates
   - Proper user access controls

2. **Keep port number secure**: Don't advertise your SSH port publicly

3. **Document the change**: Store the port number in your password manager or secure documentation

4. **Update automation**: If you have scripts or CI/CD connecting via SSH, update them with the new port

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

---

**Summary**: SSH port changed from 22 → 32432. Always test before removing the old port from the firewall!
