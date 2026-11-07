# Holidays
Introduction

Iron Fact will show a US online marketplace when Americans spend, which product categories gain most from the holiday season, and how early campaigns should start — using official Census sales data, the FRED API and Google Trends.

# Business problem
Iron Fact has been hired by the marketing team of a US online marketplace. They want to know which product categories to focus on in their holiday campaigns, and when to start them.

# Hypothesis

US retail spending follows a clear yearly pattern: November–December is the biggest peak, and spikes coincide with holidays

The holiday peak is driven by gift categories, not everyday categories.

People start preparing weeks before the holiday: interest rises from October, before sales peak.

# Method rules 
Period: 2020–2025 only; no 2026 (unfinished season).
Not seasonally adjusted data only (FRED codes ending in USN); seasonal adjustment removes the holiday peak.
Seasonal index = month's sales ÷ that year's average monthly sales; 1.00 = a normal month. 
Google Trends scores are relative (0–100) per download: compare timing and shape across files, not heights. Keep terms, order and settings identical per season.
Fixed colours per category in every chart; grocery in grey as the comparison group.

# Limitation

Google Trends shows relative search interest, not purchases.
Sales are in current dollars; part of growth is inflation.

# Sources

FRED: Retail sales excl. motor vehicles and gas stations (MRTSSM44W72USN)
FRED: Hobby, toy and game stores (MRTSSM45112USN)
FRED: Clothing and accessory stores (MRTSSM448USN)
FRED: Electronics and appliance stores (MRTSSM443USN)
FRED: Electronic shopping and mail-order (MRTSSM4541USN)
FRED: Grocery stores (MRTSSM4451USN)

# Google trends:how we use it in this project

Google Trends shows how popular a search term is over time. We use it to answer one part of the business question:
How early does holiday shopping start?
Official sales data (US Census / FRED) tells us how much more people spend in November–December. Google Trends tells us when people start thinking about it, often weeks before they buy.

1. What the Google Trends numbers mean
Every download gives one number per week, from 0 to 100.
100 = the busiest week in that file. All other weeks are a share of that week (50 = half as many searches as the busiest week).
The numbers are relative, not counts. "44" does not mean 44 searches.
Every download has its own scale. A 50 in one file is not the same as a 50 in another file.
<1 means "very few searches". We replace it with 0.

Consequence for our analysis: We never compare raw numbers between files or between terms. We only compare each term with its own normal level (see section 4).

2. How to download the data

Go to trends.google.com → Explore and use exactly these settings every time:

Setting	Value
Search term	one term per download (do not compare terms in one chart)
Country	United States
Time range	Custom: 1 September YEAR – 31 December YEAR
Category	All categories
Search type	Web search
Seasons	2020, 2021, 2022, 2023, 2024, 2025 (no 2026: incomplete season)

Then download the "Interest over time" CSV and rename it to the year (e.g. 2023.csv).

Why one term per download? If several terms are in one chart, the biggest term becomes 100 and small terms are squashed to 0–5. At that size one rounding step is a 20–100% change, so their timing can't be measured. Alone, each term gets its own full 0–100 scale.

Why one season per download? For time ranges longer than 5 years Google gives monthly instead of weekly values, which is too coarse to find a start week. One season (Sep–Dec) also keeps every file on the same footing.

3. Folder structure

Each set lives in its own folder. Files from different sets are never mixed, because they were scaled differently.
Set 1 contains five terms in one chart. Only "christmas" is used from it, because it is the biggest term (it reaches 100 in every file). The other terms in Set 1 are too squashed to use.
Set 2 contains product categories that match the categories in the sales data.

4. The method: when does the season start?

Think of a shop. In September it has a normal number of visitors. As the holidays get closer it gets busier. We want the first week that is clearly busier than normal, and stays busier until the peak.

For every term and every season:

<img width="429" height="197" alt="image" src="https://github.com/user-attachments/assets/2c378162-3d34-4983-a9a1-a02a4b04b126" />


Why "stays above until the peak"? So that a one-off spike (e.g. one Black Friday week) does not count as the start of the season. The start must begin a real, continuous build-up.

Why September as normal level? September is after summer and before any holiday shopping, so it shows everyday interest in the term.

5. What the factor means

The factor is our definition of "clearly busier than normal". It is a multiplier on the normal level:

<img width="434" height="99" alt="image" src="https://github.com/user-attachments/assets/31ff09f7-eece-41ab-9ce4-991056f8dfc1" />

A higher factor is stricter: interest has to rise more before we say the season has started, so the start comes later.

Our choice:

Factor 2 for holiday words ("christmas"). They are almost silent in September and rise about 20× by December, so doubling happens early and clearly.
Factor 1.5 for product categories ("toys", "clothing", …). People search for them all year (birthdays, everyday shopping), so even at the holiday peak they rise only about 1.4–2×. With factor 2, the "start" would fall on the peak week itself, or never be reached.
The factor is a ratio, so it doesn't depend on the scale of the file. If toys go from 27 to 54 in one download and from 50 to 100 in another, both are 2×, and the start week is the same.

Worked example: "toys", US, 2024
Normal level = September average = (26 + 26 + 27 + 27 + 29) ÷ 5 = 27

<img width="436" height="140" alt="image" src="https://github.com/user-attachments/assets/f8b2eb53-8814-4693-b4d4-c83a11b144a7" />

So for toys, factor 1.5 shows the build-up starting about 5 weeks before Christmas. Factor 2 only finds the peak.

Robustness check
We also run the timing with factor 1.3 and 2. If the order of the categories (which starts earliest) stays the same, our conclusion doesn't depend on the exact factor. If it changes, we report that in the limitations.

6. What an empty result (NaN) means

If a term never reaches the threshold, or only for a single isolated week, the start is NaN for that season. That isn't an error. It's a finding: this category has no clear holiday build-up in searches (for example only a one-week Black Friday spike).

Limitations
Google Trends is a sample of searches and is relative. It shows when interest rises, not how many people buy.
Values are rounded to whole numbers, so small changes in low values are noise.
A search term can have several meanings ("books" = school, reading, gifts). We use broad category words to match the sales categories, but they also include non-holiday searches.
Downloading the same file again later can give slightly different numbers (Google re-samples). We keep the files we downloaded and don't mix them with new ones.
Search interest is a signal of intent. People may search weeks before they buy, or buy without searching.



