declare let gtag: Function;

export class GoogleAnalyticsUtils {

  public static emitEvent(eventCategory: string,
                          eventAction: string,
                          eventLabel: string = null,
                          eventValue: number = null) {
    gtag('event', eventAction, {
      event_category: eventCategory,
      event_label: eventLabel,
      value: eventValue
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
