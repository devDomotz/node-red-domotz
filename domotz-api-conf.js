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

const request = require('request');

function getAPIInfo (endpoint, key, cb) {
    let openAPIDef = endpoint + 'meta/open-api-definition';

    request(openAPIDef, {json: true}, (error, res, body) => {
        if (error || res.statusCode !== 200) {
            cb(true);
        }

        let apiVersion = body.info.version;
        let apiTitle = body.info.title;
        let availableEndpoints = [];
        let endpointsMap = {};

        for (const [path, options] of Object.entries(body.paths)) {
            for (const [method, operationDetails] of Object.entries(options)) {
                var tag = operationDetails['tags'][0] || 'other';
                var opId = tag + '.' + operationDetails['operationId'];
                availableEndpoints.push(opId);
                operationDetails['path'] = path;
                operationDetails['method'] = method;
                operationDetails['hasParams'] = false;
                if (operationDetails.parameters && operationDetails.parameters.length > 0) {
                    operationDetails['hasParams'] = true;
                }
                endpointsMap[opId] = operationDetails;
            }
        }
        availableEndpoints.sort();

        request({
            headers: {
                'X-API-KEY': key,
            },
            json: true,
            uri: endpoint + 'meta/usage',
        }, (error, response, data) => {
            if (error || response.statusCode !== 200) {
                return cb(true);
            }
            let dailyLimit = data.daily_limit;
            let dailyUsage = data.daily_usage;

            cb(null, apiVersion, apiTitle, availableEndpoints, endpointsMap, dailyLimit, dailyUsage);
        });


    });
}

module.exports = function (RED) {

    function RemoteServerNode (n) {
        RED.nodes.createNode(this, n);

        let node = this;
        node.endpoint = n.endpoint;
        node.name = n.name;
    }

    RED.nodes.registerType('domotz-api-conf', RemoteServerNode, {
        credentials: {
            key: {type: 'text'},
        },
    });

    function getEndpointData (req) {
        let endpoint;
        let key;
        if (req.query.conf_node) {
            let confNode = RED.nodes.getNode(req.query.conf_node);
            endpoint = confNode.endpoint;
            key = confNode.credentials.key;
        } else {
            endpoint = req.query.endpoint;
            key = req.query.key;
        }
        return {
            endpoint: endpoint,
            key: key,
        }
    }

    function domotzAPIINfo (req, res) {
        let endpointData = getEndpointData(req)

        getAPIInfo(endpointData.endpoint, endpointData.key,
            function (error, apiVersion, apiTitle, availableEndpoints, endpointsMap, dailyLimit, dailyUsage) {
                if (error) {
                    return res.json();
                }
                return res.json({
                    availableEndpoints: availableEndpoints,
                    endpointsMap: endpointsMap,
                    version: apiVersion,
                    title: apiTitle,
                    limit: dailyLimit,
                    usage: dailyUsage,
                });
            });
    }

    function domotzAPICall(req, res) {
        let endpointData = getEndpointData(req)
        let path = req.query.path;

        request({
            headers: {
                'X-API-KEY': endpointData.key,
            },
            json: true,
            uri: endpointData.endpoint + path,
        }, (error, response, data) => {
            if (error || response.statusCode !== 200) {
                return res.json(null);
            }
            return res.json(data);
        });
    }

    RED.httpAdmin.get('/domotz-api-info', RED.auth.needsPermission('domotz.read'), domotzAPIINfo);
    RED.httpAdmin.get('/domotz-api-call', RED.auth.needsPermission('domotz.read'), domotzAPICall);
};