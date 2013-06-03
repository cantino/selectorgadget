function importJS(src, look_for, onload) {
  var s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', src);
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
  s.setAttribute('href', href);
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

(function(){
  importCSS('https://dv0akt2986vzh.cloudfront.net/unstable/build/selectorgadget_combined.css');
  importJS('https://dv0akt2986vzh.cloudfront.net/unstable/vendor/jquery.js', 'jQuery', function() { // Load everything else when it is done.
  	window.jQuerySG = jQuery.noConflict(true);
    importJS('https://dv0akt2986vzh.cloudfront.net/unstable/vendor/diff/diff_match_patch.js', 'diff_match_patch', function() {
      importJS('https://dv0akt2986vzh.cloudfront.net/unstable/build/selectorgadget_combined.js');
    });
  });
})();
