const express = require("express");
const app = express();
const musicianRouter = require("../routes/musicians.js");

app.use("/musicians", musicianRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

module.exports = app;
