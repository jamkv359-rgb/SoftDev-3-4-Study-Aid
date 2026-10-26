(function () {
  "use strict";

  // ---------- Theme toggle ----------
  var root = document.documentElement;
  var themeBtn = document.getElementById("theme-toggle");

  function getStoredTheme() {
    try { return localStorage.getItem("sd-notes-theme"); } catch (e) { return null; }
  }
  function storeTheme(v) {
    try { localStorage.setItem("sd-notes-theme", v); } catch (e) { /* ignore */ }
  }
  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function applyTheme(theme) {
    if (theme === "dark" || theme === "light") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
  }
  var stored = getStoredTheme();
  applyTheme(stored);
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") || (systemPrefersDark() ? "dark" : "light");
      var next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      storeTheme(next);
    });
  }

  // ---------- Expand / collapse all ----------
  var expandBtn = document.getElementById("expand-all");
  var collapseBtn = document.getElementById("collapse-all");
  function allSections() {
    return document.querySelectorAll("main.content details.section");
  }
  if (expandBtn) {
    expandBtn.addEventListener("click", function () {
      allSections().forEach(function (d) { d.open = true; });
    });
  }
  if (collapseBtn) {
    collapseBtn.addEventListener("click", function () {
      allSections().forEach(function (d) { d.open = false; });
    });
  }

  // ---------- Filter / search within page ----------
  var filterInput = document.getElementById("filter-input");
  var filterStatus = document.getElementById("filter-status");
  var topSections = document.querySelectorAll("main.content > details.section");

  function clearFilter() {
    topSections.forEach(function (d) {
      d.classList.remove("filtered-hide");
    });
    if (filterStatus) filterStatus.hidden = true;
  }

  function runFilter(query) {
    var q = query.trim().toLowerCase();
    if (!q) { clearFilter(); return; }
    var shown = 0;
    topSections.forEach(function (d) {
      var text = d.textContent.toLowerCase();
      var match = text.indexOf(q) !== -1;
      d.classList.toggle("filtered-hide", !match);
      if (match) {
        shown++;
        d.open = true;
        d.querySelectorAll("details").forEach(function (nested) {
          if (nested.textContent.toLowerCase().indexOf(q) !== -1) nested.open = true;
        });
      }
    });
    if (filterStatus) {
      filterStatus.hidden = false;
      filterStatus.textContent = shown === 0
        ? "No sections match “" + query + "”."
        : "Showing " + shown + " of " + topSections.length + " top-level sections.";
    }
  }

  if (filterInput) {
    filterInput.addEventListener("input", function () { runFilter(filterInput.value); });
  }

  // ---------- Deep-linking: open ancestor <details> for the target hash ----------
  function openToTarget(hash) {
    if (!hash || hash.length < 2) return;
    var id = decodeURIComponent(hash.slice(1));
    var el = document.getElementById(id);
    if (!el) return;
    var node = el;
    while (node) {
      if (node.tagName === "DETAILS") node.open = true;
      node = node.parentElement;
    }
    requestAnimationFrame(function () {
      el.scrollIntoView({ block: "start" });
    });
  }
  window.addEventListener("hashchange", function () { openToTarget(location.hash); });
  if (location.hash) openToTarget(location.hash);

  // ---------- Sidebar TOC: highlight current section on scroll ----------
  var tocLinks = document.querySelectorAll(".page-toc a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var idToLink = {};
    tocLinks.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      idToLink[id] = a;
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = idToLink[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          tocLinks.forEach(function (l) { l.classList.remove("current"); });
          link.classList.add("current");
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(idToLink).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }
})();
