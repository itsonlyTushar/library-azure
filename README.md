# Online Library Management System

A full-stack online library, built as a capstone project demonstrating Azure
Compute, Database, and Storage services.

Members register, browse the catalog, borrow books (14-day loans with due-date
tracking) and return them. Admins build the catalog from the free
[Open Library API](https://openlibrary.org/developers/api).

**Deployed on Azure** as two App Services + Azure SQL Database + Azure Blob
Storage. Full provisioning walkthrough in **[azuresetupguide.md](azuresetupguide.md)**
(includes architecture diagrams and a CLI / GitHub Actions deployment guide).


## DOCS

1. Project Report - https://app.notion.com/p/Project-Report-Azure-Project-3d794c0ae3cc80479c8be880dac06090?source=copy_link

2. Price Calculator Report From Azure - https://docs.google.com/spreadsheets/d/1ahLcnzXFNaHuTz602MTDs_Tvubsepl5y/edit?usp=sharing&ouid=104002214421850971249&rtpof=true&sd=true



---

## Tech Stack

| | |
| --- | --- |
| **Frontend** | Next.js 16 (App Router) · React 19 · Tailwind CSS v4 |
| **Backend** | Node.js 20+ · Express 5 (ESM) · Prisma 6 |
| **Database** | Azure SQL Database (`sqlserver` provider) |
| **Storage** | Azure Blob Storage — `@azure/storage-blob` (only Azure SDK used) |
| **Auth** | JWT (`jsonwebtoken`) + `bcryptjs`, MEMBER / ADMIN roles |
| **Book data** | Open Library API (no key needed) |

**Hybrid catalog:** when an admin adds a book, the backend fetches its metadata
and cover from Open Library, re-uploads the cover to **our** Blob container, and
stores **our** blob URL in Azure SQL. Members then read entirely from our own
database — no external calls on the hot path.

---

## Project Structure

```
client/                     Next.js frontend
  app/                       routes: /, /books, /login, /register, /profile, /admin/books
  components/  hooks/  services/
server/                     Express API
  prisma/schema.prisma       User, Book, Borrowing models
  src/
    routes/  controllers/    auth + book/catalog
    services/                userService, bookService, catalogService,
                             openLibraryService, storageService
    middleware/              auth.js (JWT), admin.js (role check)
    scripts/createAdmin.js
```

---

## Running Locally

**Requirements:** a SQL Server instance (local install or Azure SQL) and blob
storage (an Azure Storage connection string, or `npx azurite` for the emulator —
then use `AZURE_STORAGE_CONNECTION_STRING="UseDevelopmentStorage=true"`).

### Server

```bash
cd server
cp .env.example .env      # fill in the values
npm install
npm run db:push          # create users / books / borrowings tables
npm run dev              # http://localhost:4000
```

`server/.env`:

```
PORT=4000
JWT_SECRET=<long random string>
CLIENT_ORIGIN=http://localhost:3000
DATABASE_URL="sqlserver://localhost:1433;database=library;user=sa;password=Your_password123;encrypt=true;trustServerCertificate=true"
AZURE_STORAGE_CONNECTION_STRING="UseDevelopmentStorage=true"
AZURE_STORAGE_CONTAINER=book-covers
```

### Client

```bash
cd client
cp .env.example .env.local     # NEXT_PUBLIC_API_URL=http://localhost:4000/api
npm install
npm run dev                    # http://localhost:3000
```

### Create an admin

```bash
cd server
npm run make-admin -- you@example.com                          # promote an existing user
npm run make-admin -- admin@example.com "Admin" "password123"  # or create one
```

Then sign in, open **Manage Catalog**, and add books.

---

## API

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | — | Create account, returns token |
| POST | `/api/auth/login` | — | Log in, returns token |
| GET | `/api/auth/me` | user | Current user |
| GET | `/api/books` | — | Browse catalog (`?q=` `?genre=` `?page=`) |
| GET | `/api/books/:id` | — | One catalog book |
| GET | `/api/books/borrowed` | user | Active loans (`overdue`, `days_remaining`) |
| GET | `/api/books/history` | user | Full borrowing history |
| POST | `/api/books/borrow` | user | Borrow by `{ book_id }` |
| POST | `/api/books/return` | user | Return by `{ book_id }` (kept as history) |
| GET | `/api/books/search` | admin | Search Open Library |
| POST | `/api/books/catalog` | admin | Add a book (metadata + cover pipeline) |
| DELETE | `/api/books/:id` | admin | Remove a book (if never borrowed) |
| GET | `/api/health` | — | Liveness + database ping |

---
