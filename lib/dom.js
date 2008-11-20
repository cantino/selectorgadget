function DomPredictionHelper() {
  this.selectorIsReasonableCache = {};
  this.selectorGetsCache = {};
}
DomPredictionHelper.prototype = new Object();

DomPredictionHelper.prototype.recursiveNodes = function(e){
  var n;
  if(e.nodeName && e.parentNode && e != document.body) {
    n = this.recursiveNodes(e.parentNode);
  } else {
    n = new Array();
  }
  n.push(e);
  return n;
};

DomPredictionHelper.prototype.escapeCssNames = function(name) {
  if (name) {
    try {
      return name.replace(/\s*sg_\w+\s*/g, '').replace(/\\/g, '\\\\').
                  replace(/\./g, '\\.').replace(/#/g, '\\#').replace(/\>/g, '\\>').replace(/\,/g, '\\,').replace(/\:/g, '\\:');
    } catch(e) {
      console.log('---');
      console.log("exception in escapeCssNames");
      console.log(name);
      console.log('---');
      return '';
    }
  } else {
    return '';
  }
};

DomPredictionHelper.prototype.childElemNumber = function(elem) {
  var count = 0;
  while (elem.previousSibling && (elem = elem.previousSibling)) {
    if (elem.nodeType == 1) count++;
  }
  return count;
};

DomPredictionHelper.prototype.pathOf = function(elem){
  var nodes = this.recursiveNodes(elem);
  var self = this;
  var path = "";
  for(var i = 0; i < nodes.length; i++) {
    var e = nodes[i];
    if (e) {
      path += e.nodeName.toLowerCase();
      var escaped = e.id && self.escapeCssNames(new String(e.id));
      if(escaped && escaped.length > 0) path += '#' + escaped;
    
      if(e.className) {
        jQuery.each(e.className.split(/ /), function() {
          var escaped = self.escapeCssNames(this);
          if (this && escaped.length > 0) {
            path += '.' + escaped;
          }
        });
      }
      path += ':nth-child(' + (self.childElemNumber(e) + 1) + ')';
      path += ' '
    }
  }
  if (path.charAt(path.length - 1) == ' ') path = path.substring(0, path.length - 1);
  return path;
};

DomPredictionHelper.prototype.commonCss = function(array) {
  try {
    var dmp = new diff_match_patch();
  } catch(e) {
    throw "Please include the diff_match_patch library.";
  }
  
  if (typeof array == 'undefined' || array.length == 0) return '';
  
  var existing_tokens = {};
  var encoded_css_array = this.encodeCssForDiff(array, existing_tokens);
  
  var collective_common = encoded_css_array.pop();
  jQuery.each(encoded_css_array, function(e) {
    var diff = dmp.diff_main(collective_common, this);
    collective_common = '';
    jQuery.each(diff, function() {
      if (this[0] == 0) collective_common += this[1];
    });
  });
  return this.decodeCss(collective_common, existing_tokens);
};

DomPredictionHelper.prototype.tokenizeCss = function(css_string) {
  var skip = false;
  var word = '';
  var tokens = [];
  // If we want to ensure, for example, ' div' as the first element instead of 'div', we could use:
  // if (css_string.substring(0,1) != ' ') css_string = " " + css_string;
  jQuery.each(css_string.replace(/,/, ' , ').replace(/\s+/g, ' ').split(''), function() {
    if (skip) {
      skip = false;
    } else if (this == '\\') {
      skip = true;
    } else if (this == '.' || this == ' ' || this == '#' || this == '>' || this == ':' || this == ',') {
      if (word.length > 0) tokens.push(word);
      word = '';
    }
    word += this;
    if (this == ' ' || this == ',') {
      tokens.push(word);
      word = '';
    }
  });
  if (word.length > 0) tokens.push(word);
  return tokens;
};

DomPredictionHelper.prototype.decodeCss = function(string, existing_tokens) {
  var inverted = this.invertObject(existing_tokens);
  var out = '';
  jQuery.each(string.split(''), function() {
    out += inverted[this];
  });
  return this.cleanCss(out);
};

// Encode css paths for diff using unicode codepoints to allow for a large number of tokens.
DomPredictionHelper.prototype.encodeCssForDiff = function(strings, existing_tokens) {
  var codepoint = 50;
  var self = this;
  var strings_out = [];
  jQuery.each(strings, function() {
    var out = new String();
    jQuery.each(self.tokenizeCss(this), function() {
      if (!existing_tokens[this]) {
        existing_tokens[this] = String.fromCharCode(codepoint++);
      }
      out += existing_tokens[this];
    });
    strings_out.push(out);
  });
  return strings_out;
};

// Have to skip over empty ('') parts in wouldLeaveFreeFloatingNthChild...
// This is taking too long.  Can we memoize?

DomPredictionHelper.prototype.reduceCss = function(css, s, r) {
  var self = this;
  var parts = self.tokenizeCss(css);
  var best_so_far = '';
  for (var pass = 0; pass < 4; pass++) {
    for (var part = 0; part < parts.length; part++) {
      var first = parts[part].substring(0,1);
      if (self.wouldLeaveFreeFloatingNthChild(parts, part)) continue;
      if ((pass == 0 && first == ':') || // :nth-child
          (pass == 1 && first != ':' && first != '.' && first != '#' && first != ' ') || // elem, etc.
          (pass == 2 && first == '.') || // classes
          (pass == 3 && first == '#')) // ids
      {
        var tmp = parts[part];
        parts[part] = '';
        var selector = parts.join('');
        if (self.selectorGets('all', s, selector) && self.selectorGets('none', r, selector) && self.selectorIsReasonable(selector)) {
          best_so_far = selector;
        } else {
          parts[part] = tmp;
        }        
      }
    }
  }
  return self.cleanCss(best_so_far);
};

DomPredictionHelper.prototype.wouldLeaveFreeFloatingNthChild = function(parts, part) {
  return (((part - 1 >= 0 && parts[part - 1].substring(0, 1) == ':') && 
           (part - 2 < 0 || parts[part - 2] == ' ') && 
           (part + 1 >= parts.length || parts[part + 1] == ' ')) || 
          ((part + 1 < parts.length && parts[part + 1].substring(0, 1) == ':') && 
           (part + 2 >= parts.length || parts[part + 2] == ' ') && 
           (part - 1 < 0 || parts[part - 1] == ' ')));
};

DomPredictionHelper.prototype.cleanCss = function(css) {
  return css.replace(/\>/, ' > ').replace(/,/, ' , ').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '').replace(/,$/, '');
};

