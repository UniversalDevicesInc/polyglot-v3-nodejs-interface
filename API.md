# UDI Node.js Interface API Documentation

This document provides comprehensive API documentation for the UDI Node.js Interface (udi-interface) for Polyglot v3.

## Table of Contents

1. [Interface Class](#interface-class)
2. [Node Class](#node-class)
3. [OAuth Class](#oauth-class)
4. [Events](#events)
5. [Logger](#logger)

---

## Interface Class

The Interface class is the main class for communicating with Polyglot v3 via MQTT.

### Constructor

```javascript
new Interface(declaredNodeClasses)
```

**Parameters:**
- `declaredNodeClasses` (Array): Array of Node class definitions

**Example:**
```javascript
const poly = new Polyglot.Interface([ControllerNode, MyNode]);
```

### Core Methods

#### `start()`
Initiates the MQTT connection and starts communicating with Polyglot.

```javascript
await poly.start();
```

#### `ready()`
Queries PG3 for initial configuration info. Should be called after MQTT connection is established.

```javascript
poly.ready();
```

#### `stop()`
Stops the MQTT connection.

```javascript
poly.stop();
```

#### `isConnected()`
Returns true if the NodeServer and Polyglot are connected via MQTT.

```javascript
if (poly.isConnected()) {
  // Send messages
}
```

#### `restart()`
Requests Polyglot to restart this NodeServer.

```javascript
poly.restart();
```

### Configuration Methods

#### `getConfig()`
Returns a copy of the last config received.

```javascript
const config = poly.getConfig();
```

#### `setLogLevel(level)`
Sets the log level.

**Parameters:**
- `level` (string): One of 'DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'

```javascript
poly.setLogLevel('DEBUG');
```

### Node Management Methods

#### `addNode(node)`
Adds a new node to Polyglot and ISY.

**Parameters:**
- `node` (Node): Instance of a Node class

**Returns:** Promise that resolves when node is added

```javascript
const newNode = new MyNode(poly, primaryAddress, address, name);
await poly.addNode(newNode);
```

#### `getNodes()`
Returns all nodes with classes applied.

```javascript
const nodes = poly.getNodes();
```

#### `getNode(address)`
Returns a single node by address.

**Parameters:**
- `address` (string): Node address

```javascript
const node = poly.getNode('controller');
```

#### `delNode(node)`
Deletes a node from Polyglot and ISY.

**Parameters:**
- `node` (Node): Node instance to delete

```javascript
poly.delNode(node);
```

#### `renameNode(address, newName)`
Renames a node.

**Parameters:**
- `address` (string): Node address
- `newName` (string): New name for the node

```javascript
poly.renameNode('node001', 'Living Room Light');
```

#### `getNodesFromDb(address)`
Returns node information from PG3 database.

**Parameters:**
- `address` (string|string[]|null): Node address(es) or null for all nodes

```javascript
// Get all nodes from DB
const allNodes = poly.getNodesFromDb();

// Get single node
const node = poly.getNodesFromDb('controller');

// Get multiple nodes
const nodes = poly.getNodesFromDb(['node001', 'node002']);
```

#### `getNodeNameFromDb(address)`
Returns the name of a node from the database.

**Parameters:**
- `address` (string): Node address

```javascript
const name = poly.getNodeNameFromDb('node001');
```

#### `getValidName(name)`
Returns a cleaned node name with illegal characters removed.

**Parameters:**
- `name` (string): Node name to clean

```javascript
const cleanName = poly.getValidName('My Node @#$');
// Returns: 'My Node '
```

#### `getValidAddress(address)`
Returns a cleaned node address with illegal characters removed and truncated to 14 characters.

**Parameters:**
- `address` (string): Node address to clean

```javascript
const cleanAddress = poly.getValidAddress('my_node_address_123');
// Returns: 'my_node_addres'
```

#### `*nodes()`
Generator function to iterate over all nodes.

```javascript
for (const node of poly.nodes()) {
  console.log(node.address);
}
```

### Notice Methods

#### `getNotices()`
Returns the current list of Polyglot notices.

```javascript
const notices = poly.getNotices();
```

#### `addNotice(key, text)`
Adds a notice to the Polyglot UI.

**Parameters:**
- `key` (string): Unique key for the notice
- `text` (string): Notice text

```javascript
poly.addNotice('config_error', 'Missing API key in configuration');
```

#### `addNoticeTemp(key, text, delaySec)`
Adds a temporary notice that auto-removes after specified seconds.

**Parameters:**
- `key` (string): Unique key for the notice
- `text` (string): Notice text
- `delaySec` (number): Seconds before auto-removal

```javascript
poly.addNoticeTemp('updating', 'Updating devices...', 5);
```

#### `removeNotice(key)`
Removes a specific notice.

**Parameters:**
- `key` (string): Key of the notice to remove

```javascript
poly.removeNotice('config_error');
```

#### `removeNoticesAll()`
Removes all notices.

```javascript
poly.removeNoticesAll();
```

### Custom Parameters Methods

#### `getCustomParams()`
Returns all custom parameters from the UI.

```javascript
const params = poly.getCustomParams();
```

#### `getCustomParam(key)`
Returns a specific custom parameter.

**Parameters:**
- `key` (string): Parameter key

```javascript
const apiKey = poly.getCustomParam('api_key');
```

#### `saveCustomParams(params)`
Saves custom parameters (overwrites existing).

**Parameters:**
- `params` (object): Parameters object

```javascript
poly.saveCustomParams({
  api_key: 'abc123',
  refresh_interval: '60'
});
```

#### `addCustomParams(params)`
Adds custom parameters (merges with existing).

**Parameters:**
- `params` (object): Parameters object to add

```javascript
poly.addCustomParams({ new_param: 'value' });
```

#### `removeCustomParams(key)`
Removes a custom parameter.

**Parameters:**
- `key` (string): Parameter key to remove

```javascript
poly.removeCustomParams('old_param');
```

#### `saveTypedParams(typedParams)`
Saves typed parameter definitions for the UI.

**Parameters:**
- `typedParams` (array): Array of parameter definitions

```javascript
poly.saveTypedParams([
  { name: 'host', title: 'Host', isRequired: true },
  { name: 'port', title: 'Port', type: 'NUMBER', isRequired: true }
]);
```

#### `getTypedData()`
Returns the current typed parameter data.

```javascript
const data = poly.getTypedData();
```

#### `setCustomParamsDoc(html)`
Sets the HTML documentation for custom parameters.

**Parameters:**
- `html` (string): HTML content

```javascript
poly.setCustomParamsDoc('<h1>Configuration Help</h1><p>Instructions...</p>');
```

### Custom Data Methods

#### `getCustomData(key)`
Returns custom data by key, or all data if key is null.

**Parameters:**
- `key` (string|null): Data key or null

```javascript
const allData = poly.getCustomData();
const specific = poly.getCustomData('device_list');
```

#### `saveCustomData(data)`
Saves custom data (overwrites existing).

**Parameters:**
- `data` (object): Data object

```javascript
poly.saveCustomData({ devices: [...] });
```

#### `addCustomData(data)`
Adds custom data (merges with existing).

**Parameters:**
- `data` (object): Data object to add

```javascript
poly.addCustomData({ last_update: Date.now() });
```

#### `removeCustomData(key)`
Removes a custom data entry.

**Parameters:**
- `key` (string): Data key to remove

```javascript
poly.removeCustomData('old_data');
```

### Profile Methods

#### `updateProfile()`
Sends the latest profile to ISY from the profile folder.

```javascript
poly.updateProfile();
```

#### `getJsonProfile(options)`
Gets the profile in JSON format from PG3.

**Parameters:**
- `options` (object): Options object
  - `waitResponse` (boolean): If true, waits for and returns the profile

```javascript
// Async wait for profile
const profile = await poly.getJsonProfile({ waitResponse: true });

// Fire and forget (listen to 'profile' event)
poly.getJsonProfile();
```

#### `updateJsonProfile(profile, options)`
Updates the profile with nodedefs/editors/linkdefs.

**Parameters:**
- `profile` (object): Profile object to update
- `options` (object): Options object
  - `waitResponse` (boolean): If true, waits for completion

```javascript
await poly.updateJsonProfile({
  nodedefs: [...],
  editors: [...]
}, { waitResponse: true });
```

### Polling Methods

#### `setPoll(shortPoll, longPoll)`
Sets the short and/or long poll intervals.

**Parameters:**
- `shortPoll` (number|null): Short poll interval in seconds
- `longPoll` (number|null): Long poll interval in seconds

```javascript
poly.setPoll(30, 300);  // 30 seconds short, 5 minutes long
poly.setPoll(60, null); // Only change short poll
```

### Connection Status Methods

#### `setController(address, driver)`
Tells PG3 which node and driver to update with connection status.

**Parameters:**
- `address` (string): Node address
- `driver` (string): Driver name

```javascript
poly.setController('controller', 'ST');
```

### Notification Methods

#### `udm_alert(title, body)`
Sends a push notification to UD Mobile.

**Parameters:**
- `title` (string): Notification title
- `body` (string): Notification body

```javascript
poly.udm_alert('Device Alert', 'Motion detected in living room');
```

### Webhook Methods

#### `webhookResponse(response, status)`
Sends a response to a webhook request.

**Parameters:**
- `response` (any): Response data
- `status` (number): HTTP status code (default: 200)

```javascript
poly.webhookResponse({ success: true }, 200);
```

### Bonjour/mDNS Methods

#### `bonjour(type, protocol, subtypes)`
Sends a bonjour/mDNS query on the local network.

**Parameters:**
- `type` (string): Service type
- `protocol` (string): Protocol (default: '_tcp')
- `subtypes` (array): Subtypes (default: [])

```javascript
poly.bonjour('_http', '_tcp', []);
```

### ISY Communication

#### `ISY()`
Returns an ISY instance for direct ISY communication.

```javascript
const isy = poly.ISY();
if (isy) {
  const nodes = await isy.nodes();
}
```

---

## Node Class

Base class that all custom nodes must inherit from.

### Constructor

```javascript
constructor(nodeDefId, polyInterface, primary, address, name)
```

**Parameters:**
- `nodeDefId` (string): Node definition ID
- `polyInterface` (Interface): Interface instance
- `primary` (string): Primary node address
- `address` (string): This node's address
- `name` (string): Node name

### Properties

- `id` (string): Node definition ID
- `polyInterface` (Interface): Interface instance
- `primary` (string): Primary node address
- `address` (string): Node address
- `name` (string): Node name
- `timeAdded` (Date): When node was added
- `enabled` (boolean): Is node enabled
- `added` (boolean): Is node added to ISY
- `commands` (object): Command handlers
- `drivers` (object): Driver values
- `hint` (string): Node hint for ISY

### Driver Methods

#### `getDriver(driver)`
Gets a driver object.

**Parameters:**
- `driver` (string): Driver name

```javascript
const st = this.getDriver('ST');
console.log(st.value, st.uom);
```

#### `setDriver(driver, value, report, forceReport, uom)`
Sets a driver to a value.

**Parameters:**
- `driver` (string): Driver name
- `value` (any): Driver value
- `report` (boolean): Report to ISY (default: true)
- `forceReport` (boolean): Force report even if unchanged (default: false)
- `uom` (number|null): Unit of measure (default: null)

```javascript
this.setDriver('ST', 100);
this.setDriver('GV1', 50, false); // Don't report
```

#### `reportDriver(driver, forceReport)`
Reports a driver value to ISY.

**Parameters:**
- `driver` (string): Driver name
- `forceReport` (boolean): Force report (default: false)

```javascript
this.reportDriver('ST', true);
```

#### `reportDrivers(forceReport)`
Reports all drivers to ISY.

**Parameters:**
- `forceReport` (boolean): Force report (default: true)

```javascript
this.reportDrivers();
```

#### `reportCmd(command, value, uom)`
Reports that the device sent a command.

**Parameters:**
- `command` (string): Command name
- `value` (any): Command value (default: null)
- `uom` (number): Unit of measure (default: null)

```javascript
this.reportCmd('DON', 100, 51);
```

### Node Methods

#### `query()`
Called when a query request is received. Override to fetch live data.

```javascript
query() {
  // Fetch live data
  this.setDriver('ST', getLiveValue());
}
```

#### `status()`
Called when a status request is received.

```javascript
status() {
  this.reportDrivers();
}
```

#### `delNode()`
Removes this node from Polyglot and ISY.

```javascript
this.delNode();
```

#### `rename(newName)`
Renames this node.

**Parameters:**
- `newName` (string): New node name

```javascript
this.rename('New Device Name');
```

---

## OAuth Class

Class for handling OAuth2 authentication with external services.

### Constructor

```javascript
constructor(polyInterface)
```

**Parameters:**
- `polyInterface` (Interface): Interface instance

**Example:**
```javascript
class MyService extends Polyglot.OAuth {
  constructor(poly) {
    super(poly);
  }
}
```

### Methods

#### `customNsHandler(key, data)`
Handles CUSTOMNS events containing OAuth configuration and tokens.

**Parameters:**
- `key` (string): Event key ('oauth' or 'oauthTokens')
- `data` (any): Event data

```javascript
customNsHandler(key, data) {
  super.customNsHandler(key, data);
  // Additional handling
}
```

#### `oauthHandler(token)`
Handles OAUTH events containing new tokens after authentication.

**Parameters:**
- `token` (object): Token data

```javascript
oauthHandler(token) {
  super.oauthHandler(token);
  // Proceed with API calls
}
```

#### `getAccessToken()`
Gets the current access token, refreshing if necessary.

**Returns:** Promise<string> - Access token

**Throws:** Error if not authenticated

```javascript
try {
  const token = await this.getAccessToken();
  // Use token for API calls
} catch (error) {
  console.error('Not authenticated');
}
```

#### `updateOauthSettings(update)`
Updates OAuth configuration dynamically.

**Parameters:**
- `update` (object): Configuration updates

```javascript
this.updateOauthSettings({
  client_id: 'new_client_id',
  client_secret: 'new_secret'
});
```

#### `getOauthSettings()`
Returns the current OAuth configuration.

**Returns:** object - OAuth configuration

```javascript
const config = this.getOauthSettings();
```

---

## Events

The Interface class extends EventEmitter and emits the following events:

### Configuration Events

#### `config`
Triggered when configuration changes.

```javascript
poly.on('config', (config) => {
  if (config.isInitialConfig) {
    // First config after restart
  }
});
```

#### `customParams`
Triggered when custom parameters change.

```javascript
poly.on('customParams', (params) => {
  const apiKey = params.api_key;
});
```

#### `customData`
Triggered when custom data changes.

```javascript
poly.on('customData', (data) => {
  // Handle custom data
});
```

#### `customTypedParams`
Triggered when typed parameters change.

```javascript
poly.on('customTypedParams', (params) => {
  // Handle typed params
});
```

#### `customTypedData`
Triggered when typed parameter data changes.

```javascript
poly.on('customTypedData', (data) => {
  // Handle typed data
});
```

#### `nsData`
Triggered when node server data changes.

```javascript
poly.on('nsData', (data) => {
  // Handle NS data
});
```

### Node Events

#### `addNodeDone`
Triggered when a node has been successfully added.

```javascript
poly.on('addNodeDone', (node) => {
  console.log('Node added:', node.address);
});
```

#### `delNodeDone`
Triggered when a node has been successfully deleted.

```javascript
poly.on('delNodeDone', (result) => {
  console.log('Node deleted:', result.address);
});
```

### Polling Events

#### `poll`
Triggered on short/long poll intervals.

```javascript
poly.on('poll', (longPoll) => {
  if (longPoll) {
    // Long poll
  } else {
    // Short poll
  }
});
```

### System Events

#### `stop`
Triggered when the node server is stopping.

```javascript
poly.on('stop', () => {
  // Cleanup
  poly.stop();
});
```

#### `delete`
Triggered when the node server is being deleted.

```javascript
poly.on('delete', () => {
  // Final cleanup
});
```

#### `discover`
Triggered when user clicks Discover button.

```javascript
poly.on('discover', () => {
  // Discover devices
});
```

### Info Events

#### `isyInfo`
Triggered when ISY information is received.

```javascript
poly.on('isyInfo', (info) => {
  console.log('ISY:', info.isy_ip_address);
});
```

#### `nsInfo`
Triggered when node server information changes.

```javascript
poly.on('nsInfo', (info) => {
  // Handle NS info
});
```

### OAuth Events

#### `oauth`
Triggered when OAuth tokens are received.

```javascript
poly.on('oauth', (token) => {
  myService.oauthHandler(token);
});
```

### Webhook Events

#### `webhook`
Triggered when a webhook request is received.

```javascript
poly.on('webhook', (data) => {
  console.log('Headers:', data.headers);
  console.log('Body:', data.body);
  poly.webhookResponse({ success: true }, 200);
});
```

### Bonjour Events

#### `bonjour`
Triggered with bonjour/mDNS query results.

```javascript
poly.on('bonjour', (results) => {
  // Handle mDNS results
});
```

### Profile Events

#### `profile`
Triggered when profile data is received.

```javascript
poly.on('profile', (profile) => {
  // Handle profile data
});
```

#### `updateProfileDone`
Triggered when profile update completes.

```javascript
poly.on('updateProfileDone', () => {
  console.log('Profile updated');
});
```

### MQTT Events

#### `mqttConnected`
Triggered when MQTT connection is established.

```javascript
poly.on('mqttConnected', () => {
  console.log('Connected to MQTT');
});
```

#### `mqttReconnect`
Triggered when MQTT reconnects.

```javascript
poly.on('mqttReconnect', () => {
  console.log('MQTT reconnected');
});
```

#### `mqttOffline`
Triggered when MQTT goes offline.

```javascript
poly.on('mqttOffline', () => {
  console.log('MQTT offline');
});
```

#### `mqttClose`
Triggered when MQTT connection closes.

```javascript
poly.on('mqttClose', () => {
  console.log('MQTT closed');
});
```

#### `mqttEnd`
Triggered when MQTT connection ends.

```javascript
poly.on('mqttEnd', () => {
  console.log('MQTT ended');
});
```

---

## Logger

The interface provides a logger utility for your NodeServer.

### Usage

```javascript
import Polyglot from 'udi-interface';
const logger = Polyglot.logger;

logger.debug('Debug message');
logger.info('Info message with data: %s', data);
logger.warn('Warning message');
logger.error('Error message');
logger.errorStack(err, 'Error with stack trace:');
```

### Log Levels

- `DEBUG`: Detailed debugging information
- `INFO`: General informational messages
- `WARNING`: Warning messages
- `ERROR`: Error messages
- `CRITICAL`: Critical errors (logged as ERROR)

Logs are located at: `<home>/.polyglot/nodeservers/<your node server>/logs/debug.log`

To watch logs:
```bash
tail -f ~/.polyglot/nodeservers/<NodeServer>/logs/debug.log
```
