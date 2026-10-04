# Data Model Contract

## Collections

- `users`: authentication identity and role. Roles are `admin`, `advisor`, and `student`.
- `courses`: reusable course catalog entries identified by a unique course code.
- `offerings`: a course section offered in a term. An offering is unique by course, term, and section.
- `registrations`: a student's registration state for one offering. A student cannot have duplicate registrations for the same offering.
- `records`: the student's permanent academic history. Retakes are represented by an incrementing `attempt`.

## Relationships

`Offering.course` references `Course`; `Offering.instructor` references `User`.
`Registration.student` references `User`; `Registration.offering` references `Offering`.
`Record.student` references `User`; `Record.course` references `Course`.

## Invariants

- User email, student ID, and employee ID are normalized before persistence.
- Offering enrollment cannot exceed capacity.
- An offering registration window must close after it opens.
- Course credits, offering capacity, record credits, and year level are bounded by schema validation.
- Uniqueness constraints prevent duplicate users, course codes, offerings, registrations, and record attempts.

## Integration notes

- Hash passwords before assigning `User.passwordHash`; the field is excluded from normal queries with `select: false`.
- Use `.populate("course")`, `.populate("student")`, and `.populate("offering")` explicitly at API boundaries.
- Treat registration and enrollment-count updates as one transaction when the API implementation is added.
- The database connection accepts `MONGODB_URI`, matching `.env.example`; `MONGO_URI` remains a compatibility fallback.
