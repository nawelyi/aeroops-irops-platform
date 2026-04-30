import { z } from 'zod';

export const createIncidentSchema = z.object({
    flightNumber: z.string().min(2, "Flight number is required").max(10, "Flight number must be less than 10 characters"),
    type: z.enum(["DELAY", "CANCELLATION", "GATE_CHANGE"]),
    severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
    reason: z.string().min(3, "Reason must be at least 3 characters").max(200, "Reason must be less than 200 characters"),
})

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;


//recuerda subirle tu package json pa que sepas que versiones tiene sy el uso de git y github profesionalmente