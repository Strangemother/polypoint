# Create Site User

+ username: `site`
+ password: `goto window for waiting`


```bash
sudo adduser --gecos "Polypoint Site" site
sudo usermod -aG sudo site
sudo usermod -s /bin/bash site   # ensure an interactive shell for local 'su - site'

sudo -u site mkdir -p /home/site/.ssh
sudo -u site chmod 700 /home/site/.ssh
sudo -u site touch /home/site/.ssh/authorized_keys
sudo -u site chmod 600 /home/site/.ssh/authorized_keys
```

Verify the shell is interactive (should be /bin/bash):

```bash
getent passwd site | cut -d: -f1,7
# Expected: site:/bin/bash
```


Harden SSH (optional but recommended):

```bash
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
sudoedit /etc/ssh/sshd_config
# Recommended changes:
#   PasswordAuthentication no
#   PermitRootLogin no
#   PubkeyAuthentication yes
#   # Explicitly block SSH for the 'site' user (choose one approach).
#   # Recommended way to keep local 'su - site' working is to use DenyUsers:
#   # 1) Deny only the 'site' user:
#   DenyUsers site
#   # 2) OR allow only a specific admin group and exclude 'site':
#   # AllowGroups sshadmins
#   # Then add admins to 'sshadmins' and ensure 'site' is NOT a member.
sudo systemctl reload ssh
```

login:

```
su - site
```

## Prevent SSH access for the `site` user

Apply one or more of these layers (defense-in-depth):

1) Block at sshd (most direct)

```bash
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
sudo bash -lc 'grep -q "^DenyUsers" /etc/ssh/sshd_config && sudo sed -i "s/^DenyUsers.*/DenyUsers site/" /etc/ssh/sshd_config || echo "DenyUsers site" | sudo tee -a /etc/ssh/sshd_config'
sudo systemctl reload ssh || sudo systemctl reload sshd
```

Alternatively, allow only a controlled group (e.g., `sshadmins`) to SSH:

```bash
sudo groupadd -f sshadmins
sudo usermod -aG sshadmins <your-admin-user>
echo 'AllowGroups sshadmins' | sudo tee -a /etc/ssh/sshd_config
sudo systemctl reload ssh || sudo systemctl reload sshd
```

Ensure `site` is not a member of `sshadmins`.

2) Give `site` a non-login shell (prevents interactive logins including SSH)

WARNING: This will also break local `su - site` and produce the message:

"This account is currently not available."

```bash
sudo usermod -s /usr/sbin/nologin site  # Debian/Ubuntu
# or on some distros:
# sudo usermod -s /sbin/nologin site
```

To restore local access later, switch back to an interactive shell:

```bash
sudo usermod -s /bin/bash site
```

3) Remove sudo rights (principle of least privilege)

```bash
sudo deluser site sudo 2>/dev/null || sudo gpasswd -d site sudo || true
```

4) Optional: disable the account (cannot log in at all)

```bash
sudo usermod -L site   # lock password (no password login)
# To completely expire account:
# sudo usermod -e 1 site
```

Verification:

```bash
# From another session, SSH should fail for 'site':
ssh site@<host-or-ip>

# Check effective shell:
getent passwd site | cut -d: -f7

# Check sshd decisions live (Debian/Ubuntu):
sudo tail -f /var/log/auth.log
# RHEL/CentOS/Fedora:
# sudo journalctl -u sshd -f
```

Troubleshooting: If `su - site` prints "This account is currently not available.", the shell is set to `nologin` or `false`. Fix with:

```bash
sudo usermod -s /bin/bash site
```

Note: You can still use `su - site` locally for service ownership or file operations if the shell is interactive (e.g., `/bin/bash`) while keeping SSH access blocked via `DenyUsers site` or `AllowGroups`.