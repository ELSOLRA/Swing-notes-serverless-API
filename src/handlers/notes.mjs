import middy from "@middy/core";
import { noteService } from "../services/noteService.mjs";
import { apiResponse } from "../utils/apiResponse";
import jsonBodyParser from "@middy/http-json-body-parser";
import { authMiddleware } from "../middleware/auth.mjs";

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
      const note = await noteService.saveOneNote(event.userId, event.body);
      return apiResponse(200, note);
    } catch (error) {
      console.error(error);
      return apiResponse(500, { message: "Error updating note" });
    }
  },
  deleteNote: async (event) => {
    try {
      await noteService.deleteOneNote(event.userId, event.pathParameters.id);
      return apiResponse(204, {
        success: true,
        message: `Note with id ${event.pathParameters.id} deleted`,
      });
    } catch (error) {
      console.error(error);
      return apiResponse(500, { message: "Error deleting note" });
    }
  },
};

export const handler = middy((event) => {
  /*   noteHandlers.handle(event); */ /* version 2 */
  const { httpMethod, resource } = event;
  const handlerName = {
    "GET /api/notes": "getNotes",
    "POST /api/notes": "saveNote",
    "PUT /api/notes": "updateNote",
    "DELETE /api/notes/{id}": "deleteNote",
  }[`${httpMethod} ${resource}`];

  if (handlerName && noteHandlers[handlerName]) {
    return noteHandlers[handlerName](event);
  }

  return apiResponse(404, { message: "Not Found" });
})
  .use(jsonBodyParser())
  .use(authMiddleware());
