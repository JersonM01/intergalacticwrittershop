function paintStars(container, count){
  if(!container) return;
  var frag = document.createDocumentFragment();
  for(var i=0;i<count;i++){
    var s = document.createElement('div');
    var size = Math.random() < 0.85 ? 1 : 2;
    s.className = 'star twinkle';
    s.style.width = size+'px';
    s.style.height = size+'px';
    s.style.top = (Math.random()*100)+'%';
    s.style.left = (Math.random()*100)+'%';
    s.style.animationDelay = (Math.random()*4)+'s';
    s.style.opacity = (0.2+Math.random()*0.6).toFixed(2);
    frag.appendChild(s);
  }
  container.appendChild(frag);
}

document.addEventListener('DOMContentLoaded', function(){
  document.querySelectorAll('[data-stars]').forEach(function(el){
    paintStars(el, parseInt(el.getAttribute('data-stars'), 10) || 60);
  });

  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  var cta = document.querySelector('.nav-cta');
  if(toggle){
    toggle.addEventListener('click', function(){
      links.classList.toggle('open');
      cta.classList.toggle('open');
    });
  }

  document.querySelectorAll('form[data-stub]').forEach(function(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var success = form.querySelector('.form-success');
      if(success){
        success.style.display = 'block';
        form.querySelectorAll('input, textarea, select').forEach(function(f){ f.disabled = true; });
      }
    });
  });
});
/* =====================================================================
   PAYWALL v2 - Intergalactic Writer Shop
   Remplace entièrement le contenu de paywall.js (v1) par celui-ci.
   À coller dans assets/js/main.js (à la fin), à la place de la v1.
   ===================================================================== */

