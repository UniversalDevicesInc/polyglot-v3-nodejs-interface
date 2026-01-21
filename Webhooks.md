# Configuring a Node Server to use Webhooks

The Node.js interface now supports webhooks from external services, providing parity with the Python interface.

## Requirements

This feature is only available on eisy and polisy using PG3x.

PG3 remote access must be configured and active. To configure this:
1. Login to https://my.isy.io
2. Under your ISY, select: Tools → Maintenance → PG3 remote access
3. Make sure Remote access is active

**Note:** Configuring remote access will reboot your eisy/polisy.

If events are not sent to your node server, make sure you are running the latest version and proceed with a reconfiguration of remote access.

## Endpoint

### For Webhooks Requiring a Response

Use this endpoint for webhooks that need a custom response:
```
https://my.isy.io/api/eisy/pg3/webhook/response/<uuid>/<slot>
```

### For Webhooks Not Requiring a Response

For webhooks that only need an HTTP 200 response:
```
https://my.isy.io/api/eisy/pg3/webhook/noresponse/<uuid>/<slot>
```

Both endpoints support all HTTP methods: GET, POST, PUT, DELETE, etc.

**Important:** The endpoint does not perform any authentication. Your node server is responsible for validating that the request is legitimate.

## Node Server Implementation

### Basic Webhook Handler

```javascript
import Polyglot from 'udi-interface';

const poly = new Polyglot.Interface([ControllerNode]);

// Subscribe to webhook events
poly.on('webhook', (data) => {
  const logger = Polyglot.logger;
  
  logger.info('Webhook received:', data);
  
  // Access webhook data
  const headers = data.headers;
  const query = data.query;
  const body = data.body;
  const method = data.method;
  
  // Validate the webhook
  if (!isValidWebhook(data)) {
    logger.warn('Invalid webhook received');
    poly.webhookResponse('Invalid request', 403);
    return;
  }
  
  // Process the webhook
  processWebhookData(data);
  
  // Send response (if using /response endpoint)
  const response = {
    status: 'success',
    message: 'Webhook processed'
  };
  poly.webhookResponse(response, 200);
});

function isValidWebhook(data) {
  // Implement your validation logic here
  // For example, check for a secret token in headers
  const secret = data.headers['x-webhook-secret'];
  return secret === 'your-secret-token';
}

function processWebhookData(data) {
  // Process the webhook payload
  // Update node states, trigger actions, etc.
}

poly.start();
```

### Webhook Response

If you're using the `/response` endpoint, you can send a custom response:

```javascript
poly.on('webhook', (data) => {
  try {
    // Process webhook
    const result = processWebhook(data);
    
    // Send success response
    poly.webhookResponse({
      success: true,
      result: result
    }, 200);
  } catch (error) {
    // Send error response
    poly.webhookResponse({
      success: false,
      error: error.message
    }, 500);
  }
});
```

### Available Webhook Data

The webhook event provides the following data:

```javascript
{
  headers: {
    'content-type': 'application/json',
    'x-custom-header': 'value',
    // ... other headers
  },
  query: {
    'param1': 'value1',
    'param2': 'value2',
    // ... query parameters
  },
  body: {
    // Request body (parsed as JSON if content-type is application/json)
  },
  method: 'POST' // HTTP method used
}
```

## Example: GitHub Webhook

```javascript
poly.on('webhook', (data) => {
  const logger = Polyglot.logger;
  
  // Validate GitHub signature
  const signature = data.headers['x-hub-signature-256'];
  if (!validateGitHubSignature(data.body, signature)) {
    logger.warn('Invalid GitHub webhook signature');
    poly.webhookResponse('Invalid signature', 403);
    return;
  }
  
  // Process GitHub event
  const event = data.headers['x-github-event'];
  
  switch (event) {
    case 'push':
      handlePushEvent(data.body);
      break;
    case 'pull_request':
      handlePullRequestEvent(data.body);
      break;
    default:
      logger.info(`Unhandled GitHub event: ${event}`);
  }
  
  poly.webhookResponse({ status: 'processed' }, 200);
});

function validateGitHubSignature(body, signature) {
  // Implement GitHub signature validation
  // See: https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
  const crypto = require('crypto');
  const secret = 'your-webhook-secret';
  
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(JSON.stringify(body)).digest('hex');
  
  return signature === digest;
}
```

## Example: IFTTT Webhook

```javascript
poly.on('webhook', (data) => {
  const logger = Polyglot.logger;
  
  // IFTTT sends data in the body
  const trigger = data.body.trigger;
  const value1 = data.body.value1;
  const value2 = data.body.value2;
  const value3 = data.body.value3;
  
  logger.info(`IFTTT trigger: ${trigger}`);
  
  // Update node based on trigger
  const node = poly.getNode('your_node_address');
  if (node) {
    node.setDriver('ST', value1);
  }
  
  // IFTTT doesn't require a custom response, but we can send one
  poly.webhookResponse('OK', 200);
});
```

## Security Considerations

1. **Always validate webhook requests**: Check for secret tokens, signatures, or other authentication mechanisms
2. **Use HTTPS**: The my.isy.io endpoints use HTTPS automatically
3. **Limit webhook processing**: Implement rate limiting if needed
4. **Validate input data**: Never trust webhook data without validation
5. **Handle errors gracefully**: Ensure webhook processing errors don't crash your node server

## Debugging Webhooks

Enable debug logging to see webhook details:

```javascript
const logger = Polyglot.logger;

poly.on('webhook', (data) => {
  logger.debug('Webhook headers:', JSON.stringify(data.headers, null, 2));
  logger.debug('Webhook query:', JSON.stringify(data.query, null, 2));
  logger.debug('Webhook body:', JSON.stringify(data.body, null, 2));
  logger.debug('Webhook method:', data.method);
  
  // Your webhook processing...
});
```

## Testing Webhooks

You can test webhooks using curl:

```bash
# Test with the /noresponse endpoint
curl -X POST \
  https://my.isy.io/api/eisy/pg3/webhook/noresponse/<uuid>/<slot> \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Test with the /response endpoint
curl -X POST \
  https://my.isy.io/api/eisy/pg3/webhook/response/<uuid>/<slot> \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

Replace `<uuid>` and `<slot>` with your node server's UUID and slot number.
