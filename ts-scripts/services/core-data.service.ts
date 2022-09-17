export class CoreDataService {
  public static publicSiteUrl: string = 'colestanley.ca';

  public static shouldRiverify = !window.location.hostname.includes('colestanley');
  public static personalName = CoreDataService.shouldRiverify ? 'River Stanley' : 'Cole Stanley';
  public static siteName: string = this.getSiteName();
  public static siteLogoSrc: string = '/siteimages/logo.svg';
  public static favicon: string = '/siteimages/logo-invertible.svg';

  public static email: string = CoreDataService.shouldRiverify ? 'river.stanley@uwaterloo.ca' : 'me@colestanley.ca';

  public static get isDev(): boolean {
    return !(window.location.href.includes('.ca') || window.location.href.includes('.io'));
  }

  private static getSiteName(): string {
    const url: string = window.location.origin.split('//').pop();

    if (url.includes('127.0.0.1')) return 'some-molasses.github.io';
    else return url;
  }
}
