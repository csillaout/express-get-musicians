//routes
const express = require("express");
const { check, validationResult } = require("express-validator");
const musicianRouter = express.Router();
const Musician = require("../models/index");

//get all musicians
musicianRouter.get("/", async (req, res) => {
  try {
    const musicians = await Musician.findAll();
    res.json(musicians);
  } catch (error) {
    console.error("Error fetching musicians: ", error); // Add this line for logging
    res
      .status(500)
      .json({ error: "An error occurred while fetching musicians" });
  }
});

// get musician by id
musicianRouter.get("/:id", async (req, res) => {
  try {
    const musician = await Musician.findByPk(req.params.id);
    if (musician) {
      res.json(musician);
    } else {
      res.status(404).json({ error: "Musician not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error while fetching musician" });
  }
});

//create a new musician
musicianRouter.post(
  "/",
  [
    // Validation checks
    check("name")
      .trim()
      .notEmpty()
      .withMessage("Name field is required and cannot be empty or whitespace"),
    check("instrument")
      .trim()
      .notEmpty()
      .withMessage(
        "Instrument field is required and cannot be empty or whitespace"
      ),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      const newMusician = await Musician.create(req.body);
      const allMusicians = await Musician.findAll(); // Return all musicians including the new one
      res.status(201).json(allMusicians);
    } catch (error) {
      res
        .status(400)
        .json({ error: "An error occurred while creating the musician" });
    }
  }
);

module.exports = router;
