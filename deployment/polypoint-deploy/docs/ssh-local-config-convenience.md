# Update SSH Config on Local Machine

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
