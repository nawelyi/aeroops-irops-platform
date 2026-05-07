import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async () => {
  try {
    const tableName = process.env.TABLE_NAME;

    if (!tableName) {
      throw new Error("TABLE_NAME environment variable is missing");
    }

    const result = await docClient.send(
      new ScanCommand({
        TableName: tableName,
      })
    );

    const incidents = (result.Items ?? []).sort((a, b) => {
      const aDate = new Date(String(a.createdAt)).getTime();
      const bDate = new Date(String(b.createdAt)).getTime();
      return bDate - aDate;
    });

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        count: incidents.length,
        incidents,
      }),
    };
  } catch (error) {
    console.error("listIncidents failed", error);

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