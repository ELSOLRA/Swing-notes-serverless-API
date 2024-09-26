import jwt from "jsonwebtoken";
import { apiResponse } from "../utils/apiResponse";

export const authMiddleware = () => {
  return {
    before: async (handler) => {
      const authHeader =
        handler.event.headers.Authorization ||
        handler.event.headers.authorization;
      try {
        if (!authHeader) {
          throw new Error("Missing Authorization header");
        }
        const token =
          authHeader.split(
            " "
          )[1]; /* eller ---  authHeader.replace("Bearer ", "").trim(); */
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        handler.event.userId = decoded.userId;
      } catch (error) {
        console.error("Authentication error:", error);
        return apiResponse(401, { message: "Unauthorized" });
      }
    },
  };
};
