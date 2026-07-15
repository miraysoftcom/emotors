# AlmaLinux VPS/VDS Kurulum Rehberi

Bu rehber AlmaLinux 8 veya AlmaLinux 9 icindir.

AlmaLinux, Ubuntu/Debian'dan farkli olarak `dnf`, `firewalld` ve `/etc/nginx/conf.d/` yapisini kullanir.

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
dnf update -y
```

## 3. Temel Paketleri Kur

```bash
dnf install -y git curl nginx firewalld openssl
```

Nginx ve firewall'u baslat:

```bash
systemctl enable nginx
systemctl start nginx
systemctl enable firewalld
systemctl start firewalld
```

Kontrol:

```bash
systemctl status nginx
systemctl status firewalld
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

`pm2 startup` sana bir komut verirse onu calistir.

Kontrol:

```bash
pm2 status
```

## 10. Nginx Ayarla

AlmaLinux'ta site ayari genelde `/etc/nginx/conf.d/` icine yazilir:

```bash
nano /etc/nginx/conf.d/emotors.conf
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

Kontrol ve restart:

```bash
nginx -t
systemctl restart nginx
```

## 11. SELinux Notu

AlmaLinux'ta SELinux proxy baglantisini engelleyebilir. Nginx'in Node.js'e baglanmasina izin ver:

```bash
setsebool -P httpd_can_network_connect 1
```

Eger `setsebool command not found` derse:

```bash
dnf install -y policycoreutils-python-utils
setsebool -P httpd_can_network_connect 1
```

## 12. Domain DNS Ayari

Domain panelinde:

```text
A Record
domainin.ch -> SUNUCU_IP_ADRESIN

A Record
www.domainin.ch -> SUNUCU_IP_ADRESIN
```

## 13. SSL Kur

Certbot icin EPEL gerekebilir:

```bash
dnf install -y epel-release
dnf install -y certbot python3-certbot-nginx
certbot --nginx -d domainin.ch -d www.domainin.ch
```

Test:

```bash
certbot renew --dry-run
```

## 14. Firewall Ayarla

```bash
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
firewall-cmd --list-all
```

## 15. Siteyi Guncelle

```bash
cd /var/www/emotors
git pull
pnpm install
pnpm run build
pm2 restart emotors
```

## 16. Loglara Bak

Uygulama:

```bash
pm2 logs emotors
```

Nginx:

```bash
journalctl -u nginx -f
```

Nginx hata dosyasi:

```bash
tail -f /var/log/nginx/error.log
```

## 17. Yedek Al

```bash
cd /var/www/emotors
tar -czf emotors-data-backup.tar.gz .data
```

## 18. AlmaLinux Kisa Ozet

```bash
dnf update -y
dnf install -y git curl nginx firewalld openssl
systemctl enable nginx
systemctl start nginx
systemctl enable firewalld
systemctl start firewalld
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
