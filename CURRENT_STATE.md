# Current State (2026)

## Stack
- Backend: Node.js, Express, PostgreSQL (`pg`), JWT, Joi, helmet, express-rate-limit
- Frontend: React 18, React Router, Context API, Axios, Tailwind CSS

## Core Modules
- Auth: `/api/auth/*`
- Resources: `/api/resources/*` (CRUD + bulk)
- Categories: `/api/categories/*`
- Admin: `/api/admin/*`
- Share links: `/api/shares/*`
- Notifications: `/api/notifications/*`
- Automation metadata: `/api/automation/fetch-meta`
- Upgrade codes: `/api/upgrade/*`

## Security Baseline
- JWT auth middleware
- Admin authorization middleware
- Request validation via Joi (body + params in key routes)
- Global/API auth rate limiting
- Helmet headers
- Resource quota checks (single + bulk + share import + notification accept)

## Frontend Routing
- `/` -> `Welcome` if unauthenticated, `Dashboard` if authenticated
- `/login`
- `/register`
- `/admin`
- `/welcome` (preview landing route)
