//@ts-nocheck
export class GoogleAnalyticsController {
  static HIDE_COOKIE = 'hideFromAnalytics';

  constructor() {
    (<any>window).ga = (<any>window).ga || function () {
      (ga.q = ga.q || []).push(arguments);
    };
    ga.l = +new Date;
    ga('create', 'UA-124893307-1', 'auto');
    ga('send', 'pageview', location.pathname);
  }
}
