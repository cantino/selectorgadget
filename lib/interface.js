function SelectorGadget() {
  this.border_width = 5;
  this.border_padding = 2;
  this.b_top = null;
  this.b_left = null;
  this.b_right = null;
  this.b_bottom = null;
  this.selected = [];
  this.rejected = [];
  this.special_mode = null;
  this.path_output_field = null;
  this.sg_div = null;
  this.unbound = false;
  this.prediction_helper = new DomPredictionHelper();
  this.restricted_elements = jQuery.map(['html', 'body', 'head', 'base'], function(selector) { return jQuery(selector).get(0) });
}
SelectorGadget.prototype = new Object();

SelectorGadget.prototype.makeBorders = function(orig_elem, makeRed) {
  this.removeBorders();
  this.setupBorders();

  if (orig_elem.parentNode)
    var path_to_show = orig_elem.parentNode.tagName.toLowerCase() + ' ' + orig_elem.tagName.toLowerCase();
  else
  var path_to_show = orig_elem.tagName.toLowerCase();

  var elem = jQuery(orig_elem);
  var p = elem.offset();

  var top = p.top;
  var left = p.left;
  var width = elem.outerWidth()
  var height = elem.outerHeight()
  
  this.b_top.css('width', this.px(width + this.border_padding * 2 + this.border_width * 2)).
             css('top', this.px(top - this.border_width - this.border_padding)).
             css('left', this.px(left - this.border_padding - this.border_width));
  this.b_bottom.css('width', this.px(width + this.border_padding * 2 + this.border_width * 2 - 5)).
                css('top', this.px(top + height + this.border_padding)).
                css('left', this.px(left - this.border_padding - this.border_width)).text(path_to_show);
  this.b_left.css('height', this.px(height + this.border_padding * 2)).
              css('top', this.px(top - this.border_padding)).
              css('left', this.px(left - this.border_padding - this.border_width));
  this.b_right.css('height', this.px(height + this.border_padding * 2)).
               css('top', this.px(top - this.border_padding)).
               css('left', this.px(left + width + this.border_padding));
  
  this.b_right.get(0).target_elem = this.b_left.get(0).target_elem = this.b_top.get(0).target_elem = this.b_bottom.get(0).target_elem = orig_elem;

  if (makeRed || elem.hasClass("sg_suggested") || elem.hasClass("sg_selected")) {
    this.b_top.addClass('sg_border_red');
    this.b_bottom.addClass('sg_border_red');
    this.b_left.addClass('sg_border_red');
    this.b_right.addClass('sg_border_red');
  } else {
    if (this.b_top.hasClass('sg_border_red')) {
      this.b_top.removeClass('sg_border_red');
      this.b_bottom.removeClass('sg_border_red');
      this.b_left.removeClass('sg_border_red');
      this.b_right.removeClass('sg_border_red');
    }
  }
  
  this.showBorders();
};

SelectorGadget.prototype.px = function(p) {
  return p + 'px';
};

SelectorGadget.prototype.showBorders = function() {
  this.b_top.show();
  this.b_bottom.show();
  this.b_left.show();
  this.b_right.show();
};

SelectorGadget.prototype.removeBorders = function() {
  if (this.b_top) {
    this.b_top.hide();
    this.b_bottom.hide();
    this.b_left.hide();
    this.b_right.hide();
//    jQuery('.sg_highlighted').removeClass('sg_highlighted');
  }
}

SelectorGadget.prototype.setupBorders = function() {
  if (!this.b_top) {
    var width = this.border_width + 'px';
    this.b_top = jQuery('<div>').addClass('sg_border').css('height', width).hide().bind("mousedown.sg", { 'self': this }, this.sgMousedown);
    this.b_bottom = jQuery('<div>').addClass('sg_border').addClass('sg_bottom_border').css('height', this.px(this.border_width + 6)).hide().bind("mousedown.sg", { 'self': this }, this.sgMousedown);
    this.b_left = jQuery('<div>').addClass('sg_border').css('width', width).hide().bind("mousedown.sg", { 'self': this }, this.sgMousedown);
    this.b_right = jQuery('<div>').addClass('sg_border').css('width', width).hide().bind("mousedown.sg", { 'self': this }, this.sgMousedown);
    
    this.addBorderToDom();
  }
};

