# AI Explainability Features Documentation

## Table of Contents

1. [Overview](#overview)
2. [User Guide](#user-guide)
3. [API Documentation](#api-documentation)
4. [Developer Setup](#developer-setup)
5. [Architecture](#architecture)
6. [Testing](#testing)
7. [Accessibility](#accessibility)
8. [Troubleshooting](#troubleshooting)

## Overview

The AI Explainability features in Bell24H provide comprehensive insights into AI-driven procurement decisions. These features help users understand how and why AI systems make specific recommendations, enabling better decision-making and building trust in automated processes.

### Key Features

- **Decision Path Visualization**: Step-by-step breakdown of AI decision processes
- **Feature Importance Analysis**: Understanding which factors most influence decisions
- **Explanation History**: Historical record of all AI explanations with search and filtering
- **Real-time Updates**: Live updates via WebSocket connections
- **Export Capabilities**: Export explanations to CSV format
- **Alternative Paths**: View alternative decision scenarios and trade-offs

### Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Charts**: Recharts for data visualization
- **Real-time**: WebSocket for live updates
- **Testing**: Jest, React Testing Library, Playwright
- **Accessibility**: WCAG 2.1 AA compliant

## User Guide

### Getting Started

1. **Navigate to AI Explanations**: Go to `/ai-explanations` in the Bell24H platform
2. **View Dashboard**: The main dashboard shows metrics and recent activity
3. **Explore Explanations**: Click on any explanation to view detailed breakdowns

### Understanding AI Explanations

#### Decision Types

- **Supplier Recommendation**: AI suggests the best supplier for a given requirement
- **Price Optimization**: AI recommends optimal pricing strategies
- **RFQ Matching**: AI matches RFQs with suitable suppliers
- **Risk Assessment**: AI evaluates supplier and transaction risks
- **Quality Prediction**: AI predicts quality outcomes

#### Confidence Levels

- **Very High (90-100%)**: Highly confident recommendation
- **High (80-89%)**: Confident recommendation with minor uncertainties
- **Medium (60-79%)**: Reasonable confidence with some uncertainties
- **Low (40-59%)**: Lower confidence, consider alternatives

#### Impact Types

- **Positive**: Factor supports the decision
- **Negative**: Factor works against the decision
- **Neutral**: Factor has minimal impact

### Using the Dashboard

#### Metrics Overview

- **Total Explanations**: Number of AI explanations generated
- **Average Confidence**: Mean confidence across all decisions
- **Most Common Type**: Most frequently used decision type
- **Recent Activity**: Explanations generated in the last hour

#### Feature Importance Chart

1. **View Chart**: The chart shows the most important features across all explanations
2. **Hover for Details**: Hover over bars to see detailed information
3. **Export Data**: Click "Export CSV" to download chart data
4. **Filter by Impact**: Use the legend to filter by positive/negative/neutral impact

#### Explanation History

1. **Browse History**: View all past explanations in a paginated table
2. **Search**: Use the search bar to find specific explanations
3. **Filter**: Filter by decision type, confidence level, or date range
4. **Expand Rows**: Click the expand button to see detailed factors
5. **View Details**: Click "View Details" to see the full decision path

### Decision Path Visualization

#### Understanding the Tree

- **Root Node**: The final decision made by the AI
- **Factor Nodes**: Individual factors that influenced the decision
- **Evidence Nodes**: Supporting evidence for each factor
- **Weight Indicators**: Visual representation of factor importance

#### Interactive Features

1. **Expand/Collapse**: Click nodes to expand or collapse details
2. **Node Selection**: Click on nodes to view detailed information
3. **Alternative Paths**: Toggle to view alternative decision scenarios
4. **Color Coding**: Colors indicate impact (green=positive, red=negative, gray=neutral)

### Exporting Data

#### CSV Export

1. **Select Filters**: Apply any desired filters to your data
2. **Click Export**: Click the "Export" button
3. **Download**: The file will download automatically
4. **Format**: CSV includes all explanation data with timestamps

#### Chart Export

1. **View Chart**: Navigate to any chart visualization
2. **Export CSV**: Click "Export CSV" on the chart
3. **Download**: Chart data will download in CSV format

## API Documentation

### Base URL

```
https://your-domain.com/api/ai
```

### Authentication

All API endpoints require authentication via NextAuth.js session.

### Endpoints

#### Generate Explanation

```http
POST /api/ai/generate-explanation
```

**Request Body:**
```json
{
  "decisionType": "supplier_recommendation",
  "inputData": {
    "price": 500,
    "quality": 4.5,
    "delivery_time": 7
  },
  "includeAlternatives": true,
  "detailLevel": "comprehensive"
}
```

**Response:**
```json
{
  "id": "exp_1234567890",
  "decisionType": "supplier_recommendation",
  "timestamp": "2024-01-01T10:00:00Z",
  "inputFeatures": [...],
  "outputDecision": {...},
  "explanation": [...],
  "confidence": 85,
  "featureImportance": [...],
  "alternativeOptions": [...],
  "metadata": {...}
}
```

#### Get Explanation History

```http
GET /api/ai/explanations?page=1&pageSize=20
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 20)
- `decisionType`: Filter by decision type
- `confidenceMin`: Minimum confidence level
- `searchTerm`: Search in explanations

**Response:**
```json
{
  "explanations": [...],
  "totalCount": 100,
  "page": 1,
  "pageSize": 20,
  "hasMore": true
}
```

#### Get Explanation by ID

```http
GET /api/ai/explanations/{id}
```

**Response:**
```json
{
  "id": "exp_1234567890",
  "decisionType": "supplier_recommendation",
  "timestamp": "2024-01-01T10:00:00Z",
  "inputFeatures": [...],
  "outputDecision": {...},
  "explanation": [...],
  "confidence": 85,
  "featureImportance": [...],
  "alternativeOptions": [...],
  "metadata": {...}
}
```

#### Export Explanations

```http
POST /api/ai/explanations/export
```

**Request Body:**
```json
{
  "decisionType": ["supplier_recommendation"],
  "dateRange": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  },
  "confidenceMin": 80
}
```

**Response:** CSV file download

### WebSocket API

#### Connection

```javascript
const ws = new WebSocket('wss://your-domain.com/ai-explanations');
```

#### Subscribe to Updates

```javascript
ws.send(JSON.stringify({
  type: 'subscribe',
  userId: 'user_123'
}));
```

#### Message Format

```json
{
  "type": "new_explanation",
  "explanation": {...},
  "timestamp": "2024-01-01T10:00:00Z"
}
```

## Developer Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database
- Redis (for caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/bell24h.git
   cd bell24h/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add the following variables:
   ```env
   NEXT_PUBLIC_WS_URL=ws://localhost:3001
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Project Structure

```
src/
├── components/ai/
│   ├── ExplanationDashboard.tsx
│   ├── FeatureImportanceChart.tsx
│   ├── DecisionPathVisualization.tsx
│   ├── ExplanationHistory.tsx
│   └── __tests__/
├── services/
│   └── aiExplanation.ts
├── types/
│   └── aiExplanation.ts
└── app/api/ai/
    ├── generate-explanation/
    ├── explanations/
    └── explanations/export/
```

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/ai-explainability-enhancement
   ```

2. **Make Changes**
   - Edit components in `src/components/ai/`
   - Update types in `src/types/aiExplanation.ts`
   - Modify services in `src/services/aiExplanation.ts`

3. **Run Tests**
   ```bash
   npm run test
   npm run test:e2e
   ```

4. **Check Accessibility**
   ```bash
   npm run test:accessibility
   ```

5. **Build and Deploy**
   ```bash
   npm run build
   npm run start
   ```

## Architecture

### Component Architecture

```
ExplanationDashboard
├── FeatureImportanceChart
├── ExplanationHistory
└── QuickActions

DecisionPathVisualization
├── TreeNode
├── AlternativePaths
└── Legend

ExplanationHistory
├── SearchFilters
├── DataTable
└── Pagination
```

### Data Flow

1. **User Interaction** → Component triggers API call
2. **API Request** → Backend processes request
3. **AI Service** → Generates explanation
4. **Response** → Component updates state
5. **UI Update** → User sees updated explanation
6. **WebSocket** → Real-time updates (if enabled)

### State Management

- **Local State**: Component-specific state using React hooks
- **Server State**: API responses cached and managed
- **Real-time State**: WebSocket updates for live data

### Error Handling

- **Error Boundaries**: Catch and handle component errors
- **API Error Handling**: Graceful degradation for API failures
- **Retry Logic**: Automatic retry for failed requests
- **User Feedback**: Clear error messages and recovery options

## Testing

### Unit Tests

Run unit tests:
```bash
npm run test
```

Test coverage:
```bash
npm run test:coverage
```

### Integration Tests

Run integration tests:
```bash
npm run test:integration
```

### E2E Tests

Run E2E tests:
```bash
npm run test:e2e
```

### Accessibility Tests

Run accessibility tests:
```bash
npm run test:accessibility
```

### Test Structure

```
__tests__/
├── components/ai/
│   ├── ExplanationDashboard.test.tsx
│   ├── FeatureImportanceChart.test.tsx
│   ├── DecisionPathVisualization.test.tsx
│   └── ExplanationHistory.test.tsx
├── services/
│   └── aiExplanation.test.ts
└── e2e/
    ├── ai-explainability.spec.ts
    └── accessibility.spec.ts
```

## Accessibility

### WCAG 2.1 AA Compliance

All AI explainability components are designed to meet WCAG 2.1 AA standards:

- **Perceivable**: All information is presented in ways users can perceive
- **Operable**: All functionality is available from a keyboard
- **Understandable**: Information and operation are understandable
- **Robust**: Content is compatible with current and future user tools

### Accessibility Features

- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects user's motion preferences
- **Focus Management**: Proper focus handling in modals and overlays

### Testing Accessibility

1. **Automated Testing**: Run accessibility tests with Playwright
2. **Manual Testing**: Test with screen readers (NVDA, JAWS, VoiceOver)
3. **Keyboard Testing**: Navigate using only keyboard
4. **Color Contrast**: Verify sufficient color contrast ratios

## Troubleshooting

### Common Issues

#### API Errors

**Problem**: API calls failing with 500 errors
**Solution**: 
1. Check server logs for detailed error messages
2. Verify database connection
3. Ensure all required environment variables are set
4. Check API rate limits

#### WebSocket Connection Issues

**Problem**: Real-time updates not working
**Solution**:
1. Verify WebSocket server is running
2. Check firewall settings
3. Ensure correct WebSocket URL in environment variables
4. Check browser console for connection errors

#### Performance Issues

**Problem**: Slow loading or rendering
**Solution**:
1. Check network tab for slow API calls
2. Verify database query performance
3. Implement proper caching strategies
4. Optimize component rendering

#### Accessibility Issues

**Problem**: Screen reader not announcing content
**Solution**:
1. Verify proper ARIA labels are present
2. Check semantic HTML structure
3. Test with different screen readers
4. Ensure focus management is working

### Debug Mode

Enable debug mode by setting:
```env
NEXT_PUBLIC_DEBUG=true
```

This will show additional logging and error details.

### Support

For additional support:

1. **Documentation**: Check this documentation first
2. **Issues**: Create an issue on GitHub
3. **Discussions**: Use GitHub Discussions for questions
4. **Email**: Contact support@bell24h.com

### Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

---

**Last Updated**: January 2024
**Version**: 1.0.0 