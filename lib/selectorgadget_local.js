function importJS(src, look_for, onload) {
  var s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', src + "?r=" + (new Date()).getTime());
  if (onload) wait_for_script_load(look_for, onload);
  var head = document.getElementsByTagName('head')[0];
  if (head) {
    head.appendChild(s);
  } else {
    document.body.appendChild(s);
  }
}

function importCSS(href, look_for, onload) {
  var s = document.createElement('link');
  s.setAttribute('rel', 'stylesheet');
  s.setAttribute('type', 'text/css');
  s.setAttribute('media', 'screen');
  s.setAttribute('href', href + "?r=" + (new Date()).getTime());
  if (onload) wait_for_script_load(look_for, onload);
  var head = document.getElementsByTagName('head')[0];
  if (head) {
    head.appendChild(s);
  } else {
    document.body.appendChild(s);
  }
}

function wait_for_script_load(look_for, callback) {
  var interval = setInterval(function() {
    if (eval("typeof " + look_for) != 'undefined') {
      clearInterval(interval);
      callback();
    }
  }, 50);
}


var selector_gadget = null;
(function(){
  importCSS('../../../lib/selectorgadget.css');
  importJS('../../../vendor/jquery.js', 'jQuery', function() { // Load everything else when it is done.
  	window.jQuerySG = jQuery.noConflict(true);
    importJS('../../../vendor/diff/diff_match_patch.js', 'diff_match_patch', function() {
      importJS('../../../lib/dom.js', 'DomPredictionHelper', function() {
        importJS('../../../lib/core.js', 'SelectorGadget', function() {
          if (selector_gadget == null) {
            (function() {
              selector_gadget = new SelectorGadget();
              selector_gadget.makeInterface();
              selector_gadget.clearEverything();
              selector_gadget.setMode('interactive');
              selector_gadget.analytics();
            })();
          } else if (selector_gadget.unbound) {
            selector_gadget.rebind();
          } else {
            selector_gadget.unbind();
          }
          jQuerySG('.selector_gadget_loading').remove();

        });
      });
    });
  });
})();
