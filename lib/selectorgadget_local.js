function importJS(src, onload) {
  var s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', src);
  if (onload) s.onload = onload;
  var head = document.getElementsByTagName('head')[0];
  if (head) {
    head.appendChild(s);
  } else {
    document.body.appendChild(s);
  }
}

function importCSS(href, onload) {
  var s = document.createElement('link');
  s.setAttribute('rel', 'stylesheet');
  s.setAttribute('type', 'text/css');
  s.setAttribute('media', 'screen');
  s.setAttribute('href', href);
  if (onload) s.onload = onload;
  var head = document.getElementsByTagName('head')[0];
  if (head) {
    head.appendChild(s);
  } else {
    document.body.appendChild(s);
  }
}

(function(){
  importCSS('../../lib/selectorgadget.css');
  importJS('../../vendor/jquery-1.2.6.js', function() { // Load everything else when it is done.
    importJS('../../vendor/diff/diff_match_patch.js');
    importJS('../../lib/dom.js');
    importJS('../../lib/interface.js');
  });
})();
