# SelectorGadget

[SelectorGadget](http://www.selectorgadget.com) is an open source bookmarklet that makes CSS selector generation and discovery on complicated sites a breeze.

Please visit [http://www.selectorgadget.com](http://www.selectorgadget.com) to try it out.

# Technologies

* CoffeeScript
* jQuery
* [diff-match-patch](https://code.google.com/p/google-diff-match-patch/)

# Features

## Remote interface

SelectorGadget can be extended for use in custom workflows with a remote 
interface that replaces the standard display and controls.

To define a remote interface, create a JavaScript file with any functionality 
you need, and append any relevant controls to SelectorGadget's UI container. 
Here's a simple example:

```javascript
// sg_interface.js

var SG = window.selector_gadget

// Add field to display current selection (note the use of jQuerySG, 
// SelectorGadget's jQuery alias).
var path = jQuerySG('<input>', { id: 'sg-status', class: 'selectorgadget_ignore' })
SG.sg_div.append(path)
SG.path_output_field = path.get(0)

// Add button to dismiss SelectorGadget
var btnOk = jQuerySG('<button>', { id: 'sg-ok', class: 'selectorgadget_ignore' }).text('OK')
SG.sg_div.append(btnOk)
jQuerySG(btnOk).bind('click', function(event) {
  jQuerySG(SG).unbind()
  jQuerySG(SG.sg_div).unbind()
  SG.unbindAndRemoveInterface()
  SG = null
})

// Watch the input field for changes
var val = saved = path.val()
var tid = setInterval(function() {
  val = path.val()
  if(saved != val) {
    console.log('New path', val, 'matching', (jQuerySG(val).length), 'element(s)')
    saved = val
  }
}, 50)
```

Set the path to the remote interface in SelectorGadget's sg_options object 
prior to instantiation, like this:

```javascript
window.sg_options = {
  remote_interface: '/path/to/sg_interface.js'
}

window.selector_gadget = new SelectorGadget()
// ...

```

# Local Development

## Compiling

Start by installing development dependencies with

    bundle

and then run

    guard

to watch and regenerate SelectorGadget's `.coffee` and `.scss` files.

## Testing

SelectorGadget is tested with [jasmine](http://github.com/jasmine/jasmine/).  With guard running, 
open _spec/SpecRunner.html_ in your browser to run the tests.  (On a Mac, just do `open spec/SpecRunner.html`)

To manually test during local development, `open spec/test_sites/bookmarklet_local.html` and use that local bookmarklet on the contents of _spec/test\_sites_.


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/cantino/selectorgadget/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

