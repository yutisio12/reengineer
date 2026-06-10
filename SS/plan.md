# Rencana Instalasi Apache Superset & Dashboard

## Tujuan

Menginstal **Apache Superset** secara native (tanpa Docker) di Windows, terhubung ke database PostgreSQL `engineering_tracker`, dan membuat dashboard yang identik dengan dashboard yang ada di aplikasi React (Engineering Activity Tracker).

---

## 1. Prasyarat

| Item | Keterangan |
|---|---|
| Python | `>=3.10` (cek: `python --version`) |
| PostgreSQL | Sudah running di `localhost:5432`, database `engineering_tracker` sudah ada |
| Node.js | Tidak diperlukan untuk Superset (hanya untuk aplikasi utama) |
| Pip | `python -m pip install --upgrade pip` |

---

## 2. Struktur Direktori `SS/`

```
SS/
  venv/                         # Python virtual environment (auto-generated)
  superset_config.py            # Konfigurasi Superset
  start-superset.ps1            # Script untuk menjalankan Superset
```

---

## 3. Tahap Instalasi

### 3.1 Buat Virtual Environment

```powershell
python -m venv F:\htdocs_kedua\engineering\SS\venv
```

### 3.2 Aktifkan Virtual Environment

```powershell
F:\htdocs_kedua\engineering\SS\venv\Scripts\Activate.ps1
```

### 3.3 Install Apache Superset & Dependencies

```powershell
pip install apache-superset
pip install psycopg2-binary
```

### 3.4 Buat `SS/superset_config.py`

Konfigurasi utama Superset, isinya:

```python
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SECRET_KEY = os.urandom(32).hex()
SQLALCHEMY_DATABASE_URI = "postgresql://postgres:postgres@localhost:5432/engineering_tracker"
SUPERSET_HOME = BASE_DIR
UPLOAD_FOLDER = os.path.join(BASE_DIR, "data")
ROW_LIMIT = 5000

# Superset akan buat tabel metadata dengan prefix ini
SQLALCHEMY_TRACK_MODIFICATIONS = True
```

Set environment variable agar Superset membaca konfigurasi ini:

```powershell
$env:SUPERSET_CONFIG_PATH = "F:\htdocs_kedua\engineering\SS\superset_config.py"
```

### 3.5 Inisialisasi Database Superset

```powershell
superset db upgrade
```

Perintah ini akan membuat tabel-tabel metadata Superset di database `engineering_tracker` (tabel dengan prefix `superset_*` atau `ab_*` / `alembic_*`).

### 3.6 Buat Admin User

```powershell
superset fab create-admin `
  --username admin `
  --firstname Admin `
  --lastname User `
  --email admin@company.com `
  --password admin123
```

### 3.7 Init Roles & Permissions

```powershell
superset init
```

### 3.8 Jalankan Superset

```powershell
superset run -p 8088 --with-threads --reload
```

Akses di `http://localhost:8088`. Login dengan `admin` / `admin123`.

---

## 4. Dataset SQL (Virtual Datasets)

Setelah login ke Superset, buat **Database** connection ke `engineering_tracker`, lalu buat **SQL datasets** (via SQL Lab → Save as dataset).

### Dataset 1: `kpi_metrics` — Kartu Metrik

```sql
SELECT
  COUNT(*) AS total_drawings,
  COUNT(*) FILTER (WHERE status IN ('fully_approved', 'transmitted')) AS ifc_count,
  COUNT(*) FILTER (WHERE status = 'in_progress_drafter') AS in_progress,
  COUNT(*) FILTER (WHERE status IN ('in_progress_checker', 'in_progress_engineer')) AS ifr_count,
  COUNT(*) FILTER (WHERE status = 'assigned') AS draft_count,
  COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) AS added_this_month,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status IN ('fully_approved', 'transmitted'))
    / NULLIF(COUNT(*), 0)
  ) AS overall_pct
FROM drawings;
```

### Dataset 2: `status_distribution` — Donut Chart

```sql
SELECT
  CASE
    WHEN status IN ('fully_approved', 'transmitted') THEN 'IFC / Complete'
    WHEN status = 'in_progress_drafter' THEN 'In Progress'
    WHEN status IN ('in_progress_checker', 'in_progress_engineer') THEN 'IFR / Review'
    ELSE 'Assigned / Draft'
  END AS status_group,
  COUNT(*) AS count
FROM drawings
GROUP BY 1
ORDER BY 1;
```

