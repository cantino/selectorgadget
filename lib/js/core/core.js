/**
 * @file
 * SelectorGadget Core Class.
 */

var DomPredictionHelper = require('./dom.coffee')
  , jQuerySG = require('./init.coffee')
  , util = require('util')
  , events = require('events')
  , EventEmitter = events.EventEmitter;

// For non-node environments.
// @todo: move to init file
if (typeof window != 'undefined') window.jQuerySG = jQuerySG;

/**
 * SelectorGadget constructor.
 */
function SelectorGadget() {

  EventEmitter.call(this);

  // Define properties defaults.
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
  this.ignore_class = 'selectorgadget_ignore';
  this.unbound = false;
  this.prediction_helper = new DomPredictionHelper();

  this.restricted_elements = ['html', 'body', 'head', 'base'].map(function (tag) {
    return document.getElementsByTagName(tag)[0];
  }).filter(function (elem) {
    return elem ? true : false;
  });
}

// Inherit EventEmitter prototype.
util.inherits(SelectorGadget, EventEmitter);

SelectorGadget.prototype.makeBorders = function(orig_elem, makeRed) {
  var elem, height, left, p, path_to_show, top, width;
  this.removeBorders();
  this.setupBorders();
  if (orig_elem.parentNode) {
    path_to_show = orig_elem.parentNode.tagName.toLowerCase() + ' ' + orig_elem.tagName.toLowerCase();
  } else {
    path_to_show = orig_elem.tagName.toLowerCase();
  }
  elem = jQuerySG(orig_elem);
  p = elem.offset();
  top = p.top;
  left = p.left;
  width = elem.outerWidth();
  height = elem.outerHeight();
  this.b_top.css('width', this.px(width + this.border_padding * 2 + this.border_width * 2)).css('top', this.px(top - this.border_width - this.border_padding)).css('left', this.px(left - this.border_padding - this.border_width));
  this.b_bottom.css('width', this.px(width + this.border_padding * 2 + this.border_width * 2 - 5)).css('top', this.px(top + height + this.border_padding)).css('left', this.px(left - this.border_padding - this.border_width)).text(path_to_show);
  this.b_left.css('height', this.px(height + this.border_padding * 2)).css('top', this.px(top - this.border_padding)).css('left', this.px(left - this.border_padding - this.border_width));
  this.b_right.css('height', this.px(height + this.border_padding * 2)).css('top', this.px(top - this.border_padding)).css('left', this.px(left + width + this.border_padding));
  this.b_right.get(0).target_elem = this.b_left.get(0).target_elem = this.b_top.get(0).target_elem = this.b_bottom.get(0).target_elem = orig_elem;
  if (makeRed || elem.hasClass("selectorgadget_suggested") || elem.hasClass("selectorgadget_selected")) {
    this.b_top.addClass('selectorgadget_border_red');
    this.b_bottom.addClass('selectorgadget_border_red');
    this.b_left.addClass('selectorgadget_border_red');
    this.b_right.addClass('selectorgadget_border_red');
  } else {
    if (this.b_top.hasClass('selectorgadget_border_red')) {
      this.b_top.removeClass('selectorgadget_border_red');
      this.b_bottom.removeClass('selectorgadget_border_red');
      this.b_left.removeClass('selectorgadget_border_red');
      this.b_right.removeClass('selectorgadget_border_red');
    }
  }
  return this.showBorders();
};

SelectorGadget.prototype.px = function(p) {
  return p + 'px';
};

SelectorGadget.prototype.showBorders = function() {
  this.b_top.show();
  this.b_bottom.show();
  this.b_left.show();
  return this.b_right.show();
};

SelectorGadget.prototype.removeBorders = function() {
  if (this.b_top) {
    this.b_top.hide();
    this.b_bottom.hide();
    this.b_left.hide();
    return this.b_right.hide();
  }
};

SelectorGadget.prototype.setupBorders = function() {
  var width;
  if (!this.b_top) {
    width = this.border_width + 'px';
    this.b_top = jQuerySG('<div>').addClass('selectorgadget_border').css('height', width).hide().bind("mousedown.sg", {
      'self': this
    }, this.sgMousedown);
    this.b_bottom = jQuerySG('<div>').addClass('selectorgadget_border').addClass('selectorgadget_bottom_border').css('height', this.px(this.border_width + 6)).hide().bind("mousedown.sg", {
      'self': this
    }, this.sgMousedown);
    this.b_left = jQuerySG('<div>').addClass('selectorgadget_border').css('width', width).hide().bind("mousedown.sg", {
      'self': this
    }, this.sgMousedown);
    this.b_right = jQuerySG('<div>').addClass('selectorgadget_border').css('width', width).hide().bind("mousedown.sg", {
      'self': this
    }, this.sgMousedown);
    return this.addBorderToDom();
  }
};

