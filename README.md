# 🛒 Parivar Mart - E-Commerce Platform (Express & MySQL)

A professional, high-performance e-commerce platform built with a modular Express backend and clean HTML/CSS/JS frontend.

## 🏗️ Project Architecture

```text
/
├── public/             # Static Assets & Views (HTML, CSS, JS)
│   ├── css/            # Global styling
│   ├── js/             # Client-side logic (AJAX, DOM)
│   ├── images/         # Production assets
│   └── *.html          # Main pages (index, projects, products, auth)
├── src/                # Backend Source Code
│   ├── config/         # Database configuration (MySQL Pool)
│   ├── controllers/    # Request handlers (logic)
│   ├── middleware/     # Auth & validation checks
│   ├── routes/         # Modular endpoint definitions
│   ├── utils/          # Helper functions & DB initializers
│   └── app.js          # Main Express configuration
├── .env                # Secret environment variables
├── server.js           # Server entry point
└── package.json        # Project dependencies & scripts
```

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MySQL](https://www.mysql.com/) Server

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/parivar-mart.git
   cd parivar-mart
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=parivar_mart
   PORT=3000
   ```

4. **Initialize & Run**
   ```bash
   npm run dev
   ```
   The application will initialize the MySQL database tables, seed initial categories/products, and start serving at [http://localhost:3000](http://localhost:3000).

---
Built with ❤️ by Parivar Mart Team.
