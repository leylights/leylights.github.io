//@ts-nocheck
export class GoogleAnalyticsController {
    constructor() {
        window.ga = window.ga || function () {
            (ga.q = ga.q || []).push(arguments);
        };
        ga.l = +new Date;
        ga('create', 'UA-124893307-1', 'auto');
        ga('send', 'pageview', location.pathname);
    }
}
GoogleAnalyticsController.HIDE_COOKIE = 'hideFromAnalytics';
//# sourceMappingURL=google-analytics-controller.service.js.map