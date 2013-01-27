
# dust.dom.js

When you need interaction with a DOMElement which can't be expressed in a string, you're ussually out of luck with string based template engines like dust.

This isn't a big problem because you can just add the interaction code after you've added rendered the template and converted it into a DOMElements. You'd setup subviews and bindings manually or using something like [Rivets.js](http://rivetsjs.com/) or just re-render the view/template if something has changed.

## No more! dust.domHook &amp; dust.renderDom to the rescue

The dust.domHook() allows a dust.helper to interact with the element the hook is placed in.
So you can intact with a DOMElement directly from within a template, which allows for:

* Adding event listeners
* Adding Backbone style subviews
* Setup 2 way binding

All this without adding additional elements or (visible) data attributes to the dom.
