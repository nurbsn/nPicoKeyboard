function c(opts = {}) {
  var e = document.createElement(opts.type ? opts.type : 'div');
  
  if (opts.c) e.className = opts.c;
  else if (opts.class) e.className = opts.class;
  
  if (opts.i) e.id = opts.i;

  if (opts.p) opts.p.appendChild(e);
  else if (opts.parent) opts.parent.appendChild(e);

  if (opts.innerHTML) e.innerHTML = opts.innerHTML;
  else if (opts.innerText) e.innerText = opts.innerText;
  if(opts.t) e.text = opts.t;
  else if(opts.text) e.text = opts.text;
  
  if(opts.type == "option")
  {
    if(opts.v) e.value = opts.v;
  }
  else if(opts.type == "label")
  {
    if(e.htmlFor) e.htmlFor = opts.htmlFor;
  }

  return e;
}

function appendStyle(styleText) {
  var sheet = document.createElement("style");
  sheet.innerText = styleText;
  document.head.appendChild(sheet);
}

function toast(text) {
  var nodes = document.getElementsByClassName("toast");
  if (nodes.length > 0) {
    nodes[0].remove();
  }

  var node = c({c : "toast", p : document.body});
  node.innerHTML = text;
  setTimeout(function() {
    if (node.parentNode) node.parentNode.removeChild(node);
  }, 4000);
}
