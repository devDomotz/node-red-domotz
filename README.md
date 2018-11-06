# Node Red Domotz

This node helps performing API calls to the Domotz Public API. API parameters can be set in the configuration section
or via node's input. The node automatically converts url and query parameters.

## Inputs

An optional payload with the operation's parameters, e.g.:

```{"params": {"agent_id": "xyz"}}```

Static parameters can be alternatively defined in the configuration of the node. Required parameters are marked with an *.

## Outputs

* Output: 
  * payload.code: The HTTP code
  * message: the JSON output of the operation
  * headers: the relevant HTTP response headers
* Errors:
  * payload.code: The HTTP error code
  * payload.message: The HTTP response content

## References

[https://portal.domotz.com/developers]Domotz Developers</a> - for more details on the Domotz API
[https://portal.domotz.com]Domotz Portal - subscribe and get an API-Key
[https://www.domotz.com]Domotz

## Screenshots

![Alt text](screenshots/example_flow.png?raw=true "Flow Example")


![Alt text](screenshots/example_charts.png?raw=true "Chart Example")
