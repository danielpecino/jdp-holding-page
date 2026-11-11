/* JDP Security - cookie consent + Google Tag Manager loader (round 13j, updated 13P 11 Nov 2026).
 * UK GDPR / PECR: nothing from Google loads until the visitor clicks "Accept all".
 * Google Consent Mode v2 defaults (all denied) are set inline in <head> (id="jdp-consent-default").
 *
 * ===== THE ONE PLACE TO SET THE GTM CONTAINER ID =====                        */
var JDP_GTM_ID = "GTM-T826R7HR";
/* ====================================================                        */
(function () {
  "use strict";
  var KEY = "jdp_consent_v1";            // stored in localStorage (strictly necessary: remembers the choice)
  var MAX_AGE_DAYS = 365;                // ask again after 12 months
  // 13P: "Accept all" grants analytics only. Advertising signals stay denied (no Google advertising features are used).
  var GRANT = { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" };
  var DENY  = { analytics_storage: "denied",  ad_storage: "denied",  ad_user_data: "denied",  ad_personalization: "denied" };
  var w = window, d = document;
  w.dataLayer = w.dataLayer || [];
  if (typeof w.gtag !== "function") { w.gtag = function () { w.dataLayer.push(arguments); }; }

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!v || (v.choice !== "accepted" && v.choice !== "rejected")) return null;
      if (Date.now() - v.ts > MAX_AGE_DAYS * 864e5) return null;
      return v.choice;
    } catch (e) { return null; }
  }
  function save(choice) { try { localStorage.setItem(KEY, JSON.stringify({ choice: choice, ts: Date.now() })); } catch (e) {} }

  var gtmLoaded = false;
  function loadGTM() {
    if (gtmLoaded || !JDP_GTM_ID) return; gtmLoaded = true;
    // Standard Google Tag Manager snippet (head part). The <noscript> iframe is left out on purpose:
    // it would load GTM without consent.
    (function (w, d, s, l, i) { w[l] = w[l] || []; w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
      var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l != "dataLayer" ? "&l=" + l : ""; j.async = true;
      j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl; f.parentNode.insertBefore(j, f);
    })(w, d, "script", "dataLayer", JDP_GTM_ID);
  }
  function deleteGaCookies() {
    var host = location.hostname, parts = host.split("."), doms = ["", host, "." + host];
    if (parts.length > 2) doms.push("." + parts.slice(-3).join("."), "." + parts.slice(-2).join("."));
    d.cookie.split(";").forEach(function (c) {
      var n = c.split("=")[0].trim();
      // Removes _ga and _ga_13DCFXRNFW (and any other Google Analytics/Ads cookie names, just in case).
      if (/^(_ga|_gid|_gat|_gcl_)/.test(n)) doms.forEach(function (dm) {
        d.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + (dm ? "; domain=" + dm : "");
      });
    });
  }
  function apply(choice, fromClick) {
    if (choice === "accepted") {
      w.gtag("consent", "update", GRANT);
      w.dataLayer.push({ event: "consent_update", consent_choice: "accepted" });
      loadGTM();
    } else {
      w.gtag("consent", "update", DENY);
      if (fromClick) w.dataLayer.push({ event: "consent_update", consent_choice: "rejected" });
      deleteGaCookies();
      // If GTM was already running in this page view, reload so it stops (rare: accept then reject).
      if (fromClick && gtmLoaded) setTimeout(function () { location.reload(); }, 50);
    }
  }

  /* ---------- tracking events (pushed to dataLayer; only sent to Google if GTM is loaded after consent) ---------- */
  d.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null; if (!a) return;
    var href = a.getAttribute("href") || "";
    var where = a.closest("header") ? "header" : a.closest("footer") ? "footer" : "page";
    if (/^tel:/i.test(href)) w.dataLayer.push({ event: "phone_click", phone_number: href.slice(4), link_text: (a.textContent || "").trim().slice(0, 60), click_location: where, page_path: location.pathname });
    else if (/^mailto:/i.test(href)) w.dataLayer.push({ event: "email_click", email_address: href.slice(7).split("?")[0], link_text: (a.textContent || "").trim().slice(0, 60), click_location: where, page_path: location.pathname });
  }, true);

  // Contact / quote form: count only a real Web3Forms success (not errors, not the honeypot).
  if (w.fetch && !w.fetch.__jdp) {
    var of = w.fetch;
    var wrapped = function (input, init) {
      var url = typeof input === "string" ? input : (input && input.url) || "";
      var p = of.apply(this, arguments);
      if (/api\.web3forms\.com\/submit/.test(url)) {
        p.then(function (res) {
          res.clone().json().then(function (j) {
            if (res.ok && j && j.success) {
              var base = { form_name: "contact_enquiry", page_path: location.pathname };
              w.dataLayer.push(Object.assign({ event: "form_submit" }, base));
              w.dataLayer.push(Object.assign({ event: "generate_lead", currency: "GBP", value: 0 }, base));
            }
          }).catch(function () {});
        }).catch(function () {});
      }
      return p;
    };
    wrapped.__jdp = true; w.fetch = wrapped;
  }

  /* ---------- banner ---------- */
  var CSS = "#jdp-cc{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;display:flex;justify-content:center;pointer-events:none;font-family:var(--font-jakarta),system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif}" +
    "#jdp-cc .jdp-cc-box{pointer-events:auto;max-width:44rem;width:100%;background:#fff;color:#1c252c;border-radius:14px;box-shadow:0 10px 40px rgba(28,37,44,.22);border-top:4px solid #F06711;padding:20px 22px}" +
    "#jdp-cc h2{margin:0 0 6px;font-size:16px;line-height:1.35;font-weight:700;color:#1c252c}" +
    "#jdp-cc p{margin:0;font-size:14px;line-height:1.6;color:rgba(28,37,44,.8)}" +
    "#jdp-cc p a{color:#0098da;font-weight:600;text-decoration:underline}" +
    "#jdp-cc .jdp-cc-btns{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap}" +
    "#jdp-cc button{flex:1 1 0;min-width:140px;min-height:44px;border:0;border-radius:999px;background:#F06711;color:#1c252c;font:inherit;font-size:14px;font-weight:700;cursor:pointer;padding:10px 18px}" +
    "#jdp-cc button:hover{background:#d95a0c}#jdp-cc button:focus-visible{outline:3px solid #0098da;outline-offset:2px}" +
    "@media (max-width:480px){#jdp-cc{left:10px;right:10px;bottom:10px}#jdp-cc .jdp-cc-box{padding:16px}#jdp-cc button{min-width:0}}" +
    ".jdp-cc-link{background:none;border:0;padding:0;font:inherit;color:inherit;cursor:pointer}.jdp-cc-link:hover{color:#0098da}";
  function addCSS() { if (d.getElementById("jdp-cc-css")) return; var s = d.createElement("style"); s.id = "jdp-cc-css"; s.textContent = CSS; d.head.appendChild(s); }
  function hide() { var b = d.getElementById("jdp-cc"); if (b) b.remove(); }
  function show() {
    addCSS(); if (d.getElementById("jdp-cc")) return;
    var b = d.createElement("div"); b.id = "jdp-cc";
    b.innerHTML = '<div class="jdp-cc-box" role="dialog" aria-modal="false" aria-labelledby="jdp-cc-t" aria-describedby="jdp-cc-d">' +
      '<h2 id="jdp-cc-t">Cookies on this website</h2>' +
      '<p id="jdp-cc-d">We\u2019d like to use Google Analytics cookies to see how people use our website. ' +
      'They are only set if you click \u201cAccept all\u201d. You can change your choice at any time with \u201cCookie settings\u201d at the bottom of every page. ' +
      '<a href="/cookies/">Read our cookie policy</a>.</p>' +
      '<div class="jdp-cc-btns"><button type="button" data-cc="accepted">Accept all</button><button type="button" data-cc="rejected">Reject all</button></div></div>';
    b.addEventListener("click", function (e) {
      var c = e.target && e.target.getAttribute && e.target.getAttribute("data-cc"); if (!c) return;
      save(c); hide(); apply(c, true);
    });
    d.body.appendChild(b);
  }
  w.jdpCookieSettings = function () { show(); var f = d.querySelector("#jdp-cc button"); if (f) f.focus(); };

  function addFooterLink() {
    if (d.querySelector(".jdp-cc-link")) return;
    var cookieLinks = d.querySelectorAll('footer a[href="/cookies/"]');
    var a = cookieLinks[cookieLinks.length - 1]; if (!a || !a.parentNode) return;
    var btn = d.createElement("button"); btn.type = "button"; btn.className = "jdp-cc-link"; btn.textContent = "Cookie settings";
    btn.addEventListener("click", function () { w.jdpCookieSettings(); });
    a.parentNode.insertBefore(btn, a.nextSibling);
  }

  // Returning visitor: apply the saved choice straight away (before the page finishes loading).
  var saved = read();
  if (saved) apply(saved, false);

  // UI is added only after React has hydrated the page (adding nodes earlier makes React throw
  // hydration error #418 and re-render the page, which wipes the banner).
  function ui() { addCSS(); addFooterLink(); if (!read()) show(); }
  function hydrated() {
    var f = d.querySelector("footer"); if (!f) return false;
    for (var k in f) { if (k.indexOf("__reactFiber") === 0) return true; }
    return false;
  }
  var tries = 0;
  (function wait() {
    if (hydrated() || ++tries > 80) { setTimeout(ui, 150); return; }   // up to ~8 s, then show anyway
    setTimeout(wait, 100);
  })();
})();
