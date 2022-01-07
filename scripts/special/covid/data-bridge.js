var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { cws } from "../../cws.js";
/**
 * Handles retrieval of data from the API
 */
export class COVIDDataBridge {
    /**
     * Initializes the DataBridge
     */
    static init() {
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
    static addToQueue(relativeUrl) {
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
                }
                else if (!cws.Array.includes(COVIDDataBridge.queue, relativeUrl)) {
                    pushUrl();
                }
            }, COVIDDataBridge.QUEUE_PROMISE_CHECK_INTERVAL);
        });
        return result;
    }
    static fetchFromAPI(relativeUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = (yield (yield fetch(COVIDDataBridge.url + relativeUrl)).json());
            COVIDDataBridge.cache[relativeUrl] = result;
            return result;
        });
    }
    /**
     * Retrieves data from the API.
     *
     * If the data has been previously retrieved, gets it from a local cache
     */
    static get(relativeUrl, sendImmediately) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!COVIDDataBridge.isInitialized)
                COVIDDataBridge.init();
            if (!!COVIDDataBridge.cache[relativeUrl]) {
                return COVIDDataBridge.cache[relativeUrl];
            }
            else if (sendImmediately) {
                return yield COVIDDataBridge.fetchFromAPI(relativeUrl);
            }
            else {
                return COVIDDataBridge.addToQueue(relativeUrl);
            }
        });
    }
}
COVIDDataBridge.url = 'https://api.opencovid.ca/';
COVIDDataBridge.isInitialized = false;
COVIDDataBridge.cache = {};
COVIDDataBridge.queue = [];
COVIDDataBridge.QUEUE_BUILDUP_DELAY_MS = 250;
COVIDDataBridge.QUEUE_PROMISE_CHECK_INTERVAL = COVIDDataBridge.QUEUE_BUILDUP_DELAY_MS + 50;
//# sourceMappingURL=data-bridge.js.map