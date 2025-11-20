// ========== UTILIDADES BÁSICAS ==========

function normalizarTexto(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ---- TOASTS ----
let toastContainer = null;

function ensureToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }
}

function showToast(message, type = "info") {
  ensureToastContainer();

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;

  const iconSpan = document.createElement("span");
  iconSpan.className = "toast__icon";
  iconSpan.textContent =
    type === "success" ? "✔" : type === "error" ? "⚠" : "ℹ";

  const textSpan = document.createElement("span");
  textSpan.className = "toast__text";
  textSpan.textContent = message;

  const closeBtn = document.createElement("button");
  closeBtn.className = "toast__close";
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", () => {
    toast.remove();
  });

  toast.appendChild(iconSpan);
  toast.appendChild(textSpan);
  toast.appendChild(closeBtn);

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ========== LOADER INICIAL (3 segundos) ==========

function createLoader() {
  // reutiliza loader si ya existe en el HTML
  let loader = document.querySelector(".loader");

  if (!loader) {
    loader = document.createElement("div");
    loader.id = "appLoader";
    loader.className = "loader";
    loader.innerHTML = `
      <div class="loader__inner">
        <div class="loader__logo"></div>
        <div class="loader__bar">
          <div class="loader__bar-fill"></div>
        </div>
        <p class="loader__text">Cargando panel de presupuestos...</p>
      </div>
    `;
    document.body.appendChild(loader);
  }

  window.addEventListener("load", () => {
    // mínimo 3 segundos de loader
    setTimeout(() => {
      loader.classList.add("loader--hide");
      setTimeout(() => loader.remove(), 450);
    }, 3000);
  });
}

// ========== NAVEGACIÓN / SIDEBAR / MODAL ==========

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

if (menuToggle && sidebar) {
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("sidebar--open");
  });
}

const navLinks = document.querySelectorAll(".js-nav-link");
const sections = document.querySelectorAll(".section");

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const sectionName = link.getAttribute("data-section");
    if (!sectionName) return;

    navLinks.forEach((l) => l.classList.remove("sidebar__link--active"));
    link.classList.add("sidebar__link--active");

    sections.forEach((section) => {
      if (section.id === `section-${sectionName}`) {
        section.classList.add("section--active");
      } else {
        section.classList.remove("section--active");
      }
    });

    if (
      window.innerWidth <= 768 &&
      sidebar &&
      sidebar.classList.contains("sidebar--open")
    ) {
      sidebar.classList.remove("sidebar--open");
    }
  });
});

// ---- Modal genérico ----
const modal = document.getElementById("genericModal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");

function openModal(title, body) {
  if (!modal) return;
  if (modalTitle) modalTitle.textContent = title || "Detalle";
  if (modalBody) modalBody.textContent = body || "Contenido de ejemplo...";
  modal.classList.add("modal--open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove("modal--open");
  modal.setAttribute("aria-hidden", "true");
}

const modalTriggers = document.querySelectorAll(".js-open-modal");
modalTriggers.forEach((btn) => {
  btn.addEventListener("click", () => {
    const title = btn.getAttribute("data-modal-title") || "";
    const body = btn.getAttribute("data-modal-body") || "";
    openModal(title, body);
  });
});

if (modal) {
  modal.addEventListener("click", (event) => {
    const target = event.target;
    if (
      target.classList.contains("js-modal-close") ||
      target.getAttribute("data-close") === "backdrop"
    ) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("modal--open")) {
      closeModal();
    }
  });
}

// ========== FILTROS TABLA DASHBOARD ==========

const searchInputs = document.querySelectorAll(".js-search-input");
const filterSelects = document.querySelectorAll(".js-filter-select");

function actualizarVisibilidadFila(row) {
  const textMatch = row.dataset.textMatch !== "0";
  const estadoMatch = row.dataset.estadoMatch !== "0";
  row.style.display = textMatch && estadoMatch ? "" : "none";
}

searchInputs.forEach((input) => {
  input.addEventListener("input", () => {
    const tableId = input.getAttribute("data-table-id");
    const table = tableId ? document.getElementById(tableId) : null;
    if (!table) return;

    const filterText = normalizarTexto(input.value || "");
    const rows = table.querySelectorAll("tbody tr");

    rows.forEach((row) => {
      const cellsText = normalizarTexto(row.innerText || "");
      const matchesText = cellsText.includes(filterText);
      row.dataset.textMatch = matchesText ? "1" : "0";
      actualizarVisibilidadFila(row);
    });
  });
});

filterSelects.forEach((select) => {
  select.addEventListener("change", () => {
    const tableId = select.getAttribute("data-table-id");
    const table = tableId ? document.getElementById(tableId) : null;
    if (!table) return;

    const filterValue = select.value;
    const rows = table.querySelectorAll("tbody tr");

    rows.forEach((row) => {
      const estadoCell = row.querySelector("td:nth-child(4)");
      const estadoText = estadoCell ? estadoCell.innerText.trim() : "";
      const matchesEstado = !filterValue || estadoText === filterValue;
      row.dataset.estadoMatch = matchesEstado ? "1" : "0";
      actualizarVisibilidadFila(row);
    });
  });
});