### Dataset 3: `progress_per_discipline` — Stacked Bar

```sql
SELECT
  d.name AS discipline,
  COUNT(*) FILTER (WHERE dw.status IN ('fully_approved', 'transmitted')) AS selesai,
  COUNT(*) FILTER (WHERE dw.status NOT IN ('fully_approved', 'transmitted')) AS sisa
FROM drawings dw
JOIN master_disciplines d ON d.id = dw.discipline_id
GROUP BY d.name
ORDER BY d.name;
```

### Dataset 4a: `monthly_trend_baru` — Line (Baru)

```sql
SELECT
  TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month_label,
  DATE_TRUNC('month', created_at) AS month_start,
  COUNT(*) AS baru
FROM drawings
GROUP BY 2, 1
ORDER BY 2;
```

### Dataset 4b: `monthly_trend_selesai` — Line (Selesai)

```sql
SELECT
  TO_CHAR(DATE_TRUNC('month', updated_at), 'Mon YYYY') AS month_label,
  DATE_TRUNC('month', updated_at) AS month_start,
  COUNT(*) AS selesai
FROM drawings
WHERE status IN ('fully_approved', 'transmitted')
GROUP BY 2, 1
ORDER BY 2;
```

### Dataset 5: `engineer_workload` — Bar Chart

```sql
SELECT
  u.name AS engineer_name,
  u.role,
  COUNT(*) FILTER (WHERE dw.assigned_drafter = u.id) AS total_assigned,
  COUNT(*) FILTER (
    WHERE dw.assigned_drafter = u.id
      AND dw.status IN ('fully_approved', 'transmitted')
  ) AS completed,
  CASE
    WHEN COUNT(*) FILTER (WHERE dw.assigned_drafter = u.id) > 0
    THEN ROUND(
      100.0 * COUNT(*) FILTER (
        WHERE dw.assigned_drafter = u.id
          AND dw.status IN ('fully_approved', 'transmitted')
      ) / COUNT(*) FILTER (WHERE dw.assigned_drafter = u.id)
    )
    ELSE 0
  END AS completion_pct
FROM master_users u
LEFT JOIN drawings dw ON dw.assigned_drafter = u.id
WHERE u.role IN ('drafter', 'checker', 'engineer')
  AND u.is_active = TRUE
GROUP BY u.name, u.role
ORDER BY u.name;
```

---

## 5. Charts yang Akan Dibuat

Berikut daftar chart yang akan dibuat di Superset, meniru dashboard React yang ada:

| # | Nama Chart | Tipe Visualisasi | Dataset | Metric | Dimension | Warna |
|---|---|---|---|---|---|---|
| C1 | **Total Drawing** | Big Number | `kpi_metrics` | `total_drawings` | — | #000000 |
| C2 | **Selesai (IFC)** | Big Number | `kpi_metrics` | `ifc_count` | — | #22C55E |
| C3 | **In Progress** | Big Number | `kpi_metrics` | `in_progress + ifr_count` | — | #3B82F6 |
| C4 | **Assigned / Draft** | Big Number | `kpi_metrics` | `draft_count` | — | #EAB308 |
| C5 | **Distribusi Status** | Donut Chart | `status_distribution` | `count` | `status_group` | Lihat warna status |
| C6 | **Progres per Disiplin** | Stacked Bar | `progress_per_discipline` | `selesai`, `sisa` | `discipline` | Hijau + Hijau muda |
| C7 | **Tren Drawing per Bulan** | Line Chart | `monthly_trend_baru` + `monthly_trend_selesai` | `baru`, `selesai` | `month_label` | Biru (solid) + Hijau (dashed) |
| C8 | **Beban Kerja Engineer** | Bar Chart | `engineer_workload` | `total_assigned`, `completed` | `engineer_name` | Biru / Orange / Hijau per role |

### Warna Status (untuk Donut Chart C5)

| Status Group | Warna |
|---|---|
| Assigned / Draft | `#EAB308` (Kuning) |
| In Progress | `#3B82F6` (Biru) |
| IFR / Review | `#F97316` (Orange) |
| IFC / Complete | `#22C55E` (Hijau) |

