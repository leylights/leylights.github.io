import { Molasses } from "../molasses";

/**
 * Handles retrieval of data from the API
 */
type DataBridgeRequest = {
  path: string,
  sent: boolean,
  reached: boolean,
};

/*
 * Overview:

  First, the client must call .init()
 
  RECEIVE REQUEST MECHANISM:
  1. the client sends a request
  2. if the request is already in the cache, and forceUpdate : boolean = true is not passed, then return the cached value
  3. else if the request is not in the queue, add it to the queue 
  4. Every n seconds, check if the path has been added to the cache.  If so, return the cached result.

  SEND REQUEST MECHANISM:
  Every m seconds, the DataBridge sends all the requests in queue to its API.  
  All responses are saved in the cache with their relative path as their key.

 */

export class DataBridge {
  private APIHostname: string;

  private requestSendInterval: ReturnType<typeof setInterval>;
  private isRunning: boolean = false;
  private consecutiveEmptySends: number = 0;

  private cache: Record<string, any> = {};
  private queue: DataBridgeRequest[] = [];

  private static readonly CONSECUTIVE_EMPTY_SEND_LIMIT = 3;
  private static readonly QUEUE_BUILDUP_DELAY_MS = 250;
  private static readonly QUEUE_PROMISE_CHECK_INTERVAL = this.QUEUE_BUILDUP_DELAY_MS + 50;

  constructor(hostname: string) {
    if (hostname[hostname.length - 1] == '/') hostname = hostname.slice(0, -1);
    this.APIHostname = hostname;
  }

  private get queueURLs(): string[] {
    return this.queue.map((request) => request.path);
  }

  private open(this: DataBridge) {
    const me = this;

    this.requestSendInterval = setInterval(() => {
      me.sendRequests();

      if (me.consecutiveEmptySends >= DataBridge.CONSECUTIVE_EMPTY_SEND_LIMIT)
        me.close();
    }, DataBridge.QUEUE_BUILDUP_DELAY_MS);

    this.isRunning = true;
    this.consecutiveEmptySends = 0;
  }

  private close(this: DataBridge) {
    clearInterval(this.requestSendInterval);
    this.isRunning = false;
    this.consecutiveEmptySends = 0;
  }

  private addToQueue(this: DataBridge, path: string) {
    this.queue.push({
      path: path,
      sent: false,
      reached: false,
    });
  }

  /**
   * Clears the cache of previous responses
   */
  clearCache(this: DataBridge) {
    this.cache = {};
  }

  private async fetchFromAPI(this: DataBridge, relativeUrl: string): Promise<any> {
    const result = (await (await fetch(this.APIHostname + relativeUrl)).json());
    this.cache[relativeUrl] = result;
    return result;
  }

  /**
   * Retrieves data from the API.
   * 
   * If the data has been previously retrieved, gets it from a local cache
   */
  async get(this: DataBridge, relativeUrl: string, forceUpdate?: boolean): Promise<any> {
    if (forceUpdate || !this.cache[relativeUrl]) {
      return this.receiveRequest(relativeUrl);
    } else {
      return this.cache[relativeUrl];
    }
  }

  /**
   * Adds the path to the queue
   * Assumes that there is no cache[path] value, though it would not technically cause issues if there were
   */
  private receiveRequest(this: DataBridge, path: string): Promise<any> {
    const me = this;

    if (!this.isRunning)
      this.open();

    if (!Molasses.Array.includes(me.queueURLs, path))
      this.addToQueue(path);

    const result = new Promise((resolve, reject) => {
      const requestCheckInterval = setInterval(() => {
        if (me.cache[path]) { // result is in cache
          clearInterval(requestCheckInterval); // stop checking for result
          me.queue.splice(me.queueURLs.indexOf(path), 1); // remove from query from queue
          resolve(me.cache[path]);
        }
      }, DataBridge.QUEUE_PROMISE_CHECK_INTERVAL);
    });

    return result;
  }

  /**
   * Sends all requests currently in the queue
   */
  private sendRequests(this: DataBridge): void {
    const me = this;

    if (me.queue.length === 0) me.consecutiveEmptySends++;
    else me.consecutiveEmptySends = 0;

    me.queue.forEach((relativeUrl) => {
      me.fetchFromAPI(relativeUrl.path);
      relativeUrl.sent = true;
    });

    me.queue = me.queue.filter((relativeUrl) => {
      return !relativeUrl.sent;
    });
  }
}
