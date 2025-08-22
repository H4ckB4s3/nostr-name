# Setting Up Ubuntu VPS for Nginx with Let's Encrypt Wildcard SSL

This guide provides step-by-step instructions to set up an Ubuntu VPS with Nginx and a Let's Encrypt wildcard SSL certificate for `nostr.name` and `*.nostr.name`.

## 1. Initial Server Setup

Update the system and install required packages.

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx certbot python3-certbot-nginx git
```

## 2. Create Website Directory

Set up the directory for your website and configure permissions.

```bash
sudo mkdir -p /var/www/nostr.name
sudo chown -R $USER:$USER /var/www/nostr.name
sudo chmod -R 755 /var/www
```

## 3. Set Up DNS Records

Ensure the following DNS records are configured for your domain:

- **A record**: `nostr.name` pointing to your server's IP address.
- **Wildcard A record**: `*.nostr.name` pointing to your server's IP address.

## 4. Obtain Let's Encrypt Wildcard Certificate

Run the following command to obtain a wildcard SSL certificate.

```bash
sudo certbot certonly --manual --preferred-challenges=dns --agree-tos --no-eff-email -d nostr.name -d *.nostr.name --register-unsafely-without-email
```

Follow the prompts to add a TXT record to your DNS when requested.

## 5. Set Up Auto-Renewal

Test the certificate renewal process and schedule automatic renewals.

```bash
# Test renewal
sudo certbot renew --dry-run

# Schedule daily renewal at 12:00 PM
(sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | sudo crontab -
```

## 6. Create Nginx Configuration

Create a new Nginx configuration file.

```bash
sudo nano /etc/nginx/sites-available/nostr.name
```

Paste the following configuration:

```nginx
server {
    listen 80;
    server_name nostr.name *.nostr.name;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name nostr.name *.nostr.name;
    
    root /var/www/nostr.name;
    index index.html;
    
    ssl_certificate /etc/letsencrypt/live/nostr.name/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nostr.name/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

Save and exit (`Ctrl+X`, then `Y`, then `Enter`).

## 7. Enable the Site

Enable the Nginx configuration and restart the server.

```bash
sudo ln -s /etc/nginx/sites-available/nostr.name /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 8. Create a Test HTML File

Create a simple test page to verify the setup.

```bash
echo "<html><body><h1>Welcome to nostr.name!</h1></body></html>" > /var/www/nostr.name/index.html
```

## 9. Verify Setup

- Visit `https://nostr.name` in your browser to confirm the test page loads with SSL.
- Test a subdomain like `https://test.nostr.name` to ensure the wildcard SSL works.

## Important Files and Locations

- **Nginx config**: `/etc/nginx/sites-available/nostr.name`
- **Website files**: `/var/www/nostr.name`
- **SSL certificates**: `/etc/letsencrypt/live/nostr.name/`
- **Nginx logs**: `/var/log/nginx/`
