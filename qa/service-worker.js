"use strict";
const CACHE_VERSION = 1;
let CURRENT_CACHES = {
    offline: "offline-v1"
};
const OFFLINE_URL = "https://www.dagelan.org/p/offline.html";

function createCacheBustedRequest(e) {
    let t = new Request(e, {
        cache: "reload"
    });
    if ("cache" in t) return t;
    let n = new URL(e, self.location.href);
    return n.search += (n.search ? "&" : "") + "cachebust=" + Date.now(), new Request(n)
}
self.addEventListener("install", e => {
    e.waitUntil(fetch(createCacheBustedRequest(OFFLINE_URL)).then(function(e) {
        return caches.open(CURRENT_CACHES.offline).then(function(t) {
            return t.put(OFFLINE_URL, e)
        })
    }))
}), self.addEventListener("activate", e => {
    let t = Object.keys(CURRENT_CACHES).map(function(e) {
        return CURRENT_CACHES[e]
    });
    e.waitUntil(caches.keys().then(e => Promise.all(e.map(e => {
        if (-1 === t.indexOf(e)) return console.log("Deleting out of date cache:", e), caches.delete(e)
    }))))
}), self.addEventListener("fetch", e => {
    ("navigate" === e.request.mode || "GET" === e.request.method && e.request.headers.get("accept").includes("text/html")) && (console.log("Handling fetch event for", e.request.url), e.respondWith(fetch(e.request).catch(e => (console.log("Fetch failed; returning offline page instead.", e), caches.match(OFFLINE_URL)))))
});
