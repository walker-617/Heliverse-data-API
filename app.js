const express = require("express");
const mongoose = require("mongoose");
const dotenv = require('dotenv');

const app = express();
const port = 3000;
dotenv.config();

const mongodb_url = process.env.MONGODB_URL;
mongoose.connect(mongodb_url);
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const userSchema = new mongoose.Schema({
  id: Number,
  first_name: String,
  last_name: String,
  email: String,
  gender: String,
  avatar: String,
  domain: String,
  available: Boolean,
});

const Users = mongoose.model("User", userSchema);

const page_limit = 20;

app.get("/", async (req, res) => {
  res.send("Hello, MongoDB and Express!");
});

app.get("/get_all_users", async (req, res) => {
  try {
    const options = { _id: 0 };
    const users = await Users.find({}, options);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/get_one_user/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const options = { _id: 0 };
    const users = await Users.findOne({ id: id }, options);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/get_users_pagenation/:id", async (req, res) => {
  const start = req.params.id;
  try {
    const options = { _id: 0 };
    const users = await Users.find({}, options)
      .skip(start - 1)
      .limit(page_limit);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/get_domains", async (req, res) => {
  try {
    const options = { _id: 0 };
    const users = await Users.find({}, options);
    const s = new Set();
    for (const user of users) {
      s.add(user.domain);
    }
    const domains = Array.from(s);
    res.json(domains);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/get_users_by_filter", async (req, res) => {
  const domain = req.query.domain;
  const gender = req.query.gender;
  const available = req.query.available;
  const filters = {};
  if (domain) {
    filters["domain"] = domain;
  }
  if (gender) {
    filters["gender"] = gender;
  }
  if (available) {
    filters["available"] = available;
  }
  try {
    const options = { _id: 0 };
    const users = await Users.find(filters, options);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
