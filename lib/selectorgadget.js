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
  importCSS('http://github.com/tectonic/selectorgadget/tree/0.3/lib/selectorgadget.css?raw=true');
  importJS('http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.min.js', function() { // Load everything else when it is done.
    importJS('http://github.com/tectonic/selectorgadget/tree/0.3/vendor/diff/diff_match_patch.js?raw=true');
    importJS('http://github.com/tectonic/selectorgadget/tree/0.3/lib/dom.js?raw=true', function() {
      importJS('http://github.com/tectonic/selectorgadget/tree/0.3/lib/interface.js?raw=true');
    });
  });
})();