SelectorGadget.prototype.addBorderToDom = function() {
  document.body.appendChild(this.b_top.get(0));
  document.body.appendChild(this.b_bottom.get(0));
  document.body.appendChild(this.b_left.get(0));
  return document.body.appendChild(this.b_right.get(0));
};

SelectorGadget.prototype.removeBorderFromDom = function() {
  if (this.b_top) {
    this.b_top.remove();
    this.b_bottom.remove();
    this.b_left.remove();
    this.b_right.remove();
    return this.b_top = this.b_bottom = this.b_left = this.b_right = null;
  }
};

SelectorGadget.prototype.selectable = function(elem) {
  return !this.css_restriction || (this.css_restriction && jQuerySG(elem).is(this.css_restriction));
};

SelectorGadget.prototype.sgMouseover = function(e) {
  var gadget, parent, self;
  gadget = e.data.self;
  if (gadget.unbound) {
    return true;
  }
  if (this === document.body || this === document.body.parentNode) {
    return false;
  }
  self = jQuerySG(this);
  gadget.unhighlightIframes();
  if (self.is("iframe")) {
    gadget.highlightIframe(self, e);
  }
  if (gadget.special_mode !== 'd') {
    parent = gadget.firstSelectedOrSuggestedParent(this);
    if (parent !== null && parent !== this && gadget.selectable(parent)) {
      gadget.makeBorders(parent, true);
    } else {
      if (gadget.selectable(self)) {
        gadget.makeBorders(this);
      }
    }
  } else {
    if (!jQuerySG('.selectorgadget_selected', this).get(0)) {
      if (gadget.selectable(self)) {
        gadget.makeBorders(this);
      }
    }
  }
  return false;
};

SelectorGadget.prototype.firstSelectedOrSuggestedParent = function(elem) {
  var orig;
  orig = elem;
  if (jQuerySG(elem).hasClass('selectorgadget_suggested') || jQuerySG(elem).hasClass('selectorgadget_selected')) {
    return elem;
  }
  while (elem.parentNode && (elem = elem.parentNode)) {
    if (jQuerySG.inArray(elem, this.restricted_elements) === -1) {
      if (jQuerySG(elem).hasClass('selectorgadget_suggested') || jQuerySG(elem).hasClass('selectorgadget_selected')) {
        return elem;
      }
    }
  }
  return null;
};

SelectorGadget.prototype.sgMouseout = function(e) {
  var elem, gadget;
  gadget = e.data.self;
  if (gadget.unbound) {
    return true;
  }
  if (this === document.body || this === document.body.parentNode) {
    return false;
  }
  elem = jQuerySG(this);
  gadget.removeBorders();
  return false;
};

SelectorGadget.prototype.highlightIframe = function(elem, click) {
  var block, e, instructions, p, self, src, target;
  p = elem.offset();
  self = this;
  target = jQuerySG(click.target);
  block = jQuerySG('<div>').css('position', 'absolute').css('z-index', '99998').css('width', this.px(elem.outerWidth())).css('height', this.px(elem.outerHeight())).css('top', this.px(p.top)).css('left', this.px(p.left)).css('background-color', '#AAA').css('opacity', '0.6').addClass("selectorgadget_iframe").addClass('selectorgadget_clean');
  instructions = jQuerySG("<div><span>This is an iframe.  To select in it, </span></div>").addClass("selectorgadget_iframe_info").addClass("selectorgadget_iframe").addClass('selectorgadget_clean');
  instructions.css({
    width: "200px",
    border: "1px solid #888"
  }, {
    padding: "5px",
    "background-color": "white",
    position: "absolute",
    "z-index": "99999",
    top: this.px(p.top + (elem.outerHeight() / 4.0)),
    left: this.px(p.left + (elem.outerWidth() - 200) / 2.0),
    height: "150px"
  });
  src = null;
  try {
    src = elem.contents().get(0).location.href;
  } catch (_error) {
    e = _error;
    src = elem.attr("src");
  }
  instructions.append(jQuerySG("<a target='_top'>click here to open it</a>").attr("href", src));
  instructions.append(jQuerySG("<span>, then relaunch SelectorGadget.</span>"));
  document.body.appendChild(instructions.get(0));
  block.click(function() {
    if (self.selectable(target)) {
      return target.mousedown();
    }
  });
  return document.body.appendChild(block.get(0));
};

