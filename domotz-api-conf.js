module.exports = function (RED) {
    function RemoteServerNode(n) {
        RED.nodes.createNode(this, n);
        this.endpoint = n.endpoint;
        this.name = n.name;
        this.key = n.key;
    }

    RED.nodes.registerType("domotz-api-conf", RemoteServerNode);
};