SelectorGadget.prototype.addBorderToDom = function() {
  document.body.appendChild(this.b_top.get(0));
  document.body.appendChild(this.b_bottom.get(0));
  document.body.appendChild(this.b_left.get(0));
  document.body.appendChild(this.b_right.get(0));
};

SelectorGadget.prototype.removeBorderFromDom = function() {
  if (this.b_top) {
    this.b_top.remove();
    this.b_bottom.remove();
    this.b_left.remove();
    this.b_right.remove();
  }
};

SelectorGadget.prototype.sgMouseover = function(e) {
  var gadget = e.data.self;
  if (gadget.unbound) return true;
  if (this == document.body || this == document.body.parentNode) return;
  var self = jQuery(this);
  if (gadget.special_mode == 'd') { // Jump to any the first selected parent of this node.
//    self.addClass('sg_highlighted');
    var parent = gadget.firstSelectedOrSuggestedParent(this);
    if (parent != this)
      gadget.makeBorders(parent, true);
    else
      gadget.makeBorders(this);
  } else {
    if (!jQuery('.sg_selected', this).get(0)) {
//      self.addClass('sg_highlighted');
      gadget.makeBorders(this);
    }
  }
  return false;
};

SelectorGadget.prototype.firstSelectedOrSuggestedParent = function(elem) {
  var orig = elem;
  if (jQuery(elem).hasClass('sg_suggested') || jQuery(elem).hasClass('sg_selected')) return elem
  while (elem.parentNode && (elem = elem.parentNode)) {
    if (jQuery(elem).hasClass('sg_suggested') || jQuery(elem).hasClass('sg_selected')) return elem
  }
  return orig;
};

SelectorGadget.prototype.sgMouseout = function(e) {
  if (e.data.self.unbound) return true;
  if (this == document.body || this == document.body.parentNode) return;
  e.data.self.removeBorders();
  return false;
};

SelectorGadget.prototype.sgMousedown = function(e) {
  var gadget = e.data.self;
  if (gadget.unbound) return true;
  var elem = this;
  var w_elem = jQuery(elem);

  if (w_elem.hasClass('sg_border')) {
    // They have clicked on one of our floating borders, target the element that we are bordering.
    elem = elem.target_elem || elem;
    w_elem = jQuery(elem);
  }

  if (elem == document.body || elem == document.body.parentNode) return;
  //window.getSelection().removeAllRanges();
  
  if (gadget.special_mode == 'd') {
    var potential_elem = gadget.firstSelectedOrSuggestedParent(elem);
    if (potential_elem != elem) {
      elem = potential_elem;
    }
  } else {
    if (jQuery('.sg_selected', this).get(0)) gadget.blockClicksOn(elem); // Don't allow selection of elements that have a selected child.
  }
  
  if (w_elem.hasClass('sg_selected')) {
    w_elem.removeClass('sg_selected');
    gadget.selected.splice(jQuery.inArray(elem, gadget.selected), 1);
  } else if (w_elem.hasClass("sg_rejected")) {
    w_elem.removeClass('sg_rejected');
    gadget.rejected.splice(jQuery.inArray(elem, gadget.rejected), 1);
  } else if (w_elem.hasClass("sg_suggested")) {
    w_elem.addClass('sg_rejected');
    gadget.rejected.push(elem);
  } else {
    w_elem.addClass('sg_selected');
    gadget.selected.push(elem);
  }

  gadget.clearSuggested()
  var prediction = gadget.prediction_helper.predictCss(gadget.selected, gadget.rejected.concat(gadget.restricted_elements));
  gadget.suggestPredicted(prediction);
  gadget.setPath(prediction);
  gadget.removeBorders();

  gadget.blockClicksOn(elem);

  return false;
};

