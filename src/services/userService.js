const { v4 } = require("uuid");
const { PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

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

exports.userService = {
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
    console.log("User---", user);

    if (!user) {
      throw new Error("Invalid credentials");
    }
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      throw new Error("Invalid credentials");
    }
    return jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
  },
};
