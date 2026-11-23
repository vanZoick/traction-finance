/* Service worker do Traction Finance.
   Objetivo: o app abrir mesmo sem internet e nunca servir uma versão velha
   quando há rede. Por isso a página vem da rede primeiro, com o que está
   guardado como rede de segurança. As fontes do Google, que não mudam,
   vêm do cache primeiro. O Firebase nunca passa por aqui. */
var CACHE = 'traction-finance-v2';
var ESSENCIAIS = ['./', './manifest.webmanifest', './icone-192.png',
                  './icone-512.png', './icone-180.png',
                  './icone-maskable-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(ESSENCIAIS); })
      .catch(function () { })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.map(function (k) {
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

function guarda(req, resp) {
  if (!resp || resp.status !== 200) return resp;
  var copia = resp.clone();
  caches.open(CACHE).then(function (c) { c.put(req, copia); }).catch(function () { });
  return resp;
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  var url;
  try { url = new URL(req.url); } catch (err) { return; }

  /* Autenticação e banco têm de falar com o servidor sempre. */
  if (/googleapis\.com|firebaseio|firebaseapp|gstatic\.com\/firebasejs/.test(url.host + url.pathname)) return;

  /* Fontes: não mudam, então o cache responde na hora. */
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.host)) {
    e.respondWith(
      caches.match(req).then(function (m) {
        return m || fetch(req).then(function (r) { return guarda(req, r); });
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  /* O próprio app: rede primeiro, cache como rede de segurança. */
  e.respondWith(
    fetch(req)
      .then(function (r) { return guarda(req, r); })
      .catch(function () {
        return caches.match(req).then(function (m) {
          return m || caches.match('./');
        });
      })
  );
});
