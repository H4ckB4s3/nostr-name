# Installation Guide for NIP-05 Server

This guide provides step-by-step instructions to install and configure the NIP-05 server (`nip05-server.js`).

---

## Installation

### Create nip05-server.js configuration file
```bash
nano /var/www/nostr.name/nip05-server.js
```

### Install Node.js and npm
```bash
sudo apt install nodejs npm
```

### Install PM2 globally
```bash
sudo npm install -g pm2
```

### Start the NIP-05 server with PM2
```bash
pm2 start /var/www/nostr.name/nip05-server.js
```

---

## Making PM2 Persistent Across Server Reboots

### Save the current PM2 process list
```bash
pm2 save
```

### Set up PM2 to start on system boot
```bash
pm2 startup
```

---

## Updating Configuration

### Edit the nip05-server.js configuration file
```bash
nano /var/www/nostr.name/nip05-server.js
```

### Restart the NIP-05 server to apply changes
```bash
pm2 restart nip05-server
```

### Restart NGINX
```bash
sudo systemctl restart nginx
```

---

## Verification

### Ensure the server is running by checking the PM2 process list
```bash
pm2 list
```

### Verify NGINX is running
```bash
sudo systemctl status nginx
```
