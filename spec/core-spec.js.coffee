describe "SelectorGadget", ->
  sg = null
  beforeEach ->
    sg = new SelectorGadget()

  describe "composeRemoteUrl", ->
    it "works with no existing query", ->
      expect(sg.composeRemoteUrl("http://www.blah.com").split("?")[0]).toEqual("http://www.blah.com")
      expect(sg.composeRemoteUrl("http://www.blah.com").split("?")[1].split("&")[0].split("=")[0]).toEqual("t")
      expect(sg.composeRemoteUrl("http://www.blah.com").split("?")[1].split("&")[1].split("=")[0]).toEqual("url")
      expect(sg.composeRemoteUrl("http://www.blah.com", {blah: "hi"}).split("?")[1].split("&")[2].split("=")[0]).toEqual("blah")
      expect(sg.composeRemoteUrl("http://www.blah.com", {blah: "hi"}).split("?")[1].split("&")[2].split("=")[1]).toEqual("hi")

    it "works with an existing query", ->
      url = "http://www.blah.com?a=b&c=d"
      expect(sg.composeRemoteUrl(url).split("?")[0]).toEqual("http://www.blah.com")
      expect(sg.composeRemoteUrl(url).split("?")[1].split("&")[0].split("=")[0]).toEqual("a")
      expect(sg.composeRemoteUrl(url).split("?")[1].split("&")[0].split("=")[1]).toEqual("b")
      expect(sg.composeRemoteUrl(url).split("?")[1].split("&")[1].split("=")[0]).toEqual("c")
      expect(sg.composeRemoteUrl(url).split("?")[1].split("&")[1].split("=")[1]).toEqual("d")
      expect(sg.composeRemoteUrl(url).split("?")[1].split("&")[2].split("=")[0]).toEqual("t")
      expect(sg.composeRemoteUrl(url).split("?")[1].split("&")[3].split("=")[0]).toEqual("url")
      expect(sg.composeRemoteUrl(url, {blah: "hi"}).split("?")[1].split("&")[4].split("=")[0]).toEqual("blah")
      expect(sg.composeRemoteUrl(url, {blah: "hi"}).split("?")[1].split("&")[4].split("=")[1]).toEqual("hi")