import { Molasses } from "../molasses";

export class GoogleAnalyticsController {
  static HIDE_COOKIE = 'hideFromAnalytics';

  static init() {
    document.head.insertAdjacentElement('afterbegin', Molasses.createElement({
      type: 'script',
      otherNodes: [
        { type: 'async', value: '', },
        { type: 'src', value: 'https://www.googletagmanager.com/gtag/js?id=G-NG770M6WSD', },
      ],
    }));

    //@ts-ignore
    window.dataLayer = window.dataLayer || [];
    //@ts-ignore
    function gtag(...args) { dataLayer.push(arguments); }
    gtag('js', new Date());

    gtag('config', 'G-NG770M6WSD');
  }
}