SelectorGadget.prototype.setupEventHandlers = function() {
  jQuery("*:not(.sg_ignore)").bind("mouseover.sg", { 'self': this }, this.sgMouseover);
  jQuery("*:not(.sg_ignore)").bind("mouseout.sg", { 'self': this }, this.sgMouseout);
  jQuery("*:not(.sg_ignore)").bind("mousedown.sg", { 'self': this }, this.sgMousedown);
  jQuery("html").bind("keydown.sg", { 'self': this }, this.listenForActionKeys);
  jQuery("html").bind("keyup.sg", { 'self': this }, this.clearActionKeys);
};

// Why doesn't this work?
// SelectorGadget.prototype.removeEventHandlers = function() {
//   // For some reason the jQuery unbind isn't working for me.
// 
//   // jQuery("*").unbind("mouseover.sg");//, this.sgMouseover);
//   // jQuery("*").unbind("mouseout.sg");//, this.sgMouseout);
//   // jQuery("*").unbind("click.sg");//, this.sgMousedown);
//   // jQuery("html").unbind("keydown.sg");//, this.listenForActionKeys);
//   // jQuery("html").unbind("keyup.sg");//, this.clearActionKeys);
// };

// The only action key right now is shift, which snaps to any div that has been selected.
SelectorGadget.prototype.listenForActionKeys = function(e) {
  var gadget = e.data.self;
  if (gadget.unbound) return true;
  if (e.keyCode == 16 || e.keyCode == 68) { // shift or d
    gadget.special_mode = 'd';
    gadget.removeBorders();
  }
};

SelectorGadget.prototype.clearActionKeys = function(e) {
  var gadget = e.data.self;
  if (gadget.unbound) return true;
  gadget.removeBorders();
  gadget.special_mode = null;
};

// Block clicks for a moment by covering this element with a div.  Eww?
SelectorGadget.prototype.blockClicksOn = function(elem) {
  var elem = jQuery(elem);
  var p = elem.offset();
  var block = jQuery('<div>').css('position', 'absolute').css('z-index', '9999999').css('width', this.px(elem.outerWidth())).
                              css('height', this.px(elem.outerHeight())).css('top', this.px(p.top)).css('left', this.px(p.left)).
                              css('background-color', '');
  document.body.appendChild(block.get(0));
  setTimeout(function() { block.remove(); }, 400);
  return false;
};

SelectorGadget.prototype.setMode = function(mode) {
  if (mode == 'browse') {
    this.removeEventHandlers();
  } else if (mode == 'interactive') {
    this.setupEventHandlers();
  }
  this.clearSelected();
};

SelectorGadget.prototype.suggestPredicted = function(prediction) {
  if (prediction && prediction != '') {
    var count = 0;
    jQuery(prediction).each(function() {
      count += 1;
      if (!jQuery(this).hasClass('sg_selected') && !jQuery(this).hasClass('sg_ignore') && !jQuery(this).hasClass('sg_rejected')) jQuery(this).addClass('sg_suggested');
    });
    
    if (this.clear_button) {
      if (count > 0) {
        this.clear_button.attr('value', 'Clear (' + count + ')');
      } else {
        this.clear_button.attr('value', 'Clear');
      }
    }
  }
};

SelectorGadget.prototype.setPath = function(prediction) {
  if (prediction && prediction.length > 0)
    this.path_output_field.value = prediction;
  else
    this.path_output_field.value = 'No valid path found.';
};

SelectorGadget.prototype.refreshFromPath = function(e) {
  var self = (e && e.data && e.data.self) || this;
  var path = self.path_output_field.value;
  self.clearSelected();
  self.suggestPredicted(path);
  self.setPath(path);
};

