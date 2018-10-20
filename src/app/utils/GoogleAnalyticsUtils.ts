declare let gtag: Function;

declare namespace GoogleAnalyticsConfig {
  export const trackingId: string;
}

export class GoogleAnalyticsUtils {

  public static pageView(pagePath: string, pageTitle: string): void {
    gtag('config', GoogleAnalyticsConfig.trackingId, {
      'page_title' : pageTitle,
      'page_path': pagePath
    });
  }

  public static event(eventCategory: string,
                      eventAction: string,
                      eventLabel: string = null,
                      eventValue: number = null): void {
    gtag('event', eventAction, {
      event_category: eventCategory,
      event_label: eventLabel,
      value: eventValue
    });
  }

  public static setUserId(userId: number): void {
    gtag('set', {'user_id': `${userId}`});
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
