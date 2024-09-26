import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { userService } from "../services/userService.mjs";
import { apiResponse } from "../utils/apiResponse";

const signupUser = async (event) => {
  try {
    await userService.signup(event.body);
    return apiResponse(201, {
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    console.error(error);
    return apiResponse(400, { success: false, message: error.message });
  }
};

const loginUser = async (event) => {
  try {
    const token = await userService.login(event.body);
    return apiResponse(200, { token });
  } catch (error) {
    console.error("Login error", error);
    return apiResponse(401, { message: "Invalid credentials" });
  }
};

export const handler = middy((event) => {
  switch (`${event.httpMethod} ${event.resource}`) {
    case "POST /api/user/signup":
      return signup(event);
    case "POST /api/user/login":
      return login(event);
    default:
      throw new Error("Not Found");
  }
}).use(jsonBodyParser());
