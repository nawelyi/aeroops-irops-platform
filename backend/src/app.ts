import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.routes.js";
import { incidentsRouter }  from "./routes/incidents.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
    res.json({
        message: "Welcome to the AeroOps IROPS API",
    })
})

app.use("/health", healthRouter);
app.use("/incidents", incidentsRouter);

export { app }