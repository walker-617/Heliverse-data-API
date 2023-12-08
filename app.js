const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const app = express();
app.use(cors());
const port = 5000;
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
  res.send("Hello Worlds!");
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

app.get("/get_searched_users", async (req, res) => {
  const first_name = req.query.name;
  try {
    const options = { _id: 0 };
    const users = await Users.find(
      { first_name: new RegExp(first_name, "i") },
      options
    );
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/get_users", async (req, res) => {
  const start = req.query.start;
  const domain = req.query.domain;
  const gender = req.query.gender;
  const available = req.query.available;
  const searchBy = req.query.searchBy;
  var searchValue = req.query.searchValue;
  const filters = {};
  if (domain) {
    filters["domain"] = domain;
  }
  if (gender) {
    filters["gender"] = gender;
  }
  if (available) {
    filters["available"] = available == "available" ? true : false;
  }
  if (searchBy) {
    filters[searchBy] = new RegExp(searchValue, "i");
  }
  try {
    const options = { _id: 0 };
    const users = await Users.find(filters, options)
      .skip(start - 1)
      .limit(page_limit);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/get_domains_genders", async (req, res) => {
  try {
    const options = { _id: 0 };
    const users = await Users.find({}, options);
    var domains = new Set();
    var genders = new Set();
    for (const user of users) {
      domains.add(user.domain);
      genders.add(user.gender);
    }
    domains = Array.from(domains);
    genders = Array.from(genders);
    const data = { domains: domains, genders: genders };
    res.json(data);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
