/*
 The MIT License

 Copyright (c) 2012 Andrew Cantino
 Copyright (c) 2009 Andrew Cantino & Kyle Maxwell

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

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
	this.ignore_class = 'selectorgadget_ignore';
  this.unbound = false;
  this.prediction_helper = new DomPredictionHelper();
  this.restricted_elements = jQuerySG.map(['html', 'body', 'head', 'base'], function(selector) { return jQuerySG(selector).get(0) });
}
SelectorGadget.prototype = new Object();

SelectorGadget.prototype.makeBorders = function(orig_elem, makeRed) {
  this.removeBorders();
  this.setupBorders();

  if (orig_elem.parentNode)
    var path_to_show = orig_elem.parentNode.tagName.toLowerCase() + ' ' + orig_elem.tagName.toLowerCase();
  else
  var path_to_show = orig_elem.tagName.toLowerCase();

  var elem = jQuerySG(orig_elem);
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
  }
}

SelectorGadget.prototype.setupBorders = function() {
  if (!this.b_top) {
    var width = this.border_width + 'px';
    this.b_top = jQuerySG('<div>').addClass('selectorgadget_border').css('height', width).hide().bind("mousedown.sg", { 'self': this }, this.sgMousedown);
    this.b_bottom = jQuerySG('<div>').addClass('selectorgadget_border').addClass('selectorgadget_bottom_border').css('height', this.px(this.border_width + 6)).hide().bind("mousedown.sg", { 'self': this }, this.sgMousedown);
    this.b_left = jQuerySG('<div>').addClass('selectorgadget_border').css('width', width).hide().bind("mousedown.sg", { 'self': this }, this.sgMousedown);
    this.b_right = jQuerySG('<div>').addClass('selectorgadget_border').css('width', width).hide().bind("mousedown.sg", { 'self': this }, this.sgMousedown);

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
    this.b_top = this.b_bottom = this.b_left = this.b_right = null;
  }
};

SelectorGadget.prototype.selectable = function(elem) {
	return (!this.css_restriction || (this.css_restriction && jQuerySG(elem).is(this.css_restriction)));
};

SelectorGadget.prototype.sgMouseover = function(e) {
  var gadget = e.data.self;
  if (gadget.unbound) return true;
  if (this == document.body || this == document.body.parentNode) return false;
  var self = jQuerySG(this);

	gadget.unhighlightIframes();
	if (self.is("iframe")) gadget.highlightIframe(self, e);

  if (gadget.special_mode != 'd') { // Jump to any the first selected parent of this node.
    var parent = gadget.firstSelectedOrSuggestedParent(this);
    if (parent != null && parent != this && gadget.selectable(parent)) {
      gadget.makeBorders(parent, true);
   } else {
			if (gadget.selectable(self)) gadget.makeBorders(this);
		}
  } else {
    if (!jQuerySG('.selectorgadget_selected', this).get(0)) {
			if (gadget.selectable(self)) gadget.makeBorders(this);
    }
  }
  return false;
};

SelectorGadget.prototype.firstSelectedOrSuggestedParent = function(elem) {
  var orig = elem;
  if (jQuerySG(elem).hasClass('selectorgadget_suggested') || jQuerySG(elem).hasClass('selectorgadget_selected')) return elem
  while (elem.parentNode && (elem = elem.parentNode)) {
    if (jQuerySG.inArray(elem, this.restricted_elements) == -1)
      if (jQuerySG(elem).hasClass('selectorgadget_suggested') || jQuerySG(elem).hasClass('selectorgadget_selected')) return elem
  }
  return null;
};

SelectorGadget.prototype.sgMouseout = function(e) {
	var gadget = e.data.self;
  if (gadget.unbound) return true;
  if (this == document.body || this == document.body.parentNode) return false;
  var elem = jQuerySG(this);
  e.data.self.removeBorders();
  return false;
};

SelectorGadget.prototype.highlightIframe = function(elem, click) {
  var p = elem.offset();
	var self = this;
	var target = jQuerySG(click.target);
  var block = jQuerySG('<div>').css('position', 'absolute').css('z-index', '99998').css('width', this.px(elem.outerWidth())).
                              css('height', this.px(elem.outerHeight())).css('top', this.px(p.top)).css('left', this.px(p.left)).
                              css('background-color', '#AAA').css('opacity', '0.6').addClass("selectorgadget_iframe").addClass('selectorgadget_clean');

  var instructions = jQuerySG("<div><span>This is an iframe.  To select in it, </span></div>").
															css({ width: "200px", border: "1px solid #888",
																		padding: "5px", "background-color": "white",
																		position: "absolute", "z-index": "99999",
																		top: this.px(p.top + (elem.outerHeight() / 4.0)),
																		left: this.px(p.left + (elem.outerWidth() - 200) / 2.0),
																		height: "150px" }).
															addClass("selectorgadget_iframe_info").addClass("selectorgadget_iframe").addClass('selectorgadget_clean');

	var src = null;
	try {
		src = elem.contents().get(0).location.href;
	} catch(e) {
		src = elem.attr("src");
	}
	instructions.append(jQuerySG("<a target='_top'>click here to open it</a>").attr("href", src));
	instructions.append(jQuerySG("<span>, then relaunch SelectorGadget.</span>"));
	document.body.appendChild(instructions.get(0));

	block.click(function() {
		if (self.selectable(target)) target.mousedown();
	});
  document.body.appendChild(block.get(0));
};

SelectorGadget.prototype.unhighlightIframes = function(elem, click) {
	jQuerySG(".selectorgadget_iframe").remove();
};

SelectorGadget.prototype.sgMousedown = function(e) {
  var gadget = e.data.self;
  if (gadget.unbound) return true;
  var elem = this;
  var w_elem = jQuerySG(elem);

  if (w_elem.hasClass('selectorgadget_border')) {
    // They have clicked on one of our floating borders, target the element that we are bordering.
    elem = elem.target_elem || elem;
    w_elem = jQuerySG(elem);
  }

  if (elem == document.body || elem == document.body.parentNode) return;

  if (gadget.special_mode != 'd') {
    var potential_elem = gadget.firstSelectedOrSuggestedParent(elem);
    if (potential_elem != null && potential_elem != elem) {
      elem = potential_elem;
      w_elem = jQuerySG(elem);
    }
  } else {
    if (jQuerySG('.selectorgadget_selected', this).get(0)) gadget.blockClicksOn(elem); // Don't allow selection of elements that have a selected child.
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

  gadget.clearSuggested()
  var prediction = gadget.prediction_helper.predictCss(jQuerySG(gadget.selected), jQuerySG(gadget.rejected.concat(gadget.restricted_elements)));
  gadget.suggestPredicted(prediction);
  gadget.setPath(prediction);

  gadget.removeBorders();
  gadget.blockClicksOn(elem);
  w_elem.trigger("mouseover.sg", { 'self': gadget }); // Refresh the borders by triggering a new mouseover event.

  return false;
};

SelectorGadget.prototype.setupEventHandlers = function() {
  jQuerySG("*:not(.selectorgadget_ignore)").bind("mouseover.sg", { 'self': this }, this.sgMouseover);
  jQuerySG("*:not(.selectorgadget_ignore)").bind("mouseout.sg", { 'self': this }, this.sgMouseout);
  jQuerySG("*:not(.selectorgadget_ignore)").bind("mousedown.sg", { 'self': this }, this.sgMousedown);
  jQuerySG("html").bind("keydown.sg", { 'self': this }, this.listenForActionKeys);
  jQuerySG("html").bind("keyup.sg", { 'self': this }, this.clearActionKeys);
};

// Why doesn't this work?
// SelectorGadget.prototype.removeEventHandlers = function() {
//   // For some reason the jQuery unbind isn't working for me.
//
//   // jQuerySG("*").unbind("mouseover.sg");//, this.sgMouseover);
//   // jQuerySG("*").unbind("mouseout.sg");//, this.sgMouseout);
//   // jQuerySG("*").unbind("click.sg");//, this.sgMousedown);
//   // jQuerySG("html").unbind("keydown.sg");//, this.listenForActionKeys);
//   // jQuerySG("html").unbind("keyup.sg");//, this.clearActionKeys);
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
  var elem = jQuerySG(elem);
  var p = elem.offset();
  var block = jQuerySG('<div>').css('position', 'absolute').css('z-index', '9999999').css('width', this.px(elem.outerWidth())).
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
    jQuerySG(prediction).each(function() {
      count += 1;
      if (!jQuerySG(this).hasClass('selectorgadget_selected') && !jQuerySG(this).hasClass('selectorgadget_ignore') && !jQuerySG(this).hasClass('selectorgadget_rejected')) jQuerySG(this).addClass('selectorgadget_suggested');
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

SelectorGadget.prototype.showXPath = function(e) {
  var self = (e && e.data && e.data.self) || this;
  var path = self.path_output_field.value;
  if (path == 'No valid path found.') return;
  prompt("The CSS selector '" + path + "' as an XPath is shown below.  Please report any bugs that you find with this converter.",
         self.prediction_helper.cssToXPath(path));
};

SelectorGadget.prototype.clearSelected = function(e) {
  var self = (e && e.data && e.data.self) || this;
  self.selected = [];
  self.rejected = [];
  jQuerySG('.selectorgadget_selected').removeClass('selectorgadget_selected');
  jQuerySG('.selectorgadget_rejected').removeClass('selectorgadget_rejected');
  self.removeBorders();
  self.clearSuggested();
};

SelectorGadget.prototype.clearEverything = function(e) {
  var self = (e && e.data && e.data.self) || this;
  self.clearSelected();
  self.resetOutputs();
};

SelectorGadget.prototype.resetOutputs = function() {
  this.setPath();
};

SelectorGadget.prototype.clearSuggested = function() {
  jQuerySG('.selectorgadget_suggested').removeClass('selectorgadget_suggested');
  if (this.clear_button) this.clear_button.attr('value', 'Clear');
};

SelectorGadget.prototype.showHelp = function() {
  alert("(Better help coming soon!  Please visit http://selectorgadget.com!  Please report bugs!)\n\nClick on a page element that you would like your selector to match (it will turn green). SelectorGadget will then generate a minimal CSS selector for that element, and will highlight (yellow) everything that is matched by the selector. Now click on a highlighted element to remove it from the selector (red), or click on an unhighlighted element to add it to the selector. Through this process of selection and rejection, SelectorGadget helps you to come up with the perfect CSS selector for your needs.\n\nHolding 'shift' while moving the mouse will let you select elements inside of other selected ones.");
};

SelectorGadget.prototype.showOptions = function() {
  alert("hi!");
};

SelectorGadget.prototype.useRemoteInterface = function() {
	return (window.sg_options && window.sg_options.remote_interface);
};

SelectorGadget.prototype.updateRemoteInterface = function(data_obj) {
	this.addScript(this.composeRemoteUrl(window.sg_options.remote_interface, data_obj));
};

SelectorGadget.prototype.composeRemoteUrl = function(url, data_obj) {
	var params = (url.split("?")[1] && url.split("?")[1].split("&")) || [];
	params.push("t=" + (new Date()).getTime());
	params.push("url=" + encodeURIComponent(window.location.href));
	if (data_obj) {
		for (var key in data_obj) {
			params.push(encodeURIComponent(key) + '=' + encodeURIComponent(data_obj[key]));
		}
	}
	if (this.remote_data) {
		for (var key in this.remote_data) {
			params.push(encodeURIComponent("data[" + key + "]") + '=' + encodeURIComponent(this.remote_data[key]));
		}
	}
	return (url.split("?")[0] + "?" + params.join("&"));
};

SelectorGadget.prototype.addScript = function(src) {
  var s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', src);
  var head = document.getElementsByTagName('head')[0];
  if (head) {
    head.appendChild(s);
  } else {
    document.body.appendChild(s);
  }
};

SelectorGadget.prototype.makeInterface = function() {
  this.sg_div = jQuerySG('<div>').attr('id', 'selectorgadget_main').addClass('selectorgadget_bottom').addClass('selectorgadget_ignore');

	if (this.useRemoteInterface()) {
		this.path_output_field = { value: null };
		this.remote_data = {};
		this.updateRemoteInterface();
	} else {
		this.makeStandardInterface();
	}

	jQuerySG('body').append(this.sg_div);
};

SelectorGadget.prototype.makeStandardInterface = function() {
  var self = this;
  var path = jQuerySG('<input>').attr('id', 'selectorgadget_path_field').addClass('selectorgadget_ignore').addClass('selectorgadget_input_field').keydown(function(e) {
    if (e.keyCode == 13) {
      return self.refreshFromPath(e);
    }
  }).focus(function() { jQuerySG(this).select(); });
  this.sg_div.append(path);
  this.clear_button = jQuerySG('<input type="button" value="Clear"/>').bind("click", {'self': this}, this.clearEverything).addClass('selectorgadget_ignore').addClass('selectorgadget_input_field');
  this.sg_div.append(this.clear_button);
  this.sg_div.append(jQuerySG('<input type="button" value="Toggle Position"/>').click(function() {
    if (self.sg_div.hasClass('selectorgadget_top')) {
      self.sg_div.removeClass('selectorgadget_top').addClass('selectorgadget_bottom');
    } else {
      self.sg_div.removeClass('selectorgadget_bottom').addClass('selectorgadget_top');
    }
  }).addClass('selectorgadget_ignore').addClass('selectorgadget_input_field'));

  this.sg_div.append(jQuerySG('<input type="button" value="XPath"/>').bind("click", {'self': this}, this.showXPath).addClass('selectorgadget_ignore').addClass('selectorgadget_input_field'));

  this.sg_div.append(jQuerySG('<input type="button" value="?"/>').bind("click", {'self': this}, this.showHelp).addClass('selectorgadget_ignore').addClass('selectorgadget_input_field'));

  this.sg_div.append(jQuerySG('<input type="button" value="Options"/>').bind("click", {'self': this}, this.showOptions).addClass('selectorgadget_ignore').addClass('selectorgadget_input_field'));

  this.sg_div.append(jQuerySG('<input type="button" value="X"/>').bind("click", {'self': this}, this.unbindAndRemoveInterface).addClass('selectorgadget_ignore').addClass('selectorgadget_input_field'));

  // this.sg_div.append(
  //   jQuerySG('<span class="selectorgadget_ignore selectorgadget_option selectorgadget_new_line">Show XPath</span>').bind("click", {'self': this}, this.showXPath)
  // );

  this.path_output_field = path.get(0);
};

SelectorGadget.prototype.removeInterface = function(e) {
  this.sg_div.remove();
  this.sg_div = null;
};

SelectorGadget.prototype.unbind = function(e) {
  var self = (e && e.data && e.data.self) || this;
  self.unbound = true;
  self.removeBorderFromDom();
  self.clearSelected();
};

SelectorGadget.prototype.unbindAndRemoveInterface = function(e) {
  var self = (e && e.data && e.data.self) || this;
  self.unbind();
  self.removeInterface();
};

SelectorGadget.prototype.setOutputMode = function(e, output_mode) {
  var self = (e && e.data && e.data.self) || this;
  self.output_mode = (e && e.data && e.data.mode) || output_mode;
};

SelectorGadget.prototype.rebind = function() {
  this.unbound = false;
  this.clearEverything();
  this.setupBorders();
};

SelectorGadget.prototype.rebindAndMakeInterface = function() {
  this.makeInterface();
  this.rebind();
};

SelectorGadget.prototype.randBetween = function(a, b) {
  return Math.floor(Math.random() * b) + a;
};

SelectorGadget.prototype.analytics = function() {
  // http://www.vdgraaf.info/google-analytics-without-javascript.html
  var utmac = 'UA-148948-9';
  var utmhn = encodeURIComponent('www.selectorgadget.com');
  var utmn = this.randBetween(1000000000,9999999999); //random request number
  var cookie = this.randBetween(10000000,99999999); //random cookie number
  var random = this.randBetween(1000000000,2147483647); //number under 2147483647
  var today = Math.round(new Date().getTime()/1000.0);
  var referer = encodeURIComponent(window.location.href); //referer url
  var uservar='-'; //enter your own user defined variable
  var utmp='sg';

  var urchinUrl = 'http://www.google-analytics.com/__utm.gif?utmwv=1&utmn=' + utmn + '&utmsr=-&utmsc=-&utmul=-&utmje=0&utmfl=-&utmdt=-&utmhn=' + utmhn + '&utmr=' + referer + '&utmp=' + utmp + '&utmac=' + utmac + '&utmcc=__utma%3D' + cookie + '.' + random + '.' + today + '.' + today + '.' + today + '.2%3B%2B__utmb%3D' + cookie + '%3B%2B__utmc%3D' + cookie + '%3B%2B__utmz%3D' + cookie + '.' + today + '.2.2.utmccn%3D(direct)%7Cutmcsr%3D(direct)%7Cutmcmd%3D(none)%3B%2B__utmv%3D' + cookie + '.' + uservar + '%3B';
  document.body.appendChild(jQuerySG('<img />').attr('src', urchinUrl).get(0));
};
