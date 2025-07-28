# Bell24H.com Analytics Dashboard

## Overview
The Analytics Dashboard provides real-time insights into user engagement, RFQ trends, and payment statistics for Bell24H.com.

## Features
- **User Engagement:** Visualizes total users, active users, and retention rate (BarChart)
- **RFQ Trends:** Shows monthly RFQ activity (LineChart)
- **Payment Stats:** Displays completed vs failed payments (PieChart)

## How to Use
- Access the dashboard at `/analytics-dashboard` in the app.
- Charts are interactive and update with backend data.
- Data is fetched from `/api/analytics/user-engagement`, `/api/analytics/rfq-trends`, and `/api/analytics/payment-stats`.

## How to Expand
- Add new charts by extending `AnalyticsDashboard.tsx` and backend endpoints.
- Integrate advanced analytics (e.g., cohort analysis, conversion funnels).
- Connect to external analytics sources if needed.

---
For questions or improvements, contact analytics@bell24h.com.
