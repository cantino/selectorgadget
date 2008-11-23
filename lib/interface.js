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
}
SelectorGadget.prototype = new Object();

SelectorGadget.prototype.makeBorders = function(elem, makeRed) {
  this.removeBorders();
  this.setupBorders();

  if (elem.parentNode)
    var path_to_show = elem.parentNode.tagName.toLowerCase() + ' ' + elem.tagName.toLowerCase();
  else
  var path_to_show = elem.tagName.toLowerCase();

  var elem = jQuery(elem);
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
    jQuery('.sg_highlighted').removeClass('sg_highlighted');
  }
}

SelectorGadget.prototype.setupBorders = function() {
  if (!this.b_top) {
    var width = this.border_width + 'px';
    this.b_top = jQuery('<div>').addClass('sg_border').css('height', width).hide();
    this.b_bottom = jQuery('<div>').addClass('sg_border').addClass('sg_bottom_border').css('height', this.px(this.border_width + 6)).hide();
    this.b_left = jQuery('<div>').addClass('sg_border').css('width', width).hide();
    this.b_right = jQuery('<div>').addClass('sg_border').css('width', width).hide();
    
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
  this.b_top.remove();
  this.b_bottom.remove();
  this.b_left.remove();
  this.b_right.remove();
};

SelectorGadget.prototype.sg_mouseover = function(e) {
  var gadget = e.data.self;
  if (gadget.unbound) return true;
  if (this == document.body || this == document.body.parentNode) return;
  var self = jQuery(this);
  jQuery(this).addClass('sg_highlighted');
  if (gadget.special_mode == 'd') {
    var parent = gadget.firstSelectedOrSuggestedParent(this);
    if (parent != this)
      gadget.makeBorders(parent, true);
    else
      gadget.makeBorders(this);
  } else {
    gadget.makeBorders(this);
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

SelectorGadget.prototype.sg_mouseout = function(e) {
  if (e.data.self.unbound) return true;
  if (this == document.body || this == document.body.parentNode) return;
  e.data.self.removeBorders();
  return false;
};

SelectorGadget.prototype.sg_click = function(e) {
  var gadget = e.data.self;
  if (gadget.unbound) return true;
  var elem = this;
  if (elem == document.body || elem == document.body.parentNode) return;
  window.getSelection().removeAllRanges();
  
  if (gadget.special_mode == 'd') {
    var potential_elem = gadget.firstSelectedOrSuggestedParent(elem);
    if (potential_elem != elem) {
      elem = potential_elem;
    }
  }
  
  if (jQuery(elem).hasClass('sg_selected')) {
    jQuery(elem).removeClass('sg_selected');
    gadget.selected.splice(jQuery.inArray(elem, gadget.selected), 1);
  } else if (jQuery(elem).hasClass("sg_rejected")) {
    jQuery(elem).removeClass('sg_rejected');
    gadget.rejected.splice(jQuery.inArray(elem, gadget.rejected), 1);
  } else if (jQuery(elem).hasClass("sg_suggested")) {
    jQuery(elem).addClass('sg_rejected');
    gadget.rejected.push(elem);
  } else {
    jQuery(elem).addClass('sg_selected');
    gadget.selected.push(elem);
  }

  gadget.clearSuggested()
  var prediction = gadget.prediction_helper.predictCss(gadget.selected, gadget.rejected);
  gadget.suggestPredicted(prediction);
  gadget.setPath(prediction);
  gadget.removeBorders();

  return false;
};

SelectorGadget.prototype.setupEventHandlers = function() {
  jQuery("*:not(.sg_ignore)").bind("mouseover.sg", { 'self': this }, this.sg_mouseover);
  jQuery("*:not(.sg_ignore)").bind("mouseout.sg", { 'self': this }, this.sg_mouseout);
  jQuery("*:not(.sg_ignore)").bind("click.sg", { 'self': this }, this.sg_click);
  jQuery("html").bind("keydown.sg", { 'self': this }, this.listen_for_action_keys);
  jQuery("html").bind("keyup.sg", { 'self': this }, this.clear_action_keys);
};

// Why doesn't this work?
// SelectorGadget.prototype.removeEventHandlers = function() {
//   // For some reason the jQuery unbind isn't working for me.
// 
//   // jQuery("*").unbind("mouseover.sg");//, this.sg_mouseover);
//   // jQuery("*").unbind("mouseout.sg");//, this.sg_mouseout);
//   // jQuery("*").unbind("click.sg");//, this.sg_click);
//   // jQuery("html").unbind("keydown.sg");//, this.listen_for_action_keys);
//   // jQuery("html").unbind("keyup.sg");//, this.clear_action_keys);
// };

SelectorGadget.prototype.listen_for_action_keys = function(e) {
  var gadget = e.data.self;
  if (gadget.unbound) return true;
  if (e.keyCode == 16 || e.keyCode == 68) { // shift or d
    gadget.special_mode = 'd';
    gadget.removeBorders();
  }
};

SelectorGadget.prototype.clear_action_keys = function(e) {
  var gadget = e.data.self;
  if (gadget.unbound) return true;
  gadget.removeBorders();
  gadget.special_mode = null;
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
    jQuery(prediction).each(function() {
      if (!jQuery(this).hasClass('sg_selected') && !jQuery(this).hasClass('sg_ignore') && !jQuery(this).hasClass('sg_rejected')) jQuery(this).addClass('sg_suggested');
    });
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
  self.resetOutputs();
};

SelectorGadget.prototype.resetOutputs = function() {
  this.setPath();
  this.clearSuggested();
};

SelectorGadget.prototype.clearSuggested = function() {
  jQuery('.sg_suggested').removeClass('sg_suggested');
};

SelectorGadget.prototype.makeInterface = function() {
  this.sg_div = jQuery('<div>').attr('id', '_sg_div').addClass('sg_bottom').addClass('sg_ignore');
  var self = this;
  var path = jQuery('<input>').attr('id', '_sg_path_field').attr('class', 'sg_ignore').keydown(function(e) {
    if (e.keyCode == 13) {
      return self.refreshFromPath(e);
    }
  });
  this.sg_div.append(path);
  this.sg_div.append(jQuery('<input type="button" value="Go"/>').bind("click",  {'self': this}, this.refreshFromPath).attr('class', 'sg_ignore'));
  this.sg_div.append(jQuery('<input type="button" value="Clear"/>').bind("click", {'self': this}, this.clearSelected).attr('class', 'sg_ignore'));
  this.sg_div.append(jQuery('<input type="button" value="Toggle Position"/>').click(function() {
    if (self.sg_div.hasClass('sg_top')) {
      self.sg_div.removeClass('sg_top').addClass('sg_bottom');
    } else {
      self.sg_div.removeClass('sg_bottom').addClass('sg_top');
    }
  }).attr('class', 'sg_ignore'));
  this.sg_div.append(jQuery('<input type="button" value="X"/>').bind("click", {'self': this}, this.unbind).attr('class', 'sg_ignore'));
  jQuery('body').prepend(this.sg_div);

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
  this.resetOutputs();
  this.addBorderToDom();
};

// And go!
if (typeof(selector_gadget) == 'undefined' || selector_gadget == null) {
  (function() {
    selector_gadget = new SelectorGadget();
    selector_gadget.makeInterface();
    selector_gadget.resetOutputs();
    selector_gadget.setMode('interactive');
  })();
} else if (selector_gadget.unbound) {
  selector_gadget.rebind();
} else {
  selector_gadget.unbind();
}