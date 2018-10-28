
module.exports = function (RED) {

    function RemoteServerNode(n) {
        RED.nodes.createNode(this, n);

        let node = this;
        node.endpoint = n.endpoint;
        node.name = n.name;
        node.key = n.key;
    }

    RED.nodes.registerType("domotz-api-conf", RemoteServerNode);
};