(function () {
  // ====== À CONFIGURER ======
  // Produit Gumroad "accès complet au site" (celui qui débloque
  // Collection Fossile + Musée Spatial + tout le contenu premium)
  var SITE_ACCESS_PERMALINK = "rblzr";
  var SITE_ACCESS_PAYMENT_URL = "https://intergalacticwriter.gumroad.com/l/rblzr";

  // Données de chaque livre : synthèse + Heyzine restent PRIVÉES
  // (jamais écrites dans le HTML). Le lien "buyUrl" reste public.
var BOOKS = {
     "creuset-appel": {
       title: "Le Creuset de l'Appel",
       synthetic: "https://drive.google.com/uc?export=download&id=1V4ls5VRkdzXbpPekp_R3kmv2Nxco5y90",
       heyzine: "https://heyzine.com/flip-book/88783ea284.html",
       buyUrl: "https://intergalacticwriter.gumroad.com/l/mchczo",
     },
     // Ajoutez un bloc par livre, avec un id unique (ex: "livre-002")
   };
  // ============================

  var STORAGE_KEY = "igws_access_key";
  var siteUnlocked = false; // vrai seulement après vérification réussie de CETTE session

  // ---------- Vérification auprès de Gumroad ----------
  function verifyLicenseKey(key, onResult) {
    fetch("https://api.gumroad.com/v2/licenses/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:
        "product_id=" +
        encodeURIComponent(SITE_ACCESS_PERMALINK) +
        "&license_key=" +
        encodeURIComponent(key),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) { onResult(data && data.success === true); })
      .catch(function () { onResult(false); });
  }

  function markUnlocked() {
    siteUnlocked = true;
    document.body.classList.add("site-unlocked");
    document.querySelectorAll(".premium-locked").forEach(function (el) {
      el.classList.add("unlocked");
    });
  }

  // Au chargement : si une clé est mémorisée, on la REVALIDE réellement
  // (au lieu de juste faire confiance à sa présence)
  function checkStoredAccessOnLoad() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    verifyLicenseKey(stored, function (ok) {
      if (ok) {
        markUnlocked();
      } else {
        localStorage.removeItem(STORAGE_KEY); // clé invalide/périmée : on nettoie
      }
    });
  }

  // ---------- Overlay + Modal (identiques à la v1) ----------
  function buildOverlay() {
    var overlay = document.createElement("div");
    overlay.className = "premium-overlay";
    overlay.innerHTML =
      '<div class="premium-icon">🌌</div>' +
      "<h4>Contenu premium</h4>" +
      "<p>Vous explorez déjà une partie de la galaxie. " +
      "Débloquez l'accès complet pour continuer l'aventure.</p>" +
      '<div class="premium-cta">' +
      '<button type="button" class="btn-unlock" data-action="open-unlock">Débloquer l\'accès</button>' +
      '<button type="button" class="btn-have-key" data-action="open-unlock">J\'ai déjà un code</button>' +
      "</div>";
    return overlay;
  }

  function buildModal() {
    var backdrop = document.createElement("div");
    backdrop.className = "unlock-modal-backdrop";
    backdrop.id = "unlock-modal-backdrop";
    backdrop.innerHTML =
      '<div class="unlock-modal">' +
      '<button type="button" class="close-modal" data-action="close-unlock">&times;</button>' +
      "<h3>Débloquer la galaxie</h3>" +
      '<p class="subtitle">Un petit accès, pour tout explorer : collections, ' +
      "dossiers fossiles, musée spatial et téléchargements.</p>" +
      '<div class="modal-section">' +
      '<div class="modal-section-label">Nouveau ici</div>' +
      '<a class="btn-unlock" href="' + SITE_ACCESS_PAYMENT_URL + '" target="_blank" rel="noopener">Obtenir l\'accès</a>' +
      "</div>" +
      '<div class="divider">— déjà payé ? —</div>' +
      '<div class="modal-section">' +
      '<div class="modal-section-label">J\'ai reçu ma clé par email</div>' +
      '<div class="key-input-row">' +
      '<input type="text" id="license-key-input" placeholder="Collez votre clé ici" />' +
      '<button type="button" class="btn-unlock" data-action="submit-key">Valider</button>' +
      "</div>" +
      '<div class="key-status" id="key-status"></div>' +
      "</div>" +
      "</div>";
    return backdrop;
  }

  function openModal() { document.getElementById("unlock-modal-backdrop").classList.add("open"); }
  function closeModal() { document.getElementById("unlock-modal-backdrop").classList.remove("open"); }

  function setStatus(message, type) {
    var el = document.getElementById("key-status");
    el.textContent = message;
    el.className = "key-status " + (type || "");
  }

  function handleSubmitKey() {
    var input = document.getElementById("license-key-input");
    var key = input.value.trim();
    if (!key) { setStatus("Merci d'entrer votre clé.", "error"); return; }
    setStatus("Vérification en cours…", "loading");
    verifyLicenseKey(key, function (ok) {
      if (ok) {
        localStorage.setItem(STORAGE_KEY, key);
        setStatus("Accès débloqué, bienvenue à bord ! 🚀", "success");
        markUnlocked();
        setTimeout(closeModal, 1200);
      } else {
        setStatus("Clé invalide. Vérifiez et réessayez.", "error");
      }
    });
  }

  // ---------- Protection par livre (synthèse + Heyzine) ----------
  // Ces boutons n'ont AUCUNE vraie URL dans le HTML. La destination
  // n'est résolue qu'au moment du clic, et seulement si l'accès du
  // site est déjà vérifié pour cette session.
  function handleBookAction(action, bookId) {
    var book = BOOKS[bookId];
    if (!book) return;

    if (!siteUnlocked) {
      openModal();
      return;
    }
    if (action === "download-synthetic") {
      window.open(book.synthetic, "_blank");
    } else if (action === "view-heyzine") {
      window.open(book.heyzine, "_blank");
    }
  }

  // Injecte dynamiquement le lien "Acheter" (celui-là reste public,
  // pas besoin d'accès pour le voir — c'est votre argument de vente)
  function renderPublicBuyLinks() {
    document.querySelectorAll("[data-buy-book]").forEach(function (el) {
      var bookId = el.getAttribute("data-buy-book");
      var book = BOOKS[bookId];
      if (book && book.buyUrl) {
        el.setAttribute("href", book.buyUrl);
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Overlays sur les blocs premium (collections entières)
    document.querySelectorAll(".premium-locked").forEach(function (block) {
      block.appendChild(buildOverlay());
    });
    document.body.appendChild(buildModal());
    renderPublicBuyLinks();
    checkStoredAccessOnLoad();

    document.body.addEventListener("click", function (e) {
      var action = e.target.getAttribute("data-action");
      if (action === "open-unlock") openModal();
      if (action === "close-unlock") closeModal();
      if (action === "submit-key") handleSubmitKey();

      var bookAction = e.target.getAttribute("data-book-action");
      if (bookAction) {
        var bookId = e.target.getAttribute("data-book-id");
        handleBookAction(bookAction, bookId);
      }
    });

    document.getElementById("unlock-modal-backdrop").addEventListener("click", function (e) {
      if (e.target.id === "unlock-modal-backdrop") closeModal();
    });
  });
})();
