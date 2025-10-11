# First SSH Key Setup - DigitalOcean Console Method

Initial SSH key setup for a fresh server using the DigitalOcean web console.

TL;DR:

1. Grab _local_ key: `cat ~/.ssh/id_ed25519.pub`
2. Save into _remote_: `nano ~/.ssh/authorized_keys`

## When to Use This Guide

- Fresh server with no SSH keys configured
- Server only accepts public key authentication (no password login)
- First-time connection to a new droplet

## Prerequisites

- DigitalOcean account with access to your droplet
- SSH key pair on your local machine (if not, generate one first)

## Step 1: Generate SSH Key (If Needed)

On your **local machine**, check if you have a key:

```bash
ls -la ~/.ssh/id_*.pub
```

If no keys exist, generate one:

```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
# Press Enter to accept default location
# Press Enter twice for no passphrase (or set one if you prefer)
```

## Step 2: Copy Your Public Key

On your **local machine**:

```bash
cat ~/.ssh/id_ed25519.pub
```

**Copy the entire output** (starts with `ssh-ed25519` and ends with your email/comment).

Example output:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... your-email@example.com
```

## Step 3: Access DigitalOcean Console

1. Log into [DigitalOcean](https://cloud.digitalocean.com/)
2. Click on your droplet
3. Click **"Access"** in the left sidebar
4. Click **"Launch Droplet Console"** or **"Launch Recovery Console"**
5. Wait for the console to load (may take a few seconds)

## Step 4: Login to Server

In the console, login as root:

```
Ubuntu 24.04 polypointjs login: root
Password: [paste or type root password]
```

> **Note**: The console may have paste issues. Try right-click paste or Ctrl+Shift+V.

## Step 5: Create SSH Directory

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
```

## Step 6: Add Your Public Key

```bash
nano ~/.ssh/authorized_keys
```

- Paste your public key (the one you copied in Step 2)
- Press `Ctrl+X` to exit
- Press `Y` to confirm save
- Press `Enter` to confirm filename

## Step 7: Set Correct Permissions

```bash
chmod 600 ~/.ssh/authorized_keys
```

## Step 8: Verify the Key

```bash
cat ~/.ssh/authorized_keys
```

Should show your public key. Verify it matches what you copied.

## Step 9: Test SSH Connection

From your **local machine**:

```bash
ssh root@178.128.172.154
```

If this is your first connection after removing old host keys:

```bash
# If you get "Host key verification failed", remove old key first:
ssh-keygen -R 178.128.172.154

# Then try again:
ssh root@178.128.172.154
```

You should now be logged in without a password!

## Step 10: (Optional) Disable Password Authentication

For security, disable password login once SSH keys work:

```bash
sudo nano /etc/ssh/sshd_config
```

Find and ensure these lines are set:

```
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin prohibit-password
```

Restart SSH:

```bash
sudo systemctl restart sshd
```

## Troubleshooting

### Console won't let me paste

Try these methods:
1. Right-click → Paste
2. Ctrl+Shift+V (Linux/Windows) or Cmd+V (Mac)
3. Type the key manually (not recommended - error-prone)
4. Use the recovery console instead of regular console

### Permission denied after adding key

Check permissions:
```bash
ls -la ~/.ssh/
# Should show:
# drwx------ (700) for .ssh directory
# -rw------- (600) for authorized_keys file
```

Fix if needed:
```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Wrong key format

Verify your public key:
```bash
# Should start with one of these:
ssh-rsa AAAA...
ssh-ed25519 AAAA...
ecdsa-sha2-nistp256 AAAA...

# Should end with a comment (usually email)
```

Make sure you copied the **.pub** file, not the private key!

### Multiple keys on local machine

If you have multiple SSH keys, specify which one to use:

```bash
ssh -i ~/.ssh/id_ed25519 root@178.128.172.154
```

Or add to `~/.ssh/config`:
```
Host 178.128.172.154
    IdentityFile ~/.ssh/id_ed25519
```

### Still can't connect

Check the server's auth log (in DigitalOcean console):

```bash
sudo tail -f /var/log/auth.log
```

Try connecting from your local machine in another terminal and watch for errors.

## Common Mistakes

1. **Copying private key instead of public** - Use `.pub` file!
2. **Extra whitespace or newlines** - Key should be one line
3. **Wrong permissions** - Must be 700 for directory, 600 for file
4. **Key in wrong location** - Must be in `~/.ssh/authorized_keys`
5. **Accidentally added to known_hosts** - That's a different file!

## After Successful Setup

Once SSH key login works:

1. ✅ Test you can login: `ssh root@178.128.172.154`
2. ✅ Close the DigitalOcean console
3. ✅ Disable password authentication (optional but recommended)
4. ✅ Continue with [CREATE-SITE-USER.md](./CREATE-SITE-USER.md)

## Alternative: Add Key During Droplet Creation

**Best practice**: Add your SSH key when creating the droplet in DigitalOcean:

1. When creating a droplet
2. Under "Authentication"
3. Select "SSH keys"
4. Click "New SSH Key"
5. Paste your public key
6. Give it a name
7. The key will be automatically added to root's authorized_keys

This avoids needing the console method entirely!

## Security Notes

- **Never share your private key** (the file without `.pub`)
- **Keep private key secure** - Don't commit to git, don't email
- **Use different keys** for different purposes/servers (optional)
- **Add passphrase** to private key for extra security (optional)
- **Backup your keys** - Store securely off-machine

---

**Next Steps**: Once root SSH access works, proceed to [CREATE-SITE-USER.md](./CREATE-SITE-USER.md) to create the `site` user.
