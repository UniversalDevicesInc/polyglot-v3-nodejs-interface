# Change Log

v3.4.0 (2025-12-23)
* Added parity with Python interface (udi_python_interface)
* Added OAuth class for OAuth2 authentication support
* Added webhook support with webhookResponse() method
* Added bonjour/mDNS support with bonjour() method
* Added node management methods: renameNode(), getNodesFromDb(), getNodeNameFromDb()
* Added validation methods: getValidName(), getValidAddress()
* Added nodes() generator/iterator method
* Added profile management: getJsonProfile(), updateJsonProfile()
* Added setPoll() method to control short/long poll intervals
* Added setController() method to set connection status node
* Added udm_alert() method for UD Mobile notifications
* Added Node.rename() method
* Added support for webhook, bonjour, profile, updateProfileDone, and delNodeDone events
* Added lib/ and types/ to .gitignore

v3.0.7 (2021-12-24)
* Add nodes to internal node list when first created.
v3.0.6 (2021-12-24)
* Format driver status messages correctly
v3.0.5 (2021-12-22)
* add event for customparamsdoc
* make some error/info messages debug messages
v3.0.4 (2021-12-16)
* Handle addNode better
v3.0.3 (2021-12-16)
* Add new events supported by PG3
* Split custom objects from config object.
* Fix node fields (some are slightly different for PG3)

v3.0.2 (2021-11-30)
* Added reportCmd() method to the node class.

v3.0.1 (2021-09-06)
* More changes to work with Polyglot version 3

v3.0.0 (2020-12-09)
* Update to work with Polyglot version 3

v1.2.3 (2019-04-23)
* Add support for hints.

v1.2.2 (2019-04-23)
* Add support for notices in object format used by newer polyglot 
versions.

v1.2.1 (2019-04-07)

* Interface: Added method getConfig().
* Interface: Added method addNoticeTemp(key, text, delaySec).
* The config object now has a newParamsDetected flag which tells us if
customParams changed.
* Fixed logger.errorStack()
* Node.setDriver() converts values to string, as expected by Polyglot