SelectorGadget.prototype.unhighlightIframes = function(elem, click) {
  return jQuerySG(".selectorgadget_iframe").remove();
};

SelectorGadget.prototype.sgMousedown = function(e) {
  var elem, gadget, potential_elem, prediction, w_elem;
  gadget = e.data.self;
  if (gadget.unbound) {
    return true;
  }
  elem = this;
  w_elem = jQuerySG(elem);
  if (w_elem.hasClass('selectorgadget_border')) {
    elem = elem.target_elem || elem;
    w_elem = jQuerySG(elem);
  }
  if (elem === document.body || elem === document.body.parentNode) {
    return;
  }
  if (gadget.special_mode !== 'd') {
    potential_elem = gadget.firstSelectedOrSuggestedParent(elem);
    if (potential_elem !== null && potential_elem !== elem) {
      elem = potential_elem;
      w_elem = jQuerySG(elem);
    }
  } else {
    if (jQuerySG('.selectorgadget_selected', this).get(0)) {
      gadget.blockClicksOn(elem);
    }
  }
  if (!gadget.selectable(w_elem)) {
    gadget.removeBorders();
    gadget.blockClicksOn(elem);
    return false;
  }
  if (w_elem.hasClass('selectorgadget_selected')) {
    w_elem.removeClass('selectorgadget_selected');
    gadget.selected.splice(jQuerySG.inArray(elem, gadget.selected), 1);
  } else if (w_elem.hasClass("selectorgadget_rejected")) {
    w_elem.removeClass('selectorgadget_rejected');
    gadget.rejected.splice(jQuerySG.inArray(elem, gadget.rejected), 1);
  } else if (w_elem.hasClass("selectorgadget_suggested")) {
    w_elem.addClass('selectorgadget_rejected');
    gadget.rejected.push(elem);
  } else {
    w_elem.addClass('selectorgadget_selected');
    gadget.selected.push(elem);
  }
  gadget.clearSuggested();
  prediction = gadget.prediction_helper.predictCss(jQuerySG(gadget.selected), jQuerySG(gadget.rejected.concat(gadget.restricted_elements)));
  gadget.suggestPredicted(prediction);
  gadget.setPath(prediction);
  gadget.removeBorders();
  gadget.blockClicksOn(elem);
  w_elem.trigger("mouseover.sg", {
    'self': gadget
  });
  return false;
};

SelectorGadget.prototype.setupEventHandlers = function() {
  jQuerySG("*:not(.selectorgadget_ignore)").bind("mouseover.sg", {
    'self': this
  }, this.sgMouseover);
  jQuerySG("*:not(.selectorgadget_ignore)").bind("mouseout.sg", {
    'self': this
  }, this.sgMouseout);
  jQuerySG("*:not(.selectorgadget_ignore)").bind("mousedown.sg", {
    'self': this
  }, this.sgMousedown);
  jQuerySG("html").bind("keydown.sg", {
    'self': this
  }, this.listenForActionKeys);
  return jQuerySG("html").bind("keyup.sg", {
    'self': this
  }, this.clearActionKeys);
};

SelectorGadget.prototype.listenForActionKeys = function(e) {
  var gadget;
  gadget = e.data.self;
  if (gadget.unbound) {
    return true;
  }
  if (e.keyCode === 16 || e.keyCode === 68) {
    gadget.special_mode = 'd';
    return gadget.removeBorders();
  }
};

SelectorGadget.prototype.clearActionKeys = function(e) {
  var gadget;
  gadget = e.data.self;
  if (gadget.unbound) {
    return true;
  }
  gadget.removeBorders();
  return gadget.special_mode = null;
};

SelectorGadget.prototype.blockClicksOn = function(elem) {
  var block, p;
  elem = jQuerySG(elem);
  p = elem.offset();
  block = jQuerySG('<div>').css('position', 'absolute').css('z-index', '9999999').css('width', this.px(elem.outerWidth())).css('height', this.px(elem.outerHeight())).css('top', this.px(p.top)).css('left', this.px(p.left)).css('background-color', '');
  document.body.appendChild(block.get(0));
  setTimeout((function() {
    return block.remove();
  }), 400);
  return false;
};

