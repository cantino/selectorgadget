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

  var elem = $(elem);
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
    $('.sg_highlighted').removeClass('sg_highlighted');
  }
}

SelectorGadget.prototype.setupBorders = function() {
  if (!this.b_top) {
    var width = this.border_width + 'px';
    this.b_top = $('<div>').addClass('sg_border').css('height', width).hide();
    this.b_bottom = $('<div>').addClass('sg_border').addClass('sg_bottom_border').css('height', this.px(this.border_width + 6)).hide();
    this.b_left = $('<div>').addClass('sg_border').css('width', width).hide();
    this.b_right = $('<div>').addClass('sg_border').css('width', width).hide();

    document.body.appendChild(this.b_top.get(0));
    document.body.appendChild(this.b_bottom.get(0));
    document.body.appendChild(this.b_left.get(0));
    document.body.appendChild(this.b_right.get(0));
  }
};

SelectorGadget.prototype.sg_mouseover = function(e) {
  if (this == document.body || this == document.body.parentNode) return;
  var self = $(this);
  var gadget = e.data.self;
  $(this).addClass('sg_highlighted');
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
  if ($(elem).hasClass('sg_suggested') || $(elem).hasClass('sg_selected')) return elem
  while (elem.parentNode && (elem = elem.parentNode)) {
    if ($(elem).hasClass('sg_suggested') || $(elem).hasClass('sg_selected')) return elem
  }
  return orig;
};

SelectorGadget.prototype.sg_mouseout = function(e) {
  if (this == document.body || this == document.body.parentNode) return;
  e.data.self.removeBorders();
  return false;
};

SelectorGadget.prototype.sg_click = function(e) {
  var elem = this;
  if (elem == document.body || elem == document.body.parentNode) return;
  var gadget = e.data.self;
  window.getSelection().removeAllRanges();
  
  if (gadget.special_mode == 'd') {
    var potential_elem = gadget.firstSelectedOrSuggestedParent(elem);
    if (potential_elem != elem) {
      elem = potential_elem;
    }
  }
  
  if ($(elem).hasClass('sg_selected')) {
    $(elem).removeClass('sg_selected');
    gadget.selected.splice(jQuery.inArray(elem, gadget.selected), 1);
  } else if ($(elem).hasClass("sg_rejected")) {
    $(elem).removeClass('sg_rejected');
    gadget.rejected.splice(jQuery.inArray(elem, gadget.rejected), 1);
  } else if ($(elem).hasClass("sg_suggested")) {
    $(elem).addClass('sg_rejected');
    gadget.rejected.push(elem);
  } else {
    $(elem).addClass('sg_selected');
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
  $("*:not(.sg_ignore)").bind("mouseover", { 'self': this }, this.sg_mouseover);
  $("*:not(.sg_ignore)").bind("mouseout", { 'self': this }, this.sg_mouseout);
  $("*:not(.sg_ignore)").bind("click", { 'self': this }, this.sg_click);
  $("html").bind("keydown", { 'self': this }, this.listen_for_action_keys);
  $("html").bind("keyup", { 'self': this }, this.clear_action_keys);
};

SelectorGadget.prototype.removeEventHandlers = function() {
  $("*:not(.sg_ignore)").unbind("mouseover", this.sg_mouseover);
  $("*:not(.sg_ignore)").unbind("mouseout", this.sg_mouseout);
  $("*:not(.sg_ignore)").unbind("click", this.sg_click);
  $("html").unbind("keydown", this.listen_for_action_keys);
  $("html").unbind("keyup", this.clear_action_keys);
};

SelectorGadget.prototype.listen_for_action_keys = function(e) {
  var gadget = e.data.self;
  if (e.keyCode == 16 || e.keyCode == 68) { // shift or d
    gadget.special_mode = 'd';
    gadget.removeBorders();
  }
};

SelectorGadget.prototype.clear_action_keys = function(e) {
  var gadget = e.data.self;
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
    $(prediction).each(function() {
      if (!$(this).hasClass('sg_selected') && !$(this).hasClass('sg_ignore') && !$(this).hasClass('sg_rejected')) $(this).addClass('sg_suggested');
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
  $('.sg_selected').removeClass('sg_selected');
  $('.sg_rejected').removeClass('sg_rejected');
  self.removeBorders();
  self.resetOutputs();
};

SelectorGadget.prototype.resetOutputs = function() {
  this.setPath();
  this.clearSuggested();
};

SelectorGadget.prototype.clearSuggested = function() {
  $('.sg_suggested').removeClass('sg_suggested');
};

SelectorGadget.prototype.makeInterface = function() {
  this.sg_div = $('<div>').attr('id', '_sg_div').addClass('sg_bottom').addClass('sg_ignore');
  var self = this;
  var path = $('<input>').attr('id', '_sg_path_field').attr('class', 'sg_ignore').keydown(function(e) {
    if (e.keyCode == 13) {
      return self.refreshFromPath(e);
    }
  });
  this.sg_div.append(path);
  this.sg_div.append($('<input type="button" value="Go"/>').bind("click",  {'self': this}, this.refreshFromPath).attr('class', 'sg_ignore'));
  this.sg_div.append($('<input type="button" value="Clear"/>').bind("click", {'self': this}, this.clearSelected).attr('class', 'sg_ignore'));
  this.sg_div.append($('<input type="button" value="Toggle Position"/>').click(function() {
    if (self.sg_div.hasClass('sg_top')) {
      self.sg_div.removeClass('sg_top').addClass('sg_bottom');
    } else {
      self.sg_div.removeClass('sg_bottom').addClass('sg_top');
    }
  }).attr('class', 'sg_ignore'));
  $('body').prepend(this.sg_div);

  this.path_output_field = path.get(0);
};

// And go!
if (typeof(selector_gadget) == 'undefined' || selector_gadget == null) {
  var selector_gadget = null;
  (function() {
    selector_gadget = new SelectorGadget();
    selector_gadget.makeInterface();
    selector_gadget.resetOutputs();
    selector_gadget.setMode('interactive');
  })();
}