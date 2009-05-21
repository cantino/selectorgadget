jetpack.statusBar.append({
  html: '<img src="data:image/png; base64, iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0\nd2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAANpJREFUeNrUk9ENgjAQhotx\nAVYoI+ATzziCjqAj6Ag4gh1BRoBnnuwIOoKMUO+SD1KNJCY8GC/5uMi11//+\nYhJCMHNiYWbG7xss9bEuCk0boRKs0AtboWVdRd3y+yQcm64bFWjhIjgh0Z7R\nIVc276llwv1FQdTZkT35QC1DlWGze/fAs6DhtCF2Qh1tnjSxj2TrKDch5/T2\n21tQFSvoaaSRRmu0cYBy6ho9LlvmzaNahpGjb7GJJfOmzO4x64yimnf20wgW\nxx/INHwHjpxjcKDuh5tK/v/P9BRgAM2cNoXQhlNqAAAAAElFTkSuQmCC"/>',
  onReady: function(panel) {
    var button = $(panel).find("img");
    button.css({cursor: "pointer"});
    button.click(function() {
      var d = jetpack.tabs.focused.contentWindow.document;
      var body = $(d).find("body");
      var elem = $("<div>Loading...</div>");
      elem.css({
        color: "black", 
        padding: '20px',
        position: 'fixed',
        zIndex: '9999',
        fontSize: '3.0em',
        border: '2px solid black',
        right: '40px',
        top: '40px',
        backgroundColor: 'white'
      }).addClass('selector_gadget_loading');
      body.append(elem);
      var s = d.createElement('script');
      s.setAttribute('type','text/javascript');
      s.setAttribute('src','http://www.selectorgadget.com/stable/lib/selectorgadget.js?raw=true');
      d.body.appendChild(s);
    });
  },
  width: 16
});