SelectorGadget.prototype.clearSelected = function(e) {
  var self = (e && e.data && e.data.self) || this;
  self.selected = [];
  self.rejected = [];
  jQuery('.sg_selected').removeClass('sg_selected');
  jQuery('.sg_rejected').removeClass('sg_rejected');
  self.removeBorders();
  self.clearSuggested();
};

SelectorGadget.prototype.clearEverything = function(e) {
  var self = (e && e.data && e.data.self) || this;
  self.clearSelected()
  self.resetOutputs()
};

SelectorGadget.prototype.resetOutputs = function() {
  this.setPath();
};

SelectorGadget.prototype.clearSuggested = function() {
  jQuery('.sg_suggested').removeClass('sg_suggested');
  if (this.clear_button) this.clear_button.attr('value', 'Clear');
};

SelectorGadget.prototype.showHelp = function() {
  alert("(Better help coming soon!)\n\nClick on a page element that you would like your selector to match (it will turn green). SelectorGadget will then generate a minimal CSS selector for that element, and will highlight (yellow) everything that is matched by the selector. Now click on a highlighted element to remove it from the selector (red), or click on an unhighlighted element to add it to the selector. Through this process of selection and rejection, SelectorGadget helps you to come up with the perfect CSS selector for your needs.\n\nHolding 'shift' while moving the mouse will snap to already selected elements.");
};

SelectorGadget.prototype.makeInterface = function() {
  this.sg_div = jQuery('<div>').attr('id', '_sg_div').addClass('sg_bottom').addClass('sg_ignore');
  var self = this;
  var path = jQuery('<input>').attr('id', '_sg_path_field').addClass('sg_ignore').keydown(function(e) {
    if (e.keyCode == 13) {
      return self.refreshFromPath(e);
    }
  }).focus(function() { jQuery(this).select(); });
  this.sg_div.append(path);
  this.clear_button = jQuery('<input type="button" value="Clear"/>').bind("click", {'self': this}, this.clearEverything).addClass('sg_ignore');
  this.sg_div.append(this.clear_button);
  this.sg_div.append(jQuery('<input type="button" value="Toggle Position"/>').click(function() {
    if (self.sg_div.hasClass('sg_top')) {
      self.sg_div.removeClass('sg_top').addClass('sg_bottom');
    } else {
      self.sg_div.removeClass('sg_bottom').addClass('sg_top');
    }
  }).addClass('sg_ignore'));

  this.sg_div.append(jQuery('<input type="button" value="Help"/>').bind("click", {'self': this}, this.showHelp).addClass('sg_ignore'));

  this.sg_div.append(jQuery('<input type="button" value="X"/>').bind("click", {'self': this}, this.unbind).addClass('sg_ignore'));
  jQuery('body').append(this.sg_div);

  this.path_output_field = path.get(0);
};

SelectorGadget.prototype.removeInterface = function(e) {
  this.sg_div.remove();
  this.sg_div = null;

  this.removeBorderFromDom();
};

SelectorGadget.prototype.unbind = function(e) {
  var self = (e && e.data && e.data.self) || this;
  self.unbound = true;
  self.removeInterface();
  self.clearSelected();
};

SelectorGadget.prototype.rebind = function() {
  this.unbound = false;
  this.makeInterface();
  this.clearEverything();
  this.setupBorders();
  this.addBorderToDom();
};

// And go!
if (typeof(selector_gadget) == 'undefined' || selector_gadget == null) {
  (function() {
    selector_gadget = new SelectorGadget();
    selector_gadget.makeInterface();
    selector_gadget.clearEverything();
    selector_gadget.setMode('interactive');
  })();
} else if (selector_gadget.unbound) {
  selector_gadget.rebind();
} else {
  selector_gadget.unbind();
}

jQuery('.selector_gadget_loading').remove();