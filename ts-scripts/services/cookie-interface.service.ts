/**
 * Handles cookie interactions
 */
export class CookieInterface {

  /**
   * Deletes a single cookie
   */
  static clearCookie(key: string): void {
    const existingCookie = this.getCookieRaw(key);
    if (!existingCookie) return;

    this.setCookieRaw(existingCookie, new Date(1));
  }

  /**
   * Clears the document.cookie string
   */
  static clearAllCookies(): void {
    const me = this;
    this.getCookiesRaw().forEach((cookie: string) => {
      me.clearCookie(cookie);
    });
  }

  /**
   * Returns the value of a cookie
   * 
   * @example 
   * // for document.cookie === 'name="jim"' 
   * getCookieRaw('name') => 'jim'
   */
  static getCookieValue(key: string): string | null {
    const cookie = this.getCookieRaw(key);
    if (!cookie) return cookie;

    const value = cookie.split('=')[1];
    return value || cookie;
  }

  /**
   * Returns the full string for a cookie
   * 
   * @example 
   * // for document.cookie === 'name="jim"' 
   * getCookieRaw('name') => 'name="jim"'
   */
  static getCookieRaw(key: string): string | null {
    const results: string[] = this.getCookiesRaw().filter((cookie) => {
      return cookie.split('=')[0] === key;
    });

    if (results.length === 1) return results[0];
    else return null;
  }

  /**
   * Returns all cookies
   */
  static getCookiesRaw(): string[] {
    return document.cookie.split(';').map(c => c.trim());
  }

  /**
   * Sets a cookie
   */
  static setCookie(key: string, value: string, expiry?: Date, thisPageOnly?: boolean): void {
    return CookieInterface.setCookieRaw(key + '=' + value, expiry, thisPageOnly);
  }

  /**
   * Sets a cookie without key-value mapping
   */
  static setCookieRaw(name: string, expiry?: Date, thisPageOnly?: boolean): void {
    let cookie: string = name;
    if (expiry) cookie += '; expires=' + expiry.toUTCString();
    if (thisPageOnly) cookie += '; path=' + window.location.pathname;

    document.cookie = cookie;
  }
}