function recursiveNodes(e){
  var n;
  if(e.nodeName && e.parentNode && e != document.body) {
    n = recursiveNodes(e.parentNode);
  } else {
    n = new Array();
  }
  n.push(e);
  return n;
}

function escapeCssNames(name) {
  if (name) {
    try {
      return name.replace(/\s*parselet_\w+\s*/g, '').replace(/\\/g, '\\\\').
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
}

function childElemNumber(elem) {
  var count = 0;
  while (elem.previousSibling && (elem = elem.previousSibling)) {
    if (elem.nodeType == 1) count++;
  }
  return count;
}

function pathOf(elem){
  var nodes = recursiveNodes(elem);
  var path = "";
  for(var i = 0; i < nodes.length; i++) {
    var e = nodes[i];
    if (e) {
      path += e.nodeName.toLowerCase();
      var escaped = e.id && escapeCssNames(new String(e.id));
      if(escaped && escaped.length > 0) path += '#' + escaped;
    
      if(e.className) {
        jQuery.each(e.className.split(/ /), function() {
          var escaped = escapeCssNames(this);
          if (this && escaped.length > 0) {
            path += '.' + escaped;
          }
        });
      }
      path += ':nth-child(' + (childElemNumber(e) + 1) + ')';
      path += ' '
    }
  }
  if (path.charAt(path.length - 1) == ' ') path = path.substring(0, path.length - 1);
  return path;
}

function commonCss(array) {
  try {
    var dmp = new diff_match_patch();
  } catch(e) {
    throw "Please include the diff_match_patch library.";
  }
  
  if (typeof array == 'undefined' || array.length == 0) return '';
  
  var existing_tokens = {};
  encoded_css_array = encodeCssForDiff(array, existing_tokens);
  
  var collective_common = encoded_css_array.pop();
  jQuery.each(encoded_css_array, function(e) {
    var diff = dmp.diff_main(collective_common, this);
    collective_common = '';
    jQuery.each(diff, function() {
      if (this[0] == 0) collective_common += this[1];
    });
  });
  return decodeCss(collective_common, existing_tokens);
}

function tokenizeCss(css_string) {
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

function decodeCss(string, existing_tokens) {
  var inverted = invertObject(existing_tokens);
  var out = '';
  jQuery.each(string.split(''), function() {
    out += inverted[this];
  });
  return cleanCss(out);
}

// Encode css paths for diff using unicode codepoints to allow for a large number of tokens.
function encodeCssForDiff(strings, existing_tokens) {
  var codepoint = 50;
  var strings_out = [];
  jQuery.each(strings, function() {
    var out = new String();
    jQuery.each(tokenizeCss(this), function() {
      if (!existing_tokens[this]) {
        existing_tokens[this] = String.fromCharCode(codepoint++);
      }
      out += existing_tokens[this];
    });
    strings_out.push(out);
  });
  return strings_out;
}

// Have to skip over empty ('') parts in wouldLeaveFreeFloatingNthChild...
// This is taking too long.  Can we memoize?

function reduceCss(css, s, r) {
  var parts = tokenizeCss(css);
  var best_so_far = '';
  for (var pass = 0; pass < 4; pass++) {
    for (var part = 0; part < parts.length; part++) {
      var first = parts[part].substring(0,1);
      if (wouldLeaveFreeFloatingNthChild(parts, part)) continue;
      if ((pass == 0 && first == ':') || // :nth-child
          (pass == 1 && first != ':' && first != '.' && first != '#' && first != ' ') || // elem, etc.
          (pass == 2 && first == '.') || // classes
          (pass == 3 && first == '#')) // ids
      {
        var tmp = parts[part];
        parts[part] = '';
        var selector = parts.join('');
        if (selectorGets('all', s, selector) && selectorGets('none', r, selector) && selectorIsReasonable(selector)) {
          best_so_far = selector;
        } else {
          parts[part] = tmp;
        }        
      }
    }
  }
  return cleanCss(best_so_far);
}

function wouldLeaveFreeFloatingNthChild(parts, part) {
  return (((part - 1 >= 0 && parts[part - 1].substring(0, 1) == ':') && 
           (part - 2 < 0 || parts[part - 2] == ' ') && 
           (part + 1 >= parts.length || parts[part + 1] == ' ')) || 
          ((part + 1 < parts.length && parts[part + 1].substring(0, 1) == ':') && 
           (part + 2 >= parts.length || parts[part + 2] == ' ') && 
           (part - 1 < 0 || parts[part - 1] == ' ')));
}

function cleanCss(css) {
  return css.replace(/\>/, ' > ').replace(/,/, ' , ').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '').replace(/,$/, '');
}

function predictCss(s, r) {
  if (s.length == 0) return '';
  var css = commonCss(jQuery.map(s, function(e) { return pathOf(e); }));
  var simplest = reduceCss(css, s, r);

  // Do we get off easy?
  if (simplest.length > 0) return simplest;
  
  // Okay, then make a union and possibly try to reduce subsets.
  var union = '';
  jQuery.each(s, function() {
    union = pathOf(this) + ", " + union;
  });
  union = cleanCss(union);
  
  return reduceCss(union, s, r);
}

var selectorIsReasonableCache = {};
function selectorIsReasonable(selector) {
  if (typeof(selectorIsReasonableCache[selector]) == "undefined")
    selectorIsReasonableCache[selector] = ($(selector).filter(function() { return $(this).is("html,body,head,base"); }).length == 0);
  return selectorIsReasonableCache[selector];
}

var selectorGetsCache = {};
function selectorGets(type, list, selector) {
  var tag = getArrayTag(list) + '||' + selector;
  if (typeof(selectorGetsCache[tag]) == "undefined")
    selectorGetsCache[tag] = $(selector).filter(function() { return jQuery.inArray(this, list) > -1; }).length;
  if (type == 'all') {
    return (selectorGetsCache[tag] == list.length);
  } else if (type == 'none') {
    return selectorGetsCache[tag] == 0;
  } else {
    return selectorGetsCache[tag] > 0;
  }
}

function invertObject(object) {
  var new_object = {};
  jQuery.each(object, function(key, value) {
    new_object[value] = key;
  });
  return new_object;
}

var _global_js_unique_tag_counter = 0;
// Generate a hashcode for an object.
function tagObject(obj) {
  if (!obj._js_fu_unique_tag) obj._js_fu_unique_tag = ++_global_js_unique_tag_counter;
  return obj._js_fu_unique_tag;
}

// Generate a hashcode for an array.
// NOTE: Assumes flat array.
function getArrayTag(arr) {
  out = '';
  arr.sort();
  for (var i = 0; i < arr.length; i++) {
    out += tagObject(arr[i]) + ',';
  }
  return out;
}