// ========== PANTALLA COMPLETA PLATAFORMA ==========

const layoutRoot = document.getElementById("layoutRoot");
const toggleEmbedFull = document.getElementById("toggleEmbedFull");

if (layoutRoot && toggleEmbedFull) {
  toggleEmbedFull.addEventListener("click", () => {
    const isFull = toggleEmbedFull.getAttribute("data-fullscreen") === "on";

    if (isFull) {
      layoutRoot.classList.remove("layout--embed-full");
      toggleEmbedFull.setAttribute("data-fullscreen", "off");
      toggleEmbedFull.textContent = "Pantalla completa";
    } else {
      layoutRoot.classList.add("layout--embed-full");
      toggleEmbedFull.setAttribute("data-fullscreen", "on");
      toggleEmbedFull.textContent = "Salir de pantalla completa";
    }
  });
}

// ========== TEMA CLARO / OSCURO ==========

const themeToggle = document.getElementById("themeToggle");
const themeLabelMode = document.getElementById("themeLabelMode");
const THEME_KEY = "farberTheme";

function applyTheme(theme) {
  const darkOn = theme === "dark";
  document.body.classList.toggle("theme-dark", darkOn);
  if (themeToggle) themeToggle.checked = darkOn;
  if (themeLabelMode) themeLabelMode.textContent = darkOn ? "Oscuro" : "Claro";
}

function initTheme() {
  let saved = null;
  try {
    saved = localStorage.getItem(THEME_KEY);
  } catch (_) {}

  if (!saved) {
    const prefersDark = window.matchMedia?.(
      "(prefers-color-scheme: dark)"
    ).matches;
    saved = prefersDark ? "dark" : "light";
  }

  applyTheme(saved);
}

if (themeToggle) {
  themeToggle.addEventListener("change", () => {
    const darkOn = themeToggle.checked;
    const theme = darkOn ? "dark" : "light";
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (_) {}
  });
}

// ========== VIDEOS (hover) ==========

function initProductVideos() {
  const productVideos = document.querySelectorAll(".js-product-video");
  productVideos.forEach((video) => {
    video.addEventListener("mouseenter", () => {
      video.play().catch(() => {});
    });

    video.addEventListener("mouseleave", () => {
      video.pause();
      video.currentTime = 0;
    });

    video.addEventListener(
      "touchstart",
      () => {
        if (video.paused) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { passive: true }
    );
  });
}

// ========== PRESUPUESTOS (tabla) ==========

const budgetSection = document.getElementById("section-presupuestos");

let budgetTableBody = null;
let budgetSummary = null;
let cartBadge = null;
let budgetDiscountInput = null;
let budgetShippingInput = null;

let budgetLines = []; // { id, name, unitPrice, quantity }

function parseMoney(text) {
  const cleaned = (text || "").replace(/[^\d,.-]/g, "").replace(/\./g, "");
  const value = parseFloat(cleaned.replace(",", "."));
  return isNaN(value) ? 0 : value;
}

function formatMoney(num) {
  const n = Number(num) || 0;
  return (
    "$ " +
    n
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  );
}

function initBudgetRefs() {
  if (!budgetSection) return;
  const table = budgetSection.querySelector(".card:nth-child(3) table");
  if (table) {
    budgetTableBody = table.querySelector("tbody");
  }
  budgetSummary = budgetSection.querySelector(".budget-summary");
  cartBadge = budgetSection.querySelector(".budget-header__cart-badge");
  budgetDiscountInput = document.getElementById("budgetDiscount");
  budgetShippingInput = document.getElementById("budgetShipping");

  const budgetDateInput = document.getElementById("budgetDate");
  if (budgetDateInput && !budgetDateInput.value) {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    budgetDateInput.value = `${y}-${m}-${d}`;
  }
}

function seedBudgetLinesFromExistingRow() {
  if (!budgetTableBody) return;
  const rows = Array.from(budgetTableBody.querySelectorAll("tr"));
  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    if (cells.length < 6) return;
    const name = cells[1].innerText.trim();
    const unitPrice = parseMoney(cells[2].innerText);
    const quantity = parseInt(cells[3].innerText.trim(), 10) || 1;
    budgetLines.push({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      unitPrice,
      quantity,
    });
  });
  budgetTableBody.innerHTML = "";
}

