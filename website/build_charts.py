"""Rebuild the charts for data.html from the project data.

Run from anywhere:  python3 website/build_charts.py
Writes website/js/chart-data.js and copies plotly.min.js into website/js/vendor/.
The calculations mirror Holidays_US, holiday_project_maisa, trends and trends2 notebooks.
"""
import calendar
import glob
import json
import shutil
from pathlib import Path

import pandas as pd
import plotly
import plotly.express as px
import plotly.graph_objects as go
import requests

ROOT = Path(__file__).resolve().parent.parent  # Holidays/
SITE = ROOT / "website"

# Site palette (matches css/style.css)
RED, GREEN, GOLD, CINNAMON, GREY = "#b3202a", "#1b4d33", "#c9a03f", "#8a4b2a", "#9a978f"
CREAM, INK, GRID = "#fbf6ec", "#1f2a24", "#e6dcc8"
MONTHS = list(calendar.month_abbr)[1:]


def theme(fig, height=460):
    fig.update_layout(
        template="simple_white",
        paper_bgcolor=CREAM,
        plot_bgcolor=CREAM,
        font=dict(family="Lato, Arial, sans-serif", size=14, color=INK),
        height=height,
        margin=dict(t=40, l=70, r=30, b=60),
        hoverlabel=dict(bgcolor="white", font_family="Lato, Arial, sans-serif"),
        legend=dict(title="", orientation="h", y=1.02, x=0, yanchor="bottom", bgcolor="rgba(0,0,0,0)"),
        title=None,
    )
    fig.update_xaxes(showgrid=False, linecolor=INK, tickcolor=INK)
    fig.update_yaxes(showgrid=True, gridcolor=GRID, linecolor=INK, tickcolor=INK)
    return fig


# 1. Holidays_US: monthly heatmap -------------------------------------------------
def heatmap():
    s = pd.read_csv(ROOT / "spending.csv")
    s.columns = ["date", "sales"]
    s["date"] = pd.to_datetime(s["date"])
    s["year"], s["month"] = s["date"].dt.year, s["date"].dt.month
    s["index"] = (s["sales"] / s.groupby("year")["sales"].transform("mean")).round(2)
    table = s.pivot(index="year", columns="month", values="index")

    fig = go.Figure(go.Heatmap(
        z=table.values, x=[MONTHS[m - 1] for m in table.columns], y=table.index.astype(str),
        colorscale=[[0, GREEN], [0.5, CREAM], [1, RED]], zmid=1,
        texttemplate="%{z:.2f}", textfont=dict(size=12),
        xgap=2, ygap=2,
        colorbar=dict(title=dict(text="vs. year<br>average", side="top"), thickness=14),
        hovertemplate="%{x} %{y}: %{z:.2f}× the year's average<extra></extra>",
    ))
    theme(fig, 420)
    fig.update_yaxes(autorange="reversed", showgrid=False, title_text="")
    fig.update_xaxes(side="top", showline=False, ticks="")
    fig.update_layout(margin=dict(t=50, l=60, r=20, b=20))
    return fig


# 2. Holidays_US: typical year by category ---------------------------------------
def category_profile():
    files = {"toys.csv": "Toys & hobby", "clothing.csv": "Clothing", "electronics.csv": "Electronics",
             "online.csv": "Online", "grocery.csv": "Grocery"}
    frames = []
    for name, cat in files.items():
        df = pd.read_csv(ROOT / name)
        df.columns = ["date", "sales"]
        df["date"] = pd.to_datetime(df["date"])
        df = df[(df["date"] >= "2020-01-01") & (df["date"] <= "2025-12-31")].copy()
        df["year"], df["month"] = df["date"].dt.year, df["date"].dt.month
        df["seasonal_index"] = df["sales"] / df.groupby("year")["sales"].transform("mean")
        df["category"] = cat
        frames.append(df)
    profile = (pd.concat(frames).groupby(["category", "month"])["seasonal_index"]
               .mean().reset_index())

    colors = {"Toys & hobby": RED, "Clothing": GREEN, "Electronics": GOLD, "Online": CINNAMON, "Grocery": GREY}
    fig = px.line(profile, x="month", y="seasonal_index", color="category", markers=True,
                  color_discrete_map=colors,
                  category_orders={"category": list(colors)})
    theme(fig, 480)
    fig.add_vrect(x0=10.5, x1=12.5, fillcolor=GOLD, opacity=0.15, line_width=0,
                  annotation_text="Holiday season", annotation_position="top left")
    fig.add_hline(y=1, line_dash="dot", line_color=GREY,
                  annotation_text="normal month", annotation_position="bottom left")
    fig.update_traces(line_width=3, marker_size=7,
                      hovertemplate="%{x}: %{y:.2f}× normal<extra>%{fullData.name}</extra>")
    fig.update_xaxes(tickvals=list(range(1, 13)), ticktext=MONTHS, range=[0.5, 12.5], title_text="")
    fig.update_yaxes(title_text="Sales ÷ yearly average", tickformat=".1f", ticksuffix="×")
    return fig


