export class CoreDataService {
  public static publicSiteUrl: string = 'colestanley.ca';

  public static shouldRiverify = !window.location.hostname.includes('colestanley');
  public static personalName = CoreDataService.shouldRiverify ? 'River Stanley' : 'Cole Stanley';
  public static siteName: string = CoreDataService.shouldRiverify ? 'riverstanley.ca' : 'colestanley.ca';
  public static siteLogoSrc: string = '/siteimages/river-logo.svg';
}
