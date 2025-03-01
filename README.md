# xpress-fuse

**xpress-fuse** is a minimal, lightweight middleware bundle for Express.js, providing essential middlewares with sane defaults to simplify setup.

## 🚀 Features
- 🌐 CORS support (`cors`)
- 🔒 Security headers (`helmet`)
- 📄 Body parsing (`express.json()`, `express.urlencoded()`)
- 📊 Logging (`morgan`)
- 🚀 Gzip compression (`compression`)
- ⏳ Rate limiting (`express-rate-limit`)

## 📦 Installation
```sh
npm install xpress-fuse
```

---

### 🚀 Usage

```js
const express = require("express");
const xpressFuse = require("xpress-fuse");

const app = express();

// Pass express instance to xpressFuse
app.use(xpressFuse(express));

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(3000, () => console.log("Server running on port 3000"));
```

---

### ⚙️ Configuration
You can customize the middlewares by passing an options object:

```js
app.use(xpressFuse({ cors: false, rateLimit: { windowMs: 10 * 60 * 1000, max: 50 } }));
```

---

### 📜 License
MIT Liense