# 3. holiday_project_maisa: holiday vs rest-of-year growth -----------------------
def holiday_growth():
    data = pd.read_excel(ROOT / "us_retail_sales_2020_2025.xlsx")
    data = data[data["estimate_type"] == "not adjusted"].copy()
    data.columns = data.columns.str.strip().str.title()
    data = data.dropna(subset=["Naics_Code", "Sales"])
    data = data[data["Naics_Code"] != 447]

    trend = data.groupby("Sales_Month", as_index=False)["Sales"].sum()
    trend["Sales_Month"] = pd.to_datetime(trend["Sales_Month"])
    trend["Year"] = trend["Sales_Month"].dt.year
    trend["Period"] = trend["Sales_Month"].dt.month.map(lambda m: "Nov–Dec" if m in (11, 12) else "Jan–Oct")
    g = trend.groupby(["Year", "Period"])["Sales"].sum().reset_index()
    g["YoY"] = g.groupby("Period")["Sales"].pct_change() * 100
    g = g[g["Year"].between(2021, 2023)]

    fig = go.Figure()
    for period, color in [("Nov–Dec", RED), ("Jan–Oct", GREEN)]:
        sub = g[g["Period"] == period]
        fig.add_trace(go.Bar(
            x=sub["Year"].astype(str), y=sub["YoY"], name=period, marker_color=color,
            text=sub["YoY"].map(lambda v: f"{v:.1f}%"), textposition="outside", cliponaxis=False,
            hovertemplate="%{x} · " + period + ": %{y:.1f}% growth<extra></extra>",
        ))
    theme(fig, 440)
    fig.update_layout(barmode="group", bargap=0.3)
    fig.update_xaxes(title_text="")
    fig.update_yaxes(title_text="Year-over-year growth", ticksuffix="%", rangemode="tozero")
    return fig


# 4. trends: Google vs Wikipedia --------------------------------------------------
def weeks_before(dates, season):
    return ((pd.to_datetime(season.astype(str) + "-12-25") - dates).dt.days / 7).round()


def start_week(group, factor=2):
    """Weeks before Christmas when interest rises above 2× September and stays there until the peak."""
    group = group.sort_values("date").reset_index(drop=True)
    baseline = group.loc[group["date"].dt.month == 9, "interest"].mean()
    peak = group["interest"].idxmax()
    above = group["interest"] >= factor * baseline
    for i in range(peak + 1):
        if above.iloc[i:peak + 1].all():
            return group.loc[i, "weeks_before_christmas"]
    return float("nan")


def christmas_signals():
    frames = []
    for f in sorted(glob.glob(str(ROOT / "trendsset1_season" / "*.csv"))):
        df = pd.read_csv(f).rename(columns={"Time": "date"})
        df["date"] = pd.to_datetime(df["date"])
        df["interest"] = pd.to_numeric(df["christmas"].replace("<1", 0))
        df["season"] = df.loc[df["date"].dt.month == 12, "date"].dt.year.iloc[0]
        frames.append(df[["date", "season", "interest"]])
    google = pd.concat(frames, ignore_index=True)
    google["weeks_before_christmas"] = weeks_before(google["date"], google["season"])

    url = ("https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/"
           "en.wikipedia/all-access/user/Christmas/daily/20200901/20251231")
    items = requests.get(url, headers={"User-Agent": "IronFact student project"}, timeout=30).json()["items"]
    wiki = pd.DataFrame(items)
    wiki["date"] = pd.to_datetime(wiki["timestamp"], format="%Y%m%d%H")
    wiki = (wiki.set_index("date")["views"].resample("W-SUN", label="left", closed="left")
            .sum().reset_index())
    wiki = wiki[wiki["date"].dt.month.isin([9, 10, 11, 12])].copy()
    wiki["season"] = wiki["date"].dt.year
    wiki["weeks_before_christmas"] = weeks_before(wiki["date"], wiki["season"])
    wiki["interest"] = (wiki["views"] / wiki.groupby("season")["views"].transform("max") * 100).round()

    starts = {
        "Google searches": google.groupby("season").apply(start_week).mean(),
        "Wikipedia views": wiki.groupby("season").apply(start_week).mean(),
    }
    compare = pd.concat([google.assign(source="Google searches"), wiki.assign(source="Wikipedia views")])
    avg = compare.groupby(["source", "weeks_before_christmas"])["interest"].mean().reset_index()
    avg = avg[avg["weeks_before_christmas"] >= 0]

    colors = {"Google searches": RED, "Wikipedia views": GREEN}
    fig = px.line(avg, x="weeks_before_christmas", y="interest", color="source", markers=True,
                  color_discrete_map=colors)
    theme(fig, 460)
    fig.update_traces(line_width=3, marker_size=7,
                      hovertemplate="%{x:.0f} weeks before Christmas: %{y:.0f}<extra>%{fullData.name}</extra>")
    for i, (source, wk) in enumerate(starts.items()):
        fig.add_vline(x=wk, line_dash="dot", line_color=colors[source], line_width=2, opacity=1)
        fig.add_annotation(x=wk, y=1 - i * 0.08, yref="paper", showarrow=False, xanchor="left", xshift=6,
                           text=f"{source.split()[0]} rise starts (≈{wk:.1f} wks)",
                           font=dict(color=colors[source], size=12))
    fig.update_xaxes(autorange="reversed", title_text="Weeks before Christmas", dtick=2)
    fig.update_yaxes(title_text="Relative interest (100 = peak week)", range=[0, 105])
    return fig


