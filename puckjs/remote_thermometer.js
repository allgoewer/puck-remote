var pronto = require("pronto");

const code = [
  /* samsung */ [
    /* power */ pronto.decode("0000 006C 0000 0022 00AD 00AD 0016 0041 0016 0041 0016 0041 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0041 0016 0041 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0016 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 06FB"),
    /* mute */ pronto.decode("0000 006C 0000 0022 00AD 00AD 0016 0041 0016 0041 0016 0041 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0041 0016 0041 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0016 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 06FB"),
    /* volup */ pronto.decode("0000 006C 0000 0022 00AD 00AD 0016 0041 0016 0041 0016 0041 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0041 0016 0041 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0041 0016 0041 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0041 0016 0041 0016 0041 0016 0041 0016 06FB"),
    /* voldown */ pronto.decode("0000 006C 0000 0022 00AD 00AD 0016 0041 0016 0041 0016 0041 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0041 0016 0041 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0041 0016 0016 0016 0041 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0016 0041 0016 0016 0016 0041 0016 0041 0016 0041 0016 0041 0016 06FB")
  ]
];

var remoteVendor = [0];
var remoteFunction = [0];

if (typeof CONFIG === 'undefined') {
  const CONFIG = {};
}

function getTemp() {
  let offset = CONFIG.temp_offset || 0;
  return Math.round(E.getTemperature() + offset);
}

function updateTemp() {
  let temp = getTemp();
  let batt = E.getBattery();

  //                     RED                  GREEN  BLUE
  let led = temp >= 22 ? LED1 : (temp >= 17 ? LED2 : LED3);
  digitalPulse(led, 1, 1);

  NRF.setAdvertising({
    0x1809: [temp],
    0x180F: [batt]
  }, {interval: 500});
}

function execFunction() {
  let vendorId = remoteVendor[0];
  let functionId = remoteFunction[0];

  let remoteCode = (code[vendorId] || [])[functionId];

  if (remoteCode != undefined) {
    Puck.IR(remoteCode);
  }
}

NRF.setServices({
  "c0050001-10b6-4fbb-bc5b-8b477f92267a": {
    "c0050002-10b6-4fbb-bc5b-8b477f92267a": {
      description: "Remote Vendor",
      maxLen: 1,
      readable: true,
      value: remoteVendor,
      writable: true,
      onWrite: function(evt) { remoteVendor = evt.data; }
    },
    "c0050003-10b6-4fbb-bc5b-8b477f92267a": {
      description: "Remote Function",
      maxLen: 1,
      readable: true,
      value: remoteFunction,
      writable: true,
      onWrite: function(evt) { remoteFunction = evt.data; execFunction(); }
    }
  }
});

setInterval(updateTemp, 4000);