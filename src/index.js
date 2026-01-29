import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "path";

import userRoutes from "./components/user/index.js";
import config from "../config/index.js";
import { sendFailure, asyncWrap } from "./components/utils/commonUtils.js";
import { appString } from "./components/utils/appString.js";

const { internalServerError } = appString;
const PORT = config.PORT;

const app = express();

// middleware
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "src/uploads")));

// db collection
const connectDB = asyncWrap(async () => {
  await mongoose.connect(config.MONGO_URI);
  console.log("Database connected successfully");
});

// server start
const startServer = asyncWrap(async () => {
  await connectDB();

  // routes
  app.use("/api", userRoutes);

  // Global error handler
  app.use((err, req, res, next) => {
    console.error("Error Stack:", err.stack);
    sendFailure(
      res,
      err.message || internalServerError,
      err.statusCode || 500
    );
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

startServer();
