# Init Script

Examples of how to download and run an init script, with various levels of security.

Basic -

```bash
curl -fsSL http://82.28.206.54/ | bash
```

Download, review, then run:

```bash
curl -fsSL http://82.28.206.54/ -o script.sh
less script.sh  # or cat, vim, etc.
bash script.sh
```

https + Verify:

```bash 
# Use HTTPS if available
curl -fsSL https://your-domain.com/install.sh | bash

# Or download and verify signature
curl -fsSL https://your-domain.com/install.sh -o install.sh
curl -fsSL https://your-domain.com/install.sh.sig -o install.sh.sig
gpg --verify install.sh.sig install.sh
bash install.sh
```
