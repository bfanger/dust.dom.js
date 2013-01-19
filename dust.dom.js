(function (dust) {
	"use strict";

	dust.domHook = function(callback) {
		dust.domHook.counter++;
		if (typeof dust.domHook.callbacks[dust.domHook.index] === 'undefined') {
			console.warn("dust.domHook() doesn't work with `template(vars);` use `dust.render(template, vars);`");
			return '';
		}
		dust.domHook.callbacks[dust.domHook.index][dust.domHook.counter] = callback;
		return dust.domHook.attribute + dust.domHook.counter + '="domHook"';
	};
	dust.domHook.attribute = 'data-dust-dom';
	dust.domHook.counter = 0;
	dust.domHook.callbacks = [];
	dust.domHook.index = -1;

	/**
	 * Create an element placeholder in the html, the
	 *
	 * @param {string} tagName  Specifies the type of element to be created. Example: "div"
	 * @param {type} callback
	 * @returns {string}
	 */
	dust.createElement = function(tagName, callback) {
		return '<' + tagName + ' ' + dust.domHook(callback) + '></' + tagName +'>';
	};

	/**
	 * Render the template to a DOM NodeList.
	 *
	 * @param {string} name  The name of the template.
	 * @param {object} context  The context for the template.
	 * @param {HTMLElement} element (optional)
	 * @param callback  function (NodeList, err) { ... }
	 */
	dust.renderDom = function (name, context, callback) {
		dust.domHook.index++;
		var callbacks = this.domHook.callbacks[this.domHook.index] = {};

		this.render(name, context, function (err, html) {
			if (err) {
				return callback(err, html);
			}
			var container = document.createElement('div');
			container.innerHTML = html;
			// Process created callbacks
			for (var i in callbacks) {
				var selector = '[' + dust.domHook.attribute + i + ']';
				var element = container.querySelector(selector);
				element.removeAttribute(dust.domHook.attribute + i);
				callbacks[i](element);
			}
			delete dust.domHook.callbacks[dust.domHook.index];
			//this.domHook.index--;
			callback(err, container.childNodes);
		});
	};
})(dust);