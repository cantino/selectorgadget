function DomPredictionHelper() {};
DomPredictionHelper.prototype = new Object();

jQuerySG.expr[":"].content = function(el, i, m) {
    var search = m[3];
    if (!search) return false;
		return jQuerySG.trim(jQuerySG(el).text().replace(/\s+/g, ' ')) == search;
};

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
      return name.replace(/\bselectorgadget_\w+\b/g, '').replace(/\\/g, '\\\\').
                  replace(/[\#\;\&\,\.\+\*\~\'\:\"\!\^\$\[\]\(\)\=\>\|\/]/g, function(e) { return '\\' + e; }).replace(/\s+/, '');
    } catch(e) {
      if (window.console) {
				console.log('---');
      	console.log("exception in escapeCssNames");
      	console.log(name);
      	console.log('---');
			}
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

DomPredictionHelper.prototype.siblingsWithoutTextNodes = function(e) {
	var nodes = e.parentNode.childNodes;
	var filtered_nodes = [];
	for (var i = 0; i < nodes.length; i++) {
		if (nodes[i].nodeName.substring(0, 1) == "#") continue;
		if (nodes[i] == e) break;
		filtered_nodes.push(nodes[i]);
	}
	return filtered_nodes;
};

DomPredictionHelper.prototype.pathOf = function(elem){
  var nodes = this.recursiveNodes(elem);
  var self = this;
  var path = "";
  for(var i = 0; i < nodes.length; i++) {
    var e = nodes[i];
    if (e) {
			var siblings = self.siblingsWithoutTextNodes(e);
			if (e.nodeName.toLowerCase() != "body") {
				for(var j = (siblings.length - 2 < 0 ? 0 : siblings.length - 2) ; j < siblings.length; j++) { // Only look at 2 previous siblings.
					if (siblings[j] == e) break;
					var name = siblings[j].nodeName;
					if(!name.match(/^(script|#.*?)$/i)) {
						path += self.cssDescriptor(siblings[j], true) + ((j + 1 == siblings.length) ? "+ " : "~ ");
					}
				}
			}
			path += self.cssDescriptor(e) + " > ";
    }
  }
  return this.cleanCss(path);
};

DomPredictionHelper.prototype.cssDescriptor = function(node, includeContents) {	
	var self = this;
  var path = node.nodeName.toLowerCase();
  var escaped = node.id && self.escapeCssNames(new String(node.id));
  if(escaped && escaped.length > 0) path += '#' + escaped;

  if(node.className) {
    jQuerySG.each(node.className.split(/ /), function() {
      var escaped = self.escapeCssNames(this);
      if (this && escaped.length > 0) {
        path += '.' + escaped;
      }
    });
  }
	if (includeContents && jQuerySG(node).contents().length < 5) { // Not too many children.
		var text = jQuerySG.trim(jQuerySG(node).text().replace(/\s+/g, ' '));
		if (text.length < 35 && text.length > 4 && text.indexOf("\"") == -1) {
			path += ":content(\"" + this.encodeContentString(text) + "\")";
		}
	}
	if (node.nodeName.toLowerCase() != "body") { // nth-child needs to be last.
		path += ':nth-child(' + (self.childElemNumber(node) + 1) + ')';
	}
	return path;
};

DomPredictionHelper.prototype.encodeContentString = function(str) {
	str = str.replace(/\"/, '\\"');
	var out = [];
	for (var i = 0; i < str.length; i++) {
		out.push(str.charCodeAt(i));
	}
	return out.join('-');
};

DomPredictionHelper.prototype.decodeContentString = function(str) {
	var parts = str.split('-');
	var out = "";
	for (var i = 0; i < parts.length; i++) {
		out += String.fromCharCode(parseInt(parts[i]));
	}
	return out;
};

DomPredictionHelper.prototype.decodeAllContentStrings = function(str) {
	var self = this;
	return str.replace(/:content\(\"([\d\-]+)\"\)/gi, function(s, substr) {
		return ":content(\"" + self.decodeContentString(substr) + "\")";
	});
};

DomPredictionHelper.prototype.cssDiff = function(array) {
  try {
    var dmp = new diff_match_patch();
  } catch(e) {
    throw "Please include the diff_match_patch library.";
  }
  
  if (typeof array == 'undefined' || array.length == 0) return '';
  
  var existing_tokens = {};
  var encoded_css_array = this.encodeCssForDiff(array, existing_tokens);
  
  var collective_common = encoded_css_array.pop();
  jQuerySG.each(encoded_css_array, function(e) {
    var diff = dmp.diff_main(collective_common, this);
    collective_common = '';
    jQuerySG.each(diff, function() {
      if (this[0] == 0) collective_common += this[1];
    });
  });
  return this.decodeCss(collective_common, existing_tokens);
};

DomPredictionHelper.prototype.tokenizeCss = function(css_string) {
  var skip = false;
  var word = '';
  var tokens = [];
  
  var css_string = this.cleanCss(css_string);
  var length = css_string.length;
  var c = '';
  
  for (var i = 0; i < length; i++){
    c = css_string[i];
    
    if (skip) {
      skip = false;
    } else if (c == '\\') {
      skip = true;
    } else if (c == '.' || c == ' ' || c == '#' || c == '>' || c == ':' || c == ',' || c == '+' || c == '~') {
      if (word.length > 0) tokens.push(word);
      word = '';
    }
    word += c;
    if (c == ' ' || c == ',') {
      tokens.push(word);
      word = '';
		}
  }
  if (word.length > 0) tokens.push(word);
  return tokens;
};

// Same as tokenizeCss, except that siblings are treated as single tokens.
DomPredictionHelper.prototype.tokenizeCssForDiff = function(css_string) {
	var tokens = this.tokenizeCss(css_string);
	var combined_tokens = [];
	var block = [];
	for (var i = 0; i < tokens.length; i++) {
		block.push(tokens[i]);
		if (tokens[i] == ' ' && block.length > 0) {
			combined_tokens = combined_tokens.concat(block);
			block = [];
		} else if (tokens[i] == '+' || tokens[i] == '~') {
			block = [block.join('')];
		}
	}
	if (block.length > 0) return combined_tokens.concat(block);
	return combined_tokens;
}

DomPredictionHelper.prototype.decodeCss = function(string, existing_tokens) {
  var inverted = this.invertObject(existing_tokens);
  var out = '';
  jQuerySG.each(string.split(''), function() {
    out += inverted[this];
  });
  return this.cleanCss(out);
};

// Encode css paths for diff using unicode codepoints to allow for a large number of tokens.
DomPredictionHelper.prototype.encodeCssForDiff = function(strings, existing_tokens) {
  var codepoint = 50;
  var self = this;
  var strings_out = [];
  jQuerySG.each(strings, function() {
    var out = new String();
    jQuerySG.each(self.tokenizeCssForDiff(this), function() {
      if (!existing_tokens[this]) {
        existing_tokens[this] = String.fromCharCode(codepoint++);
      }
      out += existing_tokens[this];
    });
    strings_out.push(out);
  });
  return strings_out;
};

DomPredictionHelper.prototype.tokenPriorities = function(tokens) {
	var epsilon = 0.001;
	var priorities = new Array();
	for(var i = 0; i < tokens.length; i++){
		var token = tokens[i];
    var first = token.substring(0, 1);
    var second = token.substring(1, 2);
		if(first == ':' && second == 'n') { // :nth-child
			priorities[i] = 0;
		} else if(first == ':' && second == 'c') { // :content
			priorities[i] = 1;
		} else if(first == '>') { // >
			priorities[i] = 2;
		} else if(first == '+' || first == '~') { // + and ~
			priorities[i] = 3;
		} else if(first != ':' && first != '.' && first != '#' && first != ' ' && 
			 			first != '>' && first != '+' && first != '~') { // elem, etc.
				priorities[i] = 4;
		} else if ( first == '.') { // classes
			priorities[i] = 5;
		} else if ( first = '#') { //ids
			priorities[i] = 6;
			if (token.match(/\d{3,}/)) {
				priorities[i] = 2.5;
			}
		} else {
			// alert(token);
			priorities[i] = 0;
		}
		priorities[i] += i * epsilon;
	}
	return priorities;
}

DomPredictionHelper.prototype.orderFromPriorities = function(priorities) {
	var tmp = new Array();
	var ordering = new Array();
	for(var i = 0; i< priorities.length; i++){
		tmp[i] = { value: priorities[i], original: i };
	}
	tmp.sort(function(a,b){ return a.value - b.value });
	for(var i = 0; i< priorities.length; i++){
		ordering[i] = tmp[i].original;
	}
	// alert(ordering);
	return ordering;
}


DomPredictionHelper.prototype.simplifyCss = function(css, selected, rejected) {
  var self = this;
  var parts = self.tokenizeCss(css);
	var priorities = self.tokenPriorities(parts);
	var ordering = self.orderFromPriorities(priorities);
	var selector = self.decodeAllContentStrings(self.cleanCss(css));
	if (window.console) console.log(selector);
	var look_back_index = -1;
  var best_so_far = "";
  if (self.selectorGets('all', selected, selector) && self.selectorGets('none', rejected, selector)) best_so_far = selector;
	var got_shorter = true;
	while (got_shorter) {
		got_shorter = false;
		for(var i = 0; i < parts.length; i++) {
			var part = ordering[i];
		
			if (parts[part].length == 0) continue;
      var first = parts[part].substring(0, 1);
      var second = parts[part].substring(1, 2);
			if (first == ' ') continue;
      if (self.wouldLeaveFreeFloatingNthChild(parts, part)) continue;
   
			self._removeElements(part, parts, first, function(selector) {
				if (window.console) console.log("trying: " + selector);
				if (self.selectorGets('all', selected, selector) && self.selectorGets('none', rejected, selector) && 
						(selector.length < best_so_far.length || best_so_far.length == 0)) {
					if (window.console) console.log("kept: " + selector);
          best_so_far = selector;
					got_shorter = true;
					return true;
        } else {
					return false;
        }
			});
	  }
	}
	return self.cleanCss(best_so_far);
};

// Remove some elements depending on whether this is a sibling selector or not, and put them back if the block returns false.
DomPredictionHelper.prototype._removeElements = function(part, parts, firstChar, yield) {
	if (firstChar == '+' || firstChar == '~') {
		var look_back_index = this.positionOfSpaceBeforeIndexOrLineStart(part, parts);
	} else {
		var look_back_index = part;
	}

	var tmp = parts.slice(look_back_index, part + 1); // Save a copy of these parts.
	for (var j = look_back_index; j <= part; j++) { parts[j] = ''; } // Clear it out.

	selector = this.decodeAllContentStrings(this.cleanCss(parts.join('')));

	if (selector == '' || !yield(selector)) {
		for (var j = look_back_index; j <= part; j++) { parts[j] = tmp[j - look_back_index]; } // Put it back.
	}
	return parts;
};

DomPredictionHelper.prototype.positionOfSpaceBeforeIndexOrLineStart = function(part, parts) {
	var i = -1;
	for (i = part; i >= 0 && parts[i] != ' '; i--) {}
	if (i < 0) i = 0;
	return i;
};

// Has to handle parts with zero length.
DomPredictionHelper.prototype.wouldLeaveFreeFloatingNthChild = function(parts, part) {
	var space_is_on_left = nth_child_is_on_right = false;
	
	for (var i = part + 1; i < parts.length && parts[i].length == 0; i++) {}
	if (i < parts.length && parts[i].substring(0, 2) == ':n') nth_child_is_on_right = true;
	
	for (var i = part - 1; i > -1 && parts[i].length == 0; i--) {}
	if (i < 0 || parts[i] == ' ') space_is_on_left = true;
	
	return space_is_on_left && nth_child_is_on_right;
};

// Not intended for user CSS, does destructive sibling removal.  Expects strings to be escaped, such as in :content.
DomPredictionHelper.prototype.cleanCss = function(css) {
	var cleaned_css = css;
	var last_cleaned_css = null;
	while (last_cleaned_css != cleaned_css) {
		last_cleaned_css = cleaned_css;
		cleaned_css = cleaned_css.replace(/(^|\s+)(\+|\~)/, '').replace(/(\+|\~)\s*$/, '').replace(/>/g, ' > ').
															replace(/\s*(>\s*)+/g, ' > ').replace(/,/g, ' , ').replace(/\s+/g, ' ').
							 								replace(/^\s+|\s+$/g, '').replace(/\s*,$/g, '').replace(/^\s*,\s*/g, '').replace(/\s*>$/g, '').
							 								replace(/^>\s*/g, '').replace(/[\+\~\>]\s*,/g, ',').replace(/[\+\~]\s*>/g, '>').replace(/\s*(,\s*)+/g, ' , ');
	}
  return cleaned_css;
};

//Takes wrapped
DomPredictionHelper.prototype.getPathsFor = function(nodeset) {
  var self = this;
  var out = [];
	nodeset.each(function() {
    if (this && this.nodeName) {
      out.push(self.pathOf(this));
    }
  })
  return out;
};

//Takes wrapped
DomPredictionHelper.prototype.predictCss = function(s, r) {
  var self = this;
  
  if (s.length == 0) return '';
  var selected_paths = self.getPathsFor(s);
  // var rejected_paths = self.getPathsFor(r);

  var css = self.cssDiff(selected_paths);
	
  var simplest = self.simplifyCss(css, s, r);

  // Do we get off easy?
  if (simplest.length > 0) return simplest;
  
  // Okay, then make a union and possibly try to reduce subsets.
  var union = '';
	s.each(function() {
    union = self.pathOf(this) + ", " + union;
  });
  union = self.cleanCss(union);
  
  return self.simplifyCss(union, s, r);
};

// Assumes list is jQuery node-set.  Todo: There is room for memoization here.
DomPredictionHelper.prototype.selectorGets = function(type, list, the_selector) {
	if (list.length == 0 && type == 'all') return false; //raise("Trying to get all of zero elements in selectorGets.");
  if (list.length == 0 && type == 'none') return true;

	try {
		if (type == 'all') {
			return list.not(the_selector).length == 0;
		} else { // none
			return !(list.is(the_selector));
		}
	} catch(e) {
		if (window.console) console.log("Error on selector: " + the_selector);
		throw e;
	}
};

DomPredictionHelper.prototype.invertObject = function(object) {
  var new_object = {};
  jQuerySG.each(object, function(key, value) {
    new_object[value] = key;
  });
  return new_object;
};

DomPredictionHelper.prototype.cssToXPath = function(css_string) {
  var tokens = this.tokenizeCss(css_string);
  if (tokens[0] && tokens[0] == ' ') tokens.splice(0, 1);
  if (tokens[tokens.length - 1] && tokens[tokens.length - 1] == ' ') tokens.splice(tokens.length - 1, 1);

  var css_block = [];
  var out = "";
  
  for(var i = 0; i < tokens.length; i++) {
    if (tokens[i] == ' ') {
      out += this.cssToXPathBlockHelper(css_block);
      css_block = [];
    } else {
      css_block.push(tokens[i]);
    }
  }
  
  return out + this.cssToXPathBlockHelper(css_block);
};

// Process a block (html entity, class(es), id, :nth-child()) of css
DomPredictionHelper.prototype.cssToXPathBlockHelper = function(css_block) {
  if (css_block.length == 0) return '//';
  var out = '//';
  var first = css_block[0].substring(0,1);
  
  if (first == ',') return " | ";

  if (jQuerySG.inArray(first, [':', '#', '.']) != -1) {
    out += '*';
  }
  
  var expressions = [];
  var re = null;

  for(var i = 0; i < css_block.length; i++) {
    var current = css_block[i];
    first = current.substring(0,1);
    var rest = current.substring(1);
    
    if (first == ':') {
      // We only support :nth-child(n) at the moment.
      if (re = rest.match(/^nth-child\((\d+)\)$/))
        expressions.push('(((count(preceding-sibling::*) + 1) = ' + re[1] + ') and parent::*)');
    } else if (first == '.') {
      expressions.push('contains(concat( " ", @class, " " ), concat( " ", "' + rest + '", " " ))');
    } else if (first == '#') {
      expressions.push('(@id = "' + rest + '")');
    } else if (first == ',') {
    } else {
      out += current;
    }
  }
  
  if (expressions.length > 0) out += '[';
  for (var i = 0; i < expressions.length; i++) {
    out += expressions[i];
    if (i < expressions.length - 1) out += ' and ';
  }
  if (expressions.length > 0) out += ']';
  return out;
};

