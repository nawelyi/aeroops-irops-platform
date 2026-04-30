import { Router } from "express";
import { createIncidentSchema } from "../schemas/incident.schema.js";
import { createIncident, getAllIncidents } from "../data/incidents.store.js";   

const incidentsRouter = Router();

incidentsRouter.get("/", (_req, res) => {
    res.json({
        count: getAllIncidents().length,
        incidents: getAllIncidents()
    })
})

incidentsRouter.post("/", (req, res) => {
    const result = createIncidentSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: "invalid incident payload",
            details: result.error.flatten()
        })
    }
    const incident = createIncident(result.data)
    return res.status(201).json({
        message: "incident created successfully",
        incident,
    })
})

export { incidentsRouter }