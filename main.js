(function () {
  "use strict";

  var data = window.__BRAND__ || { teams: [], faqs: [] };
  var STORAGE_KEY = "fap:prediction:v1";
  var VOTER_KEY = "fap:voter:v1";
  var teamById = {};

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var escHTML = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }

  /* ---------- storage helpers ---------- */
  function loadSavedOrder() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var arr = JSON.parse(raw);
      var ids = data.teams.map(function (t) { return t.id; });
      if (!Array.isArray(arr) || arr.length !== ids.length) return null;
      var ok = ids.every(function (id) { return arr.indexOf(id) !== -1; });
      return ok ? arr : null;
    } catch (_) { return null; }
  }

  function getVoterId() {
    try {
      var id = localStorage.getItem(VOTER_KEY);
      if (!id) {
        id = window.crypto && crypto.randomUUID ? crypto.randomUUID() : ("v-" + Math.random().toString(36).slice(2) + Date.now().toString(36));
        localStorage.setItem(VOTER_KEY, id);
      }
      return id;
    } catch (_) { return "v-anon"; }
  }

  /* ---------- board mount ---------- */
  function renderItemHTML(team, idx) {
    return (
      '<li class="rank-item" data-team-id="' + team.id + '">' +
        '<span class="drag-handle" aria-hidden="true">' +
          '<svg class="icon" viewBox="0 0 24 24"><path fill="currentColor" d="M9 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm10-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>' +
        "</span>" +
        '<span class="rank-pos">' + (idx + 1) + "</span>" +
        '<span class="rank-badge"><img src="assets/img/teams/' + (team.badge || team.id + ".svg") + '" alt="" loading="lazy"></span>' +
        '<span class="rank-name">' + escHTML(team.name) + "</span>" +
        '<span class="rank-controls">' +
          '<button type="button" class="rank-btn rank-up" aria-label="Subir ' + escHTML(team.name) + '">' +
            '<svg class="icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 7l6 6-1.4 1.4L12 9.8l-4.6 4.6L6 13z"/></svg>' +
          "</button>" +
          '<button type="button" class="rank-btn rank-down" aria-label="Bajar ' + escHTML(team.name) + '">' +
            '<svg class="icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17l-6-6 1.4-1.4L12 14.2l4.6-4.6L18 11z"/></svg>' +
          "</button>" +
        "</span>" +
      "</li>"
    );
  }

  function mountBoard() {
    var board = $("#ranking-board");
    if (!board || board.children.length > 0 || !data.teams || !data.teams.length) return;
    data.teams.forEach(function (t) { teamById[t.id] = t; });
    var order = loadSavedOrder() || data.teams.map(function (t) { return t.id; });
    board.innerHTML = order.map(function (id, i) { return renderItemHTML(teamById[id], i); }).join("");
  }

  function renumber() {
    var board = $("#ranking-board");
    if (!board) return;
    var items = $$(".rank-item", board);
    items.forEach(function (li, i) {
      var pos = $(".rank-pos", li);
      if (pos) pos.textContent = String(i + 1);
      var up = $(".rank-up", li);
      var down = $(".rank-down", li);
      if (up) up.disabled = i === 0;
      if (down) down.disabled = i === items.length - 1;
    });
  }

  function persist() {
    var board = $("#ranking-board");
    if (!board) return;
    var order = $$(".rank-item", board).map(function (li) { return li.dataset.teamId; });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(order)); } catch (_) {}
  }

  function getCurrentOrder() {
    var board = $("#ranking-board");
    return board ? $$(".rank-item", board).map(function (li) { return li.dataset.teamId; }) : [];
  }

  /* ---------- drag & drop (pointer events: mouse + touch + pen) ---------- */
  function initDragReorder() {
    var board = $("#ranking-board");
    if (!board || !window.PointerEvent) return;

    var dragEl = null, startY = 0, pointerId = null;

    function onPointerMove(e) {
      if (!dragEl) return;
      e.preventDefault();
      var deltaY = e.clientY - startY;
      dragEl.style.transform = "translateY(" + deltaY + "px)";

      var rect = dragEl.getBoundingClientRect();
      var centerY = rect.top + rect.height / 2;

      var next = dragEl.nextElementSibling;
      if (next) {
        var nr = next.getBoundingClientRect();
        if (centerY > nr.top + nr.height / 2) {
          board.insertBefore(next, dragEl);
          dragEl.style.transform = "translateY(0)";
          startY = e.clientY;
          renumber();
          return;
        }
      }
      var prev = dragEl.previousElementSibling;
      if (prev) {
        var pr = prev.getBoundingClientRect();
        if (centerY < pr.top + pr.height / 2) {
          board.insertBefore(dragEl, prev);
          dragEl.style.transform = "translateY(0)";
          startY = e.clientY;
          renumber();
        }
      }
    }

    function endDrag() {
      if (!dragEl) return;
      try { dragEl.releasePointerCapture(pointerId); } catch (_) {}
      dragEl.classList.remove("is-dragging");
      dragEl.style.transition = "";
      dragEl.style.transform = "";
      dragEl = null;
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", endDrag);
      document.removeEventListener("pointercancel", endDrag);
      renumber();
      persist();
    }

    board.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".rank-controls")) return;
      var item = e.target.closest(".rank-item");
      if (!item) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragEl = item;
      pointerId = e.pointerId;
      startY = e.clientY;
      try { item.setPointerCapture(pointerId); } catch (_) {}
      item.classList.add("is-dragging");
      item.style.transition = "none";
      document.addEventListener("pointermove", onPointerMove, { passive: false });
      document.addEventListener("pointerup", endDrag);
      document.addEventListener("pointercancel", endDrag);
    });
  }

  /* ---------- up/down buttons + reset ---------- */
  function moveItem(li, dir) {
    var board = $("#ranking-board");
    if (!board || !li) return;
    if (dir < 0) {
      var prev = li.previousElementSibling;
      if (prev) board.insertBefore(li, prev);
    } else {
      var next = li.nextElementSibling;
      if (next) board.insertBefore(next, li);
    }
    renumber();
    persist();
  }

  function initControls() {
    var board = $("#ranking-board");
    if (!board) return;
    board.addEventListener("click", function (e) {
      var upBtn = e.target.closest(".rank-up");
      var downBtn = e.target.closest(".rank-down");
      if (upBtn) moveItem(upBtn.closest(".rank-item"), -1);
      else if (downBtn) moveItem(downBtn.closest(".rank-item"), 1);
    });

    var resetBtn = $("#btn-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
        board.innerHTML = "";
        mountBoard();
        renumber();
        var status = $("#submit-status");
        if (status) { status.textContent = ""; status.removeAttribute("data-tone"); }
      });
    }
  }

  /* ---------- download as image ---------- */
  function buildExportCard(order) {
    var card = document.createElement("div");
    card.className = "export-card";
    var rows = order.map(function (id, i) {
      var t = teamById[id];
      if (!t) return "";
      return (
        '<li class="export-row">' +
          '<span class="export-pos">' + (i + 1) + "</span>" +
          '<img class="export-badge" src="assets/img/teams/' + (t.badge || t.id + ".svg") + '" alt="">' +
          '<span class="export-name">' + escHTML(t.name) + "</span>" +
        "</li>"
      );
    }).join("");
    var today = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
    card.innerHTML =
      '<div class="export-head"><span class="export-logo">FAP</span><span class="export-tag">Futbol Aruba Predición</span></div>' +
      '<h2 class="export-title">Mi predicción — Liga de Aruba</h2>' +
      '<ol class="export-list">' + rows + "</ol>" +
      '<div class="export-foot">fap-aruba.com · ' + today + "</div>";
    return card;
  }

  function handleDownload() {
    var status = $("#submit-status");
    var order = getCurrentOrder();
    if (order.length !== 10) return;

    if (!window.html2canvas) {
      if (status) { status.textContent = "No se pudo cargar el generador de imágenes. Prueba a recargar la página."; status.dataset.tone = "error"; }
      return;
    }

    if (status) { status.textContent = "Generando tu imagen…"; status.removeAttribute("data-tone"); }

    var card = buildExportCard(order);
    document.body.appendChild(card);

    window.html2canvas(card, { backgroundColor: "#ffffff", scale: 2, useCORS: true }).then(function (canvas) {
      canvas.toBlob(function (blob) {
        if (!blob) {
          if (status) { status.textContent = "No se pudo generar la imagen."; status.dataset.tone = "error"; }
          return;
        }
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "fap-prediccion-aruba.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        if (status) { status.textContent = "✓ Descargada — ¡compártela!"; status.dataset.tone = "ok"; }
        document.dispatchEvent(new CustomEvent("fap:downloaded"));
      }, "image/png");
    }).catch(function (err) {
      console.warn("[handleDownload]", err);
      if (status) { status.textContent = "No se pudo generar la imagen en este navegador."; status.dataset.tone = "error"; }
    }).finally(function () {
      card.remove();
    });
  }

  function initDownload() {
    var btn = $("#btn-download");
    if (btn) btn.addEventListener("click", handleDownload);
  }

  /* ---------- submit to La General ---------- */
  function submitToGeneral(order) {
    var status = $("#submit-status");
    if (status) { status.textContent = "Enviando tu predicción…"; status.removeAttribute("data-tone"); }

    fetch("api/submit.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voter: getVoterId(), order: order })
    })
      .then(function (res) { if (!res.ok) throw new Error("http " + res.status); return res.json(); })
      .then(function (json) {
        if (!json || !json.ok) throw new Error((json && json.error) || "respuesta inválida");
        if (status) { status.textContent = "✓ Enviada — gracias por tu predicción. Actualizando La General…"; status.dataset.tone = "ok"; }
        loadGeneral();
      })
      .catch(function (err) {
        console.warn("[submitToGeneral]", err);
        if (status) {
          status.textContent = "No se pudo conectar con el servidor ahora mismo. Tu predicción se ha guardado en este dispositivo — puedes reintentar enviarla más tarde.";
          status.dataset.tone = "warn";
        }
      });
  }

  function initSubmit() {
    var btn = $("#btn-submit");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var order = getCurrentOrder();
      if (order.length === 10) submitToGeneral(order);
    });
  }

  /* ---------- La General table ---------- */
  function renderGeneral(payload) {
    var tbody = $("#general-table-body");
    var countEl = $("#votos-count");
    var fallback = $("#general-fallback");
    if (!tbody) return;

    if (countEl) countEl.textContent = String(payload.total || 0);

    if (!payload.teams || !payload.teams.length) {
      tbody.innerHTML = '<tr><td colspan="3" class="general-loading">Todavía no hay predicciones enviadas. ¡Sé de los primeros!</td></tr>';
      if (fallback) fallback.hidden = true;
      return;
    }

    if (fallback) fallback.hidden = true;
    tbody.innerHTML = payload.teams.map(function (row, i) {
      var t = teamById[row.id] || { id: row.id, name: row.id, badge: row.id + ".svg" };
      return (
        "<tr><td>" + (i + 1) + "</td>" +
        '<td><span class="g-team"><img class="g-badge" src="assets/img/teams/' + (t.badge || t.id + ".svg") + '" alt="">' + escHTML(t.name) + "</span></td>" +
        "<td>" + Number(row.avg).toFixed(2) + "</td></tr>"
      );
    }).join("");
  }

  function loadGeneral() {
    var tbody = $("#general-table-body");
    var fallback = $("#general-fallback");
    var countEl = $("#votos-count");
    if (!tbody) return;

    fetch("api/ranking.php", { headers: { Accept: "application/json" } })
      .then(function (res) { if (!res.ok) throw new Error("http " + res.status); return res.json(); })
      .then(function (json) {
        if (!json || !Array.isArray(json.teams)) throw new Error("payload inválido");
        renderGeneral(json);
      })
      .catch(function (err) {
        console.warn("[loadGeneral]", err);
        tbody.innerHTML = "";
        if (fallback) fallback.hidden = false;
        if (countEl) countEl.textContent = "0";
      });
  }

  /* ---------- ad placeholders: corner toast + download dialog ---------- */
  function initAdCorner() {
    var el = $("#ad-corner");
    if (!el) return;
    try { if (sessionStorage.getItem("fap:ad-corner-dismissed")) return; } catch (_) {}

    setTimeout(function () {
      el.hidden = false;
      requestAnimationFrame(function () { el.classList.add("is-visible"); });
    }, 4000);

    var closeBtn = $("#ad-corner-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        el.classList.remove("is-visible");
        try { sessionStorage.setItem("fap:ad-corner-dismissed", "1"); } catch (_) {}
        setTimeout(function () { el.hidden = true; }, 300);
      });
    }
  }

  function initAdDialog() {
    var dialog = $("#ad-dialog");
    if (!dialog || typeof dialog.showModal !== "function") return;

    document.addEventListener("fap:downloaded", function () {
      setTimeout(function () { try { dialog.showModal(); } catch (_) {} }, 350);
    });

    var closeBtn = $("#ad-dialog-close");
    var continueBtn = $("#ad-dialog-continue");
    if (closeBtn) closeBtn.addEventListener("click", function () { dialog.close(); });
    if (continueBtn) continueBtn.addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
  }

  /* ---------- boot ---------- */
  function boot() {
    safe(mountBoard, "mountBoard");
    safe(renumber, "renumber");
    safe(initDragReorder, "initDragReorder");
    safe(initControls, "initControls");
    safe(initDownload, "initDownload");
    safe(initSubmit, "initSubmit");
    safe(loadGeneral, "loadGeneral");
    safe(initAdCorner, "initAdCorner");
    safe(initAdDialog, "initAdDialog");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
