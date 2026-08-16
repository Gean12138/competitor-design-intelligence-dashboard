(() => {
  const dashboard = document.querySelector("[data-static-dashboard]");
  const form = document.querySelector("[data-static-filter]");
  if (!dashboard || !form) return;

  const items = [...dashboard.querySelectorAll(".editorial-item")];
  const count = document.querySelector("[data-visible-count]");
  const controls = {
    brand: form.elements.brand,
    pageType: form.elements.page_type,
    category: form.elements.category,
    changedOnly: form.elements.changed_only,
  };

  const params = new URLSearchParams(window.location.search);
  controls.brand.value = params.get("brand") || "";
  controls.pageType.value = params.get("page_type") || "";
  controls.category.value = params.get("category") || "";
  controls.changedOnly.checked = params.get("changed_only") === "1";

  function applyFilters(updateUrl = true) {
    let visible = 0;
    for (const item of items) {
      const matches = (!controls.brand.value || item.dataset.brand === controls.brand.value)
        && (!controls.pageType.value || item.dataset.pageType === controls.pageType.value)
        && (!controls.category.value || item.dataset.category === controls.category.value)
        && (!controls.changedOnly.checked || item.dataset.status === "changed");
      item.hidden = !matches;
      if (matches) visible += 1;
    }
    if (count) count.textContent = visible;
    if (!updateUrl) return;
    const next = new URLSearchParams();
    if (controls.brand.value) next.set("brand", controls.brand.value);
    if (controls.pageType.value) next.set("page_type", controls.pageType.value);
    if (controls.category.value) next.set("category", controls.category.value);
    if (controls.changedOnly.checked) next.set("changed_only", "1");
    const query = next.toString();
    history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}#signals`);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilters();
  });
  form.addEventListener("change", () => applyFilters());
  applyFilters(false);
})();