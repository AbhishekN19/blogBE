# Blog API

A RESTful API for a blog platform built with Node.js, Express, MongoDB, and JWT authentication.

**Live URL:** https://blogbe-production.up.railway.app

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Atlas) + Mongoose
- **Auth:** JWT + bcrypt
- **Validation:** Zod
- **Deployment:** Railway

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account

### Installation

```bash
git clone https://github.com/AbhishekN19/blogBE.git
cd blogBE
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```
MONGODB_SECRET_URL=your_mongodb_connection_string
SECRET=your_jwt_secret
PORT_MAIN=3000
```

### Run locally

```bash
node app.js
```

---

## API Endpoints

### Auth

| Method | Endpoint           | Description         | Auth Required |
| ------ | ------------------ | ------------------- | ------------- |
| POST   | `/api/v1/register` | Register a new user | No            |
| POST   | `/api/v1/login`    | Login and get token | No            |

### Posts

| Method | Endpoint            | Description                | Auth Required |
| ------ | ------------------- | -------------------------- | ------------- |
| GET    | `/api/v1/posts`     | Get all posts (paginated)  | Yes           |
| POST   | `/api/v1/posts`     | Create a post              | Yes           |
| GET    | `/api/v1/posts/:id` | Get a single post          | Yes           |
| PATCH  | `/api/v1/posts/:id` | Update a post (owner only) | Yes           |
| DELETE | `/api/v1/posts/:id` | Delete a post (owner only) | Yes           |

### Comments

| Method | Endpoint                          | Description                   | Auth Required |
| ------ | --------------------------------- | ----------------------------- | ------------- |
| GET    | `/api/v1/posts/:id/comments`      | Get comments for a post       | Yes           |
| POST   | `/api/v1/posts/:id/comments`      | Add a comment                 | Yes           |
| DELETE | `/api/v1/posts/:id/comments/:cid` | Delete a comment (owner only) | Yes           |

---

## Authentication

All protected routes require a JWT token in the request header:

```
authorization: your_jwt_token
```

Get a token by hitting `POST /api/v1/login` with valid credentials.

---

## Request & Response Examples

### Register

```json
POST /api/v1/register
{
  "username": "abhishek",
  "password": "securepass123",
  "role": "admin"
}

Response 201:
{
  "data": {
    "_id": "...",
    "username": "abhishek",
    "role": "admin"
  }
}
```

### Create Post

```json
POST /api/v1/posts
Headers: { "authorization": "your_token" }
{
  "title": "My first post",
  "content": "Hello world"
}

Response 201:
{
  "data": {
    "_id": "...",
    "title": "My first post",
    "content": "Hello world",
    "author": "...",
    "createdAt": "..."
  }
}
```

### Paginated Posts

```
GET /api/v1/posts?page=1&limit=10

Response 200:
{
  "data": [...],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Error Handling

All errors return consistent JSON:

```json
{
  "error": "Error message here"
}
```

| Status | Meaning                                 |
| ------ | --------------------------------------- |
| 400    | Bad request / validation failed         |
| 401    | Unauthorized — missing or invalid token |
| 403    | Forbidden — valid token but not allowed |
| 404    | Resource not found                      |
| 409    | Conflict — duplicate resource           |
| 500    | Internal server error                   |

---

## Project Structure

```
├── app.js              # Entry point
├── models/
│   ├── User.js
│   ├── Post.js
│   └── Comment.js
├── routes/
│   ├── auth.js         # Register, login
│   └── posts.js        # Posts + comments
├── middleware/
│   ├── auth.js         # JWT middleware
│   └── validate.js     # Zod validation middleware
└── validators/
    └── schemas.js      # Zod schemas
```
