(function() {
  if (typeof SelectorGadget == 'undefined') {
    var head = document.getElementsByTagName('head')[0];
    var s = document.createElement('link');
    s.setAttribute('rel', 'stylesheet');
    s.setAttribute('type', 'text/css');
    s.setAttribute('media', 'screen');
    s.setAttribute('href', 'https://dv0akt2986vzh.cloudfront.net/unstable/build/selectorgadget_combined.css');
    (head ? head : document.body).appendChild(s);

    s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', 'https://dv0akt2986vzh.cloudfront.net/unstable/build/selectorgadget_combined.js');
    (head ? head : document.body).appendChild(s);
  }

  var interval = setInterval(function() {
    if (typeof SelectorGadget != 'undefined') {
      clearInterval(interval);
      SelectorGadget.toggle();
    }
  }, 50);
})();
