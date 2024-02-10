
class USB {
  constructor(message_handler, error_handler) {
    this.port;
    this.connected = false;
    this.message_handler = message_handler;
    this.error_handler = error_handler;

    this.data = new Uint8Array();
  }

  process(data) {
    while (data.byteLength > 0) {
      var size = data[0];
      if (size > data.byteLength) {
        console.log('Incomplete Packet:');
        console.log(data);
        return; // packet was cropped
      }
      console.log('Packet:');
      console.log(data);
      this.message_handler(data.slice(1, size));

      data = data.slice(size);
    }

    // Multipacket
    // Append data to existing data
    /*
    if (this.data.length > 0) {
      var new_data = new Uint8Array(this.data.length + data.length);
      new_data.set(this.data, 0);
      new_data.set(data, this.data.length);
      this.data = new_data;
    } else {
      this.data = data;
    }

    while (this.data.length > 0) {
      var size = this.data[0];
      if (size > this.data.length) {
        return; // wait for more data
      }
      var packet = this.data.slice(1, size);
      this.data = this.data.slice(size);
      this.message_handler(packet);
    }
    */
  }

  set_message_handler(handler) {
    this.message_handler = handler;
  }

  set_error_handler(handler) {
    this.error_handler = handler;
  }
  
  connect() {
    if (this.port) {
      this.port.disconnect();
    }
  
    serial.requestPort().then(selectedPort => {
      this.port = selectedPort;
  
      this.port.connect().then(() => {
        //statusDisplay.textContent = '';
        //connectButton.textContent = 'Disconnect';
        this.port.onReceive = data => {
          this.connected = true;
          this.process(new Uint8Array(data.buffer));
        };
        this.port.onReceiveError = error => {
          this.connected = false;
          if (this.error_handler)
            this.error_handler(error);
          console.error(error);
        };
      }, error => {
        //statusDisplay.textContent = error;
      });
    }).catch(error => {
      console.log(error);
      //statusDisplay.textContent = error;
    });
  }
  
  request_config() {
    this.port.send(new TextEncoder('utf-8').encode("c"));
  }

  default_config() {
    this.port.send(new TextEncoder('utf-8').encode("d"));
  }

  save_config(config) {
    var buffer = new ArrayBuffer(config.length + 1);
    var view = new Uint8Array(buffer);
    view[0] = 's'.charCodeAt(0);
    for ( var i = 0; i < config.length; i++) {
        view[i + 1] = config[i];
    }
    console.log(buffer);
    this.port.send(buffer);
  }
}
