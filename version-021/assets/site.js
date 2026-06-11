(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (button && panel) {
      button.addEventListener("click", function () {
        panel.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var index = 0;
      var timer = null;
      var show = function (next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      };
      var start = function () {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          window.clearInterval(timer);
          show(i);
          start();
        });
      });
      show(0);
      start();
    }

    var catalog = document.querySelector("[data-catalog]");
    if (catalog) {
      var input = document.querySelector("[data-filter-input]");
      var sort = document.querySelector("[data-sort-select]");
      var cards = Array.prototype.slice.call(catalog.querySelectorAll(".movie-card"));
      var empty = document.querySelector("[data-empty]");
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q") || "";
      if (input && q) {
        input.value = q;
      }
      var apply = function () {
        var term = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var ok = !term || text.indexOf(term) !== -1;
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (sort) {
          var sorted = cards.slice().sort(function (a, b) {
            var ay = parseInt(a.getAttribute("data-year") || "0", 10);
            var by = parseInt(b.getAttribute("data-year") || "0", 10);
            var at = a.getAttribute("data-title") || "";
            var bt = b.getAttribute("data-title") || "";
            if (sort.value === "year-asc") {
              return ay - by || at.localeCompare(bt, "zh-Hans-CN");
            }
            if (sort.value === "title") {
              return at.localeCompare(bt, "zh-Hans-CN");
            }
            return by - ay || at.localeCompare(bt, "zh-Hans-CN");
          });
          sorted.forEach(function (card) {
            catalog.appendChild(card);
          });
        }
        if (empty) {
          empty.style.display = visible ? "none" : "block";
        }
      };
      if (input) {
        input.addEventListener("input", apply);
      }
      if (sort) {
        sort.addEventListener("change", apply);
      }
      apply();
    }
  });
})();