### Warna Peran (untuk Bar Chart C8)

| Role | Warna |
|---|---|
| drafter | `#3B82F6` (Biru) |
| checker | `#F97316` (Orange) |
| engineer | `#22C55E` (Hijau) |

---

## 6. Dashboard Layout

### Tata Letak (identik dengan React app)

```
┌─────────────────────────────────────────────────────────────┐
│ Row 1: [C1] [C2] [C3] [C4]  ← 4 Big Number sejajar          │
├──────────────────┬──────────────────────────────────────────┤
│ Row 2: [C5]      │ [C6]       ← Donut (kiri) + Bar (kanan)  │
│                  │                                            │
│                  │                                            │
├──────────────────┼──────────────────────────────────────────┤
│ Row 3: [C7]      │ [C8]       ← Line (kiri) + Bar (kanan)   │
│                  │                                            │
│                  │                                            │
└──────────────────┴──────────────────────────────────────────┘
```

### Filter Dashboard Global

| Filter | Kolom | Default |
|---|---|---|
| **Disiplin** | `drawings.discipline_id` → `master_disciplines.name` | Semua |
| **Periode** | `drawings.created_at` (Date Range) | All Time |

---

## 7. Script Menjalankan Superset

Buat file `SS/start-superset.ps1`:

```powershell
# start-superset.ps1
$env:SUPERSET_CONFIG_PATH = "F:\htdocs_kedua\engineering\SS\superset_config.py"
& "F:\htdocs_kedua\engineering\SS\venv\Scripts\superset" run -p 8088 --with-threads --reload
```

Jalankan dengan:

```powershell
.\SS\start-superset.ps1
```

---

## 8. Catatan Penting

### 8.1 Metadata Superset Campur dengan Data Aplikasi

Superset akan membuat tabel metadata (seperti `ab_user`, `ab_role`, `slices`, `dashboards`, dll.) di database `engineering_tracker` yang sama. Jika ingin pisah, buat database baru:

```sql
CREATE DATABASE superset_metadata;
```

Lalu ubah `SQLALCHEMY_DATABASE_URI` di `superset_config.py` menjadi:

```python
SQLALCHEMY_DATABASE_URI = "postgresql://postgres:postgres@localhost:5432/superset_metadata"
```

Dan untuk koneksi data ke `engineering_tracker`, buat **Database Connection** terpisah di UI Superset (**Data → Databases**).

### 8.2 Filter Periode

Di dashboard React, filter periode menggunakan hardcoded date (Mei 2026). Di Superset, gunakan **date range filter** bawaan yang akan otomatis apply ke query dataset.

### 8.3 Export Dashboard

Setelah dashboard selesai, export sebagai backup:

1. Buka dashboard di Superset
2. Klik **⋮ → Download as JSON**

Simpan file hasil export ke `SS/dashboard-export.json`.

### 8.4 Chart.js vs Superset Charts

Perbedaan yang perlu diperhatikan:
- Big Number di Superset tidak memiliki subtitle seperti `+X bulan ini`. Untuk meniru itu, gunakan **Big Number with Trendline** atau tambahkan label manual di dashboard.
- Engineer Workload di React menggunakan progress bar custom CSS. Di Superset, gunakan **Bar Chart** horizontal sebagai alternatif.

---

## 9. Ringkasan Perintah Eksekusi

```powershell
# 1. Buat venv & install
python -m venv SS\venv
SS\venv\Scripts\Activate.ps1
pip install apache-superset psycopg2-binary

# 2. Konfigurasi
# (buat superset_config.py secara manual)

$env:SUPERSET_CONFIG_PATH = "F:\htdocs_kedua\engineering\SS\superset_config.py"

# 3. Init database & user
superset db upgrade
superset fab create-admin --username admin --firstname Admin --lastname User --email admin@company.com --password admin123
superset init

# 4. Jalankan
superset run -p 8088 --with-threads --reload
```

---

## 10. Referensi

- Dashboard React app: `FE/src/pages/dashboard.tsx`
- Mock data: `FE/src/api/mock.ts`
- Database schema: `BE/migrations/001_init.sql`
- Tipe data TypeScript: `FE/src/types/index.ts`
- Konstanta: `FE/src/lib/constants.ts`
