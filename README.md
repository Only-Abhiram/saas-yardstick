# SaaS Notes (Multi‑Tenant) — README

## Overview
Multi-tenant SaaS Notes app built with **Next.js** and **Prisma**. Supports tenant isolation, JWT auth, role-based access, and subscription plans. Deployed on **Vercel**.

## Multi-Tenancy Approach
**Shared schema with tenantId column**. Simple, efficient for demo. All queries filtered by tenantId → strict isolation.

## Models
```prisma
model Tenant { id String @id @default(cuid()) name String slug String @unique plan String @default("FREE") users User[] notes Note[] }
model User   { id String @id @default(cuid()) email String @unique password String role String tenantId String tenant Tenant @relation(fields: [tenantId], references: [id]) notes Note[] }
model Note   { id String @id @default(cuid()) title String content String createdAt DateTime @default(now()) userId String tenantId String user User @relation(fields: [userId], references: [id]) tenant Tenant @relation(fields: [tenantId], references: [id]) }
```

## Seeded Accounts
All with password `password`:
- `admin@acme.test` (Admin, Acme)
- `user@acme.test` (Member, Acme)
- `admin@globex.test` (Admin, Globex)
- `user@globex.test` (Member, Globex)

## Auth
- `POST /api/login` → returns JWT with `userId`, `role`, `tenantId`.
-  token required for all protected routes.

## Plans
- **FREE**: max 3 notes per tenant.
- **PRO**: unlimited.
- Upgrade: `POST /api/tenants/:slug/upgrade` (Admin only).
- Invite: `POST /api/tenants/:slug/invite` (Admin only).

## Notes API
- `POST /api/notes` – Create note (checks plan limit).
- `GET /api/notes` – List notes for tenant.
- `GET /api/notes/:id` – Retrieve note.
- `PUT /api/notes/:id` – Update note.
- `DELETE /api/notes/:id` – Delete note.

## Roles
- **Admin**: invite users, upgrade plan, full CRUD.
- **Member**: CRUD only.

## Health & CORS
- `GET /api/health` → `{ "status": "ok" }`
- CORS enabled for frontend & test scripts.

## Frontend
Minimal Next.js UI:
- Login with seeded accounts.
- List, create, delete, update notes.
- Shows “Upgrade to Pro” when FREE limit reached (Log in with Admin account to upgrade).
-Admin can add a new member and also can Upgrade Tenants Plan from Free to Pro

## Deployment (Vercel)
- Env vars: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`.
- Run Prisma migrations + seed tenants & users.
- Deploy repo → backend & frontend live.

## Tests Expected
1. Health endpoint works.
2. Login succeeds for all 4 accounts.
3. Tenant isolation enforced.
4. Role restrictions enforced.
5. Free plan limit enforced, lifted after upgrade.
6. CRUD works correctly.
7. Frontend available and functional.

## Links
- GitHub: `https://github.com/Only-Abhiram/saas-yardstick`
- Frontend: `https://saas-yardstick.vercel.app/`
- API: `https://saas-yardstick.vercel.app/api`

---
This satisfies all assignment requirements.

