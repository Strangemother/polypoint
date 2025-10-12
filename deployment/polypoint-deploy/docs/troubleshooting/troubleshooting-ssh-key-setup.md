
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
