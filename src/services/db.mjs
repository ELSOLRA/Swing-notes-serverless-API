import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
});

export const db = DynamoDBDocumentClient.from(client);
