# UDI Polyglot v3 Interface Module (Node.js)

This is the Polyglot interface API module that is used to develop a node.js based NodeServer for Polyglot v3.

This has been tested with Polyglot-v3 version 3.0.0.

## Installation

You need to have Node.js and NPM installed. This version has been tested with node.js 8.10.

The installation can differ based on the linux distribution.

On a Ubuntu or similar distribution:
```
sudo apt install nodejs
sudo apt install npm
```


## Starting your NodeServer build

When you start building a NodeServer you are helping build the free and open Internet of Things. Thank you! If you run in to any issues please ask your questions on the [UDI Polyglot Forums](http://forum.universal-devices.com/forum/111-polyglot/).

To get started, use the [node.js NodeServer template](https://github.com/UniversalDevicesInc/poly-template-nodejs).
This is a simple but fully functional NodeServer.

One of the first things you will want to do is to create your profile files. See the profile folder from the NodeServer
template for an example. Please refer to the [ISY Version 5 API](https://wiki.universal-devices.com/index.php?title=ISY_Developers:API:V5) to learn how to create your profile files.

The polyglot interface module has 2 main javascript classes you need to use to interact with Polyglot.

### The Node class
The Node class represents a generic ISY node. Your custom nodes will have to inherit from this class, and they should
match the status and the controls that you have created in your nodedefs. Given that your Nodeserver may be used for
Polyglot V3 or Polyglot cloud, the class has to be dynamically created to that your class extends the correct Node class
(Polyglot V3 or PGC).

The recommended approach is to create one node.js module per Nodedefs, with a single function that returns the class. 
The class returned inherits from Polyglot.Node, Polyglot being the Polyglot module passed from your Nodeserver (Polyglot V3 or PGC).

```javascript
const nodeDefId = 'VNODE_DIMMER';

module.exports = function(Polyglot) {
// Utility function provided to facilitate logging.
  const logger = Polyglot.logger;

  // This is your custom Node class
  class MyNode extends Polyglot.Node {

    // polyInterface: handle to the interface
    // address: Your node address, withouth the leading 'n999_'
    // primary: Same as address, if the node is a primary node
    // name: Your node name
    constructor(polyInterface, primary, address, name) {
      super(nodeDefId, polyInterface, primary, address, name);

      // PGC supports setting the node hint when creating a node
      // REF: https://github.com/UniversalDevicesInc/hints
      // Must be a string in this format
      // If you don't care about the hint, just comment the line.
      this.hint = '0x01020900'; // Example for a Dimmer switch

      // Commands that this node can handle.
      // Should match the 'accepts' section of the nodedef.
      this.commands = {
        DON: this.onDON,
        DOF: this.onDOF,
        // You can use the query function from the base class directly
        QUERY: this.query,
      };

      // Status that this node has.
      // Should match the 'sts' section of the nodedef.
      this.drivers = {
        ST: {value: '0', uom: 51},
      };
    }

    onDON(message) {
      logger.info('DON (%s): %s',
        this.address,
        message.value ? message.value : 'No value');

      // setDrivers accepts string or number (message.value is a string)
      this.setDriver('ST', message.value ? message.value : '100');
    }

    onDOF() {
      logger.info('DOF (%s)', this.address);
      this.setDriver('ST', '0');
    }
  }

  // Required so that the interface can find this Node class using the nodeDefId
  MyNode.nodeDefId = nodeDefId;

  return MyNode;
};
```


##### The Node class has these standard properties

`this.id` (This is the Nodedef ID)

`this.polyInterface` (Gives access to the Polyglot interface)

`this.primary` (Primary address)

`this.address` (Node address)

`this.name` (Node name)

`this.timeAdded` (Time added)

`this.enabled` (Node is enabled?)

`this.added` (Node is added to ISY?)

`this.commands` (List of commands)

`this.drivers` (List of drivers)

The list of commands in your custom node need to map to a function which is executed when the command command is
triggered.

The list of drivers defines the node statuses, the uom, and contains the value.


##### The Node class has these standard methods

this.getDriver(driver), to get the driver object.

this.setDriver(driver, value, report=true, forceReport=false, uom=null), to set a driver to a value
(example set ST to 100).

this.reportDriver(driver, forceReport), to send existing driver value to ISY.

this.reportDrivers(), To send existing driver values to ISY.

this.reportCmd(command, value=null, uom=null), to report that the device has sent a command.

this.query(), which is called when we get a query request (Override this to fetch live data).

this.status(), which is called when we get a status request for this node.

this.delNode(), which will remove the node from Polyglot and the ISY.

##### The controller node

Normally, your NodeServer should have a controller node, in addition to your custom nodes. The controller node is
a regular ISY node which holds the status of your NodeServer (Is it active or not?), and can also provide commands
to interact with the NodeServer from the admin console or an ISY program.

Please see the template for a complete example of a custom node and a controller node.

### The Interface class
The Interface class is a singleton used to interact with Polyglot-v3 through MQTT.

You first need to instantiate the interface by passing an array of node definitions that you have created.
Once instantiated, you can use events triggered by the interface such as `config`, `poll` or `stop`.

```javascript

// Loads the appropriate Polyglot interface module.
const Polyglot = useCloud() ?
  require('pgc_interface') : // Cloud module
  require('polyinterface'); // Polyglot V3 module (On-Premise)

// Note that we are passing the Polyglot module so that we can get the class inherited from the correct module.
const ControllerNode = require('./Nodes/ControllerNode.js')(Polyglot); // Controller node
const MyNode = require('./Nodes/MyNode.js')(Polyglot); // This is an example node


// Create an instance of the Polyglot interface. We need pass in parameter all
// the Node classes that we will be using.
const poly = new Polyglot.Interface([ControllerNode, MyNode]);

// Config has been received
poly.on('config', function(config) {
  const nodesCount = Object.keys(config.nodes).length;

  logger.info('Config received has %d nodes', nodesCount);

  if (config.isInitialConfig) {
    logger.info('This is the first config received after the NodeServer restart');
  }
});

// This is triggered every x seconds. Frequency is configured in the UI.
poly.on('poll', function(longPoll) {
  logger.info('%s', longPoll ? 'Long poll' : 'Short poll');
});

// Received a 'stop' message from Polyglot. This NodeServer is 
// 
// 
// shutting down
poly.on('stop', function() {
  logger.info('Graceful stop');
});

// Starts the NodeServer!
poly.start();
```

##### The Interface class events

`config` is triggered whenever there is a change in the configuration, the nodes, the notices, anything. The config
is passed in parameter. You can check for config.isInitialConfig to know if the is the first config received. Use this
for initialization when you want to have a working config loaded.

NEW for PG3, the config object no longer has the custom values (parameters, data, typed).  These now have separate events that return the individual custom data objects. See below.

The config object will have a property newParamsDetected set to true if the customParams changed.

`poll` is triggered frequently, based on your short poll and long poll values. The longPoll parameter is a flag telling
you if this is a long poll or short poll.

`stop` is triggered whenever the node server is being stopped.

`delete` is triggered whenever the user is deleting the NodeServer.

`discover` is triggered whenever the user clicks the "Discover" button in the UI.

`customParams` is triggered whenever there is a change to the custom parameters.The event includes the current parameters.

`customData` is triggered whenever there is a change to the custom data. The event includes the current data.

`customTypedParams` is triggered whenever there is a change to the 'typed' parameters.

`customTypedData` is triggered whenever there is a change to the 'typed' parameter data.

`nsData` is triggered whenever there is new node server data. 

`notices' is triggered whenever there is a change in notices.

`customParamsDoc` is triggered whenever there is change to the config documentation.

`getIsyInfo` is triggered when new ISY information is sent (ip, username, password).

`getNsInfo` is triggered when there is a change in a node server.


The following events are less commonly used but could be useful for troubleshooting:

`messageReceived` is triggered for every messages received from Polyglot to the NodeServer.

`messageSent` is triggered for every messages sent to Polyglot from your NodeServer.

`mqttConnected` is the first event being triggered and happens when the MQTT connection is established. The config is
not yet available.

`mqttReconnect` the MQTT connection reconnected.

`mqttOffline` the MQTT connection went offline.

`mqttClose` the MQTT connection closed.

`mqttEnd` the MQTT connection ended.


##### The Interface class methods

start(), to initiate the MQTT connection and start communicating with Polyglot.

isConnected(), which tells you if this NodeServer and Polyglot are connected via MQTT.

async addNode(node), Adds a new node to Polyglot. You fist need to instantiate a node using your custom class,
which you then pass to addNode. This is an async function which allows you to "await" the result and verify if the
addNode was successful.

getConfig(), Returns a copy of the last config received.

getNodes(), Returns your list of nodes. This is not just an array of nodes returned by Polyglot. This is a list of
nodes with your classes applied to them.

getNode(address), Returns a single node.

delNode(node), Allows you to delete the node specified. You need to pass the actual node. Alternatively, you can use
delNode() directly on the node itself, which has the same effect.

updateProfile(), Sends the latest profile to ISY from the profile folder.

getNotices(), Returns the current list of Polyglot notices.

addNotice(key, text), Adds a notice to the Polyglot UI. The key allows to refer to that notice later on.

addNoticeTemp(key, text, delaySec), Adds a notice to the Polyglot UI. The notice will be active for delaySec seconds.

removeNotice(key), Remove notice specified by the key.

removeNoticesAll(), Removes all notices from Polyglot.

getCustomParams(), Returns all the configuration parameters from the UI.

getCustomParam(key), Returns the param as seen in the UI.

saveCustomParams(params), Saves the params as specified by the params objects. All the params not passed here will be lost.

addCustomParams(params), Adds custom params specified by the params objects. This will be added to the existing params.

removeCustomParams(key), Removed the custom param specified by the key.

saveTypedParams(typedParams), This method is not yet available in the cloud.

getTypeData(), This method returns the most recent "Typed" configuration parameter data.

Here's an example
```javascript
// Custom parameters definitions in front end UI configuration screen
// Accepts list of objects with the following properties:
// name - used as a key when data is sent from UI
// title - displayed in UI
// defaultValue - optional
// type - optional, can be 'NUMBER', 'STRING' or 'BOOLEAN'. Defaults to 'STRING'
// desc - optional, shown in tooltip in UI
// isRequired - optional, true/false
// isList - optional, true/false, if set this will be treated as list of values
//    or objects by UI
// params - optional, can contain a list of objects.
// 	 If present, then this (parent) is treated as object /
// 	 list of objects by UI, otherwise, it's treated as a
// 	 single / list of single values

const typedParams = [
  {name: 'host', title: 'Host', isRequired: true},
  {name: 'port', title: 'Port', isRequired: true, type: 'NUMBER'},
  {name: 'user', title: 'User', isRequired: true},
  {name: 'password', title: 'Password', isRequired: true},
  // { name: 'list', title: 'List of values', isList:true }
];

poly.saveTypedParams(typedParams);
```


setCustomParamsDoc(html), allows you to set the HTML help file for your params. This method is not yet available in the cloud,

Here's an example using a markdown file.

```javascript
const fs = require('fs');
const markdown = require('markdown').markdown;

const configurationHelp = './configdoc.md';

const md = fs.readFileSync(configurationHelp);
poly.setCustomParamsDoc(markdown.toHTML(md.toString()));
```


saveCustomData(data), allows you to save data for your node server. This will overwrite the existing data.

addCustomData(data), allows you to save data for your node server. This will add to your existing data, as long as the keys are different.

getCustomData(key = null), gives you all of your custom data, or a specific key if specified.

removeCustomData(key), allows you to delete custom data.

restart(), allows you to self restart the NodeServer.


### Creating nodes

Nodes are created by instantiating one of your node classes, and using the addNode method on the interface:

```javascript
const createdNode = new MyNode(this.polyInterface, primaryAddress, nodeAddress, nodeDescription);
this.polyInterface.addNode(createdNode);
```

You could do this different ways;

If your node server has a fixed set of nodes, you can perhaps create them within the config event. If the expected
nodes are not there, you could create them there on startup.

You could as well create them during polling, as you discover them from a third party API.

Perhaps they could also be defined using the configuration UI, using the typedParams list option.

In the Template, they are created using a command from the controller Node. This allows to create new nodes using an
admin console button.


### Logger

This polyglot interface uses a logging mecanism that you can also use in your NodesServer.

```javascript
const logger = Polyglot.logger;

logger.debug('Debugging');
logger.info('Info with more informations: %s', myInformation);
logger.warn('Warning with perhaps an object logged: %o', myObject);
logger.error('Error...');

// For unexpected errors, it may be wise to use errorStack to log an error with the stack information:
try {
  thisThrowsAnError()
} catch(err) {
  // Notice the err object as the first parameter. The message is added to the end.
  logger.errorStack(err, 'Error with stack information:');
}
```

The logs are located in <home>/.polyglot/nodeservers/<your node server>/logs/debug.log

To watch your NodeServer logs:
```
tail -f ~/.polyglot/nodeservers/<NodeServer>/logs/debug.log
```


### How to Enable your NodeServer in the Cloud

Your nodeserver needs to use the [pgc_interface node.js module](https://github.com/UniversalDevicesInc/pgc-nodejs-interface).

If your Nodeserver supports both Polyglot V3 and Cloud, then your Nodeserver 
must dynamically select which interface module to use. See the 
[node.js NodeServer template](https://github.com/UniversalDevicesInc/poly-template-nodejs) for an example.
Although they are completely separate module, the way they are used 
from your Nodeserver are very similar, with very little differences.
