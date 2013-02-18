define(function (require) {
	"use strict";

	var dust = require('dust-linkedin');
	var $ = require('jquery');
	var _ = require('underscore');
	var Backbone = require('Backbone');

	/**
	 * Find the Backbone.View in the context tree, if available
	 * @param  {Stack} stack
	 * @return {Backbone.View|false}
	 */
	var findView = function (stack) {
		if (stack.head instanceof Backbone.View) {
			return stack.head;
		}
		if (stack.tail) {
			return findView(stack.tail);
		}
		return false;
	};

	/**
	 * Usage:
	 * {@backbone view=subview /}
	 *
	 * @param  {Chunk} chunk
	 * @param  {Context} context
	 * @param  {object} bodies
	 * @param  {objecrt} params
	 * @return {Chunk}
	 */
	var backbone = function (chunk, context, bodies, params) {
		if (params.view) {
			return chunk.write(dust.createElement('span', function (el) {
				el.parentElement.replaceChild(params.view.render().el, el); // Replace the span by the Backbone.View
			}));
		}
		if (params.bind) {
			var property = params.bind;
			var model = params.model || context.current();
			if ((model instanceof Backbone.Model) === false) {
				return chunk.setError(new Error('The given model or context is not a Backbone.Model'));
			}

			return chunk.write(dust.domHook(function (el) {
				var readMethod = 'text';
				var writeMethod = 'val';
				var bindEvent = false;

				if ($(el).is('input')) {
					readMethod = 'val';
					bindEvent = 'keyup';
				} else if ($(el).is('select')) {
					readMethod = 'val';
					bindEvent = 'keyup';
				}
				$(el)[readMethod](model.get(property));
				// 1 way binding (display)
				var view = findView(context.stack);
				if (view) {
					view.listenTo(model, 'change:' + property, function (model, value) {
						$(el)[readMethod](value);
					});
				} else {
					console.log('No Backbone.View found in the context, {@backbone bind=' + property + ' is leaking memory');
					model.on('change:' + property, function (model, value) {
						$(el)[readMethod](value);
					});
				}
				if (bindEvent) {
					// 2 way binding (input)
					$(el).bind(bindEvent, function () {
						model.set(property, $(el)[writeMethod]());
					});
				}

			}));
		}
		return chunk;
	};

	dust.helpers = dust.helpers || {};
	dust.helpers.backbone = backbone;

	return {
		backbone: backbone,
		console: function (chunk, context, bodies, params) {
			console.log(params.log);
			return chunk;
		}
	};

});