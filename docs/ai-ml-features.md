# Bell24H.com AI/ML-Powered Features

## Overview
AI/ML features provide smart supplier recommendations and predictive analytics for RFQs.

## Features
- **Supplier Recommendations:** Suggests relevant suppliers for each RFQ (based on category, region, and value)
- **RFQ Acceptance Prediction:** Estimates the probability of an RFQ being accepted
- **API Endpoints:**
  - `POST /api/ai/rfq-recommendations` — returns recommended suppliers for a given RFQ
  - `POST /api/ai/rfq-acceptance` — returns acceptance probability for a given RFQ

## How to Use
- Access AI insights in the Analytics Dashboard.
- Integrate recommendations and predictions into RFQ workflows for smarter matching.

## How to Expand
- Replace rule-based logic with a real ML model (TensorFlow.js, Python microservice, etc.)
- Add more features: price prediction, fraud detection, personalized supplier ranking
- Collect feedback to improve model accuracy

---
For questions or improvements, contact ai@bell24h.com.
