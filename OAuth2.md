# Configuring a Node Server to use OAuth2 authentication

The Node.js interface now supports OAuth2 authentication with external services, providing parity with the Python interface.

## Configuration on the Remote Service

Before configuring your node server, you need to configure an OAuth client on the service you want to integrate to. When configuring the client, one of the parameters that will be asked is the redirect URL.

Please use this redirect URL: **https://my.isy.io/api/cloudlink/redirect**

## PG3 Configuration

To enable OAuth2 functionality, edit your store entry and select the "Enable OAuth2" checkbox. This will add the "Authenticate" button in your plugin's detail page on the dashboard.

In addition, you need to supply the OAuth configuration under "OAuth Configuration" in the store page. The JSON needs the following information:

```json
{
  "name": "name of service - this can be anything",
  "client_id": "The OAuth client ID",
  "client_secret": "The OAuth secret",
  "auth_endpoint": "The URL of the OAuth authorization endpoint",
  "token_endpoint": "The URL of the token endpoint"
}
```

### Optional OAuth Configuration Parameters

```json
{
  "scope": "The oauth scope",
  "addScope": true,
  "addRedirect": true,
  "parameters": {},
  "token_parameters": {}
}
```

- `scope`: The OAuth scope (will be added to the authorization request)
- `addScope`: Add the scope to the token endpoint (default: true)
- `addRedirect`: Add the redirect_uri to the token endpoint (default: false)
- `parameters`: Extra parameters to pass to the authorization request
- `token_parameters`: Extra parameters to pass to the token endpoint

## Using OAuth in Your Node Server

### Basic Setup

First, import and initialize the OAuth class:

```javascript
import Polyglot from 'udi-interface';
import axios from 'axios';

const logger = Polyglot.logger;

// Create your service class that extends OAuth
class MyService extends Polyglot.OAuth {
  constructor(polyInterface) {
    super(polyInterface);
    this.poly = polyInterface;
  }

  // The OAuth class needs to be hooked to these 2 handlers
  customNsHandler(key, data) {
    // This provides the OAuth config (key='oauth') and saved OAuth tokens (key='oauthTokens')
    super.customNsHandler(key, data);
  }

  oauthHandler(token) {
    // This provides initial OAuth tokens following user authentication
    super.oauthHandler(token);
  }

  // Your API calls using the access token
  async callExternalApi(endpoint) {
    try {
      // Get the access token (will be refreshed automatically if needed)
      const accessToken = await this.getAccessToken();
      
      const response = await axios.get(`https://api.example.com${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      return response.data;
    } catch (error) {
      if (error.message === 'Access token is not available') {
        logger.warn('User needs to authenticate');
        this.poly.addNotice('auth', 'Please authenticate via the dashboard');
      }
      throw error;
    }
  }
}
```

### Main Node Server Code

```javascript
import Polyglot from 'udi-interface';
import ControllerNode from './Nodes/ControllerNode.js';

const poly = new Polyglot.Interface([ControllerNode]);
const myService = new MyService(poly);

// Handle CUSTOMNS events (OAuth configuration and tokens)
poly.on('customNs', (key, data) => {
  myService.customNsHandler(key, data);
});

// Handle OAUTH events (new tokens after authentication)
poly.on('oauth', (token) => {
  myService.oauthHandler(token);
  // Proceed with device discovery after authentication
  discoverDevices();
});

// Handle initial configuration
poly.on('config', async (config) => {
  if (config.isInitialConfig) {
    try {
      // Check if user has authenticated
      const token = await myService.getAccessToken();
      // If we get here, we have a valid token
      discoverDevices();
    } catch (error) {
      // User needs to authenticate
      poly.addNotice('auth', 'Please authenticate via the Polyglot dashboard');
    }
  }
});

poly.start();
```

## Using Dynamic OAuth Configuration

If your service requires users to have their own client_id and client_secret, you can have them set via custom parameters:

```javascript
poly.on('customParams', (params) => {
  const oauthUpdate = {};
  
  if (params.client_id) {
    oauthUpdate.client_id = params.client_id;
  }
  
  if (params.client_secret) {
    oauthUpdate.client_secret = params.client_secret;
  }
  
  // Update the OAuth configuration
  myService.updateOauthSettings(oauthUpdate);
});
```

## OAuth Class Methods

### `getAccessToken(): Promise<string>`
Gets the current access token, automatically refreshing it if expired or expiring soon. Throws an error if the user hasn't authenticated yet.

**Note:** This is an async method. Always use `await` when calling it.

### `updateOauthSettings(update: OAuthConfig): void`
Updates the OAuth configuration dynamically. Useful when users provide their own client credentials.

### `getOauthSettings(): OAuthConfig`
Returns the current OAuth configuration.

## Token Refresh

The OAuth class automatically handles token refresh:
- Tokens are refreshed 60 seconds before expiry
- A timer is set up automatically when tokens are received
- If a refresh fails, existing tokens remain available

## Events

Your node server should subscribe to these events:

- `customNs`: Receives OAuth configuration and saved tokens
- `oauth`: Receives new tokens after user authentication

## Error Handling

When calling `getAccessToken()`, catch potential errors:

```javascript
try {
  const token = await myService.getAccessToken();
  // Use token
} catch (error) {
  if (error.message === 'Access token is not available') {
    // User hasn't authenticated yet
    poly.addNotice('auth', 'Please authenticate');
  }
}
```

## Migration from Previous OAuth Implementations

If you have an existing OAuth implementation, you'll need to:

1. Update token storage from `customdata.token` to the new `oauthTokens` custom
2. Change error handling since `getAccessToken()` now throws an error instead of returning `null`
3. Subscribe to the `customNs` event instead of `customData` for OAuth configuration
