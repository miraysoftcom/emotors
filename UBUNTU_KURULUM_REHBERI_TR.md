# Ubuntu VPS/VDS Kurulum Rehberi

Bu rehber Ubuntu 22.04 veya Ubuntu 24.04 icindir.

## 1. Sunucuya Baglan

Bilgisayarindaki terminali ac:

```bash
ssh root@SUNUCU_IP_ADRESIN
```

Ornek:

```bash
ssh root@123.45.67.89
```

Ilk kez baglaniyorsan `yes` yaz.

## 2. Sistemi Guncelle

```bash
apt update
apt upgrade -y
```

## 3. Temel Paketleri Kur

```bash
apt install -y git curl nginx ufw
```

Nginx aktif mi kontrol et:

```bash
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

Repo private ise GitHub kullanici adi/token isteyebilir.

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

Kaydet:

```text
CTRL + O
ENTER
CTRL + X
```

Guclu sifre uretmek icin:

```bash
openssl rand -base64 32
```

## 8. Projeyi Kur

```bash
pnpm install
pnpm run build
```

Build hata verirse hata metnini kontrol et.

## 9. PM2 ile Calistir

```bash
pm2 start "pnpm start" --name emotors
pm2 save
pm2 startup
```

`pm2 startup` sana bir komut verirse onu kopyalayip calistir.

Kontrol:

```bash
pm2 status
```

## 10. Nginx Ayarla

```bash
nano /etc/nginx/sites-available/emotors
```

`domainin.ch` yerine kendi domainini yaz:

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

SSL yenilemeyi test et:

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

Uygulama loglari:

```bash
pm2 logs emotors
```

Nginx hata logu:

```bash
tail -f /var/log/nginx/error.log
```

## 16. Yedek Al

```bash
cd /var/www/emotors
tar -czf emotors-data-backup.tar.gz .data
```

## 17. Ubuntu Kisa Ozet

```bash
apt update
apt upgrade -y
apt install -y git curl nginx ufw
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
