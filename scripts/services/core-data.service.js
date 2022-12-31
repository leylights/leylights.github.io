var _a;
export class CoreDataService {
    static get isDev() {
        return !(window.location.href.includes('.ca') || window.location.href.includes('.io'));
    }
    static getSiteName() {
        const url = window.location.origin.split('//').pop();
        if (url.includes('127.0.0.1'))
            return 'some-molasses.github.io';
        else
            return url;
    }
}
_a = CoreDataService;
CoreDataService.publicSiteUrls = ['colestanley.ca', 'some-molasses.github.io'];
CoreDataService.shouldRiverify = !window.location.hostname.includes('colestanley');
CoreDataService.personalName = CoreDataService.shouldRiverify ? 'River Stanley' : 'Cole Stanley';
CoreDataService.siteName = _a.getSiteName();
CoreDataService.siteLogoSrc = '/siteimages/logo.svg';
CoreDataService.favicon = '/siteimages/logo-invertible.svg';
CoreDataService.email = CoreDataService.shouldRiverify ? 'river.stanley@uwaterloo.ca' : 'me@colestanley.ca';
//# sourceMappingURL=core-data.service.js.map