# First SSH Key Setup

Initial SSH key setup for a fresh server using the DigitalOcean web console.

TL;DR:

1. Grab _local_ key: `cat ~/.ssh/id_ed25519.pub`
2. Save into _remote_: `nano ~/.ssh/authorized_keys`

This tutorial assumes you have access to the remote server (via a root login), and can edit the `~./.ssh/authorized_keys` file.

## Step 1: Generate local SSH Key (If required)

On your **local machine**, generate a new key:

```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
```

Or find and use and existing key:

```bash
ls -la ~/.ssh/id_*.pub
```

## Step 2: Copy Your Public Key

On your **local machine** copy the public key:

```bash
cat ~/.ssh/id_ed25519.pub
```

## Step 3: Remote

In the **remote** console, (logged in as the core user. E.g. `root`)

If required, create the `.ssh` directory:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
```

Paste the public key into the `authorized_keys` file:

```bash
nano ~/.ssh/authorized_keys
```

Ensure the file has correct permissions:

```bash
chmod 600 ~/.ssh/authorized_keys
```

## Step 4: Test SSH Connection

From your **local machine**:

```bash
ssh root@178.128.172.154 
# or expanded:
ssh root@178.128.172.154 -p 22 -i ~/.ssh/id_ed25519 
```

If this is your first connection after removing old host keys:

```bash
# If you get "Host key verification failed", remove old key first:
ssh-keygen -R 178.128.172.154

# Then try again:
ssh root@178.128.172.154
```

## Step 5: (Optional) Disable Password Authentication

For security, disable password login once SSH keys work:

```bash
sudo nano /etc/ssh/sshd_config
```

Find and ensure these lines are set:

```bash
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin prohibit-password
```

Restart SSH:

```bash
sudo systemctl restart sshd
```

---

## Next Steps

Consider switching SSH to a non-standard port for added security:  [Switch SSH Port](switch-ssh-port.md)
