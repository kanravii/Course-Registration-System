# Course Registration System

## Group Information

- Group Number: [ 6 ]

## Team Members

1.  Kanravi Charoentanaset (2402290003) - Team Lead / Integrator
2.  Hein Kyaw Zaw (2507090001) - Backend developer (API)
3.  Kaung Sithu Tun 2403040020 - database and date lead
4.  Zwe Maung Maung Than 2310040006 - Front-end developer A/B

## Project Description

This project is a fill-stack Course Registration System for a unisversity department.

The system will provides three users roles:

1. Administration
2. Academic Advisor
3. Student

## Feature

### Authentication

- Login for Admin, Advisor, Student
- Passwords stored only as bcrypt hashes
- JWT authentication
- Role-based authentication

### Admin

- Manage user account
- Create, delete, and edit users

### Advisor

- open course offering
- Manage sections and seats
- Register a students
- Manage Add/Drop windows

### Student

- View the courses registered
- View completed courses
- View GPA
- View course graded or retake requirement course
- Request add/drop

## Technology

- MongoDB
- Mongoose
- Express.js
- Node.js
- React
- Vite
- bcrypt
- JWT

## Project structure

```Course-Registration-System
client/
server/
.env.example
.gitignore
README.md

```

## Data layer

The Mongoose models in `server/models` define the persistence contract for users,
courses, offerings, registrations, and academic records. See
`docs/data-model.md` for relationships, required fields, and invariants.