DomPredictionHelper.prototype.predictCss = function(s, r) {
  var self = this;
  
  if (s.length == 0) return '';
  var css = self.commonCss(jQuery.map(s, function(e) { return self.pathOf(e); }));
  var simplest = self.reduceCss(css, s, r);

  // Do we get off easy?
  if (simplest.length > 0) return simplest;
  
  // Okay, then make a union and possibly try to reduce subsets.
  var union = '';
  jQuery.each(s, function() {
    union = self.pathOf(this) + ", " + union;
  });
  union = self.cleanCss(union);
  
  return self.reduceCss(union, s, r);
};

DomPredictionHelper.prototype.selectorIsReasonable = function(selector) {
  if (typeof(this.selectorIsReasonableCache[selector]) == "undefined")
    this.selectorIsReasonableCache[selector] = ($(selector).filter(function() { return $(this).is("html,body,head,base"); }).length == 0);
  return this.selectorIsReasonableCache[selector];
};

DomPredictionHelper.prototype.selectorGets = function(type, list, selector) {
  var tag = this.getArrayTag(list) + '||' + selector;
  if (typeof(this.selectorGetsCache[tag]) == "undefined")
    this.selectorGetsCache[tag] = $(selector).filter(function() { return jQuery.inArray(this, list) > -1; }).length;
  if (type == 'all') {
    return (this.selectorGetsCache[tag] == list.length);
  } else if (type == 'none') {
    return this.selectorGetsCache[tag] == 0;
  } else {
    return this.selectorGetsCache[tag] > 0;
  }
};

DomPredictionHelper.prototype.invertObject = function(object) {
  var new_object = {};
  jQuery.each(object, function(key, value) {
    new_object[value] = key;
  });
  return new_object;
};

var _global_js_unique_tag_counter = 0;
// Generate a hashcode for an object.
DomPredictionHelper.prototype.tagObject = function(obj) {
  if (!obj._js_fu_unique_tag) obj._js_fu_unique_tag = ++_global_js_unique_tag_counter;
  return obj._js_fu_unique_tag;
};

// Generate a hashcode for an array.
// NOTE: Assumes flat array.
DomPredictionHelper.prototype.getArrayTag = function(arr) {
  out = '';
  arr.sort();
  for (var i = 0; i < arr.length; i++) {
    out += this.tagObject(arr[i]) + ',';
  }
  return out;
};
