import { v4 } from "uuid";
import { db } from "./db.mjs";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ScanCommand } from "@aws-sdk/client-dynamodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const users = process.env.USERS;

const getUser = async (username) => {
  const params = {
    TableName: users,
    FilterExpression: "username = :username",
    ExpressionAttributeValues: { ":username": username },
  };
  const result = await db.send(new ScanCommand(params));
  return result.Items[0];
};

export const userService = {
  signup: async ({ username, password }) => {
    const existingUser = await getUser(username);
    if (existingUser) {
      throw new Error("Username already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: v4(),
      username,
      password: hashedPassword,
    };
    const params = {
      TableName: users,
      Item: user,
    };
    await db.send(new PutCommand(params));
  },

  login: async ({ username, password }) => {
    const user = await getUser(username);

    if (!user) {
      throw new Error("Invalid credentials");
    }
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      throw new Error("Invalid credentials");
    }
    return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
  },
};
