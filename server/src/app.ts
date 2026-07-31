import express from "express";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Welcome to Play API 🚀",
  });
});

export default app;