# 5. trends2: category search build-up --------------------------------------------
def category_searches():
    names = {"toys": "Toys", "clothing": "Clothing", "electronics": "Electronics",
             "books": "Books", "alcohol": "Alcohol", "groceries": "Groceries (control)"}
    frames = []
    for term in names:
        for f in sorted(glob.glob(str(ROOT / "set2_categories" / term / "*.csv"))):
            df = pd.read_csv(f).rename(columns={"Time": "date"})
            df["date"] = pd.to_datetime(df["date"])
            df["interest"] = pd.to_numeric(df[term].replace("<1", 0))
            df["term"] = term
            df["season"] = df.loc[df["date"].dt.month == 12, "date"].dt.year.iloc[0]
            frames.append(df[["date", "term", "season", "interest"]])
    t = pd.concat(frames, ignore_index=True)
    t["weeks_before_event"] = weeks_before(t["date"], t["season"])
    sept = t[t["date"].dt.month == 9].groupby(["term", "season"])["interest"].mean().rename("sept_avg")
    t = t.join(sept, on=["term", "season"])
    t["vs_september"] = t["interest"] / t["sept_avg"]

    profile = t.groupby(["term", "weeks_before_event"])["vs_september"].mean().reset_index()
    profile = profile[profile["weeks_before_event"].between(0, 16)].copy()
    profile["x"] = -profile["weeks_before_event"]
    profile["category"] = profile["term"].map(names)
    profile["pct"] = ((profile["vs_september"] - 1) * 100).round(0)

    fig = px.line(profile, x="x", y="vs_september", facet_col="category", facet_col_wrap=3,
                  category_orders={"category": list(names.values())},
                  custom_data=["weeks_before_event", "pct"], facet_row_spacing=0.14,
                  facet_col_spacing=0.05)
    theme(fig, 600)
    fig.update_traces(line=dict(color=RED, width=3),
                      hovertemplate="%{customdata[0]:.0f} weeks before Christmas<br>"
                                    "%{y:.2f}× September (%{customdata[1]:+.0f}%)<extra></extra>")
    fig.for_each_annotation(lambda a: a.update(text=f"<b>{a.text.split('=')[-1]}</b>", font_size=15))
    fig.add_hline(y=1, line=dict(color=GREY, width=1, dash="dot"))
    fig.add_vline(x=-5, line=dict(color=GOLD, width=2, dash="dash"), opacity=1)
    fig.add_vline(x=0, line=dict(color=GREEN, width=2), opacity=1)
    fig.update_xaxes(tickvals=[-16, -12, -8, -4, 0], ticktext=["16", "12", "8", "4", "0"], title_text="")
    fig.update_yaxes(title_text="", tickformat=".1f", ticksuffix="×",
                     range=[0.85, max(2.2, profile["vs_september"].max() + 0.1)])
    fig.add_annotation(text="weeks before Christmas  ·  gold dashed line = Black Friday week  ·  "
                            "green line = Christmas",
                       x=0.5, y=-0.12, xref="paper", yref="paper", showarrow=False,
                       font=dict(size=13, color="#52514e"))
    fig.update_layout(margin=dict(t=50, l=50, r=20, b=80))
    return fig


def main():
    charts = {
        "heatmap": heatmap(),
        "category-profile": category_profile(),
        "holiday-growth": holiday_growth(),
        "christmas-signals": christmas_signals(),
        "category-searches": category_searches(),
    }
    payload = {k: json.loads(fig.to_json()) for k, fig in charts.items()}
    (SITE / "js" / "chart-data.js").write_text(
        "// Generated by build_charts.py - do not edit by hand.\n"
        f"window.IRON_FACT_CHARTS = {json.dumps(payload, separators=(',', ':'))};\n",
        encoding="utf-8",
    )
    vendor = SITE / "js" / "vendor"
    vendor.mkdir(exist_ok=True)
    shutil.copy(Path(plotly.__file__).parent / "package_data" / "plotly.min.js", vendor / "plotly.min.js")
    print(f"Wrote {len(charts)} charts to js/chart-data.js")


if __name__ == "__main__":
    main()
