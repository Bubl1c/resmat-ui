import { ErrorHandler, Injectable} from '@angular/core';
import { GoogleAnalyticsUtils } from "./utils/GoogleAnalyticsUtils";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  constructor() { }

  handleError(error) {
    let errorJson = "";
    let errorMessage = "";
    try {
      errorMessage = error.message;
      errorJson = JSON.stringify(error);
      errorJson = errorJson || error.toString()
    } catch (e) {
      //no need to handle this error
    }
    GoogleAnalyticsUtils.event("UnhandledError", errorJson, `Error: ${errorMessage || "Error without message"}`);
    // IMPORTANT: Rethrow the error otherwise it gets swallowed
    throw error;
  }

}
