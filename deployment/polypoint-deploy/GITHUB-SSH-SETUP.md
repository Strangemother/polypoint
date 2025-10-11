# GitHub SSH Key Setup

Set up SSH key authentication for cloning private repositories from GitHub.

> **Note:** For public repositories, you can skip this and use HTTPS clone instead.

## Step 1: Generate SSH Key on Server

As the `site` user:

```bash
ssh-keygen -t ed25519 -C "site@polypointjs.com"
```

When prompted:
- **File location**: Press Enter (uses default `~/.ssh/id_ed25519`)
- **Passphrase**: Press Enter twice (no passphrase for automated access)

## Step 2: Display the Public Key

```bash
cat ~/.ssh/id_ed25519.pub
```

Copy the entire output (starts with `ssh-ed25519`).

## Step 3: Add Key to GitHub

1. Go to: https://github.com/settings/keys
2. Click **"New SSH key"**
3. **Title**: `polypointjs.com server` (or any descriptive name)
4. **Key type**: Authentication Key
5. **Key**: Paste the public key from Step 2
6. Click **"Add SSH key"**

## Step 4: Test the Connection

```bash
ssh -T git@github.com
```

You should see:
```
Hi Strangemother! You've successfully authenticated, but GitHub does not provide shell access.
```

## Step 5: Clone Repository

Now you can clone using SSH:

```bash
git clone git@github.com:Strangemother/polypoint.git
```

## Troubleshooting

### Issue: Permission denied (publickey)

**Fix:** Verify the key was added correctly
```bash
# Check your public key
cat ~/.ssh/id_ed25519.pub

# Test connection with verbose output
ssh -vT git@github.com
```

### Issue: Host key verification failed

**Fix:** Accept GitHub's host key
```bash
ssh-keyscan github.com >> ~/.ssh/known_hosts
```

Or answer "yes" when prompted during first connection.

### Issue: Using wrong key

**Fix:** Explicitly specify the key
```bash
# Add to ~/.ssh/config
cat >> ~/.ssh/config << EOF
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519
EOF
```

## Using Different Keys for Different Repos

If you need multiple GitHub accounts:

```bash
# Create ~/.ssh/config
cat >> ~/.ssh/config << EOF
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_personal

Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_work
EOF
```

Then clone with:
```bash
git clone git@github-work:company/repo.git
```

## Deploy Keys (Recommended for Servers)

For production servers, use **Deploy Keys** instead of personal SSH keys:

1. Generate a key specifically for this repo:
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/polypoint_deploy -C "deploy@polypointjs.com"
   ```

2. Add to GitHub: Repo → Settings → Deploy keys → Add deploy key

3. Use read-only (safer) or read-write (if pushing needed)

4. Configure git to use this key:
   ```bash
   git config core.sshCommand "ssh -i ~/.ssh/polypoint_deploy"
   ```

## Security Best Practices

1. **Use deploy keys** for servers, not personal keys
2. **Set read-only** if you don't need to push from server
3. **Use different keys** for different servers/environments
4. **Regularly rotate keys** (every 6-12 months)
5. **Remove old keys** from GitHub when servers are decommissioned

## Alternative: HTTPS with Personal Access Token

For public repos or if you prefer HTTPS:

```bash
# Clone with HTTPS
git clone https://github.com/Strangemother/polypoint.git

# For private repos, use a Personal Access Token
git clone https://[TOKEN]@github.com/Strangemother/polypoint.git
```

Generate token at: https://github.com/settings/tokens

## Converting Existing Clone from HTTPS to SSH

If you already cloned with HTTPS:

```bash
cd ~/apps/polypoint
git remote set-url origin git@github.com:Strangemother/polypoint.git
```

Verify:
```bash
git remote -v
```

Should show SSH URLs starting with `git@github.com:`.
