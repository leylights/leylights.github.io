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
//# sourceMappingURL=google-analytics.service.js.map