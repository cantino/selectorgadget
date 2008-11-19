function importJS(src) {
  var s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', src);
  document.body.appendChild(s);
}

function importCSS(href) {
  var s = document.createElement('link');
  s.setAttribute('rel', 'stylesheet');
  s.setAttribute('type', 'text/css');
  s.setAttribute('href', href);
  document.body.appendChild(s);
}

(function(){
  importCSS('http://github.com/tectonic/selectorgadget/tree/master%2Flib%2Fselectorgadget.css?raw=true');
  importJS('http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.min.js');
  importJS('http://github.com/tectonic/selectorgadget/tree/master%2Fvendor%2Fdiff%2Fdiff_match_path.js?raw=true');
  importJS('http://github.com/tectonic/selectorgadget/tree/master%2Flib%2Fdom.js?raw=true');
  importJS('http://github.com/tectonic/selectorgadget/tree/master%2Flib%2Finterface.js?raw=true');
})();
