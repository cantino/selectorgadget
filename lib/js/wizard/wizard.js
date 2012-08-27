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

// Set defaults
SelectorGadget.prototype.wizard_defaults = {
  info_card: {
    close: "Let me browse to it!",
    next: "I'm there!",
		back: "Back",
		type: "info"
  },
  selector_card: {
    prompt: "Please select the %s on this page.",
    close: false,
    next: "Skip",
		back: "Back"
  }
};

// Called via the JsonP callback.
SelectorGadget.prototype.updateWizard = function(json) {
  this.injectDefaultCardInfoAsNecessary(json);
  var card = this.selectWizardCard(json);
  if (card) {
    this.wizard_json = json;
    this.wizard_card = card;
    this.displayWizardCard(card);
  } else {
    this.unbindAndRemoveInterface();
  }
};

SelectorGadget.prototype.injectDefaultCardInfoAsNecessary = function(json) {
  for (var i = 0; i < json.cards.length; i++) {
    var card = json.cards[i];
    card.index = i;
    var defaults = this.wizard_defaults[this.cardType(card)];
    for (var j in defaults) {
      if (card[j] === undefined || card[j] === null) {
        card[j] = defaults[j];
      }
    }
  }
};

SelectorGadget.prototype.selectWizardCard = function(json) {
  if (!json || !json.cards || json.cards.length == 0) return null;

  var card = json.cards[0];
  for (var i = 0; i < json.cards.length; i++) {
    if (json.cards[i].name && json.selectors && json.selectors[json.cards[i].name]) {
      if (i + 1 < json.cards.length)
        card = json.cards[i + 1];
      else
        card = null;
    }
  }
  if (card) card = this.handleSkipIfs(card, json);
  return card;
};

SelectorGadget.prototype.handleSkipIfs = function(current_card, json, direction) {
  while(current_card && current_card.skip_if && current_card.skip_if(json)) {
		if (direction == "backwards" && current_card.index - 1 > -1) {
    	current_card = json.cards[current_card.index - 1];
		} else {
    	current_card = json.cards[current_card.index + 1];
		}
  }
  return current_card;
}

SelectorGadget.prototype.makePathField = function() {
  var self = this;
  var path = jQuerySG('<input>').attr('id', 'selectorgadget_path_field').keydown(function(e) {
    if (e.keyCode == 13) {
      return self.refreshFromPath(e);
    }
  }).focus(function() { jQuerySG(this).select(); });
  this.path_output_field = path.get(0);
  return path;
};

SelectorGadget.prototype.makeClearButton = function() {
  this.clear_button = jQuerySG('<input type="button" value="Clear"/>').addClass('selectorgadget_input_field').bind("click", {'self': this}, this.clearEverything);
  return this.clear_button;
};

SelectorGadget.prototype.makeRemoteSaveButton = function(field_name) {
  var self = this;
  return jQuerySG('<input type="button" value="Save"/>').addClass('selectorgadget_input_field').click(function() {
    var selector = self.path_output_field.value;
    if (selector == '' || selector == 'No valid path found.') return;
  	self.updateRemoteInterface({ selector: selector, field_name: field_name });
  });
};

SelectorGadget.prototype.makeCloseButton = function(text) {
  return jQuerySG('<input type="button" />').addClass('selectorgadget_input_field').attr("value", text).bind("click", {'self': this}, this.unbindAndRemoveInterface);
};

SelectorGadget.prototype.makeNextButton = function(text, card) {
  var self = this;
  return jQuerySG('<input type="button" />').addClass('selectorgadget_input_field').attr("value", text).click(function() {
    if (card && self.isSelectorCard(card)) {
      // On a selector card, a next button actually submits home so we know that it has been skipped.
      self.updateRemoteInterface({ selector: "", field_name: card.name });
		} else if(card && card.store_url && card.name) {
			// On an info card with store_url set, submit the current URL home.
      self.updateRemoteInterface({ store_url: window.location.href, field_name: card.name });
    } else {
      self.showNextCard();
    }
  });
};

SelectorGadget.prototype.makeBackButton = function(text) {
  var self = this;
  return jQuerySG('<input type="button" />').addClass('selectorgadget_input_field').attr("value", text).click(function() {
  	self.showPreviousCard();
  });
};

SelectorGadget.prototype.showNextCard = function() {
  if (this.wizard_card.index + 1 < this.wizard_json.cards.length) {
    this.wizard_card = this.wizard_json.cards[this.wizard_card.index + 1];
    this.wizard_card = this.handleSkipIfs(this.wizard_card, this.wizard_json);
    this.displayWizardCard(this.wizard_card);
  } else {
    this.unbindAndRemoveInterface();
  }
};

SelectorGadget.prototype.showPreviousCard = function() {
  if (this.wizard_card.index - 1 > -1) {
    this.wizard_card = this.wizard_json.cards[this.wizard_card.index - 1];
    this.wizard_card = this.handleSkipIfs(this.wizard_card, this.wizard_json, "backwards");
    this.displayWizardCard(this.wizard_card);
  }
};

SelectorGadget.prototype.displayWizardCard = function(card) {
  this.sg_div.html("");
  var our_div = jQuerySG("<div></div>").addClass("selectorgadget_wizard");
  this.clearEverything();
  this.unbind();
  this.css_restriction = card.restrict_css_to;

  our_div.append(jQuerySG("<div></div>").addClass("selectorgadget_prompt").html(card.prompt));

  if (this.isSelectorCard(card)) { // Selector card
    our_div.append(this.makePathField());
    our_div.append(this.makeClearButton());
    our_div.append(this.makeRemoteSaveButton(card.name));
		this.rebind();

		if (this.wizard_json.selectors[card.name]) {
			this.path_output_field.value = this.wizard_json.selectors[card.name];
			this.refreshFromPath();
		}

  }
  if (card.next) our_div.append(this.makeNextButton(card.next, card));
  if (card.close) our_div.append(this.makeCloseButton(card.close));
  if (card.back && card.index > 0) our_div.append(this.makeBackButton(card.back));

  this.sg_div.append(our_div);
};

SelectorGadget.prototype.isSelectorCard = function(card) {
  if (card.name && card.type != "info") {
    return true;
  }
  return false;
};

SelectorGadget.prototype.cardType = function(card) {
  if (this.isSelectorCard(card)) {
    return "selector_card";
  }
  return "info_card";
};


// SelectorGadget provides:
//   selector_gadget.remote_data is a hash that you can store data in, and that will get sent back to the server on the next refresh.
//                               You need to update the data in it if you want it to be sent back again.
//   selector_gadget.updateRemoteInterface() will reload this page.
//   selector_gadget.sg_div is the div that we can draw to.
//
//   selector_gadget.clear_button and selector_gadget.path_output_field can also be set, and if set, will be managed by SG.

