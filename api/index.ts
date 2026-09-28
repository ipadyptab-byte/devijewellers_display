import express from "express";
import { apiRouter } from "../src/api.js";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Mount on /api for local dev matching / rewrites that preserve path
app.use("/api", apiRouter);
// Mount on / for Vercel serverless functions where /api is stripped
app.use("/", apiRouter);

export default app;
