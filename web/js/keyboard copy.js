class Key {
  constructor(id, pin, keycode, keycode_alt, extra_style) {
    this.id = id;
    this.pin = pin;

    this.held_keys = {};

    this.node = c({c : 'key pin' + pin});
    if (extra_style) {
      extra_style = extra_style.split(' ');
      for (var i = 0; i < extra_style.length; i++) {
        this.node.classList.add(extra_style[i]);
      }
    }

    this.node_keycode = c({p : this.node, c : 'keycode'});
    this.node_keycode.addEventListener('click', () => {
      KeySelector.activate(this.updateKeyCode.bind(this));
    });

    this.node_keycode_alt = c({p : this.node, c : 'alt'});
    this.node_keycode_alt.addEventListener('click', () => {
      KeySelector.activate(this.updateKeyCodeAlt.bind(this));
    });

    this.node_keycode_alt = c({p : this.node, c : 'mod'});
    this.node_keycode_alt.addEventListener('click', () => {
      KeySelector.activate(this.updateKeyCodeAlt.bind(this));
    });

    this.update(keycode, keycode_alt);
  }

  updateKeyCode(keycode) {
    if (!CODE.NAME[keycode]) {
      return alert('unknown key');
    }
    this.keycode = keycode;
    this.node_keycode.innerHTML = CODE.NAME[keycode];
    this.node_keycode.classList.toggle('small', (String(CODE.NAME[keycode]).length > 1));
    this.node_keycode.classList.toggle('mod', (CODE.NAME[keycode] == 'mod'));
  }

  updateKeyCodeAlt(keycode_alt) {
    if (!CODE.NAME[keycode_alt]) {
      return alert('unknown key');
    }
    this.keycode_alt = keycode_alt;  
    this.node_keycode_alt.innerHTML = CODE.NAME[keycode_alt];
  }

  update(keycode, keycode_alt) {
    this.updateKeyCode(keycode);
    this.updateKeyCodeAlt(keycode_alt);
  }
}

class Keyboard {
  constructor() {
    this.usb = new USB(
      this.handle_usb_message.bind(this),
      this.handle_usb_error.bind(this)
    );
    this.connected = false;

    this.keys = {}; // by pin

    this.node = c({c : 'keyboard', p : document.body});

    this.controls = c({c : 'controls', p : this.node});

    this.control_connect = c({innerText: 'connect', c : 'control connect', p : this.controls});
    this.control_connect.addEventListener('click', () => {this.usb.connect();});

    //this.control_disconnect = c({innerText: 'disconnect', c : 'control disconnect', p : this.controls});
    //this.control_disconnect.addEventListener('click', () => {this.usb.disconnect();});

    //this.control_load = c({innerText: 'load', c : 'control', p : this.controls});
    //this.control_load.addEventListener('click', () => {this.usb.request_config();});

    this.control_save = c({innerText: 'save', c : 'control save', p : this.controls});
    this.control_save.addEventListener('click', () => {this.usb.save_config(this.get_config());});

    this.control_reset = c({innerText: 'reset', c : 'control reset', p : this.controls});
    this.control_reset.addEventListener('click', () => {this.usb.default_config();});
  }

  set_key(id, pin, keycode, keycode_alt, extra_style) {
    if (this.keys[id]) {
      console.log('updating ' + id);
      this.keys[id].update(keycode, keycode_alt);
    } else {
      console.log('creating ' + id);
      this.keys[id] = new Key(id, pin, keycode, keycode_alt, extra_style);
      this.node.appendChild(this.keys[id].node);
    }
  }

  set_connected(connected) {
    var was_connected = this.connected;
    this.node.classList.toggle('connected', connected);
    this.connected = connected;
    // TODO: replace with hello message?
    if (this.connected && !was_connected) {
      console.log('requesting config');
      this.usb.request_config()
    }
  }

  get_config() {
    var result = [];
    for (var id in this.keys) {
      result.push(this.keys[id].pin);
      result.push(this.keys[id].keycode);
      result.push(this.keys[id].keycode_alt);
    }
    return result;
  }

  set_config(config) {
    for (var i = 0; i < config.length; i += 3) {
      var id = parseInt(i / 3);

      var pin = config[i];
      var keycode = config[i + 1];
      var keycode_alt = config[i + 2];

      console.log(id, pin, keycode, keycode_alt);

      this.set_key(id, pin, keycode, keycode_alt);
    }
  }

  set_keys_held(keys) {
    for (var id = 0; id < keys.length; id++) {
      this.keys[id].node.classList.toggle('held', keys[id] == 1);
    }
  }

  handle_usb_message(message) {
    this.set_connected(true);

    switch(String.fromCharCode(message[0])) {
      case 'h': // hello
        this.usb.request_config();
        break;
      case 'c': // config
        console.log("RECV config message");
        this.set_config(message.slice(1));
        break;
      case 'r': // key report
        console.log("RECV key message");
        this.set_keys_held(message.slice(1));
        break;
      default:
        console.log("RECV unknown message");
        console.log(message);
    }
  }

  handle_usb_error() {
    this.set_connected(false);
  }
}