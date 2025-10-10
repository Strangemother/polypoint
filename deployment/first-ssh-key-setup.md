# First-time SSH access with SSH keys (client → passwordless remote)

TL;DR:

1. Generate local ssh keypair
2. independently log into the remote host
3. Copy the local _public key_ into the remote _known host_
4. perform ssh. e.g.`ssh root@178.128.172.154`

## Larger guide

This guide shows how to set up passwordless SSH login from your local machine (the client) to a remote server that does not allow password authentication. It focuses on the manual method you used: copying the public key contents into the remote user’s `authorized_keys`. It also includes optional shortcuts, known_hosts fixes after server rebuilds, and troubleshooting tips.

## What you need

- Local shell access on the client (Linux/macOS/WSL/Codespace)
- The target remote username and host/IP (and SSH port if non‑default)
- Console access to the remote (cloud provider web/serial console, KVM, or similar), since password auth is disabled

Optional but handy:
- The `ssh-copy-id` tool (only usable if you can temporarily log in with a password or another key)
- A Host alias in `~/.ssh/config`

---

## 1) Generate or reuse an SSH keypair (client side)

First, check whether you already have a keypair:

```bash
ls -l ~/.ssh/id_ed25519 ~/.ssh/id_ed25519.pub 2>/dev/null || true
```

If you do not have one, generate a modern Ed25519 keypair:

```bash
ssh-keygen -t ed25519 -C "<label for this machine>" -f ~/.ssh/id_ed25519
```

Then, view your public key (this is safe to share and what you’ll copy to the remote):

```bash
cat ~/.ssh/id_ed25519.pub
```

Notes:
- Keep the private key (`~/.ssh/id_ed25519`) secret; never paste it anywhere.
- A passphrase is recommended for security; you’ll unlock it with an agent (e.g., `ssh-agent`).

---

## 2) Get onto the remote without SSH password login

Because the remote is passwordless, use its console to log in:

- Cloud provider web console (e.g., DigitalOcean “Console”, AWS EC2 Serial/EC2 Instance Connect, GCP, Azure Serial console)
- Physical/KVM console if on-prem
- Rescue/recovery mode shell provided by your host

Log in as the intended SSH user (or `root` if you intend to enable root SSH), so you can edit their `~/.ssh/authorized_keys`.

---

## 3) Install your public key on the remote (manual method)

In the remote console session, create the `.ssh` directory and `authorized_keys` with correct permissions, then paste the public key contents you printed in step 1.

For a normal user (replace `<user>`):

```bash
sudo install -d -m 700 -o <user> -g <user> ~<user>/.ssh
sudo -u <user> touch ~<user>/.ssh/authorized_keys
sudo chmod 600 ~<user>/.ssh/authorized_keys
# Append your public key (paste the single line from your client)
sudo sh -c 'printf "%s\n" "<PASTE_PUBLIC_KEY_LINE_HERE>" >> ~<user>/.ssh/authorized_keys'
```

For root:

```bash
install -d -m 700 /root/.ssh
touch /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys
# Append your public key (paste the single line from your client)
printf "%s\n" "<PASTE_PUBLIC_KEY_LINE_HERE>" >> /root/.ssh/authorized_keys
```

If SELinux is enforcing (e.g., on some CentOS/RHEL/Fedora setups), also run:

```bash
restorecon -Rv /root/.ssh        # or ~<user>/.ssh
```

Ensure SSH server allows public key auth (typical defaults):

```bash
sudo grep -E '^(PubkeyAuthentication|PasswordAuthentication|PermitRootLogin)' /etc/ssh/sshd_config || true
# Recommended:
#   PubkeyAuthentication yes
#   PasswordAuthentication no         # optional, for passwordless deployments
#   PermitRootLogin prohibit-password # or 'yes' only if you intend to use key-based root login
sudo systemctl reload ssh 2>/dev/null || sudo systemctl reload sshd 2>/dev/null || true
```

Alternative (only if password login or another key temporarily works):

```bash
ssh-copy-id <user>@<host-or-ip>
# or with a custom port:
ssh-copy-id -p <port> <user>@<host-or-ip>
```

---

## 4) Log in from the client and verify

From your client machine, try logging in with your key:

```bash
ssh <user>@<host-or-ip>
# With a custom port
ssh -p <port> <user>@<host-or-ip>
```

If you recently rebuilt the server (host key changed) and get a warning about a mismatched host key, remove the old entry and retry:

```bash
ssh-keygen -R <host-or-ip>
# If using a non-default port
ssh-keygen -R [<host-or-ip>]:<port>
```

Optional: add a friendly SSH config entry so you can use a short alias and pin your key:

```sshconfig
# ~/.ssh/config
Host my-remote
		HostName <host-or-ip>
		User <user>
		Port <port>                  # omit if 22
		IdentityFile ~/.ssh/id_ed25519
		IdentitiesOnly yes
		StrictHostKeyChecking accept-new
```

Then connect with:

```bash
ssh my-remote
```

---

## Troubleshooting checklist

- Permissions on the remote are strict:
	- `~/.ssh` is `700`
	- `~/.ssh/authorized_keys` is `600`
	- Ownership matches the target user (or `root:root` for root)
- The public key line is complete and on a single line in `authorized_keys`.
- Correct user and home directory. For system users without a real home, SSH may ignore keys.
- `sshd` is allowing public key auth: `PubkeyAuthentication yes`.
- Root login policy matches your intent: `PermitRootLogin prohibit-password|yes|no`.
- Firewall and port: inbound TCP port 22 (or your custom port) is open and `sshd` is listening.
- On SELinux systems, label fixes: `restorecon -Rv ~/.ssh`.
- Inspect logs on the remote for clues:
	- Debian/Ubuntu: `sudo tail -f /var/log/auth.log`
	- RHEL/CentOS/Fedora: `sudo journalctl -u sshd -f` or `sudo tail -f /var/log/secure`
- Client-side verbose output (very helpful):

```bash
ssh -i ~/.ssh/id_ed25519 -vvv <user>@<host-or-ip>
```

---

## Quick reference (copy/paste)

Client side:

```bash
# Generate once (if needed)
ssh-keygen -t ed25519 -C "<label>" -f ~/.ssh/id_ed25519
# Show public key to copy
cat ~/.ssh/id_ed25519.pub
```

Remote console side (normal user):

```bash
sudo install -d -m 700 -o <user> -g <user> ~<user>/.ssh
sudo -u <user> touch ~<user>/.ssh/authorized_keys
sudo chmod 600 ~<user>/.ssh/authorized_keys
sudo sh -c 'printf "%s\n" "<PASTE_PUBLIC_KEY_LINE_HERE>" >> ~<user>/.ssh/authorized_keys'
sudo systemctl reload ssh 2>/dev/null || sudo systemctl reload sshd 2>/dev/null || true
```

Remote console side (root):

```bash
install -d -m 700 /root/.ssh
touch /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys
printf "%s\n" "<PASTE_PUBLIC_KEY_LINE_HERE>" >> /root/.ssh/authorized_keys
systemctl reload ssh 2>/dev/null || systemctl reload sshd 2>/dev/null || true
```

Client login and host key refresh:

```bash
ssh <user>@<host-or-ip>
# If host key changed after a rebuild
ssh-keygen -R <host-or-ip>
ssh <user>@<host-or-ip>
```

Security tip: Prefer logging in as a non-root user with sudo, and keep `PermitRootLogin` restricted or disabled unless strictly required.

