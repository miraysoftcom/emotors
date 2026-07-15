# MK-eMotors Dornach VPS/VDS Kurulum Rehberleri

Bu proje Next.js tabanli MK-eMotors Dornach e-ticaret sistemidir.

Her isletim sistemi icin kurulum rehberi ayridir:

- [Ubuntu Kurulum Rehberi](./UBUNTU_KURULUM_REHBERI_TR.md)
- [Debian Kurulum Rehberi](./DEBIAN_KURULUM_REHBERI_TR.md)
- [AlmaLinux Kurulum Rehberi](./ALMALINUX_KURULUM_REHBERI_TR.md)

Yeni basliyorsan tavsiyem:

```text
Ubuntu 24.04 LTS
2 GB RAM veya daha fazla
20 GB disk veya daha fazla
```

## Genel Mantik

Tum sistemlerde mantik aynidir:

```text
Domain -> Nginx -> Next.js uygulamasi -> PM2
```

Yani:

- Domain sunucu IP adresine gider.
- Nginx gelen istegi karsilar.
- Nginx istegi arkada calisan Next.js uygulamasina yollar.
- PM2 uygulamanin surekli calismasini saglar.

## Ortak Guvenlik Notlari

Canli sistemde mutlaka guclu secret ve sifre kullan:

```env
NEXT_PUBLIC_SITE_URL=https://domainin.ch
AUTH_SECRET=cok-guclu-bir-secret
ADMIN_EMAIL=admin@domainin.ch
ADMIN_PASSWORD=cok-guclu-bir-admin-sifresi
SETUP_SECRET=gecici-cok-guclu-bir-kurulum-anahtari
DATABASE_URL=
```

Guclu rastgele deger uretmek icin:

```bash
openssl rand -base64 32
```

Onemli:

- `.env.local` dosyasini GitHub'a yukleme.
- `.data` klasorunu GitHub'a yukleme.
- Admin sifresini kolay yapma.
- Kurulum bittikten sonra `SETUP_SECRET` degerini sil veya degistir.
- Sunucuda firewall ve SSL mutlaka aktif olsun.
