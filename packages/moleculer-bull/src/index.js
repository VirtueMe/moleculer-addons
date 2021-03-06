/*
 * moleculer-bull
 * Copyright (c) 2017 MoleculerJS (https://github.com/moleculerjs/moleculer-addons)
 * MIT Licensed
 */

"use strict";

let _ 		= require("lodash");
let Queue 	= require("bull");

module.exports = function createService(url, queueOpts) {

	/**
	 * Task queue mixin service for Bull
	 *
	 * @name moleculer-bull
	 * @module Service
	 */
	return {
		name: "bull",

		methods: {
			/**
			 * Create a new job
			 *
			 * @param {String} name
			 * @param {any} payload
			 * @param {any} opts
			 * @returns {Job}
			 */
			createJob(name, payload, opts) {
				if(opts)
					return this.getQueue(name).add(payload, opts);
				else
					return this.getQueue(name).add(payload);
			},

			/**
			 * Get a queue by name
			 *
			 * @param {String} name
			 * @returns {Queue}
			 */
			getQueue(name) {
				if (!this.$queues[name]) {
					this.$queues[name] = Queue(name, url, queueOpts);
				}
				return this.$queues[name];
			}
		},

		created() {
			this.$queues = {};

			if (this.schema.queues) {
				_.forIn(this.schema.queues, (fn, name) => {
					if(typeof fn === "function")
						this.getQueue(name).process(fn.bind(this));
					else
						this.getQueue(name).process(fn.concurrency, fn.process.bind(this));
				});
			}

			return this.Promise.resolve();
		}
	};
};
