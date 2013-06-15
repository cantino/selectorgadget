# SelectorGadget

[SelectorGadget](http://www.selectorgadget.com) is an open source bookmarklet that makes CSS selector generation and discovery on complicated sites a breeze.

Please visit [http://www.selectorgadget.com](http://www.selectorgadget.com) to try it out.

# Technologies

* CoffeeScript
* jQuery
* [diff-match-patch](https://code.google.com/p/google-diff-match-patch/)

# Local Development

## Compiling

Start by installing development dependencies with

    bundle

and then run

    guard

to watch and regenerate SelectorGadget's `.coffee` and `.scss` files.

## Testing

SelectorGadget is tested with [http://pivotal.github.com/jasmine/](jasmine).  With guard running, 
open _spec/SpecRunner.html_ in your browser to run the tests.  (On a Mac, just do `open spec/SpecRunner.html`)

To manually test during local development, `open spec/test_sites/bookmarklet_local.html` and use that local bookmarklet on the contents of _spec/test\_sites_.
