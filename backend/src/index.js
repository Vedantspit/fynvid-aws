import express from "express";
import dotenv from "dotenv";
import connectDb from "./db/index.js";
import { DB_NAME } from "./constants.js";
import { app } from "./app.js";
dotenv.config();

connectDb()
  .then(
    app.listen(process.env.PORT, () => {
      console.log(`Listening on port ${process.env.PORT}`);
    })
  )
  .catch((err) => {
    console.log("MongoDB Connection Error !! ", err);
  });
