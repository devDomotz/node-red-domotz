module.exports = function (RED) {
    function DomotzApi(config) {
        RED.nodes.createNode(this, config);

        let node = this;

        node.on('input', function (msg) {
            msg.payload = msg.payload.toLowerCase();
            node.send(msg);
        });

        node.api = RED.nodes.getNode(config.api);
        if (!node.api.key || !node.api.endpoint) {
            node.status({fill: "red", shape: "ring", text: "disconnected"});
        }

        node.log("Domotz Endpoint is " +  node.api.endpoint);

    }

    RED.nodes.registerType("domotz-api", DomotzApi);
};