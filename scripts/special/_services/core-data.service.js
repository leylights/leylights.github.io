export class CoreDataService {
}
CoreDataService.publicSiteUrl = 'colestanley.ca';
CoreDataService.shouldRiverify = !window.location.hostname.includes('colestanley');
CoreDataService.personalName = CoreDataService.shouldRiverify ? 'River Stanley' : 'Cole Stanley';
CoreDataService.siteName = CoreDataService.shouldRiverify ? 'riverstanley.ca' : 'colestanley.ca';
CoreDataService.siteLogoSrc = '/siteimages/logo.svg';
//# sourceMappingURL=core-data.service.js.map