function attachBudgetRowEvents() {
  if (!budgetTableBody) return;
  budgetTableBody.querySelectorAll("tr").forEach((tr) => {
    const lineId = tr.dataset.lineId;
    const line = budgetLines.find((l) => l.id === lineId);
    if (!line) return;

    const decBtn = tr.querySelector('button[data-action="dec"]');
    const incBtn = tr.querySelector('button[data-action="inc"]');
    const removeBtn = tr.querySelector('button[data-action="remove"]');
    const qtyInput = tr.querySelector(".qty-control__input");

    if (decBtn) {
      decBtn.addEventListener("click", () => {
        if (line.quantity > 1) {
          line.quantity -= 1;
          qtyInput.value = line.quantity;
          recalcBudgetTotals();
        }
      });
    }

    if (incBtn) {
      incBtn.addEventListener("click", () => {
        line.quantity += 1;
        qtyInput.value = line.quantity;
        recalcBudgetTotals();
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        budgetLines = budgetLines.filter((l) => l.id !== lineId);
        renderBudgetTable();
        showToast("Producto quitado del presupuesto.", "info");
      });
    }

    if (qtyInput) {
      qtyInput.addEventListener("change", () => {
        let v = parseInt(qtyInput.value, 10);
        if (!v || v < 1) {
          v = 1;
          qtyInput.value = "1";
          showToast("La cantidad mínima es 1.", "info");
        }
        line.quantity = v;
        recalcBudgetTotals();
      });
    }
  });
}

function renderBudgetTable() {
  if (!budgetTableBody) return;
  budgetTableBody.innerHTML = "";

  budgetLines.forEach((line, index) => {
    const subtotal = line.unitPrice * line.quantity;
    const tr = document.createElement("tr");
    tr.dataset.lineId = line.id;
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${line.name}</td>
      <td>${formatMoney(line.unitPrice)}</td>
      <td>
        <div class="qty-control">
          <button class="qty-control__btn" data-action="dec">−</button>
          <input class="qty-control__input" type="number" min="1" value="${
            line.quantity
          }" />
          <button class="qty-control__btn" data-action="inc">+</button>
        </div>
      </td>
      <td>Video</td>
      <td>${formatMoney(subtotal)}</td>
      <td>
        <button class="btn btn--ghost btn--small" data-action="remove">Quitar</button>
      </td>
    `;
    budgetTableBody.appendChild(tr);
  });

  attachBudgetRowEvents();
  recalcBudgetTotals();
}

function recalcBudgetTotals() {
  let subtotal = 0;
  let unitsTotal = 0;

  budgetLines.forEach((l) => {
    subtotal += l.unitPrice * l.quantity;
    unitsTotal += l.quantity;
  });

  const discountPercent = budgetDiscountInput
    ? Number(budgetDiscountInput.value) || 0
    : 0;
  const shipping = budgetShippingInput
    ? Number(budgetShippingInput.value) || 0
    : 0;

  const discountAmount = (subtotal * discountPercent) / 100;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const iva = subtotalAfterDiscount * 0.21;
  const totalFinal = subtotalAfterDiscount + iva + shipping;

  if (budgetSummary) {
    const left = budgetSummary.querySelector(".budget-summary__left");
    const right = budgetSummary.querySelector(".budget-summary__right");

    if (left) {
      left.innerHTML = `
        <span>Subtotal: <strong>${formatMoney(subtotal)}</strong></span>
        <span>Descuento: <strong>${formatMoney(
          discountAmount
        )} (${discountPercent}%)</strong></span>
        <span>Envío (ARS): <strong>${formatMoney(shipping)}</strong></span>
        <span>IVA (21%): <strong>${formatMoney(iva)}</strong></span>
      `;
    }

    if (right) {
      const value = right.querySelector(".budget-summary__total-value");
      if (value) value.textContent = formatMoney(totalFinal);
    }
  }

  if (cartBadge) {
    cartBadge.textContent = unitsTotal;
  }
}

// Agregar desde catálogo
function initCatalogAddButtons() {
  if (!budgetSection) return;
  const cards = budgetSection.querySelectorAll(".quote-product");
  cards.forEach((card) => {
    const btn = card.querySelector("button.btn");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const titleEl = card.querySelector(".quote-product__title");
      const priceEl = card.querySelector(".quote-product__price");
      const name = titleEl ? titleEl.textContent.trim() : "Producto";
      const unitPrice = priceEl ? parseMoney(priceEl.textContent) : 0;

      if (!name || !unitPrice) {
        showToast("No se pudo leer la info del producto.", "error");
        return;
      }

      const existing = budgetLines.find((l) => l.name === name);
      if (existing) {
        existing.quantity += 1;
      } else {
        budgetLines.push({
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          name,
          unitPrice,
          quantity: 1,
        });
      }

      renderBudgetTable();
      showToast("Producto agregado al presupuesto.", "success");
    });
  });
}

// Carrito → scroll a tabla
function initCartButtonScroll() {
  if (!budgetSection) return;
  const cartBtn = budgetSection.querySelector(".budget-header__cart");
  if (!cartBtn) return;

  cartBtn.addEventListener("click", () => {
    const card = budgetSection.querySelector(".budget-card:nth-child(3)");
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

// ========== INICIALIZACIÓN GLOBAL ==========

document.addEventListener("DOMContentLoaded", () => {
  createLoader();           // loader con logo Farber (3s)
  initTheme();              // tema claro/oscuro
  initProductVideos();      // hover en videos

  if (budgetSection) {
    initBudgetRefs();

    if (budgetTableBody && !budgetLines.length) {
      seedBudgetLinesFromExistingRow();
    }

    renderBudgetTable();
    initCatalogAddButtons();
    initCartButtonScroll();
  }
});
