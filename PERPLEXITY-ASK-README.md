# Perplexity Ask MCP Server for Bell24H.com

This document provides instructions for setting up and using the Perplexity Ask MCP Server for Bell24H.com.

## Prerequisites

- Docker and Docker Compose installed
- Node.js (for local development and testing)
- Perplexity API key

## Setup

1. **Update Environment Variables**
   - Open the `.env` file in the project root
   - Add your Perplexity API key:
     ```
     PERPLEXITY_API_KEY=your-perplexity-api-key-here
     ```

2. **Build and Start the Container**
   ```bash
   docker-compose -f docker-compose.perplexity.yml up --build -d
   ```

3. **Verify the Server**
   The server should now be running at http://localhost:3000

## Testing the API

You can test the API using the provided test script:

1. Install dependencies (if not already installed):
   ```bash
   npm install axios dotenv
   ```

2. Run the test script:
   ```bash
   node test-perplexity-api.js
   ```

## API Endpoints

### POST /ask

Send a query to the Perplexity Ask API.

**Request Body:**
```json
{
  "query": "Your question here"
}
```

**Example Response:**
```json
{
  "response": "AI-powered RFQ matching uses machine learning to connect buyers with suppliers based on criteria like price, delivery time, and past performance."
}
```

## Integration with Bell24H.com

To integrate with the Bell24H.com backend, you can proxy requests to the Perplexity Ask MCP Server:

```javascript
// Example Express route
app.post('/api/ask', async (req, res) => {
  try {
    const response = await fetch('http://perplexity-ask:3000/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error calling Perplexity API:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});
```

## Troubleshooting

- **Server not starting**: Check if the port 3000 is already in use
- **API key issues**: Verify that the `PERPLEXITY_API_KEY` is correctly set in the `.env` file
- **Docker issues**: Make sure Docker is running and has enough resources

## License

This project is part of the Bell24H.com platform. All rights reserved.
