# MK-eMotors Dornach VPS/VDS Kurulum Rehberi

Bu rehber Debian, Ubuntu ve AlmaLinux VPS/VDS sunuculara bu Next.js projesini kurmak icin hazirlandi.

Yeni basladiysan en kolay sistem: **Ubuntu 22.04 veya Ubuntu 24.04**.

## 1. Genel Mantik

Site su sekilde calisir:

```text
Domain -> Nginx -> Next.js uygulamasi -> PM2
```

Yani:

- Domain sunucu IP adresine gider.
- Nginx gelen istegi karsilar.
- Nginx istegi arkada calisan Next.js uygulamasina yollar.
- PM2 uygulamanin surekli calismasini saglar.

## 2. Sunucuya Baglan

Bilgisayarindaki terminali ac.

```bash
ssh root@SUNUCU_IP_ADRESIN
```

Ornek:

```bash
ssh root@123.45.67.89
```

Ilk kez baglaniyorsan `yes` yazip Enter'a bas.

## 3. Sistem Guncelle

### Ubuntu / Debian

```bash
apt update
apt upgrade -y
```

### AlmaLinux

```bash
dnf update -y
```

## 4. Gerekli Paketleri Kur

### Ubuntu / Debian

```bash
apt install -y git curl nginx
```

### AlmaLinux

```bash
dnf install -y git curl nginx
systemctl enable nginx
systemctl start nginx
```

## 5. Node.js Kur

Bu proje Next.js kullandigi icin Node.js gerekir. En kolay kurulum `nvm` ile olur.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

Sonra terminal ayarlarini yenile:

```bash
source ~/.bashrc
```

Node.js 22 kur:

```bash
nvm install 22
nvm use 22
nvm alias default 22
```

Kontrol et:

```bash
node -v
npm -v
```

## 6. PNPM ve PM2 Kur

Projede `pnpm-lock.yaml` oldugu icin `pnpm` kullanmak en dogrusu.

```bash
npm install -g pnpm pm2
```

Kontrol:

```bash
pnpm -v
pm2 -v
```

## 7. Projeyi GitHub'dan Cek

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/miraysoftcom/emotors.git
cd emotors
```

Repo private ise GitHub kullanici adi ve token isteyebilir.

## 8. Environment Dosyasini Olustur

`.env.local` dosyasi GitHub'a atilmaz. Sunucuda elle olusturulur.

```bash
nano .env.local
```

Ornek icerik:

```env
NEXT_PUBLIC_SITE_URL=https://example.com
AUTH_SECRET=buraya-cok-guclu-bir-secret-yaz
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=buraya-cok-guclu-bir-admin-sifresi-yaz
SETUP_SECRET=buraya-gecici-cok-guclu-bir-kurulum-anahtari-yaz
DATABASE_URL=
```

Kaydetmek icin:

```text
CTRL + O
ENTER
CTRL + X
```

Onemli: `.env.local` dosyasini kimseyle paylasma.

Canli sistemde kolay admin sifresi kullanma. Guclu rastgele deger uretmek icin:

```bash
openssl rand -base64 32
```

Kurulum bittikten sonra `SETUP_SECRET` degerini silebilir veya degistirebilirsin.

## 9. Projeyi Kur

```bash
pnpm install
```

Sonra build al:

```bash
pnpm run build
```

Build basarili olursa devam et.

## 10. PM2 ile Siteyi Calistir

```bash
pm2 start "pnpm start" --name emotors
pm2 save
pm2 startup
```

`pm2 startup` sana uzun bir komut verebilir. Onu kopyalayip calistir.

Kontrol:

```bash
pm2 status
```

Normalde uygulama su portta calisir:

```text
http://127.0.0.1:3000
```

## 11. Nginx Ayari

Asagidaki orneklerde `example.com` yerine kendi domainini yaz.

### Ubuntu / Debian

```bash
nano /etc/nginx/sites-available/emotors
```

Icine bunu koy:

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

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

### AlmaLinux

```bash
nano /etc/nginx/conf.d/emotors.conf
```

Icine ayni Nginx ayarini koy:

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

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

Kontrol ve yeniden baslat:

```bash
nginx -t
systemctl restart nginx
```

## 12. Domain DNS Ayari

Domain aldigin panelde DNS bolumune gir.

Su kayitlari ekle:

```text
A Record
example.com -> SUNUCU_IP_ADRESIN

A Record
www.example.com -> SUNUCU_IP_ADRESIN
```

DNS bazen 5 dakika, bazen birkac saat surebilir.

## 13. SSL Kurulumu

SSL sitenin `https://` ile acilmasini saglar.

### Ubuntu / Debian

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d example.com -d www.example.com
```

### AlmaLinux

```bash
dnf install -y certbot python3-certbot-nginx
certbot --nginx -d example.com -d www.example.com
```

SSL yenilemeyi test et:

```bash
certbot renew --dry-run
```

## 14. Firewall Ayari

### Ubuntu / Debian

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

### AlmaLinux

```bash
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```

## 15. Siteyi Guncelleme

Kodda degisiklik yaptiktan sonra sunucuda:

```bash
cd /var/www/emotors
git pull
pnpm install
pnpm run build
pm2 restart emotors
```

## 16. Loglara Bakma

Site hata verirse:

```bash
pm2 logs emotors
```

Nginx hatalari:

### Ubuntu / Debian

```bash
tail -f /var/log/nginx/error.log
```

### AlmaLinux

```bash
journalctl -u nginx -f
```

## 17. Yedek Alma

Bu projede `.data` klasoru yerel veri tutabilir. Siparis, fatura, ayar gibi bilgiler burada olabilir.

Yedek almak icin:

```bash
cd /var/www/emotors
tar -czf emotors-data-backup.tar.gz .data
```

Yedegi indirmeyi unutma.

## 18. Cok Onemli Guvenlik Notlari

- `.env.local` dosyasini GitHub'a yukleme.
- `.data` klasorunu GitHub'a yukleme.
- Admin sifresini guclu yap.
- Sunucuda root sifresini guclu yap.
- Mumkunse SSH key kullan.
- Bilmedigin komutlari calistirmadan once sor.

## 19. En Kisa Kurulum Ozeti

Ubuntu/Debian icin hizli ozet:

```bash
apt update
apt upgrade -y
apt install -y git curl nginx
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

Sonra Nginx ve SSL ayarlarini yap.

## 20. Yeni Baslayan Icin Tavsiye

Ilk kurulum icin sunucu olarak:

```text
Ubuntu 24.04 LTS
2 GB RAM veya daha fazla
20 GB disk veya daha fazla
```

ile baslamak en kolayidir.