SelectorGadget.prototype.setMode = function(mode) {
  if (mode === 'browse') {
    this.removeEventHandlers();
  } else if (mode === 'interactive') {
    this.setupEventHandlers();
  }
  return this.clearSelected();
};

SelectorGadget.prototype.suggestPredicted = function(prediction) {
  var count;
  if (prediction && prediction !== '') {
    count = 0;
    jQuerySG(prediction).each(function() {
      count += 1;
      if (!jQuerySG(this).hasClass('selectorgadget_selected') && !jQuerySG(this).hasClass('selectorgadget_ignore') && !jQuerySG(this).hasClass('selectorgadget_rejected')) {
        return jQuerySG(this).addClass('selectorgadget_suggested');
      }
    });
    if (this.clear_button) {
      if (count > 0) {
        return this.clear_button.attr('value', 'Clear (' + count + ')');
      } else {
        return this.clear_button.attr('value', 'Clear');
      }
    }
  }
};

SelectorGadget.prototype.setPath = function(prediction) {
  if (prediction && prediction.length > 0) {
    this.path_output_field.value = prediction;
  } else {
    this.path_output_field.value = 'No valid path found.';
  }
  
  this.emit('selector', this.path_output_field.value);
};

SelectorGadget.prototype.refreshFromPath = function(e) {
  var path, self;
  self = (e && e.data && e.data.self) || this;
  path = self.path_output_field.value;
  self.clearSelected();
  self.suggestPredicted(path);
  return self.setPath(path);
};

SelectorGadget.prototype.showXPath = function(e) {
  var path, self;
  self = (e && e.data && e.data.self) || this;
  path = self.path_output_field.value;
  if (path === 'No valid path found.') {
    return;
  }
  return prompt("The CSS selector '" + path + "' as an XPath is shown below.  Please report any bugs that you find with this converter.", self.prediction_helper.cssToXPath(path));
};

SelectorGadget.prototype.clearSelected = function(e) {
  var self;
  self = (e && e.data && e.data.self) || this;
  self.selected = [];
  self.rejected = [];
  jQuerySG('.selectorgadget_selected').removeClass('selectorgadget_selected');
  jQuerySG('.selectorgadget_rejected').removeClass('selectorgadget_rejected');
  self.removeBorders();
  return self.clearSuggested();
};

SelectorGadget.prototype.clearEverything = function(e) {
  var self;
  self = (e && e.data && e.data.self) || this;
  self.clearSelected();
  return self.resetOutputs();
};

SelectorGadget.prototype.resetOutputs = function() {
  return this.setPath();
};

SelectorGadget.prototype.clearSuggested = function() {
  jQuerySG('.selectorgadget_suggested').removeClass('selectorgadget_suggested');
  if (this.clear_button) {
    return this.clear_button.attr('value', 'Clear');
  }
};

SelectorGadget.prototype.showHelp = function() {
  return alert("Click on a page element that you would like your selector to match (it will turn green). SelectorGadget will then generate a minimal CSS selector for that element, and will highlight (yellow) everything that is matched by the selector. Now click on a highlighted element to reject it (red), or click on an unhighlighted element to add it (green). Through this process of selection and rejection, SelectorGadget helps you to come up with the perfect CSS selector for your needs.\n\nHolding 'shift' while moving the mouse will let you select elements inside of other selected elements.");
};

SelectorGadget.prototype.useRemoteInterface = function() {
  return window.sg_options && window.sg_options.remote_interface;
};

SelectorGadget.prototype.updateRemoteInterface = function(data_obj) {
  return this.addScript(this.composeRemoteUrl(window.sg_options.remote_interface, data_obj));
};

SelectorGadget.prototype.composeRemoteUrl = function(url, data_obj) {
  var key, params;
  params = (url.split("?")[1] && url.split("?")[1].split("&")) || [];
  params.push("t=" + (new Date()).getTime());
  params.push("url=" + encodeURIComponent(window.location.href));
  if (data_obj) {
    for (key in data_obj) {
      params.push(encodeURIComponent(key) + '=' + encodeURIComponent(data_obj[key]));
    }
  }
  if (this.remote_data) {
    for (key in this.remote_data) {
      params.push(encodeURIComponent("data[" + key + "]") + '=' + encodeURIComponent(this.remote_data[key]));
    }
  }
  return url.split("?")[0] + "?" + params.join("&");
};

