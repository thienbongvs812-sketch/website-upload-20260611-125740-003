(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var navArea = document.querySelector(".nav-area");

    if (menuButton && navArea) {
        menuButton.addEventListener("click", function () {
            navArea.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var slideIndex = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        slideIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, i) {
            slide.classList.toggle("is-active", i === slideIndex);
        });

        dots.forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === slideIndex);
        });
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
            showSlide(i);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(slideIndex + 1);
        }, 5200);
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var yearSelect = document.querySelector("[data-year-filter]");
    var typeSelect = document.querySelector("[data-type-filter]");
    var items = Array.prototype.slice.call(document.querySelectorAll(".search-item"));
    var empty = document.querySelector(".empty-state");

    function applyFilter() {
        if (!items.length) {
            return;
        }

        var text = filterInput ? filterInput.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        var visible = 0;

        items.forEach(function (item) {
            var haystack = [
                item.getAttribute("data-title") || "",
                item.getAttribute("data-category") || "",
                item.getAttribute("data-genre") || ""
            ].join(" ").toLowerCase();
            var itemYear = item.getAttribute("data-year") || "";
            var itemType = item.getAttribute("data-category") || "";
            var ok = true;

            if (text && haystack.indexOf(text) === -1) {
                ok = false;
            }

            if (year && itemYear !== year) {
                ok = false;
            }

            if (type && itemType !== type) {
                ok = false;
            }

            item.classList.toggle("is-filter-hidden", !ok);

            if (ok) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    }

    [filterInput, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
            control.addEventListener("input", applyFilter);
            control.addEventListener("change", applyFilter);
        }
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (filterInput && query) {
        filterInput.value = query;
        applyFilter();
    }
})();
