declare let gtag: Function;

export class GoogleAnalyticsUtils {

  private static isEnabled: boolean = !!ResmatConfig.googleAnalytics.trackingId;

  public static pageView(pagePath: string, pageTitle: string): void {
    if (!GoogleAnalyticsUtils.isEnabled) { return; }
    gtag('config', ResmatConfig.googleAnalytics.trackingId, {
      'page_title' : pageTitle,
      'page_path': pagePath
    });
  }

  public static event(eventCategory: string,
                      eventAction: string,
                      eventLabel: string = null,
                      eventValue: number = null): void {
    if (!GoogleAnalyticsUtils.isEnabled) { return; }
    gtag('event', eventAction, {
      event_category: eventCategory,
      event_label: eventLabel,
      value: eventValue
    });
  }

  public static setUserId(userId: number): void {
    if (!GoogleAnalyticsUtils.isEnabled) { return; }
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
