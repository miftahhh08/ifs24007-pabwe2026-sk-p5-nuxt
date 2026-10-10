# Delcom Cash Flow - Nuxt (TypeScript)

Studi Kasus 2 (3.2) - Praktikum Pengembangan Aplikasi Web 2026.
Aplikasi pencatatan arus kas berbasis Nuxt 4 (SPA), TypeScript, Pinia, dan Tailwind CSS v4
yang terhubung ke API Delcom.

## Menjalankan

```bash
bun install
bun run dev          # mode pengembangan  -> http://localhost:3000
bun run build        # build produksi
bun run start        # preview hasil build
```

## Pengujian

```bash
bun run test            # jalankan semua test
bun run test:coverage   # laporan coverage (target 100%)
```

## Konfigurasi

Salin `.env.example` menjadi `.env`, lalu sesuaikan:

```env
VITE_DELCOM_BASEURL=https://open-api.delcom.org/api/v1
APP_PORT=3000
```

## Struktur

```
src/
├── App.vue                  # RouterView
├── routes.ts                # daftar rute (lazy import)
├── router.options.ts        # menyuplai rute ke Nuxt
├── helpers/                 # apiHelper, toolsHelper
├── hooks/                   # useInput
└── features/
    ├── auth/                # api, states (Pinia), layouts, pages
    ├── users/               # api, states, pages (Users, Profile)
    ├── cashflows/           # api, states, components, modals, layouts, pages
    └── common/              # NotFoundPage
```
