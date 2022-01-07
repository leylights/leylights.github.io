import { cws } from "../../cws.js";

/**
 * Handles retrieval of data from the API
 */
export class COVIDDataBridge {
  static readonly url = 'https://api.opencovid.ca/';

  private static isInitialized: boolean = false;

  private static cache: Record<string, any> = {};
  private static queue: { url: string, reached: boolean }[] = [];

  private static QUEUE_BUILDUP_DELAY_MS = 250;
  private static QUEUE_PROMISE_CHECK_INTERVAL = COVIDDataBridge.QUEUE_BUILDUP_DELAY_MS + 50;

  /**
   * Initializes the DataBridge
   */
  private static init() {
    const interval = setInterval(() => {
      COVIDDataBridge.queue.forEach((relativeUrl) => {
        COVIDDataBridge.fetchFromAPI(relativeUrl.url);
        relativeUrl.reached = true;
      });

      COVIDDataBridge.queue = COVIDDataBridge.queue.filter((relativeUrl) => {
        return !relativeUrl.reached;
      });

    }, COVIDDataBridge.QUEUE_BUILDUP_DELAY_MS);

    COVIDDataBridge.isInitialized = true;
  }

  /**
   * Clears the cache of previous responses
   */
  static clearCache() {
    COVIDDataBridge.cache = {};
  }

  /**
   * Adds the relativeUrl to the queue
   * Assumes that there is no cache[relativeUrl] value, though it would not technically cause issues if there were
   */
  private static addToQueue(relativeUrl: string): Promise<any> {
    function pushUrl() {
      COVIDDataBridge.queue.push({ url: relativeUrl, reached: false });
    }

    if (!cws.Array.includes(COVIDDataBridge.queue, relativeUrl))
      pushUrl();

    const result = new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (!!COVIDDataBridge.cache[relativeUrl]) {
          clearInterval(interval);
          resolve(COVIDDataBridge.cache[relativeUrl]);
        } else if (!cws.Array.includes(COVIDDataBridge.queue, relativeUrl)) {
          pushUrl();
        }
      }, COVIDDataBridge.QUEUE_PROMISE_CHECK_INTERVAL);
    });

    return result;
  }

  private static async fetchFromAPI(relativeUrl: string): Promise<any> {
    const result = (await (await fetch(COVIDDataBridge.url + relativeUrl)).json());
    COVIDDataBridge.cache[relativeUrl] = result;
    return result;
  }

  /**
   * Retrieves data from the API.
   * 
   * If the data has been previously retrieved, gets it from a local cache
   */
  static async get(relativeUrl: string, sendImmediately?: boolean) {
    if (!COVIDDataBridge.isInitialized)
      COVIDDataBridge.init();

    if (!!COVIDDataBridge.cache[relativeUrl]) {
      return COVIDDataBridge.cache[relativeUrl];
    } else if (sendImmediately) {
      return await COVIDDataBridge.fetchFromAPI(relativeUrl);
    } else {
      return COVIDDataBridge.addToQueue(relativeUrl);
    }
  }
}