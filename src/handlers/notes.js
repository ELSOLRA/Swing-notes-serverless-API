import middy from "@middy/core";
import { noteService } from "../services/noteService.js";
import { apiResponse } from "../utils/apiResponse.js";
import jsonBodyParser from "@middy/http-json-body-parser";
import { authMiddleware } from "../middleware/auth.js";

const noteHandlers = {
  /*     handle: async (event) => {
    const { httpMethod, resource } = event;
    
    switch (`${httpMethod} ${resource}`) {
      case 'GET /api/notes':
        return this.getNotes(event);
      case 'POST /api/notes':
        return this.saveNote(event);
      case 'PUT /api/notes':
        return this.updateNote(event);
      case 'DELETE /api/notes/{id}':
        return this.deleteNote(event);
      default:
        return apiResponse(404, { message: 'Not Found' });
    }
  }, */ /* version 2 */

  getNotes: async (event) => {
    try {
      const notes = await noteService.getAllNotes(event.userId);
      return apiResponse(200, notes);
    } catch (error) {
      console.error(error);
      return apiResponse(500, { message: "Error retrieving note" });
    }
  },
  getNote: async (event) => {
    try {
      const noteId = event.pathParameters.id;

      if (!noteId) {
        return apiResponse(400, {
          success: false,
          message: "Note ID is required",
        });
      }
      const result = await noteService.getNoteById(event.userId, noteId);
      if (!result) {
        return apiResponse(404, {
          success: false,
          message: `Note with id ${noteId} not found, or you don't have permission`,
        });
      }
      return apiResponse(200, {
        success: true,
        note: result,
      });
    } catch (error) {
      console.error("Error getting note:", error);
      return apiResponse(500, {
        success: false,
        message: "An unexpected error",
      });
    }
  },
  saveNote: async (event) => {
    try {
      const note = await noteService.saveOneNote(event.userId, event.body);
      return apiResponse(201, note);
    } catch (error) {
      console.error(error);
      return apiResponse(500, { message: "Error saving note" });
    }
  },
  updateNote: async (event) => {
    try {
      const note = await noteService.updateOneNote(event.userId, event.body);
      return apiResponse(200, note);
    } catch (error) {
      console.error(error);
      return apiResponse(500, { message: "Error updating note" });
    }
  },
  deleteNote: async (event) => {
    try {
      const noteId = event.pathParameters.id;

      const result = await noteService.deleteOneNote(event.userId, noteId);
      switch (result.status) {
        case "DELETED":
          return apiResponse(200, {
            success: true,
            message: `Note with id ${noteId} deleted`,
            deletedNote: result.deletedNote,
          });
        case "NOT_FOUND":
          return apiResponse(404, {
            success: false,
            message: `Note with id ${noteId} not found`,
          });
        case "FORBIDDEN":
          return apiResponse(403, {
            success: false,
            message: "You don't have permission to delete this note",
          });
        default:
          throw new Error("Unexpected result status");
      }
    } catch (error) {
      console.error(error);
      return apiResponse(500, { message: "Error deleting note" });
    }
  },
};

export const handler = middy((event) => {
  /*   noteHandlers.handle(event); */ /* version 2 */

  const {
    requestContext: {
      http: { method: httpMethod },
    },
    pathParameters: path,
  } = event;

  /*   if (httpMethod === "DELETE" && path.startsWith("/api/notes/")) {
    return noteHandlers.deleteNote(event);
  }

  console.log(`Received request: ${httpMethod} ${path}`);
  const handlerName = {
    "GET /api/notes": "getNotes",
    "POST /api/notes": "saveNote",
    "PUT /api/notes": "updateNote",
    // "DELETE /api/notes": "deleteNote",
  }[`${httpMethod} ${path}`];

  if (handlerName && noteHandlers[handlerName]) {
    return noteHandlers[handlerName](event);
  } */

  switch (httpMethod) {
    case "GET":
      return path?.id
        ? noteHandlers.getNote(event)
        : noteHandlers.getNotes(event);
    case "POST":
      return noteHandlers.saveNote(event);
    case "PUT":
      return noteHandlers.updateNote(event);
    case "DELETE":
      if (path?.id) {
        return noteHandlers.deleteNote(event);
      } else {
        return apiResponse(400, { message: "Note ID is required " });
      }
    default:
      return apiResponse(404, { message: "Not Found" });
  }
})
  .use(jsonBodyParser())
  .use(authMiddleware());
