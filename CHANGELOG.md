# Change Log

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
