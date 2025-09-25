<div align="center">
  <a href="https://expressjs.com/" target="_blank">
    <img src="https://upload.wikimedia.org/wikipedia/commons/6/64/Expressjs.png" width="200" alt="Express Logo" />
  </a>

  # Express API - TypeScript
</div>

## 📋 Description

A backend built with **Express.js** and **TypeScript**, designed for scalable API development with modular structure, JWT authentication, centralized logging, and automated testing.

## 💡 Features

- **Authentication & Authorization** using JWT.
- **Password hashing** with [bcryptjs](https://www.npmjs.com/package/bcryptjs).
- **Data validation & type safety** using [Zod](https://www.npmjs.com/package/zod) and [Zod OpenAPI](https://www.npmjs.com/package/zod-openapi).
- **API documentation** with [Swagger UI Express](https://www.npmjs.com/package/swagger-ui-express) available at `/docs`.
- **Modular structure** with feature-based folders (`users`, `auth`, `topics`, `resources`).
- **Centralized logging** with [winston](https://www.npmjs.com/package/winston).
- **Global error handling** middleware.
- **Unit & integration tests** with [Jest](https://jestjs.io/) and [Supertest](https://www.npmjs.com/package/supertest).
- **Environment variables** via [dotenv-cli](https://www.npmjs.com/package/dotenv-cli).
- **Module path aliases** for clean imports.

## 🛠️ Installation

```bash
npm install
```

## 🚀 Running the App

Development

```bash
npm run dev
```

Production

```bash
npm run build

npm run start
```

## 💣 Testing

Unit tests

```bash
npm run test
```

Unit tests in watch mode

```bash
npm run test:watch
```

Test coverage

```bash
npm run test:cov
```

E2E tests

```bash
npm run test:e2e
```

## 🔑 Environment Variables

Create a .env file at the project root with the following minimum variables:
```env
PORT=3000
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1h
```

## 📄 API Documentation

Swagger documentation is automatically generated and available at:

```bash
http://localhost:<PORT>/api/docs
```
It includes all endpoints, request/response schemas, and authentication requirements.

## ⚡ Technologies

- Node.js + Express
- TypeScript
- Jest / Supertest
- Zod / Zod OpenAPI
- bcryptjs
- jsonwebtoken
- Swagger UI Express
- winston
- dotenv-cli

## 👨🏽‍💻 Author

[Stefferson Fernandes](https://www.linkedin.com/in/stefferson-thallys/)

## 🧾 License

Express API - TypeScript is [MIT licensed](LICENSE).
