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


