# Quick Install for Nginx and Certbot on Ubuntu

Run the following command to set up Nginx, obtain an SSL certificate for `nostr.name` and `*.nostr.name`, and configure a basic web server:

```bash
sudo apt update && sudo apt upgrade -y && sudo apt install -y nginx certbot python3-certbot-nginx && sudo mkdir -p /var/www/nostr.name && sudo chown -R $USER:$USER /var/www/nostr.name && sudo chmod -R 755 /var/www && echo "<html><body><h1>Welcome to nostr.name!</h1></body></html>" | sudo tee /var/www/nostr.name/index.html > /dev/null && sudo certbot certonly --manual --preferred-challenges=dns --agree-tos --no-eff-email -d nostr.name -d *.nostr.name --register-unsafely-without-email && (sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | sudo crontab - && echo 'server { listen 80; server_name nostr.name *.nostr.name; return 301 https://$host$request_uri; } server { listen 443 ssl; server_name nostr.name *.nostr.name; root /var/www/nostr.name; index index.html; ssl_certificate /etc/letsencrypt/live/nostr.name/fullchain.pem; ssl_certificate_key /etc/letsencrypt/live/nostr.name/privkey.pem; include /etc/letsencrypt/options-ssl-nginx.conf; ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; location / { try_files $uri $uri/ =404; } }' | sudo tee /etc/nginx/sites-available/nostr.name > /dev/null && sudo ln -s /etc/nginx/sites-available/nostr.name /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl restart nginx
```

**Notes:**
- This command assumes an Ubuntu-based system.
- During the Certbot step, you will be prompted to create DNS TXT records for domain verification.
- Ensure you have DNS control over `nostr.name` to complete the certificate issuance.
- The command sets up a daily cron job at 12:00 PM for certificate renewal.
