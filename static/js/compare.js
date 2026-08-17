(() => {
  const toggles = [...document.querySelectorAll("[data-product-toggle]")];
  if (!toggles.length) return;

  const cards = [...document.querySelectorAll("[data-product-card]")];
  const columns = [...document.querySelectorAll("[data-compare-column]")];
  const defaultIds = toggles.filter((item) => item.checked).map((item) => item.value);
  const count = document.querySelector("[data-selected-count]");
  const message = document.querySelector("[data-compare-message]");
  const table = document.querySelector("[data-comparison-table]");
  const empty = document.querySelector("[data-comparison-empty]");
  const pickerEmpty = document.querySelector("[data-picker-empty]");
  const brandFilter = document.querySelector("[data-compare-brand]");
  const categoryFilter = document.querySelector("[data-compare-category]");
  const searchInput = document.querySelector("[data-compare-search]");
  const maxProducts = 4;

  const requested = new URLSearchParams(window.location.search)
    .get("products")?.split(",").filter(Boolean) || [];
  if (requested.length) {
    const valid = new Set(toggles.map((item) => item.value));
    const initial = [...new Set([...requested.filter((id) => valid.has(id)), ...defaultIds])].slice(0, maxProducts);
    toggles.forEach((item) => { item.checked = initial.includes(item.value); });
  }

  function selectedIds() {
    return toggles.filter((item) => item.checked).map((item) => item.value);
  }

  function renderSelection(updateUrl = true) {
    const selected = selectedIds();
    const selectedSet = new Set(selected);
    columns.forEach((cell) => { cell.hidden = !selectedSet.has(cell.dataset.compareColumn); });
    cards.forEach((card) => card.classList.toggle("is-selected", card.querySelector("input").checked));
    toggles.forEach((item) => { item.disabled = !item.checked && selected.length >= maxProducts; });
    count.textContent = selected.length;
    table.hidden = selected.length === 0;
    empty.hidden = selected.length !== 0;
    message.textContent = selected.length >= maxProducts
      ? "已达到 4 款上限；移除一款后可继续选择。"
      : "选择 2–4 款产品，更容易看出定位与规格差异。";

    if (updateUrl) {
      const url = new URL(window.location.href);
      if (selected.length) url.searchParams.set("products", selected.join(","));
      else url.searchParams.delete("products");
      history.replaceState({}, "", url);
    }
  }

  function filterCards() {
    const brand = brandFilter.value;
    const category = categoryFilter.value;
    const query = searchInput.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const matches = (!brand || card.dataset.brand === brand)
        && (!category || card.dataset.category === category)
        && (!query || card.dataset.name.includes(query));
      card.hidden = !matches;
      if (matches) visible += 1;
    });
    pickerEmpty.hidden = visible !== 0;
  }

  toggles.forEach((item) => {
    item.addEventListener("change", () => {
      if (selectedIds().length > maxProducts) item.checked = false;
      renderSelection();
    });
  });
  document.querySelectorAll("[data-remove-product]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = toggles.find((item) => item.value === button.dataset.removeProduct);
      if (input) input.checked = false;
      renderSelection();
    });
  });
  document.querySelector("[data-clear-compare]").addEventListener("click", () => {
    toggles.forEach((item) => { item.checked = false; });
    renderSelection();
  });
  [brandFilter, categoryFilter].forEach((field) => field.addEventListener("change", filterCards));
  searchInput.addEventListener("input", filterCards);

  renderSelection(false);
  filterCards();
})();