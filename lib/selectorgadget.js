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
  importCSS('file:///Users/cantino/git/selectorgadget/lib/selectorgadget.css');
  importJS('http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.min.js');
  importJS('file:///Users/cantino/git/selectorgadget/vendor/diff/diff_match_patch.js');
  importJS('file:///Users/cantino/git/selectorgadget/lib/dom.js');
  importJS('file:///Users/cantino/git/selectorgadget/lib/interface.js');
})();
