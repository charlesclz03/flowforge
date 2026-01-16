---
description: Safely modify the database schema, update client types, and handle data migrations.
---

1.  **Schema Modification**
    - Edit `prisma/schema.prisma`.
    - **Rule**: Avoid non-nullable fields on existing large tables without a default value or careful migration plan.

2.  **Generation & Migration**
    - Run `npx prisma generate` to update the strictly typed client.
    - Run `npx prisma db push` (for prototyping) or create a migration file if strictly required for production history.
    - **Seed Check**: If new required fields were added, update `prisma/seed.ts` to include them.

3.  **Type Verification**
    - Run `tsc --noEmit`.
    - Fix any TypeScript errors in the frontend code caused by the schema change (e.g., usage of `User.newField`).

4.  **Frontend Update**
    - If this data is needed in the session, update `next-auth` options or session callbacks.
    - Ensure UI components using this data are updated.
