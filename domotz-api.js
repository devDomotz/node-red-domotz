/** This file is part of node-red-domotz-contrib.
 * Copyright (C) 2018  Domotz Ltd
 *
 * node-red-domotz-contrib is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * node-red-domotz-contrib is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with node-red-domotz-contrib.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Created by Andrea Azzara <a.azzara@domotz.com> on 01/11/2018.
 */

const rq = require('request-promise-native');
const url = require('url');
const querystring = require('querystring');

module.exports = function (RED) {
    function DomotzApi(config) {
        RED.nodes.createNode(this, config);

        let node = this;

        node.api = RED.nodes.getNode(config.api);
        let apiKey = node.api.credentials.key;

        let getRequestOptions = function (uri, apiKey, method, body) {
            let options = {
                headers: {
                    'X-API-KEY': apiKey
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

        let isQueryParam = function (paramName, operationDetails) {
            for (let i = 0; i < operationDetails.parameters.length; i++) {
                if (operationDetails.parameters[i].name == paramName) {
                    return (operationDetails.parameters[i].in === 'query');
                }
            }
        };

        node.on('input', function (msg) {
            let operationDetails = config.endpointsMap[config.operation];

            if (!node.api || !apiKey || !node.api.endpoint || !config.operation || !operationDetails) {
                setStatusDisconnected();
                return;
            }
            let method = operationDetails['method'];
            let publicApiEndpoint = url.resolve(node.api.endpoint, '/public-api/v1');
            let domotzUrl = publicApiEndpoint + operationDetails['path'];
            let queryParams = {};

            let addParameters = function (name, value) {
                if (isQueryParam(name, operationDetails) && value) {
                    queryParams[name] = value;
                } else {
                    domotzUrl = domotzUrl.replace('{' + name + '}', value);
                }
            };

            if (operationDetails.hasParams) {
                if (config.useinputparams && msg.payload.params) {
                    for (let param in msg.payload.params) {
                        if (msg.payload.params.hasOwnProperty(param)) {
                            addParameters(param, msg.payload.params[param]);
                        }
                    }
                } else {
                    for (let param in config.parameters) {
                        if (config.parameters.hasOwnProperty(param)) {
                            addParameters(param, config.parameters[param]);
                        }
                    }
                }
            }

            if (Object.keys(queryParams).length > 0) {
                let queryString = querystring.stringify(queryParams);
                domotzUrl = domotzUrl + '?' + queryString;
            }

            if (domotzUrl.indexOf('{') != -1) {
                node.send([null, {
                    payload: "Not all URL params converted: " + domotzUrl
                }]);
                return;
            }

            node.log("Domotz URL: " + domotzUrl);

            let options = getRequestOptions(domotzUrl, apiKey, method);

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
                    node.warn("Unable to get " + err);
                    node.send([null, {
                        payload: err.response.statusCode
                    }]);
                });
        });

        if (!node.api || !apiKey || !node.api.endpoint) {
            setStatusDisconnected();
        } else {
            let options = getRequestOptions(url.resolve(node.api.endpoint, 'public-api/v1/user'), apiKey);

            rq(options)
                .then(function (user) {
                    let userObj = JSON.parse(user);
                    node.log("Domotz User id: " + userObj.id + " name: " + userObj.name);
                    setStatusConnected();
                })
                .catch(function () {
                    node.warn("Unable to authenticate");
                    setStatusDisconnected();
                });
        }
    }

    RED.nodes.registerType("domotz-api", DomotzApi);
};
