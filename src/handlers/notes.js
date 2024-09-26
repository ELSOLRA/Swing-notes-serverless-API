const middy = require("@middy/core");
const { noteService } = require("../services/noteService.js");
const { apiResponse } = require("../utils/apiResponse.js");
const jsonBodyParser = require("@middy/http-json-body-parser");
const { authMiddleware } = require("../middleware/auth.js");

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
      console.log("Delete event:", JSON.stringify(event, null, 2));
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

exports.handler = middy((event) => {
  /*   noteHandlers.handle(event); */ /* version 2 */

  const {
    requestContext: {
      http: { method: httpMethod },
    },
    rawPath: path,
  } = event;

  if (httpMethod === "DELETE" && path.startsWith("/api/notes/")) {
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
  }

  return apiResponse(404, { message: "Not Found" });
})
  .use(jsonBodyParser())
  .use(authMiddleware());
