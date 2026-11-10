(() => {
  const charts = window.IRON_FACT_CHARTS || {};
  const config = { responsive: true, displaylogo: false, modeBarButtonsToRemove: ["select2d", "lasso2d"] };

  document.querySelectorAll("[data-chart]").forEach((el) => {
    const fig = charts[el.dataset.chart];
    if (!fig || !window.Plotly) {
      el.textContent = "Chart could not be loaded.";
      return;
    }
    const layout = { ...fig.layout, autosize: true, width: undefined };
    Plotly.newPlot(el, fig.data, layout, config);
  });
})();
