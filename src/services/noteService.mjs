import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { db } from "./db.mjs";
import { v4 } from "uuid";
import {
  DeleteCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const notes = process.env.NOTES;

export const noteService = {
  getAllNotes: async (userId) => {
    const params = {
      TableName: notes,
      FilterExpression: "userId = :userId",
      ExpressionAttributeValues: { ":userId": userId },
    };

    const result = await db.send(new ScanCommand(params));
    return result.Items;
  },

  saveOneNote: async (userId, { title, text }) => {
    const note = {
      id: v4(),
      userId,
      title: title.substring(0, 50),
      text: text.substring(0, 300),
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };
    const noteParams = {
      TableName: notes,
      Item: note,
    };
    await db.send(new PutCommand(noteParams));
    return note;
  },

  updateOneNote: async (userId, { id, title, text }) => {
    const updateParams = {
      TableName: notes,
      Key: { id },
      UpdateExpression:
        "set title = :title, text = :text, modifiedAt = :modifiedAt",
      ExpressionAttributeValues: {
        ":title": title.substring(0, 50),
        ":text": text.substring(0, 300),
        ":modifiedAt": new Date().toISOString(),
        ":userId": userId,
      },
    };
    const result = await db.send(new UpdateCommand(updateParams));
    return result.Attributes;
  },

  deleteOneNote: async (userId, id) => {
    const deleteParams = {
      TableName: notes,
      Key: { id },
      ConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    };
    await db.send(new DeleteCommand(deleteParams));
  },
};
