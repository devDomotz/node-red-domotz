# Node Red Domotz

This node helps performing API calls to the Domotz Public API. API parameters can be set in the configuration section
or via node's input. The node automatically converts url and query parameters.

## Inputs

An optional payload with the operation's parameters, e.g.:

```{"params": {"agent_id": "xyz"}}```

Static parameters can be alternatively defined in the configuration of the node. Required parameters are marked with an *.
Using the "Browse" option you can select agents, devices and sensors by name (note that this feature will
use some of your API budged to retrieve the necessary resources).

## Outputs

* Output: 
  * payload.code: The HTTP code
  * payload.message: the payload of the HTTP response
  * payload.headers: the HTTP response headers
  * payload.configParams: the configuration parameters of the node
  * payload.inputParams: the input parameters of the node
* Errors:
  * payload.code: The HTTP error code
  * payload.message: The HTTP response content

## References


[Domotz Developers](https://portal.domotz.com/developers) - Domotz API Documentation

[Domotz Portal](https://portal.domotz.com) - subscribe and get an API-Key

[Domotz Website](https://www.domotz.com)

## Screenshots

Node configuration


<img src="screenshots/example_conf.png?raw=true" width="450">

------------------------

Flow example


<img src="screenshots/example_flow.png?raw=true" width="800">

------------------------

Visualization (with node red dashboard)


<img src="screenshots/example_charts.png?raw=true" width="800">
