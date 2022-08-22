/**
 * Handles cookie interactions
 */
export class CookieInterface {
    /**
     * Deletes a single cookie
     */
    static clearCookie(key) {
        const existingCookie = this.getCookieRaw(key);
        if (!existingCookie)
            return;
        this.setCookieRaw(existingCookie, new Date(1));
    }
    /**
     * Clears the document.cookie string
     */
    static clearAllCookies() {
        const me = this;
        this.getCookiesRaw().forEach((cookie) => {
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
    static getCookieValue(key) {
        const cookie = this.getCookieRaw(key);
        if (!cookie)
            return cookie;
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
    static getCookieRaw(key) {
        const results = this.getCookiesRaw().filter((cookie) => {
            return cookie.split('=')[0] === key;
        });
        if (results.length === 1)
            return results[0];
        else
            return null;
    }
    /**
     * Returns all cookies
     */
    static getCookiesRaw() {
        return document.cookie.split(';').map(c => c.trim());
    }
    /**
     * Sets a cookie
     */
    static setCookie(key, value, expiry, thisPageOnly) {
        return CookieInterface.setCookieRaw(key + '=' + value, expiry, thisPageOnly);
    }
    /**
     * Sets a cookie without key-value mapping
     */
    static setCookieRaw(name, expiry, thisPageOnly) {
        let cookie = name;
        if (expiry)
            cookie += '; expires=' + expiry.toUTCString();
        if (thisPageOnly)
            cookie += '; path=' + window.location.pathname;
        document.cookie = cookie;
    }
}
//# sourceMappingURL=cookie-interface.service.js.map