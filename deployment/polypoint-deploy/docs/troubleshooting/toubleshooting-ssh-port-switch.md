
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
