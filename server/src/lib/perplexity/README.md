# Perplexity API Client

A TypeScript client for interacting with the Perplexity API, featuring rate limiting, retries, and comprehensive error handling.

## Features

- **Chat Completions**: Full support for Perplexity's chat completion API
- **Rate Limiting**: Built-in request queue and rate limiting
- **Automatic Retries**: Configurable retries with exponential backoff
- **Type Safety**: Full TypeScript support with type definitions
- **Error Handling**: Comprehensive error handling with status codes and messages

## Installation

1. Install the required dependencies:

```bash
npm install dotenv node-fetch@2
```

2. Add your Perplexity API key to the `.env` file:

```env
PERPLEXITY_API_KEY=your_api_key_here
```

## Usage

### Basic Chat

```typescript
import { PerplexityClient } from './lib/perplexity';

const client = new PerplexityClient({
  apiKey: process.env.PERPLEXITY_API_KEY,
  rateLimitPerMinute: 20,
  maxRetries: 3
});

const response = await client.chat(
  'What is the capital of France?',
  'You are a helpful assistant.'
);

console.log(response);
```

### Advanced Usage

```typescript
const completion = await client.createChatCompletion({
  model: 'sonar-small-chat',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Tell me about AI' }
  ],
  temperature: 0.7,
  max_tokens: 150
});

console.log(completion.choices[0]?.message?.content);
```

## Running the Demo

A demo script is available at `src/examples/perplexityDemo.ts` that demonstrates:

1. Basic chat functionality
2. Advanced chat completions
3. Rate limiting with multiple concurrent requests
4. Error handling

To run the demo:

```bash
npx tsx src/examples/perplexityDemo.ts
```

## Error Handling

The client throws detailed errors for API request failures:

```typescript
try {
  await client.chat('Hello', 'You are helpful');
} catch (error: any) {
  console.error(`Error: ${error.status} - ${error.message}`);
  if (error.code) console.error(`Code: ${error.code}`);
}
```

## Rate Limiting

The client includes built-in rate limiting to prevent hitting API rate limits:

```typescript
const client = new PerplexityClient({
  apiKey: process.env.PERPLEXITY_API_KEY,
  rateLimitPerMinute: 20,  // 20 requests per minute
  maxRetries: 3,           // Maximum retry attempts
  retryDelay: 1000         // Initial delay between retries in ms
});
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

##### `chat(message: string, systemMessage?: string, options?: ChatOptions)`

Sends a single message and returns the assistant's response.

**Parameters:**
- `message` (string): The user's message
- `systemMessage` (string, optional): System message to set the assistant's behavior
- `options` (Object, optional): Additional options
  - `model` (string): Model to use (default: 'sonar-small-chat')
  - Other chat completion options

**Returns:** `Promise<string>` The assistant's response

##### `createChatCompletion(options: ChatCompletionOptions)`

Creates a chat completion with full control over the conversation.

**Parameters:**
- `options` (Object):
  - `model` (string): The model to use
  - `messages` (Message[]): Array of message objects
  - `temperature` (number, optional): Controls randomness (0-2)
  - `max_tokens` (number, optional): Maximum number of tokens to generate
  - `stream` (boolean, optional): Whether to stream the response (default: false)
  - Other chat completion options

**Returns:** `Promise<ChatCompletionResponse>`

## License

MIT
