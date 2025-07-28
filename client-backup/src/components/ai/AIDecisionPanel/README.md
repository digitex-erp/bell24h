# AIDecisionPanel

A React component that displays AI analysis results with confidence scores, recommendations, and interactive controls.

## Features

- Displays AI analysis with confidence score visualization
- Shows detailed reasoning and recommendations
- Supports collapsible content
- Handles loading and error states
- Auto-fetches analysis on mount (configurable)
- Refresh functionality
- Fully typed with TypeScript

## Installation

```bash
# If using npm
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material

# If using yarn
yarn add @mui/material @emotion/react @emotion/styled @mui/icons-material
```

## Usage

```tsx
import { AIDecisionPanel } from './components/ai';

// Basic usage
<AIDecisionPanel 
  context={{ /* your context data */ }} 
  modelType="rfq_analysis" 
/>

// With callbacks and custom title
<AIDecisionPanel
  context={{ /* your context data */ }}
  modelType="rfq_analysis"
  title="Custom Title"
  onDecision={(decision) => console.log('Decision:', decision)}
  onError={(error) => console.error('Error:', error)}
  autoFetch={true}
  collapsible={true}
  showRefresh={true}
  className="custom-class"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `context` | `AIRequestContext` | **Required** | The context data for the AI decision |
| `modelType` | `ModelType` | **Required** | The type of AI model to use |
| `onDecision` | `(decision: AIDecision) => void` | `undefined` | Callback when a decision is made |
| `onError` | `(error: Error) => void` | `undefined` | Error handler |
| `className` | `string` | `''` | Additional CSS class |
| `autoFetch` | `boolean` | `true` | Whether to auto-fetch the decision on mount |
| `collapsible` | `boolean` | `true` | Whether the panel can be expanded/collapsed |
| `showRefresh` | `boolean` | `true` | Whether to show the refresh button |
| `title` | `string` | `'AI Analysis'` | Custom title |
| `subtitle` | `string` | `''` | Custom subtitle |

## Styling

The component uses Material-UI's styling system. You can override the styles using the `sx` prop or by using the `className` prop with your own CSS.

## Testing

Run tests with:

```bash
npm test AIDecisionPanel
# or
yarn test AIDecisionPanel
```

## License

MIT
