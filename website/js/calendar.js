(() => {
  const plan = {
    start: "2026-09-01", end: "2027-01-15", campaignBoundary: "2027-01-07",
    events: [
      ["2026-11-27", "Black Friday"], ["2026-11-30", "Cyber Monday"],
      ["2026-12-25", "Christmas Day"], ["2026-12-31", "New Year's Eve"],
    ],
    cycles: [
      ["Strategic planning & research", "2026-09-01", "2026-09-18", "Define products, audiences, objectives and success measures."],
      ["Campaign design & budget approval", "2026-09-14", "2026-10-02", "Approve briefs, channels, budgets and offers."],
      ["Product & inventory readiness", "2026-09-14", "2026-10-16", "Confirm stock, pricing, listings and commercial conditions; seasonal launch SKUs ready before October 12."],
      ["Creative & content production", "2026-09-21", "2026-10-30", "Produce assets, landing pages and gift guides in staged releases before each launch."],
      ["Setup, QA & pre-launch", "2026-10-19", "2026-11-13", "Configure advertising, tracking, audiences and email; general launch QA must be complete before October 12."],
      ["Activation & optimization", "2026-10-19", "2027-01-01", "Run the main activation cycle, monitor results and optimize; general seasonal content launches earlier."],
      ["Reporting & learnings", "2026-12-14", "2027-01-15", "Evaluate results and document recommendations for the next season."],
    ],
    campaigns: [
      { id: "christmas", name: "Christmas general", color: "#1b6548", start: "2026-10-12", end: "2026-12-25", peakStart: "2026-12-18", peakEnd: "2026-12-24", priority: "High", uplift: null,
        objective: "Capture early seasonal interest and connect shoppers with gift categories.",
        insight: "Christmas searches rise about 10 weeks before Christmas and peak in the week before it. Retail spending is strongest in November and December.",
        activities: ["Publish seasonal landing pages and gift guides before mid-October.", "Release Christmas promotional content and category discovery emails.", "Increase seasonal visibility in the week before Christmas; show verified delivery cutoffs and local availability."],
        inventory: "Complete launch listings, stock checks and initial content before October 12; replenish against actual demand." },
      { id: "toys", name: "Toys", color: "#b3202a", start: "2026-11-02", end: "2026-12-20", peakStart: "2026-12-07", peakEnd: "2026-12-13", priority: "High", uplift: "+72%",
        objective: "Prioritize the category with the strongest observed holiday sales uplift.",
        insight: "Toy searches increase 5–7 weeks before Christmas across all six research years, peaking in the second week of December.",
        activities: ["Launch toy gift guides and bestseller promotions in early November.", "Increase advertising toward the second week of December.", "Retarget engaged gift shoppers, adapting offers to stock and delivery availability."],
        inventory: "Confirm sufficient bestseller inventory and replenishment before November 2; review stock daily during the proposed peak." },
      { id: "clothing", name: "Clothing", color: "#365da0", start: "2026-10-26", end: "2026-11-30", peakStart: "2026-11-23", peakEnd: "2026-11-30", priority: "High", uplift: "+42%",
        objective: "Focus promotional investment around Black Friday demand.",
        insight: "Clothing searches peak during Black Friday week in every research year.",
        activities: ["Open with seasonal collection teasers, then concentrate promotions in Black Friday week.", "Highlight approved discounts, gift selections and seasonal collections.", "Use Cyber Monday as a proposed deal extension, not a separately established research peak."],
        inventory: "Approve offers and secure size and color availability before October 26; prepare returns and replenishment capacity." },
      { id: "electronics", name: "Electronics", color: "#77509b", start: "2026-10-19", end: "2026-11-30", peakStart: "2026-11-23", peakEnd: "2026-11-30", priority: "High", uplift: "+36%",
        objective: "Build consideration early and prioritize Black Friday conversions.",
        insight: "Searches peak in Black Friday week in four of six years; late-October interest also appears in 2023 and 2024.",
        activities: ["Test late-October teasers ahead of the observed early-interest window.", "Publish product comparisons and buying guides.", "Prioritize Black Friday offers; evaluate a proposed Cyber Monday extension against performance."],
        inventory: "Secure promoted SKUs, approved prices and comparison content before October 19; align stock with offer commitments." },
      { id: "books", name: "Books", color: "#927019", start: "2026-11-23", end: "2026-12-20", peakStart: "2026-12-01", peakEnd: "2026-12-07", priority: "Medium", uplift: null,
        objective: "Reach gift buyers before the early-December search peak.",
        insight: "Book searches peak in early December in five of six research years.",
        activities: ["Publish gift bundles, bestseller lists and gift recommendations before December.", "Promote curated reading lists in early December.", "Adapt later messaging to confirmed delivery deadlines."],
        inventory: "Prepare bestseller stock, bundles and gift listings before November 23." },
      { id: "drinks", name: "Alcohol & drinks", color: "#a84b28", start: "2026-12-21", end: "2027-01-01", peakStart: "2026-12-26", peakEnd: "2027-01-01", priority: "Medium", uplift: null,
        objective: "Support celebration demand between Christmas and New Year.",
        insight: "Search interest peaks in the week between Christmas and New Year.",
        activities: ["Prepare Christmas celebration and New Year's Eve promotional content.", "Concentrate marketing between December 26 and January 1.", "Apply relevant US alcohol advertising rules, 21+ age restrictions and state-specific sale and delivery requirements."],
        inventory: "Prepare eligible celebration ranges before December 21; verify licensing, stock and fulfillment restrictions." },
    ],
  };

  const day = 86400000;
  const parseDate = (value) => new Date(`${value}T00:00:00Z`);
  const offset = (value) => Math.round((parseDate(value) - parseDate(plan.start)) / day);
  const totalDays = offset(plan.end) + 1;
  const dateLabel = (value) => parseDate(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  const dateRange = (start, end) => `${dateLabel(start)} – ${dateLabel(end)}`;
  const timeline = document.getElementById("campaign-timeline");
  const categoryFilter = document.getElementById("category-filter");
  const priorityFilter = document.getElementById("priority-filter");
  const dialog = document.getElementById("campaign-dialog");
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const position = (node, start, end = start) => {
    node.style.left = `${offset(start) / totalDays * 100}%`;
    node.style.width = `${(offset(end) - offset(start) + 1) / totalDays * 100}%`;
  };
  function row(label, className = "") {
    const wrapper = element("div", `timeline-row ${className}`);
    wrapper.append(element("div", "timeline-label", label));
    const track = element("div", "timeline-track");
    wrapper.append(track);
    timeline.append(wrapper);
    return track;
  }
  function brief(campaign, target) {
    target.replaceChildren();
    const title = element("h2", "", campaign.name);
    if (target.id === "campaign-detail") title.id = "detail-title";
    target.append(title, element("p", "brief-priority", `${campaign.priority} priority${campaign.uplift ? ` · ${campaign.uplift} historical holiday sales uplift` : " · Sales uplift not specified"}`));
    const fields = [
      ["Proposed start", dateLabel(campaign.start)], ["Proposed end", dateLabel(campaign.end)],
      ["Proposed peak investment period", dateRange(campaign.peakStart, campaign.peakEnd)],
      ["Marketing objective", campaign.objective], ["Historical research insight", campaign.insight],
      ["Suggested inventory preparation", campaign.inventory],
    ];
    const details = element("dl", "brief-fields");
    fields.forEach(([label, text]) => details.append(element("dt", "", label), element("dd", "", text)));
    target.append(details, element("h3", "", "Recommended marketing activities"));
    const activities = element("ul", "");
    campaign.activities.forEach((text) => activities.append(element("li", "", text)));
    target.append(activities, element("p", "brief-caveat", "Dates are planning recommendations, not observed 2026 outcomes. Historical uplift is not a forecast of campaign return."));
  }
  function openBrief(campaign) {
    brief(campaign, document.getElementById("campaign-detail"));
    dialog.showModal();
  }
  function render() {
    const selected = plan.campaigns.filter((campaign) => (categoryFilter.value === "all" || categoryFilter.value === campaign.id) && (!priorityFilter.checked || campaign.priority === "High"));
    timeline.replaceChildren();
    timeline.style.setProperty("--week-width", `${7 / totalDays * 100}%`);
    const months = row("2026 → 2027", "month-row");
    let monthStart = parseDate(plan.start);
    while (monthStart <= parseDate(plan.end)) {
      const nextMonth = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1));
      const start = monthStart.toISOString().slice(0, 10);
      const end = new Date(Math.min(nextMonth.getTime() - day, parseDate(plan.end).getTime())).toISOString().slice(0, 10);
      const label = element("span", "month-label", monthStart.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }));
      position(label, start, end);
      months.append(label);
      monthStart = nextMonth;
    }
    const weeks = row("Week commencing", "week-row");
    for (let index = 0; index < totalDays; index += 7) {
      const value = new Date(parseDate(plan.start).getTime() + index * day).toISOString().slice(0, 10);
      const label = element("span", "week-label", parseDate(value).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }));
      position(label, value, new Date(parseDate(plan.start).getTime() + Math.min(index + 6, totalDays - 1) * day).toISOString().slice(0, 10));
      weeks.append(label);
    }
    const events = row("Key dates", "event-row");
    plan.events.forEach(([date, name], index) => {
      const marker = element("span", `event-marker event-${index}`, `${name} · ${dateLabel(date).replace(", 2026", "")}`);
      position(marker, date);
      events.append(marker);
    });
    row("Delivery workstreams", "group-row");
    plan.cycles.forEach(([name, start, end, description], index) => {
      const track = row(`${index + 1}. ${name}`, "cycle-row");
      const bar = element("div", "cycle-bar", name);
      position(bar, start, end);
      bar.title = `${name}: ${dateRange(start, end)}. ${description}`;
      track.append(bar);
    });
    row("Category activation", "group-row");
    selected.forEach((campaign) => {
      const track = row(campaign.name, "campaign-row");
      const bar = element("button", "campaign-bar", campaign.name);
      bar.type = "button";
      bar.dataset.campaign = campaign.id;
      bar.style.setProperty("--campaign-color", campaign.color);
      position(bar, campaign.start, campaign.end);
      bar.setAttribute("aria-label", `${campaign.name}, ${dateRange(campaign.start, campaign.end)}, ${campaign.priority} priority. Open campaign brief.`);
      bar.title = `${campaign.name}: ${dateRange(campaign.start, campaign.end)}`;
      const peak = element("span", "peak-band");
      peak.setAttribute("aria-hidden", "true");
      peak.style.left = `${(offset(campaign.peakStart) - offset(campaign.start)) / (offset(campaign.end) - offset(campaign.start) + 1) * 100}%`;
      peak.style.width = `${(offset(campaign.peakEnd) - offset(campaign.peakStart) + 1) / (offset(campaign.end) - offset(campaign.start) + 1) * 100}%`;
      bar.append(peak);
      bar.addEventListener("click", () => openBrief(campaign));
      track.append(bar);
    });
    if (!selected.length) row("No matching campaigns", "empty-row");
    row("Groceries / comparison", "control-row").append(element("span", "control-label", "Business as usual · no dedicated holiday campaign · +7% historical uplift"));
    timeline.querySelectorAll(".cycle-row .timeline-track, .campaign-row .timeline-track").forEach((track) => {
      plan.events.forEach(([date]) => {
        const line = element("span", "date-guide");
        position(line, date);
        line.setAttribute("aria-hidden", "true");
        track.append(line);
      });
      const boundary = element("span", "boundary-guide");
      position(boundary, plan.campaignBoundary);
      boundary.title = "January 7: campaign view boundary; reporting continues to January 15";
      track.append(boundary);
    });
    document.getElementById("calendar-status").textContent = `${selected.length} of ${plan.campaigns.length} campaigns shown · 7 delivery workstreams · dates inclusive`;
    const printDetails = document.getElementById("print-campaigns");
    printDetails.replaceChildren();
    selected.forEach((campaign) => {
      const article = element("article", "");
      brief(campaign, article);
      printDetails.append(article);
    });
  }
  plan.campaigns.forEach((campaign) => {
    const option = element("option", "", campaign.name);
    option.value = campaign.id;
    categoryFilter.append(option);
    const legend = element("span", "legend-entry", campaign.name);
    legend.style.setProperty("--campaign-color", campaign.color);
    document.getElementById("calendar-legend").append(legend);
  });
  categoryFilter.addEventListener("change", render);
  priorityFilter.addEventListener("change", render);
  document.getElementById("reset-filters").addEventListener("click", () => {
    categoryFilter.value = "all";
    priorityFilter.checked = false;
    render();
  });
  document.getElementById("print-calendar").addEventListener("click", () => window.print());
  document.getElementById("close-details").addEventListener("click", () => dialog.close());
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dialog.open) {
      event.preventDefault();
      dialog.close();
    }
  }, true);
  render();
})();