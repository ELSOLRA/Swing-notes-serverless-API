import db from "./db.js";
import { v4 } from "uuid";
import {
  DeleteCommand,
  PutCommand,
  UpdateCommand,
  ScanCommand,
  GetCommand,
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

  getNoteById: async (userId, id) => {
    const params = {
      TableName: notes,
      Key: { id },
    };

    const result = await db.send(new GetCommand(params));
    if (result.Item && result.Item.userId === userId) {
      return result.Item;
    } else {
      return null;
    }
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
        "set title = :title, #text = :text, modifiedAt = :modifiedAt",
      ExpressionAttributeNames: {
        "#text": "text",
      },
      ExpressionAttributeValues: {
        ":title": title.substring(0, 50),
        ":text": text.substring(0, 300),
        ":modifiedAt": new Date().toISOString(),
        ":userId": userId,
      },
      ConditionExpression: "userId = :userId",
      ReturnValues: "ALL_NEW",
    };
    const result = await db.send(new UpdateCommand(updateParams));
    return result.Attributes;
  },

  deleteOneNote: async (userId, id) => {
    const getParams = {
      TableName: notes,
      Key: { id },
    };

    const existingNote = await db.send(new GetCommand(getParams));

    if (!existingNote.Item) {
      return { status: "NOT_FOUND" };
    }

    if (existingNote.Item.userId !== userId) {
      return { status: "FORBIDDEN" };
    }

    const deleteParams = {
      TableName: notes,
      Key: { id },
      ConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
      ReturnValues: "ALL_OLD",
    };
    const result = await db.send(new DeleteCommand(deleteParams));
    return { status: "DELETED", deletedNote: result.Attributes };
  },
};
