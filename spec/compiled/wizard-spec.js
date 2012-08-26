(function() {

  describe("SelectorGadget wizard features", function() {
    var otherCard, selectorCard, sg, struct, _ref;
    _ref = [null, null, null, null], sg = _ref[0], selectorCard = _ref[1], otherCard = _ref[2], struct = _ref[3];
    beforeEach(function() {
      sg = new SelectorGadget();
      selectorCard = {
        name: 'hello'
      };
      otherCard = {
        prompt: 'goodbye'
      };
      return struct = {
        selectors: {
          card1: "hello",
          card2: "hello"
        },
        cards: [
          {
            prompt: "moose",
            close: "something"
          }, {
            name: "card1",
            next: "blah"
          }, {
            prompt: "moose"
          }, {
            name: "card2"
          }
        ]
      };
    });
    describe("selectWizardCard", function() {
      it("should return null when all cards are satisfied", function() {
        return expect(sg.selectWizardCard(struct)).toBeFalsy();
      });
      return it("should return the first card that still needs to be filled", function() {
        struct.selectors.card2 = null;
        expect(sg.selectWizardCard(struct)).toEqual(struct.cards[2]);
        struct.selectors = {};
        return expect(sg.selectWizardCard(struct)).toEqual(struct.cards[0]);
      });
    });
    describe("isSelectorCard", function() {
      return it("should work", function() {
        expect(sg.isSelectorCard(selectorCard)).toBeTruthy();
        return expect(sg.isSelectorCard(otherCard)).toBeFalsy();
      });
    });
    describe("cardType", function() {
      return it("should return the correct card type", function() {
        expect(sg.cardType(selectorCard)).toEqual('selector_card');
        return expect(sg.cardType(otherCard)).toEqual('info_card');
      });
    });
    describe("injectDefaultCardInfoAsNecessary", function() {
      it("should work on an info card", function() {
        var close_before, prompt_before;
        prompt_before = struct.cards[0].prompt;
        close_before = struct.cards[0].close;
        sg.injectDefaultCardInfoAsNecessary(struct);
        expect(sg.cardType(struct.cards[0])).toEqual('info_card');
        expect(sg.wizard_defaults.info_card.here).toEqual(struct.cards[0].here);
        expect(struct.cards[0].prompt).toEqual(prompt_before);
        return expect(struct.cards[0].close).toEqual(close_before);
      });
      return it("should work on a selector card", function() {
        var next_before;
        next_before = struct.cards[1].next;
        sg.injectDefaultCardInfoAsNecessary(struct);
        expect(sg.cardType(struct.cards[1])).toEqual('selector_card');
        expect(sg.wizard_defaults.selector_card.prompt).toEqual(struct.cards[1].prompt);
        expect(struct.cards[1].next).toEqual(next_before);
        return expect(struct.cards[1].close).toBeFalsy();
      });
    });
    return it("should handle skipIfs", function() {
      sg.injectDefaultCardInfoAsNecessary(struct);
      struct.cards[1].skip_if = function(json) {
        return json.selectors.card2;
      };
      expect(sg.handleSkipIfs(struct.cards[1], struct)).toEqual(struct.cards[2]);
      struct.cards[2].skip_if = function(json) {
        return json.selectors.card2;
      };
      return expect(sg.handleSkipIfs(struct.cards[1], struct)).toEqual(struct.cards[3]);
    });
  });

}).call(this);
