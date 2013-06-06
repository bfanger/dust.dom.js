(function (dust) {
	"use strict";

	/**
	 * Create a temporary data-attribute and call the callback when the template is converted to HTMLElements.
	 * Requires that the template is rendered with dust.renderDom()
	 *
	 * @param  {Function} callback  function ({HTMLElement}) { ... }
	 * @return {string} Example: 'data-dust-dom="hook123"'
	 */
	dust.domHook = function(callback) {
		dust.domHook.counter++;
		dust.domHook.callbacks['hook' + dust.domHook.counter] = callback;
		return dust.domHook.attribute + '="hook' + dust.domHook.counter + '"';
	};
	dust.domHook.attribute = 'data-dust-dom';
	dust.domHook.counter = 0;
	dust.domHook.callbacks = {};

	/**
	 * Create an element placeholder in the html and call the callback when the template is converted to HTMLElements.
	 * Requires that the template is rendered with dust.renderDom()
	 *
	 * @param {string} tagName  Specifies the type of element to be created. Example: "div" or "span"
	 * @param {Function} callback  function ({HTMLElement}) { ... }
	 * @returns {string} Example: '<div data-dust-dom="hook123"></div>'
	 */
	dust.createElement = function(tagName, callback) {
		var html = '<' + tagName + ' ' + dust.domHook(callback);
		if (tagName === 'img' || tagName === 'input' || tagName === 'br' || tagName === 'hr') {
			return html + '/>';
		}
		return html + '></' + tagName +'>';
	};

	/**
	 * Render the template to a DOM NodeList.
	 * Enables helpers that use dust.domHook() or dust.createElement()
	 *
	 * @param {string} name  The name of the template.
	 * @param {object} context  The context for the template.
	 * @param callback  function (err, {NodeList} out) { ... }
	 */
	dust.renderDom = function (name, context, callback) {
		this.render(name, context, function (err, html) {
			if (err) {
				return callback(err, html);
			}
			// Convert html to DOM elements
			var container = document.createElement(dust.renderDom.element);
			container.innerHTML = html;
			// Process created callbacks
			var elements = container.querySelectorAll('[' + dust.domHook.attribute + ']'); // @todo implement a jQuery fallback for IE7
			for (var i = 0; i < elements.length; i++) {
				var element = elements[i];
				var hook = element.getAttribute(dust.domHook.attribute);
				element.removeAttribute(dust.domHook.attribute);
				dust.domHook.callbacks[hook](element);
				delete dust.domHook.callbacks[hook];
			}
			callback(err, container.childNodes);
		});
	};
	dust.renderDom.element = 'div';

	/**
	 * Change element for rendering of DOM to prevent innerHTML conflicts
	 *
	 * @param {string} tagName
	 * @return string
	 */
	dust.renderDom.setElement = function(tagName) {
		var old = dust.renderDom.element;
		dust.renderDom.element = tagName;
		return old;
	};
})(dust);