class KeySelector {
  constructor() {
    // singleton
    if (KeySelector.Selector)
      return KeySelector.Selector;

    this.node = c({c : 'selector', p : document.body, innerText : 'Type a new key'});
    window.addEventListener('keydown', this.handleKeyDown.bind(this));

    this.success_callback = null;
    this.cancel_callback = null;

    KeySelector.Selector = this;
  }

  show() {
    this.node.classList.toggle('visible', true);
  }

  hide() {
    this.node.classList.toggle('visible', false);
  }

  handleKeyDown(e) {
    var js_keycode = e.code ? e.code : e.key;   
    var keycode = CODE.FROM_JS[js_keycode];
    if (!keycode) {
      console.log("key not recognized");
    }

    if (this.success_callback) {
      console.log(keycode);
      this.success_callback(keycode);
    }
    this.success_callback = null;
    this.cancel_callback = null;
    this.hide();
  }

  activate(success_callback, cancel_callback) {
    this.success_callback = success_callback;
    this.cancel_callback = cancel_callback;
    this.show();
  }

  deactivate() {
    if (this.cancel_callback) {
      this.cancel_callback();
    }
    this.success_callback = null;
    this.cancel_callback = null;
    this.hide();
  }
}

KeySelector.activate = function(callback) {
  (new KeySelector()).activate(callback);
}