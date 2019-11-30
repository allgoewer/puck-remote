function BleRemote(buttonConnect) {
    this.ble = {
        server: null,
        vendor: null,
        func: null,
    };

    this.buttonConnect = buttonConnect;

    this.connect = function() {
        let ble = navigator.bluetooth;

        ble.requestDevice({filters: [{namePrefix: "Puck.js"}]})
        .then(device => {
            device.addEventListener("gattserverdisconnected", this.onDisconnect);
            console.log("Connecting to " + device.name);

            return device.gatt.connect();
        })
        .then(server => {
            this.ble.server = server;

            buttonConnect.innerHTML = "Disconnect";
            console.log("Connection established");

            return server.getPrimaryService("c0050001-10b6-4fbb-bc5b-8b477f92267a");
        })
        .then(service => {
            return service.getCharacteristics();
        })
        .then(characteristics => {
            characteristics.forEach(c => {
                switch (c.uuid.slice(4, 8)) {
                    case '0002':
                        this.ble.vendor = c;
                        break;
                    case '0003':
                        this.ble.func = c;
                        break;
                };
            });
        })
        .catch(error => {
            this.ble.server = null;
            this.ble.vendor = null;
            this.ble.func =null;

            console.log(error);
        });
    };

    this.connected = function() {
        if (this.ble.server)
            return this.ble.server.connected;
        else
            return false;
    }

    this.onDisconnect = function(event) {
        let device = event.target;
        console.log("Device " + device.name + " disconnected");
    }

    this.disconnect = function() {
        this.ble.server.disconnect();

        this.ble.server = null;
        this.ble.vendor = null;
        this.ble.func = null;

        this.buttonConnect.innerHTML = "Connect";
    };

    this.send = function(code) {
        let vendor = new Uint8Array(1);
        let func = new Uint8Array(1);

        vendor[0] = 0;
        func[0] = code;

        if (this.ble.vendor && this.ble.func) {
            this.ble.vendor.writeValue(vendor)
            .then(_ => {
                return this.ble.func.writeValue(func);
            })
            .then(_ => {
                console.log("Sent: vendor =  " + vendor[0] + ", function = " + func[0]);
            })
            .catch(error => {
                this.ble.server = null;
                this.ble.vendor = null;
                this.ble.func =null;

                console.log(error);
            });
        }
    };
};
