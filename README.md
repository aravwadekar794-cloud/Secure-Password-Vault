# 🔐 Password Manager

A secure, full-stack password management application built with **Spring Boot** (Backend) and **React** (Frontend).  
It allows users to store, manage, and generate strong passwords with encryption and authentication.

---

## 📌 Features
- **User Authentication**: JWT-based secure login & registration.
- **Credential Management**:
  - Add, view, update, delete credentials.
  - Search and filter credentials.
- **Password Generator**:
  - Generate strong random passwords.
  - Visual strength indicator (badge & ring).
- **Responsive UI**:
  - Built with modular components and reusable UI elements.
- **Secure Storage**:
  - Passwords stored in encrypted form in the database.
- **Audit Logging**:
  - Track user actions and credential changes.

---

## 🛠 Tech Stack

### Backend
- **Java 17** + **Spring Boot**
- **Spring Security** with JWT
- **H2 Database** (dev) / can be replaced with MySQL/PostgreSQL
- **Maven**

### Frontend
- **React 18** + Vite
- **Context API** for theme & toast notifications
- **Custom Hooks** for clipboard and local storage

---

## 📂 Project Structure
```
PasswordManager/
│
├── App/
│   ├── Backend/         # Spring Boot backend
│   │   ├── src/main/java/com/PasswordManager/Backend/
│   │   ├── data/        # H2 database files
│   │   └── pom.xml
│   │
│   ├── Frontend/        # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── context/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   └── styles/
│   │   ├── index.html
│   │   └── vite.config.js
│   │
│   └── data/            # App-level data storage
│
└── README.md
```

---

## ⚙️ Setup & Run

### 1️⃣ Clone the repository
```bash
git clone https://github.com/<your-username>/Secure Password Vault.git
cd Secure Password Vault/App
```

### 2️⃣ Backend Setup
```bash
cd Backend
mvn clean install
mvn spring-boot:run
```
The backend will start at **`http://localhost:8080`**.

### 3️⃣ Frontend Setup
```bash
cd ../Frontend
npm install
npm run dev
```
The frontend will start at **`http://localhost:5173`** (Vite default).

---

## 🔑 Environment Variables

**Backend (`application.properties`)**
```properties
spring.datasource.url=jdbc:h2:file:./data/passwordmanagerdb
spring.datasource.username=sa
spring.datasource.password=
jwt.secret=your_jwt_secret
```

**Frontend (`.env`)**
```env
VITE_API_BASE_URL=http://localhost:8080
```

---

## 📸 Screenshots
*(You can add screenshots here later)*

---

## 🛡 Security Notes
- Passwords are encrypted before storage.
- JWT tokens are used for authentication.
- Implement HTTPS in production.

---

## 📜 License
MIT License. Free to use and modify.

---
# secure-password-vault
