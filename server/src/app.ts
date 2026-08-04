import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";
import routes from "./routes";
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";


const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Swagger UI setup
// Swagger UI temporarily disabled pending fix
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Play API 🚀",
  });
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
