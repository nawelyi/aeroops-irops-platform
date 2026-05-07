import { randomUUID } from "node:crypto";
import { z } from "zod";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const createIncidentSchema = z.object({
  flightNumber: z.string().min(2).max(10),
  type: z.enum(["DELAY", "CANCELLATION", "GATE_CHANGE"]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
  reason: z.string().min(3).max(200),
});

export const handler = async (event: { body?: string | null }) => {
  try {
    const rawBody = event.body ? JSON.parse(event.body) : {};
    const parsed = createIncidentSchema.safeParse(rawBody);

    if (!parsed.success) {
      return {
        statusCode: 400,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          error: "Invalid incident payload",
          details: parsed.error.flatten(),
        }),
      };
    }

    const tableName = process.env.TABLE_NAME;

    if (!tableName) {
      throw new Error("TABLE_NAME environment variable is missing");
    }

    const incident = {
      id: randomUUID(),
      flightNumber: parsed.data.flightNumber.toUpperCase(),
      type: parsed.data.type,
      severity: parsed.data.severity,
      reason: parsed.data.reason,
      status: "OPEN",
      createdAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: tableName,
        Item: incident,
      })
    );

    return {
      statusCode: 201,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        message: "Incident created successfully",
        incident,
      }),
    };
  } catch (error) {
    console.error("createIncident failed", error);

    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        error: "Internal server error",
      }),
    };
  }
};