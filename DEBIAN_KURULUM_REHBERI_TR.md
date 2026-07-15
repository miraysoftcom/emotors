# Debian VPS/VDS Kurulum Rehberi

Bu rehber Debian 11 veya Debian 12 icindir.

Debian genelde Ubuntu'ya benzer, ama bazi sunucularda `sudo`, `curl` veya firewall paketleri hazir gelmeyebilir.

## 1. Sunucuya Baglan

```bash
ssh root@SUNUCU_IP_ADRESIN
```

Ornek:

```bash
ssh root@123.45.67.89
```

## 2. Sistemi Guncelle

```bash
apt update
apt upgrade -y
```

## 3. Temel Paketleri Kur

```bash
apt install -y git curl nginx ufw ca-certificates
```

Nginx'i baslat:

```bash
systemctl enable nginx
systemctl start nginx
systemctl status nginx
```

## 4. Node.js Kur

`nvm` kur:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

Terminal ayarlarini yenile:

```bash
source ~/.bashrc
```

Node.js 22 kur:

```bash
nvm install 22
nvm use 22
nvm alias default 22
```

Kontrol:

```bash
node -v
npm -v
```

## 5. PNPM ve PM2 Kur

```bash
npm install -g pnpm pm2
```

Kontrol:

```bash
pnpm -v
pm2 -v
```

## 6. Projeyi GitHub'dan Cek

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/miraysoftcom/emotors.git
cd emotors
```

## 7. Environment Dosyasini Olustur

```bash
nano .env.local
```

Ornek:

```env
NEXT_PUBLIC_SITE_URL=https://domainin.ch
AUTH_SECRET=cok-guclu-bir-secret
ADMIN_EMAIL=admin@domainin.ch
ADMIN_PASSWORD=cok-guclu-bir-admin-sifresi
SETUP_SECRET=gecici-cok-guclu-kurulum-anahtari
DATABASE_URL=
```

Guclu deger uret:

```bash
openssl rand -base64 32
```

## 8. Projeyi Kur

```bash
pnpm install
pnpm run build
```

## 9. PM2 ile Calistir

```bash
pm2 start "pnpm start" --name emotors
pm2 save
pm2 startup
```

`pm2 startup` uzun bir komut verirse onu calistir.

## 10. Nginx Ayarla

```bash
nano /etc/nginx/sites-available/emotors
```

Icine yaz:

```nginx
server {
    listen 80;
    server_name domainin.ch www.domainin.ch;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Aktif et:

```bash
ln -s /etc/nginx/sites-available/emotors /etc/nginx/sites-enabled/emotors
nginx -t
systemctl restart nginx
```

Eger `File exists` derse sorun degil, link zaten vardir.

## 11. Domain DNS Ayari

Domain panelinde:

```text
A Record
domainin.ch -> SUNUCU_IP_ADRESIN

A Record
www.domainin.ch -> SUNUCU_IP_ADRESIN
```

## 12. SSL Kur

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d domainin.ch -d www.domainin.ch
```

Test:

```bash
certbot renew --dry-run
```

## 13. Firewall Ayarla

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

## 14. Siteyi Guncelle

```bash
cd /var/www/emotors
git pull
pnpm install
pnpm run build
pm2 restart emotors
```

## 15. Loglara Bak

```bash
pm2 logs emotors
```

```bash
tail -f /var/log/nginx/error.log
```

## 16. Yedek Al

```bash
cd /var/www/emotors
tar -czf emotors-data-backup.tar.gz .data
```

## 17. Debian Kisa Ozet

```bash
apt update
apt upgrade -y
apt install -y git curl nginx ufw ca-certificates
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 22
npm install -g pnpm pm2
mkdir -p /var/www
cd /var/www
git clone https://github.com/miraysoftcom/emotors.git
cd emotors
nano .env.local
pnpm install
pnpm run build
pm2 start "pnpm start" --name emotors
pm2 save
```
