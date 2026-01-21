# Breaking Changes and Compatibility Notes

This document outlines breaking changes and differences between this interface and the official [polyglot-v3-nodejs-interface](https://github.com/UniversalDevicesInc/polyglot-v3-nodejs-interface).

## Version 3.4.0 Changes

### FIXED: Node Constructor Parameter Order

**Status**: ✅ **FIXED** - Now matches official interface

The Node class constructor parameter order has been corrected to match the official polyglot-v3-nodejs-interface:

```javascript
// CORRECT (matches official interface)
constructor(nodeDefId, polyInterface, primary, address, name)

// INCORRECT (was in earlier commit)
// constructor(polyInterface, primary, address, name, nodeDefId)
```

**Impact**: Node subclasses should call `super()` with `nodeDefId` as the first parameter:

```javascript
class MyNode extends Polyglot.Node {
  constructor(polyInterface, primary, address, name) {
    super(nodeDefId, polyInterface, primary, address, name);
    // ... rest of constructor
  }
}
```

This matches the pattern documented in both the official README and this interface's README.

---

## New Features (Non-Breaking Additions)

The following features are **new additions** that don't break existing code:

### OAuth2 Support
- `OAuth` class exported from the interface
- New events: `oauth`, `customNs` (for OAuth config)
- Methods: `getAccessToken()`, `updateOauthSettings()`, `getOauthSettings()`

### Webhook Support  
- New event: `webhook`
- Method: `webhookResponse(response, status)`

### Node Management Enhancements
- `renameNode(address, newName)` - Rename nodes
- `getNodesFromDb(address)` - Access database node info
- `getNodeNameFromDb(address)` - Get node name from DB
- `getValidName(name)` - Validate and clean node names
- `getValidAddress(address)` - Validate and clean addresses
- `nodes()` - Generator for iterating nodes
- `Node.rename(newName)` - Instance method to rename node

### Profile Management
- `getJsonProfile(options)` - Get profile in JSON format
- `updateJsonProfile(profile, options)` - Update profile dynamically
- New events: `profile`, `updateProfileDone`

### Additional Methods
- `setPoll(shortPoll, longPoll)` - Control poll intervals
- `setController(address, driver)` - Set connection status node
- `udm_alert(title, body)` - Send UD Mobile notifications
- `bonjour(type, protocol, subtypes)` - Bonjour/mDNS queries
- New event: `bonjour`

### Event Enhancements
- `delNodeDone` - Triggered when node deletion completes

---

## Compatibility with Official Interface

### Compatible (No Changes Required)

The following remain fully compatible with the official interface:

- `Interface` constructor
- `Node` constructor (after fix)
- `addNode(node)` method signature
- `delNode(node)` method signature
- `getNode(address)` method signature
- `getNodes()` method signature
- `getConfig()` method signature
- All existing events: `config`, `poll`, `stop`, `delete`, `discover`, etc.
- All custom parameter methods
- All custom data methods
- All notice methods
- `updateProfile()` method

### TypeScript vs JavaScript

This interface is written in **TypeScript** while the official interface is in **JavaScript**:

- Compiled `.js` files in `lib/` directory are compatible
- TypeScript definitions available in `types/` directory
- Can be used from both TypeScript and JavaScript projects
- No breaking changes in the compiled JavaScript output

---

## Migration from Official Interface

If migrating from the official polyglot-v3-nodejs-interface:

1. **Node Constructor**: Ensure your Node subclasses call `super(nodeDefId, ...)` with nodeDefId first
2. **Dependencies**: This interface uses newer dependencies but maintains compatibility
3. **New Features**: All new features are opt-in additions that don't affect existing code

### Example Migration

```javascript
// Your existing node code works as-is:
class MyNode extends Polyglot.Node {
  constructor(polyInterface, primary, address, name) {
    super(nodeDefId, polyInterface, primary, address, name);
    // ... existing code ...
  }
}

// You can optionally use new features:
poly.on('webhook', (data) => {
  // Handle webhooks
});

const cleanAddress = poly.getValidAddress('my-node-123');
```

---

## Version Information

- **Package Name**: `udi-interface` (vs `polyinterface-v3` in official repo)
- **Current Version**: 3.4.0
- **Compatible With**: Polyglot v3.0.0+
- **Official Interface Version Reference**: 3.0.20

---

## Testing Recommendations

When upgrading to this version:

1. ✅ Verify Node constructor calls match the pattern above
2. ✅ Test that existing nodes create successfully
3. ✅ Test all existing commands and drivers work
4. ✅ Test custom parameters and custom data
5. ⏩ Optionally test new features (OAuth, webhooks, etc.)

---

## Support

- GitHub Issues: https://github.com/pradeepmouli/udi-nodejs-interface/issues
- Official Polyglot Forums: http://forum.universal-devices.com/forum/111-polyglot/
- Python Interface (for parity reference): https://github.com/UniversalDevicesInc/udi_python_interface
