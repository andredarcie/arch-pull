const money = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });

function byId(id) {
  return document.getElementById(id);
}

function formatSales(value) {
  return `${money.format(value)}M units`;
}

function setupCanvas(canvas) {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * ratio;
  canvas.height = Number(canvas.getAttribute("height")) * ratio;
  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);
  return { ctx, width: rect.width, height: Number(canvas.getAttribute("height")) };
}

function drawBars(canvas, rows, options) {
  const { ctx, width, height } = setupCanvas(canvas);
  const pad = { top: 18, right: 24, bottom: 28, left: options.left || 124 };
  const chartWidth = width - pad.left - pad.right;
  const chartHeight = height - pad.top - pad.bottom;
  const maxValue = Math.max(...rows.map((row) => row.value));
  const barGap = 8;
  const barHeight = Math.max(10, (chartHeight - barGap * (rows.length - 1)) / rows.length);

  ctx.clearRect(0, 0, width, height);
  ctx.font = "12px Inter, sans-serif";
  ctx.textBaseline = "middle";

  rows.forEach((row, index) => {
    const y = pad.top + index * (barHeight + barGap);
    const barWidth = (row.value / maxValue) * chartWidth;
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(pad.left, y, chartWidth, barHeight);
    ctx.fillStyle = row.color || options.color || "#f3b63f";
    ctx.fillRect(pad.left, y, barWidth, barHeight);
    ctx.fillStyle = "#f4f1e8";
    ctx.fillText(row.label, 0, y + barHeight / 2);
    ctx.fillStyle = "#b7bdc8";
    ctx.textAlign = "right";
    ctx.fillText(options.format(row.value), width - 2, y + barHeight / 2);
    ctx.textAlign = "left";
  });
}

function drawColumns(canvas, rows, options) {
  const { ctx, width, height } = setupCanvas(canvas);
  const pad = { top: 18, right: 20, bottom: 52, left: 52 };
  const chartWidth = width - pad.left - pad.right;
  const chartHeight = height - pad.top - pad.bottom;
  const maxValue = Math.max(...rows.map((row) => row.value));
  const columnWidth = chartWidth / rows.length;

  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + chartHeight);
  ctx.lineTo(pad.left + chartWidth, pad.top + chartHeight);
  ctx.stroke();

  rows.forEach((row, index) => {
    const x = pad.left + index * columnWidth + columnWidth * 0.18;
    const barHeight = (row.value / maxValue) * chartHeight;
    const y = pad.top + chartHeight - barHeight;
    ctx.fillStyle = options.color || "#51b8c7";
    ctx.fillRect(x, y, columnWidth * 0.64, barHeight);
    ctx.save();
    ctx.translate(x + columnWidth * 0.32, height - 12);
    ctx.rotate(-Math.PI / 4);
    ctx.fillStyle = "#b7bdc8";
    ctx.font = "12px Inter, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(row.label, 0, 0);
    ctx.restore();
  });
}

function renderTable(rows) {
  byId("data-table").innerHTML = rows
    .slice(0, 30)
    .map(
      (row) => `<tr>
        <td>${row.rank}</td>
        <td>${row.franchise}</td>
        <td>${formatSales(row.sales_millions)}</td>
        <td>${row.primary_genre}</td>
        <td>${row.debut_year}</td>
        <td>${number.format(row.sales_per_year_millions)}M/year</td>
      </tr>`,
    )
    .join("");
}

function render(data) {
  const summary = data.summary;
  byId("largest-franchise").textContent = summary.largest_franchise;
  byId("largest-sales").textContent = formatSales(summary.largest_sales_millions);
  byId("kpi-count").textContent = money.format(summary.franchise_count);
  byId("kpi-sales").textContent = formatSales(summary.total_sales_millions);
  byId("kpi-top10").textContent = percent.format(summary.top_10_share);
  byId("kpi-median").textContent = formatSales(summary.median_sales_millions);
  byId("concentration-text").textContent =
    `The top 10 franchises represent ${percent.format(summary.top_10_share)} of all listed unit sales, while the top 20 represent ${percent.format(summary.top_20_share)}.`;
  byId("retrieved-at").textContent = `Retrieved at ${new Date(data.source.retrieved_at).toLocaleString()}.`;
  byId("source-link").href = data.source.url;

  drawBars(
    byId("top-chart"),
    data.topFranchises.slice(0, 15).map((row, index) => ({
      label: `${index + 1}. ${row.franchise}`,
      value: row.sales_millions,
      color: index < 5 ? "#f3b63f" : "#51b8c7",
    })),
    { format: formatSales, left: 152 },
  );

  drawBars(
    byId("genre-chart"),
    data.genres.slice(0, 10).map((row) => ({ label: row.name, value: row.sales_millions })),
    { format: formatSales, color: "#81c784", left: 126 },
  );

  drawColumns(
    byId("decade-chart"),
    data.decades.map((row) => ({ label: row.name, value: row.sales_millions })),
    { color: "#e45b5b" },
  );

  drawBars(
    byId("velocity-chart"),
    data.velocity.slice(0, 12).map((row, index) => ({
      label: `${index + 1}. ${row.franchise}`,
      value: row.sales_per_year_millions,
      color: index < 5 ? "#f3b63f" : "#51b8c7",
    })),
    { format: (value) => `${number.format(value)}M/year`, left: 152 },
  );

  drawBars(
    byId("publisher-chart"),
    data.publishers.slice(0, 10).map((row) => ({ label: row.name, value: row.allocated_sales_millions })),
    { format: formatSales, color: "#f3b63f", left: 132 },
  );

  byId("velocity-list").innerHTML = data.velocity
    .slice(0, 5)
    .map((row) => `<li>${row.franchise}: ${number.format(row.sales_per_year_millions)}M units per year since ${row.debut_year}</li>`)
    .join("");
  renderTable(data.allFranchises);
}

fetch("data/analysis.json")
  .then((response) => response.json())
  .then((data) => {
    render(data);
    window.addEventListener("resize", () => render(data));
  })
  .catch((error) => {
    document.body.insertAdjacentHTML("afterbegin", `<p class="load-error">${error.message}</p>`);
  });
