describe "SelectorGadget wizard features", ->
  [sg, selectorCard, otherCard, struct] = [null, null, null, null]

  beforeEach ->
    sg = new SelectorGadget()

    selectorCard = { name: 'hello' }

    otherCard = { prompt: 'goodbye' }

    struct =
      selectors:
        card1: "hello"
        card2: "hello"
      cards:
        [
          {
            prompt: "moose"
            close: "something"
          },
          {
            name: "card1",
            next: "blah"
          },
          {
            prompt: "moose"
          },
          {
            name: "card2"
          }
        ]

  describe "selectWizardCard", ->
    it "should return null when all cards are satisfied", ->
      expect(sg.selectWizardCard(struct)).toBeFalsy()

    it "should return the first card that still needs to be filled", ->
      struct.selectors.card2 = null
      expect(sg.selectWizardCard(struct)).toEqual(struct.cards[2])
      struct.selectors = {}
      expect(sg.selectWizardCard(struct)).toEqual(struct.cards[0])

  describe "isSelectorCard", ->
    it "should work", ->
      expect(sg.isSelectorCard(selectorCard)).toBeTruthy()
      expect(sg.isSelectorCard(otherCard)).toBeFalsy()

  describe "cardType", ->
    it "should return the correct card type", ->
      expect(sg.cardType(selectorCard)).toEqual('selector_card')
      expect(sg.cardType(otherCard)).toEqual('info_card')

  describe "injectDefaultCardInfoAsNecessary", ->
    it "should work on an info card", ->
      prompt_before = struct.cards[0].prompt
      close_before = struct.cards[0].close
      sg.injectDefaultCardInfoAsNecessary(struct)

      expect(sg.cardType(struct.cards[0])).toEqual('info_card')
      expect(sg.wizard_defaults.info_card.here).toEqual(struct.cards[0].here)
      expect(struct.cards[0].prompt).toEqual(prompt_before)
      expect(struct.cards[0].close).toEqual(close_before)

    it "should work on a selector card", ->
      next_before = struct.cards[1].next
      sg.injectDefaultCardInfoAsNecessary(struct)
      expect(sg.cardType(struct.cards[1])).toEqual('selector_card')
      expect(sg.wizard_defaults.selector_card.prompt).toEqual(struct.cards[1].prompt)
      expect(struct.cards[1].next).toEqual(next_before)
      expect(struct.cards[1].close).toBeFalsy()

	  it "should handle skipIfs", ->
      sg.injectDefaultCardInfoAsNecessary(struct)

      struct.cards[1].skip_if = (json) -> json.selectors.card2
      expect(sg.handleSkipIfs(struct.cards[1], struct)).toEqual(struct.cards[2])

      struct.cards[2].skip_if = (json) -> json.selectors.card2
      expect(sg.handleSkipIfs(struct.cards[1], struct)).toEqual(struct.cards[3])
