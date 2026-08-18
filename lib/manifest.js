(function () {
  "use strict";

  window.__BRAND__ = {
    name: "FAP",
    fullName: "Futbol Aruba Predición",
    tagline: "Predice cómo terminará la Primera División de Aruba",
    siteUrl: "https://www.fap-aruba.com/",

    teams: [
      { id: "britannia",    name: "Britannia",    initials: "BRI", color: "#1d4ed8", badge: "britannia.webp" },
      { id: "bubali",       name: "Bubali",       initials: "BUB", color: "#059669", badge: "bubali.webp" },
      { id: "caiquetio",    name: "Caiquetio",    initials: "CAI", color: "#b45309", badge: "caiquetio.webp" },
      { id: "caravel",      name: "Caravel",      initials: "CAR", color: "#7c3aed", badge: "caravel.webp" },
      { id: "dakota",       name: "Dakota",       initials: "DAK", color: "#dc2626", badge: "dakota.webp" },
      { id: "la-fama",      name: "La Fama",      initials: "FAM", color: "#0891b2", badge: "la-fama.webp" },
      { id: "nacional",     name: "Nacional",     initials: "NAC", color: "#ca8a04", badge: "nacional.webp" },
      { id: "rca",          name: "RCA",          initials: "RCA", color: "#be123c", badge: "rca.webp" },
      { id: "river-plate",  name: "River Plate",  initials: "RIV", color: "#0d9488", badge: "river-plate.webp" },
      { id: "sporting",     name: "Sporting",     initials: "SPO", color: "#4338ca", badge: "sporting.webp" }
    ],

    faqs: [
      {
        q: "¿Necesito registrarme para hacer mi predicción?",
        a: "No. FAP funciona sin cuentas ni registros: entras, ordenas los equipos y ya puedes descargar o enviar tu predicción."
      },
      {
        q: "¿Cómo se calcula la tabla “La General”?",
        a: "Es la media de la posición que le ha dado cada persona a cada equipo en todas las predicciones enviadas. Si mucha gente pone a un equipo primero, su media sube; si lo hunden al puesto 10, su media baja. La tabla se ordena de menor a mayor media."
      },
      {
        q: "¿Puedo cambiar mi predicción después de enviarla?",
        a: "Sí. Si vuelves a enviar tu predicción desde el mismo dispositivo, se sustituye la anterior en “La General” en lugar de sumarse como un voto nuevo."
      },
      {
        q: "¿Cómo descargo mi predicción?",
        a: "Pulsa “Descargar mi predicción” y se genera automáticamente una imagen PNG con tu clasificación, lista para compartir en redes sociales o grupos."
      },
      {
        q: "¿Qué equipos participan en la Primera División de Aruba?",
        a: "En FAP puedes predecir a Britannia, Bubali, Caiquetio, Caravel, Dakota, La Fama, Nacional, RCA, River Plate y Sporting."
      },
      {
        q: "¿Es gratis usar FAP?",
        a: "Sí, la herramienta es completamente gratuita y no requiere descargar ninguna app."
      },
      {
        q: "¿Funciona bien desde el móvil?",
        a: "Sí. El tablero de predicción está pensado para arrastrar los equipos también con el dedo, sin necesidad de ratón."
      }
    ]
  };
})();
