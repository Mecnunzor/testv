# FullIPTV - Self-Hosted IPTV Platform

Kendi IPTV platformunuzu kurun. Aktivasyon kodu sistemi, admin paneli, tüm TV markalarıyla uyumlu player.

## Özellikler

- **Aktivasyon Kodu Sistemi** — Kod üret, cihaza gir, 1 yıl aktif
- **Admin Paneli** — Kod yönetimi, cihaz takibi, kanal ekleme, M3U içe aktarma
- **Xtream Codes Uyumlu API** — TiviMate, IPTV Smarters, vb. uygulamalarla çalışır
- **Web Player** — Tüm Smart TV tarayıcılarında çalışır (Samsung, LG, Android TV)
- **Netflix Tarzı Arayüz** — Kanal listesi, kategori filtresi, TV kumanda desteği
- **Docker ile Kolay Kurulum** — Tek komutla çalıştır
- **Tamamen Ücretsiz & Açık Kaynak** — MIT Lisans, ticari kullanıma açık
- **Bağımsız** — Hiçbir 3. parti servise bağımlı değil

## Hızlı Başlangıç

### Docker ile (Önerilen)

```bash
git clone https://github.com/Mecnunzor/testv.git
cd testv
docker compose up -d --build
```

### Manuel Kurulum

```bash
git clone https://github.com/Mecnunzor/testv.git
cd testv
npm install
npm start
```

### Erişim

| Sayfa | URL |
|-------|-----|
| **Admin Panel** | http://SUNUCU-IP:3000/admin |
| **TV Player** | http://SUNUCU-IP:3000/player |
| **Xtream API** | http://SUNUCU-IP:3000/player_api.php |
| **M3U Çıktısı** | http://SUNUCU-IP:3000/get.php?username=DEVICE_ID&password=CODE |

**Varsayılan Giriş:** admin / admin123

## Kullanım Akışı

### 1. Admin: Kod Üret
Admin panelinden "Kodlar" sekmesine git → adet, süre (gün), max cihaz belirle → "Kod Üret" tıkla.

### 2. TV'ye Yükle
TV'nin tarayıcısından `http://SUNUCU-IP:3000` adresine git. Aktivasyon ekranı açılır.

### 3. Kodu Gir
Üretilen 12 haneli kodu (XXXX-XXXX-XXXX) gir → "Aktifleştir" tıkla → TV izlemeye başla!

### 4. Süre Dolunca
Admin panelinden cihazı seç → "+1 Yıl" butonu ile uzat veya yeni kod ver.

## TV Marka Uyumluluğu

| Marka | Nasıl Çalışır |
|-------|---------------|
| **Samsung (Tizen)** | Dahili tarayıcıdan web player |
| **LG (webOS)** | Dahili tarayıcıdan web player |
| **Android TV** (Sony, Philips, Xiaomi, TCL) | Chrome veya Xtream uyumlu app |
| **Amazon Fire TV** | Silk Browser veya Xtream uyumlu app |
| **Otel Android Box** | APK olarak yükle + launcher ayarla |
| **Bilgisayar / Mobil** | Herhangi bir tarayıcı |

## Xtream Codes Uyumlu Uygulamalar

Bu sunucu Xtream Codes API'si ile uyumludur. Aşağıdaki uygulamalarda kullanabilirsiniz:

- **TiviMate** (Android TV) — Sunucu: `http://IP:3000`, Kullanıcı: `DEVICE_ID`, Şifre: `KOD`
- **IPTV Smarters Pro** — Aynı bilgiler
- **GSE Smart IPTV** — M3U URL kullanın
- **VLC** — M3U playlist URL'sini açın

## API Referansı

### Aktivasyon
```
POST /api/activate
Body: { "code": "XXXX-XXXX-XXXX", "device_id": "...", "device_name": "...", "device_type": "TV" }
```

### Cihaz Kontrolü
```
POST /api/check
Body: { "device_id": "..." }
```

### Xtream API
```
GET /player_api.php?username=DEVICE_ID&password=CODE
GET /player_api.php?username=DEVICE_ID&password=CODE&action=get_live_streams
GET /player_api.php?username=DEVICE_ID&password=CODE&action=get_live_categories
GET /player_api.php?username=DEVICE_ID&password=CODE&action=get_vod_streams
GET /get.php?username=DEVICE_ID&password=CODE&type=m3u_plus
```

## Sunucu Kurulumu (Hetzner/VPS)

```bash
# Sunucuya bağlan
ssh root@SUNUCU-IP

# Docker kur (yoksa)
curl -fsSL https://get.docker.com | sh

# Projeyi çek
git clone https://github.com/Mecnunzor/testv.git
cd testv

# Başlat
docker compose up -d --build

# Logları gör
docker compose logs -f
```

### Nginx Reverse Proxy (Opsiyonel)

```nginx
server {
    listen 80;
    server_name fulliptv.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Güncelleme

```bash
cd testv
git pull
docker compose up -d --build
```

## Proje Yapısı

```
fulliptv/
├── backend/
│   └── server.js          # Ana sunucu (Express + SQLite)
├── admin/
│   └── index.html          # Yönetim paneli
├── player/
│   └── index.html          # TV player (Netflix tarzı)
├── data/
│   └── fulliptv.db         # SQLite veritabanı (otomatik oluşur)
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

## Lisans

MIT — Ticari kullanım dahil her şey serbest. Tamamen size ait.

## Gelecek Planlar

- [ ] Android TV native APK (M3UAndroid fork)
- [ ] Samsung Tizen native app
- [ ] LG webOS native app
- [ ] EPG (TV Rehberi) entegrasyonu
- [ ] DVR (kayıt) özelliği
- [ ] Çoklu dil desteği
- [ ] Otel launcher modu
