var border_width = 5;
var border_padding = 2;
var b_top = null;
var b_left = null;
var b_right = null;
var b_bottom = null;
var selected = [];
var rejected = [];
var special_mode = null;
var path_output_field = null;

function makeBorders(elem, makeRed) {
  removeBorders();
  setupBorders();

  var elem = $(elem);
  var p = elem.offset();

  var top = p.top;
  var left = p.left;
  var width = elem.outerWidth()
  var height = elem.outerHeight()
  
  b_top.css('width', px(width + border_padding * 2 + border_width * 2)).css('top', px(top - border_width - border_padding)).css('left', px(left - border_padding - border_width));
  b_bottom.css('width', px(width + border_padding * 2 + border_width * 2)).css('top', px(top + height + border_padding)).css('left', px(left - border_padding - border_width));
  b_left.css('height', px(height + border_padding * 2)).css('top', px(top - border_padding)).css('left', px(left - border_padding - border_width));
  b_right.css('height', px(height + border_padding * 2)).css('top', px(top - border_padding)).css('left', px(left + width + border_padding));

  if (makeRed || elem.hasClass("sg_suggested")) {
    b_top.addClass('sg_border_red');
    b_bottom.addClass('sg_border_red');
    b_left.addClass('sg_border_red');
    b_right.addClass('sg_border_red');
  } else {
    if (b_top.hasClass('sg_border_red')) {
      b_top.removeClass('sg_border_red');
      b_bottom.removeClass('sg_border_red');
      b_left.removeClass('sg_border_red');
      b_right.removeClass('sg_border_red');
    }
  }
  
  showBorders();
}

function px(p) {
  return p + 'px';
}

function showBorders() {
  b_top.show();
  b_bottom.show();
  b_left.show();
  b_right.show();
}

function removeBorders() {
  if (b_top) {
    b_top.hide();
    b_bottom.hide();
    b_left.hide();
    b_right.hide();
    $('.sg_highlighted').removeClass('sg_highlighted');
  }
}

function setupBorders() {
  if (!b_top) {
    var width = border_width + 'px';
    b_top = $('<div>').addClass('sg_border').css('height', width).hide();
    b_bottom = $('<div>').addClass('sg_border').css('height', width).hide();
    b_left = $('<div>').addClass('sg_border').css('width', width).hide();
    b_right = $('<div>').addClass('sg_border').css('width', width).hide();

    document.body.appendChild(b_top.get(0));
    document.body.appendChild(b_bottom.get(0));
    document.body.appendChild(b_left.get(0));
    document.body.appendChild(b_right.get(0));
  }
}

function sg_mouseover(e) {
  if (this == document.body || this == document.body.parentNode) return;
  var self = $(this);
  $(this).addClass('sg_highlighted');
  if (special_mode == 'd') {
    var parent = firstSelectedOrSuggestedParent(this);
    if (parent != this)
      makeBorders(parent, true);
    else
      makeBorders(this);
  } else {
    makeBorders(this);
  }
  return false;
}

function firstSelectedOrSuggestedParent(elem) {
  var orig = elem;
  if ($(elem).hasClass('sg_suggested') || $(elem).hasClass('sg_selected')) return elem
  while (elem.parentNode && (elem = elem.parentNode)) {
    if ($(elem).hasClass('sg_suggested') || $(elem).hasClass('sg_selected')) return elem
  }
  return orig;
}

function sg_mouseout(e) {
  if (this == document.body || this == document.body.parentNode) return;
  removeBorders();
  return false;
}

function sg_click(e) {
  var elem = this;
  if (elem == document.body || elem == document.body.parentNode) return;
  window.getSelection().removeAllRanges();
  
  if (special_mode == 'd') {
    var potential_elem = firstSelectedOrSuggestedParent(elem);
    if (potential_elem != elem) {
      elem = potential_elem;
    }
  }  
  
  if ($(elem).hasClass('sg_selected')) {
    $(elem).removeClass('sg_selected');
    selected.splice(jQuery.inArray(elem, selected), 1);
  } else if ($(elem).hasClass("sg_rejected")) {
    $(elem).removeClass('sg_rejected');
    rejected.splice(jQuery.inArray(elem, rejected), 1);
  } else if ($(elem).hasClass("sg_suggested")) {
    $(elem).addClass('sg_rejected');
    rejected.push(elem);
  } else {
    $(elem).addClass('sg_selected');
    selected.push(elem);
  }

  clearSuggested()
  var prediction = predictCss(selected, rejected);
  suggestPredicted(prediction);
  setPath(prediction);
  removeBorders();

  return false;
}

function setupEventHandlers() {
  $("*").bind("mouseover", sg_mouseover);
  $("*").bind("mouseout", sg_mouseout);
  $("*").bind("click", sg_click);
  $("html").bind("keydown", listen_for_action_keys);
  $("html").bind("keyup", clear_action_keys);
}

function removeEventHandlers() {
  $("*").unbind("mouseover", sg_mouseover);
  $("*").unbind("mouseout", sg_mouseout);
  $("*").unbind("click", sg_click);
  $("html").unbind("keydown", listen_for_action_keys);
  $("html").unbind("keyup", clear_action_keys);
}

function listen_for_action_keys(e) {
  if (e.keyCode == 16 || e.keyCode == 68) { // shift or d
    special_mode = 'd';
    removeBorders();
  }
}

function clear_action_keys(e) {
  removeBorders();
  special_mode = null;
}

function setMode(mode) {
  if (mode == 'browse') {
    removeEventHandlers();
  } else if (mode == 'interactive') {
    setupEventHandlers();
  }
  clearSelected();
}

function suggestPredicted(prediction) {
  if (prediction && prediction != '') {
    $(prediction).each(function() {
      if (!$(this).hasClass('sg_selected') && !$(this).hasClass('sg_rejected')) $(this).addClass('sg_suggested');
    });
  }
}

function setPath(prediction) {
  if (prediction && prediction.length > 0)
    path_output_field.value = prediction;
  else
    path_output_field.value = 'No valid path found.';
}

function refreshFromPath() {
  var path = path_output_field.value;
  clearSelected();
  suggestPredicted(path);
  setPath(path);
}

function clearSelected() {
  selected = [];
  rejected = [];
  $('.sg_selected').removeClass('sg_selected');
  $('.sg_rejected').removeClass('sg_rejected');
  removeBorders();
  resetOutputs();
}

function resetOutputs() {
  setPath();
  clearSuggested();
}

function clearSuggested() {
  $('.sg_suggested').removeClass('sg_suggested');
}

function makeInterface() {
  path_output_field = $('<input>').attr('id', '_sg_path_field').keydown(function(e) {
    if (e.keyCode == 13) {
      return refreshFromPath(e);
    }
  });
  $('body').prepend(path_output_field);
  path_output_field = path_output_field.get(0);
}

// And go!
(function() {
  makeInterface();
  resetOutputs();
  setMode('interactive');
})();