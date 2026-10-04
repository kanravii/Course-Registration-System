# Stamford International University Dataset

Run the idempotent seed command from the project root:

```bash
npm run seed
```

The script creates or updates fictional development data based on the Stamford
International University IT department curricula. It contains 25 fictional
students, one administrator, one advisor, both CS and IT programs, 80 courses,
three academic terms (`1/2026`, `2/2026`, and `3/2026`), offerings, registrations,
and academic records.

The script removes only the previous placeholder records: the old `2026-FALL`
offerings, old `alice@example.com` and `bob@example.com` accounts, and the old
`CSC101` and `CSC301` courses. It does not clear unrelated collections.

## Demo accounts

All demo accounts use the password `ChangeMe123!`:

- `admin@example.com` (`admin`)
- `advisor@example.com` (`advisor`)
- `2600000001@students.stamford.edu` through `2600000025@students.stamford.edu` (`student`)

These accounts are for local or classroom development only. Change or remove
them before using a shared or production database.
