export type IncidentType = "DELAY" | "CANCELLATION" | "GATE_CHANGE";
export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH";


export interface Incident {
    id: string;
    flightNumber: string;
    type: IncidentType;
    severity: IncidentSeverity;
    reason: string;
    status: "OPEN";
    createdAt: string;
}