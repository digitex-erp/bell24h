# Perplexity API Client

A TypeScript client for interacting with the Perplexity API with built-in rate limiting, retries, and error handling.

## Installation

1. Install the required dependencies:

```bash
npm install dotenv node-fetch@2
```

2. Create a `.env` file in your project root with your API key:

```env
PERPLEXITY_API_KEY=your_api_key_here
```

## Features

- **Chat Completions**: Full support for Perplexity's chat completion API
- **Rate Limiting**: Built-in request queue and rate limiting
- **Automatic Retries**: Configurable retries with exponential backoff
- **Type Safety**: Full TypeScript support with type definitions
- **Error Handling**: Comprehensive error handling with status codes and messages

## Usage

### Basic Example

```typescript
import { PerplexityClient } from './lib/perplexity.js';

// Initialize the client with rate limiting (20 requests per minute)
const client = new PerplexityClient({
  apiKey: process.env.PERPLEXITY_API_KEY,
  rateLimitPerMinute: 20,
  maxRetries: 3,
  retryDelay: 1000, // 1 second
});

// Simple chat
const response = await client.chat(
  'What is the capital of France?',
  'You are a helpful assistant.'
);
console.log(response);

// Advanced chat completion
const completion = await client.createChatCompletion({
  model: 'sonar-small-chat',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is the capital of France?' }
  ],
  temperature: 0.7,
  max_tokens: 150,
});
console.log(completion.choices[0]?.message?.content);
```

## API Reference

### `PerplexityClient`

#### Constructor

```typescript
new PerplexityClient(config: PerplexityConfig)
```

**Parameters:**

- `config` (Object): Configuration object
  - `apiKey` (string): Your Perplexity API key (required)
  - `baseUrl` (string, optional): Base URL for the API (default: 'https://api.perplexity.ai')
  - `maxRetries` (number, optional): Maximum number of retry attempts (default: 3)
  - `retryDelay` (number, optional): Initial delay between retries in ms (default: 1000)
  - `rateLimitPerMinute` (number, optional): Maximum requests per minute (default: 50)

#### Methods

##### `testConnection()`

Tests the connection to the Perplexity API and returns available models.

**Returns:** `Promise<{ data: Model[] }>`

##### `chat(message: string, systemMessage?: string, options?: ChatOptions)`

Sends a single message and returns the assistant's response.

- `message` (string): The user's message
- `systemMessage` (string, optional): System message to set the assistant's behavior
- `options` (Object, optional): Additional options
  - `model` (string): Model to use (default: 'sonar-small-chat')
  - Other chat completion options

**Returns:** `Promise<string>` The assistant's response

##### `createChatCompletion(options: ChatCompletionOptions)`

Creates a chat completion with full control over the conversation.

- `options` (Object):
  - `model` (string): The model to use
  - `messages` (Message[]): Array of message objects
  - `temperature` (number, optional): Controls randomness (0-2)
  - `max_tokens` (number, optional): Maximum number of tokens to generate
  - `stream` (boolean, optional): Whether to stream the response (default: false)
  - Other chat completion options

**Returns:** `Promise<ChatCompletionResponse>`

##### `getRequestCount()`

Gets the total number of requests made.

**Returns:** `number`

##### `resetRequestCount()`

Resets the request counter.

##### `getQueueLength()`

Gets the current number of queued requests.

**Returns:** `number`

## Running the Example

1. Make sure you have a `.env` file with your API key
2. Run the example script:

```bash
node --loader tsx src/examples/testPerplexity.ts
```

## Error Handling

The client throws detailed errors for API request failures:

```typescript
try {
  const result = await client.createChatCompletion({
    model: 'invalid-model',
    messages: [{ role: 'user', content: 'Test' }]
  });
} catch (error) {
  if ('status' in error) {
    console.error(`Status: ${error.status}`);
  }
  if ('code' in error) {
    console.error(`Code: ${error.code}`);
  }
  console.error('Error:', error.message);
}
```

## Rate Limiting

The client includes built-in rate limiting to prevent hitting API rate limits:

```typescript
// 10 requests per minute
const client = new PerplexityClient({
  apiKey: process.env.PERPLEXITY_API_KEY,
  rateLimitPerMinute: 10
});

// Queue multiple requests
const promises = Array(15).fill(0).map((_, i) => 
  client.chat(`Message ${i}`)
    .then(() => console.log(`Request ${i} completed`))
);

await Promise.all(promises);
```

## Retry Logic

Failed requests are automatically retried with exponential backoff:

```typescript
// Custom retry settings
const client = new PerplexityClient({
  apiKey: process.env.PERPLEXITY_API_KEY,
  maxRetries: 5,          // Up to 5 retry attempts
  retryDelay: 2000,        // Start with 2 second delay
  rateLimitPerMinute: 20
});
```

## License

MIT
