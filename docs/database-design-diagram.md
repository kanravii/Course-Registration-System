# Stamford International University Course Registration System
## Database Design Diagram

```mermaid
erDiagram
    USER ||--o{ OFFERING : teaches
    COURSE ||--o{ OFFERING : has_sections
    USER ||--o{ REGISTRATION : makes
    OFFERING ||--o{ REGISTRATION : receives
    USER ||--o{ RECORD : earns
    COURSE ||--o{ RECORD : appears_in
    COURSE }o--o{ COURSE : requires

    USER {
        ObjectId _id PK
        String studentId UK
        String employeeId UK
        String name
        String email UK
        String passwordHash
        String role
        String program
        Number yearLevel
        Boolean active
    }

    COURSE {
        ObjectId _id PK
        String code UK
        String title
        Number credits
        String[] programs
        String category
        Number yearLevel
        String specialization
        ObjectId[] prerequisites FK
        Boolean active
    }

    OFFERING {
        ObjectId _id PK
        ObjectId course FK
        String term
        String section
        ObjectId instructor FK
        Number capacity
        Number enrolledCount
        Schedule[] schedule
        Date registrationOpensAt
        Date registrationClosesAt
        String status
    }

    REGISTRATION {
        ObjectId _id PK
        ObjectId student FK
        ObjectId offering FK
        String status
        Date requestedAt
        Date registeredAt
        Date droppedAt
        String grade
    }

    RECORD {
        ObjectId _id PK
        ObjectId student FK
        ObjectId course FK
        String term
        Number attempt
        String grade
        Number credits
        Date completedAt
    }
```

### Collection responsibilities

| Collection | Purpose | Important constraint |
|---|---|---|
| `users` | Admin, advisor, and student identities | Unique email and student/employee IDs |
| `courses` | Stamford CS and IT curriculum catalog | Unique course code |
| `offerings` | Course sections in terms `1/2026`, `2/2026`, and `3/2026` | Unique course + term + section; enrollment cannot exceed capacity |
| `registrations` | Student request, enrollment, drop, and grade state | Unique student + offering |
| `records` | Permanent academic history and retakes | Unique student + course + attempt |

### Relationship notes

- One `User` can teach many `Offerings`; each offering has one instructor.
- One `Course` can have many `Offerings`; each offering belongs to one course.
- A student connects to an offering through `Registration`.
- A student's completed course history is stored in `Record`.
- `Course.prerequisites` is a self-reference to other courses.
- `Schedule` is an embedded subdocument inside `Offering`, not a separate collection.

### Keys and security

`PK` means MongoDB document identifier. `FK` means a Mongoose reference to another
document. `UK` means a unique index. Passwords are stored only as bcrypt hashes;
the `passwordHash` field is excluded from normal queries.