SelectorGadget.prototype.addScript = function(src) {
  var head, s;
  s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', src);
  head = document.getElementsByTagName('head')[0];
  if (head) {
    return head.appendChild(s);
  } else {
    return document.body.appendChild(s);
  }
};

SelectorGadget.prototype.makeInterface = function() {
  this.sg_div = jQuerySG('<div>').attr('id', 'selectorgadget_main').addClass('selectorgadget_bottom').addClass('selectorgadget_ignore');
  if (this.useRemoteInterface()) {
    this.path_output_field = {
      value: null
    };
    this.remote_data = {};
    this.updateRemoteInterface();
  } else {
    this.makeStandardInterface();
  }
  return jQuerySG('body').append(this.sg_div);
};

SelectorGadget.prototype.makeStandardInterface = function() {
  var path, self;
  self = this;
  path = jQuerySG('<input>').attr('id', 'selectorgadget_path_field').addClass('selectorgadget_ignore').addClass('selectorgadget_input_field').keydown(function(e) {
    if (e.keyCode === 13) {
      return self.refreshFromPath(e);
    }
  }).focus(function() {
    return jQuerySG(this).select();
  });
  this.sg_div.append(path);
  this.clear_button = jQuerySG('<input type="button" value="Clear"/>').bind("click", {
    'self': this
  }, this.clearEverything).addClass('selectorgadget_ignore').addClass('selectorgadget_input_field');
  this.sg_div.append(this.clear_button);
  this.sg_div.append(jQuerySG('<input type="button" value="Toggle Position"/>').click(function() {
    if (self.sg_div.hasClass('selectorgadget_top')) {
      return self.sg_div.removeClass('selectorgadget_top').addClass('selectorgadget_bottom');
    } else {
      return self.sg_div.removeClass('selectorgadget_bottom').addClass('selectorgadget_top');
    }
  }).addClass('selectorgadget_ignore').addClass('selectorgadget_input_field'));
  this.sg_div.append(jQuerySG('<input type="button" value="XPath"/>').bind("click", {
    'self': this
  }, this.showXPath).addClass('selectorgadget_ignore').addClass('selectorgadget_input_field'));
  this.sg_div.append(jQuerySG('<input type="button" value="?"/>').bind("click", {
    'self': this
  }, this.showHelp).addClass('selectorgadget_ignore').addClass('selectorgadget_input_field'));
  this.sg_div.append(jQuerySG('<input type="button" value="X"/>').bind("click", {
    'self': this
  }, this.unbindAndRemoveInterface).addClass('selectorgadget_ignore').addClass('selectorgadget_input_field'));
  return this.path_output_field = path.get(0);
};

SelectorGadget.prototype.removeInterface = function(e) {
  this.sg_div.remove();
  return this.sg_div = null;
};

SelectorGadget.prototype.unbind = function(e) {
  var self;
  self = (e && e.data && e.data.self) || this;
  self.unbound = true;
  self.removeBorderFromDom();
  return self.clearSelected();
};

SelectorGadget.prototype.unbindAndRemoveInterface = function(e) {
  var self;
  self = (e && e.data && e.data.self) || this;
  self.unbind();
  return self.removeInterface();
};

SelectorGadget.prototype.setOutputMode = function(e, output_mode) {
  var self;
  self = (e && e.data && e.data.self) || this;
  return self.output_mode = (e && e.data && e.data.mode) || output_mode;
};

SelectorGadget.prototype.rebind = function() {
  this.unbound = false;
  this.clearEverything();
  return this.setupBorders();
};

SelectorGadget.prototype.rebindAndMakeInterface = function() {
  this.makeInterface();
  return this.rebind();
};

SelectorGadget.prototype.randBetween = function(a, b) {
  return Math.floor(Math.random() * b) + a;
};

SelectorGadget.prototype.toggle = function(force) {
  if (!this.ready) {
    this.makeInterface();
    this.clearEverything();
    this.setMode('interactive');
    this.ready = true;
  } else {
    if ((typeof force == 'undefined' ? this.unbound : force)) {
      this.rebindAndMakeInterface();
    } else {
      this.unbindAndRemoveInterface();
    }
  }

  return jQuerySG('.selector_gadget_loading').remove();
};

// Return one single instance.
module.exports = new SelectorGadget();
