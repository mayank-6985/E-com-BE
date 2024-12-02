const express = require("express");
const multer = require("multer");
const path = require("path");
const Product = require("../models/Product"); // Assuming your model is in 'models' directory
const verifyToken = require("../middleware/auth");

const router = express.Router();

// Set up storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images"); // Save images in the 'public/images' folder
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // Rename file to avoid name conflicts
  },
});

// File filter to allow only image files
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    return cb("Error: Only image files are allowed!");
  }
};

// Create upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

// Endpoint to create a product with image
router.post(
  "/products",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, price, category_id, description, stock } = req.body;
      const image_url = req.file ? `/images/${req.file.filename}` : null; // Save the image URL if the file is uploaded

      const newProduct = await Product.create({
        name,
        price,
        category_id,
        description,
        stock,
        image_url, // Store image URL in the DB
      });

      res.status(201).json(newProduct);
    } catch (err) {
      res.status(500).json({ error: "Error creating product", err });
    }
  }
);

// Endpoint to update product with image
router.put(
  "/products/:id",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, price, category_id, description, stock } = req.body;
      const image_url = req.file
        ? `/images/${req.file.filename}`
        : req.body.image_url; // Keep existing image if not uploaded

      const updatedProduct = await Product.update(
        { name, price, category_id, description, stock, image_url },
        { where: { id: req.params.id } }
      );

      if (updatedProduct[0] === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.status(200).json({ message: "Product updated successfully" });
    } catch (err) {
      res.status(500).json({ error: "Error updating product" });
    }
  }
);

router.get("/products", verifyToken, async (req, res) => {
  try {
    const products = await Product.findAll(); // Get all products from the database
    res.status(200).json(products); // Return products as a JSON response
  } catch (err) {
    res.status(500).json({ error: "Error fetching products", err });
  }
});

// Endpoint to get a single product by id
router.get("/products/:id", verifyToken, async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product); // Return single product as a JSON response
  } catch (err) {
    res.status(500).json({ error: "Error fetching product", err });
  }
});

// DELETE product endpoint
router.delete("/products/:id", verifyToken, async (req, res) => {
  try {
    const productId = req.params.id;

    // Find the product first to get the image URL
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Delete the product from the database
    await Product.destroy({ where: { id: productId } });

    // If the product had an image, you can optionally delete the image file from the server
    if (product.image_url) {
      const fs = require("fs");
      const imagePath = path.join(__dirname, "..", "public", product.image_url);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Error deleting image:", err);
        }
      });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting product", err });
  }
});

module.exports = router;
