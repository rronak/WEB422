/*********************************************************************************
 * WEB422 – Assignment 1
 *
 * I declare that this assignment is my own work in accordance with Seneca's
 * Academic Integrity Policy:
 *
 * https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
 *
 * Name: Ronak Jung Rayamajhi         Student ID: 146857230      Date: 2025-05-26
 * Published URL: https://web422ronak.vercel.app
 ********************************************************************************/

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const ListingsDB = require("./modules/listingsDB");

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

const db = new ListingsDB();

app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({ message: "API Listening" });
});

// Initialize DB server
db.initialize(process.env.MONGODB_CONN_STRING)
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`Server is listening on port ${HTTP_PORT}`);
    });
  })
  .catch((err) => {
    console.error(`Failed to connect to the database: ${err}`);
  });

// POST /api/listings - Add a new listing
app.post("/api/listings", async (req, res) => {
  try {
    const newListing = await db.addNewListing(req.body);
    res.status(201).json(newListing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/listings - Get all listings with pagination and optional name search
app.get("/api/listings", async (req, res) => {
  const { page, perPage, name } = req.query;

  try {
    const listings = await db.getAllListings(parseInt(page), parseInt(perPage), name);
    res.json(listings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/listings/:id - Get a listing by ID
app.get("/api/listings/:id", async (req, res) => {
  try {
    const listing = await db.getListingById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    res.json(listing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/listings/:id - Update a listing by ID
app.put("/api/listings/:id", async (req, res) => {
  try {
    const result = await db.updateListingById(req.body, req.params.id);
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Listing not found or no changes made" });
    }
    res.json({ message: "Listing updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/listings/:id - Delete a listing by ID
app.delete("/api/listings/:id", async (req, res) => {
  try {
    const result = await db.deleteListingById(req.params.id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }
    res.json({ message: "Listing deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
