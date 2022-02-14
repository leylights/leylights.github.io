var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
import { cws } from "../../cws.js";
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
    constructor(hostname) {
        this.isRunning = false;
        this.consecutiveEmptySends = 0;
        this.cache = {};
        this.queue = [];
        this.APIHostname = hostname;
    }
    get queueURLs() {
        return this.queue.map((request) => request.path);
    }
    open() {
        const me = this;
        this.requestSendInterval = setInterval(() => {
            me.sendRequests();
            if (me.consecutiveEmptySends >= DataBridge.CONSECUTIVE_EMPTY_SEND_LIMIT)
                me.close();
        }, DataBridge.QUEUE_BUILDUP_DELAY_MS);
        this.isRunning = true;
        this.consecutiveEmptySends = 0;
    }
    close() {
        clearInterval(this.requestSendInterval);
        this.isRunning = false;
        this.consecutiveEmptySends = 0;
    }
    addToQueue(path) {
        this.queue.push({
            path: path,
            sent: false,
            reached: false,
        });
    }
    /**
     * Clears the cache of previous responses
     */
    clearCache() {
        this.cache = {};
    }
    fetchFromAPI(relativeUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = (yield (yield fetch(this.APIHostname + relativeUrl)).json());
            this.cache[relativeUrl] = result;
            return result;
        });
    }
    /**
     * Retrieves data from the API.
     *
     * If the data has been previously retrieved, gets it from a local cache
     */
    get(relativeUrl, forceUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            if (forceUpdate || !this.cache[relativeUrl]) {
                return this.receiveRequest(relativeUrl);
            }
            else {
                return this.cache[relativeUrl];
            }
        });
    }
    /**
     * Adds the path to the queue
     * Assumes that there is no cache[path] value, though it would not technically cause issues if there were
     */
    receiveRequest(path) {
        const me = this;
        if (!this.isRunning)
            this.open();
        if (!cws.Array.includes(me.queueURLs, path))
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
    sendRequests() {
        const me = this;
        if (me.queue.length === 0)
            me.consecutiveEmptySends++;
        else
            me.consecutiveEmptySends = 0;
        me.queue.forEach((relativeUrl) => {
            me.fetchFromAPI(relativeUrl.path);
            relativeUrl.sent = true;
        });
        me.queue = me.queue.filter((relativeUrl) => {
            return !relativeUrl.sent;
        });
    }
}
_a = DataBridge;
DataBridge.CONSECUTIVE_EMPTY_SEND_LIMIT = 3;
DataBridge.QUEUE_BUILDUP_DELAY_MS = 250;
DataBridge.QUEUE_PROMISE_CHECK_INTERVAL = _a.QUEUE_BUILDUP_DELAY_MS + 50;
//# sourceMappingURL=data-bridge.component.js.map