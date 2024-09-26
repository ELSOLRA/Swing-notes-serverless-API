const middy = require("@middy/core");
const { userService } = require("../services/userService.js");
const { apiResponse } = require("../utils/apiResponse.js");
const jsonBodyParser = require("@middy/http-json-body-parser");

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

exports.handler = middy((event) => {
  console.log(
    `HTTP Method--${event.requestContext.http.method}, Path-- ${event.rawPath}`
  );
  switch (`${event.requestContext.http.method} ${event.rawPath}`) {
    case "POST /api/user/signup":
      return signupUser(event);
    case "POST /api/user/login":
      return loginUser(event);
    default:
      throw new Error("Not Found");
  }
}).use(jsonBodyParser());
/* const routeEvent = (event) => {
  // Log the event details for debugging
  console.log(
    `HTTP Method: ${event.httpMethod}, Event: ${JSON.stringify(event)}`
  );
  console.log("event resource:--", event.resource);

  const path = event.path || event.resource || event.rawPath || "";
  const normalizedPath = event.path.replace(/\/$/, "").toLowerCase();

  switch (`${event.httpMethod} ${normalizedPath}`) {
    case "POST /api/user/signup":
      return signupUser(event);
    case "POST /api/user/login":
      return loginUser(event);
    default:
      throw new Error("Not Found");
  }
};

exports.handler = middy(routeEvent).use(jsonBodyParser()); */
