/* ========== SERVICE WORKER - GESTION CACHE OFFLINE ET PWA ==========
   📌 RÔLE: Permettre l'app de fonctionner HORS LIGNE + Installation PWA
   💡 UTILITÉ: 
      - Cache les fichiers au 1er chargement
      - Synchronisation offline-first
      - Gestion des mises à jour
      - Support installation desktop + mobile
   ✅ VERSION: V27 - Compatible téléphone + ordinateur
   📱 APPLICATION: quiz-audio-seconde (صوت الحق2)
========== */

/**
 * 📌 NOM DU CACHE - CACHE NAME
 * 💡 À MODIFIER: Augmentez le numéro (v1→v2, etc) pour forcer mise à jour
 * ⚠️ IMPORTANT: Tous les anciens caches seront supprimés automatiquement
 */
const CACHE_NAME = 'quran-quiz-pwa-v27';

/**
 * 📌 LISTE DES FICHIERS À METTRE EN CACHE - FILES TO CACHE
 * 💡 NOTE: Les icônes et screenshots sont inclus pour installation desktop
 *          Les librairies externes (CDN) sont en network-first
 */
const OFFLINE_URLS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json',
    '/sw.js',
    '/images/icon-192.png',
    '/images/icon-512.png',
    '/images/screenshot-1.png',
    '/images/screenshot-2.png'
];

/* ========== ÉVÉNEMENT INSTALL - INSTALLATION EVENT ==========
   Déclenché lors de l'installation du Service Worker
   - Crée le cache
   - Pré-cache les fichiers essentiels
   - Active immédiatement le Worker
========== */
self.addEventListener('install', event => {
    console.log('✅ Service Worker en cours d\'installation (V27)');
    console.log('📦 Version du cache:', CACHE_NAME);
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Cache créé avec succès:', CACHE_NAME);
                
                /* 🎯 Cache les fichiers essentiels + icônes (desktop) */
                return cache.addAll(OFFLINE_URLS).catch(err => {
                    console.warn('⚠️ Certains fichiers non trouvés lors du cache initial');
                    console.warn('   Raison:', err.message);
                    console.log('✅ Continuant quand même - mode dégradé autorisé');
                    return Promise.resolve();
                });
            })
            .then(() => self.skipWaiting())
    );
});

/* ========== ÉVÉNEMENT ACTIVATE - CLEANUP AND CLAIMS ==========
   Déclenché lors de l'activation du Service Worker
   - Supprime les anciens caches (pour mise à jour propre)
   - Prend contrôle des clients existants
   - Ferme ancienne version
========== */
self.addEventListener('activate', event => {
    console.log('🔄 Service Worker en cours d\'activation (V27)');
    console.log('🧹 Nettoyage des anciens caches...');
    
    event.waitUntil(
        /* 📌 Récupérer tous les noms de cache existants */
        caches.keys().then(cacheNames => {
            console.log('📋 Caches existants:', cacheNames);
            
            return Promise.all(
                cacheNames.map(cacheName => {
                    /* ❌ Supprimer les anciens caches (pas V27) */
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️  Suppression ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                    
                    /* ✅ Garder le cache V27 actuel */
                    console.log('✅ Cache actuel conservé:', cacheName);
                })
            );
        })
        .then(() => self.clients.claim().then(() => {
            console.log('🎯 Service Worker prend contrôle des clients');
        }))
    );
});

/* ========== ÉVÉNEMENT FETCH - REQUEST INTERCEPTION ==========
   Intercepte toutes les requêtes réseau
   - Cache-first: pour les fichiers statiques locaux (performances)
   - Network-first: pour les requêtes dynamiques (données fraîches)
   - Offline-fallback: répond même hors ligne
========== */
self.addEventListener('fetch', event => {
    const req = event.request;
    
    /* 📌 STRATÉGIE: Cache-First (Static) + Network-First (Dynamic) + Offline Fallback */
    event.respondWith(
        /* Essayer le cache d'abord (pour performances) */
        caches.match(req)
            .then(cached => {
                if (cached) {
                    console.log('✅ Réponse trouvée en cache:', req.url);
                    return cached;
                }
                
                /* Cache miss - essayer le réseau */
                return fetch(req)
                    .then(fresh => {
                        /* ✅ Si réponse réussie: sauvegarder en cache */
                        if (req.method === 'GET') {
                            const clone = fresh.clone();
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(req, clone);
                                console.log('💾 Mis en cache:', req.url);
                            });
                        }
                        return fresh;
                    })
                    .catch(() => {
                        /* ❌ Réseau échoué ET pas en cache */
                        console.error('❌ Non en cache et réseau indisponible:', req.url);
                        
                        /* Retourner la page index comme fallback */
                        return caches.match('index.html').then(response => {
                            return response || new Response(
                                'Désolé - Fichier non disponible hors ligne',
                                {
                                    status: 503,
                                    statusText: 'Service Unavailable',
                                    headers: { 'Content-Type': 'text/plain' }
                                }
                            );
                        });
                    });
            })
    );
});

/* ========== ÉVÉNEMENT MESSAGE - COMMUNICATION CLIENT-WORKER ==========
   Permet au JavaScript de communiquer avec le Service Worker
   (Optionnel: pour des mises à jour manuelles)
========== */
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('📢 Message reçu du client: SKIP_WAITING');
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_CACHE_INFO') {
        console.log('📊 Info cache demandée par le client');
        event.ports[0].postMessage({
            cacheName: CACHE_NAME,
            version: 'V27',
            app: 'quiz-audio-seconde'
        });
    }
});