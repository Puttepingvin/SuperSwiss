# Initial setup
´´´
sudo apt update
sudo apt upgrade

sudo dd if=/dev/zero of=/swapfile bs=1024 count=1M
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
´´´

add to /etc/fstab
´´´
# Swap file created on 2026-10-22
/swapfile       none    swap    sw      0       0
´´´


# MariaDB
´´´
sudo apt install mariadb-server mariadb-client galera-4
mariadb -u root -p
create user swiss;
grant all privileges on *.* to swiss;
´´´

# Node
´´´
sudo apt install nodejs
sudo apt install npm
´´´

# User setup
´´´
sudo adduser swiss
sudo usermod -L swiss
´´´

# Source code
´´´
sudo apt install git
cd /var/lib/
git clone https://github.com/Puttepingvin/SuperSwiss.git
sudo chown -R swiss SuperSwiss
cd SuperSwiss
´´´

# Deploy
´´´
sudo -u swiss npm ci
sudo -u swiss npm install
sudo -u swiss npx prisma db push
sudo npm run build
´´´
Skipping sudo -u swiss npx prisma migrate deploy

# Systemd
Put this in a file
´´´
# This is systemd installation for the SuperSwiss scheduled service. It
# sould be found in /etc/systemd/system or wherever configured user
# level services are found: `pkg-config systemd
# --variable=systemdsystemconfdir`
#
# Enable with `systemctl enable superswiss.service`
#

[Unit]
Description=Runner of the superswiss nextjs server
Documentation=
After=network.target
Wants=mariadb.service
After=mariadb.service
StartLimitIntervalSec=180
StartLimitBurst=3


[Service]
Type=simple
User=swiss
RestartSec=10
Restart=on-failure
WorkingDirectory=/var/lib/SuperSwiss
StandardOutput=append:/var/log/superswiss.log
StandardError=append:/var/log/superswiss.log
EnvironmentFile=/var/lib/SuperSwiss/.env
ExecStart=npm start

[Install]
WantedBy=multi-user.target
´´´

# nginx
Put under http in conf, comment out include:
´´´
server {
        # SuperSwiss
        listen 80 default_server;
        listen [::]:80 default_server;
        server_name _;

        location / {
                proxy_pass http://localhost:3000;
                proxy_http_version 1.1;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
        }
}
´´´

# SSL
´´´
sudo apt install certbot
sudo apt install python3-certbot-nginx
sudo certbot --nginx -d lottning.patrikandren.se --post-hook "/usr/sbin/service nginx restart"
´´´
