# Installation Guide for NIP-05 Server

This guide provides step-by-step instructions to install and configure the NIP-05 server (nip05-server.js) .

## Installation

```bash
# Install Node.js and npm
sudo apt install nodejs npm

# Install PM2 globally
sudo npm install -g pm2

# Start the NIP-05 server with PM2
pm2 start /var/www/nostr.name/nip05-server.js

Making PM2 Persistent Across Server Rebootsbash

# Save the current PM2 process list
pm2 save

# Set up PM2 to start on system boot
pm2 startup

# Updating Configurationbash

# Edit the nip05-server.js configuration file
nano /var/www/nostr.name/nip05-server.js

# Restart the NIP-05 server to apply changes
pm2 restart nip05-server

# Restart NGINX
sudo systemctl restart nginx

VerificationEnsure the server is running by checking the PM2 process list:bash

pm2 list

Verify NGINX is running:bash

sudo systemctl status nginx

