window.onload = function() {
    let buttonConnect = document.getElementById("connect");
    let ble = navigator.bluetooth;
    charVendor = null;
    charFunction = null;

    buttonConnect.addEventListener('pointerup', function(evt) {
        ble.requestDevice({filters: [{namePrefix: "Puck.js"}]})
        .then(device => {
            device.addEventListener("gattserverdisconnected", onDisconnect);
            console.log("Connecting to " + device.name);
            return device.gatt.connect();
        })
        .then(server => {
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
                        charVendor = c;
                        break;
                    case '0003':
                        charFunction = c;
                        break;
                };
            });
        })
        .catch(error => {console.log(error);});
    });
};

function sendCode(code) {
    let vendor = new Uint8Array(1);
    let func = new Uint8Array(1);

    vendor[0] = 0;
    func[0] = code;

    if (charVendor && charFunction) {
        charVendor.writeValue(vendor)
        .then(_ => {
            return charFunction.writeValue(func);
        })
        .then(_ => {
            console.log("Sent: vendor =  " + vendor[0] + ", function = " + func[0]);
        })
        .catch(error => { console.log(error); });
    }
}

function onDisconnect(event) {
    let device = event.target;
    console.log("Device " + device.name + " disconnected");

    charVendor = null;
    charFunction = null;
    document.getElementById("connect").innerHTML = "Connect";
}

console.log("Setup complete");
