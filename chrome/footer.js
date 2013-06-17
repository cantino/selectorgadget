// This file is appended to build/selectorgadget_combined.js to generate the final contentScript.

  }

  var interval = setInterval(function() {
    if (typeof SelectorGadget != 'undefined') {
      clearInterval(interval);
      SelectorGadget.toggle();
    }
  }, 50);
})();