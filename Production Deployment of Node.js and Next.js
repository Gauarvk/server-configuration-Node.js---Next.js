#@ STEP 1 - Initial VPS Security Setup

#Login:
ssh root@your_server_ip

# 1. Update Server
apt update && apt upgrade -y

# 2. Create Non-Root User
adduser deploy
usermod -aG sudo deploy

## Now copy SSH key:
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy

## Login as:
ssh deploy@your_server_ip

# 3. Disable Root Login
## Edit:
sudo nano /etc/ssh/sshd_config

## Change:
    PermitRootLogin no
    PasswordAuthentication no

## Restart SSH:
    sudo systemctl restart ssh

# 4. Enable Firewall (UFW)
    sudo ufw allow OpenSSH
    sudo ufw allow 80
    sudo ufw allow 443
    sudo ufw enable


#@ STEP 2 — Install & Secure MySQL

# Install MySQL
sudo apt install mysql-server -y

## Check:
sudo systemctl status mysql

# Secure MySQL (Very Important)
sudo mysql_secure_installation

## Answer like this:
VALIDATE PASSWORD? → Yes
Password policy → STRONG
Remove anonymous users? → Yes
Disallow root login remotely? → Yes
Remove test database? → Yes
Reload privilege tables? → Yes

# Create Secure Database & User
## Login:
sudo mysql

## Create DB:
CREATE DATABASE myapp_db;

## Create dedicated user (NEVER use root):
CREATE USER 'myapp_user'@'localhost' IDENTIFIED BY 'StrongPassword@123';

## Give permissions:
GRANT ALL PRIVILEGES ON myapp_db.* TO 'myapp_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Extra MySQL Security (Advanced but Recommended)
## Edit:
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

## Make sure:
bind-address = 127.0.0.1

## This means:
✔ MySQL accessible only inside server
❌ Not publicly exposed

## Restart:
sudo systemctl restart mysql

#@ STEP 3 — Install Node + PM2
# Install Node (LTS recommended):
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y

# Check:
node -v
npm -v

# Install PM2:
sudo npm install -g pm2

#@ STEP 4 — Install Nginx
sudo apt install nginx -y

# Allow firewall:
sudo ufw allow 'Nginx Full'

#@ STEP 5 — SSL Setup (Let’s Encrypt)
# Install Certbot:
sudo apt install certbot python3-certbot-nginx -y

# After configuring Nginx domain:
sudo certbot --nginx

#@ STEP 6 — Project Structure (Clean Setup)
/var/www/
    backend/
    frontend/

# Give permission:
sudo chown -R deploy:deploy /var/www

#@ UPLOAD YOUR FILES IN PROJECT FOLDERS UNDER (WWW) LIKE STRUCTURE ALSO THE MYSQL DATABASE AND SAVE THE CREDENTIALS FOR CONNECTION DB

#@ EXTRA SECURITY (Recommended for You)

sudo apt install fail2ban -y

# Prevents brute force attacks.

#@ Disable Unused Ports
# Check open ports:

sudo ss -tulpn

# Only allow:
##22 (SSH)
##80 (HTTP)
##443 (HTTPS)

#@ Automatic Security Updates
sudo apt install unattended-upgrades


# FOR PRODUCTION 
sudo nano /etc/nginx/sites-available/[frontend] //- file name || domain  also remove the brackets

server {
    server_name example.com www.example.com;  // Change Domain Names as Project 

    location / {
        proxy_pass http://localhost:3000;  // change the PORT according to your projects PORT
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    listen 80;
}

# Enable Sites
sudo ln -s /etc/nginx/sites-available/[frontend] /etc/nginx/sites-enabled/   //--  change the filename as the project also remove the brackets

# Test:
sudo nginx -t
sudo systemctl restart nginx

# Enable SSL
sudo certbot --nginx

#@ Now Install & Start (First Manual Deployment)
cd /var/www/backend
npm install
npm run build
pm2 start server.js --name backend




