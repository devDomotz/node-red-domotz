const rq = require('request-promise-native');
const url = require('url');

module.exports = function (RED) {
    function DomotzApi(config) {
        RED.nodes.createNode(this, config);

        let node = this;

        node.api = RED.nodes.getNode(config.api);

        let getRequestOptions = function (uri, apiKey, method, body) {
            let options = {
                headers: {
                    'X-API-KEY': node.api.key
                },
                uri: uri
            };
            if (method) {
                options.method = method;
            }
            if (body) {
                options.body = body;
                options.json = true;
            }
            return options;
        };


        let setStatusDisconnected = function () {
            node.status({fill: "red", shape: "ring", text: "disconnected"});
        };

        let setStatusConnected = function () {
            node.status({fill: "green", shape: "dot", text: "connected"});
        };

        node.on('input', function (msg) {
            let operationDetails = config.endpointsMap[config.operation];

            if (!node.api || !node.api.key || !node.api.endpoint || !config.operation || !operationDetails) {
                setStatusDisconnected();
                return;
            }
            let method = operationDetails['method'];
            let publicApiEndpoint = url.resolve(node.api.endpoint, '/public-api/v1');
            let domotzUrl = publicApiEndpoint + operationDetails['path'];

            let hasParams = operationDetails.parameters.length > 0;
            if (hasParams) {
                if (config.useinputparams && msg.payload.urlParams) {
                    for (let param in msg.payload.urlParams) {
                        domotzUrl = domotzUrl.replace('{' + param + '}', msg.payload.urlParams[param]);
                    }
                } else {
                    for (let param in config.parameters) {
                        domotzUrl = domotzUrl.replace('{' + param + '}', config.parameters[param]);
                    }
                }
            }


            if (domotzUrl.indexOf('{') != -1) {
                node.send([null, {
                    payload: "Not all URL params converted: " + domotzUrl
                }]);
                return;
            }

            node.log("Domotz URL: " + domotzUrl);

            let options = getRequestOptions(domotzUrl, node.api.key, method);

            node.log("performing request to " + domotzUrl);

            rq(options)
                .then(function (rawResult) {
                    let result = JSON.parse(rawResult);
                    let payload = {
                        payload: result
                    };
                    node.send([payload, null]);
                    node.status({fill: "green", shape: "dot", text: "connected"});
                })
                .catch(function (err) {
                    node.log("Unable to get " + err);
                    node.send([null, {
                        payload: err.response.statusCode
                    }]);

                });
        });

        if (!node.api || !node.api.key || !node.api.endpoint) {
            setStatusDisconnected();
        } else {
            let options = getRequestOptions(url.resolve(node.api.endpoint, 'public-api/v1/user'), node.api.key);

            rq(options)
                .then(function (user) {
                    let userObj = JSON.parse(user);
                    node.log("Domotz User id: " + userObj.id + " name: " + userObj.name);
                    setStatusConnected();
                })
                .catch(function () {
                    node.log("Unable to authenticate");
                    setStatusDisconnected();
                });
        }
    }

    RED.nodes.registerType("domotz-api", DomotzApi);
};
