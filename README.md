# 🖥️ StudyZone Server

The REST API behind **StudyZone**, a student registration and course management system. Built with **Node.js**, **Express 5**, and **MongoDB**, it provides full CRUD endpoints for students and subjects, with server-side validation, input normalization, and duplicate checks.

🔗 **Live API:** [studyzone-server.onrender.com](https://studyzone-server.onrender.com/)
📦 **Server Repository:** [theopsupcorp1009/studyzone-server](https://github.com/theopsupcorp1009/studyzone-server)
🌐 **Frontend App:** [studyzone-psi.vercel.app](https://studyzone-psi.vercel.app/)
📦 **Frontend Repository:** [theopsupcorp1009/studyzone](https://github.com/theopsupcorp1009/studyzone)

---

## ✨ Features

- **Students API** with create, read, update, and delete operations
- **Subjects API** with create, read, update, and delete operations
- **Server-side validation** for all required fields, email format, phone format, and field lengths
- **Duplicate protection**: student ID and email must be unique, subject code must be unique
- **Input normalization**: emails are lowercased, subject codes are uppercased, and all text is trimmed
- **ObjectId validation** on update routes to reject malformed IDs
- **Consistent HTTP status codes** (`201`, `400`, `404`, `409`, `500`) with clear JSON error messages
- **CORS enabled** so the frontend can call the API from any origin
- Health check route at `/`

---

## 🖥️ Tech Stack

| Layer          | Technology                                 |
|----------------|---------------------------------------------|
| Runtime        | [Node.js](https://nodejs.org/) (ES Modules) |
| Framework      | [Express](https://expressjs.com/) 5         |
| Database       | [MongoDB](https://www.mongodb.com/) (official driver) |
| Middleware     | cors, express.json                          |
| Configuration  | dotenv                                      |
| Deployment     | Render                                      |

---

## 📂 Project Structure

```
studyzone-server/
├── index.js            # Express app, MongoDB connection, and all routes
├── package.json
├── package-lock.json
├── .gitignore
└── .env                # Environment variables (never commit)
```

---

## 🔌 API Reference

### Health

| Method | Endpoint | Description          |
|--------|----------|----------------------|
| GET    | `/`      | Returns `{ "msg": "Server Running Fine" }` |

### Students

| Method | Endpoint          | Description                |
|--------|-------------------|----------------------------|
| GET    | `/students`       | List all students          |
| GET    | `/students/:id`   | Get a single student       |
| POST   | `/students`       | Register a new student     |
| PATCH  | `/students/:id`   | Update a student           |
| DELETE | `/students/:id`   | Delete a student           |

**Student fields**

| Field       | Type   | Required | Rules                                              |
|-------------|--------|----------|----------------------------------------------------|
| `studentId` | string | Yes      | Must be unique                                     |
| `name`      | string | Yes      | Trimmed                                            |
| `email`     | string | Yes      | Valid email format, stored lowercase, must be unique |
| `phone`     | string | Yes      | 7 to 15 digits, may include `+`, spaces, `()` and `-` |
| `course`    | string | No       | Name of the enrolled course                        |
| `date`      | string | Yes      | Registration date                                  |

**Example request**

```http
POST /students
Content-Type: application/json

{
  "studentId": "STU-001",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+880 1700 000000",
  "course": "Web Development",
  "date": "2026-10-12"
}
```

**Example response**

```json
{
  "message": "Student registered successfully.",
  "insertedId": "6710f1c2a1b2c3d4e5f60718"
}
```

### Subjects

| Method | Endpoint          | Description                |
|--------|-------------------|----------------------------|
| GET    | `/subjects`       | List all subjects          |
| GET    | `/subjects/:id`   | Get a single subject       |
| POST   | `/subjects`       | Add a new subject          |
| PATCH  | `/subjects/:id`   | Update a subject           |
| DELETE | `/subjects/:id`   | Delete a subject           |

**Subject fields**

| Field         | Type   | Required | Rules                                                |
|---------------|--------|----------|------------------------------------------------------|
| `subjectCode` | string | Yes      | 2 to 20 characters, letters, numbers, or hyphens, stored uppercase, must be unique |
| `subjectName` | string | Yes      | 2 to 100 characters                                  |
| `description` | string | No       | Up to 1000 characters                                |
| `duration`    | string | No       | Up to 50 characters                                  |

### Status codes

| Code | Meaning                                                     |
|------|-------------------------------------------------------------|
| 200  | Update succeeded                                            |
| 201  | Resource created                                            |
| 400  | Validation failed or invalid ID                             |
| 404  | Student or subject not found (on update)                    |
| 409  | Duplicate student ID, email, or subject code                |
| 500  | Internal server error                                       |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (recommended: latest LTS)
- npm
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

```bash
# Clone the repository
git clone https://github.com/theopsupcorp1009/studyzone-server.git
cd studyzone-server

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
MONGODB_URL=your_mongodb_connection_string
PORT=5000
```

`PORT` is optional and defaults to `5000`.

> Keep `.env` out of version control and never share real credentials publicly.

### Run the server

```bash
npm start
```

The API will be available at `http://localhost:5000`. Visit `/` to confirm it is running.

Data is stored in a MongoDB database named `students-db` with two collections: `students` and `subjects`.

---

## 🌐 Deployment

The server is deployed on **Render** as a Node web service.

To deploy your own copy:

1. Push this repository to your GitHub account.
2. Create a new **Web Service** on [Render](https://render.com/) and connect the repository.
3. Set the build command to `npm install` and the start command to `npm start`.
4. Add the `MONGODB_URL` environment variable in the Render dashboard.
5. Allow Render's outbound IP addresses in your MongoDB Atlas network access settings.

If your Render plan spins services down when idle, the first request after a quiet period can take a little longer to respond.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source.

---

## 🙏 Acknowledgments

- Built with [Express](https://expressjs.com/) and the [MongoDB Node.js driver](https://www.mongodb.com/docs/drivers/node/current/)
- Hosted on [Render](https://render.com/)

---

## 📝 Project Summary

**StudyZone Server** is the backend of a student registration system, exposing a clean REST API for managing students and subjects. Built with Express 5 and the native MongoDB driver in ES Module style, it validates every incoming request, normalizes data before saving, and prevents duplicate student IDs, emails, and subject codes with meaningful status codes and error messages. It pairs with the StudyZone Next.js frontend, which consumes these endpoints to power a full admin portal. The project demonstrates practical experience with RESTful API design, server-side validation, MongoDB data modeling, environment-based configuration, and cloud deployment on Render.
