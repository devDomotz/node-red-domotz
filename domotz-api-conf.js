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
const NA = 'N/A';

module.exports = function (RED) {

    function RemoteServerNode(n) {
        RED.nodes.createNode(this, n);

        let node = this;
        node.availableEndpoints = [];
        node.endpointsMap = {};

        node.endpoint = n.endpoint;
        node.name = n.name;
        node.apiVersion = ''
        node.apiTitle = ''

        node.dailyLimit = NA;
        node.dailyUsage = NA;

        let openAPIDef = node.endpoint + "meta/open-api-definition";

        request(openAPIDef, {json: true}, (error, res, body) => {
            if (error) {
                return  console.log(error)
            }

            if (!error && res.statusCode === 200) {
                node.apiVersion = body.info.version;
                node.apiTitle = body.info.title;

                for (const [path, options] of Object.entries(body.paths)) {
                    for (const [method, operationDetails] of Object.entries(options)) {
                        var tag = operationDetails['tags'][0] || 'other';
                        var opId = tag + '.' + operationDetails['operationId'];
                        node.availableEndpoints.push(opId);
                        operationDetails['path'] = path;
                        operationDetails['method'] = method;
                        operationDetails['hasParams'] = false;
                        if (operationDetails.parameters && operationDetails.parameters.length > 0) {
                            operationDetails['hasParams'] = true;
                        }
                        node.endpointsMap[opId] = operationDetails;
                    }
                }
                node.availableEndpoints.sort();
            }
        });

        if (node.endpoint && node.credentials.key) {

            let options = {
                headers: {
                    'X-API-KEY': node.credentials.key,
                },
                json: true,
                uri: node.endpoint + 'meta/usage',
            };

            options.uri = node.endpoint + 'user';
            request(options, (error, response, data) => {
                if (error || response.statusCode !== 200) {
                    return
                }
                node.username = data.name;
            });

            options.uri = node.endpoint + 'meta/usage';
            request(options, (error, response, data) => {
                if (error || response.statusCode !== 200) {
                    return
                }
                node.dailyLimit = data.daily_limit;
                node.dailyUsage = data.daily_usage;
            });
        }
    }

    RED.nodes.registerType("domotz-api-conf", RemoteServerNode, {
        credentials: {
            key: {type: "text"}
        }
    });

    function extractConfNodeID (req) {
        return RED.nodes.getNode(req.query.conf_node);
    }

    function domotzAPIINfo(req, res) {
        let confNode = extractConfNodeID(req);
        if (!confNode) {
            return res.json()
        }
        return res.json({
            availableEndpoints: confNode.availableEndpoints,
            endpointsMap: confNode.endpointsMap,
            version: confNode.apiVersion,
            title: confNode.apiTitle,
            limit: confNode.dailyLimit,
            usage: confNode.dailyUsage,
            username: confNode.username,
        });
    }

    RED.httpAdmin.get("/domotz-api-info", RED.auth.needsPermission('domotz.read'), domotzAPIINfo);
};