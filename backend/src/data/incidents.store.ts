import type { Incident } from "../types/incident.js";
import type { CreateIncidentInput } from "../schemas/incident.schema.js";

const incidents: Incident[] = [];

export function getAllIncidents(): Incident[] {
    return incidents;
}


export function createIncident(input: CreateIncidentInput): Incident {
    const incident: Incident = {
        id: crypto.randomUUID(),
        flightNumber: input.flightNumber.toUpperCase(),
        type: input.type,
        severity: input.severity,
        reason: input.reason,
        status: "OPEN",
        createdAt: new Date().toISOString(),
    };
    incidents.unshift(incident);
    return incident;
}