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

module.exports = function (RED) {

    function RemoteServerNode(n) {
        RED.nodes.createNode(this, n);

        let node = this;
        node.endpoint = n.endpoint;
        node.name = n.name;
    }

    RED.nodes.registerType("domotz-api-conf", RemoteServerNode, {
        credentials: {
            key: {type: "text"}
        }
    });
};