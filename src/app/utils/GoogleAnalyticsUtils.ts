declare let ga: Function;

export class GoogleAnalyticsUtils {

  public static emitEvent(eventCategory: string,
                          eventAction: string,
                          eventLabel: string = null,
                          eventValue: number = null) {
    ga('send', 'event', {
      eventCategory: eventCategory,
      eventLabel: eventLabel,
      eventAction: eventAction,
      eventValue: eventValue
    });
  }

  public static Events: GAEventCategories = {
    Exam: {
      cat: "exam",
      actions: {
        Started: "started"
      }
    }
  }

}

interface GAEventCategories {
  [key: string]: {
    cat: string
    actions: { [key: string]: string },
  }
}
