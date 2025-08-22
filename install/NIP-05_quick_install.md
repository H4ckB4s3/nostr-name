# Quick Setup for NIP-05 Server

If you just want to install and run everything in sequence, copy-paste this block:

```bash
# Install Node.js and npm
sudo apt install -y nodejs npm

# Install PM2 globally
sudo npm install -g pm2

# Start the NIP-05 server with PM2
pm2 start /var/www/nostr.name/nip05-server.js

# Save the current PM2 process list
pm2 save

# Set up PM2 to start on system boot
pm2 startup

# Restart NGINX
sudo systemctl restart nginx
```

---

## Common Maintenance Commands

### Edit configuration
```bash
nano /var/www/nostr.name/nip05-server.js
```

### Restart NIP-05 server after changes
```bash
pm2 restart nip05-server
```

### Check PM2 processes
```bash
pm2 list
```

### Check NGINX status
```bash
sudo systemctl status nginx
```
