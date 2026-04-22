import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { healthRouter } from "./routes/health.js";
import { authRouter } from "./routes/auth.js";
import { deskRouter } from "./routes/desks.js";
import { bookingRouter } from "./routes/bookings.js";
import { metricsRouter } from "./routes/metrics.js";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({
    name: "@cowork/api",
    docs: {
      health: "GET /health",
      auth: ["/auth/register", "/auth/login", "/auth/me"],
      desks: ["/desks", "/desks/:deskId"],
      bookings: [
        "/bookings",
        "/bookings/availability",
        "/bookings/:bookingId",
        "PATCH /bookings/:bookingId",
        "/bookings/admin/clear",
      ],
      metrics: ["/metrics/overview"],
    },
    demoAccounts: [
      { email: "admin@cowork.local", password: "admin123" },
      { email: "member@cowork.local", password: "member123" },
    ],
  });
});

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/desks", deskRouter);
app.use("/bookings", bookingRouter);
app.use("/metrics", metricsRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Unexpected server error" });
});

app.listen(PORT, () => {
  console.log(`@cowork/api running on http://localhost:${PORT}`);
});
