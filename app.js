const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path"); // Add this to handle paths
const db = require("./config/db");
const adminRoutes = require("./routes/admin");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");

const app = express();

app.use(bodyParser.json());
app.use(cors());

// Serve static files (images) from the 'public' folder
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/product", productRoutes);

// Database Sync
db.sync().then(() => console.log("Database synced"));

app.listen(8080, () => console.log("Server running on port 8080"));
