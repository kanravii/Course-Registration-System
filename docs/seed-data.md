# Demo Dataset

Run the idempotent seed command from the project root:

```bash
npm run seed
```

The script creates or updates demo users, courses, offerings, registrations,
and academic records. It does not delete existing collections or documents.

## Demo accounts

All demo accounts use the password `ChangeMe123!`:

- `admin@example.com` (`admin`)
- `advisor@example.com` (`advisor`)
- `alice@example.com` (`student`)
- `bob@example.com` (`student`)

These accounts are for local or classroom development only. Change or remove
them before using a shared or production database.