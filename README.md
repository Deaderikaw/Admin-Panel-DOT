# Admin Panel

Aplikasi web **Admin Panel** untuk mengelola data kategori dan produk, serta memantau ringkasan data melalui dashboard. Aplikasi dibuat menggunakan Next.js, TypeScript, Prisma ORM, dan MySQL.

> **Status:** Fitur autentikasi admin, dashboard, dan CRUD kategori serta produk telah diimplementasikan. 

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Teknologi dan Dependency](#teknologi-dan-dependency)
- [Desain Database](#desain-database)
- [Struktur Project](#struktur-project)
- [Persyaratan](#persyaratan)
- [Instalasi dan Konfigurasi](#instalasi-dan-konfigurasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Dokumentasi API](#dokumentasi-api)
- [Autentikasi dan Keamanan](#autentikasi-dan-keamanan)
- [Panduan Pengembangan](#panduan-pengembangan)
- [Catatan untuk Developer Selanjutnya](#catatan-untuk-developer-selanjutnya)

## Fitur Utama

### 1. Autentikasi Admin
- Login menggunakan email dan password.
- Password admin disimpan dalam bentuk hash menggunakan `bcryptjs`.
- Autentikasi menggunakan JSON Web Token (JWT).
- Token disimpan dalam HTTP-only cookie.
- Endpoint logout untuk menghapus sesi autentikasi.
- Endpoint API kategori, produk, dan dashboard dilindungi dengan middleware/helper autentikasi admin.

### 2. Dashboard
- Menampilkan jumlah kategori.
- Menampilkan jumlah produk.
- Menampilkan total stok produk.
- Menampilkan jumlah produk aktif dan tidak aktif.
- Menampilkan daftar produk terbaru.

### 3. Manajemen Kategori
- Menampilkan seluruh kategori.
- Mencari kategori berdasarkan nama.
- Menambahkan kategori.
- Mengubah data kategori.
- Menghapus kategori.
- Validasi agar kategori yang masih digunakan produk tidak dapat dihapus.

### 4. Manajemen Produk
- Menampilkan daftar produk beserta kategori.
- Mencari produk berdasarkan nama.
- Memfilter produk berdasarkan kategori.
- Menambahkan, mengubah, dan menghapus produk.
- Mengatur harga, stok, deskripsi, kategori, dan status produk.
- Validasi kategori sebelum produk disimpan.

## Teknologi dan Dependency

| Teknologi / Package | Kegunaan |
|---|---|
| Next.js 16 | Framework aplikasi web dan API menggunakan App Router |
| React | Library untuk membangun antarmuka |
| TypeScript | Menambahkan sistem tipe pada JavaScript |
| MySQL | Database relasional |
| Prisma ORM | Pemodelan data dan komunikasi dengan database |
| Tailwind CSS | Styling antarmuka |
| bcryptjs | Hash dan verifikasi password |
| jose | Pembuatan dan verifikasi JWT |
| tsx | Menjalankan script TypeScript, termasuk script pembuatan admin |
| Node.js dan npm | Runtime JavaScript dan pengelola package |

Daftar dependency dan versi lengkap dapat dilihat pada `package.json`. File `package-lock.json` digunakan untuk menjaga konsistensi versi dependency saat instalasi.

## Desain Database

Database yang digunakan bernama `admin_panel` dan terdiri dari tiga tabel utama:

### Tabel `admins`

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | Int | Primary key, auto increment |
| name | Varchar(100) | Nama admin |
| email | Varchar(150) | Email admin, unique |
| password | Varchar(255) | Password yang telah di-hash |
| created_at | Timestamp | Waktu data dibuat |
| updated_at | Timestamp | Waktu data diperbarui |

### Tabel `categories`

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | Int | Primary key, auto increment |
| name | Varchar(100) | Nama kategori |
| description | Text, nullable | Deskripsi kategori |
| created_at | Timestamp | Waktu data dibuat |
| updated_at | Timestamp | Waktu data diperbarui |

### Tabel `products`

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | Int | Primary key, auto increment |
| category_id | Int | Foreign key ke `categories.id` |
| name | Varchar(150) | Nama produk |
| description | Text, nullable | Deskripsi produk |
| price | Decimal(12,2) | Harga produk |
| stock | Int, nullable | Jumlah stok |
| status | Varchar(20), nullable | Status produk, default `active` |
| created_at | Timestamp | Waktu data dibuat |
| updated_at | Timestamp | Waktu data diperbarui |

### Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    ADMINS {
        int id PK
        varchar name
        varchar email UK
        varchar password
        timestamp created_at
        timestamp updated_at
    }

    CATEGORIES {
        int id PK
        varchar name
        text description
        timestamp created_at
        timestamp updated_at
    }

    PRODUCTS {
        int id PK
        int category_id FK
        varchar name
        text description
        decimal price
        int stock
        varchar status
        timestamp created_at
        timestamp updated_at
    }

    CATEGORIES ||--o{ PRODUCTS : "memiliki"
```

**Relasi:**
- Satu kategori dapat memiliki banyak produk (*one-to-many*).
- Setiap produk harus terhubung dengan satu kategori melalui `category_id`.
- Tabel `admins` digunakan untuk data akun administrator dan tidak memiliki relasi langsung dengan tabel kategori maupun produk.

Definisi database berada di `prisma/schema.prisma`.

## Struktur Project

Struktur utama project:

```text
admin-panel/
├── prisma/
│   └── schema.prisma
├── scripts/
│   └── create-admin.ts
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   ├── logout/
│   │   │   │   └── me/
│   │   │   ├── categories/
│   │   │   ├── products/
│   │   │   └── dashboard/
│   │   ├── dashboard/
│   │   │   ├── categories/
│   │   │   ├── products/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── login/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── category.controller.ts
│   │   └── product.controller.ts
│   └── services/
│       └── lib/
│           ├── admin-auth.ts
│           ├── api-response.ts
│           ├── auth.ts
│           └── prisma.ts
├── prisma7.config.ts
├── package.json
├── package-lock.json
└── README.md
```

Keterangan:
- `src/app/`: halaman frontend dan API routes Next.js.
- `src/app/api/`: endpoint backend.
- `src/controllers/`: logika proses autentikasi, kategori, dan produk.
- `src/services/lib/prisma.ts`: konfigurasi Prisma Client.
- `src/services/lib/auth.ts`: pembuatan dan verifikasi token JWT.
- `src/services/lib/admin-auth.ts`: pemeriksaan autentikasi admin untuk API.
- `prisma/schema.prisma`: definisi model dan relasi database.
- `scripts/create-admin.ts`: script untuk membuat akun admin.

## Persyaratan

Pastikan perangkat developer telah memiliki:
- Node.js versi yang kompatibel dengan versi Next.js pada project.
- npm.
- MySQL Server.
- Git.

## Instalasi dan Konfigurasi

### 1. Clone repository

```bash
git clone <URL_REPOSITORY>
cd admin-panel
```

Ganti `<URL_REPOSITORY>` dengan URL repository Git yang sebenarnya.

### 2. Install dependency

```bash
npm install
```

Untuk instalasi yang mengikuti lockfile secara ketat, gunakan:

```bash
npm ci
```

### 3. Buat database MySQL

Buat database dengan nama:

```sql
CREATE DATABASE admin_panel;
```

### 4. Konfigurasi environment

Buat file `.env` di root project. Contoh:

```env
DATABASE_URL="mysql://USERNAME:PASSWORD@localhost:3306/admin_panel"
AUTH_SECRET="GANTI_DENGAN_SECRET_RANDOM_MINIMAL_32_KARAKTER"

# Digunakan hanya ketika menjalankan script pembuatan admin:
ADMIN_NAME="Administrator"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="GANTI_DENGAN_PASSWORD_KUAT"
```

Ganti `USERNAME` dan `PASSWORD` sesuai konfigurasi MySQL lokal. Jangan menggunakan contoh kredensial di atas sebagai kredensial produksi.

**Penting:** Jangan mengunggah file `.env` ke repository. Simpan secret dan password hanya di environment lokal atau secret manager.

### 5. Generate Prisma Client

```bash
npx prisma generate --config prisma7.config.ts
```

### 6. Sinkronisasi schema database

Jika menggunakan database development baru dan belum memiliki migration, periksa konfigurasi Prisma terlebih dahulu, kemudian jalankan:

```bash
npx prisma db push --config prisma7.config.ts
```

Perintah `db push` menyelaraskan schema Prisma dengan database tanpa membuat file migration. Untuk pengembangan tim atau deployment produksi, pertimbangkan menggunakan migration agar perubahan struktur database tercatat dan dapat direproduksi.

## Menjalankan Aplikasi

Jalankan server development:

```bash
npm run dev
```

Buka aplikasi melalui:

```text
http://localhost:3000
```

Halaman login:

```text
http://localhost:3000/login
```

Pastikan MySQL aktif, `.env` sudah benar, dan Prisma Client sudah di-generate sebelum menjalankan aplikasi.

## Membuat Akun Admin

Script pembuatan admin tersedia di:

```text
scripts/create-admin.ts
```

Isi sementara variabel `ADMIN_NAME`, `ADMIN_EMAIL`, dan `ADMIN_PASSWORD` pada environment lokal, kemudian jalankan:

```bash
npx tsx scripts/create-admin.ts
```

Setelah akun berhasil dibuat, hapus nilai `ADMIN_PASSWORD` dari environment jika tidak lagi diperlukan. Jangan menyimpan password admin di source code atau repository.

## Dokumentasi API

Semua endpoint kategori, produk, dan dashboard memerlukan autentikasi admin melalui cookie `admin_token`, kecuali endpoint autentikasi yang digunakan untuk login.

### Authentication

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/api/auth/login` | Login admin |
| GET | `/api/auth/me` | Mendapatkan informasi admin yang sedang login |
| POST | `/api/auth/logout` | Logout admin |

Contoh body login:

```json
{
  "email": "admin@example.com",
  "password": "password-admin"
}
```

### Categories

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/categories` | Mendapatkan daftar kategori |
| GET | `/api/categories?search=elektronik` | Mencari kategori |
| POST | `/api/categories` | Menambahkan kategori |
| GET | `/api/categories/:id` | Mendapatkan detail kategori |
| PUT | `/api/categories/:id` | Mengubah kategori |
| DELETE | `/api/categories/:id` | Menghapus kategori |

Contoh body untuk menambahkan kategori:

```json
{
  "name": "Elektronik",
  "description": "Kategori produk elektronik"
}
```

### Products

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/products` | Mendapatkan daftar produk |
| GET | `/api/products?search=mouse` | Mencari produk |
| GET | `/api/products?category_id=1` | Filter berdasarkan kategori |
| POST | `/api/products` | Menambahkan produk |
| GET | `/api/products/:id` | Mendapatkan detail produk |
| PUT | `/api/products/:id` | Mengubah produk |
| DELETE | `/api/products/:id` | Menghapus produk |

Contoh body untuk menambahkan produk:

```json
{
  "category_id": 1,
  "name": "Gaming Headset",
  "description": "Headset gaming dengan microphone",
  "price": 350000,
  "stock": 15,
  "status": "active"
}
```

### Dashboard

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/dashboard` | Mendapatkan ringkasan statistik dashboard |

Untuk endpoint yang memerlukan autentikasi, lakukan login terlebih dahulu dan gunakan cookie yang dikembalikan server. Saat menguji melalui Postman, aktifkan penyimpanan/pengiriman cookie agar sesi admin terbawa pada request berikutnya.

## Autentikasi dan Keamanan

- Password admin harus disimpan dalam bentuk hash, bukan plaintext.
- JWT menggunakan secret dari environment variable `AUTH_SECRET`.
- Cookie autentikasi menggunakan atribut HTTP-only dan SameSite.
- Seluruh API kategori, produk, dan dashboard harus memeriksa autentikasi admin di sisi server.
- Jangan pernah meng-commit `.env`, password, token, atau secret ke repository.
- Validasi input tetap harus dilakukan di backend meskipun frontend sudah memiliki validasi.

## Panduan Pengembangan

1. Perubahan struktur tabel dilakukan pada `prisma/schema.prisma`.
2. Setelah perubahan schema, sesuaikan database dan generate ulang Prisma Client.
3. Logika proses bisnis sebaiknya diletakkan pada controller, sedangkan route handler bertugas menerima request dan meneruskan proses.
4. Endpoint baru yang bersifat privat harus dilindungi menggunakan `requireAdmin()`.
5. Pertahankan validasi input dan penanganan error pada setiap endpoint.
6. Uji endpoint menggunakan Postman sebelum menghubungkannya ke frontend.
7. Uji kembali halaman terkait setelah mengubah API atau schema database.

## Catatan untuk Developer Selanjutnya

Beberapa hal yang dapat menjadi pengembangan berikutnya:

- Menambahkan pagination dan sorting pada daftar kategori dan produk.
- Menambahkan upload gambar produk.
- Menambahkan pengelolaan profil admin dan perubahan password.
- Menambahkan role dan permission jika aplikasi digunakan oleh lebih dari satu jenis admin.
- Menambahkan audit log untuk mencatat aktivitas admin.
- Menambahkan automated test untuk controller dan API.
- Menggunakan Prisma Migrate untuk pengelolaan perubahan schema lintas environment.
- Menambahkan dokumentasi API yang lebih interaktif, misalnya Swagger/OpenAPI.

Sebelum melakukan perubahan, periksa terlebih dahulu `package.json`, `prisma/schema.prisma`, dan konfigurasi pada `prisma7.config.ts` agar implementasi baru tetap sesuai dengan versi dependency dan struktur project yang digunakan.

---
