export class CoreDataService {
}
CoreDataService.publicSiteUrl = 'colestanley.ca';
CoreDataService.shouldRiverify = !window.location.hostname.includes('colestanley');
CoreDataService.personalName = CoreDataService.shouldRiverify ? 'River Stanley' : 'Cole Stanley';
CoreDataService.siteName = CoreDataService.shouldRiverify ? 'leylights.github.io' : 'colestanley.ca';
CoreDataService.siteLogoSrc = '/siteimages/logo.svg';
CoreDataService.favicon = '/siteimages/logo-invertible.svg';
CoreDataService.email = CoreDataService.shouldRiverify ? 'river.stanley@uwaterloo.ca' : 'me@colestanley.ca';
//# sourceMappingURL=core-data.service.js.map