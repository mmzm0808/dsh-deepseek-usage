window.__ModuleLoader__.load({
	id: "dsh-deepseek-usage",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		//#region ../node_modules/.pnpm/html2canvas-pro@2.3.9/node_modules/html2canvas-pro/dist/html2canvas-pro.esm.js
		/*!
		* html2canvas-pro 2.3.9 <https://yorickshan.github.io/html2canvas-pro/>
		* Copyright (c) 2024-present yorickshan and html2canvas-pro contributors
		* Released under MIT License
		*/
		/**
		* Html2Canvas Configuration
		*
		* Manages configuration state for html2canvas rendering.
		* Eliminates the need for global static variables.
		*/
		var Html2CanvasConfig = class Html2CanvasConfig {
			constructor(options = {}) {
				const resolvedWindow = options.window || (typeof window !== "undefined" ? window : void 0);
				if (!resolvedWindow) throw new Error("Window object is required but not available");
				this.window = resolvedWindow;
				this.cspNonce = options.cspNonce;
				this.cache = options.cache;
			}
			/**
			* Create configuration from an element
			* Extracts window from element's owner document
			*/
			static fromElement(element, options = {}) {
				const ownerDocument = element.ownerDocument;
				if (!ownerDocument) throw new Error("Element is not attached to a document");
				const defaultView = ownerDocument.defaultView;
				if (!defaultView) throw new Error("Document is not attached to a window");
				return new Html2CanvasConfig({
					window: defaultView,
					...options
				});
			}
			/**
			* Clone configuration with override options
			*/
			clone(options = {}) {
				return new Html2CanvasConfig({
					window: options.window || this.window,
					cspNonce: options.cspNonce ?? this.cspNonce,
					cache: options.cache ?? this.cache
				});
			}
		};
		/**
		* Input Validator
		*
		* Validates and sanitizes user inputs for security and correctness.
		*/
		var Validator = class {
			constructor(config = {}) {
				this.config = {
					maxImageTimeout: 3e5,
					allowDataUrls: true,
					...config
				};
			}
			/**
			* Validate a URL
			*
			* @param url - URL to validate
			* @param context - Context for validation (e.g., 'proxy', 'image')
			* @returns Validation result
			*/
			validateUrl(url, context = "general") {
				if (!url || typeof url !== "string") return {
					valid: false,
					error: "URL must be a non-empty string"
				};
				if (url.startsWith("data:")) {
					if (!this.config.allowDataUrls) return {
						valid: false,
						error: "Data URLs are not allowed"
					};
					return {
						valid: true,
						sanitized: url
					};
				}
				if (url.startsWith("blob:")) return {
					valid: true,
					sanitized: url
				};
				try {
					const parsedUrl = new URL(url);
					if (!["http:", "https:"].includes(parsedUrl.protocol)) return {
						valid: false,
						error: `Protocol ${parsedUrl.protocol} is not allowed. Only http and https are permitted.`
					};
					if (context === "proxy" && this.config.allowedProxyDomains && this.config.allowedProxyDomains.length > 0) {
						const hostname = parsedUrl.hostname.toLowerCase();
						if (!this.config.allowedProxyDomains.some((domain) => {
							const normalizedDomain = domain.toLowerCase();
							return hostname === normalizedDomain || hostname.endsWith("." + normalizedDomain);
						})) return {
							valid: false,
							error: `Proxy domain ${parsedUrl.hostname} is not in the allowed list`
						};
					}
					if (context === "proxy") {
						if (!this.config.allowLocalhostProxy) {
							const hostname = parsedUrl.hostname.toLowerCase();
							if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") return {
								valid: false,
								error: "Localhost is not allowed for proxy URLs"
							};
							if (this.isPrivateIP(hostname)) return {
								valid: false,
								error: "Private IP addresses are not allowed for proxy URLs"
							};
							if (hostname.startsWith("169.254.") || hostname.startsWith("fe80:")) return {
								valid: false,
								error: "Link-local addresses are not allowed for proxy URLs"
							};
						}
						return {
							valid: true,
							sanitized: url,
							requiresRuntimeCheck: true
						};
					}
					return {
						valid: true,
						sanitized: url
					};
				} catch (e) {
					return {
						valid: false,
						error: `Invalid URL format: ${e instanceof Error ? e.message : "Unknown error"}`
					};
				}
			}
			/**
			* Check if a hostname is a private IP address
			*/
			isPrivateIP(hostname) {
				if ([
					/^0\./,
					/^10\./,
					/^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./,
					/^127\./,
					/^169\.254\./,
					/^172\.(1[6-9]|2[0-9]|3[0-1])\./,
					/^192\.0\.0\./,
					/^192\.0\.2\./,
					/^192\.168\./,
					/^198\.(1[8-9])\./,
					/^198\.51\.100\./,
					/^203\.0\.113\./,
					/^2(2[4-9]|3[0-9])\./,
					/^24[0-9]\./,
					/^255\.255\.255\.255$/
				].some((pattern) => pattern.test(hostname))) return true;
				if (hostname.includes(":")) return this.isPrivateIPv6(hostname);
				return false;
			}
			/**
			* Check if an IPv6 address is private or special
			* Handles compressed IPv6 addresses (e.g., ::1, fc00::1)
			*/
			isPrivateIPv6(hostname) {
				const addrWithoutZone = hostname.toLowerCase().trim().replace(/^\[|\]$/g, "").split("%")[0];
				if (/^(0:){7}1$/.test(addrWithoutZone) || addrWithoutZone === "::1") return true;
				if (/^(0:){7}0$/.test(addrWithoutZone) || addrWithoutZone === "::") return true;
				const expandedAddr = this.expandIPv6(addrWithoutZone);
				if (!expandedAddr) return this.isPrivateIPv6Prefix(addrWithoutZone);
				const firstByte = parseInt(expandedAddr.substring(0, 2), 16);
				if (firstByte >= 252 && firstByte <= 253) return true;
				if (firstByte === 254) {
					const secondByte = parseInt(expandedAddr.substring(2, 4), 16);
					if (secondByte >= 128 && secondByte <= 191) return true;
				}
				if (firstByte === 255) return true;
				return false;
			}
			/**
			* Expand compressed IPv6 address to full form
			* e.g., "::1" -> "0000:0000:0000:0000:0000:0000:0000:0001"
			*/
			expandIPv6(addr) {
				try {
					if (addr.includes("::")) {
						const parts = addr.split("::");
						if (parts.length > 2) return null;
						const leftParts = parts[0] ? parts[0].split(":") : [];
						const rightParts = parts[1] ? parts[1].split(":") : [];
						const missingParts = 8 - leftParts.length - rightParts.length;
						if (missingParts < 0) return null;
						const middleParts = Array(missingParts).fill("0000");
						return [
							...leftParts,
							...middleParts,
							...rightParts
						].map((p) => p.padStart(4, "0")).join(":");
					} else {
						const parts = addr.split(":");
						if (parts.length !== 8) return null;
						return parts.map((p) => p.padStart(4, "0")).join(":");
					}
				} catch {
					return null;
				}
			}
			/**
			* Fallback prefix matching for IPv6 when expansion fails
			*/
			isPrivateIPv6Prefix(addr) {
				if (/^fc[0-9a-f]{0,2}:?/i.test(addr) || /^fd[0-9a-f]{0,2}:?/i.test(addr)) return true;
				if (/^fe[89ab][0-9a-f]:?/i.test(addr)) return true;
				if (/^ff[0-9a-f]{0,2}:?/i.test(addr)) return true;
				return false;
			}
			/**
			* Validate CSP nonce
			*
			* @param nonce - CSP nonce to validate
			* @returns Validation result
			*/
			validateCspNonce(nonce) {
				if (!nonce || typeof nonce !== "string") return {
					valid: false,
					error: "CSP nonce must be a non-empty string"
				};
				if (nonce.length < 16) return {
					valid: false,
					error: "CSP nonce is too short (minimum 16 characters recommended)"
				};
				if (!/^[A-Za-z0-9+/=_-]+$/.test(nonce)) return {
					valid: false,
					error: "CSP nonce contains invalid characters"
				};
				return {
					valid: true,
					sanitized: nonce
				};
			}
			/**
			* Validate image timeout
			*
			* @param timeout - Timeout in milliseconds
			* @returns Validation result
			*/
			validateImageTimeout(timeout) {
				if (typeof timeout !== "number" || isNaN(timeout)) return {
					valid: false,
					error: "Image timeout must be a number"
				};
				if (timeout < 0) return {
					valid: false,
					error: "Image timeout cannot be negative"
				};
				if (this.config.maxImageTimeout && timeout > this.config.maxImageTimeout) return {
					valid: false,
					error: `Image timeout ${timeout}ms exceeds maximum allowed ${this.config.maxImageTimeout}ms`
				};
				return {
					valid: true,
					sanitized: timeout
				};
			}
			/**
			* Validate window dimensions
			*
			* @param width - Window width
			* @param height - Window height
			* @returns Validation result
			*/
			validateDimensions(width, height) {
				if (typeof width !== "number" || typeof height !== "number") return {
					valid: false,
					error: "Dimensions must be numbers"
				};
				if (isNaN(width) || isNaN(height)) return {
					valid: false,
					error: "Dimensions cannot be NaN"
				};
				if (width <= 0 || height <= 0) return {
					valid: false,
					error: "Dimensions must be positive"
				};
				const MAX_DIMENSION = 32767;
				if (width > MAX_DIMENSION || height > MAX_DIMENSION) return {
					valid: false,
					error: `Dimensions exceed maximum allowed (${MAX_DIMENSION}px)`
				};
				return {
					valid: true,
					sanitized: {
						width,
						height
					}
				};
			}
			/**
			* Validate scale factor
			*
			* @param scale - Scale factor
			* @returns Validation result
			*/
			validateScale(scale) {
				if (typeof scale !== "number" || isNaN(scale)) return {
					valid: false,
					error: "Scale must be a number"
				};
				if (scale <= 0) return {
					valid: false,
					error: "Scale must be positive"
				};
				if (scale > 10) return {
					valid: false,
					error: "Scale factor too large (maximum 10x)"
				};
				return {
					valid: true,
					sanitized: scale
				};
			}
			/**
			* Validate HTML element
			*
			* @param element - Element to validate
			* @returns Validation result
			*/
			validateElement(element) {
				if (!element) return {
					valid: false,
					error: "Element is required"
				};
				if (typeof element !== "object") return {
					valid: false,
					error: "Element must be an object"
				};
				const el = element;
				if (typeof HTMLElement !== "undefined" && element instanceof HTMLElement) {
					if (!element.ownerDocument) return {
						valid: false,
						error: "Element must be attached to a document"
					};
					return { valid: true };
				}
				if (!el.ownerDocument) return {
					valid: false,
					error: "Element must be attached to a document (ownerDocument required)"
				};
				if (!el.ownerDocument.defaultView) return {
					valid: false,
					error: "Document must be attached to a window (ownerDocument.defaultView required)"
				};
				return { valid: true };
			}
			/**
			* Validate entire options object
			*
			* @param options - Options to validate
			* @returns Validation result with all errors
			*/
			validateOptions(options) {
				const errors = [];
				const proxyUrl = options.proxy;
				if (proxyUrl !== void 0 && proxyUrl !== null && typeof proxyUrl === "string" && proxyUrl.length > 0) {
					const proxyResult = this.validateUrl(proxyUrl, "proxy");
					if (!proxyResult.valid) errors.push(`Proxy: ${proxyResult.error}`);
				}
				if (options.imageTimeout !== void 0) {
					const timeoutResult = this.validateImageTimeout(options.imageTimeout);
					if (!timeoutResult.valid) errors.push(`Image timeout: ${timeoutResult.error}`);
				}
				if (options.width !== void 0 || options.height !== void 0) {
					const width = options.width ?? 800;
					const height = options.height ?? 600;
					const dimensionsResult = this.validateDimensions(width, height);
					if (!dimensionsResult.valid) errors.push(`Dimensions: ${dimensionsResult.error}`);
				}
				if (options.scale !== void 0) {
					const scaleResult = this.validateScale(options.scale);
					if (!scaleResult.valid) errors.push(`Scale: ${scaleResult.error}`);
				}
				if (options.cspNonce !== void 0) {
					const nonceResult = this.validateCspNonce(options.cspNonce);
					if (!nonceResult.valid) errors.push(`CSP nonce: ${nonceResult.error}`);
				}
				if (this.config.customValidator) {
					const customResult = this.config.customValidator(options, "options");
					if (!customResult.valid) errors.push(`Custom validation: ${customResult.error}`);
				}
				if (errors.length > 0) return {
					valid: false,
					error: errors.join("; ")
				};
				return { valid: true };
			}
		};
		/**
		* Create a default validator instance
		*/
		function createDefaultValidator(config = {}) {
			return new Validator({
				allowDataUrls: true,
				maxImageTimeout: 3e5,
				...config
			});
		}
		/**
		* Performance Monitor
		*
		* Tracks performance metrics throughout the rendering pipeline.
		* Provides insights into where time is spent during rendering.
		*
		* Usage:
		* ```typescript
		* const monitor = new PerformanceMonitor(context);
		*
		* monitor.start('clone');
		* await cloneDocument();
		* monitor.end('clone');
		*
		* const summary = monitor.getSummary();
		* ```
		*/
		var PerformanceMonitor = class {
			constructor(context, enabled = true) {
				this.context = context;
				this.activeMetrics = /* @__PURE__ */ new Map();
				this.completedMetrics = [];
				this.enabled = enabled;
				this.getTime = typeof performance !== "undefined" && typeof performance.now === "function" ? () => performance.now() : () => Date.now();
			}
			/**
			* Start measuring a performance metric
			*
			* @param name - Unique name for this metric
			* @param metadata - Optional metadata to attach
			*/
			start(name, metadata) {
				if (!this.enabled) return;
				if (this.activeMetrics.has(name)) this.context?.logger.warn(`Performance metric '${name}' already started. Overwriting.`);
				this.activeMetrics.set(name, {
					name,
					startTime: this.getTime(),
					metadata
				});
			}
			/**
			* End measuring a performance metric
			*
			* @param name - Name of the metric to end
			* @returns The completed metric, or undefined if not found
			*/
			end(name) {
				if (!this.enabled) return;
				const metric = this.activeMetrics.get(name);
				if (!metric) {
					this.context?.logger.warn(`Performance metric '${name}' not found. Was start() called?`);
					return;
				}
				metric.endTime = this.getTime();
				metric.duration = metric.endTime - metric.startTime;
				this.completedMetrics.push(metric);
				this.activeMetrics.delete(name);
				this.context?.logger.debug(`⏱️  ${name}: ${metric.duration.toFixed(2)}ms`, metric.metadata);
				return metric;
			}
			/**
			* Measure a synchronous function
			*
			* @param name - Name for this measurement
			* @param fn - Function to measure
			* @param metadata - Optional metadata
			* @returns The function's return value
			*/
			measure(name, fn, metadata) {
				this.start(name, metadata);
				try {
					const result = fn();
					this.end(name);
					return result;
				} catch (error) {
					this.end(name);
					throw error;
				}
			}
			/**
			* Measure an asynchronous function
			*
			* @param name - Name for this measurement
			* @param fn - Async function to measure
			* @param metadata - Optional metadata
			* @returns Promise resolving to the function's return value
			*/
			async measureAsync(name, fn, metadata) {
				this.start(name, metadata);
				try {
					const result = await fn();
					this.end(name);
					return result;
				} catch (error) {
					this.end(name);
					throw error;
				}
			}
			/**
			* Get all completed metrics
			*
			* @returns Array of completed performance metrics
			*/
			getMetrics() {
				return [...this.completedMetrics];
			}
			/**
			* Get a specific metric by name
			*
			* @param name - Metric name
			* @returns The metric, or undefined if not found
			*/
			getMetric(name) {
				return this.completedMetrics.find((m) => m.name === name);
			}
			/**
			* Get performance summary
			*
			* @returns Aggregated performance data
			*/
			getSummary() {
				const totalDuration = this.completedMetrics.reduce((sum, metric) => sum + (metric.duration || 0), 0);
				const breakdown = this.completedMetrics.map((metric) => ({
					name: metric.name,
					duration: metric.duration || 0,
					percentage: totalDuration > 0 ? ((metric.duration || 0) / totalDuration * 100).toFixed(1) + "%" : "0%"
				}));
				return {
					totalDuration,
					metrics: this.getMetrics(),
					breakdown
				};
			}
			/**
			* Log performance summary to console
			*/
			logSummary() {
				if (!this.enabled || this.completedMetrics.length === 0 || !this.context) return;
				const summary = this.getSummary();
				this.context.logger.info(`\n📊 Performance Summary (Total: ${summary.totalDuration.toFixed(2)}ms):`);
				summary.breakdown.sort((a, b) => b.duration - a.duration).forEach((item) => {
					this.context.logger.info(`  ${item.name.padEnd(20)} ${item.duration.toFixed(2).padStart(8)}ms  ${item.percentage.padStart(6)}`);
				});
			}
			/**
			* Clear all metrics
			*/
			clear() {
				this.activeMetrics.clear();
				this.completedMetrics.splice(0);
			}
			/**
			* Check if monitoring is enabled
			*/
			isEnabled() {
				return this.enabled;
			}
			/**
			* Get active (uncompleted) metrics
			* Useful for debugging leaked measurements
			*/
			getActiveMetrics() {
				return Array.from(this.activeMetrics.keys());
			}
		};
		var Bounds = class Bounds {
			constructor(left, top, width, height) {
				this.left = left;
				this.top = top;
				this.width = width;
				this.height = height;
			}
			add(x, y, w, h) {
				return new Bounds(this.left + x, this.top + y, this.width + w, this.height + h);
			}
			static fromClientRect(context, clientRect) {
				return new Bounds(clientRect.left + context.windowBounds.left, clientRect.top + context.windowBounds.top, clientRect.width, clientRect.height);
			}
			static fromDOMRectList(context, domRectList) {
				const rects = Array.from(domRectList);
				let domRect = rects.find((rect) => rect.width !== 0);
				if (!domRect) domRect = rects.find((rect) => rect.height !== 0);
				if (!domRect && rects.length > 0) domRect = rects[0];
				return domRect ? new Bounds(domRect.left + context.windowBounds.left, domRect.top + context.windowBounds.top, domRect.width, domRect.height) : Bounds.EMPTY;
			}
			static {
				this.EMPTY = new Bounds(0, 0, 0, 0);
			}
		};
		const parseBounds = (context, node) => {
			return Bounds.fromClientRect(context, node.getBoundingClientRect());
		};
		const parseDocumentSize = (document) => {
			const body = document.body;
			const documentElement = document.documentElement;
			if (!body || !documentElement) throw new Error(`Unable to get document size`);
			return new Bounds(0, 0, Math.max(Math.max(body.scrollWidth, documentElement.scrollWidth), Math.max(body.offsetWidth, documentElement.offsetWidth), Math.max(body.clientWidth, documentElement.clientWidth)), Math.max(Math.max(body.scrollHeight, documentElement.scrollHeight), Math.max(body.offsetHeight, documentElement.offsetHeight), Math.max(body.clientHeight, documentElement.clientHeight)));
		};
		var toCodePoints$1 = function(str) {
			var codePoints = [];
			var i = 0;
			var length = str.length;
			while (i < length) {
				var value = str.charCodeAt(i++);
				if (value >= 55296 && value <= 56319 && i < length) {
					var extra = str.charCodeAt(i++);
					if ((extra & 64512) === 56320) codePoints.push(((value & 1023) << 10) + (extra & 1023) + 65536);
					else {
						codePoints.push(value);
						i--;
					}
				} else codePoints.push(value);
			}
			return codePoints;
		};
		var fromCodePoint$1 = function() {
			var codePoints = [];
			for (var _i = 0; _i < arguments.length; _i++) codePoints[_i] = arguments[_i];
			if (String.fromCodePoint) return String.fromCodePoint.apply(String, codePoints);
			var length = codePoints.length;
			if (!length) return "";
			var codeUnits = [];
			var index = -1;
			var result = "";
			while (++index < length) {
				var codePoint = codePoints[index];
				if (codePoint <= 65535) codeUnits.push(codePoint);
				else {
					codePoint -= 65536;
					codeUnits.push((codePoint >> 10) + 55296, codePoint % 1024 + 56320);
				}
				if (index + 1 === length || codeUnits.length > 16384) {
					result += String.fromCharCode.apply(String, codeUnits);
					codeUnits.length = 0;
				}
			}
			return result;
		};
		var chars$2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
		var lookup$2 = typeof Uint8Array === "undefined" ? [] : /* @__PURE__ */ new Uint8Array(256);
		for (var i$2 = 0; i$2 < chars$2.length; i$2++) lookup$2[chars$2.charCodeAt(i$2)] = i$2;
		var chars$1$1 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
		var lookup$1$1 = typeof Uint8Array === "undefined" ? [] : /* @__PURE__ */ new Uint8Array(256);
		for (var i$1$1 = 0; i$1$1 < chars$1$1.length; i$1$1++) lookup$1$1[chars$1$1.charCodeAt(i$1$1)] = i$1$1;
		var decode$1 = function(base64) {
			var bufferLength = base64.length * .75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
			if (base64[base64.length - 1] === "=") {
				bufferLength--;
				if (base64[base64.length - 2] === "=") bufferLength--;
			}
			var buffer = typeof ArrayBuffer !== "undefined" && typeof Uint8Array !== "undefined" && typeof Uint8Array.prototype.slice !== "undefined" ? new ArrayBuffer(bufferLength) : new Array(bufferLength);
			var bytes = Array.isArray(buffer) ? buffer : new Uint8Array(buffer);
			for (i = 0; i < len; i += 4) {
				encoded1 = lookup$1$1[base64.charCodeAt(i)];
				encoded2 = lookup$1$1[base64.charCodeAt(i + 1)];
				encoded3 = lookup$1$1[base64.charCodeAt(i + 2)];
				encoded4 = lookup$1$1[base64.charCodeAt(i + 3)];
				bytes[p++] = encoded1 << 2 | encoded2 >> 4;
				bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
				bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
			}
			return buffer;
		};
		var polyUint16Array$1 = function(buffer) {
			var length = buffer.length;
			var bytes = [];
			for (var i = 0; i < length; i += 2) bytes.push(buffer[i + 1] << 8 | buffer[i]);
			return bytes;
		};
		var polyUint32Array$1 = function(buffer) {
			var length = buffer.length;
			var bytes = [];
			for (var i = 0; i < length; i += 4) bytes.push(buffer[i + 3] << 24 | buffer[i + 2] << 16 | buffer[i + 1] << 8 | buffer[i]);
			return bytes;
		};
		/** Shift size for getting the index-2 table offset. */
		var UTRIE2_SHIFT_2$1 = 5;
		/** Shift size for getting the index-1 table offset. */
		var UTRIE2_SHIFT_1$1 = 11;
		/**
		* Shift size for shifting left the index array values.
		* Increases possible data size with 16-bit index values at the cost
		* of compactability.
		* This requires data blocks to be aligned by UTRIE2_DATA_GRANULARITY.
		*/
		var UTRIE2_INDEX_SHIFT$1 = 2;
		/**
		* Difference between the two shift sizes,
		* for getting an index-1 offset from an index-2 offset. 6=11-5
		*/
		var UTRIE2_SHIFT_1_2$1 = UTRIE2_SHIFT_1$1 - UTRIE2_SHIFT_2$1;
		/**
		* The part of the index-2 table for U+D800..U+DBFF stores values for
		* lead surrogate code _units_ not code _points_.
		* Values for lead surrogate code _points_ are indexed with this portion of the table.
		* Length=32=0x20=0x400>>UTRIE2_SHIFT_2. (There are 1024=0x400 lead surrogates.)
		*/
		var UTRIE2_LSCP_INDEX_2_OFFSET$1 = 65536 >> UTRIE2_SHIFT_2$1;
		/** Mask for getting the lower bits for the in-data-block offset. */
		var UTRIE2_DATA_MASK$1 = (1 << UTRIE2_SHIFT_2$1) - 1;
		/**
		* The index-1 table, only used for supplementary code points, at offset 2112=0x840.
		* Variable length, for code points up to highStart, where the last single-value range starts.
		* Maximum length 512=0x200=0x100000>>UTRIE2_SHIFT_1.
		* (For 0x100000 supplementary code points U+10000..U+10ffff.)
		*
		* The part of the index-2 table for supplementary code points starts
		* after this index-1 table.
		*
		* Both the index-1 table and the following part of the index-2 table
		* are omitted completely if there is only BMP data.
		*/
		var UTRIE2_INDEX_1_OFFSET$1 = UTRIE2_LSCP_INDEX_2_OFFSET$1 + (1024 >> UTRIE2_SHIFT_2$1) + 32;
		/**
		* Number of index-1 entries for the BMP. 32=0x20
		* This part of the index-1 table is omitted from the serialized form.
		*/
		var UTRIE2_OMITTED_BMP_INDEX_1_LENGTH$1 = 65536 >> UTRIE2_SHIFT_1$1;
		/** Mask for getting the lower bits for the in-index-2-block offset. */
		var UTRIE2_INDEX_2_MASK$1 = (1 << UTRIE2_SHIFT_1_2$1) - 1;
		var slice16$1 = function(view, start, end) {
			if (view.slice) return view.slice(start, end);
			return new Uint16Array(Array.prototype.slice.call(view, start, end));
		};
		var slice32$1 = function(view, start, end) {
			if (view.slice) return view.slice(start, end);
			return new Uint32Array(Array.prototype.slice.call(view, start, end));
		};
		var createTrieFromBase64$1 = function(base64, _byteLength) {
			var buffer = decode$1(base64);
			var view32 = Array.isArray(buffer) ? polyUint32Array$1(buffer) : new Uint32Array(buffer);
			var view16 = Array.isArray(buffer) ? polyUint16Array$1(buffer) : new Uint16Array(buffer);
			var headerLength = 24;
			var index = slice16$1(view16, headerLength / 2, view32[4] / 2);
			var data = view32[5] === 2 ? slice16$1(view16, (headerLength + view32[4]) / 2) : slice32$1(view32, Math.ceil((headerLength + view32[4]) / 4));
			return new Trie$1(view32[0], view32[1], view32[2], view32[3], index, data);
		};
		var Trie$1 = function() {
			function Trie(initialValue, errorValue, highStart, highValueIndex, index, data) {
				this.initialValue = initialValue;
				this.errorValue = errorValue;
				this.highStart = highStart;
				this.highValueIndex = highValueIndex;
				this.index = index;
				this.data = data;
			}
			/**
			* Get the value for a code point as stored in the Trie.
			*
			* @param codePoint the code point
			* @return the value
			*/
			Trie.prototype.get = function(codePoint) {
				var ix;
				if (codePoint >= 0) {
					if (codePoint < 55296 || codePoint > 56319 && codePoint <= 65535) {
						ix = this.index[codePoint >> UTRIE2_SHIFT_2$1];
						ix = (ix << UTRIE2_INDEX_SHIFT$1) + (codePoint & UTRIE2_DATA_MASK$1);
						return this.data[ix];
					}
					if (codePoint <= 65535) {
						ix = this.index[UTRIE2_LSCP_INDEX_2_OFFSET$1 + (codePoint - 55296 >> UTRIE2_SHIFT_2$1)];
						ix = (ix << UTRIE2_INDEX_SHIFT$1) + (codePoint & UTRIE2_DATA_MASK$1);
						return this.data[ix];
					}
					if (codePoint < this.highStart) {
						ix = UTRIE2_INDEX_1_OFFSET$1 - UTRIE2_OMITTED_BMP_INDEX_1_LENGTH$1 + (codePoint >> UTRIE2_SHIFT_1$1);
						ix = this.index[ix];
						ix += codePoint >> UTRIE2_SHIFT_2$1 & UTRIE2_INDEX_2_MASK$1;
						ix = this.index[ix];
						ix = (ix << UTRIE2_INDEX_SHIFT$1) + (codePoint & UTRIE2_DATA_MASK$1);
						return this.data[ix];
					}
					if (codePoint <= 1114111) return this.data[this.highValueIndex];
				}
				return this.errorValue;
			};
			return Trie;
		}();
		var chars$3 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
		var lookup$3 = typeof Uint8Array === "undefined" ? [] : /* @__PURE__ */ new Uint8Array(256);
		for (var i$3 = 0; i$3 < chars$3.length; i$3++) lookup$3[chars$3.charCodeAt(i$3)] = i$3;
		var base64$1 = "KwAAAAAAAAAACA4AUD0AADAgAAACAAAAAAAIABAAGABAAEgAUABYAGAAaABgAGgAYgBqAF8AZwBgAGgAcQB5AHUAfQCFAI0AlQCdAKIAqgCyALoAYABoAGAAaABgAGgAwgDKAGAAaADGAM4A0wDbAOEA6QDxAPkAAQEJAQ8BFwF1AH0AHAEkASwBNAE6AUIBQQFJAVEBWQFhAWgBcAF4ATAAgAGGAY4BlQGXAZ8BpwGvAbUBvQHFAc0B0wHbAeMB6wHxAfkBAQIJAvEBEQIZAiECKQIxAjgCQAJGAk4CVgJeAmQCbAJ0AnwCgQKJApECmQKgAqgCsAK4ArwCxAIwAMwC0wLbAjAA4wLrAvMC+AIAAwcDDwMwABcDHQMlAy0DNQN1AD0DQQNJA0kDSQNRA1EDVwNZA1kDdQB1AGEDdQBpA20DdQN1AHsDdQCBA4kDkQN1AHUAmQOhA3UAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AKYDrgN1AHUAtgO+A8YDzgPWAxcD3gPjA+sD8wN1AHUA+wMDBAkEdQANBBUEHQQlBCoEFwMyBDgEYABABBcDSARQBFgEYARoBDAAcAQzAXgEgASIBJAEdQCXBHUAnwSnBK4EtgS6BMIEyAR1AHUAdQB1AHUAdQCVANAEYABgAGAAYABgAGAAYABgANgEYADcBOQEYADsBPQE/AQEBQwFFAUcBSQFLAU0BWQEPAVEBUsFUwVbBWAAYgVgAGoFcgV6BYIFigWRBWAAmQWfBaYFYABgAGAAYABgAKoFYACxBbAFuQW6BcEFwQXHBcEFwQXPBdMF2wXjBeoF8gX6BQIGCgYSBhoGIgYqBjIGOgZgAD4GRgZMBmAAUwZaBmAAYABgAGAAYABgAGAAYABgAGAAYABgAGIGYABpBnAGYABgAGAAYABgAGAAYABgAGAAYAB4Bn8GhQZgAGAAYAB1AHcDFQSLBmAAYABgAJMGdQA9A3UAmwajBqsGqwaVALMGuwbDBjAAywbSBtIG1QbSBtIG0gbSBtIG0gbdBuMG6wbzBvsGAwcLBxMHAwcbByMHJwcsBywHMQcsB9IGOAdAB0gHTgfSBkgHVgfSBtIG0gbSBtIG0gbSBtIG0gbSBiwHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAdgAGAALAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAdbB2MHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsB2kH0gZwB64EdQB1AHUAdQB1AHUAdQB1AHUHfQdgAIUHjQd1AHUAlQedB2AAYAClB6sHYACzB7YHvgfGB3UAzgfWBzMB3gfmB1EB7gf1B/0HlQENAQUIDQh1ABUIHQglCBcDLQg1CD0IRQhNCEEDUwh1AHUAdQBbCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIaQhjCGQIZQhmCGcIaAhpCGMIZAhlCGYIZwhoCGkIYwhkCGUIZghnCGgIcAh3CHoIMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIgggwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAALAcsBywHLAcsBywHLAcsBywHLAcsB4oILAcsB44I0gaWCJ4Ipgh1AHUAqgiyCHUAdQB1AHUAdQB1AHUAdQB1AHUAtwh8AXUAvwh1AMUIyQjRCNkI4AjoCHUAdQB1AO4I9gj+CAYJDgkTCS0HGwkjCYIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiCCIIIggiAAIAAAAFAAYABgAGIAXwBgAHEAdQBFAJUAogCyAKAAYABgAEIA4ABGANMA4QDxAMEBDwE1AFwBLAE6AQEBUQF4QkhCmEKoQrhCgAHIQsAB0MLAAcABwAHAAeDC6ABoAHDCwMMAAcABwAHAAdDDGMMAAcAB6MM4wwjDWMNow3jDaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAEjDqABWw6bDqABpg6gAaABoAHcDvwOPA+gAaABfA/8DvwO/A78DvwO/A78DvwO/A78DvwO/A78DvwO/A78DvwO/A78DvwO/A78DvwO/A78DvwO/A78DpcPAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcAB9cPKwkyCToJMAB1AHUAdQBCCUoJTQl1AFUJXAljCWcJawkwADAAMAAwAHMJdQB2CX4JdQCECYoJjgmWCXUAngkwAGAAYABxAHUApgn3A64JtAl1ALkJdQDACTAAMAAwADAAdQB1AHUAdQB1AHUAdQB1AHUAowYNBMUIMAAwADAAMADICcsJ0wnZCRUE4QkwAOkJ8An4CTAAMAB1AAAKvwh1AAgKDwoXCh8KdQAwACcKLgp1ADYKqAmICT4KRgowADAAdQB1AE4KMAB1AFYKdQBeCnUAZQowADAAMAAwADAAMAAwADAAMAAVBHUAbQowADAAdQC5CXUKMAAwAHwBxAijBogEMgF9CoQKiASMCpQKmgqIBKIKqgquCogEDQG2Cr4KxgrLCjAAMADTCtsKCgHjCusK8Qr5CgELMAAwADAAMAB1AIsECQsRC3UANAEZCzAAMAAwADAAMAB1ACELKQswAHUANAExCzkLdQBBC0kLMABRC1kLMAAwADAAMAAwADAAdQBhCzAAMAAwAGAAYABpC3ELdwt/CzAAMACHC4sLkwubC58Lpwt1AK4Ltgt1APsDMAAwADAAMAAwADAAMAAwAL4LwwvLC9IL1wvdCzAAMADlC+kL8Qv5C/8LSQswADAAMAAwADAAMAAwADAAMAAHDDAAMAAwADAAMAAODBYMHgx1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1ACYMMAAwADAAdQB1AHUALgx1AHUAdQB1AHUAdQA2DDAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AD4MdQBGDHUAdQB1AHUAdQB1AEkMdQB1AHUAdQB1AFAMMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQBYDHUAdQB1AF8MMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUA+wMVBGcMMAAwAHwBbwx1AHcMfwyHDI8MMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAYABgAJcMMAAwADAAdQB1AJ8MlQClDDAAMACtDCwHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsB7UMLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHdQB1AHUAdQB1AHUAdQB1AHUAdQB1AHUAdQB1AA0EMAC9DDAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAsBywHLAcsBywHLAcsBywHLQcwAMEMyAwsBywHLAcsBywHLAcsBywHLAcsBywHzAwwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAHUAdQB1ANQM2QzhDDAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMABgAGAAYABgAGAAYABgAOkMYADxDGAA+AwADQYNYABhCWAAYAAODTAAMAAwADAAFg1gAGAAHg37AzAAMAAwADAAYABgACYNYAAsDTQNPA1gAEMNPg1LDWAAYABgAGAAYABgAGAAYABgAGAAUg1aDYsGVglhDV0NcQBnDW0NdQ15DWAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAlQCBDZUAiA2PDZcNMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAnw2nDTAAMAAwADAAMAAwAHUArw23DTAAMAAwADAAMAAwADAAMAAwADAAMAB1AL8NMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAB1AHUAdQB1AHUAdQDHDTAAYABgAM8NMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAA1w11ANwNMAAwAD0B5A0wADAAMAAwADAAMADsDfQN/A0EDgwOFA4wABsOMAAwADAAMAAwADAAMAAwANIG0gbSBtIG0gbSBtIG0gYjDigOwQUuDsEFMw7SBjoO0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIGQg5KDlIOVg7SBtIGXg5lDm0OdQ7SBtIGfQ6EDooOjQ6UDtIGmg6hDtIG0gaoDqwO0ga0DrwO0gZgAGAAYADEDmAAYAAkBtIGzA5gANIOYADaDokO0gbSBt8O5w7SBu8O0gb1DvwO0gZgAGAAxA7SBtIG0gbSBtIGYABgAGAAYAAED2AAsAUMD9IG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIGFA8sBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAccD9IGLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHJA8sBywHLAcsBywHLAccDywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywPLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAc0D9IG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIGLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAccD9IG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIGFA8sBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHLAcsBywHPA/SBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gbSBtIG0gYUD0QPlQCVAJUAMAAwADAAMACVAJUAlQCVAJUAlQCVAEwPMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAA//8EAAQABAAEAAQABAAEAAQABAANAAMAAQABAAIABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQACgATABcAHgAbABoAHgAXABYAEgAeABsAGAAPABgAHABLAEsASwBLAEsASwBLAEsASwBLABgAGAAeAB4AHgATAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQABYAGwASAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAWAA0AEQAeAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAAFAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAJABYAGgAbABsAGwAeAB0AHQAeAE8AFwAeAA0AHgAeABoAGwBPAE8ADgBQAB0AHQAdAE8ATwAXAE8ATwBPABYAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAFAAUABQAFAAUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAB4AHgAeAFAATwBAAE8ATwBPAEAATwBQAFAATwBQAB4AHgAeAB4AHgAeAB0AHQAdAB0AHgAdAB4ADgBQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgBQAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAJAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAkACQAJAAkACQAJAAkABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgAeAFAAHgAeAB4AKwArAFAAUABQAFAAGABQACsAKwArACsAHgAeAFAAHgBQAFAAUAArAFAAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAAQABAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAUAAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAYAA0AKwArAB4AHgAbACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQADQAEAB4ABAAEAB4ABAAEABMABAArACsAKwArACsAKwArACsAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAKwArACsAKwBWAFYAVgBWAB4AHgArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AGgAaABoAGAAYAB4AHgAEAAQABAAEAAQABAAEAAQABAAEAAQAEwAEACsAEwATAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABLAEsASwBLAEsASwBLAEsASwBLABoAGQAZAB4AUABQAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQABMAUAAEAAQABAAEAAQABAAEAB4AHgAEAAQABAAEAAQABABQAFAABAAEAB4ABAAEAAQABABQAFAASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUAAeAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAFAABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQAUABQAB4AHgAYABMAUAArACsABAAbABsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAFAABAAEAAQABAAEAFAABAAEAAQAUAAEAAQABAAEAAQAKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAArACsAHgArAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAB4ABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAUAAEAAQABAAEAAQABAAEAFAAUABQAFAAUABQAFAAUABQAFAABAAEAA0ADQBLAEsASwBLAEsASwBLAEsASwBLAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAArAFAAUABQAFAAUABQAFAAUAArACsAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUAArACsAKwBQAFAAUABQACsAKwAEAFAABAAEAAQABAAEAAQABAArACsABAAEACsAKwAEAAQABABQACsAKwArACsAKwArACsAKwAEACsAKwArACsAUABQACsAUABQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLAFAAUAAaABoAUABQAFAAUABQAEwAHgAbAFAAHgAEACsAKwAEAAQABAArAFAAUABQAFAAUABQACsAKwArACsAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQACsAUABQACsAUABQACsAKwAEACsABAAEAAQABAAEACsAKwArACsABAAEACsAKwAEAAQABAArACsAKwAEACsAKwArACsAKwArACsAUABQAFAAUAArAFAAKwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLAAQABABQAFAAUAAEAB4AKwArACsAKwArACsAKwArACsAKwAEAAQABAArAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQACsAUABQAFAAUABQACsAKwAEAFAABAAEAAQABAAEAAQABAAEACsABAAEAAQAKwAEAAQABAArACsAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLAB4AGwArACsAKwArACsAKwArAFAABAAEAAQABAAEAAQAKwAEAAQABAArAFAAUABQAFAAUABQAFAAUAArACsAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAArACsABAAEACsAKwAEAAQABAArACsAKwArACsAKwArAAQABAAEACsAKwArACsAUABQACsAUABQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLAB4AUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArAAQAUAArAFAAUABQAFAAUABQACsAKwArAFAAUABQACsAUABQAFAAUAArACsAKwBQAFAAKwBQACsAUABQACsAKwArAFAAUAArACsAKwBQAFAAUAArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArAAQABAAEAAQABAArACsAKwAEAAQABAArAAQABAAEAAQAKwArAFAAKwArACsAKwArACsABAArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAHgAeAB4AHgAeAB4AGwAeACsAKwArACsAKwAEAAQABAAEAAQAUABQAFAAUABQAFAAUABQACsAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAUAAEAAQABAAEAAQABAAEACsABAAEAAQAKwAEAAQABAAEACsAKwArACsAKwArACsABAAEACsAUABQAFAAKwArACsAKwArAFAAUAAEAAQAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAKwAOAFAAUABQAFAAUABQAFAAHgBQAAQABAAEAA4AUABQAFAAUABQAFAAUABQACsAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAKwArAAQAUAAEAAQABAAEAAQABAAEACsABAAEAAQAKwAEAAQABAAEACsAKwArACsAKwArACsABAAEACsAKwArACsAKwArACsAUAArAFAAUAAEAAQAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwBQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAAQABAAEAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAFAABAAEAAQABAAEAAQABAArAAQABAAEACsABAAEAAQABABQAB4AKwArACsAKwBQAFAAUAAEAFAAUABQAFAAUABQAFAAUABQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLAFAAUABQAFAAUABQAFAAUABQABoAUABQAFAAUABQAFAAKwAEAAQABAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQACsAUAArACsAUABQAFAAUABQAFAAUAArACsAKwAEACsAKwArACsABAAEAAQABAAEAAQAKwAEACsABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArAAQABAAeACsAKwArACsAKwArACsAKwArACsAKwArAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAAqAFwAXAAqACoAKgAqACoAKgAqACsAKwArACsAGwBcAFwAXABcAFwAXABcACoAKgAqACoAKgAqACoAKgAeAEsASwBLAEsASwBLAEsASwBLAEsADQANACsAKwArACsAKwBcAFwAKwBcACsAXABcAFwAXABcACsAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACsAXAArAFwAXABcAFwAXABcAFwAXABcAFwAKgBcAFwAKgAqACoAKgAqACoAKgAqACoAXAArACsAXABcAFwAXABcACsAXAArACoAKgAqACoAKgAqACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwBcAFwAXABcAFAADgAOAA4ADgAeAA4ADgAJAA4ADgANAAkAEwATABMAEwATAAkAHgATAB4AHgAeAAQABAAeAB4AHgAeAB4AHgBLAEsASwBLAEsASwBLAEsASwBLAFAAUABQAFAAUABQAFAAUABQAFAADQAEAB4ABAAeAAQAFgARABYAEQAEAAQAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQADQAEAAQABAAEAAQADQAEAAQAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArAA0ADQAeAB4AHgAeAB4AHgAEAB4AHgAeAB4AHgAeACsAHgAeAA4ADgANAA4AHgAeAB4AHgAeAAkACQArACsAKwArACsAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgBcAEsASwBLAEsASwBLAEsASwBLAEsADQANAB4AHgAeAB4AXABcAFwAXABcAFwAKgAqACoAKgBcAFwAXABcACoAKgAqAFwAKgAqACoAXABcACoAKgAqACoAKgAqACoAXABcAFwAKgAqACoAKgBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACoAKgAqACoAKgAqACoAKgAqACoAKgAqAFwAKgBLAEsASwBLAEsASwBLAEsASwBLACoAKgAqACoAKgAqAFAAUABQAFAAUABQACsAUAArACsAKwArACsAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgBQAFAAUABQAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUAArACsAUABQAFAAUABQAFAAUAArAFAAKwBQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAKwBQACsAUABQAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsABAAEAAQAHgANAB4AHgAeAB4AHgAeAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUAArACsADQBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAANAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAWABEAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAA0ADQANAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAANAA0AKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUAArAAQABAArACsAKwArACsAKwArACsAKwArACsAKwBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqAA0ADQAVAFwADQAeAA0AGwBcACoAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwAeAB4AEwATAA0ADQAOAB4AEwATAB4ABAAEAAQACQArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAFAAUABQAFAAUAAEAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAHgArACsAKwATABMASwBLAEsASwBLAEsASwBLAEsASwBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAArACsAXABcAFwAXABcACsAKwArACsAKwArACsAKwArACsAKwBcAFwAXABcAFwAXABcAFwAXABcAFwAXAArACsAKwArAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAXAArACsAKwAqACoAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAArACsAHgAeAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACoAKgAqACoAKgAqACoAKgAqACoAKwAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKwArAAQASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArACoAKgAqACoAKgAqACoAXAAqACoAKgAqACoAKgArACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABAAEAAQABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABABQAFAAUABQAFAAUABQACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwANAA0AHgANAA0ADQANAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAAQABAAEAAQAHgAeAB4AHgAeAB4AHgAeAB4AKwArACsABAAEAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwAeAB4AHgAeAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArAA0ADQANAA0ADQBLAEsASwBLAEsASwBLAEsASwBLACsAKwArAFAAUABQAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAA0ADQBQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUAAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArAAQABAAEAB4ABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAAQAUABQAFAAUABQAFAABABQAFAABAAEAAQAUAArACsAKwArACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsABAAEAAQABAAEAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAKwBQACsAUAArAFAAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAB4AHgAeAB4AHgAeAB4AHgBQAB4AHgAeAFAAUABQACsAHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAUABQACsAKwAeAB4AHgAeAB4AHgArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArAFAAUABQACsAHgAeAB4AHgAeAB4AHgAOAB4AKwANAA0ADQANAA0ADQANAAkADQANAA0ACAAEAAsABAAEAA0ACQANAA0ADAAdAB0AHgAXABcAFgAXABcAFwAWABcAHQAdAB4AHgAUABQAFAANAAEAAQAEAAQABAAEAAQACQAaABoAGgAaABoAGgAaABoAHgAXABcAHQAVABUAHgAeAB4AHgAeAB4AGAAWABEAFQAVABUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ADQAeAA0ADQANAA0AHgANAA0ADQAHAB4AHgAeAB4AKwAEAAQABAAEAAQABAAEAAQABAAEAFAAUAArACsATwBQAFAAUABQAFAAHgAeAB4AFgARAE8AUABPAE8ATwBPAFAAUABQAFAAUAAeAB4AHgAWABEAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArABsAGwAbABsAGwAbABsAGgAbABsAGwAbABsAGwAbABsAGwAbABsAGwAbABsAGgAbABsAGwAbABoAGwAbABoAGwAbABsAGwAbABsAGwAbABsAGwAbABsAGwAbABsAGwAbAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAHgAeAFAAGgAeAB0AHgBQAB4AGgAeAB4AHgAeAB4AHgAeAB4AHgBPAB4AUAAbAB4AHgBQAFAAUABQAFAAHgAeAB4AHQAdAB4AUAAeAFAAHgBQAB4AUABPAFAAUAAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAHgBQAFAAUABQAE8ATwBQAFAAUABQAFAATwBQAFAATwBQAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAFAAUABQAFAATwBPAE8ATwBPAE8ATwBPAE8ATwBQAFAAUABQAFAAUABQAFAAUAAeAB4AUABQAFAAUABPAB4AHgArACsAKwArAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB4AHQAdAB4AHgAeAB0AHQAeAB4AHQAeAB4AHgAdAB4AHQAbABsAHgAdAB4AHgAeAB4AHQAeAB4AHQAdAB0AHQAeAB4AHQAeAB0AHgAdAB0AHQAdAB0AHQAeAB0AHgAeAB4AHgAeAB0AHQAdAB0AHgAeAB4AHgAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB4AHgAeAB0AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHgAeAB0AHQAdAB0AHgAeAB0AHQAeAB4AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHQAeAB4AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAeAB4AHgAdAB4AHgAeAB4AHgAeAB4AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABYAEQAWABEAHgAeAB4AHgAeAB4AHQAeAB4AHgAeAB4AHgAeACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAWABEAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAFAAHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeAB4AHgAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAeAB4AHQAdAB0AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHQAeAB0AHQAdAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB0AHQAeAB4AHQAdAB4AHgAeAB4AHQAdAB4AHgAeAB4AHQAdAB0AHgAeAB0AHgAeAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlAB4AHQAdAB4AHgAdAB4AHgAeAB4AHQAdAB4AHgAeAB4AJQAlAB0AHQAlAB4AJQAlACUAIAAlACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAeAB4AHgAeAB0AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHgAdAB0AHQAeAB0AJQAdAB0AHgAdAB0AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAdAB0AHQAdACUAHgAlACUAJQAdACUAJQAdAB0AHQAlACUAHQAdACUAHQAdACUAJQAlAB4AHQAeAB4AHgAeAB0AHQAlAB0AHQAdAB0AHQAdACUAJQAlACUAJQAdACUAJQAgACUAHQAdACUAJQAlACUAJQAlACUAJQAeAB4AHgAlACUAIAAgACAAIAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AFwAXABcAFwAXABcAHgATABMAJQAeAB4AHgAWABEAFgARABYAEQAWABEAFgARABYAEQAWABEATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABYAEQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAWABEAFgARABYAEQAWABEAFgARAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFgARABYAEQAWABEAFgARABYAEQAWABEAFgARABYAEQAWABEAFgARABYAEQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAWABEAFgARAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFgARAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAEAAQABAAeAB4AKwArACsAKwArABMADQANAA0AUAATAA0AUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAUAANACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAA0ADQANAA0ADQANAA0ADQAeAA0AFgANAB4AHgAXABcAHgAeABcAFwAWABEAFgARABYAEQAWABEADQANAA0ADQATAFAADQANAB4ADQANAB4AHgAeAB4AHgAMAAwADQANAA0AHgANAA0AFgANAA0ADQANAA0ADQANAA0AHgANAB4ADQANAB4AHgAeACsAKwArACsAKwArACsAKwArACsAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAKwArACsAKwArACsAKwArACsAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArAA0AEQARACUAJQBHAFcAVwAWABEAFgARABYAEQAWABEAFgARACUAJQAWABEAFgARABYAEQAWABEAFQAWABEAEQAlAFcAVwBXAFcAVwBXAFcAVwBXAAQABAAEAAQABAAEACUAVwBXAFcAVwA2ACUAJQBXAFcAVwBHAEcAJQAlACUAKwBRAFcAUQBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFEAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBRAFcAUQBXAFEAVwBXAFcAVwBXAFcAUQBXAFcAVwBXAFcAVwBRAFEAKwArAAQABAAVABUARwBHAFcAFQBRAFcAUQBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBRAFcAVwBXAFcAVwBXAFEAUQBXAFcAVwBXABUAUQBHAEcAVwArACsAKwArACsAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwAlACUAVwBXAFcAVwAlACUAJQAlACUAJQAlACUAJQAlACsAKwArACsAKwArACsAKwArACsAKwArAFEAUQBRAFEAUQBRAFEAUQBRAFEAUQBRAFEAUQBRAFEAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQBPAE8ATwBPAE8ATwBPAE8AJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQAlAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAEcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAADQATAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABLAEsASwBLAEsASwBLAEsASwBLAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAABAAEAAQABAAeAAQABAAEAAQABAAEAAQABAAEAAQAHgBQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AUABQAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAeAA0ADQANAA0ADQArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAB4AHgAeAB4AHgAeAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAeAB4AUABQAFAAUABQAFAAUABQAFAAUABQAAQAUABQAFAABABQAFAAUABQAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAeAB4AHgAeAAQAKwArACsAUABQAFAAUABQAFAAHgAeABoAHgArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAADgAOABMAEwArACsAKwArACsAKwArACsABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwANAA0ASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAFAAUAAeAB4AHgBQAA4AUABQAAQAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAA0ADQBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArACsAKwArACsAKwArAB4AWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYACsAKwArAAQAHgAeAB4AHgAeAB4ADQANAA0AHgAeAB4AHgArAFAASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArAB4AHgBcAFwAXABcAFwAKgBcAFwAXABcAFwAXABcAFwAXABcAEsASwBLAEsASwBLAEsASwBLAEsAXABcAFwAXABcACsAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArAFAAUABQAAQAUABQAFAAUABQAFAAUABQAAQABAArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAHgANAA0ADQBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKgAqACoAXAAqACoAKgBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAAqAFwAKgAqACoAXABcACoAKgBcAFwAXABcAFwAKgAqAFwAKgBcACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFwAXABcACoAKgBQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAA0ADQBQAFAAUAAEAAQAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUAArACsAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQADQAEAAQAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAVABVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBUAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVACsAKwArACsAKwArACsAKwArACsAKwArAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAKwArACsAKwBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAKwArACsAKwAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAKwArACsAKwArAFYABABWAFYAVgBWAFYAVgBWAFYAVgBWAB4AVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgArAFYAVgBWAFYAVgArAFYAKwBWAFYAKwBWAFYAKwBWAFYAVgBWAFYAVgBWAFYAVgBWAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAEQAWAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUAAaAB4AKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAGAARABEAGAAYABMAEwAWABEAFAArACsAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACUAJQAlACUAJQAWABEAFgARABYAEQAWABEAFgARABYAEQAlACUAFgARACUAJQAlACUAJQAlACUAEQAlABEAKwAVABUAEwATACUAFgARABYAEQAWABEAJQAlACUAJQAlACUAJQAlACsAJQAbABoAJQArACsAKwArAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAcAKwATACUAJQAbABoAJQAlABYAEQAlACUAEQAlABEAJQBXAFcAVwBXAFcAVwBXAFcAVwBXABUAFQAlACUAJQATACUAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXABYAJQARACUAJQAlAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwAWACUAEQAlABYAEQARABYAEQARABUAVwBRAFEAUQBRAFEAUQBRAFEAUQBRAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAEcARwArACsAVwBXAFcAVwBXAFcAKwArAFcAVwBXAFcAVwBXACsAKwBXAFcAVwBXAFcAVwArACsAVwBXAFcAKwArACsAGgAbACUAJQAlABsAGwArAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwAEAAQABAAQAB0AKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsADQANAA0AKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAAQAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAA0AUABQAFAAUAArACsAKwArAFAAUABQAFAAUABQAFAAUAANAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwAeACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAKwArAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUAArACsAKwBQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwANAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAB4AUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAUABQAFAAUABQAAQABAAEACsABAAEACsAKwArACsAKwAEAAQABAAEAFAAUABQAFAAKwBQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAQABAAEACsAKwArACsABABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAA0ADQANAA0ADQANAA0ADQAeACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAFAAUABQAFAAUABQAFAAUAAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAArACsAKwArAFAAUABQAFAAUAANAA0ADQANAA0ADQAUACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsADQANAA0ADQANAA0ADQBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArAFAAUABQAFAAUABQAAQABAAEAAQAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUAArAAQABAANACsAKwBQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAB4AHgAeAB4AHgArACsAKwArACsAKwAEAAQABAAEAAQABAAEAA0ADQAeAB4AHgAeAB4AKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgANAA0ADQANACsAKwArACsAKwArACsAKwArACsAKwAeACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsASwBLAEsASwBLAEsASwBLAEsASwANAA0ADQANAFAABAAEAFAAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAeAA4AUAArACsAKwArACsAKwArACsAKwAEAFAAUABQAFAADQANAB4ADQAEAAQABAAEAB4ABAAEAEsASwBLAEsASwBLAEsASwBLAEsAUAAOAFAADQANAA0AKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAANAA0AHgANAA0AHgAEACsAUABQAFAAUABQAFAAUAArAFAAKwBQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAA0AKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsABAAEAAQABAArAFAAUABQAFAAUABQAFAAUAArACsAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQACsAUABQAFAAUABQACsABAAEAFAABAAEAAQABAAEAAQABAArACsABAAEACsAKwAEAAQABAArACsAUAArACsAKwArACsAKwAEACsAKwArACsAKwBQAFAAUABQAFAABAAEACsAKwAEAAQABAAEAAQABAAEACsAKwArAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwArACsABAAEAAQABAAEAAQABABQAFAAUABQAA0ADQANAA0AHgBLAEsASwBLAEsASwBLAEsASwBLAA0ADQArAB4ABABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAAQABAAEAFAAUAAeAFAAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAArACsABAAEAAQABAAEAAQABAAEAAQADgANAA0AEwATAB4AHgAeAA0ADQANAA0ADQANAA0ADQANAA0ADQANAA0ADQANAFAAUABQAFAABAAEACsAKwAEAA0ADQAeAFAAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAFAAKwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKwArACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwBcAFwADQANAA0AKgBQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAKwArAFAAKwArAFAAUABQAFAAUABQAFAAUAArAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQAKwAEAAQAKwArAAQABAAEAAQAUAAEAFAABAAEAA0ADQANACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAArACsABAAEAAQABAAEAAQABABQAA4AUAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAFAABAAEAAQABAAOAB4ADQANAA0ADQAOAB4ABAArACsAKwArACsAKwArACsAUAAEAAQABAAEAAQABAAEAAQABAAEAAQAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAA0ADQANAFAADgAOAA4ADQANACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEACsABAAEAAQABAAEAAQABAAEAFAADQANAA0ADQANACsAKwArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwAOABMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQACsAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAArACsAKwAEACsABAAEACsABAAEAAQABAAEAAQABABQAAQAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAKwBQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQAKwAEAAQAKwAEAAQABAAEAAQAUAArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAaABoAGgAaAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsADQANAA0ADQANACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAASABIAEgAQwBDAEMAUABQAFAAUABDAFAAUABQAEgAQwBIAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAASABDAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwAJAAkACQAJAAkACQAJABYAEQArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABIAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwANAA0AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAQABAAEAAQABAANACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAA0ADQANAB4AHgAeAB4AHgAeAFAAUABQAFAADQAeACsAKwArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAANAA0AHgAeACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwAEAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArACsAKwAEAAQABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAARwBHABUARwAJACsAKwArACsAKwArACsAKwArACsAKwAEAAQAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACsAKwArACsAKwArACsAKwBXAFcAVwBXAFcAVwBXAFcAVwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUQBRAFEAKwArACsAKwArACsAKwArACsAKwArACsAKwBRAFEAUQBRACsAKwArACsAKwArACsAKwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUAArACsAHgAEAAQADQAEAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArAB4AHgAeAB4AHgAeAB4AKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAAQABAAEAAQABAAeAB4AHgAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAB4AHgAEAAQABAAEAAQABAAEAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQAHgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwBQAFAAKwArAFAAKwArAFAAUAArACsAUABQAFAAUAArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAUAArAFAAUABQAFAAUABQAFAAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwBQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAHgAeAFAAUABQAFAAUAArAFAAKwArACsAUABQAFAAUABQAFAAUAArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeACsAKwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgAeAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgAeAB4AHgAeAB4ABAAeAB4AHgAeAB4AHgAeAB4AHgAeAAQAHgAeAA0ADQANAA0AHgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAAQABAAEAAQAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAAEAAQAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArAAQABAAEAAQABAAEAAQAKwAEAAQAKwAEAAQABAAEAAQAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwAEAAQABAAEAAQABAAEAFAAUABQAFAAUABQAFAAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwBQAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArABsAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArAB4AHgAeAB4ABAAEAAQABAAEAAQABABQACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArABYAFgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAGgBQAFAAUAAaAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAKwBQACsAKwBQACsAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAKwBQACsAUAArACsAKwArACsAKwBQACsAKwArACsAUAArAFAAKwBQACsAUABQAFAAKwBQAFAAKwBQACsAKwBQACsAUAArAFAAKwBQACsAUAArAFAAUAArAFAAKwArAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQAFAAUAArAFAAUABQAFAAKwBQACsAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAUABQAFAAKwBQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8AJQAlACUAHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB4AHgAeACUAJQAlAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAJQAlACUAJQAlACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAB4AHgAlACUAJQAlACUAHgAlACUAJQAlACUAIAAgACAAJQAlACAAJQAlACAAIAAgACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACEAIQAhACEAIQAlACUAIAAgACUAJQAgACAAIAAgACAAIAAgACAAIAAgACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJQAlACUAIAAlACUAJQAlACAAIAAgACUAIAAgACAAJQAlACUAJQAlACUAJQAgACUAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAlAB4AJQAeACUAJQAlACUAJQAgACUAJQAlACUAHgAlAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAlACUAJQAlACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAJQAlACUAJQAgACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACAAIAAgACUAJQAlACAAIAAgACAAIAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABcAFwAXABUAFQAVAB4AHgAeAB4AJQAlACUAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAgACUAJQAlACUAJQAlACUAJQAlACAAJQAlACUAJQAlACUAJQAlACUAJQAlACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAgACUAJQAgACUAJQAlACUAJQAlACUAJQAgACAAIAAgACAAIAAgACAAJQAlACUAJQAlACUAIAAlACUAJQAlACUAJQAlACUAJQAgACAAIAAgACAAIAAgACAAIAAgACUAJQAgACAAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAgACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAlACAAIAAlACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAgACAAIAAlACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJQAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAKwArAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwAlACUAJQAlACUAJQAlACUAJQAlACUAVwBXACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAKwAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAA==";
		var LETTER_NUMBER_MODIFIER = 50;
		var BK = 1;
		var CR$1 = 2;
		var LF$1 = 3;
		var CM = 4;
		var NL = 5;
		var WJ = 7;
		var ZW = 8;
		var GL = 9;
		var SP = 10;
		var ZWJ$1 = 11;
		var B2 = 12;
		var BA = 13;
		var BB = 14;
		var HY = 15;
		var CB = 16;
		var CL = 17;
		var CP = 18;
		var EX = 19;
		var IN = 20;
		var NS$1 = 21;
		var OP = 22;
		var QU = 23;
		var IS = 24;
		var NU = 25;
		var PO = 26;
		var PR = 27;
		var SY = 28;
		var AI = 29;
		var AL = 30;
		var CJ = 31;
		var EB = 32;
		var EM = 33;
		var H2 = 34;
		var H3 = 35;
		var HL = 36;
		var ID = 37;
		var JL = 38;
		var JV = 39;
		var JT = 40;
		var RI$1 = 41;
		var SA = 42;
		var XX = 43;
		var ea_OP = [9001, 65288];
		var BREAK_MANDATORY = "!";
		var BREAK_NOT_ALLOWED$1 = "×";
		var BREAK_ALLOWED$1 = "÷";
		var UnicodeTrie$1 = createTrieFromBase64$1(base64$1);
		var ALPHABETICS = [AL, HL];
		var HARD_LINE_BREAKS = [
			BK,
			CR$1,
			LF$1,
			NL
		];
		var SPACE$1 = [SP, ZW];
		var PREFIX_POSTFIX = [PR, PO];
		var LINE_BREAKS = HARD_LINE_BREAKS.concat(SPACE$1);
		var KOREAN_SYLLABLE_BLOCK = [
			JL,
			JV,
			JT,
			H2,
			H3
		];
		var HYPHEN = [HY, BA];
		var codePointsToCharacterClasses = function(codePoints, lineBreak) {
			if (lineBreak === void 0) lineBreak = "strict";
			var types = [];
			var indices = [];
			var categories = [];
			codePoints.forEach(function(codePoint, index) {
				var classType = UnicodeTrie$1.get(codePoint);
				if (classType > LETTER_NUMBER_MODIFIER) {
					categories.push(true);
					classType -= LETTER_NUMBER_MODIFIER;
				} else categories.push(false);
				if ([
					"normal",
					"auto",
					"loose"
				].indexOf(lineBreak) !== -1) {
					if ([
						8208,
						8211,
						12316,
						12448
					].indexOf(codePoint) !== -1) {
						indices.push(index);
						return types.push(CB);
					}
				}
				if (classType === CM || classType === ZWJ$1) {
					if (index === 0) {
						indices.push(index);
						return types.push(AL);
					}
					var prev = types[index - 1];
					if (LINE_BREAKS.indexOf(prev) === -1) {
						indices.push(indices[index - 1]);
						return types.push(prev);
					}
					indices.push(index);
					return types.push(AL);
				}
				indices.push(index);
				if (classType === CJ) return types.push(lineBreak === "strict" ? NS$1 : ID);
				if (classType === SA) return types.push(AL);
				if (classType === AI) return types.push(AL);
				if (classType === XX) if (codePoint >= 131072 && codePoint <= 196605 || codePoint >= 196608 && codePoint <= 262141) return types.push(ID);
				else return types.push(AL);
				types.push(classType);
			});
			return [
				indices,
				types,
				categories
			];
		};
		var isAdjacentWithSpaceIgnored = function(a, b, currentIndex, classTypes) {
			var current = classTypes[currentIndex];
			if (Array.isArray(a) ? a.indexOf(current) !== -1 : a === current) {
				var i = currentIndex;
				while (i <= classTypes.length) {
					i++;
					var next = classTypes[i];
					if (next === b) return true;
					if (next !== SP) break;
				}
			}
			if (current === SP) {
				var i = currentIndex;
				while (i > 0) {
					i--;
					var prev = classTypes[i];
					if (Array.isArray(a) ? a.indexOf(prev) !== -1 : a === prev) {
						var n = currentIndex;
						while (n <= classTypes.length) {
							n++;
							var next = classTypes[n];
							if (next === b) return true;
							if (next !== SP) break;
						}
					}
					if (prev !== SP) break;
				}
			}
			return false;
		};
		var previousNonSpaceClassType = function(currentIndex, classTypes) {
			var i = currentIndex;
			while (i >= 0) {
				var type = classTypes[i];
				if (type === SP) i--;
				else return type;
			}
			return 0;
		};
		var _lineBreakAtIndex = function(codePoints, classTypes, indicies, index, forbiddenBreaks) {
			if (indicies[index] === 0) return BREAK_NOT_ALLOWED$1;
			var currentIndex = index - 1;
			if (Array.isArray(forbiddenBreaks) && forbiddenBreaks[currentIndex] === true) return BREAK_NOT_ALLOWED$1;
			var beforeIndex = currentIndex - 1;
			var afterIndex = currentIndex + 1;
			var current = classTypes[currentIndex];
			var before = beforeIndex >= 0 ? classTypes[beforeIndex] : 0;
			var next = classTypes[afterIndex];
			if (current === CR$1 && next === LF$1) return BREAK_NOT_ALLOWED$1;
			if (HARD_LINE_BREAKS.indexOf(current) !== -1) return BREAK_MANDATORY;
			if (HARD_LINE_BREAKS.indexOf(next) !== -1) return BREAK_NOT_ALLOWED$1;
			if (SPACE$1.indexOf(next) !== -1) return BREAK_NOT_ALLOWED$1;
			if (previousNonSpaceClassType(currentIndex, classTypes) === ZW) return BREAK_ALLOWED$1;
			if (UnicodeTrie$1.get(codePoints[currentIndex]) === ZWJ$1) return BREAK_NOT_ALLOWED$1;
			if ((current === EB || current === EM) && UnicodeTrie$1.get(codePoints[afterIndex]) === ZWJ$1) return BREAK_NOT_ALLOWED$1;
			if (current === WJ || next === WJ) return BREAK_NOT_ALLOWED$1;
			if (current === GL) return BREAK_NOT_ALLOWED$1;
			if ([
				SP,
				BA,
				HY
			].indexOf(current) === -1 && next === GL) return BREAK_NOT_ALLOWED$1;
			if ([
				CL,
				CP,
				EX,
				IS,
				SY
			].indexOf(next) !== -1) return BREAK_NOT_ALLOWED$1;
			if (previousNonSpaceClassType(currentIndex, classTypes) === OP) return BREAK_NOT_ALLOWED$1;
			if (isAdjacentWithSpaceIgnored(QU, OP, currentIndex, classTypes)) return BREAK_NOT_ALLOWED$1;
			if (isAdjacentWithSpaceIgnored([CL, CP], NS$1, currentIndex, classTypes)) return BREAK_NOT_ALLOWED$1;
			if (isAdjacentWithSpaceIgnored(B2, B2, currentIndex, classTypes)) return BREAK_NOT_ALLOWED$1;
			if (current === SP) return BREAK_ALLOWED$1;
			if (current === QU || next === QU) return BREAK_NOT_ALLOWED$1;
			if (next === CB || current === CB) return BREAK_ALLOWED$1;
			if ([
				BA,
				HY,
				NS$1
			].indexOf(next) !== -1 || current === BB) return BREAK_NOT_ALLOWED$1;
			if (before === HL && HYPHEN.indexOf(current) !== -1) return BREAK_NOT_ALLOWED$1;
			if (current === SY && next === HL) return BREAK_NOT_ALLOWED$1;
			if (next === IN) return BREAK_NOT_ALLOWED$1;
			if (ALPHABETICS.indexOf(next) !== -1 && current === NU || ALPHABETICS.indexOf(current) !== -1 && next === NU) return BREAK_NOT_ALLOWED$1;
			if (current === PR && [
				ID,
				EB,
				EM
			].indexOf(next) !== -1 || [
				ID,
				EB,
				EM
			].indexOf(current) !== -1 && next === PO) return BREAK_NOT_ALLOWED$1;
			if (ALPHABETICS.indexOf(current) !== -1 && PREFIX_POSTFIX.indexOf(next) !== -1 || PREFIX_POSTFIX.indexOf(current) !== -1 && ALPHABETICS.indexOf(next) !== -1) return BREAK_NOT_ALLOWED$1;
			if ([PR, PO].indexOf(current) !== -1 && (next === NU || [OP, HY].indexOf(next) !== -1 && classTypes[afterIndex + 1] === NU) || [OP, HY].indexOf(current) !== -1 && next === NU || current === NU && [
				NU,
				SY,
				IS
			].indexOf(next) !== -1) return BREAK_NOT_ALLOWED$1;
			if ([
				NU,
				SY,
				IS,
				CL,
				CP
			].indexOf(next) !== -1) {
				var prevIndex = currentIndex;
				while (prevIndex >= 0) {
					var type = classTypes[prevIndex];
					if (type === NU) return BREAK_NOT_ALLOWED$1;
					else if ([SY, IS].indexOf(type) !== -1) prevIndex--;
					else break;
				}
			}
			if ([PR, PO].indexOf(next) !== -1) {
				var prevIndex = [CL, CP].indexOf(current) !== -1 ? beforeIndex : currentIndex;
				while (prevIndex >= 0) {
					var type = classTypes[prevIndex];
					if (type === NU) return BREAK_NOT_ALLOWED$1;
					else if ([SY, IS].indexOf(type) !== -1) prevIndex--;
					else break;
				}
			}
			if (JL === current && [
				JL,
				JV,
				H2,
				H3
			].indexOf(next) !== -1 || [JV, H2].indexOf(current) !== -1 && [JV, JT].indexOf(next) !== -1 || [JT, H3].indexOf(current) !== -1 && next === JT) return BREAK_NOT_ALLOWED$1;
			if (KOREAN_SYLLABLE_BLOCK.indexOf(current) !== -1 && [IN, PO].indexOf(next) !== -1 || KOREAN_SYLLABLE_BLOCK.indexOf(next) !== -1 && current === PR) return BREAK_NOT_ALLOWED$1;
			if (ALPHABETICS.indexOf(current) !== -1 && ALPHABETICS.indexOf(next) !== -1) return BREAK_NOT_ALLOWED$1;
			if (current === IS && ALPHABETICS.indexOf(next) !== -1) return BREAK_NOT_ALLOWED$1;
			if (ALPHABETICS.concat(NU).indexOf(current) !== -1 && next === OP && ea_OP.indexOf(codePoints[afterIndex]) === -1 || ALPHABETICS.concat(NU).indexOf(next) !== -1 && current === CP) return BREAK_NOT_ALLOWED$1;
			if (current === RI$1 && next === RI$1) {
				var i = indicies[currentIndex];
				var count = 1;
				while (i > 0) {
					i--;
					if (classTypes[i] === RI$1) count++;
					else break;
				}
				if (count % 2 !== 0) return BREAK_NOT_ALLOWED$1;
			}
			if (current === EB && next === EM) return BREAK_NOT_ALLOWED$1;
			return BREAK_ALLOWED$1;
		};
		var cssFormattedClasses = function(codePoints, options) {
			if (!options) options = {
				lineBreak: "normal",
				wordBreak: "normal"
			};
			var _a = codePointsToCharacterClasses(codePoints, options.lineBreak), indicies = _a[0], classTypes = _a[1], isLetterNumber = _a[2];
			if (options.wordBreak === "break-all" || options.wordBreak === "break-word") classTypes = classTypes.map(function(type) {
				return [
					NU,
					AL,
					SA
				].indexOf(type) !== -1 ? ID : type;
			});
			var forbiddenBreakpoints = options.wordBreak === "keep-all" ? isLetterNumber.map(function(letterNumber, i) {
				return letterNumber && codePoints[i] >= 19968 && codePoints[i] <= 40959;
			}) : void 0;
			return [
				indicies,
				classTypes,
				forbiddenBreakpoints
			];
		};
		var Break = function() {
			function Break(codePoints, lineBreak, start, end) {
				this.codePoints = codePoints;
				this.required = lineBreak === BREAK_MANDATORY;
				this.start = start;
				this.end = end;
			}
			Break.prototype.slice = function() {
				return fromCodePoint$1.apply(void 0, this.codePoints.slice(this.start, this.end));
			};
			return Break;
		}();
		var LineBreaker = function(str, options) {
			var codePoints = toCodePoints$1(str);
			var _a = cssFormattedClasses(codePoints, options), indicies = _a[0], classTypes = _a[1], forbiddenBreakpoints = _a[2];
			var length = codePoints.length;
			var lastEnd = 0;
			var nextIndex = 0;
			return { next: function() {
				if (nextIndex >= length) return {
					done: true,
					value: null
				};
				var lineBreak = BREAK_NOT_ALLOWED$1;
				while (nextIndex < length && (lineBreak = _lineBreakAtIndex(codePoints, classTypes, indicies, ++nextIndex, forbiddenBreakpoints)) === BREAK_NOT_ALLOWED$1);
				if (lineBreak !== BREAK_NOT_ALLOWED$1 || nextIndex === length) {
					var value = new Break(codePoints, lineBreak, lastEnd, nextIndex);
					lastEnd = nextIndex;
					return {
						value,
						done: false
					};
				}
				return {
					done: true,
					value: null
				};
			} };
		};
		const REPLACEMENT_CHARACTER = 65533;
		const isDigit = (codePoint) => codePoint >= 48 && codePoint <= 57;
		const isSurrogateCodePoint = (codePoint) => codePoint >= 55296 && codePoint <= 57343;
		const isHex = (codePoint) => isDigit(codePoint) || codePoint >= 65 && codePoint <= 70 || codePoint >= 97 && codePoint <= 102;
		const isLowerCaseLetter = (codePoint) => codePoint >= 97 && codePoint <= 122;
		const isUpperCaseLetter = (codePoint) => codePoint >= 65 && codePoint <= 90;
		const isLetter = (codePoint) => isLowerCaseLetter(codePoint) || isUpperCaseLetter(codePoint);
		const isNonASCIICodePoint = (codePoint) => codePoint >= 128;
		const isWhiteSpace = (codePoint) => codePoint === 10 || codePoint === 9 || codePoint === 32;
		const isNameStartCodePoint = (codePoint) => isLetter(codePoint) || isNonASCIICodePoint(codePoint) || codePoint === 95;
		const isNameCodePoint = (codePoint) => isNameStartCodePoint(codePoint) || isDigit(codePoint) || codePoint === 45;
		const isNonPrintableCodePoint = (codePoint) => {
			return codePoint >= 0 && codePoint <= 8 || codePoint === 11 || codePoint >= 14 && codePoint <= 31 || codePoint === 127;
		};
		const isValidEscape = (c1, c2) => {
			if (c1 !== 92) return false;
			return c2 !== 10;
		};
		const isIdentifierStart = (c1, c2, c3) => {
			if (c1 === 45) return isNameStartCodePoint(c2) || isValidEscape(c2, c3);
			else if (isNameStartCodePoint(c1)) return true;
			else if (c1 === 92 && isValidEscape(c1, c2)) return true;
			return false;
		};
		const isNumberStart = (c1, c2, c3) => {
			if (c1 === 43 || c1 === 45) {
				if (isDigit(c2)) return true;
				return c2 === 46 && isDigit(c3);
			}
			if (c1 === 46) return isDigit(c2);
			return isDigit(c1);
		};
		const stringToNumber = (codePoints) => {
			let c = 0;
			let sign = 1;
			if (codePoints[c] === 43 || codePoints[c] === 45) {
				if (codePoints[c] === 45) sign = -1;
				c++;
			}
			const integers = [];
			while (isDigit(codePoints[c])) integers.push(codePoints[c++]);
			const int = integers.length ? parseInt(fromCodePoint$1(...integers), 10) : 0;
			if (codePoints[c] === 46) c++;
			const fraction = [];
			while (isDigit(codePoints[c])) fraction.push(codePoints[c++]);
			const fracd = fraction.length;
			const frac = fracd ? parseInt(fromCodePoint$1(...fraction), 10) : 0;
			if (codePoints[c] === 69 || codePoints[c] === 101) c++;
			let expsign = 1;
			if (codePoints[c] === 43 || codePoints[c] === 45) {
				if (codePoints[c] === 45) expsign = -1;
				c++;
			}
			const exponent = [];
			while (isDigit(codePoints[c])) exponent.push(codePoints[c++]);
			const exp = exponent.length ? parseInt(fromCodePoint$1(...exponent), 10) : 0;
			return sign * (int + frac * Math.pow(10, -fracd)) * Math.pow(10, expsign * exp);
		};
		const LEFT_PARENTHESIS_TOKEN = { type: 2 };
		const RIGHT_PARENTHESIS_TOKEN = { type: 3 };
		const COMMA_TOKEN = { type: 4 };
		const SUFFIX_MATCH_TOKEN = { type: 13 };
		const PREFIX_MATCH_TOKEN = { type: 8 };
		const COLUMN_TOKEN = { type: 21 };
		const DASH_MATCH_TOKEN = { type: 9 };
		const INCLUDE_MATCH_TOKEN = { type: 10 };
		const LEFT_CURLY_BRACKET_TOKEN = { type: 11 };
		const RIGHT_CURLY_BRACKET_TOKEN = { type: 12 };
		const SUBSTRING_MATCH_TOKEN = { type: 14 };
		const BAD_URL_TOKEN = { type: 23 };
		const BAD_STRING_TOKEN = { type: 1 };
		const CDO_TOKEN = { type: 25 };
		const CDC_TOKEN = { type: 24 };
		const COLON_TOKEN = { type: 26 };
		const SEMICOLON_TOKEN = { type: 27 };
		const LEFT_SQUARE_BRACKET_TOKEN = { type: 28 };
		const RIGHT_SQUARE_BRACKET_TOKEN = { type: 29 };
		const WHITESPACE_TOKEN = { type: 31 };
		const EOF_TOKEN = { type: 32 };
		var Tokenizer = class Tokenizer {
			static {
				this._pool = [];
			}
			static {
				this.MAX_POOL_SIZE = 40;
			}
			static get() {
				return Tokenizer._pool.pop() || new Tokenizer();
			}
			static release(tokenizer) {
				if (Tokenizer._pool.length < Tokenizer.MAX_POOL_SIZE) {
					tokenizer._reset();
					Tokenizer._pool.push(tokenizer);
				}
			}
			constructor() {
				this._value = [];
			}
			_reset() {
				this._value = [];
			}
			write(chunk) {
				this._value = this._value.concat(toCodePoints$1(chunk));
			}
			read() {
				const tokens = [];
				let token = this.consumeToken();
				while (token !== EOF_TOKEN) {
					tokens.push(token);
					token = this.consumeToken();
				}
				return tokens;
			}
			consumeToken() {
				const codePoint = this.consumeCodePoint();
				switch (codePoint) {
					case 34: return this.consumeStringToken(34);
					case 35: {
						const c1 = this.peekCodePoint(0);
						const c2 = this.peekCodePoint(1);
						const c3 = this.peekCodePoint(2);
						if (isNameCodePoint(c1) || isValidEscape(c2, c3)) {
							const flags = isIdentifierStart(c1, c2, c3) ? 2 : 1;
							return {
								type: 5,
								value: this.consumeName(),
								flags
							};
						}
						break;
					}
					case 36:
						if (this.peekCodePoint(0) === 61) {
							this.consumeCodePoint();
							return SUFFIX_MATCH_TOKEN;
						}
						break;
					case 39: return this.consumeStringToken(39);
					case 40: return LEFT_PARENTHESIS_TOKEN;
					case 41: return RIGHT_PARENTHESIS_TOKEN;
					case 42:
						if (this.peekCodePoint(0) === 61) {
							this.consumeCodePoint();
							return SUBSTRING_MATCH_TOKEN;
						}
						break;
					case 43:
						if (isNumberStart(codePoint, this.peekCodePoint(0), this.peekCodePoint(1))) {
							this.reconsumeCodePoint(codePoint);
							return this.consumeNumericToken();
						}
						break;
					case 44: return COMMA_TOKEN;
					case 45: {
						const e1 = codePoint;
						const e2 = this.peekCodePoint(0);
						const e3 = this.peekCodePoint(1);
						if (isNumberStart(e1, e2, e3)) {
							this.reconsumeCodePoint(codePoint);
							return this.consumeNumericToken();
						}
						if (isIdentifierStart(e1, e2, e3)) {
							this.reconsumeCodePoint(codePoint);
							return this.consumeIdentLikeToken();
						}
						if (e2 === 45 && e3 === 62) {
							this.consumeCodePoint();
							this.consumeCodePoint();
							return CDC_TOKEN;
						}
						break;
					}
					case 46:
						if (isNumberStart(codePoint, this.peekCodePoint(0), this.peekCodePoint(1))) {
							this.reconsumeCodePoint(codePoint);
							return this.consumeNumericToken();
						}
						break;
					case 47:
						if (this.peekCodePoint(0) === 42) {
							this.consumeCodePoint();
							while (true) {
								let c = this.consumeCodePoint();
								if (c === 42) {
									c = this.consumeCodePoint();
									if (c === 47) return this.consumeToken();
								}
								if (c === -1) return this.consumeToken();
							}
						}
						break;
					case 58: return COLON_TOKEN;
					case 59: return SEMICOLON_TOKEN;
					case 60:
						if (this.peekCodePoint(0) === 33 && this.peekCodePoint(1) === 45 && this.peekCodePoint(2) === 45) {
							this.consumeCodePoint();
							this.consumeCodePoint();
							return CDO_TOKEN;
						}
						break;
					case 64:
						if (isIdentifierStart(this.peekCodePoint(0), this.peekCodePoint(1), this.peekCodePoint(2))) return {
							type: 7,
							value: this.consumeName()
						};
						break;
					case 91: return LEFT_SQUARE_BRACKET_TOKEN;
					case 92:
						if (isValidEscape(codePoint, this.peekCodePoint(0))) {
							this.reconsumeCodePoint(codePoint);
							return this.consumeIdentLikeToken();
						}
						break;
					case 93: return RIGHT_SQUARE_BRACKET_TOKEN;
					case 61:
						if (this.peekCodePoint(0) === 61) {
							this.consumeCodePoint();
							return PREFIX_MATCH_TOKEN;
						}
						break;
					case 123: return LEFT_CURLY_BRACKET_TOKEN;
					case 125: return RIGHT_CURLY_BRACKET_TOKEN;
					case 117:
					case 85: {
						const u1 = this.peekCodePoint(0);
						const u2 = this.peekCodePoint(1);
						if (u1 === 43 && (isHex(u2) || u2 === 63)) {
							this.consumeCodePoint();
							this.consumeUnicodeRangeToken();
						}
						this.reconsumeCodePoint(codePoint);
						return this.consumeIdentLikeToken();
					}
					case 124:
						if (this.peekCodePoint(0) === 61) {
							this.consumeCodePoint();
							return DASH_MATCH_TOKEN;
						}
						if (this.peekCodePoint(0) === 124) {
							this.consumeCodePoint();
							return COLUMN_TOKEN;
						}
						break;
					case 126:
						if (this.peekCodePoint(0) === 61) {
							this.consumeCodePoint();
							return INCLUDE_MATCH_TOKEN;
						}
						break;
					case -1: return EOF_TOKEN;
				}
				if (isWhiteSpace(codePoint)) {
					this.consumeWhiteSpace();
					return WHITESPACE_TOKEN;
				}
				if (isDigit(codePoint)) {
					this.reconsumeCodePoint(codePoint);
					return this.consumeNumericToken();
				}
				if (isNameStartCodePoint(codePoint)) {
					this.reconsumeCodePoint(codePoint);
					return this.consumeIdentLikeToken();
				}
				return {
					type: 6,
					value: fromCodePoint$1(codePoint)
				};
			}
			consumeCodePoint() {
				const value = this._value.shift();
				return typeof value === "undefined" ? -1 : value;
			}
			reconsumeCodePoint(codePoint) {
				this._value.unshift(codePoint);
			}
			peekCodePoint(delta) {
				if (delta >= this._value.length) return -1;
				return this._value[delta];
			}
			consumeUnicodeRangeToken() {
				const digits = [];
				let codePoint = this.consumeCodePoint();
				while (isHex(codePoint) && digits.length < 6) {
					digits.push(codePoint);
					codePoint = this.consumeCodePoint();
				}
				let questionMarks = false;
				while (codePoint === 63 && digits.length < 6) {
					digits.push(codePoint);
					codePoint = this.consumeCodePoint();
					questionMarks = true;
				}
				if (questionMarks) return {
					type: 30,
					start: parseInt(fromCodePoint$1(...digits.map((digit) => digit === 63 ? 48 : digit)), 16),
					end: parseInt(fromCodePoint$1(...digits.map((digit) => digit === 63 ? 70 : digit)), 16)
				};
				const start = parseInt(fromCodePoint$1(...digits), 16);
				if (this.peekCodePoint(0) === 45 && isHex(this.peekCodePoint(1))) {
					this.consumeCodePoint();
					codePoint = this.consumeCodePoint();
					const endDigits = [];
					while (isHex(codePoint) && endDigits.length < 6) {
						endDigits.push(codePoint);
						codePoint = this.consumeCodePoint();
					}
					return {
						type: 30,
						start,
						end: parseInt(fromCodePoint$1(...endDigits), 16)
					};
				} else return {
					type: 30,
					start,
					end: start
				};
			}
			consumeIdentLikeToken() {
				const value = this.consumeName();
				if (value.toLowerCase() === "url" && this.peekCodePoint(0) === 40) {
					this.consumeCodePoint();
					return this.consumeUrlToken();
				} else if (this.peekCodePoint(0) === 40) {
					this.consumeCodePoint();
					return {
						type: 19,
						value
					};
				}
				return {
					type: 20,
					value
				};
			}
			consumeUrlToken() {
				const value = [];
				this.consumeWhiteSpace();
				if (this.peekCodePoint(0) === -1) return {
					type: 22,
					value: ""
				};
				const next = this.peekCodePoint(0);
				if (next === 39 || next === 34) {
					const stringToken = this.consumeStringToken(this.consumeCodePoint());
					if (stringToken.type === 0) {
						this.consumeWhiteSpace();
						if (this.peekCodePoint(0) === -1 || this.peekCodePoint(0) === 41) {
							this.consumeCodePoint();
							return {
								type: 22,
								value: stringToken.value
							};
						}
					}
					this.consumeBadUrlRemnants();
					return BAD_URL_TOKEN;
				}
				while (true) {
					const codePoint = this.consumeCodePoint();
					if (codePoint === -1 || codePoint === 41) return {
						type: 22,
						value: fromCodePoint$1(...value)
					};
					else if (isWhiteSpace(codePoint)) {
						this.consumeWhiteSpace();
						if (this.peekCodePoint(0) === -1 || this.peekCodePoint(0) === 41) {
							this.consumeCodePoint();
							return {
								type: 22,
								value: fromCodePoint$1(...value)
							};
						}
						this.consumeBadUrlRemnants();
						return BAD_URL_TOKEN;
					} else if (codePoint === 34 || codePoint === 39 || codePoint === 40 || isNonPrintableCodePoint(codePoint)) {
						this.consumeBadUrlRemnants();
						return BAD_URL_TOKEN;
					} else if (codePoint === 92) if (isValidEscape(codePoint, this.peekCodePoint(0))) value.push(this.consumeEscapedCodePoint());
					else {
						this.consumeBadUrlRemnants();
						return BAD_URL_TOKEN;
					}
					else value.push(codePoint);
				}
			}
			consumeWhiteSpace() {
				while (isWhiteSpace(this.peekCodePoint(0))) this.consumeCodePoint();
			}
			consumeBadUrlRemnants() {
				while (true) {
					const codePoint = this.consumeCodePoint();
					if (codePoint === 41 || codePoint === -1) return;
					if (isValidEscape(codePoint, this.peekCodePoint(0))) this.consumeEscapedCodePoint();
				}
			}
			consumeStringSlice(count) {
				const SLICE_STACK_SIZE = 5e4;
				let value = "";
				while (count > 0) {
					const amount = Math.min(SLICE_STACK_SIZE, count);
					value += fromCodePoint$1(...this._value.splice(0, amount));
					count -= amount;
				}
				this._value.shift();
				return value;
			}
			consumeStringToken(endingCodePoint) {
				let value = "";
				let i = 0;
				do {
					const codePoint = this._value[i];
					if (codePoint === -1 || codePoint === void 0 || codePoint === endingCodePoint) {
						value += this.consumeStringSlice(i);
						return {
							type: 0,
							value
						};
					}
					if (codePoint === 10) {
						this._value.splice(0, i);
						return BAD_STRING_TOKEN;
					}
					if (codePoint === 92) {
						const next = this._value[i + 1];
						if (next !== -1 && next !== void 0) {
							if (next === 10) {
								value += this.consumeStringSlice(i);
								i = -1;
								this._value.shift();
							} else if (isValidEscape(codePoint, next)) {
								value += this.consumeStringSlice(i);
								value += fromCodePoint$1(this.consumeEscapedCodePoint());
								i = -1;
							}
						}
					}
					i++;
				} while (true);
			}
			consumeNumber() {
				const repr = [];
				let type = 4;
				let c1 = this.peekCodePoint(0);
				if (c1 === 43 || c1 === 45) repr.push(this.consumeCodePoint());
				while (isDigit(this.peekCodePoint(0))) repr.push(this.consumeCodePoint());
				c1 = this.peekCodePoint(0);
				let c2 = this.peekCodePoint(1);
				if (c1 === 46 && isDigit(c2)) {
					repr.push(this.consumeCodePoint(), this.consumeCodePoint());
					type = 8;
					while (isDigit(this.peekCodePoint(0))) repr.push(this.consumeCodePoint());
				}
				c1 = this.peekCodePoint(0);
				c2 = this.peekCodePoint(1);
				const c3 = this.peekCodePoint(2);
				if ((c1 === 69 || c1 === 101) && ((c2 === 43 || c2 === 45) && isDigit(c3) || isDigit(c2))) {
					repr.push(this.consumeCodePoint(), this.consumeCodePoint());
					type = 8;
					while (isDigit(this.peekCodePoint(0))) repr.push(this.consumeCodePoint());
				}
				return [stringToNumber(repr), type];
			}
			consumeNumericToken() {
				const [number, flags] = this.consumeNumber();
				const c1 = this.peekCodePoint(0);
				if (isIdentifierStart(c1, this.peekCodePoint(1), this.peekCodePoint(2))) return {
					type: 15,
					number,
					flags,
					unit: this.consumeName()
				};
				if (c1 === 37) {
					this.consumeCodePoint();
					return {
						type: 16,
						number,
						flags
					};
				}
				return {
					type: 17,
					number,
					flags
				};
			}
			consumeEscapedCodePoint() {
				const codePoint = this.consumeCodePoint();
				if (isHex(codePoint)) {
					let hex = fromCodePoint$1(codePoint);
					while (isHex(this.peekCodePoint(0)) && hex.length < 6) hex += fromCodePoint$1(this.consumeCodePoint());
					if (isWhiteSpace(this.peekCodePoint(0))) this.consumeCodePoint();
					const hexCodePoint = parseInt(hex, 16);
					if (hexCodePoint === 0 || isSurrogateCodePoint(hexCodePoint) || hexCodePoint > 1114111) return REPLACEMENT_CHARACTER;
					return hexCodePoint;
				}
				if (codePoint === -1) return REPLACEMENT_CHARACTER;
				return codePoint;
			}
			consumeName() {
				let result = "";
				while (true) {
					const codePoint = this.consumeCodePoint();
					if (isNameCodePoint(codePoint)) result += fromCodePoint$1(codePoint);
					else if (isValidEscape(codePoint, this.peekCodePoint(0))) result += fromCodePoint$1(this.consumeEscapedCodePoint());
					else {
						this.reconsumeCodePoint(codePoint);
						return result;
					}
				}
			}
		};
		var Parser = class Parser {
			constructor(tokens) {
				this._tokens = tokens;
			}
			static create(value) {
				const tokenizer = new Tokenizer();
				tokenizer.write(value);
				return new Parser(tokenizer.read());
			}
			static parseValue(value) {
				return Parser.create(value).parseComponentValue();
			}
			static parseValues(value) {
				return Parser.create(value).parseComponentValues();
			}
			parseComponentValue() {
				let token = this.consumeToken();
				while (token.type === 31) token = this.consumeToken();
				if (token.type === 32) throw new SyntaxError(`Error parsing CSS component value, unexpected EOF`);
				this.reconsumeToken(token);
				const value = this.consumeComponentValue();
				do
					token = this.consumeToken();
				while (token.type === 31);
				if (token.type === 32) return value;
				throw new SyntaxError(`Error parsing CSS component value, multiple values found when expecting only one`);
			}
			parseComponentValues() {
				const values = [];
				while (true) {
					const value = this.consumeComponentValue();
					if (value.type === 32) return values;
					values.push(value);
				}
			}
			consumeComponentValue() {
				const token = this.consumeToken();
				switch (token.type) {
					case 11:
					case 28:
					case 2: return this.consumeSimpleBlock(token.type);
					case 19: return this.consumeFunction(token);
				}
				return token;
			}
			consumeSimpleBlock(type) {
				const block = {
					type,
					values: []
				};
				let token = this.consumeToken();
				while (true) {
					if (token.type === 32 || isEndingTokenFor(token, type)) return block;
					this.reconsumeToken(token);
					block.values.push(this.consumeComponentValue());
					token = this.consumeToken();
				}
			}
			consumeFunction(functionToken) {
				const cssFunction = {
					name: functionToken.value,
					values: [],
					type: 18
				};
				while (true) {
					const token = this.consumeToken();
					if (token.type === 32 || token.type === 3) return cssFunction;
					this.reconsumeToken(token);
					cssFunction.values.push(this.consumeComponentValue());
				}
			}
			consumeToken() {
				const token = this._tokens.shift();
				return typeof token === "undefined" ? EOF_TOKEN : token;
			}
			reconsumeToken(token) {
				this._tokens.unshift(token);
			}
		};
		const isDimensionToken = (token) => token.type === 15;
		const isNumberToken = (token) => token.type === 17;
		const isIdentToken = (token) => token.type === 20;
		const isStringToken = (token) => token.type === 0;
		const isIdentWithValue = (token, value) => isIdentToken(token) && token.value === value;
		const nonWhiteSpace = (token) => token.type !== 31;
		const nonFunctionArgSeparator = (token) => token.type !== 31 && token.type !== 4;
		const parseFunctionArgs = (tokens) => {
			const args = [];
			let arg = [];
			tokens.forEach((token) => {
				if (token.type === 4) {
					if (arg.length) {
						args.push(arg);
						arg = [];
					}
					return;
				}
				if (token.type !== 31) arg.push(token);
			});
			if (arg.length) args.push(arg);
			return args;
		};
		const isEndingTokenFor = (token, type) => {
			if (type === 11 && token.type === 12) return true;
			if (type === 28 && token.type === 29) return true;
			return type === 2 && token.type === 3;
		};
		/**
		* Safe arithmetic expression evaluator — replaces `new Function()`.
		*
		* Supports only: numbers, +, -, *, /, parentheses.
		* Does NOT execute arbitrary code. Returns NaN on any illegal token.
		*/
		const ARITH_TOKEN_RE = /(\d+(?:\.\d+)?|[+\-*/()])/g;
		const safeEvalArithmetic = (expr) => {
			const tokens = expr.match(ARITH_TOKEN_RE);
			if (!tokens) return NaN;
			const output = [];
			const ops = [];
			const precedence = {
				"+": 1,
				"-": 1,
				"*": 2,
				"/": 2
			};
			for (const tok of tokens) if (/^\d+(?:\.\d+)?$/.test(tok)) output.push(parseFloat(tok));
			else if (tok === "(") ops.push(tok);
			else if (tok === ")") {
				while (ops.length && ops[ops.length - 1] !== "(") output.push(ops.pop());
				if (!ops.length) return NaN;
				ops.pop();
			} else {
				while (ops.length && precedence[ops[ops.length - 1]] >= precedence[tok]) output.push(ops.pop());
				ops.push(tok);
			}
			while (ops.length) {
				const op = ops.pop();
				if (op === "(") return NaN;
				output.push(op);
			}
			const stack = [];
			for (const item of output) if (typeof item === "number") stack.push(item);
			else {
				const b = stack.pop();
				const a = stack.pop();
				if (a === void 0 || b === void 0) return NaN;
				switch (item) {
					case "+":
						stack.push(a + b);
						break;
					case "-":
						stack.push(a - b);
						break;
					case "*":
						stack.push(a * b);
						break;
					case "/":
						stack.push(b === 0 ? NaN : a / b);
						break;
					default: return NaN;
				}
			}
			return stack.length === 1 ? stack[0] : NaN;
		};
		/**
		* Color mathematics utilities
		* Extracted to break circular dependency between srgb.ts and color-utilities.ts
		*/
		/**
		* Clamp a value between min and max
		*/
		const clamp = (value, min, max) => {
			return Math.min(Math.max(value, min), max);
		};
		/**
		* Multiply two 3x3 matrices
		*/
		const multiplyMatrices = (A, B) => {
			return [
				A[0] * B[0] + A[1] * B[1] + A[2] * B[2],
				A[3] * B[0] + A[4] * B[1] + A[5] * B[2],
				A[6] * B[0] + A[7] * B[1] + A[8] * B[2]
			];
		};
		/**
		* SRGB related functions
		*/
		/**
		* Convert XYZ to linear-light sRGB
		*
		* @param xyz
		*/
		const xyz2rgbLinear = (xyz) => {
			return multiplyMatrices([
				3.2409699419045226,
				-1.537383177570094,
				-.4986107602930034,
				-.9692436362808796,
				1.8759675015077202,
				.04155505740717559,
				.05563007969699366,
				-.20397695888897652,
				1.0569715142428786
			], xyz);
		};
		/**
		* Convert XYZ to linear-light sRGB
		*
		* @param xyz
		*/
		const rgbLinear2xyz = (xyz) => {
			return multiplyMatrices([
				.41239079926595934,
				.357584339383878,
				.1804807884018343,
				.21263900587151027,
				.715168678767756,
				.07219231536073371,
				.01933081871559182,
				.11919477979462598,
				.9505321522496607
			], xyz);
		};
		/**
		* Convert sRGB to RGB
		*
		* @param rgb
		*/
		const srgbLinear2rgb = (rgb) => {
			return rgb.map((c) => {
				const sign = c < 0 ? -1 : 1, abs = Math.abs(c);
				return abs > .0031308 ? sign * (1.055 * abs ** (1 / 2.4) - .055) : 12.92 * c;
			});
		};
		/**
		* Convert RGB to sRGB
		*
		* @param rgb
		*/
		const rgb2rgbLinear = (rgb) => {
			return rgb.map((c) => {
				const sign = c < 0 ? -1 : 1, abs = Math.abs(c);
				return abs <= .04045 ? c / 12.92 : sign * ((abs + .055) / 1.055) ** 2.4;
			});
		};
		/**
		* XYZ to SRGB
		*
		* @param args
		*/
		const srgbFromXYZ = (args) => {
			const [r, g, b] = srgbLinear2rgb(xyz2rgbLinear([
				args[0],
				args[1],
				args[2]
			]));
			return [
				r,
				g,
				b,
				args[3]
			];
		};
		/**
		* XYZ to SRGB-Linear
		* @param args
		*/
		const srgbLinearFromXYZ = (args) => {
			const [r, g, b] = xyz2rgbLinear([
				args[0],
				args[1],
				args[2]
			]);
			return [
				clamp(Math.round(r * 255), 0, 255),
				clamp(Math.round(g * 255), 0, 255),
				clamp(Math.round(b * 255), 0, 255),
				args[3]
			];
		};
		const isLength = (token) => token.type === 17 || token.type === 15;
		const isLengthPercentage = (token) => token.type === 16 || isLength(token) || isCalcWithPercentage(token);
		/**
		* Check if a token is a CalcWithPercentage deferred token.
		* Accepts CSSValue (structural duck-type check) for use in type guards.
		*/
		const isCalcWithPercentage = (token) => token.type === 17 && token._calcPercentage !== void 0;
		/**
		* Check if a token is a calc() function
		*/
		const isCalcFunction = (token) => token.type === 18 && token.name === "calc";
		/**
		* Parse a calc() token and produce a LengthPercentage.
		*
		* Uses two-point evaluation to extract the percentage coefficient and pixel
		* offset from a calc() expression so it can be resolved later at render time
		* when the container size is known.
		*
		*   evaluate(0)   → pixelOffset
		*   evaluate(100) → percentage + pixelOffset   →  percentage = evaluate(100) - pixelOffset
		*
		* If the expression has no percentage component, returns a plain NUMBER_TOKEN
		* for backwards compatibility.
		*/
		const parseCalcForLengthPercentage = (calcToken) => {
			const withZero = evaluateCalcToLengthPercentage(calcToken, 0);
			if (!withZero) return null;
			const withHundred = evaluateCalcToLengthPercentage(calcToken, 100);
			if (!withHundred) return null;
			const pixelOffset = withZero.number;
			const percentage = withHundred.number - pixelOffset;
			if (percentage === 0) return withZero;
			return {
				type: 17,
				number: pixelOffset,
				flags: 4,
				_calcPercentage: percentage,
				_calcPixelOffset: pixelOffset
			};
		};
		/**
		* Convenience helper for parsing an optional calc() or length-percentage value.
		* Used by property descriptors that accept both calc() and regular length-percentage tokens.
		* Returns null if the value is neither a calc() function nor a length-percentage token.
		*/
		const parseOptionalCalcOrLength = (value) => {
			if (isCalcFunction(value)) return parseCalcForLengthPercentage(value);
			return isLengthPercentage(value) ? value : null;
		};
		/**
		* Evaluate a calc() expression and convert to LengthPercentage token
		* Supports basic arithmetic: +, -, *, /
		* Note: Percentages in calc() are converted based on a context value
		*/
		const evaluateCalcToLengthPercentage = (calcToken, contextValue = 0) => {
			const buildExpression = (values) => {
				let expression = "";
				for (const value of values) {
					if (value.type === 31) continue;
					if (value.type === 18) if (value.name === "calc") {
						const nested = buildExpression(value.values);
						if (nested === null) return null;
						expression += `(${nested})`;
					} else return null;
					else if (value.type === 17) expression += value.number.toString();
					else if (value.type === 15) if (value.unit === "px") expression += value.number.toString();
					else if (value.unit === "rem" || value.unit === "em") expression += (value.number * 16).toString();
					else expression += value.number.toString();
					else if (value.type === 16) expression += (value.number / 100 * contextValue).toString();
					else if (value.type === 6) {
						const op = value.value;
						if (op === "+" || op === "-" || op === "*" || op === "/") expression += ` ${op} `;
						else if (op === "(") expression += "(";
						else if (op === ")") expression += ")";
					}
				}
				return expression;
			};
			try {
				const expression = buildExpression(calcToken.values);
				if (expression === null || expression.trim() === "") return null;
				const result = safeEvalArithmetic(expression);
				if (typeof result === "number" && !isNaN(result)) return {
					type: 17,
					number: result,
					flags: 4
				};
			} catch (e) {
				return null;
			}
			return null;
		};
		const parseLengthPercentageTuple = (tokens) => tokens.length > 1 ? [tokens[0], tokens[1]] : [tokens[0]];
		const ZERO_LENGTH = {
			type: 17,
			number: 0,
			flags: 4
		};
		const FIFTY_PERCENT = {
			type: 16,
			number: 50,
			flags: 4
		};
		const HUNDRED_PERCENT = {
			type: 16,
			number: 100,
			flags: 4
		};
		const getAbsoluteValueForTuple = (tuple, width, height) => {
			const [x, y] = tuple;
			return [getAbsoluteValue(x, width), getAbsoluteValue(typeof y !== "undefined" ? y : x, height)];
		};
		const getAbsoluteValue = (token, parent) => {
			if (isCalcWithPercentage(token)) return token._calcPercentage / 100 * parent + token._calcPixelOffset;
			if (token.type === 16) return token.number / 100 * parent;
			if (isDimensionToken(token)) switch (token.unit) {
				case "rem":
				case "em": return 16 * token.number;
				default: return token.number;
			}
			return token.number;
		};
		const DEG = "deg";
		const GRAD = "grad";
		const RAD = "rad";
		const TURN = "turn";
		const angle = {
			name: "angle",
			parse: (_context, value) => {
				if (value.type === 15) switch (value.unit) {
					case DEG: return Math.PI * value.number / 180;
					case GRAD: return Math.PI / 200 * value.number;
					case RAD: return value.number;
					case TURN: return Math.PI * 2 * value.number;
				}
				throw new Error(`Unsupported angle type`);
			}
		};
		const isAngle = (value) => {
			if (value.type === 15) {
				if (value.unit === DEG || value.unit === GRAD || value.unit === RAD || value.unit === TURN) return true;
			}
			return false;
		};
		const parseNamedSide = (tokens) => {
			switch (tokens.filter(isIdentToken).map((ident) => ident.value).join(" ")) {
				case "to bottom right":
				case "to right bottom":
				case "left top":
				case "top left": return [ZERO_LENGTH, ZERO_LENGTH];
				case "to top":
				case "bottom": return deg(0);
				case "to bottom left":
				case "to left bottom":
				case "right top":
				case "top right": return [ZERO_LENGTH, HUNDRED_PERCENT];
				case "to right":
				case "left": return deg(90);
				case "to top left":
				case "to left top":
				case "right bottom":
				case "bottom right": return [HUNDRED_PERCENT, HUNDRED_PERCENT];
				case "to bottom":
				case "top": return deg(180);
				case "to top right":
				case "to right top":
				case "left bottom":
				case "bottom left": return [HUNDRED_PERCENT, ZERO_LENGTH];
				case "to left":
				case "right": return deg(270);
			}
			return 0;
		};
		const deg = (deg) => Math.PI * deg / 180;
		const isTransparent = (color) => (255 & color) === 0;
		const asString = (color) => {
			const alpha = 255 & color;
			const blue = 255 & color >> 8;
			const green = 255 & color >> 16;
			const red = 255 & color >> 24;
			return alpha < 255 ? `rgba(${red},${green},${blue},${alpha / 255})` : `rgb(${red},${green},${blue})`;
		};
		const pack = (r, g, b, a) => (r << 24 | g << 16 | b << 8 | Math.round(a * 255) << 0) >>> 0;
		const getTokenColorValue = (token, i) => {
			if (token.type === 17) return token.number;
			if (token.type === 16) {
				const max = i === 3 ? 1 : 255;
				return i === 3 ? token.number / 100 * max : Math.round(token.number / 100 * max);
			}
			return 0;
		};
		const isRelativeTransform = (tokens) => (tokens[0].type === 20 ? tokens[0].value : "unknown") === "from";
		const packSrgb = (args) => {
			return pack(clamp(Math.round(args[0] * 255), 0, 255), clamp(Math.round(args[1] * 255), 0, 255), clamp(Math.round(args[2] * 255), 0, 255), clamp(args[3], 0, 1));
		};
		const packSrgbLinear = ([r, g, b, a]) => {
			const rgb = srgbLinear2rgb([
				r,
				g,
				b
			]);
			return pack(clamp(Math.round(rgb[0] * 255), 0, 255), clamp(Math.round(rgb[1] * 255), 0, 255), clamp(Math.round(rgb[2] * 255), 0, 255), a);
		};
		const packXYZ = (args) => {
			const srgb_linear = xyz2rgbLinear([
				args[0],
				args[1],
				args[2]
			]);
			return packSrgbLinear([
				srgb_linear[0],
				srgb_linear[1],
				srgb_linear[2],
				args[3]
			]);
		};
		const packLab = (_context, args) => {
			if (isRelativeTransform(args.filter(nonFunctionArgSeparator))) throw new Error("Relative color not supported for lab()");
			const [l, a, b, alpha] = extractLabComponents(args), rgb = srgbLinear2rgb(xyz2rgbLinear(lab2xyz([
				l,
				a,
				b
			])));
			return pack(clamp(Math.round(rgb[0] * 255), 0, 255), clamp(Math.round(rgb[1] * 255), 0, 255), clamp(Math.round(rgb[2] * 255), 0, 255), alpha);
		};
		const packOkLab = (_context, args) => {
			if (isRelativeTransform(args.filter(nonFunctionArgSeparator))) throw new Error("Relative color not supported for oklab()");
			const [l, a, b, alpha] = extractLabComponents(args), rgb = srgbLinear2rgb(xyz2rgbLinear(oklab2xyz([
				l,
				a,
				b
			])));
			return pack(clamp(Math.round(rgb[0] * 255), 0, 255), clamp(Math.round(rgb[1] * 255), 0, 255), clamp(Math.round(rgb[2] * 255), 0, 255), alpha);
		};
		const packOkLch = (_context, args) => {
			if (isRelativeTransform(args.filter(nonFunctionArgSeparator))) throw new Error("Relative color not supported for oklch()");
			const [l, c, h, alpha] = extractOkLchComponents(args), rgb = srgbLinear2rgb(xyz2rgbLinear(oklab2xyz(lch2lab([
				l,
				c,
				h
			]))));
			return pack(clamp(Math.round(rgb[0] * 255), 0, 255), clamp(Math.round(rgb[1] * 255), 0, 255), clamp(Math.round(rgb[2] * 255), 0, 255), alpha);
		};
		const packLch = (_context, args) => {
			if (isRelativeTransform(args.filter(nonFunctionArgSeparator))) throw new Error("Relative color not supported for lch()");
			const [l, c, h, a] = extractLchComponents(args), rgb = srgbLinear2rgb(xyz2rgbLinear(lab2xyz(lch2lab([
				l,
				c,
				h
			]))));
			return pack(clamp(Math.round(rgb[0] * 255), 0, 255), clamp(Math.round(rgb[1] * 255), 0, 255), clamp(Math.round(rgb[2] * 255), 0, 255), a);
		};
		const extractHslComponents = (context, args) => {
			const [hue, saturation, lightness, alpha] = args.filter(nonFunctionArgSeparator);
			return [
				(hue.type === 17 ? deg(hue.number) : angle.parse(context, hue)) / (Math.PI * 2),
				isLengthPercentage(saturation) ? saturation.number / 100 : 0,
				isLengthPercentage(lightness) ? lightness.number / 100 : 0,
				typeof alpha !== "undefined" && isLengthPercentage(alpha) ? getAbsoluteValue(alpha, 1) : 1
			];
		};
		const packHSL = (context, args) => {
			if (isRelativeTransform(args)) throw new Error("Relative color not supported for hsl()");
			const [h, s, l, a] = extractHslComponents(context, args), rgb = hsl2rgb([
				h,
				s,
				l
			]);
			return pack(rgb[0] * 255, rgb[1] * 255, rgb[2] * 255, s === 0 ? 1 : a);
		};
		const extractLchComponents = (args) => {
			const tokens = args.filter(nonFunctionArgSeparator);
			return [
				isLengthPercentage(tokens[0]) ? tokens[0].number : 0,
				isLengthPercentage(tokens[1]) ? tokens[1].number : 0,
				isNumberToken(tokens[2]) || isDimensionToken(tokens[2]) ? tokens[2].number : 0,
				typeof tokens[4] !== "undefined" && isLengthPercentage(tokens[4]) ? getAbsoluteValue(tokens[4], 1) : 1
			];
		};
		const extractLabComponents = (args) => {
			const tokens = args.filter(nonFunctionArgSeparator);
			return [
				tokens[0].type === 16 ? tokens[0].number / 100 : isNumberToken(tokens[0]) ? tokens[0].number : 0,
				tokens[1].type === 16 ? tokens[1].number / 100 : isNumberToken(tokens[1]) ? tokens[1].number : 0,
				isNumberToken(tokens[2]) || isDimensionToken(tokens[2]) ? tokens[2].number : 0,
				typeof tokens[4] !== "undefined" && isLengthPercentage(tokens[4]) ? getAbsoluteValue(tokens[4], 1) : 1
			];
		};
		const extractOkLchComponents = (args) => {
			const tokens = args.filter(nonFunctionArgSeparator);
			return [
				tokens[0].type === 16 ? tokens[0].number / 100 : isNumberToken(tokens[0]) ? tokens[0].number : 0,
				tokens[1].type === 16 ? tokens[1].number / 100 : isNumberToken(tokens[1]) ? tokens[1].number : 0,
				isNumberToken(tokens[2]) || isDimensionToken(tokens[2]) ? tokens[2].number : 0,
				typeof tokens[4] !== "undefined" && isLengthPercentage(tokens[4]) ? getAbsoluteValue(tokens[4], 1) : 1
			];
		};
		/**
		* Convert D65 to D50
		*
		* @param xyz
		*/
		const d65toD50 = (xyz) => {
			return multiplyMatrices([
				1.0479297925449969,
				.022946870601609652,
				-.05019226628920524,
				.02962780877005599,
				.9904344267538799,
				-.017073799063418826,
				-.009243040646204504,
				.015055191490298152,
				.7518742814281371
			], xyz);
		};
		/**
		* Convert D50 to D65
		*
		* @param xyz
		*/
		const d50toD65 = (xyz) => {
			return multiplyMatrices([
				.955473421488075,
				-.02309845494876471,
				.06325924320057072,
				-.0283697093338637,
				1.0099953980813041,
				.021041441191917323,
				.012314014864481998,
				-.020507649298898964,
				1.330365926242124
			], xyz);
		};
		const hue2rgb = (t1, t2, hue) => {
			if (hue < 0) hue += 1;
			if (hue >= 1) hue -= 1;
			if (hue < 1 / 6) return (t2 - t1) * hue * 6 + t1;
			else if (hue < 1 / 2) return t2;
			else if (hue < 2 / 3) return (t2 - t1) * 6 * (2 / 3 - hue) + t1;
			else return t1;
		};
		const hsl2rgb = ([h, s, l]) => {
			if (s === 0) return [
				l * 255,
				l * 255,
				l * 255
			];
			const t2 = l <= .5 ? l * (s + 1) : l + s - l * s, t1 = l * 2 - t2;
			return [
				hue2rgb(t1, t2, h + 1 / 3),
				hue2rgb(t1, t2, h),
				hue2rgb(t1, t2, h - 1 / 3)
			];
		};
		/**
		* Convert lch to OKLab
		*
		* @param l
		* @param c
		* @param h
		*/
		const lch2lab = ([l, c, h]) => {
			if (c < 0) c = 0;
			if (isNaN(h)) h = 0;
			return [
				l,
				c * Math.cos(h * Math.PI / 180),
				c * Math.sin(h * Math.PI / 180)
			];
		};
		/**
		* Convert OKLab to XYZ relative to D65
		*
		* @param lab
		*/
		const oklab2xyz = (lab) => {
			return multiplyMatrices([
				1.2268798758459243,
				-.5578149944602171,
				.2813910456659647,
				-.0405757452148008,
				1.112286803280317,
				-.0717110580655164,
				-.0763729366746601,
				-.4214933324022432,
				1.5869240198367816
			], multiplyMatrices([
				1,
				.3963377773761749,
				.2158037573099136,
				1,
				-.1055613458156586,
				-.0638541728258133,
				1,
				-.0894841775298119,
				-1.2914855480194092
			], lab).map((val) => val ** 3));
		};
		/**
		* Convert Lab to D50-adapted XYZ
		*
		* @param lab
		*/
		const lab2xyz = (lab) => {
			const fy = (lab[0] + 16) / 116, fx = lab[1] / 500 + fy, fz = fy - lab[2] / 200, k = 24389 / 27, e = 24 / 116, xyz = [
				(fx > e ? fx ** 3 : (116 * fx - 16) / k) * .3457 / .3585,
				lab[0] > 8 ? fy ** 3 : lab[0] / k,
				(fz > e ? fz ** 3 : (116 * fz - 16) / k) * .2958 / .3585
			];
			return d50toD65([
				xyz[0],
				xyz[1],
				xyz[2]
			]);
		};
		/**
		* Convert RGB to XYZ
		*
		* @param _context
		* @param args
		*/
		const rgbToXyz = (_context, args) => {
			const tokens = args.filter(nonFunctionArgSeparator);
			if (tokens.length === 3) {
				const [r, g, b] = tokens.map(getTokenColorValue), rgb_linear = rgb2rgbLinear([
					r / 255,
					g / 255,
					b / 255
				]), [x, y, z] = rgbLinear2xyz([
					rgb_linear[0],
					rgb_linear[1],
					rgb_linear[2]
				]);
				return [
					x,
					y,
					z,
					1
				];
			}
			if (tokens.length === 4) {
				const [r, g, b, a] = tokens.map(getTokenColorValue), rgb_linear = rgb2rgbLinear([
					r / 255,
					g / 255,
					b / 255
				]), [x, y, z] = rgbLinear2xyz([
					rgb_linear[0],
					rgb_linear[1],
					rgb_linear[2]
				]);
				return [
					x,
					y,
					z,
					a
				];
			}
			return [
				0,
				0,
				0,
				1
			];
		};
		/**
		* HSL to XYZ
		*
		* @param context
		* @param args
		*/
		const hslToXyz = (context, args) => {
			const [h, s, l, a] = extractHslComponents(context, args), rgb_linear = rgb2rgbLinear(hsl2rgb([
				h,
				s,
				l
			])), [x, y, z] = rgbLinear2xyz([
				rgb_linear[0],
				rgb_linear[1],
				rgb_linear[2]
			]);
			return [
				x,
				y,
				z,
				a
			];
		};
		/**
		* LAB to XYZ
		*
		* @param _context
		* @param args
		*/
		const labToXyz = (_context, args) => {
			const [l, a, b, alpha] = extractLabComponents(args), [x, y, z] = lab2xyz([
				l,
				a,
				b
			]);
			return [
				x,
				y,
				z,
				alpha
			];
		};
		/**
		* LCH to XYZ
		*
		* @param _context
		* @param args
		*/
		const lchToXyz = (_context, args) => {
			const [l, c, h, alpha] = extractLchComponents(args), [x, y, z] = lab2xyz(lch2lab([
				l,
				c,
				h
			]));
			return [
				x,
				y,
				z,
				alpha
			];
		};
		/**
		* OKLch to XYZ
		*
		* @param _context
		* @param args
		*/
		const oklchToXyz = (_context, args) => {
			const [l, c, h, alpha] = extractOkLchComponents(args), [x, y, z] = oklab2xyz(lch2lab([
				l,
				c,
				h
			]));
			return [
				x,
				y,
				z,
				alpha
			];
		};
		/**
		* OKLab to XYZ
		*
		* @param _context
		* @param args
		*/
		const oklabToXyz = (_context, args) => {
			const [l, c, h, alpha] = extractLabComponents(args), [x, y, z] = oklab2xyz([
				l,
				c,
				h
			]);
			return [
				x,
				y,
				z,
				alpha
			];
		};
		/**
		* XYZ-50 to XYZ
		*
		* @param args
		*/
		const xyz50ToXYZ = (args) => {
			return d50toD65([
				args[0],
				args[1],
				args[2]
			]);
		};
		/**
		* Does nothing, required for SUPPORTED_COLOR_SPACES_FROM_XYZ in the _color() function
		*
		* @param args
		*/
		const xyzFromXYZ = (args) => {
			return args;
		};
		/**
		* XYZ-65 to XYZ-50
		*
		* @param args
		*/
		const xyz50FromXYZ = (args) => {
			const [x, y, z] = d65toD50([
				args[0],
				args[2],
				args[3]
			]);
			return [
				x,
				y,
				z,
				args[3]
			];
		};
		/**
		* Convert XYZ to SRGB and Pack
		*
		* @param args
		*/
		const convertXyz = (args) => {
			return packXYZ([
				args[0],
				args[1],
				args[2],
				args[3]
			]);
		};
		/**
		* Convert XYZ-50 to SRGB and Pack
		*
		* @param args
		*/
		const convertXyz50 = (args) => {
			const xyz = xyz50ToXYZ([
				args[0],
				args[1],
				args[2]
			]);
			return packXYZ([
				xyz[0],
				xyz[1],
				xyz[2],
				args[3]
			]);
		};
		/**
		* Display-P3 related functions
		*/
		/**
		* Convert P3 Linear to xyz
		*
		* @param p3l
		*/
		const p3LinearToXyz = (p3l) => {
			return multiplyMatrices([
				.4865709486482162,
				.26566769316909306,
				.1982172852343625,
				.2289745640697488,
				.6917385218365064,
				.079286914093745,
				0,
				.04511338185890264,
				1.043944368900976
			], p3l);
		};
		/**
		* Convert XYZ to P3 Linear
		*
		* @param xyz
		*/
		const xyzToP3Linear = (xyz) => {
			return multiplyMatrices([
				2.493496911941425,
				-.9313836179191239,
				-.40271078445071684,
				-.8294889695615747,
				1.7626640603183463,
				.023624685841943577,
				.03584583024378447,
				-.07617238926804182,
				.9568845240076872
			], xyz);
		};
		/**
		* Convert P3 to P3 linear
		*
		* @param p3
		*/
		const p32p3Linear = (p3) => {
			return p3.map((c) => {
				const sign = c < 0 ? -1 : 1;
				if (c * sign <= .04045) return c / 12.92;
				return sign * ((c + .055) / 1.055) ** 2.4 || 0;
			});
		};
		/**
		* Convert P3 Linear to P3
		*
		* @param p3l
		*/
		const p3Linear2p3 = (p3l) => {
			return srgbLinear2rgb(p3l);
		};
		/**
		* Convert P3 to XYZ
		*
		* @param args
		*/
		const p3ToXYZ = (args) => {
			const p3_linear = p32p3Linear([
				args[0],
				args[1],
				args[2]
			]);
			return p3LinearToXyz([
				p3_linear[0],
				p3_linear[1],
				p3_linear[2]
			]);
		};
		/**
		* Convert XYZ to P3
		*
		* @param args
		*/
		const p3FromXYZ = (args) => {
			const [r, g, b] = p3Linear2p3(xyzToP3Linear([
				args[0],
				args[1],
				args[2]
			]));
			return [
				r,
				g,
				b,
				args[3]
			];
		};
		/**
		* Convert P3 to SRGB and Pack
		*
		* @param args
		*/
		const convertP3 = (args) => {
			const xyz = p3ToXYZ([
				args[0],
				args[1],
				args[2]
			]);
			return packXYZ([
				xyz[0],
				xyz[1],
				xyz[2],
				args[3]
			]);
		};
		/**
		* A98-RGB related functions
		*/
		/**
		* Convert XYZ to a98 linear
		*
		* @param xyz
		*/
		const xyz2a98Linear = (xyz) => {
			return multiplyMatrices([
				2.0415879038107465,
				-.5650069742788596,
				-.34473135077832956,
				-.9692436362808795,
				1.8759675015077202,
				.04155505740717557,
				.013444280632031142,
				-.11836239223101838,
				1.0151749943912054
			], xyz);
		};
		/**
		* Convert XYZ to a98 linear
		*
		* @param a98
		*/
		const a98Linear2xyz = (a98) => {
			return multiplyMatrices([
				.5766690429101305,
				.1855582379065463,
				.1882286462349947,
				.29734497525053605,
				.6273635662554661,
				.0752914584939978,
				.02703136138641234,
				.07068885253582723,
				.9913375368376388
			], a98);
		};
		/**
		* Convert A98 RGB to rgb linear
		*
		* @param rgb
		*/
		const a982a98Linear = (rgb) => {
			const mapped = rgb.map((c) => {
				return (c < 0 ? -1 : 1) * Math.abs(c) ** (563 / 256);
			});
			return [
				mapped[0],
				mapped[1],
				mapped[2]
			];
		};
		/**
		* Convert A98 RGB Linear to A98
		*
		* @param rgb
		*/
		const a98Linear2a98 = (rgb) => {
			const mapped = rgb.map((c) => {
				return (c < 0 ? -1 : 1) * Math.abs(c) ** (256 / 563);
			});
			return [
				mapped[0],
				mapped[1],
				mapped[2]
			];
		};
		/**
		* Convert XYZ to A98
		*
		* @param args
		*/
		const a98FromXYZ = (args) => {
			const [r, g, b] = a98Linear2a98(xyz2a98Linear([
				args[0],
				args[1],
				args[2]
			]));
			return [
				r,
				g,
				b,
				args[3]
			];
		};
		/**
		* Convert A98 to XYZ and Pack
		*
		* @param args
		*/
		const convertA98rgb = (args) => {
			const srgb_linear = xyz2rgbLinear(a98Linear2xyz(a982a98Linear([
				args[0],
				args[1],
				args[2]
			])));
			return packSrgbLinear([
				srgb_linear[0],
				srgb_linear[1],
				srgb_linear[2],
				args[3]
			]);
		};
		/**
		* Pro Photo related functions
		*/
		/**
		* Convert linear-light display-p3 to XYZ D65
		*
		* @param p3
		*/
		const proPhotoLinearToXyz = (p3) => {
			return multiplyMatrices([
				.7977666449006423,
				.13518129740053308,
				.0313477341283922,
				.2880748288194013,
				.711835234241873,
				8993693872564e-17,
				0,
				0,
				.8251046025104602
			], p3);
		};
		/**
		* Convert XYZ D65 to linear-light display-p3
		*
		* @param xyz
		*/
		const xyzToProPhotoLinear = (xyz) => {
			return multiplyMatrices([
				1.3457868816471583,
				-.25557208737979464,
				-.05110186497554526,
				-.5446307051249019,
				1.5082477428451468,
				.02052744743642139,
				0,
				0,
				1.2119675456389452
			], xyz);
		};
		/**
		* Convert Pro-Photo to Pro-Photo Linear
		*
		* @param p3
		*/
		const proPhotoToProPhotoLinear = (p3) => {
			return p3.map((c) => {
				return c < 16 / 512 ? c / 16 : c ** 1.8;
			});
		};
		/**
		* Convert Pro-Photo Linear to Pro-Photo
		*
		* @param p3
		*/
		const proPhotoLinearToProPhoto = (p3) => {
			return p3.map((c) => {
				return c > 1 / 512 ? c ** (1 / 1.8) : c * 16;
			});
		};
		/**
		* Convert Pro-Photo to XYZ
		*
		* @param args
		*/
		const proPhotoToXYZ = (args) => {
			const prophoto_linear = proPhotoToProPhotoLinear([
				args[0],
				args[1],
				args[2]
			]);
			return d50toD65(proPhotoLinearToXyz([
				prophoto_linear[0],
				prophoto_linear[1],
				prophoto_linear[2]
			]));
		};
		/**
		* Convert XYZ to Pro-Photo
		*
		* @param args
		*/
		const proPhotoFromXYZ = (args) => {
			const [r, g, b] = proPhotoLinearToProPhoto(xyzToProPhotoLinear(d65toD50([
				args[0],
				args[1],
				args[2]
			])));
			return [
				r,
				g,
				b,
				args[3]
			];
		};
		/**
		* Convert Pro-Photo to XYZ and Pack
		*
		* @param args
		*/
		const convertProPhoto = (args) => {
			const xyz = proPhotoToXYZ([
				args[0],
				args[1],
				args[2]
			]);
			return packXYZ([
				xyz[0],
				xyz[1],
				xyz[2],
				args[3]
			]);
		};
		/**
		* REC2020 related functions
		*/
		const _a = 1.09929682680944;
		const _b = .018053968510807;
		/**
		* Convert rec2020 to rec2020 linear
		*
		* @param rgb
		*/
		const rec20202rec2020Linear = (rgb) => {
			return rgb.map(function(c) {
				return c < _b * 4.5 ? c / 4.5 : Math.pow((c + _a - 1) / _a, 1 / .45);
			});
		};
		/**
		* Convert rec2020 linear to rec2020
		*
		* @param rgb
		*/
		const rec2020Linear2rec2020 = (rgb) => {
			return rgb.map(function(c) {
				return c >= _b ? _a * Math.pow(c, .45) - (_a - 1) : 4.5 * c;
			});
		};
		/**
		* Convert rec2020 linear to XYZ D65
		*
		* @param rec
		*/
		const rec2020LinearToXyz = (rec) => {
			return multiplyMatrices([
				.6369580483012914,
				.14461690358620832,
				.1688809751641721,
				.2627002120112671,
				.6779980715188708,
				.05930171646986196,
				0,
				.028072693049087428,
				1.060985057710791
			], rec);
		};
		/**
		* Convert XYZ D65 to rec2020 linear
		*
		* @param xyz
		*/
		const xyzToRec2020Linear = (xyz) => {
			return multiplyMatrices([
				1.716651187971268,
				-.355670783776392,
				-.25336628137366,
				-.666684351832489,
				1.616481236634939,
				.0157685458139111,
				.017639857445311,
				-.042770613257809,
				.942103121235474
			], xyz);
		};
		/**
		* Convert Rec2020 to XYZ
		*
		* @param args
		*/
		const rec2020ToXYZ = (args) => {
			const rec2020_linear = rec20202rec2020Linear([
				args[0],
				args[1],
				args[2]
			]);
			return rec2020LinearToXyz([
				rec2020_linear[0],
				rec2020_linear[1],
				rec2020_linear[2]
			]);
		};
		/**
		* Convert XYZ to Rec2020
		*
		* @param args
		*/
		const rec2020FromXYZ = (args) => {
			const [r, g, b] = rec2020Linear2rec2020(xyzToRec2020Linear([
				args[0],
				args[1],
				args[2]
			]));
			return [
				r,
				g,
				b,
				args[3]
			];
		};
		/**
		* Convert Rec2020 to SRGB and Pack
		*
		* @param args
		*/
		const convertRec2020 = (args) => {
			const xyz = rec2020ToXYZ([
				args[0],
				args[1],
				args[2]
			]);
			return packXYZ([
				xyz[0],
				xyz[1],
				xyz[2],
				args[3]
			]);
		};
		const color$1 = {
			name: "color",
			parse: (context, value) => {
				if (value.type === 18) {
					const colorFunction = SUPPORTED_COLOR_FUNCTIONS[value.name];
					if (typeof colorFunction === "undefined") throw new Error(`Attempting to parse an unsupported color function "${value.name}"`);
					return colorFunction(context, value.values);
				}
				if (value.type === 5) {
					const [r, g, b, a] = hash2rgb(value);
					return pack(r, g, b, a);
				}
				if (value.type === 20) {
					const namedColor = COLORS[value.value.toUpperCase()];
					if (typeof namedColor !== "undefined") return namedColor;
				}
				return COLORS.TRANSPARENT;
			}
		};
		const hash2rgb = (token) => {
			if (token.value.length === 3) {
				const r = token.value.substring(0, 1);
				const g = token.value.substring(1, 2);
				const b = token.value.substring(2, 3);
				return [
					parseInt(r + r, 16),
					parseInt(g + g, 16),
					parseInt(b + b, 16),
					1
				];
			}
			if (token.value.length === 4) {
				const r = token.value.substring(0, 1);
				const g = token.value.substring(1, 2);
				const b = token.value.substring(2, 3);
				const a = token.value.substring(3, 4);
				return [
					parseInt(r + r, 16),
					parseInt(g + g, 16),
					parseInt(b + b, 16),
					parseInt(a + a, 16) / 255
				];
			}
			if (token.value.length === 6) {
				const r = token.value.substring(0, 2);
				const g = token.value.substring(2, 4);
				const b = token.value.substring(4, 6);
				return [
					parseInt(r, 16),
					parseInt(g, 16),
					parseInt(b, 16),
					1
				];
			}
			if (token.value.length === 8) {
				const r = token.value.substring(0, 2);
				const g = token.value.substring(2, 4);
				const b = token.value.substring(4, 6);
				const a = token.value.substring(6, 8);
				return [
					parseInt(r, 16),
					parseInt(g, 16),
					parseInt(b, 16),
					parseInt(a, 16) / 255
				];
			}
			return [
				0,
				0,
				0,
				1
			];
		};
		const rgb = (_context, args) => {
			const tokens = args.filter(nonFunctionArgSeparator);
			if (isRelativeTransform(tokens)) throw new Error("Relative color not supported for rgb()");
			if (tokens.length === 3) {
				const [r, g, b] = tokens.map(getTokenColorValue);
				return pack(r, g, b, 1);
			}
			if (tokens.length === 4) {
				const [r, g, b, a] = tokens.map(getTokenColorValue);
				return pack(r, g, b, a);
			}
			if (tokens.length === 5 && tokens[3].type === 6 && tokens[3].value === "/") return pack(getTokenColorValue(tokens[0], 0), getTokenColorValue(tokens[1], 1), getTokenColorValue(tokens[2], 2), getTokenColorValue(tokens[4], 3));
			return 0;
		};
		/**
		* Handle the CSS color() function
		*
		* @param context
		* @param args
		*/
		const _color = (context, args) => {
			const tokens = args.filter(nonFunctionArgSeparator), token_1_value = tokens[0].type === 20 ? tokens[0].value : "unknown";
			if (!isRelativeTransform(tokens)) {
				const color_space = token_1_value, colorSpaceFunction = SUPPORTED_COLOR_SPACES_ABSOLUTE[color_space];
				if (typeof colorSpaceFunction === "undefined") throw new Error(`Attempting to parse an unsupported color space "${color_space}" for color() function`);
				return colorSpaceFunction([
					isNumberToken(tokens[1]) ? tokens[1].number : 0,
					isNumberToken(tokens[2]) ? tokens[2].number : 0,
					isNumberToken(tokens[3]) ? tokens[3].number : 0,
					tokens.length > 4 && tokens[4].type === 6 && tokens[4].value === "/" && isNumberToken(tokens[5]) ? tokens[5].number : 1
				]);
			} else {
				const extractComponent = (color, token) => {
					if (isNumberToken(token)) return token.number;
					const posFromVal = (value) => {
						return value === "r" || value === "x" ? 0 : value === "g" || value === "y" ? 1 : 2;
					};
					if (isIdentToken(token)) return color[posFromVal(token.value)];
					const parseCalc = (args) => {
						const parts = args.filter(nonFunctionArgSeparator);
						let expression = "(";
						for (const part of parts) expression += part.type === 18 && part.name === "calc" ? parseCalc(part.values) : isNumberToken(part) ? part.number : part.type === 6 || isIdentToken(part) ? part.value : "";
						expression += ")";
						return expression;
					};
					if (token.type === 18) {
						const args = token.values.filter(nonFunctionArgSeparator);
						if (token.name === "calc") return safeEvalArithmetic(parseCalc(args).replace(/r|x/, color[0].toString()).replace(/g|y/, color[1].toString()).replace(/b|z/, color[2].toString()));
					}
					return null;
				};
				const from_colorspace = tokens[1].type === 18 ? tokens[1].name : isIdentToken(tokens[1]) || tokens[1].type === 5 ? "rgb" : "unknown", to_colorspace = isIdentToken(tokens[2]) ? tokens[2].value : "unknown";
				let from = tokens[1].type === 18 ? tokens[1].values : isIdentToken(tokens[1]) ? [tokens[1]] : [];
				if (isIdentToken(tokens[1])) if (typeof COLORS[tokens[1].value.toUpperCase()] === "undefined") throw new Error(`Attempting to use unknown color in relative color 'from'`);
				else {
					const _c = parseColor(context, tokens[1].value), alpha = 255 & _c, blue = 255 & _c >> 8, green = 255 & _c >> 16;
					from = [
						{
							type: 17,
							number: 255 & _c >> 24,
							flags: 1
						},
						{
							type: 17,
							number: green,
							flags: 1
						},
						{
							type: 17,
							number: blue,
							flags: 1
						},
						{
							type: 17,
							number: alpha > 1 ? alpha / 255 : alpha,
							flags: 1
						}
					];
				}
				else if (tokens[1].type === 5) {
					const [red, green, blue, alpha] = hash2rgb(tokens[1]);
					from = [
						{
							type: 17,
							number: red,
							flags: 1
						},
						{
							type: 17,
							number: green,
							flags: 1
						},
						{
							type: 17,
							number: blue,
							flags: 1
						},
						{
							type: 17,
							number: alpha > 1 ? alpha / 255 : alpha,
							flags: 1
						}
					];
				}
				if (from.length === 0) throw new Error(`Attempting to use unknown color in relative color 'from'`);
				if (to_colorspace === "unknown") throw new Error(`Attempting to use unknown colorspace in relative color 'to'`);
				const fromColorToXyz = SUPPORTED_COLOR_SPACES_TO_XYZ[from_colorspace], toColorFromXyz = SUPPORTED_COLOR_SPACES_FROM_XYZ[to_colorspace], toColorPack = SUPPORTED_COLOR_SPACES_ABSOLUTE[to_colorspace];
				if (typeof fromColorToXyz === "undefined") throw new Error(`Attempting to parse an unsupported color space "${from_colorspace}" for color() function`);
				if (typeof toColorFromXyz === "undefined") throw new Error(`Attempting to parse an unsupported color space "${to_colorspace}" for color() function`);
				const from_final_colorspace = toColorFromXyz(fromColorToXyz(context, from)), c1 = extractComponent(from_final_colorspace, tokens[3]), c2 = extractComponent(from_final_colorspace, tokens[4]), c3 = extractComponent(from_final_colorspace, tokens[5]), a = tokens.length > 6 && tokens[6].type === 6 && tokens[6].value === "/" && isNumberToken(tokens[7]) ? tokens[7].number : 1;
				if (c1 === null || c2 === null || c3 === null) throw new Error(`Invalid relative color in color() function`);
				return toColorPack([
					c1,
					c2,
					c3,
					a
				]);
			}
		};
		const SUPPORTED_COLOR_SPACES_ABSOLUTE = {
			srgb: packSrgb,
			"srgb-linear": packSrgbLinear,
			"display-p3": convertP3,
			"a98-rgb": convertA98rgb,
			"prophoto-rgb": convertProPhoto,
			xyz: convertXyz,
			"xyz-d50": convertXyz50,
			"xyz-d65": convertXyz,
			rec2020: convertRec2020
		};
		const SUPPORTED_COLOR_SPACES_TO_XYZ = {
			rgb: rgbToXyz,
			hsl: hslToXyz,
			lab: labToXyz,
			lch: lchToXyz,
			oklab: oklabToXyz,
			oklch: oklchToXyz
		};
		const SUPPORTED_COLOR_SPACES_FROM_XYZ = {
			srgb: srgbFromXYZ,
			"srgb-linear": srgbLinearFromXYZ,
			"display-p3": p3FromXYZ,
			"a98-rgb": a98FromXYZ,
			"prophoto-rgb": proPhotoFromXYZ,
			xyz: xyzFromXYZ,
			"xyz-d50": xyz50FromXYZ,
			"xyz-d65": xyzFromXYZ,
			rec2020: rec2020FromXYZ
		};
		const SUPPORTED_COLOR_FUNCTIONS = {
			hsl: packHSL,
			hsla: packHSL,
			rgb,
			rgba: rgb,
			lch: packLch,
			oklch: packOkLch,
			oklab: packOkLab,
			lab: packLab,
			color: _color
		};
		const parseColor = (context, value) => color$1.parse(context, Parser.create(value).parseComponentValue());
		const COLORS = {
			ALICEBLUE: 4042850303,
			ANTIQUEWHITE: 4209760255,
			AQUA: 16777215,
			AQUAMARINE: 2147472639,
			AZURE: 4043309055,
			BEIGE: 4126530815,
			BISQUE: 4293182719,
			BLACK: 255,
			BLANCHEDALMOND: 4293643775,
			BLUE: 65535,
			BLUEVIOLET: 2318131967,
			BROWN: 2771004159,
			BURLYWOOD: 3736635391,
			CADETBLUE: 1604231423,
			CHARTREUSE: 2147418367,
			CHOCOLATE: 3530104575,
			CORAL: 4286533887,
			CORNFLOWERBLUE: 1687547391,
			CORNSILK: 4294499583,
			CRIMSON: 3692313855,
			CYAN: 16777215,
			DARKBLUE: 35839,
			DARKCYAN: 9145343,
			DARKGOLDENROD: 3095837695,
			DARKGRAY: 2846468607,
			DARKGREEN: 6553855,
			DARKGREY: 2846468607,
			DARKKHAKI: 3182914559,
			DARKMAGENTA: 2332068863,
			DARKOLIVEGREEN: 1433087999,
			DARKORANGE: 4287365375,
			DARKORCHID: 2570243327,
			DARKRED: 2332033279,
			DARKSALMON: 3918953215,
			DARKSEAGREEN: 2411499519,
			DARKSLATEBLUE: 1211993087,
			DARKSLATEGRAY: 793726975,
			DARKSLATEGREY: 793726975,
			DARKTURQUOISE: 13554175,
			DARKVIOLET: 2483082239,
			DEEPPINK: 4279538687,
			DEEPSKYBLUE: 12582911,
			DIMGRAY: 1768516095,
			DIMGREY: 1768516095,
			DODGERBLUE: 512819199,
			FIREBRICK: 2988581631,
			FLORALWHITE: 4294635775,
			FORESTGREEN: 579543807,
			FUCHSIA: 4278255615,
			GAINSBORO: 3705462015,
			GHOSTWHITE: 4177068031,
			GOLD: 4292280575,
			GOLDENROD: 3668254975,
			GRAY: 2155905279,
			GREEN: 8388863,
			GREENYELLOW: 2919182335,
			GREY: 2155905279,
			HONEYDEW: 4043305215,
			HOTPINK: 4285117695,
			INDIANRED: 3445382399,
			INDIGO: 1258324735,
			IVORY: 4294963455,
			KHAKI: 4041641215,
			LAVENDER: 3873897215,
			LAVENDERBLUSH: 4293981695,
			LAWNGREEN: 2096890111,
			LEMONCHIFFON: 4294626815,
			LIGHTBLUE: 2916673279,
			LIGHTCORAL: 4034953471,
			LIGHTCYAN: 3774873599,
			LIGHTGOLDENRODYELLOW: 4210742015,
			LIGHTGRAY: 3553874943,
			LIGHTGREEN: 2431553791,
			LIGHTGREY: 3553874943,
			LIGHTPINK: 4290167295,
			LIGHTSALMON: 4288707327,
			LIGHTSEAGREEN: 548580095,
			LIGHTSKYBLUE: 2278488831,
			LIGHTSLATEGRAY: 2005441023,
			LIGHTSLATEGREY: 2005441023,
			LIGHTSTEELBLUE: 2965692159,
			LIGHTYELLOW: 4294959359,
			LIME: 16711935,
			LIMEGREEN: 852308735,
			LINEN: 4210091775,
			MAGENTA: 4278255615,
			MAROON: 2147483903,
			MEDIUMAQUAMARINE: 1724754687,
			MEDIUMBLUE: 52735,
			MEDIUMORCHID: 3126187007,
			MEDIUMPURPLE: 2473647103,
			MEDIUMSEAGREEN: 1018393087,
			MEDIUMSLATEBLUE: 2070474495,
			MEDIUMSPRINGGREEN: 16423679,
			MEDIUMTURQUOISE: 1221709055,
			MEDIUMVIOLETRED: 3340076543,
			MIDNIGHTBLUE: 421097727,
			MINTCREAM: 4127193855,
			MISTYROSE: 4293190143,
			MOCCASIN: 4293178879,
			NAVAJOWHITE: 4292783615,
			NAVY: 33023,
			OLDLACE: 4260751103,
			OLIVE: 2155872511,
			OLIVEDRAB: 1804477439,
			ORANGE: 4289003775,
			ORANGERED: 4282712319,
			ORCHID: 3664828159,
			PALEGOLDENROD: 4008225535,
			PALEGREEN: 2566625535,
			PALETURQUOISE: 2951671551,
			PALEVIOLETRED: 3681588223,
			PAPAYAWHIP: 4293907967,
			PEACHPUFF: 4292524543,
			PERU: 3448061951,
			PINK: 4290825215,
			PLUM: 3718307327,
			POWDERBLUE: 2967529215,
			PURPLE: 2147516671,
			REBECCAPURPLE: 1714657791,
			RED: 4278190335,
			ROSYBROWN: 3163525119,
			ROYALBLUE: 1097458175,
			SADDLEBROWN: 2336560127,
			SALMON: 4202722047,
			SANDYBROWN: 4104413439,
			SEAGREEN: 780883967,
			SEASHELL: 4294307583,
			SIENNA: 2689740287,
			SILVER: 3233857791,
			SKYBLUE: 2278484991,
			SLATEBLUE: 1784335871,
			SLATEGRAY: 1887473919,
			SLATEGREY: 1887473919,
			SNOW: 4294638335,
			SPRINGGREEN: 16744447,
			STEELBLUE: 1182971135,
			TAN: 3535047935,
			TEAL: 8421631,
			THISTLE: 3636451583,
			TOMATO: 4284696575,
			TRANSPARENT: 0,
			TURQUOISE: 1088475391,
			VIOLET: 4001558271,
			WHEAT: 4125012991,
			WHITE: 4294967295,
			WHITESMOKE: 4126537215,
			YELLOW: 4294902015,
			YELLOWGREEN: 2597139199
		};
		/**
		* DOM Node Type Guards
		*
		* All DOM node type guards consolidated here to eliminate duplication
		* and provide a single source of truth for node type checking.
		*/
		const isElementNode = (node) => node.nodeType === Node.ELEMENT_NODE;
		const isTextNode = (node) => node.nodeType === Node.TEXT_NODE;
		const isSVGElementNode = (element) => typeof element.className === "object";
		const isHTMLElementNode = (node) => isElementNode(node) && typeof node.style !== "undefined" && !isSVGElementNode(node);
		const isInputElement = (node) => node.tagName === "INPUT";
		const isHTMLElement = (node) => node.tagName === "HTML";
		const isSVGElement = (node) => node.tagName === "svg";
		const isBodyElement = (node) => node.tagName === "BODY";
		const isCanvasElement = (node) => node.tagName === "CANVAS";
		const isVideoElement = (node) => node.tagName === "VIDEO";
		const isImageElement = (node) => node.tagName === "IMG";
		const isIFrameElement = (node) => node.tagName === "IFRAME";
		const isStyleElement = (node) => node.tagName === "STYLE";
		const isScriptElement = (node) => node.tagName === "SCRIPT";
		const isTextareaElement = (node) => node.tagName === "TEXTAREA";
		const isSelectElement = (node) => node.tagName === "SELECT";
		const isSlotElement = (node) => node.tagName === "SLOT";
		const isLIElement = (node) => node.tagName === "LI";
		const isOLElement = (node) => node.tagName === "OL";
		const isCustomElement = (element) => !isSVGElementNode(element) && element.tagName.indexOf("-") > 0;
		const VOID_OR_REPLACED_TAGS = /* @__PURE__ */ new Set([
			"IMG",
			"VIDEO",
			"AUDIO",
			"CANVAS",
			"IFRAME",
			"INPUT",
			"TEXTAREA",
			"SELECT",
			"BR",
			"HR",
			"META",
			"LINK",
			"BASE",
			"COL",
			"SOURCE",
			"TRACK",
			"WBR",
			"AREA",
			"PARAM",
			"EMBED",
			"OBJECT"
		]);
		/**
		* Check if an element can have ::before / ::after pseudo-elements.
		* Per the CSS spec, replaced elements and void elements cannot have pseudo-elements.
		* SVG elements also do not support pseudo-elements.
		*/
		const canHavePseudoElements = (element) => !isSVGElementNode(element) && !VOID_OR_REPLACED_TAGS.has(element.tagName);
		const listStyleType = {
			name: "list-style-type",
			initialValue: "none",
			prefix: false,
			type: 2,
			parse: (_context, type) => {
				switch (type) {
					case "disc": return 0;
					case "circle": return 1;
					case "square": return 2;
					case "decimal": return 3;
					case "cjk-decimal": return 4;
					case "decimal-leading-zero": return 5;
					case "lower-roman": return 6;
					case "upper-roman": return 7;
					case "lower-greek": return 8;
					case "lower-alpha": return 9;
					case "upper-alpha": return 10;
					case "arabic-indic": return 11;
					case "armenian": return 12;
					case "bengali": return 13;
					case "cambodian": return 14;
					case "cjk-earthly-branch": return 15;
					case "cjk-heavenly-stem": return 16;
					case "cjk-ideographic": return 17;
					case "devanagari": return 18;
					case "ethiopic-numeric": return 19;
					case "georgian": return 20;
					case "gujarati": return 21;
					case "gurmukhi": return 22;
					case "hebrew": return 52;
					case "hiragana": return 23;
					case "hiragana-iroha": return 24;
					case "japanese-formal": return 25;
					case "japanese-informal": return 26;
					case "kannada": return 27;
					case "katakana": return 28;
					case "katakana-iroha": return 29;
					case "khmer": return 30;
					case "korean-hangul-formal": return 31;
					case "korean-hanja-formal": return 32;
					case "korean-hanja-informal": return 33;
					case "lao": return 34;
					case "lower-armenian": return 35;
					case "malayalam": return 36;
					case "mongolian": return 37;
					case "myanmar": return 38;
					case "oriya": return 39;
					case "persian": return 40;
					case "simp-chinese-formal": return 41;
					case "simp-chinese-informal": return 42;
					case "tamil": return 43;
					case "telugu": return 44;
					case "thai": return 45;
					case "tibetan": return 46;
					case "trad-chinese-formal": return 47;
					case "trad-chinese-informal": return 48;
					case "upper-armenian": return 49;
					case "disclosure-open": return 50;
					case "disclosure-closed": return 51;
					default: return -1;
				}
			}
		};
		const contains = (bit, value) => (bit & value) !== 0;
		var CounterState = class {
			constructor() {
				this.counters = {};
			}
			getCounterValue(name) {
				const counter = this.counters[name];
				if (counter && counter.length) return counter[counter.length - 1];
				return 1;
			}
			getCounterValues(name) {
				const counter = this.counters[name];
				return counter ? counter : [];
			}
			pop(counters) {
				counters.forEach((counter) => this.counters[counter].pop());
			}
			parse(style) {
				const counterIncrement = style.counterIncrement;
				const counterReset = style.counterReset;
				let canReset = true;
				if (counterIncrement !== null) counterIncrement.forEach((entry) => {
					const counter = this.counters[entry.counter];
					if (counter && entry.increment !== 0) {
						canReset = false;
						if (!counter.length) counter.push(1);
						counter[Math.max(0, counter.length - 1)] += entry.increment;
					}
				});
				const counterNames = [];
				if (canReset) counterReset.forEach((entry) => {
					let counter = this.counters[entry.counter];
					counterNames.push(entry.counter);
					if (!counter) counter = this.counters[entry.counter] = [];
					counter.push(entry.reset);
				});
				return counterNames;
			}
		};
		const ROMAN_UPPER = {
			integers: [
				1e3,
				900,
				500,
				400,
				100,
				90,
				50,
				40,
				10,
				9,
				5,
				4,
				1
			],
			values: [
				"M",
				"CM",
				"D",
				"CD",
				"C",
				"XC",
				"L",
				"XL",
				"X",
				"IX",
				"V",
				"IV",
				"I"
			]
		};
		const ARMENIAN = {
			integers: [
				9e3,
				8e3,
				7e3,
				6e3,
				5e3,
				4e3,
				3e3,
				2e3,
				1e3,
				900,
				800,
				700,
				600,
				500,
				400,
				300,
				200,
				100,
				90,
				80,
				70,
				60,
				50,
				40,
				30,
				20,
				10,
				9,
				8,
				7,
				6,
				5,
				4,
				3,
				2,
				1
			],
			values: [
				"Ք",
				"Փ",
				"Ւ",
				"Ց",
				"Ր",
				"Տ",
				"Վ",
				"Ս",
				"Ռ",
				"Ջ",
				"Պ",
				"Չ",
				"Ո",
				"Շ",
				"Ն",
				"Յ",
				"Մ",
				"Ճ",
				"Ղ",
				"Ձ",
				"Հ",
				"Կ",
				"Ծ",
				"Խ",
				"Լ",
				"Ի",
				"Ժ",
				"Թ",
				"Ը",
				"Է",
				"Զ",
				"Ե",
				"Դ",
				"Գ",
				"Բ",
				"Ա"
			]
		};
		const HEBREW = {
			integers: [
				1e4,
				9e3,
				8e3,
				7e3,
				6e3,
				5e3,
				4e3,
				3e3,
				2e3,
				1e3,
				400,
				300,
				200,
				100,
				90,
				80,
				70,
				60,
				50,
				40,
				30,
				20,
				19,
				18,
				17,
				16,
				15,
				10,
				9,
				8,
				7,
				6,
				5,
				4,
				3,
				2,
				1
			],
			values: [
				"י׳",
				"ט׳",
				"ח׳",
				"ז׳",
				"ו׳",
				"ה׳",
				"ד׳",
				"ג׳",
				"ב׳",
				"א׳",
				"ת",
				"ש",
				"ר",
				"ק",
				"צ",
				"פ",
				"ע",
				"ס",
				"נ",
				"מ",
				"ל",
				"כ",
				"יט",
				"יח",
				"יז",
				"טז",
				"טו",
				"י",
				"ט",
				"ח",
				"ז",
				"ו",
				"ה",
				"ד",
				"ג",
				"ב",
				"א"
			]
		};
		const GEORGIAN = {
			integers: [
				1e4,
				9e3,
				8e3,
				7e3,
				6e3,
				5e3,
				4e3,
				3e3,
				2e3,
				1e3,
				900,
				800,
				700,
				600,
				500,
				400,
				300,
				200,
				100,
				90,
				80,
				70,
				60,
				50,
				40,
				30,
				20,
				10,
				9,
				8,
				7,
				6,
				5,
				4,
				3,
				2,
				1
			],
			values: [
				"ჵ",
				"ჰ",
				"ჯ",
				"ჴ",
				"ხ",
				"ჭ",
				"წ",
				"ძ",
				"ც",
				"ჩ",
				"შ",
				"ყ",
				"ღ",
				"ქ",
				"ფ",
				"ჳ",
				"ტ",
				"ს",
				"რ",
				"ჟ",
				"პ",
				"ო",
				"ჲ",
				"ნ",
				"მ",
				"ლ",
				"კ",
				"ი",
				"თ",
				"ჱ",
				"ზ",
				"ვ",
				"ე",
				"დ",
				"გ",
				"ბ",
				"ა"
			]
		};
		const createAdditiveCounter = (value, min, max, symbols, fallback, suffix) => {
			if (value < min || value > max) return createCounterText(value, fallback, suffix.length > 0);
			return symbols.integers.reduce((string, integer, index) => {
				while (value >= integer) {
					value -= integer;
					string += symbols.values[index];
				}
				return string;
			}, "") + suffix;
		};
		const createCounterStyleWithSymbolResolver = (value, codePointRangeLength, isNumeric, resolver) => {
			let string = "";
			do {
				if (!isNumeric) value--;
				string = resolver(value) + string;
				value /= codePointRangeLength;
			} while (value * codePointRangeLength >= codePointRangeLength);
			return string;
		};
		const createCounterStyleFromRange = (value, codePointRangeStart, codePointRangeEnd, isNumeric, suffix) => {
			const codePointRangeLength = codePointRangeEnd - codePointRangeStart + 1;
			return (value < 0 ? "-" : "") + (createCounterStyleWithSymbolResolver(Math.abs(value), codePointRangeLength, isNumeric, (codePoint) => fromCodePoint$1(Math.floor(codePoint % codePointRangeLength) + codePointRangeStart)) + suffix);
		};
		const createCounterStyleFromSymbols = (value, symbols, suffix = ". ") => {
			const codePointRangeLength = symbols.length;
			return createCounterStyleWithSymbolResolver(Math.abs(value), codePointRangeLength, false, (codePoint) => symbols[Math.floor(codePoint % codePointRangeLength)]) + suffix;
		};
		const CJK_ZEROS = 1;
		const CJK_TEN_COEFFICIENTS = 2;
		const CJK_TEN_HIGH_COEFFICIENTS = 4;
		const CJK_HUNDRED_COEFFICIENTS = 8;
		const createCJKCounter = (value, numbers, multipliers, negativeSign, suffix, flags) => {
			if (value < -9999 || value > 9999) return createCounterText(value, 4, suffix.length > 0);
			let tmp = Math.abs(value);
			let string = suffix;
			if (tmp === 0) return numbers[0] + string;
			for (let digit = 0; tmp > 0 && digit <= 4; digit++) {
				const coefficient = tmp % 10;
				if (coefficient === 0 && contains(flags, CJK_ZEROS) && string !== "") string = numbers[coefficient] + string;
				else if (coefficient > 1 || coefficient === 1 && digit === 0 || coefficient === 1 && digit === 1 && contains(flags, CJK_TEN_COEFFICIENTS) || coefficient === 1 && digit === 1 && contains(flags, CJK_TEN_HIGH_COEFFICIENTS) && value > 100 || coefficient === 1 && digit > 1 && contains(flags, CJK_HUNDRED_COEFFICIENTS)) string = numbers[coefficient] + (digit > 0 ? multipliers[digit - 1] : "") + string;
				else if (coefficient === 1 && digit > 0) string = multipliers[digit - 1] + string;
				tmp = Math.floor(tmp / 10);
			}
			return (value < 0 ? negativeSign : "") + string;
		};
		const CHINESE_INFORMAL_MULTIPLIERS = "十百千萬";
		const CHINESE_FORMAL_MULTIPLIERS = "拾佰仟萬";
		const JAPANESE_NEGATIVE = "マイナス";
		const KOREAN_NEGATIVE = "마이너스";
		const createCounterText = (value, type, appendSuffix) => {
			const defaultSuffix = appendSuffix ? ". " : "";
			const cjkSuffix = appendSuffix ? "、" : "";
			const koreanSuffix = appendSuffix ? ", " : "";
			const spaceSuffix = appendSuffix ? " " : "";
			switch (type) {
				case 0: return "•" + spaceSuffix;
				case 1: return "◦" + spaceSuffix;
				case 2: return "◾" + spaceSuffix;
				case 5:
					const string = createCounterStyleFromRange(value, 48, 57, true, defaultSuffix);
					return string.length < 4 ? `0${string}` : string;
				case 4: return createCounterStyleFromSymbols(value, "〇一二三四五六七八九", cjkSuffix);
				case 6: return createAdditiveCounter(value, 1, 3999, ROMAN_UPPER, 3, defaultSuffix).toLowerCase();
				case 7: return createAdditiveCounter(value, 1, 3999, ROMAN_UPPER, 3, defaultSuffix);
				case 8: return createCounterStyleFromRange(value, 945, 969, false, defaultSuffix);
				case 9: return createCounterStyleFromRange(value, 97, 122, false, defaultSuffix);
				case 10: return createCounterStyleFromRange(value, 65, 90, false, defaultSuffix);
				case 11: return createCounterStyleFromRange(value, 1632, 1641, true, defaultSuffix);
				case 12:
				case 49: return createAdditiveCounter(value, 1, 9999, ARMENIAN, 3, defaultSuffix);
				case 35: return createAdditiveCounter(value, 1, 9999, ARMENIAN, 3, defaultSuffix).toLowerCase();
				case 13: return createCounterStyleFromRange(value, 2534, 2543, true, defaultSuffix);
				case 14:
				case 30: return createCounterStyleFromRange(value, 6112, 6121, true, defaultSuffix);
				case 15: return createCounterStyleFromSymbols(value, "子丑寅卯辰巳午未申酉戌亥", cjkSuffix);
				case 16: return createCounterStyleFromSymbols(value, "甲乙丙丁戊己庚辛壬癸", cjkSuffix);
				case 17:
				case 48: return createCJKCounter(value, "零一二三四五六七八九", CHINESE_INFORMAL_MULTIPLIERS, "負", cjkSuffix, 14);
				case 47: return createCJKCounter(value, "零壹貳參肆伍陸柒捌玖", CHINESE_FORMAL_MULTIPLIERS, "負", cjkSuffix, 15);
				case 42: return createCJKCounter(value, "零一二三四五六七八九", CHINESE_INFORMAL_MULTIPLIERS, "负", cjkSuffix, 14);
				case 41: return createCJKCounter(value, "零壹贰叁肆伍陆柒捌玖", CHINESE_FORMAL_MULTIPLIERS, "负", cjkSuffix, 15);
				case 26: return createCJKCounter(value, "〇一二三四五六七八九", "十百千万", JAPANESE_NEGATIVE, cjkSuffix, 0);
				case 25: return createCJKCounter(value, "零壱弐参四伍六七八九", "拾百千万", JAPANESE_NEGATIVE, cjkSuffix, 7);
				case 31: return createCJKCounter(value, "영일이삼사오육칠팔구", "십백천만", KOREAN_NEGATIVE, koreanSuffix, 7);
				case 33: return createCJKCounter(value, "零一二三四五六七八九", "十百千萬", KOREAN_NEGATIVE, koreanSuffix, 0);
				case 32: return createCJKCounter(value, "零壹貳參四五六七八九", "拾百千", KOREAN_NEGATIVE, koreanSuffix, 7);
				case 18: return createCounterStyleFromRange(value, 2406, 2415, true, defaultSuffix);
				case 20: return createAdditiveCounter(value, 1, 19999, GEORGIAN, 3, defaultSuffix);
				case 21: return createCounterStyleFromRange(value, 2790, 2799, true, defaultSuffix);
				case 22: return createCounterStyleFromRange(value, 2662, 2671, true, defaultSuffix);
				case 52: return createAdditiveCounter(value, 1, 10999, HEBREW, 3, defaultSuffix);
				case 23: return createCounterStyleFromSymbols(value, "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわゐゑをん");
				case 24: return createCounterStyleFromSymbols(value, "いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせす");
				case 27: return createCounterStyleFromRange(value, 3302, 3311, true, defaultSuffix);
				case 28: return createCounterStyleFromSymbols(value, "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヰヱヲン", cjkSuffix);
				case 29: return createCounterStyleFromSymbols(value, "イロハニホヘトチリヌルヲワカヨタレソツネナラムウヰノオクヤマケフコエテアサキユメミシヱヒモセス", cjkSuffix);
				case 34: return createCounterStyleFromRange(value, 3792, 3801, true, defaultSuffix);
				case 37: return createCounterStyleFromRange(value, 6160, 6169, true, defaultSuffix);
				case 38: return createCounterStyleFromRange(value, 4160, 4169, true, defaultSuffix);
				case 39: return createCounterStyleFromRange(value, 2918, 2927, true, defaultSuffix);
				case 40: return createCounterStyleFromRange(value, 1776, 1785, true, defaultSuffix);
				case 43: return createCounterStyleFromRange(value, 3046, 3055, true, defaultSuffix);
				case 44: return createCounterStyleFromRange(value, 3174, 3183, true, defaultSuffix);
				case 45: return createCounterStyleFromRange(value, 3664, 3673, true, defaultSuffix);
				case 46: return createCounterStyleFromRange(value, 3872, 3881, true, defaultSuffix);
				default: return createCounterStyleFromRange(value, 48, 57, true, defaultSuffix);
			}
		};
		const backgroundClip = {
			name: "background-clip",
			initialValue: "border-box",
			prefix: false,
			type: 1,
			parse: (_context, tokens) => {
				return tokens.map((token) => {
					if (isIdentToken(token)) switch (token.value) {
						case "padding-box": return 1;
						case "content-box": return 2;
						case "text": return 3;
					}
					return 0;
				});
			}
		};
		const backgroundColor = {
			name: `background-color`,
			initialValue: "transparent",
			prefix: false,
			type: 3,
			format: "color"
		};
		const parseColorStop = (context, args) => {
			const color = color$1.parse(context, args[0]);
			const stop = args[1];
			return stop && isLengthPercentage(stop) ? {
				color,
				stop
			} : {
				color,
				stop: null
			};
		};
		const processColorStops = (stops, lineLength) => {
			const first = stops[0];
			const last = stops[stops.length - 1];
			if (first.stop === null) first.stop = ZERO_LENGTH;
			if (last.stop === null) last.stop = HUNDRED_PERCENT;
			const processStops = [];
			let previous = 0;
			for (let i = 0; i < stops.length; i++) {
				const stop = stops[i].stop;
				if (stop !== null) {
					const absoluteValue = getAbsoluteValue(stop, lineLength);
					if (absoluteValue > previous) processStops.push(absoluteValue);
					else processStops.push(previous);
					previous = absoluteValue;
				} else processStops.push(null);
			}
			let gapBegin = null;
			for (let i = 0; i < processStops.length; i++) {
				const stop = processStops[i];
				if (stop === null) {
					if (gapBegin === null) gapBegin = i;
				} else if (gapBegin !== null) {
					const gapLength = i - gapBegin;
					const gapValue = (stop - processStops[gapBegin - 1]) / (gapLength + 1);
					for (let g = 1; g <= gapLength; g++) processStops[gapBegin + g - 1] = gapValue * g;
					gapBegin = null;
				}
			}
			return stops.map(({ color }, i) => {
				return {
					color,
					stop: Math.max(Math.min(1, processStops[i] / lineLength), 0)
				};
			});
		};
		const getAngleFromCorner = (corner, width, height) => {
			const centerX = width / 2;
			const centerY = height / 2;
			const x = getAbsoluteValue(corner[0], width) - centerX;
			const y = centerY - getAbsoluteValue(corner[1], height);
			return (Math.atan2(y, x) + Math.PI * 2) % (Math.PI * 2);
		};
		const calculateGradientDirection = (angle, width, height) => {
			const radian = typeof angle === "number" ? angle : getAngleFromCorner(angle, width, height);
			const lineLength = Math.abs(width * Math.sin(radian)) + Math.abs(height * Math.cos(radian));
			const halfWidth = width / 2;
			const halfHeight = height / 2;
			const halfLineLength = lineLength / 2;
			const yDiff = Math.sin(radian - Math.PI / 2) * halfLineLength;
			const xDiff = Math.cos(radian - Math.PI / 2) * halfLineLength;
			return [
				lineLength,
				halfWidth - xDiff,
				halfWidth + xDiff,
				halfHeight - yDiff,
				halfHeight + yDiff
			];
		};
		const distance = (a, b) => Math.sqrt(a * a + b * b);
		const findCorner = (width, height, x, y, closest) => {
			return [
				[0, 0],
				[0, height],
				[width, 0],
				[width, height]
			].reduce((stat, corner) => {
				const [cx, cy] = corner;
				const d = distance(x - cx, y - cy);
				if (closest ? d < stat.optimumDistance : d > stat.optimumDistance) return {
					optimumCorner: corner,
					optimumDistance: d
				};
				return stat;
			}, {
				optimumDistance: closest ? Infinity : -Infinity,
				optimumCorner: null
			}).optimumCorner;
		};
		const calculateRadius = (gradient, x, y, width, height) => {
			let rx = 0;
			let ry = 0;
			switch (gradient.size) {
				case 0:
					if (gradient.shape === 0) rx = ry = Math.min(Math.abs(x), Math.abs(x - width), Math.abs(y), Math.abs(y - height));
					else if (gradient.shape === 1) {
						rx = Math.min(Math.abs(x), Math.abs(x - width));
						ry = Math.min(Math.abs(y), Math.abs(y - height));
					}
					break;
				case 2:
					if (gradient.shape === 0) rx = ry = Math.min(distance(x, y), distance(x, y - height), distance(x - width, y), distance(x - width, y - height));
					else if (gradient.shape === 1) {
						const c = Math.min(Math.abs(y), Math.abs(y - height)) / Math.min(Math.abs(x), Math.abs(x - width));
						const [cx, cy] = findCorner(width, height, x, y, true);
						rx = distance(cx - x, (cy - y) / c);
						ry = c * rx;
					}
					break;
				case 1:
					if (gradient.shape === 0) rx = ry = Math.max(Math.abs(x), Math.abs(x - width), Math.abs(y), Math.abs(y - height));
					else if (gradient.shape === 1) {
						rx = Math.max(Math.abs(x), Math.abs(x - width));
						ry = Math.max(Math.abs(y), Math.abs(y - height));
					}
					break;
				case 3:
					if (gradient.shape === 0) rx = ry = Math.max(distance(x, y), distance(x, y - height), distance(x - width, y), distance(x - width, y - height));
					else if (gradient.shape === 1) {
						const c = Math.max(Math.abs(y), Math.abs(y - height)) / Math.max(Math.abs(x), Math.abs(x - width));
						const [cx, cy] = findCorner(width, height, x, y, false);
						rx = distance(cx - x, (cy - y) / c);
						ry = c * rx;
					}
					break;
			}
			if (Array.isArray(gradient.size)) {
				rx = getAbsoluteValue(gradient.size[0], width);
				ry = gradient.size.length === 2 ? getAbsoluteValue(gradient.size[1], height) : rx;
			}
			return [rx, ry];
		};
		const linearGradient = (context, tokens) => {
			let angle$2 = deg(180);
			const stops = [];
			parseFunctionArgs(tokens).forEach((arg, i) => {
				if (i === 0) {
					const firstToken = arg[0];
					if (firstToken.type === 20 && firstToken.value === "to") {
						angle$2 = parseNamedSide(arg);
						return;
					} else if (isAngle(firstToken)) {
						angle$2 = angle.parse(context, firstToken);
						return;
					}
				}
				const colorStop = parseColorStop(context, arg);
				stops.push(colorStop);
			});
			return {
				angle: angle$2,
				stops,
				type: 1
			};
		};
		const prefixLinearGradient = (context, tokens) => {
			let angle$1 = deg(180);
			const stops = [];
			parseFunctionArgs(tokens).forEach((arg, i) => {
				if (i === 0) {
					const firstToken = arg[0];
					if (firstToken.type === 20 && [
						"top",
						"left",
						"right",
						"bottom"
					].indexOf(firstToken.value) !== -1) {
						angle$1 = parseNamedSide(arg);
						return;
					} else if (isAngle(firstToken)) {
						angle$1 = (angle.parse(context, firstToken) + deg(270)) % deg(360);
						return;
					}
				}
				const colorStop = parseColorStop(context, arg);
				stops.push(colorStop);
			});
			return {
				angle: angle$1,
				stops,
				type: 1
			};
		};
		const webkitGradient = (context, tokens) => {
			const angle = deg(180);
			const stops = [];
			let type = 1;
			const shape = 0;
			const size = 3;
			const position = [];
			parseFunctionArgs(tokens).forEach((arg, i) => {
				const firstToken = arg[0];
				if (i === 0) {
					if (isIdentToken(firstToken) && firstToken.value === "linear") {
						type = 1;
						return;
					} else if (isIdentToken(firstToken) && firstToken.value === "radial") {
						type = 2;
						return;
					}
				}
				if (firstToken.type === 18) {
					if (firstToken.name === "from") {
						const color = color$1.parse(context, firstToken.values[0]);
						stops.push({
							stop: ZERO_LENGTH,
							color
						});
					} else if (firstToken.name === "to") {
						const color = color$1.parse(context, firstToken.values[0]);
						stops.push({
							stop: HUNDRED_PERCENT,
							color
						});
					} else if (firstToken.name === "color-stop") {
						const values = firstToken.values.filter(nonFunctionArgSeparator);
						if (values.length === 2) {
							const color = color$1.parse(context, values[1]);
							const stop = values[0];
							if (isNumberToken(stop)) stops.push({
								stop: {
									type: 16,
									number: stop.number * 100,
									flags: stop.flags
								},
								color
							});
						}
					}
				}
			});
			return type === 1 ? {
				angle: (angle + deg(180)) % deg(360),
				stops,
				type
			} : {
				size,
				shape,
				stops,
				position,
				type
			};
		};
		const CLOSEST_SIDE = "closest-side";
		const FARTHEST_SIDE = "farthest-side";
		const CLOSEST_CORNER = "closest-corner";
		const FARTHEST_CORNER = "farthest-corner";
		const CIRCLE = "circle";
		const ELLIPSE = "ellipse";
		const COVER = "cover";
		const CONTAIN = "contain";
		const radialGradient = (context, tokens) => {
			let shape = 0;
			let size = 3;
			const stops = [];
			const position = [];
			parseFunctionArgs(tokens).forEach((arg, i) => {
				let isColorStop = true;
				if (i === 0) {
					let isAtPosition = false;
					isColorStop = arg.reduce((acc, token) => {
						if (isAtPosition) {
							if (isIdentToken(token)) switch (token.value) {
								case "center":
									position.push(FIFTY_PERCENT);
									return acc;
								case "top":
								case "left":
									position.push(ZERO_LENGTH);
									return acc;
								case "right":
								case "bottom":
									position.push(HUNDRED_PERCENT);
									return acc;
							}
							else if (isLengthPercentage(token) || isLength(token)) position.push(token);
						} else if (isIdentToken(token)) switch (token.value) {
							case CIRCLE:
								shape = 0;
								return false;
							case ELLIPSE:
								shape = 1;
								return false;
							case "at":
								isAtPosition = true;
								return false;
							case CLOSEST_SIDE:
								size = 0;
								return false;
							case COVER:
							case FARTHEST_SIDE:
								size = 1;
								return false;
							case CONTAIN:
							case CLOSEST_CORNER:
								size = 2;
								return false;
							case FARTHEST_CORNER:
								size = 3;
								return false;
						}
						else if (isLength(token) || isLengthPercentage(token)) {
							if (!Array.isArray(size)) size = [];
							size.push(token);
							return false;
						}
						return acc;
					}, isColorStop);
				}
				if (isColorStop) {
					const colorStop = parseColorStop(context, arg);
					stops.push(colorStop);
				}
			});
			return {
				size,
				shape,
				stops,
				position,
				type: 2
			};
		};
		const prefixRadialGradient = (context, tokens) => {
			let shape = 0;
			let size = 3;
			const stops = [];
			const position = [];
			parseFunctionArgs(tokens).forEach((arg, i) => {
				let isColorStop = true;
				if (i === 0) isColorStop = arg.reduce((acc, token) => {
					if (isIdentToken(token)) switch (token.value) {
						case "center":
							position.push(FIFTY_PERCENT);
							return false;
						case "top":
						case "left":
							position.push(ZERO_LENGTH);
							return false;
						case "right":
						case "bottom":
							position.push(HUNDRED_PERCENT);
							return false;
					}
					else if (isLengthPercentage(token) || isLength(token)) {
						position.push(token);
						return false;
					}
					return acc;
				}, isColorStop);
				else if (i === 1) isColorStop = arg.reduce((acc, token) => {
					if (isIdentToken(token)) switch (token.value) {
						case CIRCLE:
							shape = 0;
							return false;
						case ELLIPSE:
							shape = 1;
							return false;
						case CONTAIN:
						case CLOSEST_SIDE:
							size = 0;
							return false;
						case FARTHEST_SIDE:
							size = 1;
							return false;
						case CLOSEST_CORNER:
							size = 2;
							return false;
						case COVER:
						case FARTHEST_CORNER:
							size = 3;
							return false;
					}
					else if (isLength(token) || isLengthPercentage(token)) {
						if (!Array.isArray(size)) size = [];
						size.push(token);
						return false;
					}
					return acc;
				}, isColorStop);
				if (isColorStop) {
					const colorStop = parseColorStop(context, arg);
					stops.push(colorStop);
				}
			});
			return {
				size,
				shape,
				stops,
				position,
				type: 2
			};
		};
		const repeatingLinearGradient = (context, tokens) => {
			return {
				...linearGradient(context, tokens),
				type: 3
			};
		};
		const isLinearGradient = (background) => {
			return background.type === 1;
		};
		const isRadialGradient = (background) => {
			return background.type === 2;
		};
		const isRepeatingLinearGradient = (background) => {
			return background.type === 3;
		};
		const image = {
			name: "image",
			parse: (context, value) => {
				if (value.type === 22) {
					const image = {
						url: value.value,
						type: 0
					};
					context.cache.addImage(value.value);
					return image;
				}
				if (value.type === 18) {
					const imageFunction = SUPPORTED_IMAGE_FUNCTIONS[value.name];
					if (typeof imageFunction === "undefined") throw new Error(`Attempting to parse an unsupported image function "${value.name}"`);
					return imageFunction(context, value.values);
				}
				throw new Error(`Unsupported image type ${value.type}`);
			}
		};
		function isSupportedImage(value) {
			return !(value.type === 20 && value.value === "none") && (value.type !== 18 || !!SUPPORTED_IMAGE_FUNCTIONS[value.name]);
		}
		const SUPPORTED_IMAGE_FUNCTIONS = {
			"linear-gradient": linearGradient,
			"-moz-linear-gradient": prefixLinearGradient,
			"-ms-linear-gradient": prefixLinearGradient,
			"-o-linear-gradient": prefixLinearGradient,
			"-webkit-linear-gradient": prefixLinearGradient,
			"radial-gradient": radialGradient,
			"-moz-radial-gradient": prefixRadialGradient,
			"-ms-radial-gradient": prefixRadialGradient,
			"-o-radial-gradient": prefixRadialGradient,
			"-webkit-radial-gradient": prefixRadialGradient,
			"-webkit-gradient": webkitGradient,
			"repeating-linear-gradient": repeatingLinearGradient,
			"-webkit-repeating-linear-gradient": repeatingLinearGradient,
			"-moz-repeating-linear-gradient": repeatingLinearGradient,
			"-ms-repeating-linear-gradient": repeatingLinearGradient,
			"-o-repeating-linear-gradient": repeatingLinearGradient
		};
		const backgroundImage = {
			name: "background-image",
			initialValue: "none",
			type: 1,
			prefix: false,
			skipCache: true,
			parse: (context, tokens) => {
				if (tokens.length === 0) return [];
				const first = tokens[0];
				if (first.type === 20 && first.value === "none") return [];
				return tokens.filter((value) => nonFunctionArgSeparator(value) && isSupportedImage(value)).map((value) => image.parse(context, value));
			}
		};
		const backgroundOrigin = {
			name: "background-origin",
			initialValue: "border-box",
			prefix: false,
			type: 1,
			parse: (_context, tokens) => {
				return tokens.map((token) => {
					if (isIdentToken(token)) switch (token.value) {
						case "padding-box": return 1;
						case "content-box": return 2;
					}
					return 0;
				});
			}
		};
		const backgroundPosition = {
			name: "background-position",
			initialValue: "0% 0%",
			type: 1,
			prefix: false,
			parse: (_context, tokens) => {
				return parseFunctionArgs(tokens).map((values) => {
					return values.map(parseOptionalCalcOrLength).filter((v) => v !== null);
				}).map(parseLengthPercentageTuple);
			}
		};
		const backgroundRepeat = {
			name: "background-repeat",
			initialValue: "repeat",
			prefix: false,
			type: 1,
			parse: (_context, tokens) => {
				return parseFunctionArgs(tokens).map((values) => values.filter(isIdentToken).map((token) => token.value).join(" ")).map(parseBackgroundRepeat);
			}
		};
		const parseBackgroundRepeat = (value) => {
			switch (value) {
				case "no-repeat": return 1;
				case "repeat-x":
				case "repeat no-repeat": return 2;
				case "repeat-y":
				case "no-repeat repeat": return 3;
				default: return 0;
			}
		};
		const backgroundSize = {
			name: "background-size",
			initialValue: "0",
			prefix: false,
			type: 1,
			parse: (_context, tokens) => {
				return parseFunctionArgs(tokens).map((values) => values.map((value) => isBackgroundSizeInfoToken(value) ? value : parseOptionalCalcOrLength(value)).filter((v) => v !== null));
			}
		};
		const isBackgroundSizeInfoToken = (value) => isIdentToken(value) || isLengthPercentage(value);
		const borderColorForSide = (side) => ({
			name: `border-${side}-color`,
			initialValue: "transparent",
			prefix: false,
			type: 3,
			format: "color"
		});
		const borderTopColor = borderColorForSide("top");
		const borderRightColor = borderColorForSide("right");
		const borderBottomColor = borderColorForSide("bottom");
		const borderLeftColor = borderColorForSide("left");
		const borderRadiusForSide = (side) => ({
			name: `border-${side}-radius`,
			initialValue: "0 0",
			prefix: false,
			type: 1,
			parse: (_context, tokens) => parseLengthPercentageTuple(tokens.filter(isLengthPercentage))
		});
		const borderTopLeftRadius = borderRadiusForSide("top-left");
		const borderTopRightRadius = borderRadiusForSide("top-right");
		const borderBottomRightRadius = borderRadiusForSide("bottom-right");
		const borderBottomLeftRadius = borderRadiusForSide("bottom-left");
		const borderStyleForSide = (side) => ({
			name: `border-${side}-style`,
			initialValue: "solid",
			prefix: false,
			type: 2,
			parse: (_context, style) => {
				switch (style) {
					case "none": return 0;
					case "dashed": return 2;
					case "dotted": return 3;
					case "double": return 4;
				}
				return 1;
			}
		});
		const borderTopStyle = borderStyleForSide("top");
		const borderRightStyle = borderStyleForSide("right");
		const borderBottomStyle = borderStyleForSide("bottom");
		const borderLeftStyle = borderStyleForSide("left");
		const borderWidthForSide = (side) => ({
			name: `border-${side}-width`,
			initialValue: "0",
			type: 0,
			prefix: false,
			parse: (_context, token) => {
				if (isDimensionToken(token)) return token.number;
				return 0;
			}
		});
		const borderTopWidth = borderWidthForSide("top");
		const borderRightWidth = borderWidthForSide("right");
		const borderBottomWidth = borderWidthForSide("bottom");
		const borderLeftWidth = borderWidthForSide("left");
		const NONE = { type: 0 };
		/**
		* Parse a shape-radius token: <length-percentage> | closest-side | farthest-side.
		* Defaults to 'closest-side' when no tokens are provided.
		*/
		const parseShapeRadius = (tokens) => {
			const [first] = tokens;
			if (!first) return "closest-side";
			if (isIdentToken(first)) return first.value === "farthest-side" ? "farthest-side" : "closest-side";
			return isLengthPercentage(first) ? first : "closest-side";
		};
		/**
		* Parse a CSS <position> as (cx, cy), each as a LengthPercentage.
		*
		* Supports the **1–2 value** subset of the CSS `<position>` syntax.
		* The 4-value form (`at left 10px top 20px`) is not supported and will be
		* parsed on a best-effort basis.
		*
		* Axis assignment rules:
		*   - `left` / `right`  → x-axis (cx)
		*   - `top`  / `bottom` → y-axis (cy)
		*   - `center` or a <length-percentage> → fills the first unset axis, in order
		*
		* Examples:
		*   "at left"        → cx=0,    cy=50%   (left is x; y defaults to center)
		*   "at top"         → cx=50%,  cy=0     (top is y; x defaults to center)
		*   "at center 30%"  → cx=50%,  cy=30%
		*   "at 30% center"  → cx=30%,  cy=50%
		*   "at left top"    → cx=0,    cy=0
		*   "at top left"    → cx=0,    cy=0     (keyword order is irrelevant)
		*
		* Unset axes fall back to 50%.
		*/
		const parsePosition = (tokens) => {
			let cx = null;
			let cy = null;
			for (const token of tokens) if (isIdentToken(token)) switch (token.value) {
				case "left":
					cx = ZERO_LENGTH;
					break;
				case "right":
					cx = HUNDRED_PERCENT;
					break;
				case "top":
					cy = ZERO_LENGTH;
					break;
				case "bottom":
					cy = HUNDRED_PERCENT;
					break;
				case "center":
					if (cx === null) cx = FIFTY_PERCENT;
					else if (cy === null) cy = FIFTY_PERCENT;
					break;
			}
			else if (isLengthPercentage(token)) {
				if (cx === null) cx = token;
				else if (cy === null) cy = token;
			}
			return {
				cx: cx ?? FIFTY_PERCENT,
				cy: cy ?? FIFTY_PERCENT
			};
		};
		/**
		* inset( <length-percentage>{1,4} [ round <'border-radius'> ]? )
		* The 1-4 shorthand follows the same expansion as margin/padding:
		*   1 value  → all four sides
		*   2 values → top/bottom | left/right
		*   3 values → top | left/right | bottom
		*   4 values → top | right | bottom | left
		* The optional `round` clause (border-radius) is parsed but ignored.
		*/
		const parseInset = (values) => {
			const lengths = [];
			for (const token of values) {
				if (token.type === 31) continue;
				if (isIdentToken(token) && token.value === "round") break;
				if (isLengthPercentage(token)) lengths.push(token);
			}
			const v0 = lengths[0] ?? ZERO_LENGTH;
			const v1 = lengths[1] ?? v0;
			return {
				type: 1,
				top: v0,
				right: v1,
				bottom: lengths[2] ?? v0,
				left: lengths[3] ?? v1
			};
		};
		/**
		* circle( [ <shape-radius> ]? [ at <position> ]? )
		*/
		const parseCircle = (values) => {
			const nonWs = values.filter(nonWhiteSpace);
			const atIdx = nonWs.findIndex((t) => isIdentWithValue(t, "at"));
			const radiusTokens = atIdx === -1 ? nonWs : nonWs.slice(0, atIdx);
			const posTokens = atIdx === -1 ? [] : nonWs.slice(atIdx + 1);
			return {
				type: 2,
				radius: parseShapeRadius(radiusTokens),
				...parsePosition(posTokens)
			};
		};
		/**
		* ellipse( [ <shape-radius>{2} ]? [ at <position> ]? )
		*/
		const parseEllipse = (values) => {
			const nonWs = values.filter(nonWhiteSpace);
			const atIdx = nonWs.findIndex((t) => isIdentWithValue(t, "at"));
			const radiusTokens = atIdx === -1 ? nonWs : nonWs.slice(0, atIdx);
			const posTokens = atIdx === -1 ? [] : nonWs.slice(atIdx + 1);
			return {
				type: 3,
				rx: parseShapeRadius(radiusTokens.slice(0, 1)),
				ry: parseShapeRadius(radiusTokens.slice(1, 2)),
				...parsePosition(posTokens)
			};
		};
		/**
		* polygon( [ <fill-rule>, ]? [ <length-percentage> <length-percentage> ]# )
		* Each comma-separated group defines one vertex (x y).
		* A leading fill-rule keyword (nonzero/evenodd) is skipped.
		*/
		const parsePolygon = (values) => {
			const args = parseFunctionArgs(values);
			const points = [];
			for (const arg of args) {
				if (arg.length === 1 && isIdentToken(arg[0])) continue;
				const lengths = arg.filter(isLengthPercentage);
				if (lengths.length >= 2) points.push([lengths[0], lengths[1]]);
			}
			return {
				type: 4,
				points
			};
		};
		/**
		* path( [ <fill-rule>, ]? <string> )
		* The string value is the SVG path data (coordinates in the element's local space).
		*/
		const parsePath = (values) => {
			const stringToken = values.find((t) => t.type === 0);
			if (!stringToken) return NONE;
			return {
				type: 5,
				d: stringToken.value
			};
		};
		const clipPath = {
			name: "clip-path",
			initialValue: "none",
			prefix: false,
			type: 0,
			parse: (_context, token) => {
				if (isIdentToken(token) && token.value === "none") return NONE;
				if (token.type === 18) switch (token.name) {
					case "inset": return parseInset(token.values);
					case "circle": return parseCircle(token.values);
					case "ellipse": return parseEllipse(token.values);
					case "polygon": return parsePolygon(token.values);
					case "path": return parsePath(token.values);
				}
				return NONE;
			}
		};
		const color = {
			name: `color`,
			initialValue: "transparent",
			prefix: false,
			type: 3,
			format: "color"
		};
		const direction = {
			name: "direction",
			initialValue: "ltr",
			prefix: false,
			type: 2,
			parse: (_context, direction) => {
				switch (direction) {
					case "rtl": return 1;
					default: return 0;
				}
			}
		};
		const display = {
			name: "display",
			initialValue: "inline-block",
			prefix: false,
			type: 1,
			parse: (_context, tokens) => {
				return tokens.filter(isIdentToken).reduce((bit, token) => {
					return bit | parseDisplayValue$1(token.value);
				}, 0);
			}
		};
		const parseDisplayValue$1 = (display) => {
			switch (display) {
				case "block":
				case "-webkit-box": return 2;
				case "inline": return 4;
				case "run-in": return 8;
				case "flow": return 16;
				case "flow-root": return 32;
				case "table": return 64;
				case "flex":
				case "-webkit-flex": return 128;
				case "grid":
				case "-ms-grid": return 256;
				case "ruby": return 512;
				case "subgrid": return 1024;
				case "list-item": return 2048;
				case "table-row-group": return 4096;
				case "table-header-group": return 8192;
				case "table-footer-group": return 16384;
				case "table-row": return 32768;
				case "table-cell": return 65536;
				case "table-column-group": return 131072;
				case "table-column": return 262144;
				case "table-caption": return 524288;
				case "ruby-base": return 1048576;
				case "ruby-text": return 2097152;
				case "ruby-base-container": return 4194304;
				case "ruby-text-container": return 8388608;
				case "contents": return 16777216;
				case "inline-block": return 33554432;
				case "inline-list-item": return 67108864;
				case "inline-table": return 134217728;
				case "inline-flex": return 268435456;
				case "inline-grid": return 536870912;
			}
			return 0;
		};
		const float = {
			name: "float",
			initialValue: "none",
			prefix: false,
			type: 2,
			parse: (_context, float) => {
				switch (float) {
					case "left": return 1;
					case "right": return 2;
					case "inline-start": return 3;
					case "inline-end": return 4;
				}
				return 0;
			}
		};
		const letterSpacing = {
			name: "letter-spacing",
			initialValue: "0",
			prefix: false,
			type: 0,
			parse: (_context, token) => {
				if (token.type === 20 && token.value === "normal") return 0;
				if (token.type === 17) return token.number;
				if (token.type === 15) return token.number;
				return 0;
			}
		};
		const lineBreak = {
			name: "line-break",
			initialValue: "normal",
			prefix: false,
			type: 2,
			parse: (_context, lineBreak) => {
				switch (lineBreak) {
					case "strict": return "strict";
					default: return "normal";
				}
			}
		};
		const lineHeight = {
			name: "line-height",
			initialValue: "normal",
			prefix: false,
			type: 4
		};
		const computeLineHeight = (token, fontSize) => {
			if (isIdentToken(token) && token.value === "normal") return 1.2 * fontSize;
			else if (token.type === 17) return fontSize * token.number;
			else if (isLengthPercentage(token)) return getAbsoluteValue(token, fontSize);
			return fontSize;
		};
		const listStyleImage = {
			name: "list-style-image",
			initialValue: "none",
			type: 0,
			prefix: false,
			skipCache: true,
			parse: (context, token) => {
				if (token.type === 20 && token.value === "none") return null;
				return image.parse(context, token);
			}
		};
		const listStylePosition = {
			name: "list-style-position",
			initialValue: "outside",
			prefix: false,
			type: 2,
			parse: (_context, position) => {
				switch (position) {
					case "inside": return 0;
					default: return 1;
				}
			}
		};
		const marginForSide = (side) => ({
			name: `margin-${side}`,
			initialValue: "0",
			prefix: false,
			type: 4
		});
		const marginTop = marginForSide("top");
		const marginRight = marginForSide("right");
		const marginBottom = marginForSide("bottom");
		const marginLeft = marginForSide("left");
		const overflow = {
			name: "overflow",
			initialValue: "visible",
			prefix: false,
			type: 1,
			parse: (_context, tokens) => {
				return tokens.filter(isIdentToken).map((overflow) => {
					switch (overflow.value) {
						case "hidden": return 1;
						case "scroll": return 2;
						case "clip": return 3;
						case "auto": return 4;
						default: return 0;
					}
				});
			}
		};
		const overflowWrap = {
			name: "overflow-wrap",
			initialValue: "normal",
			prefix: false,
			type: 2,
			parse: (_context, overflow) => {
				switch (overflow) {
					case "break-word": return "break-word";
					default: return "normal";
				}
			}
		};
		const paddingForSide = (side) => ({
			name: `padding-${side}`,
			initialValue: "0",
			prefix: false,
			type: 3,
			format: "length-percentage"
		});
		const paddingTop = paddingForSide("top");
		const paddingRight = paddingForSide("right");
		const paddingBottom = paddingForSide("bottom");
		const paddingLeft = paddingForSide("left");
		const textAlign = {
			name: "text-align",
			initialValue: "left",
			prefix: false,
			type: 2,
			parse: (_context, textAlign) => {
				switch (textAlign) {
					case "right": return 2;
					case "center":
					case "justify": return 1;
					default: return 0;
				}
			}
		};
		const position = {
			name: "position",
			initialValue: "static",
			prefix: false,
			type: 2,
			parse: (_context, position) => {
				switch (position) {
					case "relative": return 1;
					case "absolute": return 2;
					case "fixed": return 3;
					case "sticky": return 4;
				}
				return 0;
			}
		};
		const textShadow = {
			name: "text-shadow",
			initialValue: "none",
			type: 1,
			prefix: false,
			parse: (context, tokens) => {
				if (tokens.length === 1 && isIdentWithValue(tokens[0], "none")) return [];
				return parseFunctionArgs(tokens).map((values) => {
					const shadow = {
						color: COLORS.TRANSPARENT,
						offsetX: ZERO_LENGTH,
						offsetY: ZERO_LENGTH,
						blur: ZERO_LENGTH
					};
					let c = 0;
					for (let i = 0; i < values.length; i++) {
						const token = values[i];
						if (isLength(token)) {
							if (c === 0) shadow.offsetX = token;
							else if (c === 1) shadow.offsetY = token;
							else shadow.blur = token;
							c++;
						} else shadow.color = color$1.parse(context, token);
					}
					return shadow;
				});
			}
		};
		const textTransform = {
			name: "text-transform",
			initialValue: "none",
			prefix: false,
			type: 2,
			parse: (_context, textTransform) => {
				switch (textTransform) {
					case "uppercase": return 2;
					case "lowercase": return 1;
					case "capitalize": return 3;
				}
				return 0;
			}
		};
		const transform$1 = {
			name: "transform",
			initialValue: "none",
			prefix: true,
			type: 0,
			parse: (_context, token) => {
				if (token.type === 20 && token.value === "none") return null;
				if (token.type === 18) {
					const transformFunction = SUPPORTED_TRANSFORM_FUNCTIONS[token.name];
					if (typeof transformFunction === "undefined") throw new Error(`Attempting to parse an unsupported transform function "${token.name}"`);
					return transformFunction(_context, token.values);
				}
				return null;
			}
		};
		const matrix = (_context, args) => {
			const values = args.filter((arg) => arg.type === 17).map((arg) => arg.number);
			return values.length === 6 ? values : null;
		};
		const matrix3d = (_context, args) => {
			const values = args.filter((arg) => arg.type === 17).map((arg) => arg.number);
			const [a1, b1, {}, {}, a2, b2, {}, {}, {}, {}, {}, {}, a4, b4, {}, {}] = values;
			return values.length === 16 ? [
				a1,
				b1,
				a2,
				b2,
				a4,
				b4
			] : null;
		};
		const rotate$1 = (context, args) => {
			if (args.length !== 1) return null;
			const arg = args[0];
			let radians = 0;
			if (arg.type === 17 && arg.number === 0) radians = 0;
			else if (arg.type === 15) radians = angle.parse(context, arg);
			else return null;
			const cos = Math.cos(radians);
			const sin = Math.sin(radians);
			return [
				cos,
				sin,
				-sin,
				cos,
				0,
				0
			];
		};
		const SUPPORTED_TRANSFORM_FUNCTIONS = {
			matrix,
			matrix3d,
			rotate: rotate$1
		};
		const DEFAULT_VALUE = {
			type: 16,
			number: 50,
			flags: 4
		};
		const DEFAULT = [DEFAULT_VALUE, DEFAULT_VALUE];
		const transformOrigin = {
			name: "transform-origin",
			initialValue: "50% 50%",
			prefix: true,
			type: 1,
			parse: (_context, tokens) => {
				const origins = tokens.filter(isLengthPercentage);
				if (origins.length !== 2) return DEFAULT;
				return [origins[0], origins[1]];
			}
		};
		const rotate = {
			name: "rotate",
			initialValue: "none",
			prefix: false,
			type: 0,
			parse: (_context, token) => {
				if (token.type === 20 && token.value === "none") return null;
				if (token.type === 17) {
					if (token.number === 0) return 0;
				}
				if (token.type === 15) return angle.parse(_context, token) * 180 / Math.PI;
				return null;
			}
		};
		const visibility = {
			name: "visibility",
			initialValue: "none",
			prefix: false,
			type: 2,
			parse: (_context, visibility) => {
				switch (visibility) {
					case "hidden": return 1;
					case "collapse": return 2;
					default: return 0;
				}
			}
		};
		const wordBreak = {
			name: "word-break",
			initialValue: "normal",
			prefix: false,
			type: 2,
			parse: (_context, wordBreak) => {
				switch (wordBreak) {
					case "break-all": return "break-all";
					case "keep-all": return "keep-all";
					default: return "normal";
				}
			}
		};
		const whiteSpace = {
			name: "white-space",
			initialValue: "normal",
			prefix: false,
			type: 2,
			parse: (_context, value) => {
				switch (value) {
					case "pre": return "pre";
					case "nowrap": return "nowrap";
					case "pre-wrap": return "pre-wrap";
					case "pre-line": return "pre-line";
					default: return "normal";
				}
			}
		};
		const isVerticalWritingMode = (writingMode) => writingMode !== 0;
		const isSidewaysWritingMode = (writingMode) => writingMode === 3 || writingMode === 4;
		const writingMode = {
			name: "writing-mode",
			initialValue: "horizontal-tb",
			prefix: false,
			type: 2,
			parse: (_context, writingMode) => {
				switch (writingMode) {
					case "vertical-rl": return 1;
					case "vertical-lr": return 2;
					case "sideways-rl": return 3;
					case "sideways-lr": return 4;
					default: return 0;
				}
			}
		};
		const zIndex = {
			name: "z-index",
			initialValue: "auto",
			prefix: false,
			type: 0,
			parse: (_context, token) => {
				if (token.type === 20) return {
					auto: true,
					order: 0
				};
				if (isNumberToken(token)) return {
					auto: false,
					order: token.number
				};
				throw new Error(`Invalid z-index number parsed`);
			}
		};
		const time = {
			name: "time",
			parse: (_context, value) => {
				if (value.type === 15) switch (value.unit.toLowerCase()) {
					case "s": return 1e3 * value.number;
					case "ms": return value.number;
				}
				throw new Error(`Unsupported time type`);
			}
		};
		const opacity = {
			name: "opacity",
			initialValue: "1",
			type: 0,
			prefix: false,
			parse: (_context, token) => {
				if (isNumberToken(token)) return token.number;
				return 1;
			}
		};
		const textDecorationColor = {
			name: `text-decoration-color`,
			initialValue: "transparent",
			prefix: false,
			type: 3,
			format: "color"
		};
		const textDecorationLine = {
			name: "text-decoration-line",
			initialValue: "none",
			prefix: false,
			type: 1,
			parse: (_context, tokens) => {
				return tokens.filter(isIdentToken).map((token) => {
					switch (token.value) {
						case "underline": return 1;
						case "overline": return 2;
						case "line-through": return 3;
						case "none": return 4;
					}
					return 0;
				}).filter((line) => line !== 0);
			}
		};
		const textDecorationStyle = {
			name: "text-decoration-style",
			initialValue: "solid",
			prefix: false,
			type: 2,
			parse: (_context, style) => {
				switch (style) {
					case "double": return 1;
					case "dotted": return 2;
					case "dashed": return 3;
					case "wavy": return 4;
					default: return 0;
				}
			}
		};
		const textDecorationThickness = {
			name: "text-decoration-thickness",
			initialValue: "auto",
			prefix: false,
			type: 0,
			parse: (_context, token) => {
				if (isIdentToken(token)) switch (token.value) {
					case "auto": return "auto";
					case "from-font": return "from-font";
				}
				if (isDimensionToken(token)) return token.number;
				return "auto";
			}
		};
		const textUnderlineOffset = {
			name: "text-underline-offset",
			initialValue: "auto",
			prefix: false,
			type: 0,
			parse: (_context, token) => {
				if (isIdentToken(token)) {
					if (token.value === "auto") return "auto";
				}
				if (isDimensionToken(token)) return token.number;
				return "auto";
			}
		};
		const fontFamily = {
			name: `font-family`,
			initialValue: "",
			prefix: false,
			type: 1,
			parse: (_context, tokens) => {
				const accumulator = [];
				const results = [];
				tokens.forEach((token) => {
					switch (token.type) {
						case 20:
						case 0:
							accumulator.push(token.value);
							break;
						case 17:
							accumulator.push(token.number.toString());
							break;
						case 4:
							results.push(accumulator.join(" "));
							accumulator.length = 0;
							break;
					}
				});
				if (accumulator.length) results.push(accumulator.join(" "));
				return results.map((result) => result.indexOf(" ") === -1 ? result : `'${result}'`);
			}
		};
		const fontSize = {
			name: `font-size`,
			initialValue: "0",
			prefix: false,
			type: 3,
			format: "length"
		};
		const fontWeight = {
			name: "font-weight",
			initialValue: "normal",
			type: 0,
			prefix: false,
			parse: (_context, token) => {
				if (isNumberToken(token)) return token.number;
				if (isIdentToken(token)) switch (token.value) {
					case "bold": return 700;
					default: return 400;
				}
				return 400;
			}
		};
		const fontVariant = {
			name: "font-variant",
			initialValue: "none",
			type: 1,
			prefix: false,
			parse: (_context, tokens) => {
				return tokens.filter(isIdentToken).map((token) => token.value);
			}
		};
		const fontStyle = {
			name: "font-style",
			initialValue: "normal",
			prefix: false,
			type: 2,
			parse: (_context, overflow) => {
				switch (overflow) {
					case "oblique": return "oblique";
					case "italic": return "italic";
					default: return "normal";
				}
			}
		};
		const content = {
			name: "content",
			initialValue: "none",
			type: 1,
			prefix: false,
			parse: (_context, tokens) => {
				if (tokens.length === 0) return [];
				const first = tokens[0];
				if (first.type === 20 && first.value === "none") return [];
				return tokens;
			}
		};
		/** Shared counter-ID parsing: returns next number or a fallback default. */
		const parseCounterValue = (tokens, defaultNumber) => {
			const entries = [];
			const filtered = tokens.filter(nonWhiteSpace);
			for (let i = 0; i < filtered.length; i++) {
				const counter = filtered[i];
				const next = filtered[i + 1];
				if (counter.type === 20) {
					const num = next && isNumberToken(next) ? next.number : defaultNumber;
					entries.push([counter.value, num]);
				}
			}
			return entries;
		};
		const counterIncrement = {
			name: "counter-increment",
			initialValue: "none",
			prefix: true,
			type: 1,
			parse: (_context, tokens) => {
				if (tokens.length === 0) return null;
				const first = tokens[0];
				if (first.type === 20 && first.value === "none") return null;
				return parseCounterValue(tokens, 1).map(([counter, increment]) => ({
					counter,
					increment
				}));
			}
		};
		const counterReset = {
			name: "counter-reset",
			initialValue: "none",
			prefix: true,
			type: 1,
			parse: (_context, tokens) => {
				if (tokens.length === 0) return [];
				return parseCounterValue(tokens, 0).filter(([counter]) => counter !== "none").map(([counter, reset]) => ({
					counter,
					reset
				}));
			}
		};
		const duration = {
			name: "duration",
			initialValue: "0s",
			prefix: false,
			type: 1,
			parse: (context, tokens) => {
				return tokens.filter(isDimensionToken).map((token) => time.parse(context, token));
			}
		};
		const quotes = {
			name: "quotes",
			initialValue: "none",
			prefix: true,
			type: 1,
			parse: (_context, tokens) => {
				if (tokens.length === 0) return null;
				const first = tokens[0];
				if (first.type === 20 && first.value === "none") return null;
				const quotes = [];
				const filtered = tokens.filter(isStringToken);
				if (filtered.length % 2 !== 0) return null;
				for (let i = 0; i < filtered.length; i += 2) {
					const open = filtered[i].value;
					const close = filtered[i + 1].value;
					quotes.push({
						open,
						close
					});
				}
				return quotes;
			}
		};
		const getQuote = (quotes, depth, open) => {
			if (!quotes) return "";
			const quote = quotes[Math.min(depth, quotes.length - 1)];
			if (!quote) return "";
			return open ? quote.open : quote.close;
		};
		const boxShadow = {
			name: "box-shadow",
			initialValue: "none",
			type: 1,
			prefix: false,
			parse: (context, tokens) => {
				if (tokens.length === 1 && isIdentWithValue(tokens[0], "none")) return [];
				return parseFunctionArgs(tokens).map((values) => {
					const shadow = {
						color: 255,
						offsetX: ZERO_LENGTH,
						offsetY: ZERO_LENGTH,
						blur: ZERO_LENGTH,
						spread: ZERO_LENGTH,
						inset: false
					};
					let c = 0;
					for (let i = 0; i < values.length; i++) {
						const token = values[i];
						if (isIdentWithValue(token, "inset")) shadow.inset = true;
						else if (isLength(token)) {
							if (c === 0) shadow.offsetX = token;
							else if (c === 1) shadow.offsetY = token;
							else if (c === 2) shadow.blur = token;
							else shadow.spread = token;
							c++;
						} else shadow.color = color$1.parse(context, token);
					}
					return shadow;
				});
			}
		};
		const paintOrder = {
			name: "paint-order",
			initialValue: "normal",
			prefix: false,
			type: 1,
			parse: (_context, tokens) => {
				const DEFAULT_VALUE = [
					0,
					1,
					2
				];
				const layers = [];
				tokens.filter(isIdentToken).forEach((token) => {
					switch (token.value) {
						case "stroke":
							layers.push(1);
							break;
						case "fill":
							layers.push(0);
							break;
						case "markers":
							layers.push(2);
							break;
					}
				});
				DEFAULT_VALUE.forEach((value) => {
					if (layers.indexOf(value) === -1) layers.push(value);
				});
				return layers;
			}
		};
		const webkitTextStrokeColor = {
			name: `-webkit-text-stroke-color`,
			initialValue: "currentcolor",
			prefix: false,
			type: 3,
			format: "color"
		};
		const webkitTextStrokeWidth = {
			name: `-webkit-text-stroke-width`,
			initialValue: "0",
			type: 0,
			prefix: false,
			parse: (_context, token) => {
				if (isDimensionToken(token)) return token.number;
				return 0;
			}
		};
		/**
		* -webkit-line-clamp property descriptor
		* Used with display: -webkit-box and -webkit-box-orient: vertical
		* to limit text to a specific number of lines
		*/
		const webkitLineClamp = {
			name: "-webkit-line-clamp",
			initialValue: "none",
			prefix: true,
			type: 0,
			parse: (_context, token) => {
				if (token.type === 20 && token.value === "none") return 0;
				if (token.type === 17) return Math.max(0, Math.floor(token.number));
				return 0;
			}
		};
		const objectFit = {
			name: "object-fit",
			initialValue: "fill",
			prefix: false,
			type: 1,
			parse: (_context, tokens) => {
				return tokens.filter(isIdentToken).reduce((bit, token) => {
					return bit | parseDisplayValue(token.value);
				}, 0);
			}
		};
		const parseDisplayValue = (display) => {
			switch (display) {
				case "contain": return 2;
				case "cover": return 4;
				case "none": return 8;
				case "scale-down": return 16;
			}
			return 0;
		};
		const textOverflow = {
			name: "text-overflow",
			initialValue: "clip",
			prefix: false,
			type: 2,
			parse: (_context, textOverflow) => {
				switch (textOverflow) {
					case "ellipsis": return 1;
					default: return 0;
				}
			}
		};
		const imageRendering = {
			name: "image-rendering",
			initialValue: "auto",
			prefix: false,
			type: 2,
			parse: (_context, value) => {
				switch (value.toLowerCase()) {
					case "crisp-edges":
					case "-webkit-crisp-edges":
					case "-moz-crisp-edges": return 1;
					case "pixelated":
					case "-webkit-optimize-contrast": return 2;
					case "smooth":
					case "high-quality": return 3;
					default: return 0;
				}
			}
		};
		const MIX_BLEND_MODE$1 = {
			NORMAL: "normal",
			MULTIPLY: "multiply",
			SCREEN: "screen",
			OVERLAY: "overlay",
			DARKEN: "darken",
			LIGHTEN: "lighten",
			COLOR_DODGE: "color-dodge",
			COLOR_BURN: "color-burn",
			HARD_LIGHT: "hard-light",
			SOFT_LIGHT: "soft-light",
			DIFFERENCE: "difference",
			EXCLUSION: "exclusion",
			HUE: "hue",
			SATURATION: "saturation",
			COLOR: "color",
			LUMINOSITY: "luminosity"
		};
		const VALID_VALUES$1 = new Set(Object.values(MIX_BLEND_MODE$1));
		const mixBlendMode = {
			name: "mix-blend-mode",
			initialValue: "normal",
			type: 2,
			prefix: false,
			parse: (_context, token) => {
				return VALID_VALUES$1.has(token) ? token : MIX_BLEND_MODE$1.NORMAL;
			}
		};
		const filter = {
			name: "filter",
			initialValue: "none",
			prefix: false,
			type: 1,
			parse: (_context, tokens) => {
				if (tokens.length === 1 && tokens[0].type === 20 && tokens[0].value === "none") return null;
				const parts = [];
				for (const token of tokens) if (token.type === 18) {
					const fn = token;
					const renderedArgs = renderFilterArgs(fn.values);
					switch (fn.name) {
						case "blur":
							parts.push(`blur(${renderedArgs}px)`);
							break;
						case "brightness":
						case "contrast":
						case "invert":
						case "opacity":
						case "saturate":
						case "sepia":
							parts.push(`${fn.name}(${renderedArgs})`);
							break;
						case "grayscale":
							parts.push(`grayscale(${renderedArgs})`);
							break;
						case "hue-rotate":
							parts.push(`hue-rotate(${renderedArgs}deg)`);
							break;
						case "drop-shadow":
							parts.push(`drop-shadow(${renderedArgs})`);
							break;
						default: break;
					}
				}
				return parts.length > 0 ? parts.join(" ") : null;
			}
		};
		/**
		* Render filter function arguments back into a CSS string suitable for Canvas API.
		* Canvas 2D `ctx.filter` accepts the same CSS filter function strings.
		*/
		const renderFilterArgs = (values) => {
			const parts = [];
			for (const v of values) {
				if (v.type === 31) continue;
				if (v.type === 15) parts.push(`${v.number}${v.unit}`);
				else if (v.type === 17) parts.push(`${v.number}`);
				else if (v.type === 16) parts.push(`${v.number}%`);
				else if (v.type === 20) parts.push(v.value);
				else if (v.type === 5) parts.push(`#${v.value}`);
			}
			return parts.join(" ");
		};
		const fontVariantLigatures = {
			name: "font-variant-ligatures",
			initialValue: "normal",
			prefix: false,
			type: 2,
			parse: (_context, value) => {
				switch (value) {
					case "none": return 1;
					case "common-ligatures": return 2;
					case "no-common-ligatures": return 3;
					case "discretionary-ligatures": return 4;
					case "no-discretionary-ligatures": return 5;
					case "historical-ligatures": return 6;
					case "no-historical-ligatures": return 7;
					case "contextual": return 8;
					case "no-contextual": return 9;
					default: return 0;
				}
			}
		};
		const zoom = {
			name: "zoom",
			initialValue: "1",
			type: 0,
			prefix: false,
			parse: (_context, token) => {
				if (token.type === 16) return Math.max(0, token.number / 100);
				if (token.type === 17) return Math.max(0, token.number);
				return 1;
			}
		};
		const objectPosition = {
			name: "object-position",
			initialValue: "50% 50%",
			prefix: false,
			type: 1,
			parse: (_context, tokens) => {
				const result = [];
				let i = 0;
				while (i < tokens.length && result.length < 2) {
					const token = tokens[i];
					if (isIdentToken(token)) switch (token.value) {
						case "left":
						case "top":
							result.push(ZERO_LENGTH);
							break;
						case "center":
							result.push(FIFTY_PERCENT);
							break;
						case "right":
						case "bottom":
							result.push(HUNDRED_PERCENT);
							break;
					}
					else if (isLengthPercentage(token)) result.push(token);
					i++;
				}
				while (result.length < 2) result.push(FIFTY_PERCENT);
				return [result[0], result[1]];
			}
		};
		const VALID_VALUES = new Set(Object.values({
			NORMAL: "normal",
			MULTIPLY: "multiply",
			SCREEN: "screen",
			OVERLAY: "overlay",
			DARKEN: "darken",
			LIGHTEN: "lighten",
			COLOR_DODGE: "color-dodge",
			COLOR_BURN: "color-burn",
			HARD_LIGHT: "hard-light",
			SOFT_LIGHT: "soft-light",
			DIFFERENCE: "difference",
			EXCLUSION: "exclusion",
			HUE: "hue",
			SATURATION: "saturation",
			COLOR: "color",
			LUMINOSITY: "luminosity"
		}));
		const backgroundBlendMode = {
			name: "background-blend-mode",
			initialValue: "normal",
			prefix: false,
			type: 1,
			parse: (_context, tokens) => {
				const modes = [];
				const filtered = tokens.filter(nonFunctionArgSeparator);
				for (const token of filtered) if (isIdentToken(token)) {
					if (VALID_VALUES.has(token.value)) modes.push(token.value);
				}
				return modes.length > 0 ? modes : ["normal"];
			}
		};
		const borderImageSource = {
			name: "border-image-source",
			initialValue: "none",
			prefix: false,
			type: 1,
			skipCache: true,
			parse: (context, tokens) => {
				if (tokens.length === 0) return null;
				const filtered = tokens.filter((t) => nonFunctionArgSeparator(t) && isSupportedImage(t));
				if (filtered.length === 0) return null;
				return image.parse(context, filtered[0]);
			}
		};
		const fillSides = (sides) => {
			const result = [...sides];
			if (result.length === 1) result.push(result[0], result[0], result[0]);
			else if (result.length === 2) result.push(result[0], result[1]);
			else if (result.length === 3) result.push(result[1]);
			return result.slice(0, 4);
		};
		const borderImageSlice = {
			name: "border-image-slice",
			initialValue: "100%",
			prefix: false,
			type: 1,
			parse: (_context, tokens) => {
				const filtered = tokens.filter(nonWhiteSpace);
				const values = [];
				let fill = false;
				let unit = "percent";
				for (const token of filtered) {
					if (isIdentToken(token) && token.value === "fill") {
						fill = true;
						continue;
					}
					if (token.type === 17) {
						values.push(token.number);
						unit = "number";
					} else if (token.type === 16) {
						values.push(token.number);
						unit = "percent";
					}
				}
				const [top, right, bottom, left] = fillSides(values.length > 0 ? values : [100]);
				return {
					top,
					right,
					bottom,
					left,
					fill,
					unit
				};
			}
		};
		const parseRepeatValue = (value) => {
			switch (value) {
				case "repeat": return 1;
				case "round": return 2;
				case "space": return 3;
				default: return 0;
			}
		};
		const borderImageRepeat = {
			name: "border-image-repeat",
			initialValue: "stretch",
			prefix: false,
			type: 1,
			parse: (_context, tokens) => {
				const filtered = tokens.filter(nonWhiteSpace);
				const values = [];
				for (const token of filtered) if (isIdentToken(token)) values.push(parseRepeatValue(token.value));
				const horizontal = values[0] ?? 0;
				return {
					horizontal,
					vertical: values[1] ?? horizontal
				};
			}
		};
		const boxDecorationBreak = {
			name: "box-decoration-break",
			initialValue: "slice",
			prefix: false,
			type: 2,
			parse: (_context, token) => {
				switch (token) {
					case "clone": return 1;
					default: return 0;
				}
			}
		};
		/** Z-axis mask offset used during box-shadow rendering. */
		const SHADOW_MASK_OFFSET = 1e4;
		/**
		* Read-only grouped accessor for border-related CSS properties.
		*
		* Provides structured access: `styles.border.topColor` as an alternative
		* to the flat `styles.borderTopColor`. Both forms remain valid.
		*/
		var BorderStyles = class {
			constructor(styles) {
				this.styles = styles;
			}
			get topColor() {
				return this.styles.borderTopColor;
			}
			get rightColor() {
				return this.styles.borderRightColor;
			}
			get bottomColor() {
				return this.styles.borderBottomColor;
			}
			get leftColor() {
				return this.styles.borderLeftColor;
			}
			get topStyle() {
				return this.styles.borderTopStyle;
			}
			get rightStyle() {
				return this.styles.borderRightStyle;
			}
			get bottomStyle() {
				return this.styles.borderBottomStyle;
			}
			get leftStyle() {
				return this.styles.borderLeftStyle;
			}
			get topWidth() {
				return this.styles.borderTopWidth;
			}
			get rightWidth() {
				return this.styles.borderRightWidth;
			}
			get bottomWidth() {
				return this.styles.borderBottomWidth;
			}
			get leftWidth() {
				return this.styles.borderLeftWidth;
			}
			get topLeftRadius() {
				return this.styles.borderTopLeftRadius;
			}
			get topRightRadius() {
				return this.styles.borderTopRightRadius;
			}
			get bottomRightRadius() {
				return this.styles.borderBottomRightRadius;
			}
			get bottomLeftRadius() {
				return this.styles.borderBottomLeftRadius;
			}
			get imageSource() {
				return this.styles.borderImageSource;
			}
			get imageSlice() {
				return this.styles.borderImageSlice;
			}
			get imageRepeat() {
				return this.styles.borderImageRepeat;
			}
			get boxShadow() {
				return this.styles.boxShadow;
			}
		};
		/**
		* Read-only grouped accessor for background-related CSS properties.
		*/
		var BackgroundStyles = class {
			constructor(styles) {
				this.styles = styles;
			}
			get color() {
				return this.styles.backgroundColor;
			}
			get image() {
				return this.styles.backgroundImage;
			}
			get clip() {
				return this.styles.backgroundClip;
			}
			get origin() {
				return this.styles.backgroundOrigin;
			}
			get position() {
				return this.styles.backgroundPosition;
			}
			get repeat() {
				return this.styles.backgroundRepeat;
			}
			get size() {
				return this.styles.backgroundSize;
			}
			get blendMode() {
				return this.styles.backgroundBlendMode;
			}
		};
		/**
		* Read-only grouped accessor for font/text-related CSS properties.
		*/
		var FontStyles = class {
			constructor(styles) {
				this.styles = styles;
			}
			get family() {
				return this.styles.fontFamily;
			}
			get size() {
				return this.styles.fontSize;
			}
			get style() {
				return this.styles.fontStyle;
			}
			get variant() {
				return this.styles.fontVariant;
			}
			get weight() {
				return this.styles.fontWeight;
			}
			get ligatures() {
				return this.styles.fontVariantLigatures;
			}
			get color() {
				return this.styles.color;
			}
			get letterSpacing() {
				return this.styles.letterSpacing;
			}
			get lineHeight() {
				return this.styles.lineHeight;
			}
			get textAlign() {
				return this.styles.textAlign;
			}
			get textTransform() {
				return this.styles.textTransform;
			}
			get textOverflow() {
				return this.styles.textOverflow;
			}
			get textShadow() {
				return this.styles.textShadow;
			}
			get textDecorationColor() {
				return this.styles.textDecorationColor;
			}
			get textDecorationLine() {
				return this.styles.textDecorationLine;
			}
			get textDecorationStyle() {
				return this.styles.textDecorationStyle;
			}
			get textDecorationThickness() {
				return this.styles.textDecorationThickness;
			}
			get textUnderlineOffset() {
				return this.styles.textUnderlineOffset;
			}
			get wordBreak() {
				return this.styles.wordBreak;
			}
			get lineBreak() {
				return this.styles.lineBreak;
			}
			get overflowWrap() {
				return this.styles.overflowWrap;
			}
			get writingMode() {
				return this.styles.writingMode;
			}
			get direction() {
				return this.styles.direction;
			}
			get webkitTextStrokeColor() {
				return this.styles.webkitTextStrokeColor;
			}
			get webkitTextStrokeWidth() {
				return this.styles.webkitTextStrokeWidth;
			}
			get webkitLineClamp() {
				return this.styles.webkitLineClamp;
			}
			get paintOrder() {
				return this.styles.paintOrder;
			}
		};
		/**
		* Read-only grouped accessor for layout/display/positioning CSS properties.
		*/
		var LayoutStyles = class {
			constructor(styles) {
				this.styles = styles;
			}
			get display() {
				return this.styles.display;
			}
			get position() {
				return this.styles.position;
			}
			get float() {
				return this.styles.float;
			}
			get zIndex() {
				return this.styles.zIndex;
			}
			get marginTop() {
				return this.styles.marginTop;
			}
			get marginRight() {
				return this.styles.marginRight;
			}
			get marginBottom() {
				return this.styles.marginBottom;
			}
			get marginLeft() {
				return this.styles.marginLeft;
			}
			get paddingTop() {
				return this.styles.paddingTop;
			}
			get paddingRight() {
				return this.styles.paddingRight;
			}
			get paddingBottom() {
				return this.styles.paddingBottom;
			}
			get paddingLeft() {
				return this.styles.paddingLeft;
			}
			get overflowX() {
				return this.styles.overflowX;
			}
			get overflowY() {
				return this.styles.overflowY;
			}
			get opacity() {
				return this.styles.opacity;
			}
			get visibility() {
				return this.styles.visibility;
			}
			get transform() {
				return this.styles.transform;
			}
			get transformOrigin() {
				return this.styles.transformOrigin;
			}
			get rotate() {
				return this.styles.rotate;
			}
			get zoom() {
				return this.styles.zoom;
			}
			get clipPath() {
				return this.styles.clipPath;
			}
			get mixBlendMode() {
				return this.styles.mixBlendMode;
			}
			get filter() {
				return this.styles.filter;
			}
			get imageRendering() {
				return this.styles.imageRendering;
			}
			get objectFit() {
				return this.styles.objectFit;
			}
			get objectPosition() {
				return this.styles.objectPosition;
			}
			get boxDecorationBreak() {
				return this.styles.boxDecorationBreak;
			}
			get listStyleImage() {
				return this.styles.listStyleImage;
			}
			get listStylePosition() {
				return this.styles.listStylePosition;
			}
			get listStyleType() {
				return this.styles.listStyleType;
			}
			get animationDuration() {
				return this.styles.animationDuration;
			}
			isVisible() {
				return this.styles.isVisible();
			}
			isTransparent() {
				return this.styles.isTransparent();
			}
			isTransformed() {
				return this.styles.isTransformed();
			}
			isPositioned() {
				return this.styles.isPositioned();
			}
			isPositionedWithZIndex() {
				return this.styles.isPositionedWithZIndex();
			}
			isFloating() {
				return this.styles.isFloating();
			}
			isInlineLevel() {
				return this.styles.isInlineLevel();
			}
		};
		var CSSParsedDeclaration = class CSSParsedDeclaration {
			get border() {
				return this._border ?? (this._border = new BorderStyles(this));
			}
			get background() {
				return this._background ?? (this._background = new BackgroundStyles(this));
			}
			get font() {
				return this._font ?? (this._font = new FontStyles(this));
			}
			get layout() {
				return this._layout ?? (this._layout = new LayoutStyles(this));
			}
			static {
				this.standardProps = [
					[
						"animationDuration",
						duration,
						"animationDuration"
					],
					[
						"backgroundClip",
						backgroundClip,
						"backgroundClip"
					],
					[
						"backgroundColor",
						backgroundColor,
						"backgroundColor"
					],
					[
						"backgroundImage",
						backgroundImage,
						"backgroundImage"
					],
					[
						"backgroundOrigin",
						backgroundOrigin,
						"backgroundOrigin"
					],
					[
						"backgroundPosition",
						backgroundPosition,
						"backgroundPosition"
					],
					[
						"backgroundRepeat",
						backgroundRepeat,
						"backgroundRepeat"
					],
					[
						"backgroundSize",
						backgroundSize,
						"backgroundSize"
					],
					[
						"borderTopColor",
						borderTopColor,
						"borderTopColor"
					],
					[
						"borderRightColor",
						borderRightColor,
						"borderRightColor"
					],
					[
						"borderBottomColor",
						borderBottomColor,
						"borderBottomColor"
					],
					[
						"borderLeftColor",
						borderLeftColor,
						"borderLeftColor"
					],
					[
						"borderTopLeftRadius",
						borderTopLeftRadius,
						"borderTopLeftRadius"
					],
					[
						"borderTopRightRadius",
						borderTopRightRadius,
						"borderTopRightRadius"
					],
					[
						"borderBottomRightRadius",
						borderBottomRightRadius,
						"borderBottomRightRadius"
					],
					[
						"borderBottomLeftRadius",
						borderBottomLeftRadius,
						"borderBottomLeftRadius"
					],
					[
						"borderTopStyle",
						borderTopStyle,
						"borderTopStyle"
					],
					[
						"borderRightStyle",
						borderRightStyle,
						"borderRightStyle"
					],
					[
						"borderBottomStyle",
						borderBottomStyle,
						"borderBottomStyle"
					],
					[
						"borderLeftStyle",
						borderLeftStyle,
						"borderLeftStyle"
					],
					[
						"borderTopWidth",
						borderTopWidth,
						"borderTopWidth"
					],
					[
						"borderRightWidth",
						borderRightWidth,
						"borderRightWidth"
					],
					[
						"borderBottomWidth",
						borderBottomWidth,
						"borderBottomWidth"
					],
					[
						"borderLeftWidth",
						borderLeftWidth,
						"borderLeftWidth"
					],
					[
						"boxShadow",
						boxShadow,
						"boxShadow"
					],
					[
						"clipPath",
						clipPath,
						"clipPath"
					],
					[
						"color",
						color,
						"color"
					],
					[
						"direction",
						direction,
						"direction"
					],
					[
						"display",
						display,
						"display"
					],
					[
						"fontFamily",
						fontFamily,
						"fontFamily"
					],
					[
						"fontSize",
						fontSize,
						"fontSize"
					],
					[
						"fontStyle",
						fontStyle,
						"fontStyle"
					],
					[
						"fontVariant",
						fontVariant,
						"fontVariant"
					],
					[
						"fontWeight",
						fontWeight,
						"fontWeight"
					],
					[
						"letterSpacing",
						letterSpacing,
						"letterSpacing"
					],
					[
						"lineBreak",
						lineBreak,
						"lineBreak"
					],
					[
						"lineHeight",
						lineHeight,
						"lineHeight"
					],
					[
						"listStyleImage",
						listStyleImage,
						"listStyleImage"
					],
					[
						"listStylePosition",
						listStylePosition,
						"listStylePosition"
					],
					[
						"listStyleType",
						listStyleType,
						"listStyleType"
					],
					[
						"marginTop",
						marginTop,
						"marginTop"
					],
					[
						"marginRight",
						marginRight,
						"marginRight"
					],
					[
						"marginBottom",
						marginBottom,
						"marginBottom"
					],
					[
						"marginLeft",
						marginLeft,
						"marginLeft"
					],
					[
						"opacity",
						opacity,
						"opacity"
					],
					[
						"overflowWrap",
						overflowWrap,
						"overflowWrap"
					],
					[
						"paddingTop",
						paddingTop,
						"paddingTop"
					],
					[
						"paddingRight",
						paddingRight,
						"paddingRight"
					],
					[
						"paddingBottom",
						paddingBottom,
						"paddingBottom"
					],
					[
						"paddingLeft",
						paddingLeft,
						"paddingLeft"
					],
					[
						"paintOrder",
						paintOrder,
						"paintOrder"
					],
					[
						"position",
						position,
						"position"
					],
					[
						"textAlign",
						textAlign,
						"textAlign"
					],
					[
						"textDecorationStyle",
						textDecorationStyle,
						"textDecorationStyle"
					],
					[
						"textDecorationThickness",
						textDecorationThickness,
						"textDecorationThickness"
					],
					[
						"textUnderlineOffset",
						textUnderlineOffset,
						"textUnderlineOffset"
					],
					[
						"textShadow",
						textShadow,
						"textShadow"
					],
					[
						"textTransform",
						textTransform,
						"textTransform"
					],
					[
						"textOverflow",
						textOverflow,
						"textOverflow"
					],
					[
						"transform",
						transform$1,
						"transform"
					],
					[
						"transformOrigin",
						transformOrigin,
						"transformOrigin"
					],
					[
						"rotate",
						rotate,
						"rotate"
					],
					[
						"visibility",
						visibility,
						"visibility"
					],
					[
						"webkitTextStrokeColor",
						webkitTextStrokeColor,
						"webkitTextStrokeColor"
					],
					[
						"webkitTextStrokeWidth",
						webkitTextStrokeWidth,
						"webkitTextStrokeWidth"
					],
					[
						"webkitLineClamp",
						webkitLineClamp,
						"webkitLineClamp"
					],
					[
						"wordBreak",
						wordBreak,
						"wordBreak"
					],
					[
						"whiteSpace",
						whiteSpace,
						"whiteSpace"
					],
					[
						"writingMode",
						writingMode,
						"writingMode"
					],
					[
						"zIndex",
						zIndex,
						"zIndex"
					],
					[
						"objectFit",
						objectFit,
						"objectFit"
					],
					[
						"imageRendering",
						imageRendering,
						"imageRendering"
					],
					[
						"mixBlendMode",
						mixBlendMode,
						"mixBlendMode"
					],
					[
						"filter",
						filter,
						"filter"
					],
					[
						"fontVariantLigatures",
						fontVariantLigatures,
						"fontVariantLigatures"
					],
					[
						"zoom",
						zoom,
						"zoom"
					],
					[
						"objectPosition",
						objectPosition,
						"objectPosition"
					],
					[
						"backgroundBlendMode",
						backgroundBlendMode,
						"backgroundBlendMode"
					],
					[
						"borderImageSource",
						borderImageSource,
						"borderImageSource"
					],
					[
						"borderImageSlice",
						borderImageSlice,
						"borderImageSlice"
					],
					[
						"borderImageRepeat",
						borderImageRepeat,
						"borderImageRepeat"
					],
					[
						"boxDecorationBreak",
						boxDecorationBreak,
						"boxDecorationBreak"
					]
				];
			}
			constructor(context, declaration) {
				const standardProps = CSSParsedDeclaration.standardProps;
				if (declaration.display === "none") {
					this.display = 0;
					for (const [key, descriptor] of standardProps) if (key !== "display") this[key] = parse(context, descriptor, void 0);
					this.float = parse(context, float, void 0);
					this.textDecorationColor = parse(context, textDecorationColor, void 0);
					this.textDecorationLine = parse(context, textDecorationLine, void 0);
					const overflowTuple = parse(context, overflow, void 0);
					this.overflowX = overflowTuple[0];
					this.overflowY = overflowTuple[overflowTuple.length > 1 ? 1 : 0];
					return;
				}
				for (const [key, descriptor, cssProp] of standardProps) this[key] = parse(context, descriptor, declaration[cssProp]);
				this.float = parse(context, float, declaration.cssFloat);
				this.textDecorationColor = parse(context, textDecorationColor, declaration.textDecorationColor ?? declaration.color);
				this.textDecorationLine = parse(context, textDecorationLine, declaration.textDecorationLine ?? declaration.textDecoration);
				const overflowTuple = parse(context, overflow, declaration.overflow);
				this.overflowX = overflowTuple[0];
				this.overflowY = overflowTuple[overflowTuple.length > 1 ? 1 : 0];
			}
			isVisible() {
				return this.display > 0 && this.opacity > 0 && this.visibility === 0;
			}
			isTransparent() {
				return isTransparent(this.backgroundColor);
			}
			isTransformed() {
				return this.transform !== null || this.rotate !== null;
			}
			isPositioned() {
				return this.position !== 0;
			}
			isPositionedWithZIndex() {
				return this.isPositioned() && !this.zIndex.auto;
			}
			isFloating() {
				return this.float !== 0;
			}
			isInlineLevel() {
				return contains(this.display, 4) || contains(this.display, 33554432) || contains(this.display, 268435456) || contains(this.display, 536870912) || contains(this.display, 67108864) || contains(this.display, 134217728);
			}
		};
		var CSSParsedPseudoDeclaration = class {
			constructor(context, declaration) {
				this.content = parse(context, content, declaration.content);
				this.quotes = parse(context, quotes, declaration.quotes);
			}
		};
		var CSSParsedCounterDeclaration = class {
			constructor(context, declaration) {
				this.counterIncrement = parse(context, counterIncrement, declaration.counterIncrement);
				this.counterReset = parse(context, counterReset, declaration.counterReset);
			}
		};
		const parseCache = /* @__PURE__ */ new Map();
		const parse = (context, descriptor, style) => {
			let rawValue = style !== null && typeof style !== "undefined" ? style.toString() : descriptor.initialValue;
			if (rawValue.trim() === "") rawValue = descriptor.initialValue;
			let valueCache = parseCache.get(descriptor);
			if (valueCache) {
				const cached = valueCache.get(rawValue);
				if (cached !== void 0) {
					valueCache.delete(rawValue);
					valueCache.set(rawValue, cached);
					return cached;
				}
			}
			const tokenizer = Tokenizer.get();
			tokenizer.write(rawValue);
			const parser = new Parser(tokenizer.read());
			Tokenizer.release(tokenizer);
			const result = (() => {
				switch (descriptor.type) {
					case 2: {
						const token = parser.parseComponentValue();
						return descriptor.parse(context, isIdentToken(token) ? token.value : descriptor.initialValue);
					}
					case 0: return descriptor.parse(context, parser.parseComponentValue());
					case 1: return descriptor.parse(context, parser.parseComponentValues());
					case 4: return parser.parseComponentValue();
					case 3: switch (descriptor.format) {
						case "angle": return angle.parse(context, parser.parseComponentValue());
						case "color": return color$1.parse(context, parser.parseComponentValue());
						case "image": return image.parse(context, parser.parseComponentValue());
						case "length": {
							const length = parser.parseComponentValue();
							return isLength(length) ? length : ZERO_LENGTH;
						}
						case "length-percentage": {
							const value = parser.parseComponentValue();
							return isLengthPercentage(value) ? value : ZERO_LENGTH;
						}
						case "time": return time.parse(context, parser.parseComponentValue());
					}
				}
			})();
			if (!valueCache) {
				valueCache = /* @__PURE__ */ new Map();
				parseCache.set(descriptor, valueCache);
			}
			if (!(descriptor.skipCache || descriptor.type === 3 && descriptor.format === "image")) {
				if (valueCache.size >= 200) {
					const oldestKey = valueCache.keys().next().value;
					valueCache.delete(oldestKey);
				}
				valueCache.set(rawValue, result);
			}
			return result;
		};
		const elementDebuggerAttribute = "data-html2canvas-debug";
		const getElementDebugType = (element) => {
			if (typeof element.getAttribute !== "function") return 0;
			switch (element.getAttribute(elementDebuggerAttribute)) {
				case "all": return 1;
				case "clone": return 2;
				case "parse": return 3;
				case "render": return 4;
				default: return 0;
			}
		};
		const isDebugging = (element, type) => {
			const elementType = getElementDebugType(element);
			return elementType === 1 || type === elementType;
		};
		/** Exported for reuse in document-cloner.ts */
		const IGNORE_ATTRIBUTE = "data-html2canvas-ignore";
		/**
		* Handles shadow DOM child cloning, slot assignment, and light DOM traversal.
		* Extracted from DocumentCloner to reduce file size and improve separation of concerns.
		*/
		var SlotCloner = class {
			constructor(cloneNodeFn, options, context) {
				this.cloneNodeFn = cloneNodeFn;
				this.options = options;
				this.context = context;
			}
			appendChildNode(clone, child, copyStyles) {
				this.safeAppendClonedChild(clone, child, copyStyles);
			}
			/**
			* Clone child nodes from source element to clone element.
			* Handles shadow DOM, slots, and light DOM appropriately.
			*/
			cloneChildNodes(node, clone, copyStyles) {
				if (node.shadowRoot && clone.shadowRoot) {
					this.cloneShadowDOMChildren(node.shadowRoot, clone.shadowRoot, copyStyles);
					this.cloneLightDOMChildren(node, clone, copyStyles);
				} else if (node.shadowRoot && !clone.shadowRoot) this.cloneShadowDOMAsLightDOM(node.shadowRoot, clone, copyStyles);
				else this.cloneLightDOMChildren(node, clone, copyStyles);
			}
			/**
			* Check if a child node should be cloned based on filtering rules.
			* Filters out: scripts, ignored elements, and optionally styles.
			*/
			shouldCloneChild(child) {
				return !isElementNode(child) || !isScriptElement(child) && !child.hasAttribute("data-html2canvas-ignore") && (typeof this.options.ignoreElements !== "function" || !this.options.ignoreElements(child));
			}
			/**
			* Check if a style element should be cloned based on copyStyles option.
			*/
			shouldCloneStyleElement(child) {
				return !this.options.copyStyles || !isElementNode(child) || !isStyleElement(child);
			}
			/**
			* Safely append a cloned child to a target, applying all filtering rules.
			*/
			safeAppendClonedChild(target, child, copyStyles) {
				if (this.shouldCloneChild(child) && this.shouldCloneStyleElement(child)) target.appendChild(this.cloneNodeFn(child, copyStyles));
			}
			/**
			* Clone assigned nodes from a slot element to the target.
			*/
			cloneAssignedNodes(assignedNodes, target, copyStyles) {
				assignedNodes.forEach((node) => {
					this.safeAppendClonedChild(target, node, copyStyles);
				});
			}
			/**
			* Clone fallback content from a slot element when no nodes are assigned.
			*/
			cloneSlotFallbackContent(slot, target, copyStyles) {
				for (let child = slot.firstChild; child; child = child.nextSibling) this.safeAppendClonedChild(target, child, copyStyles);
			}
			/**
			* Handle cloning of a slot element, including assigned nodes or fallback content.
			*/
			cloneSlotElement(slot, targetShadowRoot, copyStyles) {
				if (!isSlotElement(slot)) return;
				const slotElement = slot;
				if (typeof slotElement.assignedNodes !== "function") {
					this.context.logger.warn("HTMLSlotElement.assignedNodes is not available", slot);
					this.cloneSlotFallbackContent(slot, targetShadowRoot, copyStyles);
					return;
				}
				const assignedNodes = slotElement.assignedNodes();
				if (!assignedNodes || !Array.isArray(assignedNodes)) {
					this.context.logger.warn("assignedNodes() did not return a valid array", slot);
					this.cloneSlotFallbackContent(slot, targetShadowRoot, copyStyles);
					return;
				}
				if (assignedNodes.length > 0) this.cloneAssignedNodes(assignedNodes, targetShadowRoot, copyStyles);
				else this.cloneSlotFallbackContent(slot, targetShadowRoot, copyStyles);
			}
			/**
			* Clone shadow DOM children to the target shadow root.
			*/
			cloneShadowDOMChildren(shadowRoot, targetShadowRoot, copyStyles) {
				for (let child = shadowRoot.firstChild; child; child = child.nextSibling) if (isElementNode(child) && isSlotElement(child)) this.cloneSlotElement(child, targetShadowRoot, copyStyles);
				else this.safeAppendClonedChild(targetShadowRoot, child, copyStyles);
			}
			/**
			* Clone light DOM children to the target element.
			*/
			cloneLightDOMChildren(node, clone, copyStyles) {
				for (let child = node.firstChild; child; child = child.nextSibling) this.appendChildNode(clone, child, copyStyles);
			}
			/**
			* Clone slot element as light DOM when shadow root creation failed.
			*/
			cloneSlotElementAsLightDOM(slot, clone, copyStyles) {
				if (!isSlotElement(slot)) return;
				const slotElement = slot;
				if (typeof slotElement.assignedNodes !== "function") {
					for (let child = slot.firstChild; child; child = child.nextSibling) this.appendChildNode(clone, child, copyStyles);
					return;
				}
				const assignedNodes = slotElement.assignedNodes();
				if (assignedNodes && Array.isArray(assignedNodes) && assignedNodes.length > 0) assignedNodes.forEach((node) => this.appendChildNode(clone, node, copyStyles));
				else for (let child = slot.firstChild; child; child = child.nextSibling) this.appendChildNode(clone, child, copyStyles);
			}
			/**
			* Clone shadow DOM content as light DOM when shadow root creation failed.
			* This is a fallback mechanism to ensure content is not lost.
			*/
			cloneShadowDOMAsLightDOM(shadowRoot, clone, copyStyles) {
				for (let child = shadowRoot.firstChild; child; child = child.nextSibling) if (isElementNode(child) && isSlotElement(child)) this.cloneSlotElementAsLightDOM(child, clone, copyStyles);
				else this.appendChildNode(clone, child, copyStyles);
			}
		};
		/**
		* Find the parent ShadowRoot of an element, if any
		* @param element - The element to check
		* @returns The parent ShadowRoot or null
		*/
		const findParentShadowRoot = (element) => {
			let current = element;
			while (current) {
				if (current.parentNode && current.parentNode.host) return current.parentNode;
				const root = current.getRootNode();
				if (root && root !== current.ownerDocument && root.host) return root;
				current = current.parentNode;
			}
			return null;
		};
		var DocumentCloner = class {
			constructor(context, element, options) {
				this.context = context;
				this.options = options;
				this.scrolledElements = [];
				this.referenceElement = element;
				this.counters = new CounterState();
				this.quoteDepth = 0;
				this.slotCloner = new SlotCloner((node, copyStyles) => this.cloneNode(node, copyStyles), {
					ignoreElements: options.ignoreElements,
					copyStyles: options.copyStyles ?? true
				}, context);
				if (!element.ownerDocument) throw new Error("Cloned element does not have an owner document");
				if (!this.options.iframeContainer) {
					const shadowRoot = findParentShadowRoot(element);
					if (shadowRoot) this.options.iframeContainer = shadowRoot;
				}
				this.documentElement = this.cloneNode(element.ownerDocument.documentElement, false);
			}
			toIFrame(ownerDocument, windowSize) {
				const iframe = createIFrameContainer(ownerDocument, windowSize, this.options.iframeContainer);
				if (!iframe.contentWindow) throw new Error("Unable to find iframe window");
				const scrollX = ownerDocument.defaultView.pageXOffset;
				const scrollY = ownerDocument.defaultView.pageYOffset;
				const cloneWindow = iframe.contentWindow;
				const documentClone = cloneWindow.document;
				const iframeLoad = iframeLoader(iframe).then(async () => {
					this.scrolledElements.forEach(restoreNodeScroll);
					if (cloneWindow) {
						cloneWindow.scrollTo(windowSize.left, windowSize.top);
						if (/AppleWebKit/g.test(navigator.userAgent) && (cloneWindow.scrollY !== windowSize.top || cloneWindow.scrollX !== windowSize.left)) {
							this.context.logger.warn("Unable to restore scroll position for cloned document");
							this.context.windowBounds = this.context.windowBounds.add(cloneWindow.scrollX - windowSize.left, cloneWindow.scrollY - windowSize.top, 0, 0);
						}
					}
					const onclone = this.options.onclone;
					const referenceElement = this.clonedReferenceElement;
					if (typeof referenceElement === "undefined") throw new Error(`Error finding the ${this.referenceElement.nodeName} in the cloned document`);
					if (documentClone.fonts && documentClone.fonts.ready) await documentClone.fonts.ready;
					if (/(AppleWebKit)/g.test(navigator.userAgent)) await imagesReady(documentClone);
					if (typeof onclone === "function") return Promise.resolve().then(() => onclone(documentClone, referenceElement)).then(() => iframe);
					return iframe;
				});
				/**
				* The base URI used for resolving relative URLs (e.g. background-image) in the clone.
				* Must come from the source document: the iframe document is about:blank, so
				* documentClone.baseURI would break getComputedStyle() for relative background URLs.
				*/
				const baseUri = ownerDocument.baseURI;
				documentClone.open();
				const rawHTML = serializeDoctype(document.doctype) + "<html></html>";
				try {
					const ownerWindow = this.referenceElement.ownerDocument?.defaultView;
					const trustedTypesFactory = ownerWindow && ownerWindow.trustedTypes;
					let policy = trustedTypesFactory?.getPolicy?.("html2canvas-pro");
					if (!policy && trustedTypesFactory) policy = trustedTypesFactory.createPolicy("html2canvas-pro", { createHTML: (s) => s });
					const html = policy ? policy.createHTML(rawHTML) : rawHTML;
					documentClone.write(html);
				} catch (_e) {
					documentClone.write(rawHTML);
				}
				restoreOwnerScroll(this.referenceElement.ownerDocument, scrollX, scrollY);
				/**
				* IMPORTANT: documentClone.close() MUST be called BEFORE adoptNode().
				*
				* In Chrome, calling adoptNode() while the document is still "open"
				* (between document.open() and document.close()) causes CSS rules with
				* uppercase characters in class names (e.g. ".MyClass") to not match
				* correctly. Chrome's CSS engine only enters a fully-resolved matching
				* mode once the document is closed.
				*
				* Correct order: open() → write() → close() → adoptNode() → replaceChild()
				*
				* Timing: close() queues the iframe 'load' event; because JS is single-threaded,
				* the synchronous adoptNode() and replaceChild() below complete before that
				* event is dispatched. iframeLoader's setInterval will therefore see the body
				* already populated on its first tick.
				*/
				documentClone.close();
				const adoptedNode = documentClone.adoptNode(this.documentElement);
				addBase(adoptedNode, baseUri);
				documentClone.replaceChild(adoptedNode, documentClone.documentElement);
				return iframeLoad;
			}
			createElementClone(node) {
				if (isDebugging(node, 2)) debugger;
				if (isCanvasElement(node)) return this.createCanvasClone(node);
				if (isVideoElement(node)) return this.createVideoClone(node);
				if (isStyleElement(node)) return this.createStyleClone(node);
				const clone = node.cloneNode(false);
				if (isImageElement(clone)) {
					if (isImageElement(node) && node.currentSrc && node.currentSrc !== node.src) {
						clone.src = node.currentSrc;
						clone.srcset = "";
					}
					if (clone.loading === "lazy") clone.loading = "eager";
				}
				if (isCustomElement(clone) && !isSVGElementNode(clone)) return this.createCustomElementClone(node, clone);
				return clone;
			}
			createCustomElementClone(originalNode, clonedNode) {
				const clone = document.createElement("div");
				clone.className = clonedNode.className;
				copyCSSStyles(clonedNode.style, clone);
				const attributes = clonedNode.attributes;
				for (let i = 0; i < attributes.length; i++) {
					const attr = attributes[i];
					if (attr.name !== "class" && attr.name !== "style") clone.setAttribute(attr.name, attr.value);
				}
				if (originalNode.shadowRoot) try {
					clone.attachShadow({ mode: "open" });
				} catch (e) {
					this.context.logger.error("Failed to attach shadow root to custom element clone:", e);
				}
				return clone;
			}
			createStyleClone(node) {
				try {
					const sheet = node.sheet;
					if (sheet && sheet.cssRules) {
						const css = [].slice.call(sheet.cssRules, 0).reduce((css, rule) => {
							if (rule && typeof rule.cssText === "string") return css + rule.cssText;
							return css;
						}, "");
						const style = node.cloneNode(false);
						style.textContent = css;
						if (this.options.cspNonce) style.nonce = this.options.cspNonce;
						return style;
					}
				} catch (e) {
					this.context.logger.error("Unable to access cssRules property", e);
					if (e.name !== "SecurityError") throw e;
				}
				const cloned = node.cloneNode(false);
				if (this.options.cspNonce) cloned.nonce = this.options.cspNonce;
				return cloned;
			}
			createCanvasClone(canvas) {
				if (this.options.inlineImages && canvas.ownerDocument) {
					const img = canvas.ownerDocument.createElement("img");
					try {
						img.src = canvas.toDataURL();
						return img;
					} catch (e) {
						this.context.logger.info(`Unable to inline canvas contents, canvas is tainted`, canvas);
					}
				}
				const clonedCanvas = canvas.cloneNode(false);
				try {
					clonedCanvas.width = canvas.width;
					clonedCanvas.height = canvas.height;
					const ctx = canvas.getContext("2d");
					const clonedCtx = clonedCanvas.getContext("2d", { willReadFrequently: true });
					if (clonedCtx) if (!this.options.allowTaint && ctx) clonedCtx.putImageData(ctx.getImageData(0, 0, canvas.width, canvas.height), 0, 0);
					else {
						const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
						if (gl) {
							if (gl.getContextAttributes()?.preserveDrawingBuffer === false) this.context.logger.warn("Unable to clone WebGL context as it has preserveDrawingBuffer=false", canvas);
						}
						clonedCtx.drawImage(canvas, 0, 0);
					}
					return clonedCanvas;
				} catch (e) {
					this.context.logger.info(`Unable to clone canvas as it is tainted`, canvas);
				}
				return clonedCanvas;
			}
			createVideoClone(video) {
				const canvas = video.ownerDocument.createElement("canvas");
				canvas.width = video.offsetWidth;
				canvas.height = video.offsetHeight;
				const ctx = canvas.getContext("2d");
				try {
					if (ctx) {
						ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
						if (!this.options.allowTaint) ctx.getImageData(0, 0, canvas.width, canvas.height);
					}
					return canvas;
				} catch (e) {
					this.context.logger.info(`Unable to clone video as it is tainted`, video);
				}
				const blankCanvas = video.ownerDocument.createElement("canvas");
				blankCanvas.width = video.offsetWidth;
				blankCanvas.height = video.offsetHeight;
				return blankCanvas;
			}
			appendChildNode(clone, child, copyStyles) {
				this.slotCloner.appendChildNode(clone, child, copyStyles);
			}
			/**
			* Clone child nodes from source element to clone element.
			* Delegates to SlotCloner which handles shadow DOM, slots, and light DOM.
			*/
			cloneChildNodes(node, clone, copyStyles) {
				this.slotCloner.cloneChildNodes(node, clone, copyStyles);
			}
			cloneNode(node, copyStyles) {
				if (isTextNode(node)) return document.createTextNode(node.data);
				if (!node.ownerDocument) return node.cloneNode(false);
				const window = node.ownerDocument.defaultView;
				if (window && isElementNode(node) && (isHTMLElementNode(node) || isSVGElementNode(node))) {
					const clone = this.createElementClone(node);
					clone.style.transitionProperty = "none";
					const style = window.getComputedStyle(node);
					const checkPseudoElements = canHavePseudoElements(node);
					if (this.referenceElement === node && isHTMLElementNode(clone)) this.clonedReferenceElement = clone;
					if (isBodyElement(clone)) createPseudoHideStyles(clone, this.options.cspNonce);
					const counters = this.counters.parse(new CSSParsedCounterDeclaration(this.context, style));
					if (checkPseudoElements) {
						const styleBefore = window.getComputedStyle(node, ":before");
						const before = this.resolvePseudoContent(node, clone, styleBefore, 0);
						if (before) clone.insertBefore(before, clone.firstChild);
						const styleAfter = window.getComputedStyle(node, ":after");
						const after = this.resolvePseudoContent(node, clone, styleAfter, 1);
						if (after) clone.appendChild(after);
					}
					if (isCustomElement(node)) copyStyles = true;
					if (!isVideoElement(node)) this.cloneChildNodes(node, clone, copyStyles);
					this.counters.pop(counters);
					if (style && (this.options.copyStyles || isSVGElementNode(node)) && !isIFrameElement(node) || copyStyles) copyCSSStyles(style, clone);
					if (node.scrollTop !== 0 || node.scrollLeft !== 0) this.scrolledElements.push([
						clone,
						node.scrollLeft,
						node.scrollTop
					]);
					if ((isTextareaElement(node) || isSelectElement(node)) && (isTextareaElement(clone) || isSelectElement(clone))) clone.value = node.value;
					return clone;
				}
				return node.cloneNode(false);
			}
			resolvePseudoContent(node, clone, style, pseudoElt) {
				if (!style) return;
				const value = style.content;
				const document = clone.ownerDocument;
				if (!document || !value || value === "none" || value === "-moz-alt-content" || style.display === "none") return;
				this.counters.parse(new CSSParsedCounterDeclaration(this.context, style));
				const declaration = new CSSParsedPseudoDeclaration(this.context, style);
				const anonymousReplacedElement = document.createElement("html2canvaspseudoelement");
				copyCSSStyles(style, anonymousReplacedElement);
				declaration.content.forEach((token) => {
					if (token.type === 0) anonymousReplacedElement.appendChild(document.createTextNode(token.value));
					else if (token.type === 22) {
						const img = document.createElement("img");
						img.src = token.value;
						img.style.opacity = "1";
						anonymousReplacedElement.appendChild(img);
					} else if (token.type === 18) {
						if (token.name === "attr") {
							const attr = token.values.filter(isIdentToken);
							if (attr.length) anonymousReplacedElement.appendChild(document.createTextNode(node.getAttribute(attr[0].value) || ""));
						} else if (token.name === "counter") {
							const [counter, counterStyle] = token.values.filter(nonFunctionArgSeparator);
							if (counter && isIdentToken(counter)) {
								const counterState = this.counters.getCounterValue(counter.value);
								const counterType = counterStyle && isIdentToken(counterStyle) ? listStyleType.parse(this.context, counterStyle.value) : 3;
								anonymousReplacedElement.appendChild(document.createTextNode(createCounterText(counterState, counterType, false)));
							}
						} else if (token.name === "counters") {
							const [counter, delim, counterStyle] = token.values.filter(nonFunctionArgSeparator);
							if (counter && isIdentToken(counter)) {
								const counterStates = this.counters.getCounterValues(counter.value);
								const counterType = counterStyle && isIdentToken(counterStyle) ? listStyleType.parse(this.context, counterStyle.value) : 3;
								const separator = delim && delim.type === 0 ? delim.value : "";
								const text = counterStates.map((value) => createCounterText(value, counterType, false)).join(separator);
								anonymousReplacedElement.appendChild(document.createTextNode(text));
							}
						}
					} else if (token.type === 20) switch (token.value) {
						case "open-quote":
							anonymousReplacedElement.appendChild(document.createTextNode(getQuote(declaration.quotes, this.quoteDepth++, true)));
							break;
						case "close-quote":
							anonymousReplacedElement.appendChild(document.createTextNode(getQuote(declaration.quotes, --this.quoteDepth, false)));
							break;
						default: anonymousReplacedElement.appendChild(document.createTextNode(token.value));
					}
				});
				anonymousReplacedElement.className = `${PSEUDO_HIDE_ELEMENT_CLASS_BEFORE} ${PSEUDO_HIDE_ELEMENT_CLASS_AFTER}`;
				const newClassName = pseudoElt === 0 ? ` ${PSEUDO_HIDE_ELEMENT_CLASS_BEFORE}` : ` ${PSEUDO_HIDE_ELEMENT_CLASS_AFTER}`;
				if (isSVGElementNode(clone)) clone.className.baseValue += newClassName;
				else clone.className += newClassName;
				return anonymousReplacedElement;
			}
			static destroy(container) {
				if (container.parentNode) {
					container.parentNode.removeChild(container);
					return true;
				}
				return false;
			}
		};
		const createIFrameContainer = (ownerDocument, bounds, customContainer) => {
			const cloneIframeContainer = ownerDocument.createElement("iframe");
			cloneIframeContainer.className = "html2canvas-container";
			cloneIframeContainer.style.visibility = "hidden";
			cloneIframeContainer.style.position = "fixed";
			cloneIframeContainer.style.left = "-10000px";
			cloneIframeContainer.style.top = "0px";
			cloneIframeContainer.style.border = "0";
			cloneIframeContainer.width = bounds.width.toString();
			cloneIframeContainer.height = bounds.height.toString();
			cloneIframeContainer.scrolling = "no";
			cloneIframeContainer.setAttribute(IGNORE_ATTRIBUTE, "true");
			(customContainer || ownerDocument.body).appendChild(cloneIframeContainer);
			return cloneIframeContainer;
		};
		const imageReady = (img) => {
			return new Promise((resolve) => {
				if (img.complete) {
					resolve();
					return;
				}
				if (!img.src) {
					resolve();
					return;
				}
				img.onload = resolve;
				img.onerror = resolve;
			});
		};
		const imagesReady = (document) => {
			return Promise.all([].slice.call(document.images, 0).map(imageReady));
		};
		const iframeLoader = (iframe) => {
			return new Promise((resolve, reject) => {
				const cloneWindow = iframe.contentWindow;
				if (!cloneWindow) return reject(`No window assigned for iframe`);
				const documentClone = cloneWindow.document;
				cloneWindow.onload = iframe.onload = () => {
					cloneWindow.onload = iframe.onload = null;
					const MAX_POLL_ATTEMPTS = 600;
					let attempts = 0;
					const interval = setInterval(() => {
						attempts++;
						if (documentClone.body.childNodes.length > 0 && documentClone.readyState === "complete") {
							clearInterval(interval);
							resolve(iframe);
						} else if (attempts >= MAX_POLL_ATTEMPTS) {
							clearInterval(interval);
							resolve(iframe);
						}
					}, 50);
				};
			});
		};
		const ignoredStyleProperties = [
			"all",
			"d",
			"content"
		];
		const copyCSSStyles = (style, target) => {
			const parts = [];
			for (let i = style.length - 1; i >= 0; i--) {
				const property = style.item(i);
				if (ignoredStyleProperties.indexOf(property) === -1 && !property.startsWith("--")) {
					const value = style.getPropertyValue(property);
					if (value) {
						const priority = style.getPropertyPriority(property);
						parts.push(priority ? `${property}:${value} !${priority}` : `${property}:${value}`);
					}
				}
			}
			if (parts.length > 0) target.style.cssText = parts.join(";") + ";";
			return target;
		};
		/**
		* Serialise a document type declaration to an HTML string.
		* @internal – exported for testing only, not part of the public API.
		*/
		const serializeDoctype = (doctype) => {
			let str = "";
			if (doctype) {
				str += "<!DOCTYPE ";
				if (doctype.name) str += doctype.name;
				if (doctype.internalSubset) str += " " + doctype.internalSubset.replace(/"/g, "&quot;").replace(/>/g, "&gt;");
				if (doctype.publicId) {
					str += " PUBLIC \"" + doctype.publicId.replace(/"/g, "&quot;") + "\"";
					if (doctype.systemId) str += " \"" + doctype.systemId.replace(/"/g, "&quot;") + "\"";
				} else if (doctype.systemId) str += " SYSTEM \"" + doctype.systemId.replace(/"/g, "&quot;") + "\"";
				str += ">";
			}
			return str;
		};
		const restoreOwnerScroll = (ownerDocument, x, y) => {
			if (ownerDocument && ownerDocument.defaultView && (x !== ownerDocument.defaultView.pageXOffset || y !== ownerDocument.defaultView.pageYOffset)) ownerDocument.defaultView.scrollTo(x, y);
		};
		const restoreNodeScroll = ([element, x, y]) => {
			element.scrollLeft = x;
			element.scrollTop = y;
		};
		const PSEUDO_BEFORE = ":before";
		const PSEUDO_AFTER = ":after";
		const PSEUDO_HIDE_ELEMENT_CLASS_BEFORE = "___html2canvas___pseudoelement_before";
		const PSEUDO_HIDE_ELEMENT_CLASS_AFTER = "___html2canvas___pseudoelement_after";
		const PSEUDO_HIDE_ELEMENT_STYLE = `{
    content: "" !important;
    display: none !important;
}`;
		const createPseudoHideStyles = (body, cspNonce) => {
			createStyles(body, `.${PSEUDO_HIDE_ELEMENT_CLASS_BEFORE}${PSEUDO_BEFORE}${PSEUDO_HIDE_ELEMENT_STYLE}
         .${PSEUDO_HIDE_ELEMENT_CLASS_AFTER}${PSEUDO_AFTER}${PSEUDO_HIDE_ELEMENT_STYLE}`, cspNonce);
		};
		const createStyles = (body, styles, cspNonce) => {
			const document = body.ownerDocument;
			if (document) {
				const style = document.createElement("style");
				style.textContent = styles;
				if (cspNonce) style.nonce = cspNonce;
				body.appendChild(style);
			}
		};
		const addBase = (targetELement, baseUri) => {
			const baseNode = targetELement.ownerDocument.createElement("base");
			baseNode.href = baseUri;
			const headEle = targetELement.getElementsByTagName("head").item(0);
			headEle?.insertBefore(baseNode, headEle?.firstChild ?? null);
		};
		/**
		* Normalize element styles for accurate rendering
		* This includes disabling animations and neutralizing transforms.
		*/
		var DOMNormalizer = class {
			/**
			* Normalize a single element and return original styles.
			*
			* ## Why we replace transforms with an identity value instead of "none"
			*
			* `getBoundingClientRect()` returns visual (post-transform) coordinates, so we
			* must neutralize any active transform before measuring element bounds.
			*
			* The naive approach of setting `transform: none` (or `rotate: none`) has a
			* critical side-effect: per **CSS Transforms Level 2**, an element whose
			* `transform` is non-none automatically becomes the **containing block** for
			* all of its `position: absolute` *and* `position: fixed` descendants.
			* Setting it to `none` destroys that role, causing children to resolve their
			* percentage dimensions and offsets against an unintended ancestor — which
			* produces completely wrong bounds.
			*
			* Solution: instead of removing the transform, we replace it with a visually
			* inert identity value:
			*
			* - `transform: scale(0.5)` → `transform: translate(0, 0)`
			*   - `translate(0, 0)` is an identity transform (no visual change, no layout shift).
			*   - `getBoundingClientRect()` returns the same layout-space coordinates as
			*     if there were no transform at all.
			*   - Because the value is still non-none, the element **remains a containing
			*     block** for both `position: absolute` and `position: fixed` descendants.
			*
			* - `rotate: 45deg` → `rotate: 0deg`
			*   - `0deg` is the identity rotation; `0deg ≠ none`, so the same containing-
			*     block guarantee holds.
			*
			* @param element - Element to normalize
			* @param styles - Parsed CSS styles
			* @returns Original styles map for restoration
			*/
			static normalizeElement(element, styles) {
				const originalStyles = {};
				if (!isHTMLElementNode(element)) return originalStyles;
				if (styles.animationDuration.some((duration) => duration > 0)) {
					originalStyles.animationDuration = element.style.animationDuration;
					element.style.animationDuration = "0s";
				}
				if (styles.transform !== null) {
					originalStyles.transform = element.style.transform;
					element.style.transform = "translate(0, 0)";
				}
				if (styles.rotate !== null) {
					originalStyles.rotate = element.style.rotate;
					element.style.rotate = "0deg";
					if (originalStyles.transform === void 0) {
						originalStyles.transform = element.style.transform;
						element.style.transform = "translate(0, 0)";
					}
				}
				return originalStyles;
			}
			/**
			* Restore element styles after rendering.
			*
			* @param element - Element to restore
			* @param originalStyles - Original styles to restore
			*/
			static restoreElement(element, originalStyles) {
				if (!isHTMLElementNode(element)) return;
				if (originalStyles.animationDuration !== void 0) element.style.animationDuration = originalStyles.animationDuration;
				if (originalStyles.transform !== void 0) element.style.transform = originalStyles.transform;
				if (originalStyles.rotate !== void 0) element.style.rotate = originalStyles.rotate;
			}
		};
		var ElementContainer = class {
			constructor(context, element, options = {}) {
				this.context = context;
				this.textNodes = [];
				this.elements = [];
				this.createsStackingContext = false;
				this.createsRealStackingContext = false;
				this.isListOwner = false;
				this.debugRender = false;
				if (isDebugging(element, 3)) debugger;
				this.styles = new CSSParsedDeclaration(context, context.config.window.getComputedStyle(element, null));
				if (options.normalizeDom !== false && isHTMLElementNode(element)) {
					this.originalStyles = DOMNormalizer.normalizeElement(element, this.styles);
					this.originalElement = element;
				}
				this.bounds = parseBounds(this.context, element);
				if (element.tagName === "FIELDSET") {
					const legend = element.querySelector(":scope > legend");
					if (legend) {
						const legendBounds = parseBounds(this.context, legend);
						this.legendBounds = legendBounds;
						const borderBoxTop = legendBounds.top + legendBounds.height / 2 - this.styles.borderTopWidth / 2;
						this.bounds = new Bounds(this.bounds.left, borderBoxTop, this.bounds.width, this.bounds.height - (borderBoxTop - this.bounds.top));
					}
				}
				if (isDebugging(element, 4)) this.debugRender = true;
			}
			/**
			* Restore original element styles (if normalized)
			* Call this after rendering is complete to clean up DOM state
			*/
			restore() {
				if (this.originalStyles && this.originalElement) {
					DOMNormalizer.restoreElement(this.originalElement, this.originalStyles);
					this.originalStyles = void 0;
					this.originalElement = void 0;
				}
			}
			/**
			* Recursively restore all elements in the tree
			* Call this on the root container after rendering is complete
			*/
			restoreTree() {
				this.restore();
				for (const child of this.elements) child.restoreTree();
			}
		};
		var base64 = "AAAAAAAAAAAAEA4AGBkAAFAaAAACAAAAAAAIABAAGAAwADgACAAQAAgAEAAIABAACAAQAAgAEAAIABAACAAQAAgAEAAIABAAQABIAEQATAAIABAACAAQAAgAEAAIABAAVABcAAgAEAAIABAACAAQAGAAaABwAHgAgACIAI4AlgAIABAAmwCjAKgAsAC2AL4AvQDFAMoA0gBPAVYBWgEIAAgACACMANoAYgFkAWwBdAF8AX0BhQGNAZUBlgGeAaMBlQGWAasBswF8AbsBwwF0AcsBYwHTAQgA2wG/AOMBdAF8AekB8QF0AfkB+wHiAHQBfAEIAAMC5gQIAAsCEgIIAAgAFgIeAggAIgIpAggAMQI5AkACygEIAAgASAJQAlgCYAIIAAgACAAKBQoFCgUTBRMFGQUrBSsFCAAIAAgACAAIAAgACAAIAAgACABdAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACABoAmgCrwGvAQgAbgJ2AggAHgEIAAgACADnAXsCCAAIAAgAgwIIAAgACAAIAAgACACKAggAkQKZAggAPADJAAgAoQKkAqwCsgK6AsICCADJAggA0AIIAAgACAAIANYC3gIIAAgACAAIAAgACABAAOYCCAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAkASoB+QIEAAgACAA8AEMCCABCBQgACABJBVAFCAAIAAgACAAIAAgACAAIAAgACABTBVoFCAAIAFoFCABfBWUFCAAIAAgACAAIAAgAbQUIAAgACAAIAAgACABzBXsFfQWFBYoFigWKBZEFigWKBYoFmAWfBaYFrgWxBbkFCAAIAAgACAAIAAgACAAIAAgACAAIAMEFCAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAMgFCADQBQgACAAIAAgACAAIAAgACAAIAAgACAAIAO4CCAAIAAgAiQAIAAgACABAAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAD0AggACAD8AggACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIANYFCAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAMDvwAIAAgAJAIIAAgACAAIAAgACAAIAAgACwMTAwgACAB9BOsEGwMjAwgAKwMyAwsFYgE3A/MEPwMIAEUDTQNRAwgAWQOsAGEDCAAIAAgACAAIAAgACABpAzQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFOgU0BTUFNgU3BTgFOQU6BTQFNQU2BTcFOAU5BToFNAU1BTYFNwU4BTkFIQUoBSwFCAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACABtAwgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACABMAEwACAAIAAgACAAIABgACAAIAAgACAC/AAgACAAyAQgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACACAAIAAwAAgACAAIAAgACAAIAAgACAAIAAAARABIAAgACAAIABQASAAIAAgAIABwAEAAjgCIABsAqAC2AL0AigDQAtwC+IJIQqVAZUBWQqVAZUBlQGVAZUBlQGrC5UBlQGVAZUBlQGVAZUBlQGVAXsKlQGVAbAK6wsrDGUMpQzlDJUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAZUBlQGVAfAKAAuZA64AtwCJALoC6ADwAAgAuACgA/oEpgO6AqsD+AAIAAgAswMIAAgACAAIAIkAuwP5AfsBwwPLAwgACAAIAAgACADRA9kDCAAIAOED6QMIAAgACAAIAAgACADuA/YDCAAIAP4DyQAIAAgABgQIAAgAXQAOBAgACAAIAAgACAAIABMECAAIAAgACAAIAAgACAD8AAQBCAAIAAgAGgQiBCoECAExBAgAEAEIAAgACAAIAAgACAAIAAgACAAIAAgACAA4BAgACABABEYECAAIAAgATAQYAQgAVAQIAAgACAAIAAgACAAIAAgACAAIAFoECAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAOQEIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAB+BAcACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAEABhgSMBAgACAAIAAgAlAQIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAwAEAAQABAADAAMAAwADAAQABAAEAAQABAAEAAQABHATAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAdQMIAAgACAAIAAgACAAIAMkACAAIAAgAfQMIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACACFA4kDCAAIAAgACAAIAOcBCAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAIcDCAAIAAgACAAIAAgACAAIAAgACAAIAJEDCAAIAAgACADFAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACABgBAgAZgQIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAbAQCBXIECAAIAHkECAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACABAAJwEQACjBKoEsgQIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAC6BMIECAAIAAgACAAIAAgACABmBAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAxwQIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAGYECAAIAAgAzgQIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgAigWKBYoFigWKBYoFigWKBd0FXwUIAOIF6gXxBYoF3gT5BQAGCAaKBYoFigWKBYoFigWKBYoFigWKBYoFigXWBIoFigWKBYoFigWKBYoFigWKBYsFEAaKBYoFigWKBYoFigWKBRQGCACKBYoFigWKBQgACAAIANEECAAIABgGigUgBggAJgYIAC4GMwaKBYoF0wQ3Bj4GigWKBYoFigWKBYoFigWKBYoFigWKBYoFigUIAAgACAAIAAgACAAIAAgAigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWKBYoFigWLBf///////wQABAAEAAQABAAEAAQABAAEAAQAAwAEAAQAAgAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAQADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAUAAAAFAAUAAAAFAAUAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAEAAQABAAEAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUAAQAAAAUABQAFAAUABQAFAAAAAAAFAAUAAAAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAFAAUAAQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABwAFAAUABQAFAAAABwAHAAcAAAAHAAcABwAFAAEAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAFAAUABQAFAAcABwAFAAUAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAQABAAAAAAAAAAAAAAAFAAUABQAFAAAABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAHAAcABwAHAAcAAAAHAAcAAAAAAAUABQAHAAUAAQAHAAEABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABwABAAUABQAFAAUAAAAAAAAAAAAAAAEAAQABAAEAAQABAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABwAFAAUAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUAAQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABQANAAQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABAAEAAQABAAEAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAEAAQABAAEAAQABAAEAAQABAAEAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAQABAAEAAQABAAEAAQABAAAAAAAAAAAAAAAAAAAAAAABQAHAAUABQAFAAAAAAAAAAcABQAFAAUABQAFAAQABAAEAAQABAAEAAQABAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUAAAAFAAUABQAFAAUAAAAFAAUABQAAAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAAAAAAAAAAAAUABQAFAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAHAAUAAAAHAAcABwAFAAUABQAFAAUABQAFAAUABwAHAAcABwAFAAcABwAAAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABwAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAUABwAHAAUABQAFAAUAAAAAAAcABwAAAAAABwAHAAUAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAABQAFAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAABwAHAAcABQAFAAAAAAAAAAAABQAFAAAAAAAFAAUABQAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAFAAUABQAFAAUAAAAFAAUABwAAAAcABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAFAAUABwAFAAUABQAFAAAAAAAHAAcAAAAAAAcABwAFAAAAAAAAAAAAAAAAAAAABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAcABwAAAAAAAAAHAAcABwAAAAcABwAHAAUAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAABQAHAAcABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABwAHAAcABwAAAAUABQAFAAAABQAFAAUABQAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAcABQAHAAcABQAHAAcAAAAFAAcABwAAAAcABwAFAAUAAAAAAAAAAAAAAAAAAAAFAAUAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAUABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAFAAcABwAFAAUABQAAAAUAAAAHAAcABwAHAAcABwAHAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAHAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAABwAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAUAAAAFAAAAAAAAAAAABwAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABwAFAAUABQAFAAUAAAAFAAUAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABwAFAAUABQAFAAUABQAAAAUABQAHAAcABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABQAFAAAAAAAAAAAABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAcABQAFAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAHAAUABQAFAAUABQAFAAUABwAHAAcABwAHAAcABwAHAAUABwAHAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABwAHAAcABwAFAAUABwAHAAcAAAAAAAAAAAAHAAcABQAHAAcABwAHAAcABwAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAcABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABQAHAAUABQAFAAUABQAFAAUAAAAFAAAABQAAAAAABQAFAAUABQAFAAUABQAFAAcABwAHAAcABwAHAAUABQAFAAUABQAFAAUABQAFAAUAAAAAAAUABQAFAAUABQAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABwAFAAcABwAHAAcABwAFAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAUABQAFAAUABwAHAAUABQAHAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAcABQAFAAcABwAHAAUABwAFAAUABQAHAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAcABwAHAAcABwAHAAUABQAFAAUABQAFAAUABQAHAAcABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUAAAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAcABQAFAAUABQAFAAUABQAAAAAAAAAAAAUAAAAAAAAAAAAAAAAABQAAAAAABwAFAAUAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAAABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUAAAAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAABQAAAAAAAAAFAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAUABQAHAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABwAHAAcABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAUABQAFAAUABQAHAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAcABwAFAAUABQAFAAcABwAFAAUABwAHAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAFAAcABwAFAAUABwAHAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAFAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAFAAUABQAAAAAABQAFAAAAAAAAAAAAAAAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABQAFAAcABwAAAAAAAAAAAAAABwAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABwAFAAcABwAFAAcABwAAAAcABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAAAAAAAAAAAAAAAAAFAAUABQAAAAUABQAAAAAAAAAAAAAABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABQAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABwAFAAUABQAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAcABQAFAAUABQAFAAUABQAFAAUABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAFAAUABQAHAAcABQAHAAUABQAAAAAAAAAAAAAAAAAFAAAABwAHAAcABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABwAHAAcABwAAAAAABwAHAAAAAAAHAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAAAAAAFAAUABQAFAAUABQAFAAAAAAAAAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAFAAUABQAFAAUABQAFAAUABwAHAAUABQAFAAcABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAHAAcABQAFAAUABQAFAAUABwAFAAcABwAFAAcABQAFAAcABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAHAAcABQAFAAUABQAAAAAABwAHAAcABwAFAAUABwAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABwAHAAUABQAFAAUABQAFAAUABQAHAAcABQAHAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABwAFAAcABwAFAAUABQAFAAUABQAHAAUAAAAAAAAAAAAAAAAAAAAAAAcABwAFAAUABQAFAAcABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAFAAUABQAFAAUABQAFAAUABQAHAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAFAAUABQAFAAAAAAAFAAUABwAHAAcABwAFAAAAAAAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABwAHAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABQAFAAUABQAFAAUABQAAAAUABQAFAAUABQAFAAcABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAAAHAAUABQAFAAUABQAFAAUABwAFAAUABwAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUAAAAAAAAABQAAAAUABQAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAcABwAHAAcAAAAFAAUAAAAHAAcABQAHAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABwAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAAAAAAAAAAAAAAAAAAABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAAAAUABQAFAAAAAAAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUABQAFAAUABQAAAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAAAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAAAAABQAFAAUABQAFAAUABQAAAAUABQAAAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFAAUABQAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQAFAAUABQAFAAUABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAFAAUABQAFAAUADgAOAA4ADgAOAA4ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAA8ADwAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAAAAAAAAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAMAAwADAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkAAAAAAAAAAAAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAKAAoACgAAAAAAAAAAAAsADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwACwAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAOAAAAAAAAAAAADgAOAA4AAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAAAA4ADgAOAA4ADgAOAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4AAAAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4AAAAAAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAAAA4AAAAOAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAADgAAAAAAAAAAAA4AAAAOAAAAAAAAAAAADgAOAA4AAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAAAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAA4ADgAOAA4ADgAOAA4ADgAOAAAADgAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4AAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4ADgAOAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAOAA4ADgAOAA4AAAAAAAAAAAAAAAAAAAAAAA4ADgAOAA4ADgAOAA4ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4AAAAOAA4ADgAOAA4ADgAAAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOAA4AAAAAAAAAAAA=";
		var chars$1 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
		var lookup$1 = typeof Uint8Array === "undefined" ? [] : /* @__PURE__ */ new Uint8Array(256);
		for (var i$1 = 0; i$1 < chars$1.length; i$1++) lookup$1[chars$1.charCodeAt(i$1)] = i$1;
		var decode = function(base64) {
			var bufferLength = base64.length * .75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
			if (base64[base64.length - 1] === "=") {
				bufferLength--;
				if (base64[base64.length - 2] === "=") bufferLength--;
			}
			var buffer = typeof ArrayBuffer !== "undefined" && typeof Uint8Array !== "undefined" && typeof Uint8Array.prototype.slice !== "undefined" ? new ArrayBuffer(bufferLength) : new Array(bufferLength);
			var bytes = Array.isArray(buffer) ? buffer : new Uint8Array(buffer);
			for (i = 0; i < len; i += 4) {
				encoded1 = lookup$1[base64.charCodeAt(i)];
				encoded2 = lookup$1[base64.charCodeAt(i + 1)];
				encoded3 = lookup$1[base64.charCodeAt(i + 2)];
				encoded4 = lookup$1[base64.charCodeAt(i + 3)];
				bytes[p++] = encoded1 << 2 | encoded2 >> 4;
				bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
				bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
			}
			return buffer;
		};
		var polyUint16Array = function(buffer) {
			var length = buffer.length;
			var bytes = [];
			for (var i = 0; i < length; i += 2) bytes.push(buffer[i + 1] << 8 | buffer[i]);
			return bytes;
		};
		var polyUint32Array = function(buffer) {
			var length = buffer.length;
			var bytes = [];
			for (var i = 0; i < length; i += 4) bytes.push(buffer[i + 3] << 24 | buffer[i + 2] << 16 | buffer[i + 1] << 8 | buffer[i]);
			return bytes;
		};
		/** Shift size for getting the index-2 table offset. */
		var UTRIE2_SHIFT_2 = 5;
		/** Shift size for getting the index-1 table offset. */
		var UTRIE2_SHIFT_1 = 11;
		/**
		* Shift size for shifting left the index array values.
		* Increases possible data size with 16-bit index values at the cost
		* of compactability.
		* This requires data blocks to be aligned by UTRIE2_DATA_GRANULARITY.
		*/
		var UTRIE2_INDEX_SHIFT = 2;
		/**
		* Difference between the two shift sizes,
		* for getting an index-1 offset from an index-2 offset. 6=11-5
		*/
		var UTRIE2_SHIFT_1_2 = UTRIE2_SHIFT_1 - UTRIE2_SHIFT_2;
		/**
		* The part of the index-2 table for U+D800..U+DBFF stores values for
		* lead surrogate code _units_ not code _points_.
		* Values for lead surrogate code _points_ are indexed with this portion of the table.
		* Length=32=0x20=0x400>>UTRIE2_SHIFT_2. (There are 1024=0x400 lead surrogates.)
		*/
		var UTRIE2_LSCP_INDEX_2_OFFSET = 65536 >> UTRIE2_SHIFT_2;
		/** Mask for getting the lower bits for the in-data-block offset. */
		var UTRIE2_DATA_MASK = (1 << UTRIE2_SHIFT_2) - 1;
		/**
		* The index-1 table, only used for supplementary code points, at offset 2112=0x840.
		* Variable length, for code points up to highStart, where the last single-value range starts.
		* Maximum length 512=0x200=0x100000>>UTRIE2_SHIFT_1.
		* (For 0x100000 supplementary code points U+10000..U+10ffff.)
		*
		* The part of the index-2 table for supplementary code points starts
		* after this index-1 table.
		*
		* Both the index-1 table and the following part of the index-2 table
		* are omitted completely if there is only BMP data.
		*/
		var UTRIE2_INDEX_1_OFFSET = UTRIE2_LSCP_INDEX_2_OFFSET + (1024 >> UTRIE2_SHIFT_2) + 32;
		/**
		* Number of index-1 entries for the BMP. 32=0x20
		* This part of the index-1 table is omitted from the serialized form.
		*/
		var UTRIE2_OMITTED_BMP_INDEX_1_LENGTH = 65536 >> UTRIE2_SHIFT_1;
		/** Mask for getting the lower bits for the in-index-2-block offset. */
		var UTRIE2_INDEX_2_MASK = (1 << UTRIE2_SHIFT_1_2) - 1;
		var slice16 = function(view, start, end) {
			if (view.slice) return view.slice(start, end);
			return new Uint16Array(Array.prototype.slice.call(view, start, end));
		};
		var slice32 = function(view, start, end) {
			if (view.slice) return view.slice(start, end);
			return new Uint32Array(Array.prototype.slice.call(view, start, end));
		};
		var createTrieFromBase64 = function(base64, _byteLength) {
			var buffer = decode(base64);
			var view32 = Array.isArray(buffer) ? polyUint32Array(buffer) : new Uint32Array(buffer);
			var view16 = Array.isArray(buffer) ? polyUint16Array(buffer) : new Uint16Array(buffer);
			var headerLength = 24;
			var index = slice16(view16, headerLength / 2, view32[4] / 2);
			var data = view32[5] === 2 ? slice16(view16, (headerLength + view32[4]) / 2) : slice32(view32, Math.ceil((headerLength + view32[4]) / 4));
			return new Trie(view32[0], view32[1], view32[2], view32[3], index, data);
		};
		var Trie = function() {
			function Trie(initialValue, errorValue, highStart, highValueIndex, index, data) {
				this.initialValue = initialValue;
				this.errorValue = errorValue;
				this.highStart = highStart;
				this.highValueIndex = highValueIndex;
				this.index = index;
				this.data = data;
			}
			/**
			* Get the value for a code point as stored in the Trie.
			*
			* @param codePoint the code point
			* @return the value
			*/
			Trie.prototype.get = function(codePoint) {
				var ix;
				if (codePoint >= 0) {
					if (codePoint < 55296 || codePoint > 56319 && codePoint <= 65535) {
						ix = this.index[codePoint >> UTRIE2_SHIFT_2];
						ix = (ix << UTRIE2_INDEX_SHIFT) + (codePoint & UTRIE2_DATA_MASK);
						return this.data[ix];
					}
					if (codePoint <= 65535) {
						ix = this.index[UTRIE2_LSCP_INDEX_2_OFFSET + (codePoint - 55296 >> UTRIE2_SHIFT_2)];
						ix = (ix << UTRIE2_INDEX_SHIFT) + (codePoint & UTRIE2_DATA_MASK);
						return this.data[ix];
					}
					if (codePoint < this.highStart) {
						ix = UTRIE2_INDEX_1_OFFSET - UTRIE2_OMITTED_BMP_INDEX_1_LENGTH + (codePoint >> UTRIE2_SHIFT_1);
						ix = this.index[ix];
						ix += codePoint >> UTRIE2_SHIFT_2 & UTRIE2_INDEX_2_MASK;
						ix = this.index[ix];
						ix = (ix << UTRIE2_INDEX_SHIFT) + (codePoint & UTRIE2_DATA_MASK);
						return this.data[ix];
					}
					if (codePoint <= 1114111) return this.data[this.highValueIndex];
				}
				return this.errorValue;
			};
			return Trie;
		}();
		var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
		var lookup = typeof Uint8Array === "undefined" ? [] : /* @__PURE__ */ new Uint8Array(256);
		for (var i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;
		var Prepend = 1;
		var CR = 2;
		var LF = 3;
		var Control = 4;
		var Extend = 5;
		var SpacingMark = 7;
		var L = 8;
		var V = 9;
		var T = 10;
		var LV = 11;
		var LVT = 12;
		var ZWJ = 13;
		var Extended_Pictographic = 14;
		var RI = 15;
		var toCodePoints = function(str) {
			var codePoints = [];
			var i = 0;
			var length = str.length;
			while (i < length) {
				var value = str.charCodeAt(i++);
				if (value >= 55296 && value <= 56319 && i < length) {
					var extra = str.charCodeAt(i++);
					if ((extra & 64512) === 56320) codePoints.push(((value & 1023) << 10) + (extra & 1023) + 65536);
					else {
						codePoints.push(value);
						i--;
					}
				} else codePoints.push(value);
			}
			return codePoints;
		};
		var fromCodePoint = function() {
			var codePoints = [];
			for (var _i = 0; _i < arguments.length; _i++) codePoints[_i] = arguments[_i];
			if (String.fromCodePoint) return String.fromCodePoint.apply(String, codePoints);
			var length = codePoints.length;
			if (!length) return "";
			var codeUnits = [];
			var index = -1;
			var result = "";
			while (++index < length) {
				var codePoint = codePoints[index];
				if (codePoint <= 65535) codeUnits.push(codePoint);
				else {
					codePoint -= 65536;
					codeUnits.push((codePoint >> 10) + 55296, codePoint % 1024 + 56320);
				}
				if (index + 1 === length || codeUnits.length > 16384) {
					result += String.fromCharCode.apply(String, codeUnits);
					codeUnits.length = 0;
				}
			}
			return result;
		};
		var UnicodeTrie = createTrieFromBase64(base64);
		var BREAK_NOT_ALLOWED = "×";
		var BREAK_ALLOWED = "÷";
		var codePointToClass = function(codePoint) {
			return UnicodeTrie.get(codePoint);
		};
		var _graphemeBreakAtIndex = function(_codePoints, classTypes, index) {
			var prevIndex = index - 2;
			var prev = classTypes[prevIndex];
			var current = classTypes[index - 1];
			var next = classTypes[index];
			if (current === CR && next === LF) return BREAK_NOT_ALLOWED;
			if (current === CR || current === LF || current === Control) return BREAK_ALLOWED;
			if (next === CR || next === LF || next === Control) return BREAK_ALLOWED;
			if (current === L && [
				L,
				V,
				LV,
				LVT
			].indexOf(next) !== -1) return BREAK_NOT_ALLOWED;
			if ((current === LV || current === V) && (next === V || next === T)) return BREAK_NOT_ALLOWED;
			if ((current === LVT || current === T) && next === T) return BREAK_NOT_ALLOWED;
			if (next === ZWJ || next === Extend) return BREAK_NOT_ALLOWED;
			if (next === SpacingMark) return BREAK_NOT_ALLOWED;
			if (current === Prepend) return BREAK_NOT_ALLOWED;
			if (current === ZWJ && next === Extended_Pictographic) {
				while (prev === Extend) prev = classTypes[--prevIndex];
				if (prev === Extended_Pictographic) return BREAK_NOT_ALLOWED;
			}
			if (current === RI && next === RI) {
				var countRI = 0;
				while (prev === RI) {
					countRI++;
					prev = classTypes[--prevIndex];
				}
				if (countRI % 2 === 0) return BREAK_NOT_ALLOWED;
			}
			return BREAK_ALLOWED;
		};
		var GraphemeBreaker = function(str) {
			var codePoints = toCodePoints(str);
			var length = codePoints.length;
			var index = 0;
			var lastEnd = 0;
			var classTypes = codePoints.map(codePointToClass);
			return { next: function() {
				if (index >= length) return {
					done: true,
					value: null
				};
				var graphemeBreak = BREAK_NOT_ALLOWED;
				while (index < length && (graphemeBreak = _graphemeBreakAtIndex(codePoints, classTypes, ++index)) === BREAK_NOT_ALLOWED);
				if (graphemeBreak !== BREAK_NOT_ALLOWED || index === length) {
					var value = fromCodePoint.apply(null, codePoints.slice(lastEnd, index));
					lastEnd = index;
					return {
						value,
						done: false
					};
				}
				return {
					done: true,
					value: null
				};
			} };
		};
		var splitGraphemes = function(str) {
			var breaker = GraphemeBreaker(str);
			var graphemes = [];
			var bk;
			while (!(bk = breaker.next()).done) if (bk.value) graphemes.push(bk.value.slice());
			return graphemes;
		};
		const testRangeBounds = (document) => {
			const TEST_HEIGHT = 123;
			if (document.createRange) {
				const range = document.createRange();
				if (range.getBoundingClientRect) {
					const testElement = document.createElement("boundtest");
					testElement.style.height = `${TEST_HEIGHT}px`;
					testElement.style.display = "block";
					document.body.appendChild(testElement);
					range.selectNode(testElement);
					const rangeBounds = range.getBoundingClientRect();
					const rangeHeight = Math.round(rangeBounds.height);
					document.body.removeChild(testElement);
					if (rangeHeight === TEST_HEIGHT) return true;
				}
			}
			return false;
		};
		const testIOSLineBreak = (document) => {
			const testElement = document.createElement("boundtest");
			testElement.style.width = "50px";
			testElement.style.display = "block";
			testElement.style.fontSize = "12px";
			testElement.style.letterSpacing = "0px";
			testElement.style.wordSpacing = "0px";
			document.body.appendChild(testElement);
			const range = document.createRange();
			testElement.innerHTML = typeof "".repeat === "function" ? "&#128104;".repeat(10) : "";
			const node = testElement.firstChild;
			const textList = toCodePoints$1(node.data).map((i) => fromCodePoint$1(i));
			let offset = 0;
			let prev = {};
			const supports = textList.every((text, i) => {
				range.setStart(node, offset);
				range.setEnd(node, offset + text.length);
				const rect = range.getBoundingClientRect();
				offset += text.length;
				const boundAhead = rect.x > prev.x || rect.y > prev.y;
				prev = rect;
				if (i === 0) return true;
				return boundAhead;
			});
			document.body.removeChild(testElement);
			return supports;
		};
		const testCORS = () => typeof new Image().crossOrigin !== "undefined";
		const testResponseType = () => typeof new XMLHttpRequest().responseType === "string";
		const testSVG = (document) => {
			const img = new Image();
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			if (!ctx) return false;
			img.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'></svg>`;
			try {
				ctx.drawImage(img, 0, 0);
				canvas.toDataURL();
			} catch (e) {
				return false;
			}
			return true;
		};
		const isGreenPixel = (data) => data[0] === 0 && data[1] === 255 && data[2] === 0 && data[3] === 255;
		const testForeignObject = (document) => {
			const canvas = document.createElement("canvas");
			const size = 100;
			canvas.width = size;
			canvas.height = size;
			const ctx = canvas.getContext("2d");
			if (!ctx) return Promise.reject(/* @__PURE__ */ new Error("Failed to get 2D rendering context"));
			ctx.fillStyle = "rgb(0, 255, 0)";
			ctx.fillRect(0, 0, size, size);
			const img = new Image();
			const greenImageSrc = canvas.toDataURL();
			img.src = greenImageSrc;
			const svg = createForeignObjectSVG(size, size, 0, 0, img);
			ctx.fillStyle = "red";
			ctx.fillRect(0, 0, size, size);
			return loadSerializedSVG(svg).then((img) => {
				ctx.drawImage(img, 0, 0);
				const data = ctx.getImageData(0, 0, size, size).data;
				ctx.fillStyle = "red";
				ctx.fillRect(0, 0, size, size);
				const node = document.createElement("div");
				node.style.backgroundImage = `url(${greenImageSrc})`;
				node.style.height = `${size}px`;
				return isGreenPixel(data) ? loadSerializedSVG(createForeignObjectSVG(size, size, 0, 0, node)) : Promise.reject(/* @__PURE__ */ new Error("ForeignObject rendering not supported"));
			}).then((img) => {
				ctx.drawImage(img, 0, 0);
				return isGreenPixel(ctx.getImageData(0, 0, size, size).data);
			}).catch(() => false);
		};
		const createForeignObjectSVG = (width, height, x, y, node) => {
			const xmlns = "http://www.w3.org/2000/svg";
			const svg = document.createElementNS(xmlns, "svg");
			const foreignObject = document.createElementNS(xmlns, "foreignObject");
			svg.setAttributeNS(null, "width", width.toString());
			svg.setAttributeNS(null, "height", height.toString());
			foreignObject.setAttributeNS(null, "width", "100%");
			foreignObject.setAttributeNS(null, "height", "100%");
			foreignObject.setAttributeNS(null, "x", x.toString());
			foreignObject.setAttributeNS(null, "y", y.toString());
			foreignObject.setAttributeNS(null, "externalResourcesRequired", "true");
			svg.appendChild(foreignObject);
			foreignObject.appendChild(node);
			return svg;
		};
		const loadSerializedSVG = (svg) => {
			return new Promise((resolve, reject) => {
				const img = new Image();
				img.onload = () => resolve(img);
				img.onerror = reject;
				img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
			});
		};
		const FEATURES = {
			get SUPPORT_RANGE_BOUNDS() {
				"use strict";
				const value = testRangeBounds(document);
				Object.defineProperty(FEATURES, "SUPPORT_RANGE_BOUNDS", { value });
				return value;
			},
			get SUPPORT_WORD_BREAKING() {
				"use strict";
				const value = FEATURES.SUPPORT_RANGE_BOUNDS && testIOSLineBreak(document);
				Object.defineProperty(FEATURES, "SUPPORT_WORD_BREAKING", { value });
				return value;
			},
			get SUPPORT_SVG_DRAWING() {
				"use strict";
				const value = testSVG(document);
				Object.defineProperty(FEATURES, "SUPPORT_SVG_DRAWING", { value });
				return value;
			},
			get SUPPORT_FOREIGNOBJECT_DRAWING() {
				"use strict";
				const value = typeof Array.from === "function" && typeof window.fetch === "function" ? testForeignObject(document) : Promise.resolve(false);
				Object.defineProperty(FEATURES, "SUPPORT_FOREIGNOBJECT_DRAWING", { value });
				return value;
			},
			get SUPPORT_CORS_IMAGES() {
				"use strict";
				const value = testCORS();
				Object.defineProperty(FEATURES, "SUPPORT_CORS_IMAGES", { value });
				return value;
			},
			get SUPPORT_RESPONSE_TYPE() {
				"use strict";
				const value = testResponseType();
				Object.defineProperty(FEATURES, "SUPPORT_RESPONSE_TYPE", { value });
				return value;
			},
			get SUPPORT_CORS_XHR() {
				"use strict";
				const value = "withCredentials" in new XMLHttpRequest();
				Object.defineProperty(FEATURES, "SUPPORT_CORS_XHR", { value });
				return value;
			},
			get SUPPORT_NATIVE_TEXT_SEGMENTATION() {
				"use strict";
				const value = !!(typeof Intl !== "undefined" && Intl.Segmenter);
				Object.defineProperty(FEATURES, "SUPPORT_NATIVE_TEXT_SEGMENTATION", { value });
				return value;
			}
		};
		var TextBounds = class {
			constructor(text, bounds) {
				this.text = text;
				this.bounds = bounds;
			}
		};
		const parseTextBounds = (context, value, styles, node) => {
			const textList = breakText(value, styles);
			const textBounds = [];
			let offset = 0;
			textList.forEach((text) => {
				if (styles.textDecorationLine.length || text.trim().length > 0) if (FEATURES.SUPPORT_RANGE_BOUNDS) {
					const clientRects = createRange(node, offset, text.length).getClientRects();
					if (clientRects.length > 1) {
						const subSegments = segmentGraphemes(text);
						let subOffset = 0;
						subSegments.forEach((subSegment) => {
							textBounds.push(new TextBounds(subSegment, Bounds.fromDOMRectList(context, createRange(node, subOffset + offset, subSegment.length).getClientRects())));
							subOffset += subSegment.length;
						});
					} else textBounds.push(new TextBounds(text, Bounds.fromDOMRectList(context, clientRects)));
				} else {
					const replacementNode = node.splitText(text.length);
					textBounds.push(new TextBounds(text, getWrapperBounds(context, node)));
					node = replacementNode;
				}
				else if (!FEATURES.SUPPORT_RANGE_BOUNDS) node = node.splitText(text.length);
				offset += text.length;
			});
			return textBounds;
		};
		const getWrapperBounds = (context, node) => {
			const ownerDocument = node.ownerDocument;
			if (ownerDocument) {
				const wrapper = ownerDocument.createElement("html2canvaswrapper");
				wrapper.appendChild(node.cloneNode(true));
				const parentNode = node.parentNode;
				if (parentNode) {
					parentNode.replaceChild(wrapper, node);
					const bounds = parseBounds(context, wrapper);
					if (wrapper.firstChild) parentNode.replaceChild(wrapper.firstChild, wrapper);
					return bounds;
				}
			}
			return Bounds.EMPTY;
		};
		const createRange = (node, offset, length) => {
			const ownerDocument = node.ownerDocument;
			if (!ownerDocument) throw new Error("Node has no owner document");
			const range = ownerDocument.createRange();
			range.setStart(node, offset);
			range.setEnd(node, offset + length);
			return range;
		};
		const segmentGraphemes = (value) => {
			if (FEATURES.SUPPORT_NATIVE_TEXT_SEGMENTATION) {
				const seg = new Intl.Segmenter(void 0, { granularity: "grapheme" });
				return Array.from(seg.segment(value)).map((s) => s.segment);
			}
			return splitGraphemes(value);
		};
		const segmentWords = (value, styles) => {
			if (FEATURES.SUPPORT_NATIVE_TEXT_SEGMENTATION) {
				const seg = new Intl.Segmenter(void 0, { granularity: "word" });
				return Array.from(seg.segment(value)).map((s) => s.segment);
			}
			return breakWords(value, styles);
		};
		const breakText = (value, styles) => {
			if (isVerticalWritingMode(styles.writingMode)) return segmentGraphemes(value);
			return styles.letterSpacing !== 0 ? segmentGraphemes(value) : segmentWords(value, styles);
		};
		const wordSeparators = [
			32,
			160,
			4961,
			65792,
			65793,
			4153,
			4241
		];
		const breakWords = (str, styles) => {
			const breaker = LineBreaker(str, {
				lineBreak: styles.lineBreak,
				wordBreak: styles.overflowWrap === "break-word" ? "break-word" : styles.wordBreak
			});
			const words = [];
			let bk;
			while (!(bk = breaker.next()).done) if (bk.value) {
				const codePoints = toCodePoints$1(bk.value.slice());
				let word = "";
				codePoints.forEach((codePoint) => {
					if (wordSeparators.indexOf(codePoint) === -1) word += fromCodePoint$1(codePoint);
					else {
						if (word.length) words.push(word);
						words.push(fromCodePoint$1(codePoint));
						word = "";
					}
				});
				if (word.length) words.push(word);
			}
			return words;
		};
		var TextContainer = class {
			constructor(context, node, styles) {
				this.text = transform(node.data, styles.textTransform);
				if (this.text.length !== node.data.length) node.data = this.text;
				this.textBounds = parseTextBounds(context, this.text, styles, node);
			}
		};
		const transform = (text, transform) => {
			switch (transform) {
				case 1: return text.toLowerCase();
				case 3: return text.replace(CAPITALIZE, capitalize);
				case 2: return text.toUpperCase();
				default: return text;
			}
		};
		const CAPITALIZE = /(^|\s|:|-|\(|\))([a-z])/g;
		const capitalize = (m, p1, p2) => {
			if (m.length > 0) return p1 + p2.toUpperCase();
			return m;
		};
		var ImageElementContainer = class extends ElementContainer {
			constructor(context, img) {
				super(context, img);
				this.src = img.currentSrc || img.src;
				this.intrinsicWidth = img.naturalWidth;
				this.intrinsicHeight = img.naturalHeight;
				this.context.cache.addImage(this.src);
			}
		};
		var CanvasElementContainer = class extends ElementContainer {
			constructor(context, canvas) {
				super(context, canvas);
				this.canvas = canvas;
				this.intrinsicWidth = canvas.width;
				this.intrinsicHeight = canvas.height;
			}
		};
		var SVGElementContainer = class extends ElementContainer {
			constructor(context, img) {
				super(context, img);
				const s = new XMLSerializer();
				const bounds = parseBounds(context, img);
				img.setAttribute("width", `${bounds.width}px`);
				img.setAttribute("height", `${bounds.height}px`);
				this.svg = `data:image/svg+xml,${encodeURIComponent(s.serializeToString(img))}`;
				this.intrinsicWidth = img.width.baseVal.value;
				this.intrinsicHeight = img.height.baseVal.value;
				this.context.cache.addImage(this.svg);
			}
		};
		var LIElementContainer = class extends ElementContainer {
			constructor(context, element) {
				super(context, element);
				this.value = element.value;
			}
		};
		var OLElementContainer = class extends ElementContainer {
			constructor(context, element) {
				super(context, element);
				this.start = element.start;
				this.reversed = typeof element.reversed === "boolean" && element.reversed === true;
			}
		};
		const CHECKBOX_BORDER_RADIUS = [{
			type: 15,
			flags: 0,
			unit: "px",
			number: 3
		}];
		const RADIO_BORDER_RADIUS = [{
			type: 16,
			flags: 0,
			number: 50
		}];
		const reformatInputBounds = (bounds) => {
			if (bounds.width > bounds.height) return new Bounds(bounds.left + (bounds.width - bounds.height) / 2, bounds.top, bounds.height, bounds.height);
			else if (bounds.width < bounds.height) return new Bounds(bounds.left, bounds.top + (bounds.height - bounds.width) / 2, bounds.width, bounds.width);
			return bounds;
		};
		const getInputValue = (node) => {
			const value = node.type === "password" ? new Array(node.value.length + 1).join("•") : node.value;
			return value.length === 0 ? node.placeholder || "" : value;
		};
		const isPlaceholder = (node) => {
			return node.value.length === 0 && !!node.placeholder;
		};
		const CHECKBOX = "checkbox";
		const RADIO = "radio";
		const INPUT_COLOR = 707406591;
		const PLACEHOLDER_COLOR = 1970632191;
		var InputElementContainer = class extends ElementContainer {
			constructor(context, input) {
				super(context, input);
				this.type = input.type.toLowerCase();
				this.checked = input.checked;
				this.value = getInputValue(input);
				this.isPlaceholder = isPlaceholder(input);
				if (this.type === "checkbox" || this.type === "radio") {
					this.styles.backgroundColor = 3739148031;
					this.styles.borderTopColor = this.styles.borderRightColor = this.styles.borderBottomColor = this.styles.borderLeftColor = 2779096575;
					this.styles.borderTopWidth = this.styles.borderRightWidth = this.styles.borderBottomWidth = this.styles.borderLeftWidth = 1;
					this.styles.borderTopStyle = this.styles.borderRightStyle = this.styles.borderBottomStyle = this.styles.borderLeftStyle = 1;
					this.styles.backgroundClip = [0];
					this.styles.backgroundOrigin = [0];
					this.bounds = reformatInputBounds(this.bounds);
				}
				switch (this.type) {
					case CHECKBOX:
						this.styles.borderTopRightRadius = this.styles.borderTopLeftRadius = this.styles.borderBottomRightRadius = this.styles.borderBottomLeftRadius = CHECKBOX_BORDER_RADIUS;
						break;
					case RADIO:
						this.styles.borderTopRightRadius = this.styles.borderTopLeftRadius = this.styles.borderBottomRightRadius = this.styles.borderBottomLeftRadius = RADIO_BORDER_RADIUS;
						break;
				}
			}
		};
		var SelectElementContainer = class extends ElementContainer {
			constructor(context, element) {
				super(context, element);
				const option = element.options[element.selectedIndex || 0];
				this.value = option ? option.text || "" : "";
			}
		};
		var TextareaElementContainer = class extends ElementContainer {
			constructor(context, element) {
				super(context, element);
				this.value = element.value;
			}
		};
		var IFrameElementContainer = class extends ElementContainer {
			constructor(context, iframe, parseTreeFn) {
				super(context, iframe);
				this.src = iframe.src;
				this.width = parseInt(iframe.width, 10) || 0;
				this.height = parseInt(iframe.height, 10) || 0;
				this.backgroundColor = this.styles.backgroundColor;
				this.parseTreeFn = parseTreeFn;
				try {
					if (iframe.contentWindow && iframe.contentWindow.document && iframe.contentWindow.document.documentElement && this.parseTreeFn) {
						this.tree = this.parseTreeFn(context, iframe.contentWindow.document.documentElement);
						const documentBackgroundColor = iframe.contentWindow.document.documentElement ? parseColor(context, getComputedStyle(iframe.contentWindow.document.documentElement).backgroundColor) : COLORS.TRANSPARENT;
						const bodyBackgroundColor = iframe.contentWindow.document.body ? parseColor(context, getComputedStyle(iframe.contentWindow.document.body).backgroundColor) : COLORS.TRANSPARENT;
						this.backgroundColor = isTransparent(documentBackgroundColor) ? isTransparent(bodyBackgroundColor) ? this.styles.backgroundColor : bodyBackgroundColor : documentBackgroundColor;
					}
				} catch (e) {}
			}
		};
		const LIST_OWNERS = [
			"OL",
			"UL",
			"MENU"
		];
		const parseNodeTree = (context, node, parent, root) => {
			for (let childNode = node.firstChild, nextNode; childNode; childNode = nextNode) {
				nextNode = childNode.nextSibling;
				parseChildNode(context, childNode, parent, root);
			}
		};
		/**
		* Parse a single node as a child of `parent`.
		*
		* Separated from the tree walk so that nodes assigned to a `<slot>` (including
		* bare text nodes, which have no child nodes) can be parsed directly. Without
		* this, slotted shadow-DOM content such as web component labels was silently
		* dropped because `parseNodeTree` only iterates `node.firstChild` (issue #226).
		*/
		const parseChildNode = (context, childNode, parent, root) => {
			if (isTextNode(childNode) && childNode.data.length > 0) parent.textNodes.push(new TextContainer(context, childNode, parent.styles));
			else if (isElementNode(childNode)) if (isSlotElement(childNode) && childNode.assignedNodes) childNode.assignedNodes().forEach((assignedNode) => parseChildNode(context, assignedNode, parent, root));
			else {
				const container = createContainer(context, childNode);
				if (container.styles.isVisible()) {
					if (createsRealStackingContext(childNode, container, root)) container.createsRealStackingContext = true;
					else if (createsStackingContext(container.styles)) container.createsStackingContext = true;
					if (LIST_OWNERS.indexOf(childNode.tagName) !== -1) container.isListOwner = true;
					parent.elements.push(container);
					if (childNode.shadowRoot) parseNodeTree(context, childNode.shadowRoot, container, root);
					else if (!isTextareaElement(childNode) && !isSVGElement(childNode) && !isSelectElement(childNode)) parseNodeTree(context, childNode, container, root);
				}
			}
		};
		const createContainer = (context, element) => {
			if (isImageElement(element)) return new ImageElementContainer(context, element);
			if (isCanvasElement(element)) return new CanvasElementContainer(context, element);
			if (isSVGElement(element)) return new SVGElementContainer(context, element);
			if (isLIElement(element)) return new LIElementContainer(context, element);
			if (isOLElement(element)) return new OLElementContainer(context, element);
			if (isInputElement(element)) return new InputElementContainer(context, element);
			if (isSelectElement(element)) return new SelectElementContainer(context, element);
			if (isTextareaElement(element)) return new TextareaElementContainer(context, element);
			if (isIFrameElement(element)) return new IFrameElementContainer(context, element, parseTree);
			return new ElementContainer(context, element);
		};
		const parseTree = (context, element) => {
			const container = createContainer(context, element);
			container.createsRealStackingContext = true;
			parseNodeTree(context, element, container, container);
			return container;
		};
		const createsRealStackingContext = (node, container, root) => {
			return container.styles.isPositionedWithZIndex() || container.styles.opacity < 1 || container.styles.isTransformed() || isBodyElement(node) && root.styles.isTransparent();
		};
		const createsStackingContext = (styles) => {
			if (styles.isPositioned() || styles.isFloating()) return true;
			return contains(styles.display, 268435456) || contains(styles.display, 33554432) || contains(styles.display, 536870912) || contains(styles.display, 134217728);
		};
		const equalPath = (a, b) => {
			if (a.length === b.length) return a.some((v, i) => v === b[i]);
			return false;
		};
		const transformPath = (path, deltaX, deltaY, deltaW, deltaH) => {
			return path.map((point, index) => {
				switch (index) {
					case 0: return point.add(deltaX, deltaY);
					case 1: return point.add(deltaX + deltaW, deltaY);
					case 2: return point.add(deltaX + deltaW, deltaY + deltaH);
					case 3: return point.add(deltaX, deltaY + deltaH);
				}
				return point;
			});
		};
		var Vector = class Vector {
			constructor(x, y) {
				this.type = 0;
				this.x = x;
				this.y = y;
			}
			add(deltaX, deltaY) {
				return new Vector(this.x + deltaX, this.y + deltaY);
			}
		};
		const lerp = (a, b, t) => {
			return new Vector(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
		};
		var BezierCurve = class BezierCurve {
			constructor(start, startControl, endControl, end) {
				this.type = 1;
				this.start = start;
				this.startControl = startControl;
				this.endControl = endControl;
				this.end = end;
			}
			subdivide(t, firstHalf) {
				const ab = lerp(this.start, this.startControl, t);
				const bc = lerp(this.startControl, this.endControl, t);
				const cd = lerp(this.endControl, this.end, t);
				const abbc = lerp(ab, bc, t);
				const bccd = lerp(bc, cd, t);
				const dest = lerp(abbc, bccd, t);
				return firstHalf ? new BezierCurve(this.start, ab, abbc, dest) : new BezierCurve(dest, bccd, cd, this.end);
			}
			add(deltaX, deltaY) {
				return new BezierCurve(this.start.add(deltaX, deltaY), this.startControl.add(deltaX, deltaY), this.endControl.add(deltaX, deltaY), this.end.add(deltaX, deltaY));
			}
			reverse() {
				return new BezierCurve(this.end, this.endControl, this.startControl, this.start);
			}
		};
		const isBezierCurve = (path) => path.type === 1;
		var BoundCurves = class {
			constructor(element) {
				const styles = element.styles;
				const bounds = element.bounds;
				let [tlh, tlv] = getAbsoluteValueForTuple(styles.borderTopLeftRadius, bounds.width, bounds.height);
				let [trh, trv] = getAbsoluteValueForTuple(styles.borderTopRightRadius, bounds.width, bounds.height);
				let [brh, brv] = getAbsoluteValueForTuple(styles.borderBottomRightRadius, bounds.width, bounds.height);
				let [blh, blv] = getAbsoluteValueForTuple(styles.borderBottomLeftRadius, bounds.width, bounds.height);
				const factors = [];
				factors.push((tlh + trh) / bounds.width);
				factors.push((blh + brh) / bounds.width);
				factors.push((tlv + blv) / bounds.height);
				factors.push((trv + brv) / bounds.height);
				const maxFactor = Math.max(...factors);
				if (maxFactor > 1) {
					tlh /= maxFactor;
					tlv /= maxFactor;
					trh /= maxFactor;
					trv /= maxFactor;
					brh /= maxFactor;
					brv /= maxFactor;
					blh /= maxFactor;
					blv /= maxFactor;
				}
				const topWidth = bounds.width - trh;
				const rightHeight = bounds.height - brv;
				const bottomWidth = bounds.width - brh;
				const leftHeight = bounds.height - blv;
				const borderTopWidth = styles.borderTopWidth;
				const borderRightWidth = styles.borderRightWidth;
				const borderBottomWidth = styles.borderBottomWidth;
				const borderLeftWidth = styles.borderLeftWidth;
				const paddingTop = getAbsoluteValue(styles.paddingTop, element.bounds.width);
				const paddingRight = getAbsoluteValue(styles.paddingRight, element.bounds.width);
				const paddingBottom = getAbsoluteValue(styles.paddingBottom, element.bounds.width);
				const paddingLeft = getAbsoluteValue(styles.paddingLeft, element.bounds.width);
				this.topLeftBorderDoubleOuterBox = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + borderLeftWidth / 3, bounds.top + borderTopWidth / 3, tlh - borderLeftWidth / 3, tlv - borderTopWidth / 3, 0) : new Vector(bounds.left + borderLeftWidth / 3, bounds.top + borderTopWidth / 3);
				this.topRightBorderDoubleOuterBox = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + topWidth, bounds.top + borderTopWidth / 3, trh - borderRightWidth / 3, trv - borderTopWidth / 3, 1) : new Vector(bounds.left + bounds.width - borderRightWidth / 3, bounds.top + borderTopWidth / 3);
				this.bottomRightBorderDoubleOuterBox = brh > 0 || brv > 0 ? getCurvePoints(bounds.left + bottomWidth, bounds.top + rightHeight, brh - borderRightWidth / 3, brv - borderBottomWidth / 3, 2) : new Vector(bounds.left + bounds.width - borderRightWidth / 3, bounds.top + bounds.height - borderBottomWidth / 3);
				this.bottomLeftBorderDoubleOuterBox = blh > 0 || blv > 0 ? getCurvePoints(bounds.left + borderLeftWidth / 3, bounds.top + leftHeight, blh - borderLeftWidth / 3, blv - borderBottomWidth / 3, 3) : new Vector(bounds.left + borderLeftWidth / 3, bounds.top + bounds.height - borderBottomWidth / 3);
				this.topLeftBorderDoubleInnerBox = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + borderLeftWidth * 2 / 3, bounds.top + borderTopWidth * 2 / 3, tlh - borderLeftWidth * 2 / 3, tlv - borderTopWidth * 2 / 3, 0) : new Vector(bounds.left + borderLeftWidth * 2 / 3, bounds.top + borderTopWidth * 2 / 3);
				this.topRightBorderDoubleInnerBox = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + topWidth, bounds.top + borderTopWidth * 2 / 3, trh - borderRightWidth * 2 / 3, trv - borderTopWidth * 2 / 3, 1) : new Vector(bounds.left + bounds.width - borderRightWidth * 2 / 3, bounds.top + borderTopWidth * 2 / 3);
				this.bottomRightBorderDoubleInnerBox = brh > 0 || brv > 0 ? getCurvePoints(bounds.left + bottomWidth, bounds.top + rightHeight, brh - borderRightWidth * 2 / 3, brv - borderBottomWidth * 2 / 3, 2) : new Vector(bounds.left + bounds.width - borderRightWidth * 2 / 3, bounds.top + bounds.height - borderBottomWidth * 2 / 3);
				this.bottomLeftBorderDoubleInnerBox = blh > 0 || blv > 0 ? getCurvePoints(bounds.left + borderLeftWidth * 2 / 3, bounds.top + leftHeight, blh - borderLeftWidth * 2 / 3, blv - borderBottomWidth * 2 / 3, 3) : new Vector(bounds.left + borderLeftWidth * 2 / 3, bounds.top + bounds.height - borderBottomWidth * 2 / 3);
				this.topLeftBorderStroke = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + borderLeftWidth / 2, bounds.top + borderTopWidth / 2, tlh - borderLeftWidth / 2, tlv - borderTopWidth / 2, 0) : new Vector(bounds.left + borderLeftWidth / 2, bounds.top + borderTopWidth / 2);
				this.topRightBorderStroke = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + topWidth, bounds.top + borderTopWidth / 2, trh - borderRightWidth / 2, trv - borderTopWidth / 2, 1) : new Vector(bounds.left + bounds.width - borderRightWidth / 2, bounds.top + borderTopWidth / 2);
				this.bottomRightBorderStroke = brh > 0 || brv > 0 ? getCurvePoints(bounds.left + bottomWidth, bounds.top + rightHeight, brh - borderRightWidth / 2, brv - borderBottomWidth / 2, 2) : new Vector(bounds.left + bounds.width - borderRightWidth / 2, bounds.top + bounds.height - borderBottomWidth / 2);
				this.bottomLeftBorderStroke = blh > 0 || blv > 0 ? getCurvePoints(bounds.left + borderLeftWidth / 2, bounds.top + leftHeight, blh - borderLeftWidth / 2, blv - borderBottomWidth / 2, 3) : new Vector(bounds.left + borderLeftWidth / 2, bounds.top + bounds.height - borderBottomWidth / 2);
				this.topLeftBorderBox = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left, bounds.top, tlh, tlv, 0) : new Vector(bounds.left, bounds.top);
				this.topRightBorderBox = trh > 0 || trv > 0 ? getCurvePoints(bounds.left + topWidth, bounds.top, trh, trv, 1) : new Vector(bounds.left + bounds.width, bounds.top);
				this.bottomRightBorderBox = brh > 0 || brv > 0 ? getCurvePoints(bounds.left + bottomWidth, bounds.top + rightHeight, brh, brv, 2) : new Vector(bounds.left + bounds.width, bounds.top + bounds.height);
				this.bottomLeftBorderBox = blh > 0 || blv > 0 ? getCurvePoints(bounds.left, bounds.top + leftHeight, blh, blv, 3) : new Vector(bounds.left, bounds.top + bounds.height);
				this.topLeftPaddingBox = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + borderLeftWidth, bounds.top + borderTopWidth, Math.max(0, tlh - borderLeftWidth), Math.max(0, tlv - borderTopWidth), 0) : new Vector(bounds.left + borderLeftWidth, bounds.top + borderTopWidth);
				this.topRightPaddingBox = trh > 0 || trv > 0 ? getCurvePoints(bounds.left + Math.min(topWidth, bounds.width - borderRightWidth), bounds.top + borderTopWidth, topWidth > bounds.width + borderRightWidth ? 0 : Math.max(0, trh - borderRightWidth), Math.max(0, trv - borderTopWidth), 1) : new Vector(bounds.left + bounds.width - borderRightWidth, bounds.top + borderTopWidth);
				this.bottomRightPaddingBox = brh > 0 || brv > 0 ? getCurvePoints(bounds.left + Math.min(bottomWidth, bounds.width - borderLeftWidth), bounds.top + Math.min(rightHeight, bounds.height - borderBottomWidth), Math.max(0, brh - borderRightWidth), Math.max(0, brv - borderBottomWidth), 2) : new Vector(bounds.left + bounds.width - borderRightWidth, bounds.top + bounds.height - borderBottomWidth);
				this.bottomLeftPaddingBox = blh > 0 || blv > 0 ? getCurvePoints(bounds.left + borderLeftWidth, bounds.top + Math.min(leftHeight, bounds.height - borderBottomWidth), Math.max(0, blh - borderLeftWidth), Math.max(0, blv - borderBottomWidth), 3) : new Vector(bounds.left + borderLeftWidth, bounds.top + bounds.height - borderBottomWidth);
				this.topLeftContentBox = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + borderLeftWidth + paddingLeft, bounds.top + borderTopWidth + paddingTop, Math.max(0, tlh - (borderLeftWidth + paddingLeft)), Math.max(0, tlv - (borderTopWidth + paddingTop)), 0) : new Vector(bounds.left + borderLeftWidth + paddingLeft, bounds.top + borderTopWidth + paddingTop);
				this.topRightContentBox = trh > 0 || trv > 0 ? getCurvePoints(bounds.left + Math.min(topWidth, bounds.width + borderLeftWidth + paddingLeft), bounds.top + borderTopWidth + paddingTop, topWidth > bounds.width + borderLeftWidth + paddingLeft ? 0 : trh - borderLeftWidth + paddingLeft, trv - (borderTopWidth + paddingTop), 1) : new Vector(bounds.left + bounds.width - (borderRightWidth + paddingRight), bounds.top + borderTopWidth + paddingTop);
				this.bottomRightContentBox = brh > 0 || brv > 0 ? getCurvePoints(bounds.left + Math.min(bottomWidth, bounds.width - (borderLeftWidth + paddingLeft)), bounds.top + Math.min(rightHeight, bounds.height + borderTopWidth + paddingTop), Math.max(0, brh - (borderRightWidth + paddingRight)), brv - (borderBottomWidth + paddingBottom), 2) : new Vector(bounds.left + bounds.width - (borderRightWidth + paddingRight), bounds.top + bounds.height - (borderBottomWidth + paddingBottom));
				this.bottomLeftContentBox = blh > 0 || blv > 0 ? getCurvePoints(bounds.left + borderLeftWidth + paddingLeft, bounds.top + leftHeight, Math.max(0, blh - (borderLeftWidth + paddingLeft)), blv - (borderBottomWidth + paddingBottom), 3) : new Vector(bounds.left + borderLeftWidth + paddingLeft, bounds.top + bounds.height - (borderBottomWidth + paddingBottom));
			}
		};
		const getCurvePoints = (x, y, r1, r2, position) => {
			const kappa = 4 * ((Math.sqrt(2) - 1) / 3);
			const ox = r1 * kappa;
			const oy = r2 * kappa;
			const xm = x + r1;
			const ym = y + r2;
			switch (position) {
				case 0: return new BezierCurve(new Vector(x, ym), new Vector(x, ym - oy), new Vector(xm - ox, y), new Vector(xm, y));
				case 1: return new BezierCurve(new Vector(x, y), new Vector(x + ox, y), new Vector(xm, ym - oy), new Vector(xm, ym));
				case 2: return new BezierCurve(new Vector(xm, y), new Vector(xm, y + oy), new Vector(x + ox, ym), new Vector(x, ym));
				default: return new BezierCurve(new Vector(xm, ym), new Vector(xm - ox, ym), new Vector(x, y + oy), new Vector(x, y));
			}
		};
		const calculateBorderBoxPath = (curves) => {
			return [
				curves.topLeftBorderBox,
				curves.topRightBorderBox,
				curves.bottomRightBorderBox,
				curves.bottomLeftBorderBox
			];
		};
		const calculateContentBoxPath = (curves) => {
			return [
				curves.topLeftContentBox,
				curves.topRightContentBox,
				curves.bottomRightContentBox,
				curves.bottomLeftContentBox
			];
		};
		const calculatePaddingBoxPath = (curves) => {
			return [
				curves.topLeftPaddingBox,
				curves.topRightPaddingBox,
				curves.bottomRightPaddingBox,
				curves.bottomLeftPaddingBox
			];
		};
		var TransformEffect = class {
			constructor(offsetX, offsetY, matrix) {
				this.offsetX = offsetX;
				this.offsetY = offsetY;
				this.matrix = matrix;
				this.type = 0;
				this.target = 6;
			}
		};
		var ClipEffect = class {
			constructor(path, target) {
				this.path = path;
				this.target = target;
				this.type = 1;
			}
		};
		var OpacityEffect = class {
			constructor(opacity) {
				this.opacity = opacity;
				this.type = 2;
				this.target = 6;
			}
		};
		/**
		* Clips the element and all its descendants to an arbitrary canvas-drawn shape.
		* The `applyClip` callback is responsible for calling beginPath, the shape
		* operations, and ctx.clip() — giving each shape type full control over how
		* the path is constructed (arc, ellipse, lineTo, Path2D, etc.).
		*/
		var ClipPathEffect = class {
			constructor(applyClip) {
				this.applyClip = applyClip;
				this.type = 3;
				this.target = 6;
			}
		};
		/**
		* Maps a CSS mix-blend-mode value to the corresponding Canvas {@link GlobalCompositeOperation}.
		* All CSS blend mode values are supported by the Canvas 2D API except 'normal',
		* which maps to the default 'source-over'.
		*/
		const MIX_BLEND_MODE_TO_COMPOSITE = {
			[MIX_BLEND_MODE$1.NORMAL]: "source-over",
			[MIX_BLEND_MODE$1.MULTIPLY]: "multiply",
			[MIX_BLEND_MODE$1.SCREEN]: "screen",
			[MIX_BLEND_MODE$1.OVERLAY]: "overlay",
			[MIX_BLEND_MODE$1.DARKEN]: "darken",
			[MIX_BLEND_MODE$1.LIGHTEN]: "lighten",
			[MIX_BLEND_MODE$1.COLOR_DODGE]: "color-dodge",
			[MIX_BLEND_MODE$1.COLOR_BURN]: "color-burn",
			[MIX_BLEND_MODE$1.HARD_LIGHT]: "hard-light",
			[MIX_BLEND_MODE$1.SOFT_LIGHT]: "soft-light",
			[MIX_BLEND_MODE$1.DIFFERENCE]: "difference",
			[MIX_BLEND_MODE$1.EXCLUSION]: "exclusion",
			[MIX_BLEND_MODE$1.HUE]: "hue",
			[MIX_BLEND_MODE$1.SATURATION]: "saturation",
			[MIX_BLEND_MODE$1.COLOR]: "color",
			[MIX_BLEND_MODE$1.LUMINOSITY]: "luminosity"
		};
		var BlendEffect = class {
			constructor(mixBlendMode) {
				this.mixBlendMode = mixBlendMode;
				this.type = 4;
				this.target = 6;
				this.compositeOperation = MIX_BLEND_MODE_TO_COMPOSITE[mixBlendMode];
			}
		};
		var FilterEffect = class FilterEffect {
			constructor(filterString) {
				this.type = 5;
				this.target = 6;
				const parsed = FilterEffect.parseDropShadow(filterString);
				this.shadow = parsed.shadow;
				this.safeFilterString = parsed.safeFilterString;
			}
			/**
			* Parse a CSS filter string, extracting drop-shadow() parameters for
			* rendering via ctx.shadow* (which avoids canvas taint), and producing
			* a safe filter string with all drop-shadow() calls removed.
			*
			* Uses paren-depth tracking to correctly handle nested function
			* arguments — e.g. rgba() / hsla() inside drop-shadow() — which
			* the previous regex-based approach ([^)]+) could not handle.
			*
			* Per CSS spec the shadow value is: <color>? && <length>{2,3}
			* (components can appear in any order).
			*/
			static parseDropShadow(filterString) {
				if (!filterString) return { safeFilterString: "" };
				const matches = FilterEffect.findDropShadows(filterString);
				if (matches.length === 0) return { safeFilterString: filterString };
				const shadow = FilterEffect.parseDropShadowBody(matches[0].body);
				let result = "";
				let lastEnd = 0;
				for (const m of matches) {
					result += filterString.slice(lastEnd, m.start);
					lastEnd = m.end;
				}
				result += filterString.slice(lastEnd);
				return {
					shadow,
					safeFilterString: result.replace(/\s+/g, " ").trim()
				};
			}
			/**
			* Find all drop-shadow() function calls in a CSS filter string.
			* Uses paren-depth tracking to correctly skip over nested
			* parentheses (e.g. rgba(0, 0, 0, 0.15)).
			*/
			static findDropShadows(str) {
				const results = [];
				const re = /drop-shadow\(/gi;
				let m;
				while ((m = re.exec(str)) !== null) {
					const openParen = m.index + 12 - 1;
					const start = m.index;
					let depth = 1;
					let pos = openParen + 1;
					while (pos < str.length && depth > 0) {
						const ch = str[pos];
						if (ch === "(") depth++;
						else if (ch === ")") depth--;
						pos++;
					}
					if (depth !== 0) break;
					const body = str.slice(openParen + 1, pos - 1);
					results.push({
						body,
						start,
						end: pos
					});
				}
				return results;
			}
			/**
			* Parse the body of a single drop-shadow() function.
			* Body format (order-independent): <offsetX> <offsetY> [<blur>] [<color>?]
			*/
			static parseDropShadowBody(body) {
				const tokens = FilterEffect.tokenizeFilterArgs(body.trim());
				const lengths = [];
				let color;
				for (const token of tokens) if (FilterEffect.isCSSLength(token)) lengths.push(parseFloat(token));
				else if (token) color = token;
				if (lengths.length < 2 || lengths.length > 3) return;
				return {
					offsetX: lengths[0],
					offsetY: lengths[1],
					blur: lengths[2] ?? 0,
					color: color ?? "rgba(0,0,0,1)"
				};
			}
			/**
			* Split whitespace-separated tokens while keeping parenthesised
			* expressions intact.
			*
			* e.g. "rgba(0, 0, 0, 0.15) 0px 1px 2px"
			*   → ["rgba(0, 0, 0, 0.15)", "0px", "1px", "2px"]
			*/
			static tokenizeFilterArgs(str) {
				const tokens = [];
				let current = "";
				let depth = 0;
				for (let i = 0; i < str.length; i++) {
					const ch = str[i];
					if (ch === "(") {
						depth++;
						current += ch;
					} else if (ch === ")") {
						depth--;
						current += ch;
					} else if (/\s/.test(ch)) {
						if (depth > 0) current += ch;
						else if (current) {
							tokens.push(current);
							current = "";
						}
					} else current += ch;
				}
				if (current) tokens.push(current);
				return tokens;
			}
			/** True when token looks like a CSS length: number with optional unit. */
			static isCSSLength(token) {
				return /^-?[\d.]+(px|em|rem|pt|cm|mm|in|pc|ex|ch|vw|vh|vmin|vmax|%)?$/i.test(token);
			}
		};
		const isTransformEffect = (effect) => effect.type === 0;
		const isClipEffect = (effect) => effect.type === 1;
		const isOpacityEffect = (effect) => effect.type === 2;
		const isClipPathEffect = (effect) => effect.type === 3;
		const isBlendEffect = (effect) => effect.type === 4;
		const isFilterEffect = (effect) => effect.type === 5;
		var StackingContext = class {
			constructor(container) {
				this.element = container;
				this.inlineLevel = [];
				this.nonInlineLevel = [];
				this.negativeZIndex = [];
				this.zeroOrAutoZIndexOrTransformedOrOpacity = [];
				this.positiveZIndex = [];
				this.nonPositionedFloats = [];
				this.nonPositionedInlineLevel = [];
			}
		};
		var ElementPaint = class {
			constructor(container, parent) {
				this.container = container;
				this.parent = parent;
				this.effects = [];
				this.curves = new BoundCurves(this.container);
				if (this.container.styles.opacity < 1) this.effects.push(new OpacityEffect(this.container.styles.opacity));
				if (this.container.styles.rotate !== null) {
					const origin = this.container.styles.transformOrigin;
					const offsetX = this.container.bounds.left + getAbsoluteValue(origin[0], this.container.bounds.width);
					const offsetY = this.container.bounds.top + getAbsoluteValue(origin[1], this.container.bounds.height);
					const rad = this.container.styles.rotate * Math.PI / 180;
					const cos = Math.cos(rad);
					const sin = Math.sin(rad);
					const rotateMatrix = [
						cos,
						sin,
						-sin,
						cos,
						0,
						0
					];
					this.effects.push(new TransformEffect(offsetX, offsetY, rotateMatrix));
				}
				if (this.container.styles.transform !== null) {
					const origin = this.container.styles.transformOrigin;
					const offsetX = this.container.bounds.left + getAbsoluteValue(origin[0], this.container.bounds.width);
					const offsetY = this.container.bounds.top + getAbsoluteValue(origin[1], this.container.bounds.height);
					const matrix = this.container.styles.transform;
					this.effects.push(new TransformEffect(offsetX, offsetY, matrix));
				}
				if (hasOverflowClip(this.container.styles)) {
					const borderBox = calculateBorderBoxPath(this.curves);
					const paddingBox = calculatePaddingBoxPath(this.curves);
					if (equalPath(borderBox, paddingBox)) this.effects.push(new ClipEffect(borderBox, 6));
					else {
						this.effects.push(new ClipEffect(borderBox, 2));
						this.effects.push(new ClipEffect(paddingBox, 4));
					}
				}
				if (this.container.styles.clipPath.type !== 0) {
					const clipPathEffect = buildClipPathEffect(this.container.styles.clipPath, this.container.bounds);
					if (clipPathEffect) this.effects.push(clipPathEffect);
				}
				if (this.container.styles.mixBlendMode !== MIX_BLEND_MODE$1.NORMAL) this.effects.push(new BlendEffect(this.container.styles.mixBlendMode));
				if (this.container.styles.filter !== null) this.effects.push(new FilterEffect(this.container.styles.filter));
				if (this.container.styles.zoom !== 1) {
					const origin = this.container.styles.transformOrigin;
					const offsetX = this.container.bounds.left + getAbsoluteValue(origin[0], this.container.bounds.width);
					const offsetY = this.container.bounds.top + getAbsoluteValue(origin[1], this.container.bounds.height);
					const z = this.container.styles.zoom;
					const zoomMatrix = [
						z,
						0,
						0,
						z,
						0,
						0
					];
					this.effects.push(new TransformEffect(offsetX, offsetY, zoomMatrix));
				}
			}
			getEffects(target) {
				let inFlow = [2, 3].indexOf(this.container.styles.position) === -1;
				let parent = this.parent;
				const effects = this.effects.slice(0);
				while (parent) {
					const croplessEffects = parent.effects.filter((effect) => !isClipEffect(effect));
					if (inFlow || parent.container.styles.position !== 0 || !parent.parent) {
						inFlow = [2, 3].indexOf(parent.container.styles.position) === -1;
						if (hasOverflowClip(parent.container.styles)) {
							const borderBox = calculateBorderBoxPath(parent.curves);
							const paddingBox = calculatePaddingBoxPath(parent.curves);
							if (!equalPath(borderBox, paddingBox)) effects.unshift(new ClipEffect(paddingBox, 6));
						}
						effects.unshift(...croplessEffects);
					} else effects.unshift(...croplessEffects);
					parent = parent.parent;
				}
				return effects.filter((effect) => contains(effect.target, target));
			}
		};
		/** @internal – exported for testing only. */
		const hasOverflowClip = (styles) => styles.overflowX !== 0 || styles.overflowY !== 0;
		/**
		* Resolve a `closest-side` or `farthest-side` shape-radius keyword to pixels
		* for a single axis. Used by both `circle()` (per-axis) and `ellipse()`.
		*
		* @param r       - The ShapeRadius (keyword or length-percentage).
		* @param center  - Absolute center coordinate on this axis (cx or cy).
		* @param start   - Absolute start of the reference box on this axis.
		* @param end     - Absolute end of the reference box on this axis.
		* @param dimRef  - Reference dimension for resolving a length-percentage value.
		* @internal – exported for testing only.
		*/
		const resolveAxisRadius = (r, center, start, end, dimRef) => {
			if (r === "closest-side") return Math.min(center - start, end - center);
			if (r === "farthest-side") return Math.max(center - start, end - center);
			return getAbsoluteValue(r, dimRef);
		};
		/**
		* Convert a parsed ClipPathValue + element bounds into a ClipPathEffect whose
		* `applyClip` callback draws the clip shape directly onto the canvas context.
		*
		* All coordinates are computed in page-absolute space at construction time so
		* the callback itself is allocation-free and executes synchronously.
		* @internal – exported for testing only.
		*/
		const buildClipPathEffect = (clipPath, bounds) => {
			const { left: bLeft, top: bTop, width: bWidth, height: bHeight } = bounds;
			switch (clipPath.type) {
				case 1: {
					const iLeft = getAbsoluteValue(clipPath.left, bWidth);
					const iTop = getAbsoluteValue(clipPath.top, bHeight);
					const x = bLeft + iLeft;
					const y = bTop + iTop;
					const w = Math.max(0, bWidth - iLeft - getAbsoluteValue(clipPath.right, bWidth));
					const h = Math.max(0, bHeight - iTop - getAbsoluteValue(clipPath.bottom, bHeight));
					return new ClipPathEffect((ctx) => {
						ctx.beginPath();
						ctx.rect(x, y, w, h);
						ctx.clip();
					});
				}
				case 2: {
					const cx = bLeft + getAbsoluteValue(clipPath.cx, bWidth);
					const cy = bTop + getAbsoluteValue(clipPath.cy, bHeight);
					let r;
					if (clipPath.radius === "closest-side") r = Math.min(cx - bLeft, cy - bTop, bLeft + bWidth - cx, bTop + bHeight - cy);
					else if (clipPath.radius === "farthest-side") r = Math.max(cx - bLeft, cy - bTop, bLeft + bWidth - cx, bTop + bHeight - cy);
					else r = getAbsoluteValue(clipPath.radius, Math.sqrt(bWidth * bWidth + bHeight * bHeight) / Math.SQRT2);
					return new ClipPathEffect((ctx) => {
						ctx.beginPath();
						ctx.arc(cx, cy, Math.max(0, r), 0, Math.PI * 2);
						ctx.clip();
					});
				}
				case 3: {
					const cx = bLeft + getAbsoluteValue(clipPath.cx, bWidth);
					const cy = bTop + getAbsoluteValue(clipPath.cy, bHeight);
					const rx = resolveAxisRadius(clipPath.rx, cx, bLeft, bLeft + bWidth, bWidth);
					const ry = resolveAxisRadius(clipPath.ry, cy, bTop, bTop + bHeight, bHeight);
					return new ClipPathEffect((ctx) => {
						ctx.beginPath();
						ctx.ellipse(cx, cy, Math.max(0, rx), Math.max(0, ry), 0, 0, Math.PI * 2);
						ctx.clip();
					});
				}
				case 4: {
					const absPoints = clipPath.points.map(([px, py]) => [bLeft + getAbsoluteValue(px, bWidth), bTop + getAbsoluteValue(py, bHeight)]);
					return new ClipPathEffect((ctx) => {
						ctx.beginPath();
						if (absPoints.length > 0) {
							ctx.moveTo(absPoints[0][0], absPoints[0][1]);
							for (let i = 1; i < absPoints.length; i++) ctx.lineTo(absPoints[i][0], absPoints[i][1]);
							ctx.closePath();
						}
						ctx.clip();
					});
				}
				case 5: {
					const { d } = clipPath;
					let cachedPath = null;
					return new ClipPathEffect((ctx) => {
						try {
							if (!cachedPath) cachedPath = new Path2D(d);
							const savedTransform = ctx.getTransform();
							ctx.translate(bLeft, bTop);
							ctx.clip(cachedPath);
							ctx.setTransform(savedTransform);
						} catch (_e) {}
					});
				}
				case 0: return null;
				default: return null;
			}
		};
		const parseStackTree = (parent, stackingContext, realStackingContext, listItems) => {
			parent.container.elements.forEach((child) => {
				const treatAsRealStackingContext = child.createsRealStackingContext;
				const createsStackingContext = child.createsStackingContext;
				const paintContainer = new ElementPaint(child, parent);
				if (contains(child.styles.display, 2048)) listItems.push(paintContainer);
				const listOwnerItems = child.isListOwner ? [] : listItems;
				if (treatAsRealStackingContext || createsStackingContext) {
					const parentStack = treatAsRealStackingContext || child.styles.isPositioned() ? realStackingContext : stackingContext;
					const stack = new StackingContext(paintContainer);
					if (child.styles.isPositioned() || child.styles.opacity < 1 || child.styles.isTransformed()) {
						const order = child.styles.zIndex.order;
						if (order < 0) {
							let index = 0;
							parentStack.negativeZIndex.some((current, i) => {
								if (order > current.element.container.styles.zIndex.order) {
									index = i;
									return false;
								} else if (index > 0) return true;
								return false;
							});
							parentStack.negativeZIndex.splice(index, 0, stack);
						} else if (order > 0) {
							let index = 0;
							parentStack.positiveZIndex.some((current, i) => {
								if (order >= current.element.container.styles.zIndex.order) {
									index = i + 1;
									return false;
								} else if (index > 0) return true;
								return false;
							});
							parentStack.positiveZIndex.splice(index, 0, stack);
						} else parentStack.zeroOrAutoZIndexOrTransformedOrOpacity.push(stack);
					} else if (child.styles.isFloating()) parentStack.nonPositionedFloats.push(stack);
					else parentStack.nonPositionedInlineLevel.push(stack);
					parseStackTree(paintContainer, stack, treatAsRealStackingContext ? stack : realStackingContext, listOwnerItems);
				} else {
					if (child.styles.isInlineLevel()) stackingContext.inlineLevel.push(paintContainer);
					else stackingContext.nonInlineLevel.push(paintContainer);
					parseStackTree(paintContainer, stackingContext, realStackingContext, listOwnerItems);
				}
				if (child.isListOwner) processListItems(child, listOwnerItems);
			});
		};
		const processListItems = (owner, elements) => {
			let numbering = owner instanceof OLElementContainer ? owner.start : 1;
			const reversed = owner instanceof OLElementContainer ? owner.reversed : false;
			for (let i = 0; i < elements.length; i++) {
				const item = elements[i];
				if (item.container instanceof LIElementContainer && typeof item.container.value === "number" && item.container.value !== 0) numbering = item.container.value;
				item.listValue = createCounterText(numbering, item.container.styles.listStyleType, true);
				numbering += reversed ? -1 : 1;
			}
		};
		const parseStackingContexts = (container) => {
			const paintContainer = new ElementPaint(container, null);
			const root = new StackingContext(paintContainer);
			const listItems = [];
			parseStackTree(paintContainer, root, root, listItems);
			processListItems(paintContainer.container, listItems);
			return root;
		};
		const paddingBox = (element) => {
			const bounds = element.bounds;
			const styles = element.styles;
			return bounds.add(styles.borderLeftWidth, styles.borderTopWidth, -(styles.borderRightWidth + styles.borderLeftWidth), -(styles.borderTopWidth + styles.borderBottomWidth));
		};
		const contentBox = (element) => {
			const styles = element.styles;
			const bounds = element.bounds;
			const paddingLeft = getAbsoluteValue(styles.paddingLeft, bounds.width);
			const paddingRight = getAbsoluteValue(styles.paddingRight, bounds.width);
			const paddingTop = getAbsoluteValue(styles.paddingTop, bounds.width);
			const paddingBottom = getAbsoluteValue(styles.paddingBottom, bounds.width);
			return bounds.add(paddingLeft + styles.borderLeftWidth, paddingTop + styles.borderTopWidth, -(styles.borderRightWidth + styles.borderLeftWidth + paddingLeft + paddingRight), -(styles.borderTopWidth + styles.borderBottomWidth + paddingTop + paddingBottom));
		};
		const calculateBackgroundPositioningArea = (backgroundOrigin, element) => {
			if (backgroundOrigin === 0) return element.bounds;
			if (backgroundOrigin === 2) return contentBox(element);
			return paddingBox(element);
		};
		const calculateBackgroundPaintingArea = (backgroundClip, element) => {
			if (backgroundClip === 0) return element.bounds;
			if (backgroundClip === 2) return contentBox(element);
			return paddingBox(element);
		};
		const calculateBackgroundRendering = (container, index, intrinsicSize) => {
			const backgroundPositioningArea = calculateBackgroundPositioningArea(getBackgroundValueForIndex(container.styles.backgroundOrigin, index), container);
			const backgroundPaintingArea = calculateBackgroundPaintingArea(getBackgroundValueForIndex(container.styles.backgroundClip, index), container);
			const backgroundImageSize = calculateBackgroundSize(getBackgroundValueForIndex(container.styles.backgroundSize, index), intrinsicSize, backgroundPositioningArea);
			let [sizeWidth, sizeHeight] = backgroundImageSize;
			const position = getAbsoluteValueForTuple(getBackgroundValueForIndex(container.styles.backgroundPosition, index), backgroundPositioningArea.width - sizeWidth, backgroundPositioningArea.height - sizeHeight);
			const path = calculateBackgroundRepeatPath(getBackgroundValueForIndex(container.styles.backgroundRepeat, index), position, backgroundImageSize, backgroundPositioningArea, backgroundPaintingArea);
			const offsetX = Math.round(backgroundPositioningArea.left + position[0]);
			const offsetY = Math.round(backgroundPositioningArea.top + position[1]);
			sizeWidth = Math.max(1, sizeWidth);
			sizeHeight = Math.max(1, sizeHeight);
			return [
				path,
				offsetX,
				offsetY,
				sizeWidth,
				sizeHeight
			];
		};
		const isAuto = (token) => isIdentToken(token) && token.value === "auto";
		const hasIntrinsicValue = (value) => typeof value === "number";
		const calculateBackgroundSize = (size, [intrinsicWidth, intrinsicHeight, intrinsicProportion], bounds) => {
			const [first, second] = size;
			if (!first) return [0, 0];
			if (isLengthPercentage(first) && second && isLengthPercentage(second)) return [getAbsoluteValue(first, bounds.width), getAbsoluteValue(second, bounds.height)];
			const hasIntrinsicProportion = hasIntrinsicValue(intrinsicProportion);
			if (isIdentToken(first) && (first.value === "contain" || first.value === "cover")) {
				if (hasIntrinsicValue(intrinsicProportion)) return bounds.width / bounds.height < intrinsicProportion !== (first.value === "cover") ? [bounds.width, bounds.width / intrinsicProportion] : [bounds.height * intrinsicProportion, bounds.height];
				return [bounds.width, bounds.height];
			}
			const hasIntrinsicWidth = hasIntrinsicValue(intrinsicWidth);
			const hasIntrinsicHeight = hasIntrinsicValue(intrinsicHeight);
			const hasIntrinsicDimensions = hasIntrinsicWidth || hasIntrinsicHeight;
			if (isAuto(first) && (!second || isAuto(second))) {
				if (hasIntrinsicWidth && hasIntrinsicHeight) return [intrinsicWidth, intrinsicHeight];
				if (!hasIntrinsicProportion && !hasIntrinsicDimensions) return [bounds.width, bounds.height];
				if (hasIntrinsicDimensions && hasIntrinsicProportion) return [hasIntrinsicWidth ? intrinsicWidth : intrinsicHeight * intrinsicProportion, hasIntrinsicHeight ? intrinsicHeight : intrinsicWidth / intrinsicProportion];
				return [hasIntrinsicWidth ? intrinsicWidth : bounds.width, hasIntrinsicHeight ? intrinsicHeight : bounds.height];
			}
			if (hasIntrinsicProportion) {
				let width = 0;
				let height = 0;
				if (isLengthPercentage(first)) width = getAbsoluteValue(first, bounds.width);
				else if (isLengthPercentage(second)) height = getAbsoluteValue(second, bounds.height);
				if (isAuto(first)) width = height * intrinsicProportion;
				else if (!second || isAuto(second)) height = width / intrinsicProportion;
				return [width, height];
			}
			let width = null;
			let height = null;
			if (isLengthPercentage(first)) width = getAbsoluteValue(first, bounds.width);
			else if (second && isLengthPercentage(second)) height = getAbsoluteValue(second, bounds.height);
			if (width !== null && (!second || isAuto(second))) height = hasIntrinsicWidth && hasIntrinsicHeight ? width / intrinsicWidth * intrinsicHeight : bounds.height;
			if (height !== null && isAuto(first)) width = hasIntrinsicWidth && hasIntrinsicHeight ? height / intrinsicHeight * intrinsicWidth : bounds.width;
			if (width !== null && height !== null) return [width, height];
			throw new Error(`Unable to calculate background-size for element`);
		};
		const getBackgroundValueForIndex = (values, index) => {
			const value = values[index];
			if (typeof value === "undefined") return values[0];
			return value;
		};
		const calculateBackgroundRepeatPath = (repeat, [x, y], [width, height], backgroundPositioningArea, backgroundPaintingArea) => {
			switch (repeat) {
				case 2: return [
					new Vector(Math.round(backgroundPositioningArea.left), Math.round(backgroundPositioningArea.top + y)),
					new Vector(Math.round(backgroundPositioningArea.left + backgroundPositioningArea.width), Math.round(backgroundPositioningArea.top + y)),
					new Vector(Math.round(backgroundPositioningArea.left + backgroundPositioningArea.width), Math.round(height + backgroundPositioningArea.top + y)),
					new Vector(Math.round(backgroundPositioningArea.left), Math.round(height + backgroundPositioningArea.top + y))
				];
				case 3: return [
					new Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.top)),
					new Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.top)),
					new Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.height + backgroundPositioningArea.top)),
					new Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.height + backgroundPositioningArea.top))
				];
				case 1: return [
					new Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.top + y)),
					new Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.top + y)),
					new Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.top + y + height)),
					new Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.top + y + height))
				];
				default: return [
					new Vector(Math.round(backgroundPaintingArea.left), Math.round(backgroundPaintingArea.top)),
					new Vector(Math.round(backgroundPaintingArea.left + backgroundPaintingArea.width), Math.round(backgroundPaintingArea.top)),
					new Vector(Math.round(backgroundPaintingArea.left + backgroundPaintingArea.width), Math.round(backgroundPaintingArea.height + backgroundPaintingArea.top)),
					new Vector(Math.round(backgroundPaintingArea.left), Math.round(backgroundPaintingArea.height + backgroundPaintingArea.top))
				];
			}
		};
		var TextDecorationRenderer = class {
			constructor(ctx) {
				this.ctx = ctx;
			}
			render(bounds, styles) {
				this.ctx.fillStyle = asString(styles.textDecorationColor || styles.color);
				let thickness = 1;
				if (typeof styles.textDecorationThickness === "number") thickness = styles.textDecorationThickness;
				else if (styles.textDecorationThickness === "from-font") thickness = Math.max(1, Math.floor(styles.fontSize.number * .05));
				let underlineOffset = 0;
				if (typeof styles.textUnderlineOffset === "number") underlineOffset = styles.textUnderlineOffset;
				const decorationStyle = styles.textDecorationStyle;
				styles.textDecorationLine.forEach((line) => {
					let y = 0;
					switch (line) {
						case 1:
							y = bounds.top + bounds.height - thickness + underlineOffset;
							break;
						case 2:
							y = bounds.top;
							break;
						case 3:
							y = bounds.top + (bounds.height / 2 - thickness / 2);
							break;
						default: return;
					}
					this.draw(bounds.left, y, bounds.width, thickness, decorationStyle);
				});
			}
			draw(x, y, width, thickness, style) {
				switch (style) {
					case 0:
						this.ctx.fillRect(x, y, width, thickness);
						break;
					case 1: {
						const gap = Math.max(1, thickness);
						this.ctx.fillRect(x, y, width, thickness);
						this.ctx.fillRect(x, y + thickness + gap, width, thickness);
						break;
					}
					case 2:
						this.drawPattern(x, y, width, thickness, [thickness, thickness * 2]);
						break;
					case 3:
						this.drawPattern(x, y, width, thickness, [thickness * 3, thickness * 2]);
						break;
					case 4:
						this.drawWavy(x, y, width, thickness);
						break;
					default: this.ctx.fillRect(x, y, width, thickness);
				}
			}
			drawPattern(x, y, width, thickness, dash) {
				this.ctx.save();
				this.ctx.beginPath();
				this.ctx.setLineDash(dash);
				this.ctx.lineWidth = thickness;
				this.ctx.strokeStyle = this.ctx.fillStyle;
				this.ctx.moveTo(x, y + thickness / 2);
				this.ctx.lineTo(x + width, y + thickness / 2);
				this.ctx.stroke();
				this.ctx.restore();
			}
			drawWavy(x, y, width, thickness) {
				this.ctx.save();
				this.ctx.beginPath();
				this.ctx.lineWidth = thickness;
				this.ctx.strokeStyle = this.ctx.fillStyle;
				const amplitude = thickness * 2;
				const wavelength = thickness * 4;
				let currentX = x;
				this.ctx.moveTo(currentX, y + thickness / 2);
				while (currentX < x + width) {
					const nextX = Math.min(currentX + wavelength / 2, x + width);
					this.ctx.quadraticCurveTo(currentX + wavelength / 4, y + thickness / 2 - amplitude, nextX, y + thickness / 2);
					currentX = nextX;
					if (currentX < x + width) {
						const nextX2 = Math.min(currentX + wavelength / 2, x + width);
						this.ctx.quadraticCurveTo(currentX + wavelength / 4, y + thickness / 2 + amplitude, nextX2, y + thickness / 2);
						currentX = nextX2;
					}
				}
				this.ctx.stroke();
				this.ctx.restore();
			}
		};
		/**
		* Font measurement utility
		*
		* Provides Canvas API-based baseline measurement that works correctly with
		* webfonts (which may not be loaded in the original document) and system fonts.
		*
		* Fallback chain:
		*   1. fontBoundingBoxAscent — font-level metric (Chrome 99+, FF 116+, Safari 17.4+)
		*   2. actualBoundingBoxAscent — glyph-level metric (widely supported)
		*   3. fallback value — coarse CSS fallback
		*/
		const SAMPLE_TEXT = "Mg";
		/**
		* Measure the baseline ascent for the currently set font.
		*
		* @param ctx - Canvas 2D rendering context with ctx.font already set
		* @param fallback - Fallback value when no metrics are available (e.g. fontSize.number)
		* @returns The distance from the text baseline to the top of the bounding box
		*/
		const measureBaseline = (ctx, fallback) => {
			const tm = ctx.measureText(SAMPLE_TEXT);
			const fmAscent = tm.fontBoundingBoxAscent;
			const ascent = fmAscent !== void 0 && !Number.isNaN(fmAscent) ? fmAscent : tm.actualBoundingBoxAscent;
			return ascent !== void 0 && !Number.isNaN(ascent) ? ascent : fallback;
		};
		const iOSBrokenFonts = ["-apple-system", "system-ui"];
		const TEXT_OVERFLOW_EPSILON = 1;
		/**
		* Detect CJK (Chinese, Japanese, Korean) characters in a string.
		* CJK characters use the ideographic baseline in browsers, which differs
		* from the alphabetic baseline used for Latin script.
		*
		* Covers:
		*   U+2E80–U+2FFF  CJK Radicals Supplement, Kangxi Radicals
		*   U+3000–U+30FF  CJK Symbols & Punctuation (。、「」…), Hiragana, Katakana
		*   U+3400–U+4DBF  CJK Extension A
		*   U+4E00–U+9FFF  CJK Unified Ideographs (most common Chinese/Japanese/Korean)
		*   U+AC00–U+D7AF  Hangul Syllables
		*   U+F900–U+FAFF  CJK Compatibility Ideographs
		*   U+FF01–U+FFEF  Halfwidth and Fullwidth Forms (Ａ Ｂ １ ２ ！ ？ etc.)
		*/
		const CJK_CHAR_REGEX = /[\u2E80-\u2FFF\u3000-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\uFF01-\uFFEF]/;
		const hasCJKCharacters = (text) => CJK_CHAR_REGEX.test(text);
		/**
		* Detect iOS version from user agent
		* Returns null if not iOS or version cannot be determined
		*/
		const getIOSVersion = () => {
			if (typeof navigator === "undefined") return null;
			const userAgent = navigator.userAgent;
			const isIOS = /iPhone|iPad|iPod/.test(userAgent);
			const isIPadOS = /Macintosh/.test(userAgent) && navigator.maxTouchPoints && navigator.maxTouchPoints > 1;
			if (!isIOS && !isIPadOS) return null;
			for (const pattern of [/(?:iPhone|CPU(?:\siPhone)?)\sOS\s(\d+)[\._](\d+)/, /Version\/(\d+)\.(\d+)/]) {
				const match = userAgent.match(pattern);
				if (match && match[1]) return parseInt(match[1], 10);
			}
			return null;
		};
		const fixIOSSystemFonts = (fontFamilies) => {
			const iosVersion = getIOSVersion();
			if (iosVersion !== null && iosVersion >= 15 && iosVersion < 17) return fontFamilies.map((fontFamily) => iOSBrokenFonts.indexOf(fontFamily) !== -1 ? `-apple-system, "Helvetica Neue", Arial, sans-serif` : fontFamily);
			return fontFamilies;
		};
		const getTextStrokeLineJoin = () => {
			return (typeof window !== "undefined" ? window : void 0)?.chrome ? "miter" : "round";
		};
		/**
		* Text Renderer
		*
		* Specialized renderer for text content.
		* Extracted from CanvasRenderer to improve code organization and maintainability.
		*/
		var TextRenderer = class {
			constructor(deps) {
				this.glyphWidthCache = null;
				this.ctx = deps.ctx;
				this.options = deps.options;
				this.decorationRenderer = new TextDecorationRenderer(deps.ctx);
			}
			/**
			* Returns the cached width for a glyph+font pair, measuring via
			* measureText if not yet cached. Only used when letterSpacing !== 0
			* (the `canRenderWholeText` fast path handles the zero-spacing case).
			*/
			cachedMeasureText(glyph, fontString) {
				let cache = this.glyphWidthCache;
				if (!cache) {
					cache = /* @__PURE__ */ new Map();
					this.glyphWidthCache = cache;
				}
				const key = glyph + fontString;
				let w = cache.get(key);
				if (w === void 0) {
					w = this.ctx.measureText(glyph).width;
					cache.set(key, w);
				}
				return w;
			}
			/**
			* Iterate grapheme clusters one-by-one, applying correct letter-spacing and
			* per-script baseline for each character.
			*
			* Issue #73: When letter-spacing is non-zero, text must be rendered character by
			* character. This helper centralises two fixes applied during that iteration:
			*   1. Add `letterSpacing` to each character's advance width (was previously
			*      omitted, causing characters to render without any spacing).
			*   2. Switch to the ideographic baseline for CJK glyphs so their vertical
			*      position matches how browsers lay them out in the DOM.
			*
			* The `renderFn` callback receives (letter, x, y) and performs the actual draw
			* call (fillText or strokeText), allowing fill and stroke paths to share one
			* implementation.
			*/
			iterateLettersWithLetterSpacing(text, letterSpacing, baseline, writingMode, renderFn) {
				if (isVerticalWritingMode(writingMode)) {
					this.iterateVerticalGlyphs(text, letterSpacing, baseline, writingMode, renderFn);
					return;
				}
				const letters = segmentGraphemes(text.text);
				const y = text.bounds.top + baseline;
				const fontString = this.ctx.font;
				let left = text.bounds.left;
				for (const letter of letters) {
					if (hasCJKCharacters(letter)) {
						const savedBaseline = this.ctx.textBaseline;
						this.ctx.textBaseline = "ideographic";
						renderFn(letter, left, y);
						this.ctx.textBaseline = savedBaseline;
					} else renderFn(letter, left, y);
					left += this.cachedMeasureText(letter, fontString) + letterSpacing;
				}
			}
			iterateVerticalGlyphs(text, letterSpacing, baseline, writingMode, renderFn) {
				const letters = segmentGraphemes(text.text);
				const fontString = this.ctx.font;
				const rotationAngle = writingMode === 4 ? -Math.PI / 2 : Math.PI / 2;
				let top = text.bounds.top;
				for (let i = 0; i < letters.length;) {
					const letter = letters[i];
					if (!(isSidewaysWritingMode(writingMode) || !hasCJKCharacters(letter) && letter.trim().length > 0)) {
						const savedBaseline = this.ctx.textBaseline;
						if (hasCJKCharacters(letter)) this.ctx.textBaseline = "ideographic";
						renderFn(letter, text.bounds.left, top + baseline);
						this.ctx.textBaseline = savedBaseline;
						top += this.cachedMeasureText(letter, fontString) + letterSpacing;
						i++;
						continue;
					}
					const runStart = i;
					while (i < letters.length) {
						const ch = letters[i];
						if (!isSidewaysWritingMode(writingMode) && !hasCJKCharacters(ch) && ch.trim().length === 0) break;
						if (isSidewaysWritingMode(writingMode) || !hasCJKCharacters(ch) && ch.trim().length > 0) i++;
						else break;
					}
					this.ctx.save();
					this.ctx.translate(text.bounds.left + baseline, top);
					this.ctx.rotate(rotationAngle);
					let runOffset = 0;
					for (let j = runStart; j < i; j++) {
						renderFn(letters[j], 0, runOffset);
						runOffset += this.cachedMeasureText(letters[j], fontString) + letterSpacing;
					}
					this.ctx.restore();
					top += runOffset;
				}
			}
			/**
			* Render text with letter-spacing applied (fill pass).
			* When letterSpacing is 0 the whole string is drawn in one call; otherwise each
			* grapheme is drawn individually so spacing and CJK baseline are applied correctly.
			*/
			renderTextWithLetterSpacing(text, letterSpacing, baseline, writingMode = 0) {
				this.renderFillText(text, letterSpacing, baseline, writingMode);
			}
			canRenderWholeText(letterSpacing, writingMode) {
				return letterSpacing === 0 && !isVerticalWritingMode(writingMode);
			}
			renderFillText(text, letterSpacing, baseline, writingMode) {
				if (this.canRenderWholeText(letterSpacing, writingMode)) this.ctx.fillText(text.text, text.bounds.left, text.bounds.top + baseline);
				else this.iterateLettersWithLetterSpacing(text, letterSpacing, baseline, writingMode, (letter, x, y) => {
					this.ctx.fillText(letter, x, y);
				});
			}
			renderStrokeText(text, letterSpacing, baseline, writingMode) {
				if (this.canRenderWholeText(letterSpacing, writingMode)) this.ctx.strokeText(text.text, text.bounds.left, text.bounds.top + baseline);
				else this.iterateLettersWithLetterSpacing(text, letterSpacing, baseline, writingMode, (letter, x, y) => {
					this.ctx.strokeText(letter, x, y);
				});
			}
			renderTextStrokeWithStyle(text, styles, baseline) {
				if (!styles.webkitTextStrokeWidth || !text.text.trim().length) return;
				this.ctx.strokeStyle = asString(styles.webkitTextStrokeColor);
				this.ctx.lineWidth = styles.webkitTextStrokeWidth;
				this.ctx.lineJoin = getTextStrokeLineJoin();
				this.renderStrokeText(text, styles.letterSpacing, baseline, styles.writingMode);
				this.ctx.strokeStyle = "";
				this.ctx.lineWidth = 0;
				this.ctx.lineJoin = "miter";
			}
			renderTextFillWithShadows(text, styles, baseline) {
				this.ctx.fillStyle = asString(styles.color);
				this.renderTextWithLetterSpacing(text, styles.letterSpacing, baseline, styles.writingMode);
				const textShadows = styles.textShadow;
				if (textShadows.length && text.text.trim().length) {
					textShadows.slice(0).reverse().forEach((textShadow) => {
						this.ctx.shadowColor = asString(textShadow.color);
						this.ctx.shadowOffsetX = textShadow.offsetX.number * this.options.scale;
						this.ctx.shadowOffsetY = textShadow.offsetY.number * this.options.scale;
						this.ctx.shadowBlur = textShadow.blur.number;
						this.renderTextWithLetterSpacing(text, styles.letterSpacing, baseline, styles.writingMode);
					});
					this.ctx.shadowColor = "";
					this.ctx.shadowOffsetX = 0;
					this.ctx.shadowOffsetY = 0;
					this.ctx.shadowBlur = 0;
				}
			}
			/**
			* Helper method to render text with paint order support
			* Reduces code duplication in line-clamp and normal rendering
			*/
			renderTextBoundWithPaintOrder(textBound, styles, paintOrderLayers, baseline) {
				paintOrderLayers.forEach((paintOrderLayer) => {
					switch (paintOrderLayer) {
						case 0:
							this.ctx.fillStyle = asString(styles.color);
							this.renderTextWithLetterSpacing(textBound, styles.letterSpacing, baseline, styles.writingMode);
							break;
						case 1:
							this.renderTextStrokeWithStyle(textBound, styles, baseline);
							break;
					}
				});
			}
			renderTextDecoration(bounds, styles) {
				this.decorationRenderer.render(bounds, styles);
			}
			truncateTextWithEllipsis(text, maxWidth, letterSpacing) {
				const ellipsis = "…";
				const ellipsisWidth = this.ctx.measureText(ellipsis).width;
				const graphemes = segmentGraphemes(text);
				if (letterSpacing === 0) {
					const fits = (n) => this.ctx.measureText(graphemes.slice(0, n).join("")).width + ellipsisWidth <= maxWidth;
					let lo = 0;
					let hi = graphemes.length;
					while (lo < hi) {
						const mid = lo + hi + 1 >> 1;
						if (fits(mid)) lo = mid;
						else hi = mid - 1;
					}
					return graphemes.slice(0, lo).join("") + ellipsis;
				} else {
					const fontString = this.ctx.font;
					let width = ellipsisWidth;
					const result = [];
					for (const letter of graphemes) {
						const glyphWidth = this.cachedMeasureText(letter, fontString);
						if (width + glyphWidth > maxWidth) break;
						result.push(letter);
						width += glyphWidth + letterSpacing;
					}
					return result.join("") + ellipsis;
				}
			}
			/**
			* Create font style array
			* Public method used by list rendering
			*/
			createFontStyle(styles) {
				const fontVariant = styles.fontVariant.filter((variant) => variant === "normal" || variant === "small-caps").join("");
				const fontFamily = fixIOSSystemFonts(styles.fontFamily).join(", ");
				const fontSize = isDimensionToken(styles.fontSize) ? `${styles.fontSize.number}${styles.fontSize.unit}` : `${styles.fontSize.number}px`;
				return [
					[
						styles.fontStyle,
						fontVariant,
						styles.fontWeight,
						fontSize,
						fontFamily
					].join(" "),
					fontFamily,
					fontSize
				];
			}
			/**
			* Render text with -webkit-line-clamp truncation.
			* Groups text bounds by their Y position into visual lines, then renders
			* only the first N-1 complete lines followed by an ellipsis on the Nth line.
			*/
			renderLineClampedText(text, styles, paintOrder, baseline, containerBounds) {
				const lineHeight = styles.fontSize.number * 1.5;
				const lines = [];
				let currentLine = [];
				let currentLineTop = text.textBounds[0].bounds.top;
				text.textBounds.forEach((tb) => {
					if (Math.abs(tb.bounds.top - currentLineTop) >= lineHeight * .5) {
						if (currentLine.length > 0) lines.push(currentLine);
						currentLine = [tb];
						currentLineTop = tb.bounds.top;
					} else currentLine.push(tb);
				});
				if (currentLine.length > 0) lines.push(currentLine);
				const maxLines = styles.webkitLineClamp;
				if (lines.length <= maxLines) return false;
				for (let i = 0; i < maxLines - 1; i++) lines[i].forEach((tb) => this.renderTextBoundWithPaintOrder(tb, styles, paintOrder, baseline));
				const lastLine = lines[maxLines - 1];
				if (lastLine?.length && containerBounds) {
					const textStr = lastLine.map((tb) => tb.text).join("");
					const first = lastLine[0];
					const avail = containerBounds.width - (first.bounds.left - containerBounds.left);
					const bounds = new TextBounds(this.truncateTextWithEllipsis(textStr, avail, styles.letterSpacing), first.bounds);
					for (const layer of paintOrder) if (layer === 0) {
						this.ctx.fillStyle = asString(styles.color);
						this.renderTextWithLetterSpacing(bounds, styles.letterSpacing, baseline, styles.writingMode);
					} else if (layer === 1) this.renderTextStrokeWithStyle(bounds, styles, baseline);
				}
				return true;
			}
			/**
			* Render single-line text with text-overflow: ellipsis.
			* Returns true if ellipsis was applied (caller should skip normal rendering).
			*/
			renderEllipsisText(text, styles, paintOrder, baseline, containerBounds) {
				const lineHeight = styles.fontSize.number * 1.5;
				const firstTop = text.textBounds[0].bounds.top;
				if (!text.textBounds.every((tb) => Math.abs(tb.bounds.top - firstTop) < lineHeight * .5)) return false;
				let fullText = text.textBounds.map((tb) => tb.text).join("").replace(/\s+/g, " ").trim();
				if (this.ctx.measureText(fullText).width <= containerBounds.width + TEXT_OVERFLOW_EPSILON) return false;
				const bounds = new TextBounds(this.truncateTextWithEllipsis(fullText, containerBounds.width, styles.letterSpacing), text.textBounds[0].bounds);
				for (const layer of paintOrder) if (layer === 0) this.renderTextFillWithShadows(bounds, styles, baseline);
				else if (layer === 1) this.renderTextStrokeWithStyle(bounds, styles, baseline);
				return true;
			}
			async renderTextNode(text, styles, containerBounds) {
				this.glyphWidthCache = null;
				const [fontString] = this.createFontStyle(styles);
				this.ctx.font = fontString;
				this.ctx.direction = styles.direction === 1 ? "rtl" : "ltr";
				this.ctx.textAlign = "left";
				this.ctx.textBaseline = "alphabetic";
				const paintOrder = styles.paintOrder;
				const baseline = measureBaseline(this.ctx, styles.fontSize.number);
				if (styles.webkitLineClamp > 0 && (styles.display & 2) !== 0 && styles.overflowY === 1 && text.textBounds.length > 0) {
					if (this.renderLineClampedText(text, styles, paintOrder, baseline, containerBounds)) return;
				}
				if (styles.textOverflow === 1 && containerBounds && styles.overflowX === 1 && text.textBounds.length > 0 && this.renderEllipsisText(text, styles, paintOrder, baseline, containerBounds)) return;
				text.textBounds.forEach((tb) => {
					paintOrder.forEach((layer) => {
						if (layer === 0) {
							this.renderTextFillWithShadows(tb, styles, baseline);
							if (styles.textDecorationLine.length) this.renderTextDecoration(tb.bounds, styles);
						} else if (layer === 1) this.renderTextStrokeWithStyle(tb, styles, baseline);
					});
				});
			}
		};
		const formatCanvasPath = (ctx, paths) => {
			paths.forEach((point, index) => {
				const start = isBezierCurve(point) ? point.start : point;
				if (index === 0) ctx.moveTo(start.x, start.y);
				else ctx.lineTo(start.x, start.y);
				if (isBezierCurve(point)) ctx.bezierCurveTo(point.startControl.x, point.startControl.y, point.endControl.x, point.endControl.y, point.end.x, point.end.y);
			});
		};
		const createCanvasPath = (ctx, paths) => {
			ctx.beginPath();
			formatCanvasPath(ctx, paths);
			ctx.closePath();
		};
		/**
		* Generic LRU (Least-Recently-Used) wrapper over a native `Map`.
		*
		* Both the CSS parse cache and the background pattern cache implement the
		* same LRU eviction pattern using Map's insertion-order guarantee.  This
		* tiny utility centralises that logic so it can be reused without
		* duplication.
		*
		* Usage:
		* ```ts
		* const cache = new LRUMap<string, CanvasPattern>(50);
		* const entry = cache.get(key); // promotes if found, returns undefined otherwise
		* cache.set(key, value);         // evicts oldest entry when at capacity
		* ```
		*/
		var LRUMap = class {
			constructor(maxSize) {
				this.maxSize = maxSize;
				this._map = /* @__PURE__ */ new Map();
			}
			/**
			* Get a value by key.
			* On cache hit the entry is promoted to the end of the Map (most-recently-used).
			* Returns `undefined` on miss.
			*/
			get(key) {
				if (!this._map.has(key)) return;
				const value = this._map.get(key);
				this._map.delete(key);
				this._map.set(key, value);
				return value;
			}
			/**
			* Insert or update a key-value pair.
			* If the key already exists it is moved to MRU position.  If the map is
			* at capacity the least-recently-used entry (oldest insertion order) is
			* evicted before inserting.
			*/
			set(key, value) {
				if (this._map.has(key)) this._map.delete(key);
				else if (this._map.size >= this.maxSize) {
					const oldestKey = this._map.keys().next().value;
					if (oldestKey !== void 0) this._map.delete(oldestKey);
				}
				this._map.set(key, value);
			}
			/** Current number of entries. */
			get size() {
				return this._map.size;
			}
			/** Remove all entries. */
			clear() {
				this._map.clear();
			}
		};
		/**
		* Background Renderer
		*
		* Specialized renderer for element backgrounds.
		* Extracted from CanvasRenderer to improve code organization and maintainability.
		*/
		var BackgroundRenderer = class {
			constructor(deps) {
				this.patternCache = new LRUMap(50);
				this.ctx = deps.ctx;
				this.context = deps.context;
				this.canvas = deps.canvas;
			}
			/**
			* Render background images for a container
			* Supports URL images, linear gradients, and radial gradients
			*
			* @param container - Element container with background styles
			*/
			async renderBackgroundImage(container) {
				let index = container.styles.backgroundImage.length - 1;
				const blendModes = container.styles.backgroundBlendMode;
				let layerCount = 0;
				for (const backgroundImage of container.styles.backgroundImage.slice(0).reverse()) {
					if (layerCount > 0) {
						const blendMode = blendModes[layerCount] ?? blendModes[0] ?? "normal";
						if (blendMode !== "normal") {
							this.ctx.save();
							this.ctx.globalCompositeOperation = blendMode;
						}
					}
					if (backgroundImage.type === 0) await this.renderBackgroundURLImage(container, backgroundImage, index);
					else if (isLinearGradient(backgroundImage)) this.renderLinearGradient(container, backgroundImage, index);
					else if (isRepeatingLinearGradient(backgroundImage)) this.renderRepeatingLinearGradient(container, backgroundImage, index);
					else if (isRadialGradient(backgroundImage)) this.renderRadialGradient(container, backgroundImage, index);
					if (layerCount > 0) {
						if ((blendModes[layerCount] ?? blendModes[0] ?? "normal") !== "normal") this.ctx.restore();
					}
					index--;
					layerCount++;
				}
			}
			/**
			* Render a URL-based background image
			*/
			async renderBackgroundURLImage(container, backgroundImage, index) {
				let image;
				const url = backgroundImage.url;
				try {
					image = await this.context.cache.match(url);
				} catch (e) {
					this.context.logger.error(`Error loading background-image ${url}`);
					this.context.onError?.(e instanceof Error ? e : new Error(String(e)));
				}
				if (image) {
					const imageWidth = isNaN(image.width) || image.width === 0 ? 1 : image.width;
					const imageHeight = isNaN(image.height) || image.height === 0 ? 1 : image.height;
					const [path, x, y, width, height] = calculateBackgroundRendering(container, index, [
						imageWidth,
						imageHeight,
						imageWidth / imageHeight
					]);
					const repeat = getBackgroundValueForIndex(container.styles.backgroundRepeat, index);
					const repeatMode = repeat === 1 ? "no-repeat" : repeat === 2 ? "repeat-x" : repeat === 3 ? "repeat-y" : "repeat";
					const cacheKey = `${url}|${Math.round(width)}x${Math.round(height)}|${container.styles.imageRendering}|${repeatMode}`;
					let pattern = this.patternCache.get(cacheKey);
					if (!pattern) {
						const resized = this.resizeImage(image, width, height, container.styles.imageRendering);
						pattern = this.ctx.createPattern(resized, repeatMode);
						this.patternCache.set(cacheKey, pattern);
					}
					this.renderRepeat(path, pattern, x, y);
				}
			}
			/**
			* Render a repeating linear gradient background.
			* Renders one cycle of the gradient to a pattern canvas, then fills
			* the background area using createPattern('repeat').
			*/
			renderRepeatingLinearGradient(container, backgroundImage, index) {
				const [path, x, y, width, height] = calculateBackgroundRendering(container, index, [
					null,
					null,
					null
				]);
				const [lineLength, x0, x1, y0, y1] = calculateGradientDirection(backgroundImage.angle, width, height);
				const processedStops = processColorStops(backgroundImage.stops, lineLength || 1);
				const lastStop = processedStops[processedStops.length - 1];
				const firstStop = processedStops[0];
				const patternLength = lastStop.stop - firstStop.stop;
				if (patternLength <= 0) {
					this.renderLinearGradient(container, backgroundImage, index);
					return;
				}
				const dirX = x1 - x0;
				const dirY = y1 - y0;
				const scale = patternLength / (Math.sqrt(dirX * dirX + dirY * dirY) || 1);
				const pX0 = x0;
				const pY0 = y0;
				const pX1 = x0 + dirX * scale;
				const pY1 = y0 + dirY * scale;
				const ownerDocument = this.canvas.ownerDocument ?? document;
				const cacheKey = `rlg|${backgroundImage.angle}|${Math.round(patternLength)}|${JSON.stringify(backgroundImage.stops)}`;
				let pattern = this.patternCache.get(cacheKey);
				if (!pattern) {
					const canvas = ownerDocument.createElement("canvas");
					const canvasSize = Math.max(1, Math.ceil(patternLength));
					canvas.width = canvasSize;
					canvas.height = canvasSize;
					const ctx = canvas.getContext("2d");
					if (!ctx) return;
					const gradient = ctx.createLinearGradient(pX0 - x, pY0 - y, pX1 - x, pY1 - y);
					processedStops.forEach((colorStop) => {
						gradient.addColorStop((colorStop.stop - firstStop.stop) / patternLength, asString(colorStop.color));
					});
					ctx.fillStyle = gradient;
					ctx.fillRect(0, 0, canvasSize, canvasSize);
					if (canvasSize > 0) {
						pattern = this.ctx.createPattern(canvas, "repeat");
						this.patternCache.set(cacheKey, pattern);
					}
				}
				if (pattern) this.renderRepeat(path, pattern, x, y);
			}
			/**
			* Render a linear gradient background
			*/
			renderLinearGradient(container, backgroundImage, index) {
				const [path, x, y, width, height] = calculateBackgroundRendering(container, index, [
					null,
					null,
					null
				]);
				const [lineLength, x0, x1, y0, y1] = calculateGradientDirection(backgroundImage.angle, width, height);
				const cacheKey = `lg|${backgroundImage.angle}|${Math.round(width)}x${Math.round(height)}|${JSON.stringify(backgroundImage.stops)}`;
				let pattern = this.patternCache.get(cacheKey);
				if (!pattern) {
					const canvas = (this.canvas.ownerDocument ?? document).createElement("canvas");
					canvas.width = width;
					canvas.height = height;
					const ctx = canvas.getContext("2d");
					if (!ctx) return;
					const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
					processColorStops(backgroundImage.stops, lineLength || 1).forEach((colorStop) => gradient.addColorStop(colorStop.stop, asString(colorStop.color)));
					ctx.fillStyle = gradient;
					ctx.fillRect(0, 0, width, height);
					if (width > 0 && height > 0) {
						pattern = this.ctx.createPattern(canvas, "repeat");
						this.patternCache.set(cacheKey, pattern);
					}
				}
				if (pattern) this.renderRepeat(path, pattern, x, y);
			}
			/**
			* Render a radial gradient background
			*/
			renderRadialGradient(container, backgroundImage, index) {
				const [path, left, top, width, height] = calculateBackgroundRendering(container, index, [
					null,
					null,
					null
				]);
				const position = backgroundImage.position.length === 0 ? [FIFTY_PERCENT] : backgroundImage.position;
				const x = getAbsoluteValue(position[0], width);
				const y = getAbsoluteValue(position[position.length - 1], height);
				let [rx, ry] = calculateRadius(backgroundImage, x, y, width, height);
				if (rx === 0 || ry === 0) {
					rx = Math.max(rx, .01);
					ry = Math.max(ry, .01);
				}
				if (rx > 0 && ry > 0) {
					const cacheKey = `rg|${Math.round(x)}x${Math.round(y)}|${Math.round(rx)}x${Math.round(ry)}|${JSON.stringify(backgroundImage.stops)}`;
					let pattern = this.patternCache.get(cacheKey);
					if (!pattern) {
						const ownerDocument = this.canvas.ownerDocument ?? document;
						const size = Math.ceil(Math.max(rx, ry) * 2);
						const offscreen = ownerDocument.createElement("canvas");
						offscreen.width = size;
						offscreen.height = size;
						const offCtx = offscreen.getContext("2d");
						if (offCtx) {
							const offRadius = Math.max(rx, ry);
							const gradient = offCtx.createRadialGradient(offRadius, offRadius, 0, offRadius, offRadius, offRadius);
							processColorStops(backgroundImage.stops, offRadius * 2).forEach((s) => gradient.addColorStop(s.stop, asString(s.color)));
							offCtx.fillStyle = gradient;
							if (rx !== ry) offCtx.scale(1, ry / rx);
							offCtx.fillRect(0, 0, offRadius * 2, offRadius * 2);
							pattern = this.ctx.createPattern(offscreen, "no-repeat");
							this.patternCache.set(cacheKey, pattern);
						}
					}
					if (pattern) {
						this.path(path);
						this.ctx.save();
						this.ctx.clip();
						this.ctx.translate(left + x - Math.max(rx, ry), top + y - Math.max(rx, ry));
						this.ctx.fillStyle = pattern;
						this.ctx.fillRect(0, 0, Math.max(rx, ry) * 2, Math.max(rx, ry) * 2);
						this.ctx.restore();
					}
				}
			}
			/**
			* Render a repeating pattern with offset
			*
			* @param path - Path to fill
			* @param pattern - Canvas pattern or gradient
			* @param offsetX - X offset for pattern
			* @param offsetY - Y offset for pattern
			*/
			renderRepeat(path, pattern, offsetX, offsetY) {
				this.path(path);
				this.ctx.fillStyle = pattern;
				this.ctx.translate(offsetX, offsetY);
				this.ctx.fill();
				this.ctx.translate(-offsetX, -offsetY);
			}
			/**
			* Resize an image to target dimensions
			*
			* @param image - Source image
			* @param width - Target width
			* @param height - Target height
			* @param imageRendering - CSS image-rendering property value
			* @returns Resized canvas or original image
			*/
			resizeImage(image, width, height, imageRendering) {
				const canvas = (this.canvas.ownerDocument ?? document).createElement("canvas");
				canvas.width = Math.max(1, width);
				canvas.height = Math.max(1, height);
				const ctx = canvas.getContext("2d");
				if (!ctx) return image;
				if (imageRendering === 2 || imageRendering === 1) {
					this.context.logger.debug(`Disabling image smoothing for background image due to CSS image-rendering`);
					ctx.imageSmoothingEnabled = false;
				} else if (imageRendering === 3) {
					this.context.logger.debug(`Enabling image smoothing for background image due to CSS image-rendering: smooth`);
					ctx.imageSmoothingEnabled = true;
				} else ctx.imageSmoothingEnabled = this.ctx.imageSmoothingEnabled;
				if (this.ctx.imageSmoothingQuality) ctx.imageSmoothingQuality = this.ctx.imageSmoothingQuality;
				ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
				return canvas;
			}
			/**
			* Create a canvas path from path array
			*
			* @param paths - Array of path points
			*/
			path(paths) {
				createCanvasPath(this.ctx, paths);
			}
		};
		const parsePathForBorder = (curves, borderSide) => {
			switch (borderSide) {
				case 0: return createPathFromCurves(curves.topLeftBorderBox, curves.topLeftPaddingBox, curves.topRightBorderBox, curves.topRightPaddingBox);
				case 1: return createPathFromCurves(curves.topRightBorderBox, curves.topRightPaddingBox, curves.bottomRightBorderBox, curves.bottomRightPaddingBox);
				case 2: return createPathFromCurves(curves.bottomRightBorderBox, curves.bottomRightPaddingBox, curves.bottomLeftBorderBox, curves.bottomLeftPaddingBox);
				default: return createPathFromCurves(curves.bottomLeftBorderBox, curves.bottomLeftPaddingBox, curves.topLeftBorderBox, curves.topLeftPaddingBox);
			}
		};
		const parsePathForBorderDoubleOuter = (curves, borderSide) => {
			switch (borderSide) {
				case 0: return createPathFromCurves(curves.topLeftBorderBox, curves.topLeftBorderDoubleOuterBox, curves.topRightBorderBox, curves.topRightBorderDoubleOuterBox);
				case 1: return createPathFromCurves(curves.topRightBorderBox, curves.topRightBorderDoubleOuterBox, curves.bottomRightBorderBox, curves.bottomRightBorderDoubleOuterBox);
				case 2: return createPathFromCurves(curves.bottomRightBorderBox, curves.bottomRightBorderDoubleOuterBox, curves.bottomLeftBorderBox, curves.bottomLeftBorderDoubleOuterBox);
				default: return createPathFromCurves(curves.bottomLeftBorderBox, curves.bottomLeftBorderDoubleOuterBox, curves.topLeftBorderBox, curves.topLeftBorderDoubleOuterBox);
			}
		};
		const parsePathForBorderDoubleInner = (curves, borderSide) => {
			switch (borderSide) {
				case 0: return createPathFromCurves(curves.topLeftBorderDoubleInnerBox, curves.topLeftPaddingBox, curves.topRightBorderDoubleInnerBox, curves.topRightPaddingBox);
				case 1: return createPathFromCurves(curves.topRightBorderDoubleInnerBox, curves.topRightPaddingBox, curves.bottomRightBorderDoubleInnerBox, curves.bottomRightPaddingBox);
				case 2: return createPathFromCurves(curves.bottomRightBorderDoubleInnerBox, curves.bottomRightPaddingBox, curves.bottomLeftBorderDoubleInnerBox, curves.bottomLeftPaddingBox);
				default: return createPathFromCurves(curves.bottomLeftBorderDoubleInnerBox, curves.bottomLeftPaddingBox, curves.topLeftBorderDoubleInnerBox, curves.topLeftPaddingBox);
			}
		};
		const parsePathForBorderStroke = (curves, borderSide) => {
			switch (borderSide) {
				case 0: return createStrokePathFromCurves(curves.topLeftBorderStroke, curves.topRightBorderStroke);
				case 1: return createStrokePathFromCurves(curves.topRightBorderStroke, curves.bottomRightBorderStroke);
				case 2: return createStrokePathFromCurves(curves.bottomRightBorderStroke, curves.bottomLeftBorderStroke);
				default: return createStrokePathFromCurves(curves.bottomLeftBorderStroke, curves.topLeftBorderStroke);
			}
		};
		const createStrokePathFromCurves = (outer1, outer2) => {
			const path = [];
			if (isBezierCurve(outer1)) path.push(outer1.subdivide(.5, false));
			else path.push(outer1);
			if (isBezierCurve(outer2)) path.push(outer2.subdivide(.5, true));
			else path.push(outer2);
			return path;
		};
		const createPathFromCurves = (outer1, inner1, outer2, inner2) => {
			const path = [];
			if (isBezierCurve(outer1)) path.push(outer1.subdivide(.5, false));
			else path.push(outer1);
			if (isBezierCurve(outer2)) path.push(outer2.subdivide(.5, true));
			else path.push(outer2);
			if (isBezierCurve(inner2)) path.push(inner2.subdivide(.5, true).reverse());
			else path.push(inner2);
			if (isBezierCurve(inner1)) path.push(inner1.subdivide(.5, false).reverse());
			else path.push(inner1);
			return path;
		};
		/**
		* Border Renderer
		*
		* Specialized renderer for element borders.
		* Extracted from CanvasRenderer to improve code organization and maintainability.
		*/
		var BorderRenderer = class {
			constructor(deps, pathCallbacks) {
				this.ctx = deps.ctx;
				this.pathCallbacks = pathCallbacks;
			}
			/**
			* Render a solid border
			*
			* @param color - Border color
			* @param side - Border side (0=top, 1=right, 2=bottom, 3=left)
			* @param curvePoints - Border curve points
			*/
			async renderSolidBorder(color, side, curvePoints) {
				this.pathCallbacks.path(parsePathForBorder(curvePoints, side));
				this.ctx.fillStyle = asString(color);
				this.ctx.fill();
			}
			/**
			* Render a double border
			* Falls back to solid border if width is too small
			*
			* @param color - Border color
			* @param width - Border width
			* @param side - Border side (0=top, 1=right, 2=bottom, 3=left)
			* @param curvePoints - Border curve points
			*/
			async renderDoubleBorder(color, width, side, curvePoints) {
				if (width < 3) {
					await this.renderSolidBorder(color, side, curvePoints);
					return;
				}
				const outerPaths = parsePathForBorderDoubleOuter(curvePoints, side);
				this.pathCallbacks.path(outerPaths);
				this.ctx.fillStyle = asString(color);
				this.ctx.fill();
				const innerPaths = parsePathForBorderDoubleInner(curvePoints, side);
				this.pathCallbacks.path(innerPaths);
				this.ctx.fill();
			}
			/**
			* Render a dashed or dotted border
			*
			* @param color - Border color
			* @param width - Border width
			* @param side - Border side (0=top, 1=right, 2=bottom, 3=left)
			* @param curvePoints - Border curve points
			* @param style - Border style (DASHED or DOTTED)
			*/
			async renderDashedDottedBorder(color, width, side, curvePoints, style) {
				this.ctx.save();
				const strokePaths = parsePathForBorderStroke(curvePoints, side);
				const boxPaths = parsePathForBorder(curvePoints, side);
				if (style === 2) {
					this.pathCallbacks.path(boxPaths);
					this.ctx.clip();
				}
				let startX, startY, endX, endY;
				if (isBezierCurve(boxPaths[0])) {
					startX = boxPaths[0].start.x;
					startY = boxPaths[0].start.y;
				} else {
					startX = boxPaths[0].x;
					startY = boxPaths[0].y;
				}
				if (isBezierCurve(boxPaths[1])) {
					endX = boxPaths[1].end.x;
					endY = boxPaths[1].end.y;
				} else {
					endX = boxPaths[1].x;
					endY = boxPaths[1].y;
				}
				let length;
				if (side === 0 || side === 2) length = Math.abs(startX - endX);
				else length = Math.abs(startY - endY);
				this.ctx.beginPath();
				if (style === 3) this.pathCallbacks.formatPath(strokePaths);
				else this.pathCallbacks.formatPath(boxPaths.slice(0, 2));
				let dashLength = width < 3 ? width * 3 : width * 2;
				let spaceLength = width < 3 ? width * 2 : width;
				if (style === 3) {
					dashLength = width;
					spaceLength = width;
				}
				let useLineDash = true;
				if (length <= dashLength * 2) useLineDash = false;
				else if (length <= dashLength * 2 + spaceLength) {
					const multiplier = length / (2 * dashLength + spaceLength);
					dashLength *= multiplier;
					spaceLength *= multiplier;
				} else {
					const numberOfDashes = Math.floor((length + spaceLength) / (dashLength + spaceLength));
					const minSpace = (length - numberOfDashes * dashLength) / (numberOfDashes - 1);
					const maxSpace = (length - (numberOfDashes + 1) * dashLength) / numberOfDashes;
					spaceLength = maxSpace <= 0 || Math.abs(spaceLength - minSpace) < Math.abs(spaceLength - maxSpace) ? minSpace : maxSpace;
				}
				if (useLineDash) if (style === 3) this.ctx.setLineDash([0, dashLength + spaceLength]);
				else this.ctx.setLineDash([dashLength, spaceLength]);
				if (style === 3) {
					this.ctx.lineCap = "round";
					this.ctx.lineWidth = width;
				} else this.ctx.lineWidth = width * 2 + 1.1;
				this.ctx.strokeStyle = asString(color);
				this.ctx.stroke();
				this.ctx.setLineDash([]);
				if (style === 2) {
					if (isBezierCurve(boxPaths[0])) {
						const path1 = boxPaths[3];
						const path2 = boxPaths[0];
						this.ctx.beginPath();
						this.pathCallbacks.formatPath([new Vector(path1.end.x, path1.end.y), new Vector(path2.start.x, path2.start.y)]);
						this.ctx.stroke();
					}
					if (isBezierCurve(boxPaths[1])) {
						const path1 = boxPaths[1];
						const path2 = boxPaths[2];
						this.ctx.beginPath();
						this.pathCallbacks.formatPath([new Vector(path1.end.x, path1.end.y), new Vector(path2.start.x, path2.start.y)]);
						this.ctx.stroke();
					}
				}
				this.ctx.restore();
			}
		};
		var BorderImageRenderer = class {
			constructor(ctx) {
				this.ctx = ctx;
			}
			renderBorderImage(bounds, image, slice, repeat, borderTopWidth, borderRightWidth, borderBottomWidth, borderLeftWidth) {
				const imgW = image.naturalWidth || image.width;
				const imgH = image.naturalHeight || image.height;
				if (imgW <= 0 || imgH <= 0) return;
				const sT = Math.min(slice.unit === "percent" ? slice.top / 100 * imgH : Math.min(slice.top, imgH), imgH);
				const sR = Math.min(slice.unit === "percent" ? slice.right / 100 * imgW : Math.min(slice.right, imgW), imgW);
				const sB = Math.min(slice.unit === "percent" ? slice.bottom / 100 * imgH : Math.min(slice.bottom, imgH), imgH);
				const sL = Math.min(slice.unit === "percent" ? slice.left / 100 * imgW : Math.min(slice.left, imgW), imgW);
				const { left, top, width, height } = bounds;
				if (width <= 0 || height <= 0) return;
				const dT = Math.min(borderTopWidth, height);
				const dR = Math.min(borderRightWidth, width);
				const dB = Math.min(borderBottomWidth, height - dT);
				const dL = Math.min(borderLeftWidth, width - dR);
				this.drawRegion(image, 0, 0, sL, sT, left, top, dL, dT);
				this.drawRegion(image, imgW - sR, 0, sR, sT, left + width - dR, top, dR, dT);
				this.drawRegion(image, imgW - sR, imgH - sB, sR, sB, left + width - dR, top + height - dB, dR, dB);
				this.drawRegion(image, 0, imgH - sB, sL, sB, left, top + height - dB, dL, dB);
				const edges = [
					{
						sx: sL,
						sy: 0,
						sw: imgW - sL - sR,
						sh: sT,
						dx: left + dL,
						dy: top,
						dw: width - dL - dR,
						dh: dT,
						repeat: repeat.horizontal
					},
					{
						sx: imgW - sR,
						sy: sT,
						sw: sR,
						sh: imgH - sT - sB,
						dx: left + width - dR,
						dy: top + dT,
						dw: dR,
						dh: height - dT - dB,
						repeat: repeat.vertical
					},
					{
						sx: sL,
						sy: imgH - sB,
						sw: imgW - sL - sR,
						sh: sB,
						dx: left + dL,
						dy: top + height - dB,
						dw: width - dL - dR,
						dh: dB,
						repeat: repeat.horizontal
					},
					{
						sx: 0,
						sy: sT,
						sw: sL,
						sh: imgH - sT - sB,
						dx: left,
						dy: top + dT,
						dw: dL,
						dh: height - dT - dB,
						repeat: repeat.vertical
					}
				];
				for (const edge of edges) {
					if (edge.sw <= 0 || edge.sh <= 0 || edge.dw <= 0 || edge.dh <= 0) continue;
					const isHorizontal = edge.dw >= edge.dh;
					if (edge.repeat === 0) this.ctx.drawImage(image, edge.sx, edge.sy, edge.sw, edge.sh, edge.dx, edge.dy, edge.dw, edge.dh);
					else if (edge.repeat === 1 || edge.repeat === 2) this.drawRepeatedEdge(image, edge, isHorizontal, edge.repeat === 2);
				}
				if (slice.fill) {
					const cx = sL;
					const cy = sT;
					const cw = imgW - sL - sR;
					const ch = imgH - sT - sB;
					const tcx = left + dL;
					const tcy = top + dT;
					const tcw = width - dL - dR;
					const tch = height - dT - dB;
					this.drawRegion(image, cx, cy, cw, ch, tcx, tcy, tcw, tch);
				}
			}
			drawRegion(image, sx, sy, sw, sh, dx, dy, dw, dh) {
				if (sw > 0 && sh > 0 && dw > 0 && dh > 0) this.ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
			}
			drawRepeatedEdge(image, edge, isHorizontal, round) {
				const srcLength = isHorizontal ? edge.sw : edge.sh;
				const tgLength = isHorizontal ? edge.dw : edge.dh;
				if (srcLength <= 0 || tgLength <= 0) return;
				let tileSize;
				let tileCount;
				if (round) {
					tileCount = Math.max(1, Math.round(tgLength / srcLength));
					tileSize = tgLength / tileCount;
				} else {
					tileSize = srcLength;
					tileCount = Math.ceil(tgLength / tileSize);
				}
				this.ctx.save();
				this.ctx.beginPath();
				this.ctx.rect(edge.dx, edge.dy, edge.dw, edge.dh);
				this.ctx.clip();
				for (let i = 0; i < tileCount; i++) {
					const offset = i * tileSize;
					const remaining = tgLength - offset;
					const clampedSize = Math.min(tileSize, remaining);
					if (clampedSize <= 0) break;
					if (isHorizontal) this.ctx.drawImage(image, edge.sx, edge.sy, edge.sw, edge.sh, edge.dx + offset, edge.dy, clampedSize, edge.dh);
					else this.ctx.drawImage(image, edge.sx, edge.sy, edge.sw, edge.sh, edge.dx, edge.dy + offset, edge.dw, clampedSize);
				}
				this.ctx.restore();
			}
		};
		/**
		* Effects Renderer
		*
		* Handles rendering effects including:
		* - Opacity effects
		* - Transform effects (matrix transformations)
		* - Clip effects (overflow / border-radius clipping via Path[])
		* - Clip-path effects (CSS clip-path shapes: inset, circle, ellipse, polygon, path)
		* - Blend effects (mix-blend-mode)
		* - Filter effects (CSS filter functions)
		*/
		/**
		* Effects Renderer
		*
		* Manages rendering effects stack including opacity, transforms, and clipping.
		* Extracted from CanvasRenderer to improve code organization and maintainability.
		*
		* ## Save/restore optimisation
		*
		* Canvas `save()` / `restore()` snapshot and restore the entire canvas state
		* (transform matrix, clip region, compositing mode, filter, shadow, …) which
		* is relatively expensive. The old implementation called `save()` / `restore()`
		* for every single effect unconditionally.
		*
		* This implementation does a **batch pre-scan** before applying effects:
		*
		* | Effect type        | Modifies             | Reversible?   | Needs save? |
		* |--------------------|----------------------|---------------|-------------|
		* | TransformEffect     | transform matrix     | ❌ irreversible | **YES**     |
		* | ClipEffect         | clip region          | ❌ cumulative   | **YES**     |
		* | ClipPathEffect     | clip region          | ❌ cumulative   | **YES**     |
		* | OpacityEffect      | globalAlpha          | ✅ scalar       | NO          |
		* | BlendEffect        | globalCompositeOp    | ✅ scalar       | NO          |
		* | FilterEffect       | filter + shadow      | ✅ string+vec   | NO          |
		*
		* When the batch contains *only* lightweight effects (opacity / blend / filter)
		* we skip `save()` entirely and manually reset properties on pop.
		*
		* When the batch contains at least one heavyweight effect (transform / clip /
		* clip-path) we call `save()` **once** before the first heavyweight effect and
		* `restore()` **once** when that effect is popped.
		*/
		var EffectsRenderer = class {
			constructor(deps, pathCallback) {
				this.activeEffects = [];
				this.didSave = false;
				this.saveAtDepth = -1;
				this.ctx = deps.ctx;
				this.pathCallback = pathCallback;
			}
			/**
			* Apply multiple effects.
			* Clears existing effects and applies new ones.
			*/
			applyEffects(effects) {
				while (this.activeEffects.length) this.popEffect();
				this.didSave = false;
				this.saveAtDepth = -1;
				const isHeavy = (e) => isTransformEffect(e) || isClipEffect(e) || isClipPathEffect(e);
				const lastHeavyIdx = effects.reduceRight((found, e, idx) => found !== -1 ? found : isHeavy(e) ? idx : -1, -1);
				for (let i = 0; i < effects.length; i++) {
					const effect = effects[i];
					if (isHeavy(effect)) {
						if (!this.didSave) {
							this.ctx.save();
							this.didSave = true;
						}
						if (i === lastHeavyIdx) this.saveAtDepth = this.activeEffects.length;
					}
					this.applyEffect(effect);
				}
			}
			/**
			* Apply a single effect (called internally by applyEffects).
			*/
			applyEffect(effect) {
				if (isTransformEffect(effect)) {
					this.ctx.translate(effect.offsetX, effect.offsetY);
					this.ctx.transform(effect.matrix[0], effect.matrix[1], effect.matrix[2], effect.matrix[3], effect.matrix[4], effect.matrix[5]);
					this.ctx.translate(-effect.offsetX, -effect.offsetY);
				} else if (isClipEffect(effect)) {
					this.pathCallback.path(effect.path);
					this.ctx.clip();
				} else if (isClipPathEffect(effect)) effect.applyClip(this.ctx);
				else if (isOpacityEffect(effect)) this.ctx.globalAlpha *= effect.opacity;
				else if (isBlendEffect(effect)) this.ctx.globalCompositeOperation = effect.compositeOperation;
				else if (isFilterEffect(effect)) {
					this.ctx.filter = effect.safeFilterString || "none";
					if (effect.shadow) {
						this.ctx.shadowOffsetX = effect.shadow.offsetX;
						this.ctx.shadowOffsetY = effect.shadow.offsetY;
						this.ctx.shadowBlur = effect.shadow.blur;
						this.ctx.shadowColor = effect.shadow.color;
					}
				}
				this.activeEffects.push(effect);
			}
			/**
			* Remove the most recent effect.
			* Restores canvas state if needed.
			*/
			popEffect() {
				if (this.activeEffects.length === 0) return;
				if (this.didSave && this.activeEffects.length - 1 === this.saveAtDepth) {
					this.ctx.restore();
					this.didSave = false;
					this.saveAtDepth = -1;
				}
				this.activeEffects.pop();
				if (!this.didSave && this.activeEffects.length === 0) {
					this.ctx.globalAlpha = 1;
					this.ctx.globalCompositeOperation = "source-over";
					this.ctx.filter = "none";
					this.ctx.shadowOffsetX = 0;
					this.ctx.shadowOffsetY = 0;
					this.ctx.shadowBlur = 0;
					this.ctx.shadowColor = "rgba(0, 0, 0, 0)";
				}
			}
			/**
			* Get the current number of active effects.
			*/
			getActiveEffectCount() {
				return this.activeEffects.length;
			}
			/**
			* Check if there are any active effects.
			*/
			hasActiveEffects() {
				return this.activeEffects.length > 0;
			}
		};
		const calculateObjectFitRendering = (intrinsicWidth, intrinsicHeight, box, objectFit, objectPosition) => {
			let sx = 0;
			let sy = 0;
			let sw = intrinsicWidth;
			let sh = intrinsicHeight;
			let dx = box.left;
			let dy = box.top;
			let dw = box.width;
			let dh = box.height;
			const boxRatio = dw / dh;
			const imgRatio = sw / sh;
			const posX = objectPosition ? getAbsoluteValue(objectPosition[0], 1) : .5;
			const posY = objectPosition ? getAbsoluteValue(objectPosition[1], 1) : .5;
			if (objectFit === 2) if (imgRatio > boxRatio) {
				dh = dw / imgRatio;
				dy += (box.height - dh) * posY;
			} else {
				dw = dh * imgRatio;
				dx += (box.width - dw) * posX;
			}
			else if (objectFit === 4) if (imgRatio > boxRatio) {
				sw = sh * boxRatio;
				sx += (intrinsicWidth - sw) * posX;
			} else {
				sh = sw / boxRatio;
				sy += (intrinsicHeight - sh) * posY;
			}
			else if (objectFit === 8) {
				if (sw > dw) {
					sx += (sw - dw) * posX;
					sw = dw;
				} else {
					dx += (dw - sw) * posX;
					dw = sw;
				}
				if (sh > dh) {
					sy += (sh - dh) * posY;
					sh = dh;
				} else {
					dy += (dh - sh) * posY;
					dh = sh;
				}
			} else if (objectFit === 16) if ((imgRatio > boxRatio ? dw : dh * imgRatio) < (sw > dw ? sw : dw)) if (imgRatio > boxRatio) {
				dh = dw / imgRatio;
				dy += (box.height - dh) * posY;
			} else {
				dw = dh * imgRatio;
				dx += (box.width - dw) * posX;
			}
			else {
				if (sw > dw) {
					sx += (sw - dw) * posX;
					sw = dw;
				} else {
					dx += (dw - sw) * posX;
					dw = sw;
				}
				if (sh > dh) {
					sy += (sh - dh) * posY;
					sh = dh;
				} else {
					dy += (dh - sh) * posY;
					dh = sh;
				}
			}
			return {
				sx,
				sy,
				sw,
				sh,
				dx,
				dy,
				dw,
				dh
			};
		};
		/**
		* Render replaced elements: Image, Canvas, SVG, IFrame.
		*/
		async function renderReplacedElements(ctx, context, options, iframeRendererFactory, container, curves, styles, renderReplacedElementFn) {
			if (container instanceof ImageElementContainer) try {
				const image = await context.cache.match(container.src);
				const prevSmoothing = ctx.imageSmoothingEnabled;
				if (styles.imageRendering === 2 || styles.imageRendering === 1) ctx.imageSmoothingEnabled = false;
				else if (styles.imageRendering === 3) ctx.imageSmoothingEnabled = true;
				renderReplacedElementFn(container, curves, image);
				ctx.imageSmoothingEnabled = prevSmoothing;
			} catch (e) {
				context.logger.error(`Error loading image ${container.src}`);
				context.onError?.(e instanceof Error ? e : new Error(String(e)));
			}
			if (container instanceof CanvasElementContainer) renderReplacedElementFn(container, curves, container.canvas);
			if (container instanceof SVGElementContainer) try {
				renderReplacedElementFn(container, curves, await context.cache.match(container.svg));
			} catch (e) {
				context.logger.error(`Error loading svg ${container.svg.substring(0, 255)}`);
				context.onError?.(e instanceof Error ? e : new Error(String(e)));
			}
			if (container instanceof IFrameElementContainer && container.tree) {
				const canvas = await iframeRendererFactory(context, {
					scale: options.scale,
					backgroundColor: container.backgroundColor,
					x: 0,
					y: 0,
					width: container.width,
					height: container.height
				}).render(container.tree);
				if (container.width && container.height) ctx.drawImage(canvas, 0, 0, container.width, container.height, container.bounds.left, container.bounds.top, container.bounds.width, container.bounds.height);
			}
		}
		/**
		* Render form element content: checkbox, radio, text input.
		*/
		function renderFormElements(ctx, textRenderer, pathFn, container, styles) {
			if (container instanceof InputElementContainer) {
				const size = Math.min(container.bounds.width, container.bounds.height);
				if (container.type === "checkbox" && container.checked) {
					ctx.save();
					pathFn([
						new Vector(container.bounds.left + size * .39363, container.bounds.top + size * .79),
						new Vector(container.bounds.left + size * .16, container.bounds.top + size * .5549),
						new Vector(container.bounds.left + size * .27347, container.bounds.top + size * .44071),
						new Vector(container.bounds.left + size * .39694, container.bounds.top + size * .5649),
						new Vector(container.bounds.left + size * .72983, container.bounds.top + size * .23),
						new Vector(container.bounds.left + size * .84, container.bounds.top + size * .34085),
						new Vector(container.bounds.left + size * .39363, container.bounds.top + size * .79)
					]);
					ctx.fillStyle = asString(INPUT_COLOR);
					ctx.fill();
					ctx.restore();
				} else if (container.type === "radio" && container.checked) {
					ctx.save();
					ctx.beginPath();
					ctx.arc(container.bounds.left + size / 2, container.bounds.top + size / 2, size / 4, 0, Math.PI * 2, true);
					ctx.fillStyle = asString(INPUT_COLOR);
					ctx.fill();
					ctx.restore();
				}
			}
			if (isTextInputElement(container) && container.value.length) {
				const [font] = textRenderer.createFontStyle(styles);
				ctx.font = font;
				const baseline = measureBaseline(ctx, getAbsoluteValue(styles.fontSize, 0));
				ctx.fillStyle = container instanceof InputElementContainer && container.isPlaceholder ? asString(PLACEHOLDER_COLOR) : asString(styles.color);
				ctx.textBaseline = "alphabetic";
				ctx.textAlign = canvasTextAlign(container.styles.textAlign);
				const bounds = contentBox(container);
				let x = 0;
				switch (container.styles.textAlign) {
					case 1:
						x += bounds.width / 2;
						break;
					case 2:
						x += bounds.width;
						break;
				}
				let verticalOffset = 0;
				if (container instanceof InputElementContainer) {
					const fontSizeValue = getAbsoluteValue(styles.fontSize, 0);
					verticalOffset = (bounds.height - fontSizeValue) / 2;
				}
				const textBounds = bounds.add(x, verticalOffset, 0, 0);
				ctx.save();
				pathFn([
					new Vector(bounds.left, bounds.top),
					new Vector(bounds.left + bounds.width, bounds.top),
					new Vector(bounds.left + bounds.width, bounds.top + bounds.height),
					new Vector(bounds.left, bounds.top + bounds.height)
				]);
				ctx.clip();
				const lines = wrapTextToWidth(ctx, container.value, bounds.width, styles.whiteSpace === "pre" || styles.whiteSpace === "nowrap");
				const fontSizeValue = getAbsoluteValue(styles.fontSize, 0);
				const lineHeight = computeLineHeight(styles.lineHeight, fontSizeValue);
				lines.forEach((line, index) => {
					let lineX = textBounds.left;
					const lineWidth = ctx.measureText(line).width;
					switch (styles.textAlign) {
						case 1:
							lineX += (bounds.width - lineWidth) / 2;
							break;
						case 2:
							lineX += bounds.width - lineWidth;
							break;
					}
					const lineBounds = new Bounds(lineX, textBounds.top + index * lineHeight, 0, 0);
					textRenderer.renderTextWithLetterSpacing(new TextBounds(line, lineBounds), styles.letterSpacing, baseline, styles.writingMode);
				});
				ctx.restore();
				ctx.textBaseline = "alphabetic";
				ctx.textAlign = "left";
			}
		}
		/**
		* Split text into lines that fit the given pixel width, preserving hard line
		* breaks and (when wrapping is enabled) breaking at word boundaries — mirroring
		* how a <textarea> lays out its value.
		* @internal exported for testing
		*/
		const wrapTextToWidth = (ctx, text, maxWidth, noWrap) => {
			const lines = [];
			const paragraphs = text.split("\n");
			for (const paragraph of paragraphs) {
				if (noWrap) {
					lines.push(paragraph);
					continue;
				}
				const words = paragraph.split(/(\s+)/);
				let line = "";
				for (const word of words) {
					const candidate = line + word;
					if (ctx.measureText(candidate).width <= maxWidth || line === "") line = candidate;
					else {
						lines.push(line);
						line = word;
					}
				}
				lines.push(line);
			}
			return lines;
		};
		/**
		* Render list-item marker (image or text).
		*/
		async function renderListMarker(ctx, context, textRenderer, paint, container, styles) {
			if (!contains(container.styles.display, 2048)) return;
			if (container.styles.listStyleImage !== null) {
				const img = container.styles.listStyleImage;
				if (img.type === 0) {
					const url = img.url;
					try {
						const image = await context.cache.match(url);
						ctx.drawImage(image, container.bounds.left - (image.width + 10), container.bounds.top);
					} catch (e) {
						context.logger.error(`Error loading list-style-image ${url}`);
						context.onError?.(e instanceof Error ? e : new Error(String(e)));
					}
				}
			} else if (paint.listValue && container.styles.listStyleType !== -1) {
				const [font] = textRenderer.createFontStyle(styles);
				ctx.font = font;
				ctx.fillStyle = asString(styles.color);
				ctx.textBaseline = "middle";
				ctx.textAlign = "right";
				const bounds = new Bounds(container.bounds.left, container.bounds.top + getAbsoluteValue(container.styles.paddingTop, container.bounds.width), container.bounds.width, computeLineHeight(styles.lineHeight, styles.fontSize.number) / 2 + 1);
				textRenderer.renderTextWithLetterSpacing(new TextBounds(paint.listValue, bounds), styles.letterSpacing, computeLineHeight(styles.lineHeight, styles.fontSize.number) / 2 + 2, styles.writingMode);
				ctx.textBaseline = "bottom";
				ctx.textAlign = "left";
			}
		}
		/**
		* Type guard for text input containers.
		*/
		const isTextInputElement = (container) => {
			if (container instanceof TextareaElementContainer) return true;
			else if (container instanceof SelectElementContainer) return true;
			else if (container instanceof InputElementContainer && container.type !== "radio" && container.type !== "checkbox") return true;
			return false;
		};
		/**
		* Map CSS text-align to Canvas textAlign.
		*/
		const canvasTextAlign = (textAlign) => {
			switch (textAlign) {
				case 1: return "center";
				case 2: return "right";
				default: return "left";
			}
		};
		var CanvasRenderer = class CanvasRenderer {
			constructor(context, options) {
				this.context = context;
				this.options = options;
				this.canvas = options.canvas ? options.canvas : document.createElement("canvas");
				const ctx = this.canvas.getContext("2d");
				if (!ctx) throw new Error("Failed to get 2D rendering context from canvas");
				this.ctx = ctx;
				if (!options.canvas) {
					this.canvas.width = Math.floor(options.width * options.scale);
					this.canvas.height = Math.floor(options.height * options.scale);
					this.canvas.style.width = `${options.width}px`;
					this.canvas.style.height = `${options.height}px`;
				}
				this.ctx.scale(this.options.scale, this.options.scale);
				this.ctx.translate(-options.x, -options.y);
				this.ctx.textBaseline = "bottom";
				if (options.imageSmoothing !== void 0) this.ctx.imageSmoothingEnabled = options.imageSmoothing;
				if (options.imageSmoothingQuality) this.ctx.imageSmoothingQuality = options.imageSmoothingQuality;
				this.backgroundRenderer = new BackgroundRenderer({
					ctx: this.ctx,
					context: this.context,
					canvas: this.canvas,
					options: {
						width: options.width,
						height: options.height,
						scale: options.scale
					}
				});
				this.borderRenderer = new BorderRenderer({ ctx: this.ctx }, {
					path: (paths) => this.path(paths),
					formatPath: (paths) => this.formatPath(paths)
				});
				this.borderImageRenderer = new BorderImageRenderer(this.ctx);
				this.effectsRenderer = new EffectsRenderer({ ctx: this.ctx }, { path: (paths) => this.path(paths) });
				this.textRenderer = new TextRenderer({
					ctx: this.ctx,
					options: { scale: options.scale }
				});
				this.context.logger.debug(`Canvas renderer initialized (${options.width}x${options.height}) with scale ${options.scale}`);
			}
			async renderStack(stack) {
				if (stack.element.container.styles.isVisible()) await this.renderStackContent(stack);
			}
			async renderNode(paint) {
				if (paint.container.debugRender) debugger;
				if (paint.container.styles.isVisible()) {
					await this.renderNodeBackgroundAndBorders(paint);
					await this.renderNodeContent(paint);
				}
			}
			/**
			* Helper method to render text with paint order support
			* Reduces code duplication in line-clamp and normal rendering
			*/
			renderReplacedElement(container, curves, image) {
				const intrinsicWidth = image.naturalWidth || container.intrinsicWidth;
				const intrinsicHeight = image.naturalHeight || container.intrinsicHeight;
				if (image && intrinsicWidth > 0 && intrinsicHeight > 0) {
					const box = contentBox(container);
					const path = calculatePaddingBoxPath(curves);
					this.path(path);
					this.ctx.save();
					this.ctx.clip();
					const { sx, sy, sw, sh, dx, dy, dw, dh } = calculateObjectFitRendering(intrinsicWidth, intrinsicHeight, box, container.styles.objectFit, container.styles.objectPosition);
					this.ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
					this.ctx.restore();
				}
			}
			async renderNodeContent(paint) {
				this.effectsRenderer.applyEffects(paint.getEffects(4));
				const container = paint.container;
				const curves = paint.curves;
				const styles = container.styles;
				const textBounds = contentBox(container);
				for (const child of container.textNodes) await this.textRenderer.renderTextNode(child, styles, textBounds);
				await renderReplacedElements(this.ctx, this.context, {
					scale: this.options.scale,
					backgroundColor: this.options.backgroundColor,
					x: this.options.x,
					y: this.options.y,
					width: this.options.width,
					height: this.options.height
				}, (ctx, opts) => new CanvasRenderer(ctx, opts), container, curves, styles, (c, cv, img) => this.renderReplacedElement(c, cv, img));
				renderFormElements(this.ctx, this.textRenderer, this.path.bind(this), container, styles);
				await renderListMarker(this.ctx, this.context, this.textRenderer, paint, container, styles);
			}
			async renderStackContent(stack) {
				if (stack.element.container.debugRender) debugger;
				const signal = this.options.signal;
				await this.renderNodeBackgroundAndBorders(stack.element);
				for (const child of stack.negativeZIndex) {
					if (signal?.aborted) throw new DOMException("The operation was aborted.", "AbortError");
					await this.renderStack(child);
				}
				if (signal?.aborted) throw new DOMException("The operation was aborted.", "AbortError");
				await this.renderNodeContent(stack.element);
				for (const child of stack.nonInlineLevel) await this.renderNode(child);
				for (const child of stack.nonPositionedFloats) {
					if (signal?.aborted) throw new DOMException("The operation was aborted.", "AbortError");
					await this.renderStack(child);
				}
				for (const child of stack.nonPositionedInlineLevel) {
					if (signal?.aborted) throw new DOMException("The operation was aborted.", "AbortError");
					await this.renderStack(child);
				}
				for (const child of stack.inlineLevel) await this.renderNode(child);
				for (const child of stack.zeroOrAutoZIndexOrTransformedOrOpacity) {
					if (signal?.aborted) throw new DOMException("The operation was aborted.", "AbortError");
					await this.renderStack(child);
				}
				for (const child of stack.positiveZIndex) {
					if (signal?.aborted) throw new DOMException("The operation was aborted.", "AbortError");
					await this.renderStack(child);
				}
			}
			mask(paths) {
				this.ctx.beginPath();
				const x = this.options.x;
				const y = this.options.y;
				this.ctx.moveTo(x, y);
				this.ctx.lineTo(x + this.options.width, y);
				this.ctx.lineTo(x + this.options.width, y + this.options.height);
				this.ctx.lineTo(x, y + this.options.height);
				this.ctx.lineTo(x, y);
				this.formatPath(paths.slice(0).reverse());
				this.ctx.closePath();
			}
			path(paths) {
				createCanvasPath(this.ctx, paths);
			}
			formatPath(paths) {
				formatCanvasPath(this.ctx, paths);
			}
			async renderNodeBackgroundAndBorders(paint) {
				this.effectsRenderer.applyEffects(paint.getEffects(2));
				const styles = paint.container.styles;
				const hasBackground = !isTransparent(styles.backgroundColor) || styles.backgroundImage.length;
				const hasTextClip = hasTextBackgroundClip(styles);
				const borders = [
					{
						style: styles.borderTopStyle,
						color: styles.borderTopColor,
						width: styles.borderTopWidth
					},
					{
						style: styles.borderRightStyle,
						color: styles.borderRightColor,
						width: styles.borderRightWidth
					},
					{
						style: styles.borderBottomStyle,
						color: styles.borderBottomColor,
						width: styles.borderBottomWidth
					},
					{
						style: styles.borderLeftStyle,
						color: styles.borderLeftColor,
						width: styles.borderLeftWidth
					}
				];
				const backgroundPaintingArea = calculateBackgroundCurvedPaintingArea(getBackgroundValueForIndex(styles.backgroundClip, 0), paint.curves);
				if (hasBackground || styles.boxShadow.length) {
					if (hasTextClip && paint.container.textNodes.length > 0) await this.renderTextClippedBackground(paint);
					else {
						this.ctx.save();
						this.path(backgroundPaintingArea);
						this.ctx.clip();
						if (!isTransparent(styles.backgroundColor)) {
							this.ctx.fillStyle = asString(styles.backgroundColor);
							this.ctx.fill();
						}
						await this.backgroundRenderer.renderBackgroundImage(paint.container);
						this.ctx.restore();
					}
					styles.boxShadow.slice(0).reverse().forEach((shadow) => {
						this.ctx.save();
						const borderBoxArea = calculateBorderBoxPath(paint.curves);
						const maskOffset = shadow.inset ? 0 : SHADOW_MASK_OFFSET;
						const shadowPaintingArea = transformPath(borderBoxArea, -maskOffset + (shadow.inset ? 1 : -1) * shadow.spread.number, (shadow.inset ? 1 : -1) * shadow.spread.number, shadow.spread.number * (shadow.inset ? -2 : 2), shadow.spread.number * (shadow.inset ? -2 : 2));
						if (shadow.inset) {
							this.path(borderBoxArea);
							this.ctx.clip();
							this.mask(shadowPaintingArea);
						} else {
							this.mask(borderBoxArea);
							this.ctx.clip();
							this.path(shadowPaintingArea);
						}
						this.ctx.shadowOffsetX = shadow.offsetX.number + maskOffset;
						this.ctx.shadowOffsetY = shadow.offsetY.number;
						this.ctx.shadowColor = asString(shadow.color);
						this.ctx.shadowBlur = shadow.blur.number;
						this.ctx.fillStyle = shadow.inset ? asString(shadow.color) : "rgba(0,0,0,1)";
						this.ctx.fill();
						this.ctx.restore();
					});
				}
				if (styles.borderImageSource) {
					const source = styles.borderImageSource;
					if (source.type === 0) {
						const url = source.url;
						try {
							const image = await this.context.cache.match(url);
							if (image) {
								const bounds = paint.container.bounds;
								this.borderImageRenderer.renderBorderImage(bounds, image, styles.borderImageSlice, styles.borderImageRepeat, Math.max(0, styles.borderTopWidth), Math.max(0, styles.borderRightWidth), Math.max(0, styles.borderBottomWidth), Math.max(0, styles.borderLeftWidth));
							}
						} catch (e) {
							this.context.logger.error(`Error loading border-image ${url}`);
						}
					}
					return;
				}
				let side = 0;
				for (const border of borders) {
					if (border.style !== 0 && !isTransparent(border.color) && border.width > 0) {
						const renderBorderSide = async () => {
							if (border.style === 2) await this.borderRenderer.renderDashedDottedBorder(border.color, border.width, side, paint.curves, 2);
							else if (border.style === 3) await this.borderRenderer.renderDashedDottedBorder(border.color, border.width, side, paint.curves, 3);
							else if (border.style === 4) await this.borderRenderer.renderDoubleBorder(border.color, border.width, side, paint.curves);
							else await this.borderRenderer.renderSolidBorder(border.color, side, paint.curves);
						};
						const legend = paint.container.legendBounds;
						if (side === 0 && legend) {
							const bounds = paint.container.bounds;
							const legendLeft = legend.left - bounds.left;
							const legendRight = legend.left + legend.width - bounds.left;
							if (legendLeft > 0) {
								this.ctx.save();
								this.ctx.beginPath();
								this.ctx.rect(bounds.left, bounds.top, legendLeft, bounds.height);
								this.ctx.clip();
								await renderBorderSide();
								this.ctx.restore();
							}
							const rightStart = bounds.left + legendRight;
							const rightWidth = bounds.width - legendRight;
							if (rightWidth > 0) {
								this.ctx.save();
								this.ctx.beginPath();
								this.ctx.rect(rightStart, bounds.top, rightWidth, bounds.height);
								this.ctx.clip();
								await renderBorderSide();
								this.ctx.restore();
							}
						} else await renderBorderSide();
					}
					side++;
				}
			}
			async render(element) {
				if (this.options.backgroundColor) {
					this.ctx.fillStyle = asString(this.options.backgroundColor);
					this.ctx.fillRect(this.options.x, this.options.y, this.options.width, this.options.height);
				}
				const stack = parseStackingContexts(element);
				await this.renderStack(stack);
				this.effectsRenderer.applyEffects([]);
				return this.canvas;
			}
			/**
			* Render background clipped to text shape using offscreen canvas with destination-in compositing.
			* This implements background-clip: text support.
			*
			* Algorithm:
			*   1. Draw background (color + images) onto an offscreen canvas
			*   2. Use destination-in compositing to clip the background to the text glyph shapes
			*   3. Composite the result back onto the main canvas
			*
			* The offscreen canvas uses CSS-pixel dimensions (not device-pixel) because the
			* background renderer handles scaling internally via BackgroundRenderer options.
			*/
			async renderTextClippedBackground(paint) {
				const container = paint.container;
				const styles = container.styles;
				const bounds = container.bounds;
				if (bounds.width <= 0 || bounds.height <= 0) return;
				const offscreen = (this.canvas.ownerDocument ?? document).createElement("canvas");
				const width = Math.ceil(bounds.width);
				const height = Math.ceil(bounds.height);
				offscreen.width = width;
				offscreen.height = height;
				const offCtx = offscreen.getContext("2d");
				if (!offCtx) return;
				const [fontString] = this.textRenderer.createFontStyle(styles);
				offCtx.font = fontString;
				offCtx.textBaseline = "alphabetic";
				offCtx.textAlign = "left";
				offCtx.direction = styles.direction === 1 ? "rtl" : "ltr";
				const baseline = measureBaseline(offCtx, styles.fontSize.number);
				const bgRenderer = new BackgroundRenderer({
					ctx: offCtx,
					context: this.context,
					canvas: offscreen,
					options: {
						width,
						height,
						scale: 1
					}
				});
				if (!isTransparent(styles.backgroundColor)) {
					offCtx.fillStyle = asString(styles.backgroundColor);
					offCtx.fillRect(0, 0, width, height);
				}
				offCtx.save();
				offCtx.translate(-bounds.left, -bounds.top);
				await bgRenderer.renderBackgroundImage(container);
				offCtx.restore();
				offCtx.globalCompositeOperation = "destination-in";
				offCtx.fillStyle = "#000";
				const writingMode = styles.writingMode;
				const letterSpacing = styles.letterSpacing;
				for (const textNode of container.textNodes) for (const textBound of textNode.textBounds) {
					const localLeft = textBound.bounds.left - bounds.left;
					const localTop = textBound.bounds.top - bounds.top + baseline;
					if (letterSpacing > 0) this.renderTextMaskWithLetterSpacing(offCtx, textBound, letterSpacing, localLeft, localTop, writingMode);
					else offCtx.fillText(textBound.text, localLeft, localTop);
				}
				this.ctx.drawImage(offscreen, bounds.left, bounds.top);
			}
			/**
			* Render text glyphs one-by-one as a mask, applying letter-spacing between characters.
			* This ensures the mask matches how the text renderer lays out the characters.
			*/
			renderTextMaskWithLetterSpacing(ctx, text, letterSpacing, x, y, writingMode) {
				const letters = segmentGraphemes(text.text);
				let offset = x;
				for (const letter of letters) {
					if (isVerticalWritingMode(writingMode)) {
						ctx.fillText(text.text, x, y);
						return;
					}
					ctx.fillText(letter, offset, y);
					offset += ctx.measureText(letter).width + letterSpacing;
				}
			}
		};
		const calculateBackgroundCurvedPaintingArea = (clip, curves) => {
			switch (clip) {
				case 0: return calculateBorderBoxPath(curves);
				case 2: return calculateContentBoxPath(curves);
				default: return calculatePaddingBoxPath(curves);
			}
		};
		/**
		* Check if any background layer uses background-clip: text
		*/
		const hasTextBackgroundClip = (styles) => {
			return styles.backgroundClip.some((clip) => clip === 3);
		};
		var ForeignObjectRenderer = class {
			constructor(context, options) {
				this.context = context;
				this.options = options;
				this.canvas = options.canvas ? options.canvas : document.createElement("canvas");
				const ctx = this.canvas.getContext("2d");
				if (!ctx) throw new Error("Failed to get 2D rendering context from canvas");
				this.ctx = ctx;
				this.canvas.width = Math.floor(options.width * options.scale);
				this.canvas.height = Math.floor(options.height * options.scale);
				this.canvas.style.width = `${options.width}px`;
				this.canvas.style.height = `${options.height}px`;
				this.ctx.scale(this.options.scale, this.options.scale);
				this.ctx.translate(-options.x, -options.y);
				this.context.logger.debug(`EXPERIMENTAL ForeignObject renderer initialized (${options.width}x${options.height} at ${options.x},${options.y}) with scale ${options.scale}`);
			}
			async render(element) {
				if (this.options.signal?.aborted) throw new DOMException("The operation was aborted.", "AbortError");
				const img = await loadSerializedSVG(createForeignObjectSVG(this.options.width * this.options.scale, this.options.height * this.options.scale, this.options.scale, this.options.scale, element));
				if (this.options.backgroundColor) {
					this.ctx.fillStyle = asString(this.options.backgroundColor);
					this.ctx.fillRect(0, 0, this.options.width * this.options.scale, this.options.height * this.options.scale);
				}
				this.ctx.drawImage(img, -this.options.x * this.options.scale, -this.options.y * this.options.scale);
				return this.canvas;
			}
		};
		var Logger = class {
			static {
				this.instances = {};
			}
			constructor({ id, enabled }) {
				this.id = id;
				this.enabled = enabled;
				this.start = Date.now();
			}
			debug(...args) {
				if (this.enabled) if (typeof window !== "undefined" && window.console && typeof console.debug === "function") console.debug(this.id, `${this.getTime()}ms`, ...args);
				else this.info(...args);
			}
			getTime() {
				return Date.now() - this.start;
			}
			info(...args) {
				if (this.enabled) {
					if (typeof window !== "undefined" && window.console && typeof console.info === "function") console.info(this.id, `${this.getTime()}ms`, ...args);
				}
			}
			warn(...args) {
				if (this.enabled) if (typeof window !== "undefined" && window.console && typeof console.warn === "function") console.warn(this.id, `${this.getTime()}ms`, ...args);
				else this.info(...args);
			}
			error(...args) {
				if (this.enabled) if (typeof window !== "undefined" && window.console && typeof console.error === "function") console.error(this.id, `${this.getTime()}ms`, ...args);
				else this.info(...args);
			}
		};
		var Cache = class {
			constructor(context, _options) {
				this.context = context;
				this._options = _options;
				this._cache = /* @__PURE__ */ new Map();
				this._pendingOperations = /* @__PURE__ */ new Map();
				this._deferMode = false;
				this._collectedUrls = /* @__PURE__ */ new Set();
				this.maxSize = _options.maxCacheSize ?? 100;
				if (this.maxSize < 1) throw new Error("Cache maxSize must be at least 1");
				if (this.maxSize > 1e4) this.context.logger.warn(`Cache maxSize ${this.maxSize} is very large and may cause memory issues. Consider using a smaller value (recommended: 100-1000).`);
			}
			/**
			* Enter defer mode: subsequent addImage() calls only collect URLs.
			* Call preloadAll() to exit defer mode and batch-load all URLs.
			*/
			startDefer() {
				this._deferMode = true;
			}
			/**
			* Exit defer mode and load all collected URLs in parallel, respecting
			* an optional concurrency cap to avoid overwhelming the browser's network
			* stack (default: 10 concurrent loads).
			* After this call returns, all images are either loaded (cache hit) or
			* failed (logged). Subsequent cache.match() calls return immediately.
			*
			* @param concurrency - Max concurrent image loads (1–100, default 10).
			*/
			async preloadAll(concurrency = 10) {
				this._deferMode = false;
				const urls = Array.from(this._collectedUrls);
				this._collectedUrls.clear();
				if (urls.length === 0) return;
				const limit = Math.max(1, Math.min(concurrency, 100));
				this.context.logger.debug(`Preloading ${urls.length} image(s) with concurrency ${limit}`);
				for (let i = 0; i < urls.length; i += limit) {
					const operations = urls.slice(i, i + limit).map((url) => this._addImageWithPending(url));
					await Promise.allSettled(operations);
				}
			}
			addImage(src) {
				if (this._deferMode) {
					if (!this.has(src) && (isBlobImage(src) || isRenderable(src))) this._collectedUrls.add(src);
					return Promise.resolve();
				}
				const pending = this._pendingOperations.get(src);
				if (pending) return pending;
				if (this.has(src)) {
					const entry = this._cache.get(src);
					this._cache.delete(src);
					this._cache.set(src, entry);
					return Promise.resolve();
				}
				if (isBlobImage(src) || isRenderable(src)) return this._addImageWithPending(src);
				return Promise.resolve();
			}
			/**
			* Shared helper: enqueues loading for a single URL with pending-operation
			* deduplication and error swallowing. Used by both addImage() (normal mode)
			* and preloadAll() (batch mode).
			*/
			_addImageWithPending(src) {
				const pending = this._pendingOperations.get(src);
				if (pending) return pending;
				const operation = this._addImageInternal(src);
				this._pendingOperations.set(src, operation);
				operation.finally(() => {
					this._pendingOperations.delete(src);
				});
				return operation;
			}
			async _addImageInternal(src) {
				const timeoutMs = this._options.imageTimeout ?? 15e3;
				const imageWithTimeout = this.withTimeout(this.loadImage(src), timeoutMs, `Timed out (${timeoutMs}ms) loading image`);
				imageWithTimeout.catch((error) => {
					this.context.logger.error(`Failed to load image ${src}: ${error instanceof Error ? error.message : "Unknown error"}`);
				});
				this.set(src, imageWithTimeout);
			}
			withTimeout(promise, timeoutMs, message) {
				if (timeoutMs <= 0) return promise;
				let timeoutId;
				const timeout = new Promise((_, reject) => {
					timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
				});
				return Promise.race([promise, timeout]).finally(() => {
					if (timeoutId !== void 0) clearTimeout(timeoutId);
				});
			}
			match(src) {
				const entry = this._cache.get(src);
				if (entry) {
					this._cache.delete(src);
					this._cache.set(src, entry);
					return entry.value;
				}
			}
			/**
			* Set a value in cache with LRU eviction (O(1) via Map insertion order).
			* Map preserves insertion order; delete+set on access moves items to the end.
			* The first key in Map.keys() is always the least recently used.
			*/
			set(key, value) {
				if (this._cache.has(key)) this._cache.delete(key);
				else if (this._cache.size >= this.maxSize) {
					const lruKey = this._cache.keys().next().value;
					if (lruKey !== void 0) {
						this._cache.delete(lruKey);
						this.context.logger.debug(`Cache: Evicted LRU entry: ${lruKey}`);
					}
				}
				this._cache.set(key, { value });
			}
			/**
			* Get cache size
			*/
			size() {
				return this._cache.size;
			}
			/**
			* Get max cache size
			*/
			getMaxSize() {
				return this.maxSize;
			}
			/**
			* Clear all cache entries
			*/
			clear() {
				this._cache.clear();
			}
			async loadImage(key) {
				const originChecker = this.context.originChecker;
				const defaultIsSameOrigin = (src) => originChecker.isSameOrigin(src);
				const isSameOrigin = typeof this._options.customIsSameOrigin === "function" ? await this._options.customIsSameOrigin(key, defaultIsSameOrigin) : defaultIsSameOrigin(key);
				const canAttemptCors = !isSameOrigin && this._options.allowTaint === false && !isInlineImage(key) && !isBlobImage(key) && typeof this._options.proxy !== "string";
				const useCORS = !isInlineImage(key) && (this._options.useCORS === true || canAttemptCors) && FEATURES.SUPPORT_CORS_IMAGES && !isSameOrigin;
				const useProxy = !isInlineImage(key) && !isSameOrigin && !isBlobImage(key) && typeof this._options.proxy === "string" && FEATURES.SUPPORT_CORS_XHR && !useCORS;
				if (!isSameOrigin && this._options.allowTaint === false && !isInlineImage(key) && !isBlobImage(key) && !useProxy && !useCORS) return;
				let src = key;
				if (useProxy) src = await this.proxy(src);
				this.context.logger.debug(`Added image ${key.substring(0, 256)}`);
				return await new Promise((resolve, reject) => {
					const img = new Image();
					img.onload = () => resolve(img);
					img.onerror = reject;
					if (isInlineBase64Image(src) || useCORS) img.crossOrigin = "anonymous";
					img.src = src;
					if (img.complete === true) setTimeout(() => resolve(img), 500);
				});
			}
			has(key) {
				return this._cache.has(key);
			}
			keys() {
				return Promise.resolve(Array.from(this._cache.keys()));
			}
			proxy(src) {
				const proxy = this._options.proxy;
				if (!proxy) throw new Error("No proxy defined");
				const key = src.substring(0, 256);
				return new Promise((resolve, reject) => {
					const responseType = FEATURES.SUPPORT_RESPONSE_TYPE ? "blob" : "text";
					const xhr = new XMLHttpRequest();
					xhr.onload = () => {
						if (xhr.status === 200) if (responseType === "text") resolve(xhr.response);
						else {
							const reader = new FileReader();
							reader.addEventListener("load", () => resolve(reader.result), false);
							reader.addEventListener("error", (e) => reject(e), false);
							reader.readAsDataURL(xhr.response);
						}
						else reject(`Failed to proxy resource ${key} with status code ${xhr.status}`);
					};
					xhr.onerror = reject;
					const queryString = proxy.indexOf("?") > -1 ? "&" : "?";
					xhr.open("GET", `${proxy}${queryString}url=${encodeURIComponent(src)}&responseType=${responseType}`);
					if (responseType !== "text" && xhr instanceof XMLHttpRequest) xhr.responseType = responseType;
					if (this._options.imageTimeout) {
						const timeout = this._options.imageTimeout;
						xhr.timeout = timeout;
						xhr.ontimeout = () => reject(`Timed out (${timeout}ms) proxying ${key}`);
					}
					xhr.send();
				});
			}
		};
		const INLINE_SVG = /^data:image\/svg\+xml/i;
		const INLINE_BASE64 = /^data:image\/.*;base64,/i;
		const INLINE_IMG = /^data:image\/.*/i;
		const isRenderable = (src) => FEATURES.SUPPORT_SVG_DRAWING || !isSVG(src);
		const isInlineImage = (src) => INLINE_IMG.test(src);
		const isInlineBase64Image = (src) => INLINE_BASE64.test(src);
		const isBlobImage = (src) => src.substring(0, 4) === "blob";
		const isSVG = (src) => src.slice(-3).toLowerCase() === "svg" || INLINE_SVG.test(src);
		/**
		* Origin Checker
		*
		* Provides origin checking functionality without global static state.
		* Each instance maintains its own anchor element and origin reference.
		*
		* Replaces the static methods in CacheStorage with instance-based approach.
		*/
		var OriginChecker = class {
			constructor(window) {
				if (!window || !window.document) throw new Error("Valid window object required for OriginChecker");
				if (!window.location || !window.location.href) throw new Error("Window object must have valid location");
				this.link = window.document.createElement("a");
				this.origin = this.getOrigin(window.location.href);
			}
			/**
			* Get the origin (protocol + hostname + port) of a URL
			*
			* @param url - URL to parse
			* @returns Origin string (e.g., "https://example.com:8080")
			*/
			getOrigin(url) {
				this.link.href = url;
				this.link.href = this.link.href;
				return this.link.protocol + this.link.hostname + this.link.port;
			}
			/**
			* Check if a URL is from the same origin as the context
			*
			* @param src - URL to check
			* @returns true if same origin, false otherwise
			*/
			isSameOrigin(src) {
				return this.getOrigin(src) === this.origin;
			}
			/**
			* Get the current context origin
			*
			* @returns The origin of the context window
			*/
			getContextOrigin() {
				return this.origin;
			}
		};
		var Context = class Context {
			static {
				this.instanceCount = 1;
			}
			constructor(options, windowBounds, config) {
				this.windowBounds = windowBounds;
				this.instanceName = `#${Context.instanceCount++}`;
				this.config = config;
				this.logger = new Logger({
					id: this.instanceName,
					enabled: options.logging
				});
				this.originChecker = new OriginChecker(config.window);
				this.cache = options.cache ?? config.cache ?? new Cache(this, options);
				this.onError = options.onError;
			}
		};
		/**
		* AbortSignal helper utilities.
		*/
		/**
		* Throw a DOMException if the given AbortSignal is already aborted.
		* Used at checkpoints throughout the rendering pipeline to support
		* cancellable renders.
		*
		* @param signal - The AbortSignal to check. If undefined or not aborted, this is a no-op.
		* @throws {DOMException} With name 'AbortError' if the signal has been aborted.
		*/
		const throwIfAborted = (signal) => {
			if (signal?.aborted) throw new DOMException("The operation was aborted.", "AbortError");
		};
		/**
		* Coerce known numeric options from string (or other) values to actual numbers.
		* Mutates the opts object in place — this is intentionally a normalisation
		* (not pure) step that runs once at the beginning of renderElement.
		*/
		const coerceNumberOptions = (opts) => {
			[
				"scale",
				"width",
				"height",
				"imageTimeout",
				"x",
				"y",
				"windowWidth",
				"windowHeight",
				"scrollX",
				"scrollY"
			].forEach((key) => {
				const v = opts[key];
				if (v !== void 0 && v !== null && typeof v !== "number") {
					const n = Number(v);
					if (!Number.isNaN(n)) opts[key] = n;
				}
			});
		};
		/** Assemble resource loading options from user-provided Options. */
		const assembleResourceOptions = (opts) => ({
			allowTaint: opts.allowTaint ?? false,
			imageTimeout: opts.imageTimeout ?? 15e3,
			proxy: opts.proxy,
			useCORS: opts.useCORS ?? false,
			customIsSameOrigin: opts.customIsSameOrigin,
			maxCacheSize: opts.maxCacheSize
		});
		/** Assemble context (logging + cache) options, extending resource options. */
		const assembleContextOptions = (opts, config, resourceOptions) => ({
			logging: opts.logging ?? true,
			cache: opts.cache ?? config.cache,
			...resourceOptions
		});
		const DEFAULT_WINDOW_WIDTH = 800;
		const DEFAULT_WINDOW_HEIGHT = 600;
		const DEFAULT_SCROLL = 0;
		const assembleWindowOptions = (opts, defaultView) => {
			const win = defaultView;
			return {
				windowWidth: opts.windowWidth ?? win.innerWidth ?? DEFAULT_WINDOW_WIDTH,
				windowHeight: opts.windowHeight ?? win.innerHeight ?? DEFAULT_WINDOW_HEIGHT,
				scrollX: opts.scrollX ?? win.pageXOffset ?? DEFAULT_SCROLL,
				scrollY: opts.scrollY ?? win.pageYOffset ?? DEFAULT_SCROLL
			};
		};
		/** Assemble DOM cloning options. */
		const assembleCloneOptions = (opts, config, foreignObjectRendering) => ({
			allowTaint: opts.allowTaint ?? false,
			onclone: opts.onclone,
			ignoreElements: opts.ignoreElements,
			iframeContainer: opts.iframeContainer,
			inlineImages: foreignObjectRendering,
			copyStyles: foreignObjectRendering,
			cspNonce: opts.cspNonce ?? config.cspNonce
		});
		/** Assemble canvas rendering options. */
		const assembleRenderOptions = (opts, backgroundColor, left, top, width, height, devicePixelRatio) => ({
			canvas: opts.canvas,
			backgroundColor,
			signal: opts.signal,
			scale: opts.scale ?? devicePixelRatio ?? 1,
			x: (opts.x ?? 0) + left,
			y: (opts.y ?? 0) + top,
			width: opts.width ?? Math.ceil(width),
			height: opts.height ?? Math.ceil(height),
			imageSmoothing: opts.imageSmoothing,
			imageSmoothingQuality: opts.imageSmoothingQuality
		});
		/**
		* Resolve the background colour for the rendered canvas, following CSS
		* background propagation rules:
		*
		* 1. If the target element is `<html>`, inherit the first opaque ancestor
		*    (doc → body → fallback).
		* 2. Otherwise use the user-supplied backgroundColor, or opaque white.
		*
		* @param context               - Current rendering context.
		* @param element               - The root element being rendered.
		* @param backgroundColorOverride - User-supplied override (string | null).
		* @returns A resolved colour value suitable for filling the canvas.
		*/
		const parseBackgroundColor = (context, element, backgroundColorOverride) => {
			const ownerDocument = element.ownerDocument;
			const documentBackgroundColor = ownerDocument.documentElement ? parseColor(context, getComputedStyle(ownerDocument.documentElement).backgroundColor) : COLORS.TRANSPARENT;
			const bodyBackgroundColor = ownerDocument.body ? parseColor(context, getComputedStyle(ownerDocument.body).backgroundColor) : COLORS.TRANSPARENT;
			const defaultBackgroundColor = typeof backgroundColorOverride === "string" ? parseColor(context, backgroundColorOverride) : backgroundColorOverride === null ? COLORS.TRANSPARENT : 4294967295;
			return element === ownerDocument.documentElement ? isTransparent(documentBackgroundColor) ? isTransparent(bodyBackgroundColor) ? defaultBackgroundColor : bodyBackgroundColor : documentBackgroundColor : defaultBackgroundColor;
		};
		const renderElement = async (element, opts, config) => {
			coerceNumberOptions(opts);
			if (!opts.skipValidation) {
				const validator = opts.validator || createDefaultValidator();
				const elementValidation = validator.validateElement(element);
				if (!elementValidation.valid) throw new Error(elementValidation.error);
				const optionsValidation = validator.validateOptions(opts);
				if (!optionsValidation.valid) throw new Error(`Invalid options: ${optionsValidation.error}`);
			}
			if (!element || typeof element !== "object") throw new Error("Invalid element provided as first argument");
			const ownerDocument = element.ownerDocument;
			if (!ownerDocument) throw new Error(`Element is not attached to a Document`);
			const defaultView = ownerDocument.defaultView;
			if (!defaultView) throw new Error(`Document is not attached to a Window`);
			const contextOptions = assembleContextOptions(opts, config, assembleResourceOptions(opts));
			const windowOptions = assembleWindowOptions(opts, defaultView);
			const windowBounds = new Bounds(windowOptions.scrollX, windowOptions.scrollY, windowOptions.windowWidth, windowOptions.windowHeight);
			const context = new Context(contextOptions, windowBounds, config);
			const performanceMonitoring = opts.enablePerformanceMonitoring ?? opts.logging ?? false;
			const perfMonitor = new PerformanceMonitor(context, performanceMonitoring);
			perfMonitor.start("total", {
				width: windowOptions.windowWidth,
				height: windowOptions.windowHeight
			});
			const signal = opts.signal;
			throwIfAborted(signal);
			const foreignObjectRendering = opts.foreignObjectRendering ?? false;
			const cloneOptions = assembleCloneOptions(opts, config, foreignObjectRendering);
			context.logger.debug(`Starting document clone with size ${windowBounds.width}x${windowBounds.height} scrolled to ${-windowBounds.left},${-windowBounds.top}`);
			perfMonitor.start("clone");
			const documentCloner = new DocumentCloner(context, element, cloneOptions);
			const clonedElement = documentCloner.clonedReferenceElement;
			if (!clonedElement) throw new Error("Unable to find element in cloned iframe");
			const container = await documentCloner.toIFrame(ownerDocument, windowBounds);
			perfMonitor.end("clone");
			if (signal?.aborted) {
				if (opts.removeContainer ?? true) DocumentCloner.destroy(container);
				throwIfAborted(signal);
			}
			const { width, height, left, top } = isBodyElement(clonedElement) || isHTMLElement(clonedElement) ? parseDocumentSize(clonedElement.ownerDocument) : parseBounds(context, clonedElement);
			const backgroundColor = parseBackgroundColor(context, clonedElement, opts.backgroundColor);
			const renderOptions = assembleRenderOptions(opts, backgroundColor, left, top, width, height, defaultView.devicePixelRatio ?? 1);
			let canvas;
			let root;
			try {
				if (foreignObjectRendering) {
					context.logger.debug(`Document cloned, using foreign object rendering`);
					perfMonitor.start("render-foreignobject");
					canvas = await new ForeignObjectRenderer(context, renderOptions).render(clonedElement);
					perfMonitor.end("render-foreignobject");
				} else {
					context.logger.debug(`Document cloned, element located at ${left},${top} with size ${width}x${height} using computed rendering`);
					context.logger.debug(`Starting DOM parsing`);
					perfMonitor.start("parse");
					throwIfAborted(signal);
					context.cache.startDefer();
					root = parseTree(context, clonedElement);
					perfMonitor.end("parse");
					perfMonitor.start("preload");
					await context.cache.preloadAll();
					perfMonitor.end("preload");
					if (backgroundColor === root.styles.backgroundColor) root.styles.backgroundColor = COLORS.TRANSPARENT;
					context.logger.debug(`Starting renderer for element at ${renderOptions.x},${renderOptions.y} with size ${renderOptions.width}x${renderOptions.height}`);
					perfMonitor.start("render");
					throwIfAborted(signal);
					canvas = await new CanvasRenderer(context, renderOptions).render(root);
					perfMonitor.end("render");
				}
				perfMonitor.start("cleanup");
				if (opts.removeContainer ?? true) {
					if (!DocumentCloner.destroy(container)) context.logger.error(`Cannot detach cloned iframe as it is not in the DOM anymore`);
				}
				perfMonitor.end("cleanup");
				perfMonitor.end("total");
				context.logger.debug(`Finished rendering`);
				if (performanceMonitoring) perfMonitor.logSummary();
				return canvas;
			} finally {
				if (root) root.restoreTree();
			}
		};
		/**
		* Renders an HTML element to a `<canvas>` element.
		*
		* The function clones the target element and its subtree into a hidden iframe,
		* resolves all computed styles, and paints the result onto a canvas —
		* producing a visual snapshot of the DOM as it appears in the browser.
		*
		* @example
		* ```ts
		* import html2canvas from 'html2canvas-pro';
		*
		* const canvas = await html2canvas(document.body, {
		*   backgroundColor: '#ffffff',
		*   scale: 2,
		*   useCORS: true
		* });
		* document.body.appendChild(canvas);
		* ```
		*
		* @param element - The root HTMLElement to render.
		* @param options - Rendering options.
		* @param config  - Advanced configuration. In most cases this is auto-created;
		*                  only pass it if you need to share a cache across multiple calls.
		* @returns A promise that resolves to the rendered HTMLCanvasElement.
		*
		* @throws {Error} If the element is not attached to a document.
		* @throws {DOMException} If an {@link Options.signal|AbortSignal} was provided and the operation was aborted.
		*/
		const html2canvas = (element, options = {}, config) => {
			return renderElement(element, options, config || Html2CanvasConfig.fromElement(element, {
				cspNonce: options.cspNonce,
				cache: options.cache
			}));
		};
		//#endregion
		//#region src/client/ventus-prefs.ts
		/**
		* Shared Ventus-series UI preferences (localStorage-backed).
		*
		* These are client-only display preferences shared by every Ventus plugin:
		*   - cacheHit2Decimals: rewrite the composer stats "缓存命中 x%" to two decimals.
		*   - fluidConversationWidth: expand the conversation column to fill the space
		*     between sidebars instead of the default fixed 748px column.
		*
		* The same module is mirrored in dsh-ventus-whale so either Ventus plugin can
		* provide the behavior and settings surface.
		*/
		const VENTUS_PREFS_KEY = "dsh.ventus.preferences";
		const VENTUS_PREFS_EVENT = "ventus:prefs";
		const DEFAULT_VENTUS_PREFS = {
			usageEnabled: true,
			cacheHit2Decimals: true,
			fluidConversationWidth: true
		};
		function readVentusPrefs() {
			try {
				const raw = localStorage.getItem(VENTUS_PREFS_KEY);
				if (raw !== null) return {
					...DEFAULT_VENTUS_PREFS,
					...JSON.parse(raw)
				};
			} catch {}
			return { ...DEFAULT_VENTUS_PREFS };
		}
		function writeVentusPrefs(prefs) {
			try {
				localStorage.setItem(VENTUS_PREFS_KEY, JSON.stringify(prefs));
			} catch {}
			window.dispatchEvent(new CustomEvent(VENTUS_PREFS_EVENT, { detail: prefs }));
		}
		function patchCacheHitText(root) {
			const pattern = /(缓存命中\s*)(\d+(?:\.\d+)?)%/u;
			const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
			const textNodes = [];
			while (walker.nextNode()) {
				const node = walker.currentNode;
				if (node.nodeType === Node.TEXT_NODE) textNodes.push(node);
			}
			for (const node of textNodes) {
				const value = node.nodeValue;
				if (value === null || !pattern.test(value)) continue;
				node.nodeValue = value.replace(pattern, (_match, prefix, raw) => {
					const percent = Number(raw);
					return `${prefix}${Number.isFinite(percent) ? percent.toFixed(2) : raw}%`;
				});
			}
		}
		function applyFluidWidth(enabled) {
			const root = document.querySelector("[data-conversation-scroll]")?.parentElement;
			if (root === void 0 || root === null) return;
			root.style.setProperty("--dsh-chat-content-width", enabled ? "100%" : "748px");
		}
		/**
		* Apply Ventus display preferences to the live DOM and keep them applied as
		* React re-renders the stats line / conversation column.
		* @returns a disposer that stops the observers.
		*/
		function applyVentusPrefs() {
			let current = readVentusPrefs();
			let observer;
			let retryTimer;
			const apply = () => {
				if (current.cacheHit2Decimals) patchCacheHitText(document.body);
				applyFluidWidth(current.fluidConversationWidth);
			};
			const ensureRoot = () => {
				const scroll = document.querySelector("[data-conversation-scroll]");
				if (scroll?.parentElement === void 0 || scroll?.parentElement === null) {
					if (retryTimer === void 0) retryTimer = setTimeout(() => {
						retryTimer = void 0;
						apply();
						ensureRoot();
					}, 500);
					return;
				}
				if (retryTimer !== void 0) {
					clearTimeout(retryTimer);
					retryTimer = void 0;
				}
				apply();
			};
			const onPrefs = (event) => {
				const detail = event.detail;
				if (detail !== void 0) current = {
					...DEFAULT_VENTUS_PREFS,
					...detail
				};
				ensureRoot();
			};
			window.addEventListener(VENTUS_PREFS_EVENT, onPrefs);
			window.addEventListener("storage", onPrefs);
			let patchQueued = false;
			const queuePatch = () => {
				if (patchQueued) return;
				patchQueued = true;
				requestAnimationFrame(() => {
					patchQueued = false;
					if (current.cacheHit2Decimals) patchCacheHitText(document.body);
				});
			};
			observer = new MutationObserver(() => {
				if (current.cacheHit2Decimals) queuePatch();
				applyFluidWidth(current.fluidConversationWidth);
			});
			observer.observe(document.body, {
				childList: true,
				subtree: true
			});
			ensureRoot();
			return () => {
				window.removeEventListener(VENTUS_PREFS_EVENT, onPrefs);
				window.removeEventListener("storage", onPrefs);
				observer?.disconnect();
				if (retryTimer !== void 0) clearTimeout(retryTimer);
			};
		}
		//#endregion
		//#region src/client/VentusSettingsCard.ts
		/**
		* DeepSeek API 用量 settings card registered into the Ventus plugin series.
		* Collapsed by default; the header row toggles the body. Visual chrome mirrors
		* the dsh-ventus-whale settings card so the two Ventus pages stay unified.
		* @module dsh-deepseek-usage/client/VentusSettingsCard
		*/
		/** Card chrome matching the Ventus whale settings card (gradient + platform bg). */
		const cardStyle = {
			listStyle: "none",
			padding: "16px 18px",
			border: "1px solid var(--dsw-alias-line-normal)",
			borderRadius: "12px",
			background: "linear-gradient(180deg, color-mix(in srgb, var(--dsw-alias-state-business-primary) 5%, transparent), transparent 45%), var(--dsw-alias-bg-module-platform)",
			boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.03)",
			color: "var(--dsw-alias-label-primary)",
			fontFamily: "inherit"
		};
		/** Header row: the whole row toggles the body. */
		const headStyle = {
			display: "flex",
			alignItems: "center",
			gap: "8px",
			marginBottom: "12px",
			cursor: "pointer"
		};
		/** Title with the brand-blue accent bar (mirrors the whale card's ::before). */
		const titleStyle = {
			display: "flex",
			alignItems: "center",
			gap: "8px",
			fontSize: "14px",
			fontWeight: "700",
			color: "var(--dsw-alias-label-primary)"
		};
		const accentStyle = {
			width: "3px",
			height: "14px",
			borderRadius: "2px",
			background: "var(--dsw-alias-state-business-primary)",
			boxShadow: "0 0 10px color-mix(in srgb, var(--dsw-alias-state-business-primary) 55%, transparent)",
			flex: "none"
		};
		const chevronStyle = {
			flex: "none",
			marginLeft: "8px",
			color: "var(--dsw-alias-label-secondary)",
			fontSize: "12px",
			transition: "transform 150ms ease"
		};
		const bodyStyle = {
			display: "flex",
			flexDirection: "column",
			gap: "12px",
			fontSize: "13px"
		};
		const buttonStyle = {
			alignSelf: "flex-start",
			appearance: "none",
			WebkitAppearance: "none",
			height: "32px",
			padding: "0 14px",
			borderRadius: "10px",
			border: "1px solid var(--dsw-alias-state-business-primary, #4d6bfe)",
			background: "var(--dsw-alias-state-business-primary, #4d6bfe)",
			color: "#fff",
			boxShadow: "0 2px 8px rgba(77,107,254,.35)",
			fontSize: "13px",
			fontWeight: "600",
			fontFamily: "inherit",
			lineHeight: "30px",
			cursor: "pointer"
		};
		const mutedStyle = { color: "var(--dsw-alias-label-secondary)" };
		/** Settings card for the DeepSeek usage monitor. */
		function DeepSeekUsageSettingsCard() {
			const [collapsed, setCollapsed] = (0, react.useState)(true);
			const [loginMessage, setLoginMessage] = (0, react.useState)("");
			const [prefs, setPrefs] = (0, react.useState)(() => readVentusPrefs());
			(0, react.useEffect)(() => {
				const onPrefs = (event) => {
					const detail = event.detail;
					if (detail !== void 0) setPrefs(detail);
				};
				window.addEventListener(VENTUS_PREFS_EVENT, onPrefs);
				window.addEventListener("storage", onPrefs);
				return () => {
					window.removeEventListener(VENTUS_PREFS_EVENT, onPrefs);
					window.removeEventListener("storage", onPrefs);
				};
			}, []);
			const setPref = (patch) => {
				const next = {
					...prefs,
					...patch
				};
				setPrefs(next);
				writeVentusPrefs(next);
			};
			const startLogin = async () => {
				setLoginMessage("正在打开登录窗口…");
				try {
					setLoginMessage((await (await fetch("/api/deepseek-usage/login/start", { method: "POST" })).json()).message ?? "请在打开的浏览器中登录");
				} catch {
					setLoginMessage("无法启动登录窗口");
				}
			};
			const head = (0, react.createElement)("div", {
				style: headStyle,
				role: "button",
				tabIndex: 0,
				"aria-expanded": !collapsed,
				onClick: () => setCollapsed((current) => !current),
				onKeyDown: (event) => {
					if (event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						setCollapsed((current) => !current);
					}
				}
			}, (0, react.createElement)("span", { style: titleStyle }, (0, react.createElement)("span", { style: accentStyle }), "DeepSeek API 用量"), (0, react.createElement)("span", { style: {
				...chevronStyle,
				transform: collapsed ? "none" : "rotate(180deg)"
			} }, "▾"));
			const toggleRow = (label, hint, checked, onChange) => (0, react.createElement)("label", { style: {
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				gap: 8
			} }, (0, react.createElement)("span", { style: {
				display: "flex",
				flexDirection: "column",
				gap: 2
			} }, (0, react.createElement)("span", { style: { fontSize: 13 } }, label), (0, react.createElement)("span", { style: mutedStyle }, hint)), (0, react.createElement)("input", {
				type: "checkbox",
				checked,
				onChange: (event) => onChange(event.target.checked)
			}));
			const body = collapsed ? null : (0, react.createElement)("div", { style: bodyStyle }, toggleRow("启用用量监测", "关闭后隐藏悬浮球与用量面板，并停止后台数据轮询", prefs.usageEnabled, (value) => setPref({ usageEnabled: value })), (0, react.createElement)("div", { style: {
				display: "flex",
				flexDirection: "column",
				gap: 12,
				...prefs.usageEnabled ? {} : {
					opacity: .45,
					pointerEvents: "none"
				}
			} }, toggleRow("缓存命中显示两位小数", "把输入框下方的“缓存命中 x%”统一显示为两位小数（兼容桌面/Web）", prefs.cacheHit2Decimals, (value) => setPref({ cacheHit2Decimals: value })), toggleRow("对话横向宽度不限制", "开启后对话内容贴合左右侧边栏边界，不再限制为固定 748px 宽度", prefs.fluidConversationWidth, (value) => setPref({ fluidConversationWidth: value })), (0, react.createElement)("span", { style: mutedStyle }, "登录状态：请点击下方按钮登录 DeepSeek 开放平台"), (0, react.createElement)("button", {
				style: buttonStyle,
				onClick: () => void startLogin()
			}, "打开登录窗口"), loginMessage ? (0, react.createElement)("span", { style: mutedStyle }, loginMessage) : null));
			return (0, react.createElement)("li", { style: cardStyle }, head, body);
		}
		//#endregion
		//#region src/client/VentusSettingsPage.ts
		/**
		* Ventus settings page (a `settings.section` named "Ventus"). Renders the
		* Ventus-series plugin settings cards contributed into `ventus.settings.item`.
		* Auto-created by whichever Ventus plugin mounts first; later Ventus plugins
		* merge their cards into the existing page.
		* @module dsh-deepseek-usage/client/VentusSettingsPage
		*/
		const pageStyle = {
			listStyle: "none",
			padding: "0",
			margin: "0",
			display: "flex",
			flexDirection: "column",
			gap: "6px"
		};
		/** Render the Ventus settings page: one stacked card per Ventus-series plugin. */
		function VentusSettingsPage(props) {
			return (0, react.createElement)("ul", { style: pageStyle }, props.renderSlot("ventus.settings.item", {}));
		}
		//#endregion
		//#region src/client/index.ts
		/** Required services: slots lets the plugin claim a shell overlay seat. */
		const inject = ["slots"];
		/** Plugin namespace for styles and DOM queries. */
		const NS = "dsu";
		/** Poll interval for state refreshes in milliseconds. */
		const POLL_MS = 1e4;
		const CSS = `
[data-${NS}] { --dsu-bg:var(--dsw-alias-bg-base, #0b0e14); --dsu-panel:var(--dsw-alias-bg-module-platform, #12161f); --dsu-panel-2:var(--dsw-alias-bg-module-hover, #171c27); --dsu-border:var(--dsw-alias-line-normal, rgba(255,255,255,.08)); --dsu-text:var(--dsw-alias-label-primary, #e7ecf3); --dsu-muted:var(--dsw-alias-label-secondary, #8b95a7); --dsu-brand:var(--dsw-alias-state-business-primary, #4d6bfe); --dsu-green:#34d399; --dsu-gold:#ffd166; --dsu-red:#f87171; --dsu-link:#8ea2ff; --dsu-radius:14px; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif; color:var(--dsu-text); }
body:not([data-ds-dark-theme]) [data-${NS}] { --dsu-bg:#eef0f4; --dsu-panel:#ffffff; --dsu-panel-2:#f4f5f7; --dsu-border:rgba(15,17,21,.08); --dsu-text:#1a1d21; --dsu-muted:#5b6472; --dsu-green:#059669; --dsu-gold:#8a6100; --dsu-red:#dc2626; --dsu-link:#2563eb; }
[data-${NS}]{ position:fixed; inset:0; z-index:2147483000; pointer-events:none; }
[data-${NS}] *{ box-sizing:border-box; }
.${NS}-ball{ position:absolute; top:calc(50% - 26px); right:0; display:flex; align-items:center; gap:10px; background:var(--dsu-panel-2); border:1px solid color-mix(in srgb, var(--dsu-brand) 45%, transparent); border-radius:999px 0 0 999px; padding:10px 14px 10px 12px; box-shadow:0 12px 30px rgba(0,0,0,.45),0 0 0 1px color-mix(in srgb, var(--dsu-brand) 12%, transparent); cursor:grab; transition:box-shadow .15s ease; user-select:none; pointer-events:auto; touch-action:none; }
.${NS}-ball:hover{ box-shadow:0 14px 34px rgba(77,107,254,.24),0 0 0 1px rgba(77,107,254,.3); }
.${NS}-icon{ width:32px; height:32px; border-radius:50%; background:linear-gradient(135deg,#4d6bfe,#7c5cfc); display:flex; align-items:center; justify-content:center; color:#fff; font-size:14px; font-weight:800; }
.${NS}-icon.peak{ background:linear-gradient(135deg,#ef4444,#b91c1c); }
.${NS}-icon.valley{ background:linear-gradient(135deg,#10b981,#047857); }
.${NS}-copy{ display:flex; flex-direction:column; gap:1px; min-width:74px; }
.${NS}-copy .k{ font-size:11px; color:var(--dsu-muted); line-height:1; }
.${NS}-copy .v{ font-size:15px; font-weight:650; line-height:1.2; font-variant-numeric:tabular-nums; }
.${NS}-ball-line{ display:flex; align-items:baseline; justify-content:space-between; gap:8px; }
.${NS}-ball-r0{ display:inline-block; margin-top:3px; padding:2px 8px; border-radius:999px; background:color-mix(in srgb, var(--dsu-gold) 14%, transparent); border:1px solid color-mix(in srgb, var(--dsu-gold) 40%, transparent); color:var(--dsu-gold); font-size:12px; font-weight:700; white-space:nowrap; }
.${NS}-chevron{ color:var(--dsu-muted); font-size:13px; margin-left:2px; }
.${NS}-dot{ position:absolute; top:8px; right:8px; width:8px; height:8px; border-radius:50%; background:var(--dsu-green); box-shadow:0 0 0 4px rgba(52,211,153,.12); }
.${NS}-panel{ position:absolute; right:0; top:0; bottom:0; width:460px; max-width:94vw; background:var(--dsu-panel); border-left:1px solid var(--dsu-border); box-shadow:-20px 0 60px rgba(0,0,0,.4); display:flex; flex-direction:column; z-index:2147483001; transform:translateX(105%); transition:transform .18s ease; pointer-events:auto; }
.${NS}-panel.open{ transform:translateX(0); }
.${NS}-header{ display:flex; align-items:center; flex-wrap:wrap; row-gap:8px; gap:10px; padding:14px 16px; border-bottom:1px solid var(--dsu-border); background:var(--dsu-panel-2); }
.${NS}-header .title{ flex:1; min-width:0; font-size:14px; font-weight:650; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.${NS}-btn{ width:28px; height:28px; border:1px solid transparent; border-radius:8px; background:transparent; color:var(--dsu-muted); display:flex; align-items:center; justify-content:center; font-size:14px; cursor:pointer; }
.${NS}-btn:hover{ background:rgba(255,255,255,.06); color:var(--dsu-text); }
.${NS}-body{ flex:1; overflow-y:auto; padding:14px; display:flex; flex-direction:column; gap:14px; }
.${NS}-section-title{ font-size:12px; text-transform:uppercase; letter-spacing:.08em; color:var(--dsu-muted); margin-bottom:8px; }
.${NS}-balance{ background:linear-gradient(135deg,rgba(77,107,254,.18),rgba(124,92,252,.08)); border:1px solid rgba(77,107,254,.28); border-radius:var(--dsu-radius); padding:14px 16px; }
.${NS}-balance-top{ display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; font-size:12px; color:var(--dsu-muted); }
.${NS}-balance-main{ display:flex; align-items:center; flex-wrap:nowrap; gap:8px; margin-bottom:10px; }
.${NS}-model-label{ margin-left:auto; font-size:12px; color:var(--dsu-muted); white-space:nowrap; flex:none; }
.${NS}-balance-main select{ flex:none; height:30px; padding:0 8px; border-radius:8px; border:1px solid var(--dsu-border); background:var(--dsu-panel-2); color:var(--dsu-text); font:inherit; font-size:12px; }
.${NS}-r0-row{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:10px; }
.${NS}-amount{ font-size:30px; font-weight:700; letter-spacing:-.02em; font-variant-numeric:tabular-nums; }
.${NS}-amount-sub{ color:var(--dsu-muted); font-size:13px; }
.${NS}-r0{ padding:4px 10px; border-radius:999px; background:color-mix(in srgb, var(--dsu-gold) 12%, transparent); border:1px solid color-mix(in srgb, var(--dsu-gold) 35%, transparent); color:var(--dsu-gold); font-size:12px; font-weight:650; white-space:nowrap; }
.${NS}-pv-badge{ padding:3px 10px; border-radius:999px; font-size:12px; font-weight:500; white-space:nowrap; }
.${NS}-pv-badge b{ font-weight:900; font-size:1.15em; }
.${NS}-pv-badge.peak{ background:color-mix(in srgb, #ef4444 16%, transparent); border:1px solid color-mix(in srgb, #ef4444 45%, transparent); color:#dc2626; }
.${NS}-pv-badge.valley{ background:color-mix(in srgb, #10b981 16%, transparent); border:1px solid color-mix(in srgb, #10b981 45%, transparent); color:#047857; }
.${NS}-balance-detail{ display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; }
.${NS}-balance-detail .item{ background:rgba(0,0,0,.18); border:1px solid rgba(255,255,255,.05); border-radius:10px; padding:8px 10px; }
.${NS}-balance-detail .k{ font-size:12px; color:var(--dsu-muted); margin-bottom:2px; }
.${NS}-balance-detail .v{ font-size:13px; font-weight:600; font-variant-numeric:tabular-nums; }
.${NS}-summary{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.${NS}-summary-card{ background:var(--dsu-panel-2); border:1px solid var(--dsu-border); border-radius:12px; padding:12px; }
.${NS}-summary-card .k{ font-size:12px; color:var(--dsu-muted); margin-bottom:6px; }
.${NS}-summary-card .v{ font-size:20px; font-weight:650; font-variant-numeric:tabular-nums; }
.${NS}-summary-card .sub{ font-size:12px; color:var(--dsu-muted); margin-top:2px; }
.${NS}-table{ border:1px solid var(--dsu-border); border-radius:var(--dsu-radius); overflow:hidden; }
.${NS}-row{ display:grid; grid-template-columns:1.8fr .7fr 1fr .8fr; gap:8px; align-items:center; padding:10px 12px; border-bottom:1px solid var(--dsu-border); background:var(--dsu-panel-2); }
.${NS}-row:last-child{ border-bottom:0; }
.${NS}-row.head{ background:rgba(255,255,255,.03); font-size:12px; color:var(--dsu-muted); text-transform:uppercase; letter-spacing:.04em; }
.${NS}-row.head span:nth-child(n+2){ text-align:right; }
.${NS}-row .model{ font-size:12px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.${NS}-row .num{ font-size:12px; text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap; }
.${NS}-row .cost{ font-size:12px; text-align:right; color:var(--dsu-gold); font-variant-numeric:tabular-nums; white-space:nowrap; }
.${NS}-legend{ font-size:12px; color:var(--dsu-muted); line-height:1.5; }
.${NS}-error{ color:var(--dsu-red); font-size:12px; margin-top:8px; }
.${NS}-footer{ padding:12px 16px; border-top:1px solid var(--dsu-border); background:var(--dsu-panel-2); display:flex; align-items:center; justify-content:space-between; color:var(--dsu-muted); font-size:12px; }
.${NS}-footer .refresh{ color:var(--dsu-link); cursor:pointer; }
.${NS}-tooltip{ position:fixed; z-index:2147483999; display:none; max-width:460px; padding:10px 14px; border-radius:10px; background:var(--dsw-alias-bg-popover, var(--dsu-panel-2)); border:1px solid var(--dsu-border); color:var(--dsu-text); font-size:14px; line-height:1.6; white-space:normal; pointer-events:none; box-shadow:0 10px 28px rgba(0,0,0,.35); backdrop-filter:blur(8px); }
.${NS}-tooltip.visible{ display:block; }
body:not([data-ds-dark-theme]) [data-${NS}] .${NS}-panel{ box-shadow:-12px 0 32px rgba(15,17,21,.10); }
body:not([data-ds-dark-theme]) [data-${NS}] .${NS}-ball{ box-shadow:0 8px 24px rgba(15,17,21,.12),0 0 0 1px rgba(77,107,254,.18); }
body:not([data-ds-dark-theme]) [data-${NS}] .${NS}-balance-detail .item{ background:rgba(15,17,21,.04); border-color:rgba(15,17,21,.08); }
body:not([data-ds-dark-theme]) [data-${NS}] .${NS}-row.head{ background:rgba(15,17,21,.04); }
body:not([data-ds-dark-theme]) [data-${NS}] .${NS}-btn:hover{ background:rgba(15,17,21,.06); }
.${NS}-page{ display:none; flex-direction:column; gap:14px; }
.${NS}-page.active{ display:flex; }
.${NS}-resize{ position:absolute; left:-5px; top:0; bottom:0; width:10px; cursor:col-resize; z-index:5; }
.${NS}-resize::after{ content:''; position:absolute; left:3px; top:50%; transform:translateY(-50%); width:3px; height:42px; border-radius:2px; background:var(--dsu-border); transition:background .15s ease; }
.${NS}-resize:hover::after{ background:var(--dsu-brand); }
.${NS}-page-switch{ width:auto; min-width:44px; padding:0 8px; white-space:nowrap; font-size:12px; }
.${NS}-page-switch.active{ color:var(--dsu-brand); border-color:color-mix(in srgb,var(--dsu-brand) 40%, transparent); background:color-mix(in srgb,var(--dsu-brand) 12%, transparent); }
.${NS}-range-btn{ width:auto; min-width:40px; padding:0 8px; white-space:nowrap; font-size:12px; }
.${NS}-range-btn.active{ color:var(--dsu-brand); border-color:color-mix(in srgb,var(--dsu-brand) 40%, transparent); background:color-mix(in srgb,var(--dsu-brand) 12%, transparent); }
.${NS}-shot{ width:auto; padding:0 10px; white-space:nowrap; font-size:12px; }
.${NS}-range-select{ height:30px; padding:0 6px; border-radius:8px; border:1px solid var(--dsu-border); background:var(--dsu-panel-2); color:var(--dsu-text); font:inherit; font-size:12px; }
.${NS}-header .title{ flex:none; white-space:nowrap; }
.${NS}-trend-controls{ display:flex; flex-direction:column; gap:8px; padding:12px; background:var(--dsu-panel-2); border:1px solid var(--dsu-border); border-radius:12px; }
.${NS}-trend-row{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.${NS}-trend-row label{ font-size:12px; color:var(--dsu-muted); }
.${NS}-trend-row button{ height:30px; padding:0 12px; border-radius:8px; border:1px solid var(--dsu-border); background:var(--dsu-panel-2); color:var(--dsu-text); font:inherit; font-size:12px; cursor:pointer; }
.${NS}-trend-row button.active{ color:#fff; background:var(--dsu-brand); border-color:var(--dsu-brand); }
.${NS}-trend-list{ display:flex; flex-direction:column; gap:12px; }
.${NS}-trend-group{ display:flex; flex-direction:column; gap:8px; }
.${NS}-trend-provider{ font-size:12px; font-weight:700; color:var(--dsu-muted); text-transform:uppercase; letter-spacing:.06em; padding:2px 4px; }
.${NS}-chart-card{ background:var(--dsu-panel-2); border:1px solid var(--dsu-border); border-radius:12px; padding:12px; }
.${NS}-chart-head{ display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:8px; }
.${NS}-chart-title{ font-size:13px; font-weight:650; }
.${NS}-chart-total{ font-size:12px; color:var(--dsu-muted); font-variant-numeric:tabular-nums; }
.${NS}-chart-svg{ display:block; width:100%; height:auto; }
.${NS}-trend-empty,.${NS}-trend-error,.${NS}-trend-loading{ color:var(--dsu-muted); font-size:12px; padding:12px; }
.${NS}-trend-error{ color:var(--dsu-red); }
@media (prefers-reduced-motion:reduce){ .${NS}-panel{ transition:none; } }
`;
		/** Convert a number to a compact K/M label. */
		function compact(value) {
			if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
			if (value >= 1e6) return `${(value / 1e6).toFixed(value >= 1e7 ? 1 : 2)}M`;
			if (value >= 1e3) return `${Math.round(value / 1e3)}K`;
			return String(value);
		}
		/** Format money with the snapshot currency. */
		function money(value, currency) {
			return currency === "USD" ? `$${value.toFixed(2)}` : `¥${value.toFixed(2)}`;
		}
		/** Short display name for tracked models. */
		function shortModelName(model) {
			if (model.includes("pro")) return "Pro";
			if (model.includes("flash")) return "Flash";
			return model;
		}
		/** Human-readable label for a usage source (e.g. vision-toolkit-b-ai -> 视觉 b-ai, modlens-b-ai -> 视觉 modlens). */
		function sourceLabel(source) {
			if (!source) return "直接";
			const visionMatch = /^vision-toolkit-(.+)$/.exec(source);
			if (visionMatch?.[1]) return `视觉 ${visionMatch[1]}`;
			if (/^modlens-/.test(source) || source === "deepseek-modlens") return "视觉 modlens";
			return source;
		}
		/** Whether a source is a vision bridge source (vision-toolkit / modlens). */
		function isVisionSource(source) {
			return /^(?:vision-toolkit|modlens)-/.test(source ?? "") || source === "deepseek-modlens";
		}
		/** Parse a hex color into RGB components. */
		function hexToRgb(hex) {
			const value = hex.replace("#", "");
			const full = value.length === 3 ? value.split("").map((char) => char + char).join("") : value;
			const num = Number.parseInt(full, 16);
			return [
				num >> 16 & 255,
				num >> 8 & 255,
				num & 255
			];
		}
		/** Squared RGB distance between two hex colors; larger means more distinct. */
		function colorDistance(a, b) {
			const [r1, g1, b1] = hexToRgb(a);
			const [r2, g2, b2] = hexToRgb(b);
			return (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2;
		}
		/** Format a number as mantissa × 10^exponent with three significant digits. */
		function toScientific(value) {
			if (value === 0 || !Number.isFinite(value)) return String(value);
			const exponent = Math.floor(Math.log10(Math.abs(value)));
			const mantissa = value / 10 ** exponent;
			const superscripts = {
				"0": "⁰",
				"1": "¹",
				"2": "²",
				"3": "³",
				"4": "⁴",
				"5": "⁵",
				"6": "⁶",
				"7": "⁷",
				"8": "⁸",
				"9": "⁹",
				"-": "⁻"
			};
			const expText = String(exponent).split("").map((char) => superscripts[char] ?? char).join("");
			return `${mantissa.toFixed(2)}×10${expText}`;
		}
		/** Return whether the current Beijing time is peak or valley. */
		function peakValley() {
			const now = /* @__PURE__ */ new Date();
			const parts = new Intl.DateTimeFormat("en-GB", {
				timeZone: "Asia/Shanghai",
				hour: "2-digit",
				hour12: false
			}).formatToParts(now);
			const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
			return hour >= 9 && hour < 12 || hour >= 14 && hour < 18 ? {
				text: "峰",
				cls: "peak"
			} : {
				text: "谷",
				cls: "valley"
			};
		}
		/** Check whether a slot name exists in a live slot snapshot. */
		function containsSlot(node, name) {
			if (Array.isArray(node)) return node.some((item) => containsSlot(item, name));
			if (typeof node !== "object" || node === null) return false;
			const record = node;
			if (record.name === name) return true;
			return containsSlot(record.children, name);
		}
		/** Today's Asia/Shanghai calendar date as YYYY-MM-DD. */
		function todayDateString() {
			return (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" });
		}
		/** GMT+8 midnight epoch seconds for a YYYY-MM-DD date. */
		function gmt8Start(date) {
			return Math.floor((/* @__PURE__ */ new Date(`${date}T00:00:00+08:00`)).getTime() / 1e3);
		}
		/** List every calendar date in an inclusive YYYY-MM-DD range. */
		function eachDate(start, end) {
			const days = [];
			const startTime = gmt8Start(start);
			const endTime = gmt8Start(end);
			if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime < startTime) return days;
			for (let cursor = startTime; cursor <= endTime; cursor += 86400) days.push((/* @__PURE__ */ new Date((cursor + 28800) * 1e3)).toISOString().slice(0, 10));
			return days;
		}
		const STORAGE_PREFIX = "dsh-deepseek-usage:";
		/** Read a persisted UI value from localStorage. */
		function readStoredValue(key) {
			try {
				return localStorage.getItem(`${STORAGE_PREFIX}${key}`);
			} catch {
				return null;
			}
		}
		/** Persist a UI value to localStorage. */
		function writeStoredValue(key, value) {
			try {
				localStorage.setItem(`${STORAGE_PREFIX}${key}`, value);
			} catch {}
		}
		/** Read a clamped numeric UI value from localStorage. */
		function readStoredNumber(key, min, max) {
			const raw = readStoredValue(key);
			if (raw === null) return void 0;
			const value = Number(raw);
			if (!Number.isFinite(value)) return void 0;
			return Math.min(max, Math.max(min, value));
		}
		/** Fill missing buckets with zero values so charts always show the full range. */
		function fillModelSeries(series, start, end, granularity) {
			const byTimestamp = /* @__PURE__ */ new Map();
			for (const point of series.points) byTimestamp.set(point.timestamp, point);
			const expected = [];
			if (granularity === "hour") for (const date of eachDate(start, end)) {
				const dayStart = gmt8Start(date);
				for (let hour = 0; hour < 24; hour++) expected.push({
					timestamp: dayStart + hour * 3600,
					label: `${date.slice(5)} ${String(hour).padStart(2, "0")}:00`
				});
			}
			else for (const date of eachDate(start, end)) expected.push({
				timestamp: gmt8Start(date),
				label: date.slice(5)
			});
			return {
				provider: series.provider,
				model: series.model,
				source: series.source,
				points: expected.map((item) => {
					const existing = byTimestamp.get(item.timestamp);
					return {
						timestamp: item.timestamp,
						label: item.label,
						tokens: existing?.tokens ?? 0,
						inputTokens: existing?.inputTokens ?? 0,
						outputTokens: existing?.outputTokens ?? 0,
						cacheReadTokens: existing?.cacheReadTokens ?? 0,
						cacheWriteTokens: existing?.cacheWriteTokens ?? 0,
						requests: existing?.requests ?? 0
					};
				})
			};
		}
		/** Resolve inclusive GMT+8 date bounds for a range preset. */
		function rangeDates(range) {
			const today = todayDateString();
			if (range === "today") return {
				start: today,
				end: today
			};
			if (range === "yesterday") return {
				start: (/* @__PURE__ */ new Date((gmt8Start(today) - 86400) * 1e3)).toISOString().slice(0, 10),
				end: today
			};
			if (range === "week") return {
				start: (/* @__PURE__ */ new Date((gmt8Start(today) - 6 * 86400) * 1e3)).toISOString().slice(0, 10),
				end: today
			};
			if (range === "month") {
				const [y, m, d] = today.split("-").map(Number);
				const prevLastDay = new Date(Date.UTC(y, m - 1, 0)).getUTCDate();
				const prevDay = Math.min(d, prevLastDay);
				return {
					start: `${y}-${String(m - 1).padStart(2, "0")}-${String(prevDay).padStart(2, "0")}`,
					end: today
				};
			}
			if (range === "thisWeek") {
				const daysSinceMonday = ((/* @__PURE__ */ new Date(`${today}T12:00:00+08:00`)).getUTCDay() + 6) % 7;
				return {
					start: (/* @__PURE__ */ new Date((gmt8Start(today) - daysSinceMonday * 86400) * 1e3)).toISOString().slice(0, 10),
					end: today
				};
			}
			if (range === "thisMonth") return {
				start: `${today.slice(0, 8)}01`,
				end: today
			};
			return {
				start: today,
				end: today
			};
		}
		/** Short display label for a range preset. */
		function rangeLabel(range) {
			switch (range) {
				case "today": return "当天";
				case "yesterday": return "昨天";
				case "week": return "近7天";
				case "month": return "近一个月";
				case "thisWeek": return "本周";
				case "thisMonth": return "本月";
			}
		}
		/** Fold model-usage series into per-model totals, estimating cost via the price ratio. */
		function aggregateSeries(series, priceRatio) {
			const byModel = /* @__PURE__ */ new Map();
			for (const item of series) for (const point of item.points) {
				let row = byModel.get(item.model);
				if (!row) {
					row = {
						model: item.model,
						requests: 0,
						tokens: 0,
						cost: 0
					};
					byModel.set(item.model, row);
				}
				row.requests += point.requests;
				row.tokens += point.tokens;
			}
			const rows = [...byModel.values()].sort((a, b) => b.tokens - a.tokens);
			const costKnown = priceRatio !== null;
			let requests = 0;
			let tokens = 0;
			let cost = 0;
			for (const row of rows) {
				requests += row.requests;
				tokens += row.tokens;
				const a1 = priceRatio?.models.find((item) => item.model === row.model)?.a1 ?? priceRatio?.default_a1;
				row.cost = typeof a1 === "number" && Number.isFinite(a1) ? row.tokens * a1 : 0;
				cost += row.cost;
			}
			return {
				rows,
				requests,
				tokens,
				cost,
				costKnown
			};
		}
		/** Mount the floating widget. */
		function apply(ctx) {
			let styleEl = null;
			if (document.querySelector(`style[data-${NS}-css]`) === null) {
				styleEl = document.createElement("style");
				styleEl.dataset[`${NS}Css`] = "";
				styleEl.textContent = CSS;
				document.head.appendChild(styleEl);
			}
			const disposeVentusPrefs = applyVentusPrefs();
			const host = document.createElement("div");
			host.dataset[NS] = "";
			host.innerHTML = `
    <div class="${NS}-ball" role="button" tabindex="0" aria-label="DeepSeek API 用量">
      <span class="${NS}-dot"></span>
      <div class="${NS}-icon" data-field="ball-icon">峰</div>
      <div class="${NS}-copy">
        <span class="${NS}-ball-line"><span class="k">余额</span><span class="v">--</span></span>
        <span class="${NS}-ball-r0" data-field="ball-r0">--</span>
      </div>
      <span class="${NS}-chevron">‹</span>
    </div>
    <aside class="${NS}-panel" aria-hidden="true">
      <div class="${NS}-resize" data-action="resize" title="拖动调整宽度"></div>
      <div class="${NS}-header">
        <span class="title">DeepSeek API 用量</span>
        <select class="${NS}-range-select" data-action="range" title="选择统计范围（当天/昨天/近7天/近一个月/本周/本月）">
          <option value="today" selected>当天</option>
          <option value="yesterday">昨天</option>
          <option value="week">近7天</option>
          <option value="month">近一个月</option>
          <option value="thisWeek">本周</option>
          <option value="thisMonth">本月</option>
        </select>
        <button class="${NS}-btn ${NS}-page-switch" data-action="page" title="模型用量趋势">趋势</button>
        <button class="${NS}-btn ${NS}-shot" data-action="screenshot" title="复制当前页完整截图">📷 复制截图</button>
        <button class="${NS}-btn" data-action="refresh" title="刷新">↻</button>
        <button class="${NS}-btn" data-action="close" title="收起">✕</button>
      </div>
      <div class="${NS}-body">
        <div class="${NS}-page active" data-page="overview">
        <section>
          <div class="${NS}-section-title">账户</div>
          <div class="${NS}-balance">
            <div class="${NS}-balance-top">
              <span>DeepSeek 开放平台</span>
              <span class="${NS}-pv-badge" data-field="pv-badge">--</span>
              <span data-field="source">--</span>
            </div>
            <div class="${NS}-balance-main">
              <span class="${NS}-amount">--</span><span class="${NS}-amount-sub"></span>
              <span class="${NS}-model-label">模型涨价率：</span>
              <select id="dsu-model-select" data-field="model-select">
                <option value="deepseek-v4-flash">DeepSeek Flash</option>
                <option value="deepseek-v4-pro">DeepSeek Pro</option>
              </select>
            </div>
            <div class="${NS}-r0-row">
              <span class="${NS}-r0" data-field="r0-total" title="8月17日起累计涨价倍率">累计R0 --</span>
              <span class="${NS}-r0" data-field="r0-today" title="今日涨价倍率">今日R0 --</span>
            </div>
            <div class="${NS}-balance-detail">
              <div class="item"><div class="k">赠金余额</div><div class="v" data-field="bonus">--</div></div>
              <div class="item"><div class="k">累计消费</div><div class="v" data-field="total-cost">--</div></div>
            </div>
          </div>
        </section>
        <section>
          <div class="${NS}-section-title" data-field="section-today">今日</div>
          <div class="${NS}-summary">
            <div class="${NS}-summary-card">
              <div class="k" data-field="cost-key">今日消费</div>
              <div class="v" data-field="cost">--</div>
              <div class="sub" data-field="cost-sub">平台实际扣费</div>
            </div>
            <div class="${NS}-summary-card">
              <div class="k">API 请求次数</div>
              <div class="v" data-field="requests">--</div>
              <div class="sub">平台统计</div>
            </div>
            <div class="${NS}-summary-card">
              <div class="k">Tokens</div>
              <div class="v" data-field="tokens">--</div>
              <div class="sub">平台统计</div>
            </div>
            <div class="${NS}-summary-card">
              <div class="k">模型数</div>
              <div class="v" data-field="model-count">--</div>
              <div class="sub" data-field="model-count-sub">今日有调用</div>
            </div>
          </div>
        </section>
        <section>
          <div class="${NS}-section-title" data-field="section-models">分模型今日</div>
          <div class="${NS}-table" data-field="table">
            <div class="${NS}-row head"><span>模型</span><span>请求</span><span>Tokens</span><span>消费</span></div>
          </div>
          <div class="${NS}-legend">数据来源：DeepSeek 开放平台，与用量页同源。</div>
        </section>
        </div>
        <div class="${NS}-page" data-page="trends">
          <div class="${NS}-trend-controls">
            <div class="${NS}-trend-row">
              <label>粒度</label>
              <button data-granularity="hour" data-action="granularity">按小时</button>
              <button data-granularity="day" data-action="granularity">按天</button>
            </div>
          </div>
          <div class="${NS}-trend-list" data-field="trend-list"></div>
        </div>
      </div>
      <div class="${NS}-footer">
        <span data-field="footer">等待数据</span>
        <span class="refresh" data-action="login">登录</span>
        <span class="refresh" data-action="logout">退出登录</span>
        <span class="refresh" data-action="refresh">刷新</span>
      </div>
    </aside>
    <div class="${NS}-tooltip" data-field="tooltip" role="tooltip"></div>
  `;
			document.body.appendChild(host);
			const ball = host.querySelector(`.${NS}-ball`);
			const panel = host.querySelector(`.${NS}-panel`);
			const ballValue = host.querySelector(`.${NS}-copy .v`);
			const savedPanelWidth = readStoredNumber("panelWidth", 320, 900);
			if (savedPanelWidth !== void 0) panel.style.width = `${savedPanelWidth}px`;
			const savedBallTop = readStoredNumber("ballTop", 0, Math.max(0, window.innerHeight - ball.offsetHeight));
			if (savedBallTop !== void 0) ball.style.top = `${savedBallTop}px`;
			const savedBallSide = readStoredValue("ballSide");
			if (savedBallSide === "left") {
				ball.style.right = "auto";
				ball.style.left = "0";
				ball.style.borderRadius = "0 999px 999px 0";
			} else if (savedBallSide === "right") {
				ball.style.left = "auto";
				ball.style.right = "0";
				ball.style.borderRadius = "999px 0 0 999px";
			}
			const stateFields = {
				source: host.querySelector("[data-field=\"source\"]"),
				amount: host.querySelector(`.${NS}-amount`),
				amountSub: host.querySelector(`.${NS}-amount-sub`),
				ballR0: host.querySelector("[data-field=\"ball-r0\"]"),
				ballIcon: host.querySelector("[data-field=\"ball-icon\"]"),
				pvBadge: host.querySelector("[data-field=\"pv-badge\"]"),
				modelSelect: host.querySelector("[data-field=\"model-select\"]"),
				r0Total: host.querySelector("[data-field=\"r0-total\"]"),
				r0Today: host.querySelector("[data-field=\"r0-today\"]"),
				bonus: host.querySelector("[data-field=\"bonus\"]"),
				totalCost: host.querySelector("[data-field=\"total-cost\"]"),
				cost: host.querySelector("[data-field=\"cost\"]"),
				requests: host.querySelector("[data-field=\"requests\"]"),
				tokens: host.querySelector("[data-field=\"tokens\"]"),
				modelCount: host.querySelector("[data-field=\"model-count\"]"),
				table: host.querySelector("[data-field=\"table\"]"),
				footer: host.querySelector("[data-field=\"footer\"]"),
				tooltip: host.querySelector("[data-field=\"tooltip\"]"),
				sectionToday: host.querySelector("[data-field=\"section-today\"]"),
				sectionModels: host.querySelector("[data-field=\"section-models\"]"),
				costKey: host.querySelector("[data-field=\"cost-key\"]"),
				costSub: host.querySelector("[data-field=\"cost-sub\"]"),
				modelCountSub: host.querySelector("[data-field=\"model-count-sub\"]"),
				trendList: host.querySelector("[data-field=\"trend-list\"]")
			};
			let usageEnabled = readVentusPrefs().usageEnabled;
			let pollTimer;
			let open = false;
			let currency = "CNY";
			let selectedModel = "deepseek-v4-flash";
			let lastState = null;
			let currentPage = "overview";
			let currentRange = "today";
			let aggregateFetchSeq = 0;
			let screenshotting = false;
			let trendStartDate = todayDateString();
			let trendEndDate = todayDateString();
			let trendGranularity = "hour";
			let trendData = null;
			const toggle = (next) => {
				open = next ?? !open;
				panel.classList.toggle("open", open);
				panel.setAttribute("aria-hidden", String(!open));
				if (open) load();
			};
			const updatePeakValleyIcon = () => {
				const pv = peakValley();
				stateFields.ballIcon.textContent = pv.text;
				stateFields.ballIcon.classList.toggle("peak", pv.cls === "peak");
				stateFields.ballIcon.classList.toggle("valley", pv.cls === "valley");
				stateFields.pvBadge.innerHTML = pv.text === "峰" ? "LW<b>峰</b>时刻" : "LW<b>谷</b>时刻";
				stateFields.pvBadge.classList.toggle("peak", pv.cls === "peak");
				stateFields.pvBadge.classList.toggle("valley", pv.cls === "valley");
			};
			const load = async () => {
				updatePeakValleyIcon();
				try {
					const response = await fetch("/api/deepseek-usage/state", { headers: { accept: "application/json" } });
					if (!response.ok) throw new Error(`HTTP ${response.status}`);
					render(await response.json());
					stateFields.footer.textContent = "数据已更新";
				} catch {
					stateFields.footer.textContent = "加载失败，3 秒后重试";
					setTimeout(() => {
						load();
					}, 3e3);
				}
			};
			const refresh = async () => {
				try {
					const response = await fetch("/api/deepseek-usage/refresh", { method: "POST" });
					if (!response.ok) throw new Error(`HTTP ${response.status}`);
					render(await response.json());
					if (currentPage === "overview" && currentRange !== "today") refreshOverviewRange();
				} catch {
					stateFields.footer.textContent = "刷新失败";
				}
			};
			let loginPollTimer;
			const startLogin = async () => {
				try {
					const result = await (await fetch("/api/deepseek-usage/login/start", { method: "POST" })).json();
					stateFields.footer.textContent = result.message ?? "正在打开登录窗口…";
					if (!result.ok) return;
					clearInterval(loginPollTimer);
					loginPollTimer = setInterval(async () => {
						try {
							const status = await (await fetch("/api/deepseek-usage/login/status")).json();
							if (status.loggedIn) {
								clearInterval(loginPollTimer);
								stateFields.footer.textContent = "登录成功，正在获取数据…";
								await refresh();
							} else stateFields.footer.textContent = status.message ?? "等待登录完成…";
						} catch {
							stateFields.footer.textContent = "登录状态检查失败";
						}
					}, 2e3);
				} catch {
					stateFields.footer.textContent = "无法启动登录窗口";
				}
			};
			const logout = async () => {
				try {
					const result = await (await fetch("/api/deepseek-usage/logout", { method: "POST" })).json();
					stateFields.footer.textContent = result.ok ? "已退出登录" : result.message ?? "退出失败";
					if (result.ok) await load();
				} catch {
					stateFields.footer.textContent = "退出失败";
				}
			};
			const showTooltip = (target, text) => {
				stateFields.tooltip.textContent = text;
				const rect = target.getBoundingClientRect();
				const left = Math.max(8, Math.min(rect.left, window.innerWidth - 380));
				const below = rect.bottom + 10;
				const above = rect.top - 48;
				const top = below + 60 < window.innerHeight ? below : Math.max(8, above);
				stateFields.tooltip.style.left = `${left}px`;
				stateFields.tooltip.style.top = `${top}px`;
				stateFields.tooltip.classList.add("visible");
			};
			const hideTooltip = () => {
				stateFields.tooltip.classList.remove("visible");
			};
			const bindTooltip = (el) => {
				el.addEventListener("mouseenter", () => {
					const tip = el.dataset.tip;
					if (tip) showTooltip(el, tip);
				});
				el.addEventListener("mouseleave", hideTooltip);
				el.addEventListener("focus", () => {
					const tip = el.dataset.tip;
					if (tip) showTooltip(el, tip);
				});
				el.addEventListener("blur", hideTooltip);
			};
			const render = (state) => {
				if (state.error) {
					ballValue.textContent = "--";
					stateFields.source.textContent = "异常";
					stateFields.footer.textContent = state.error;
					return;
				}
				const balance = state.balance;
				if (balance) {
					currency = balance.currency || "CNY";
					const symbol = currency === "USD" ? "$" : "¥";
					ballValue.textContent = `${symbol}${balance.balance.toFixed(2)}`;
					stateFields.source.textContent = "平台已连接";
					stateFields.amount.textContent = `${symbol}${balance.balance.toFixed(2)}`;
					stateFields.amountSub.textContent = currency;
					stateFields.bonus.textContent = `${symbol}${balance.bonus_balance.toFixed(2)}`;
					stateFields.totalCost.textContent = `${symbol}${balance.total_cost.toFixed(2)}`;
				} else {
					ballValue.textContent = "--";
					stateFields.source.textContent = "无数据";
					stateFields.amount.textContent = "--";
					stateFields.amountSub.textContent = "";
					stateFields.bonus.textContent = "--";
					stateFields.totalCost.textContent = "--";
				}
				const ratio = state.price_ratio;
				const modelData = ratio?.models.find((model) => model.model === selectedModel);
				const topModel = state.today?.models.slice().sort((a, b) => b.tokens - a.tokens)[0]?.model;
				const topModelData = ratio?.models.find((model) => model.model === topModel);
				if (modelData) {
					stateFields.r0Total.textContent = !modelData.used_total ? "累计未使用" : modelData.r0_total !== null ? `累计R0 ×${modelData.r0_total.toFixed(2)}` : "累计R0 --";
					stateFields.r0Total.dataset.tip = modelData.has_history ? `8月17日起累计 A2/A1 = ${modelData.a2_total !== null ? toScientific(modelData.a2_total) : "--"} / ${toScientific(modelData.a1)}` : `无涨价前历史，使用默认 A1 = ${toScientific(modelData.a1)}`;
					stateFields.r0Today.textContent = !modelData.used_today ? "今日未使用" : modelData.r0_today !== null ? `今日R0 ×${modelData.r0_today.toFixed(2)}` : "今日R0 --";
					stateFields.r0Today.dataset.tip = modelData.has_history ? `今日 A2/A1 = ${modelData.a2_today !== null ? toScientific(modelData.a2_today) : "--"} / ${toScientific(modelData.a1)}` : `无涨价前历史，使用默认 A1 = ${toScientific(modelData.a1)}`;
				} else {
					stateFields.r0Total.textContent = "累计R0 --";
					stateFields.r0Today.textContent = "今日R0 --";
				}
				stateFields.ballR0.textContent = topModelData && topModelData.used_today && topModelData.r0_today !== null ? `${shortModelName(topModel ?? selectedModel)} ×${topModelData.r0_today.toFixed(2)}` : "--";
				stateFields.ballR0.dataset.tip = topModelData && topModelData.r0_today !== null ? `${shortModelName(topModel ?? selectedModel)} 今日 A2/A1 = ${toScientific(topModelData.a2_today ?? 0)} / ${toScientific(topModelData.a1)}` : "";
				if (currentRange === "today") {
					const today = state.today;
					if (today) {
						stateFields.cost.textContent = money(today.cost, currency);
						stateFields.requests.textContent = today.requests.toLocaleString("zh-CN");
						stateFields.tokens.textContent = today.tokens.toLocaleString("zh-CN");
						stateFields.modelCount.textContent = String(today.models.length);
						const rows = today.models.map((model) => `
        <div class="${NS}-row">
          <span class="model" title="${escapeHtml(model.model)}">${escapeHtml(model.model)}</span>
          <span class="num">${model.requests.toLocaleString("zh-CN")}</span>
          <span class="num">${compact(model.tokens)}</span>
          <span class="cost">${money(model.cost, currency)}</span>
        </div>
      `).join("");
						stateFields.table.innerHTML = `<div class="${NS}-row head"><span>模型</span><span>请求</span><span>Tokens</span><span>消费</span></div>${rows || `<div class="${NS}-row"><span class="model">暂无数据</span><span class="num">--</span><span class="num">--</span><span class="cost">--</span></div>`}`;
					} else {
						stateFields.cost.textContent = "--";
						stateFields.requests.textContent = "--";
						stateFields.tokens.textContent = "--";
						stateFields.modelCount.textContent = "--";
						stateFields.table.innerHTML = `<div class="${NS}-row head"><span>模型</span><span>请求</span><span>Tokens</span><span>消费</span></div><div class="${NS}-row"><span class="model">暂无数据</span><span class="num">--</span><span class="num">--</span><span class="cost">--</span></div>`;
					}
				}
				stateFields.footer.textContent = `更新于 ${new Date(state.fetched_at).toLocaleTimeString("zh-CN", { hour12: false })}`;
				lastState = state;
			};
			const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				"\"": "&quot;",
				"'": "&#39;"
			})[char] ?? char);
			const switchPage = (page) => {
				currentPage = page;
				host.querySelectorAll(`.${NS}-page`).forEach((el) => {
					el.classList.toggle("active", el.getAttribute("data-page") === page);
				});
				const pageSwitch = host.querySelector(`.${NS}-page-switch`);
				pageSwitch.textContent = page === "overview" ? "趋势" : "总览";
				pageSwitch.classList.toggle("active", page === "trends");
				if (page === "trends" && !trendData) loadTrends();
			};
			const renderRangeSummary = (aggregate) => {
				stateFields.cost.textContent = aggregate.costKnown ? money(aggregate.cost, currency) : "--";
				stateFields.requests.textContent = aggregate.requests.toLocaleString("zh-CN");
				stateFields.tokens.textContent = aggregate.tokens.toLocaleString("zh-CN");
				stateFields.modelCount.textContent = String(aggregate.rows.length);
				const rows = aggregate.rows.map((row) => `
      <div class="${NS}-row">
        <span class="model" title="${escapeHtml(row.model)}">${escapeHtml(row.model)}</span>
        <span class="num">${row.requests.toLocaleString("zh-CN")}</span>
        <span class="num">${compact(row.tokens)}</span>
        <span class="cost">${aggregate.costKnown ? money(row.cost, currency) : "--"}</span>
      </div>
    `).join("");
				stateFields.table.innerHTML = `<div class="${NS}-row head"><span>模型</span><span>请求</span><span>Tokens</span><span>消费</span></div>${rows || `<div class="${NS}-row"><span class="model">暂无数据</span><span class="num">--</span><span class="num">--</span><span class="cost">--</span></div>`}`;
			};
			const refreshOverviewRange = async () => {
				if (currentRange === "today") {
					stateFields.sectionToday.textContent = "今日";
					stateFields.sectionModels.textContent = "分模型今日";
					stateFields.costKey.textContent = "今日消费";
					stateFields.costSub.textContent = "平台实际扣费";
					stateFields.modelCountSub.textContent = "今日有调用";
					load();
					return;
				}
				const seq = ++aggregateFetchSeq;
				if (!lastState) await load();
				if (seq !== aggregateFetchSeq) return;
				const label = rangeLabel(currentRange);
				stateFields.sectionToday.textContent = label;
				stateFields.sectionModels.textContent = "分模型" + label;
				stateFields.costKey.textContent = label + "消费";
				stateFields.costSub.textContent = "估算（按历史均价）";
				stateFields.modelCountSub.textContent = "范围内有调用";
				const dates = rangeDates(currentRange);
				try {
					const series = await requestSeries(dates.start, dates.end, "day");
					if (seq !== aggregateFetchSeq) return;
					renderRangeSummary(aggregateSeries(series, lastState?.price_ratio ?? null));
					stateFields.footer.textContent = "已更新 · " + label;
				} catch (error) {
					if (seq !== aggregateFetchSeq) return;
					stateFields.footer.textContent = "范围数据加载失败：" + (error instanceof Error ? error.message : String(error));
				}
			};
			const applyRange = (range) => {
				if (currentRange === range) return;
				currentRange = range;
				const rangeSelect = host.querySelector("[data-action=\"range\"]");
				if (rangeSelect) rangeSelect.value = range;
				const dates = rangeDates(range);
				trendStartDate = dates.start;
				trendEndDate = dates.end;
				trendData = null;
				if (currentPage === "trends") loadTrends();
				else refreshOverviewRange();
			};
			const captureBackground = () => {
				const panelBg = getComputedStyle(panel).backgroundColor;
				if (panelBg && panelBg !== "transparent" && panelBg !== "rgba(0, 0, 0, 0)") return panelBg;
				const bodyBg = getComputedStyle(document.body).backgroundColor;
				if (bodyBg && bodyBg !== "transparent" && bodyBg !== "rgba(0, 0, 0, 0)") return bodyBg;
				return document.body.hasAttribute("data-ds-dark-theme") || window.matchMedia("(prefers-color-scheme: dark)").matches ? "#0b0e14" : "#eef0f4";
			};
			const captureCurrentPage = async () => {
				if (screenshotting) return;
				const page = host.querySelector(".dsu-page.active");
				if (!page || page.children.length === 0) {
					stateFields.footer.textContent = page ? "当前页面暂无内容" : "未找到当前页面";
					return;
				}
				const button = host.querySelector("[data-action=\"screenshot\"]");
				screenshotting = true;
				if (button) {
					button.disabled = true;
					button.textContent = "截图生成中…";
				}
				try {
					const bodyEl = host.querySelector(".dsu-body");
					const contentHeight = Math.max(panel.scrollHeight, bodyEl?.scrollHeight ?? 0);
					if (contentHeight > 6e4) {
						stateFields.footer.textContent = "页面过高（" + contentHeight + "px），已中止截图";
						return;
					}
					if (button) {
						button.disabled = false;
						button.textContent = "📷 复制截图";
					}
					const canvas = await html2canvas(panel, {
						scale: Math.min(2, window.devicePixelRatio || 1),
						useCORS: true,
						backgroundColor: captureBackground(),
						logging: false,
						scrollX: 0,
						scrollY: 0,
						onclone: (clonedDocument) => {
							const clonedBody = clonedDocument.querySelector(".dsu-body");
							if (clonedBody) {
								clonedBody.style.height = "auto";
								clonedBody.style.maxHeight = "none";
								clonedBody.style.overflow = "visible";
							}
							const clonedPanel = clonedDocument.querySelector(".dsu-panel");
							if (clonedPanel) {
								clonedPanel.style.height = "auto";
								clonedPanel.style.bottom = "auto";
								clonedPanel.style.transform = "none";
							}
							const clonedPage = clonedDocument.querySelector(".dsu-page.active");
							if (clonedPage) clonedPage.style.height = "auto";
						}
					});
					const blob = await new Promise((resolve, reject) => {
						canvas.toBlob((result) => result ? resolve(result) : reject(/* @__PURE__ */ new Error("canvas 导出失败")), "image/png");
					});
					try {
						await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
						stateFields.footer.textContent = "已复制截图";
					} catch (clipboardError) {
						stateFields.footer.textContent = "复制截图失败：" + (clipboardError instanceof Error ? clipboardError.message : String(clipboardError));
					}
				} catch (error) {
					stateFields.footer.textContent = "截图失败：" + (error instanceof Error ? error.message : String(error));
				} finally {
					screenshotting = false;
					if (button) {
						button.disabled = false;
						button.textContent = "📷 复制截图";
					}
				}
			};
			const requestSeries = async (start, end, granularity, onSnapshot) => {
				const url = "/api/deepseek-usage/model-usage/stream?start=" + encodeURIComponent(start) + "&end=" + encodeURIComponent(end) + "&granularity=" + granularity;
				const response = await fetch(url);
				if (!response.ok) throw new Error("HTTP " + response.status);
				if (!response.body) throw new Error("浏览器不支持流式读取");
				const reader = response.body.getReader();
				const decoder = new TextDecoder();
				let buffer = "";
				let latest = [];
				for (;;) {
					const { done, value } = await reader.read();
					if (done) break;
					buffer += decoder.decode(value, { stream: true });
					let newlineIndex = buffer.indexOf("\n");
					while (newlineIndex >= 0) {
						const line = buffer.slice(0, newlineIndex).trim();
						buffer = buffer.slice(newlineIndex + 1);
						newlineIndex = buffer.indexOf("\n");
						if (!line) continue;
						const message = JSON.parse(line);
						if (message.type === "snapshot" && message.series) {
							latest = message.series;
							onSnapshot?.(latest);
						} else if (message.type === "done" && message.result) {
							latest = message.result.series;
							onSnapshot?.(latest);
						} else if (message.type === "error") throw new Error(message.error ?? "加载失败");
					}
				}
				return latest;
			};
			const loadTrends = async () => {
				const start = trendStartDate;
				const end = trendEndDate;
				if (Math.round((gmt8Start(end) - gmt8Start(start)) / 86400) + 1 > 31) {
					stateFields.trendList.innerHTML = "<div class=\"dsu-trend-error\">日期范围不能超过 31 天</div>";
					return;
				}
				trendStartDate = start;
				trendEndDate = end;
				stateFields.trendList.innerHTML = "<div class=\"dsu-trend-loading\">加载模型用量趋势…</div>";
				try {
					const series = await requestSeries(start, end, trendGranularity, (snapshotSeries) => {
						trendData = {
							start,
							end,
							granularity: trendGranularity,
							series: snapshotSeries
						};
						renderTrends();
					});
					trendData = {
						start,
						end,
						granularity: trendGranularity,
						series
					};
					renderTrends();
				} catch (error) {
					stateFields.trendList.innerHTML = "<div class=\"dsu-trend-error\">" + escapeHtml(error instanceof Error ? error.message : String(error)) + "</div>";
				}
			};
			const renderTrends = () => {
				const data = trendData;
				if (!data) return;
				if (data.error) {
					stateFields.trendList.innerHTML = `<div class="${NS}-trend-error">${escapeHtml(data.error)}</div>`;
					return;
				}
				if (data.series.length === 0) {
					stateFields.trendList.innerHTML = `<div class="${NS}-trend-empty">所选范围内暂无模型用量数据</div>`;
					return;
				}
				const filled = data.series.map((series) => fillModelSeries(series, data.start, data.end, data.granularity));
				const palette = [
					"#4d6bfe",
					"#34d399",
					"#fbbf24",
					"#f87171",
					"#a78bfa",
					"#22d3ee",
					"#fb923c",
					"#f472b6",
					"#a3e635",
					"#60a5fa"
				];
				const groups = /* @__PURE__ */ new Map();
				for (const series of filled) {
					let models = groups.get(series.provider);
					if (!models) {
						models = /* @__PURE__ */ new Map();
						groups.set(series.provider, models);
					}
					const list = models.get(series.model) ?? [];
					list.push(series);
					models.set(series.model, list);
				}
				let colorIndex = 0;
				let html = "";
				for (const [provider, models] of groups) {
					html += `<div class="${NS}-trend-group">`;
					html += `<div class="${NS}-trend-provider">${escapeHtml(provider)}</div>`;
					for (const seriesList of models.values()) html += renderTrendChart(seriesList, palette[colorIndex++ % palette.length]);
					html += "</div>";
				}
				stateFields.trendList.innerHTML = html || `<div class="${NS}-trend-empty">所选范围内暂无模型用量数据</div>`;
				bindTrendInteractions();
			};
			const renderTrendChart = (seriesList, color) => {
				const points = seriesList[0]?.points ?? [];
				if (points.length === 0 || seriesList.length === 0) return "";
				const width = 600;
				const height = 180;
				const margin = {
					top: 12,
					right: 16,
					bottom: 26,
					left: 44
				};
				const plotWidth = width - margin.left - margin.right;
				const plotHeight = height - margin.top - margin.bottom;
				const maxTokens = Math.max(...seriesList.flatMap((series) => series.points.map((point) => point.tokens)), 1);
				const x = (index) => points.length === 1 ? margin.left + plotWidth / 2 : margin.left + plotWidth * index / (points.length - 1);
				const y = (value) => margin.top + plotHeight - plotHeight * Math.min(value, maxTokens) / maxTokens;
				const secondaryPalette = [
					"#f87171",
					"#34d399",
					"#fbbf24",
					"#a78bfa",
					"#22d3ee",
					"#fb923c",
					"#f472b6",
					"#a3e635",
					"#60a5fa"
				];
				const visionPalette = [
					"#f59e0b",
					"#f87171",
					"#a78bfa",
					"#34d399",
					"#fbbf24"
				];
				const usedColors = new Set([color.toLowerCase()]);
				const pickDistinct = (candidates) => {
					let best = candidates[0];
					let bestDistance = -1;
					for (const candidate of candidates) {
						if (usedColors.has(candidate.toLowerCase())) continue;
						const minDistance = Math.min(...[...usedColors].map((used) => colorDistance(candidate, used)));
						if (minDistance > bestDistance) {
							bestDistance = minDistance;
							best = candidate;
						}
					}
					usedColors.add(best.toLowerCase());
					return best;
				};
				const sourceColors = seriesList.map((series, index) => {
					if (isVisionSource(series.source)) return pickDistinct(visionPalette);
					if (index === 0) return color;
					return pickDistinct(secondaryPalette);
				});
				const rendered = seriesList.map((series, seriesIndex) => {
					const lineColor = sourceColors[seriesIndex];
					const line = series.points.map((point, index) => `${index === 0 ? "M" : "L"}${x(index).toFixed(1)},${y(point.tokens).toFixed(1)}`).join(" ");
					const area = `${line} L${x(points.length - 1).toFixed(1)},${margin.top + plotHeight} L${x(0).toFixed(1)},${margin.top + plotHeight} Z`;
					const pointHitRate = (point) => {
						const input = point.inputTokens + point.cacheReadTokens + point.cacheWriteTokens;
						return input > 0 ? point.cacheReadTokens / input * 100 : 0;
					};
					return {
						lineColor,
						area,
						line,
						circles: series.points.map((point, index) => `
        <circle cx="${x(index).toFixed(1)}" cy="${y(point.tokens).toFixed(1)}" r="3" fill="${lineColor}" stroke="var(--dsu-panel-2)" stroke-width="1.5"/>
        <circle class="${NS}-point-hit" cx="${x(index).toFixed(1)}" cy="${y(point.tokens).toFixed(1)}" r="10" fill="transparent"
          data-x="${x(index).toFixed(1)}"
          data-source="${escapeHtml(series.source ?? series.provider)}"
          data-color="${lineColor}"
          data-label="${escapeHtml(point.label)}"
          data-total="${point.tokens}"
          data-input="${point.inputTokens}"
          data-output="${point.outputTokens}"
          data-cache-read="${point.cacheReadTokens}"
          data-cache-write="${point.cacheWriteTokens}"
          data-hit-rate="${pointHitRate(point).toFixed(1)}"/>
      `).join("")
					};
				});
				let total = 0;
				let totalInput = 0;
				let totalCacheRead = 0;
				for (const series of seriesList) for (const point of series.points) {
					total += point.tokens;
					totalInput += point.inputTokens + point.cacheReadTokens + point.cacheWriteTokens;
					totalCacheRead += point.cacheReadTokens;
				}
				const totalHitRate = totalInput > 0 ? totalCacheRead / totalInput * 100 : 0;
				const hasToolkitSource = seriesList.some((series) => isVisionSource(series.source));
				const legend = seriesList.length > 1 || hasToolkitSource ? `<span style="display:inline-flex;gap:10px;flex-wrap:wrap;">${seriesList.map((series, index) => `
          <span style="display:inline-flex;align-items:center;gap:4px;color:var(--dsu-muted);font-size:11px;">
            <i style="width:12px;height:2px;background:${sourceColors[index]};display:inline-block;flex:none;"></i>${escapeHtml(sourceLabel(series.source))}
          </span>`).join("")}</span>` : "";
				const ticks = 4;
				const gridLines = Array.from({ length: 5 }, (_, index) => {
					const yy = y(maxTokens * index / ticks);
					return `<line x1="${margin.left}" y1="${yy.toFixed(1)}" x2="${width - margin.right}" y2="${yy.toFixed(1)}" stroke="var(--dsu-border)" stroke-width="1"/>`;
				}).join("");
				const yLabels = Array.from({ length: 5 }, (_, index) => {
					const value = maxTokens * index / ticks;
					const yy = y(value);
					return `<text x="${margin.left - 8}" y="${(yy + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="var(--dsu-muted)">${compact(value)}</text>`;
				}).join("");
				const labelStep = Math.max(1, Math.ceil(points.length / 8));
				const xLabels = points.map((point, index) => index % labelStep === 0 ? `<text x="${x(index).toFixed(1)}" y="${height - 8}" text-anchor="middle" font-size="10" fill="var(--dsu-muted)">${escapeHtml(point.label)}</text>` : "").join("");
				const model = seriesList[0]?.model ?? "";
				return `
      <div class="${NS}-chart-card">
        <div class="${NS}-chart-head">
          <span style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;min-width:0;">
            <span class="${NS}-chart-title">${escapeHtml(model)}</span>
            ${legend}
          </span>
          <span class="${NS}-chart-total">${compact(total)} Tokens · 命中率 ${totalHitRate.toFixed(1)}%</span>
        </div>
        <svg class="${NS}-chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${escapeHtml(model)} 用量趋势">
          ${gridLines}
          ${yLabels}
          ${xLabels}
          <line class="${NS}-hover-line" x1="0" y1="${margin.top}" x2="0" y2="${margin.top + plotHeight}" stroke="var(--dsu-muted)" stroke-width="1" stroke-dasharray="4 3" opacity="0" pointer-events="none"/>
          ${rendered.map((item) => `<path d="${item.area}" fill="${item.lineColor}" opacity="0.08"/>`).join("")}
          ${rendered.map((item) => `<path d="${item.line}" fill="none" stroke="${item.lineColor}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`).join("")}
          ${rendered.map((item) => item.circles).join("")}
        </svg>
      </div>
    `;
			};
			const showChartTooltip = (circle, clientX, clientY) => {
				const rect = circle.getBoundingClientRect();
				const x = circle.getAttribute("data-x") ?? "0";
				const svg = circle.closest("svg");
				const line = svg?.querySelector(`.${NS}-hover-line`);
				if (line) {
					line.setAttribute("x1", x);
					line.setAttribute("x2", x);
					line.setAttribute("opacity", "1");
				}
				const label = circle.getAttribute("data-label") ?? "";
				const cards = (svg ? Array.from(svg.querySelectorAll(`.${NS}-point-hit`)).filter((item) => item.getAttribute("data-x") === x) : [circle]).map((item) => {
					const source = item.getAttribute("data-source") ?? "";
					const color = item.getAttribute("data-color") ?? "#4d6bfe";
					const input = Number(item.getAttribute("data-input") ?? 0);
					const output = Number(item.getAttribute("data-output") ?? 0);
					const cacheRead = Number(item.getAttribute("data-cache-read") ?? 0);
					const cacheWrite = Number(item.getAttribute("data-cache-write") ?? 0);
					const hitRate = Number(item.getAttribute("data-hit-rate") ?? 0);
					return `
        <div style="background:var(--dsu-panel-2);border:1px solid var(--dsu-border);border-radius:8px;padding:8px 10px;min-width:130px;">
          <div style="display:flex;align-items:center;gap:6px;font-weight:600;margin-bottom:6px;">
            <i style="width:10px;height:10px;border-radius:50%;background:${color};display:inline-block;flex:none;"></i>
            ${escapeHtml(sourceLabel(source))}
          </div>
          <div>输入 ${compact(input)}</div>
          <div>输出 ${compact(output)}</div>
          <div>缓存命中 ${compact(cacheRead)}</div>
          <div>缓存未命中 ${compact(cacheWrite)}</div>
          <div>命中率 ${hitRate.toFixed(1)}%</div>
        </div>
      `;
				}).join("");
				stateFields.tooltip.innerHTML = `
      <div style="font-weight:600;margin-bottom:6px;">${escapeHtml(label)}</div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;">${cards}</div>
    `;
				stateFields.tooltip.classList.add("visible");
				const tooltip = stateFields.tooltip;
				const tooltipWidth = tooltip.offsetWidth || 380;
				const tooltipHeight = tooltip.offsetHeight || 180;
				const pointerX = clientX ?? rect.left + rect.width / 2;
				const pointerY = clientY ?? rect.top + rect.height / 2;
				const gap = 14;
				let left = pointerX + gap;
				if (left + tooltipWidth > window.innerWidth - 8) left = pointerX - tooltipWidth - gap;
				left = Math.max(8, Math.min(left, window.innerWidth - tooltipWidth - 8));
				let top = pointerY + gap;
				if (top + tooltipHeight > window.innerHeight - 8) top = pointerY - tooltipHeight - gap;
				top = Math.max(8, Math.min(top, window.innerHeight - tooltipHeight - 8));
				tooltip.style.left = `${left}px`;
				tooltip.style.top = `${top}px`;
			};
			const hideChartTooltip = (circle) => {
				hideTooltip();
				const line = circle.closest("svg")?.querySelector(`.${NS}-hover-line`);
				if (line) line.setAttribute("opacity", "0");
			};
			const bindTrendInteractions = () => {
				host.querySelectorAll(`.${NS}-point-hit`).forEach((circle) => {
					circle.addEventListener("mouseenter", () => showChartTooltip(circle));
					circle.addEventListener("mouseleave", () => hideChartTooltip(circle));
				});
				host.querySelectorAll(`.${NS}-chart-svg`).forEach((svg) => {
					svg.addEventListener("mousemove", (event) => {
						const rect = svg.getBoundingClientRect();
						if (rect.width === 0) return;
						const x = (event.clientX - rect.left) * (600 / rect.width);
						let nearest = null;
						let nearestDistance = Number.POSITIVE_INFINITY;
						svg.querySelectorAll(`.${NS}-point-hit`).forEach((circle) => {
							const cx = Number(circle.getAttribute("data-x") ?? 0);
							const distance = Math.abs(cx - x);
							if (distance < nearestDistance) {
								nearestDistance = distance;
								nearest = circle;
							}
						});
						if (nearest) showChartTooltip(nearest);
					});
					svg.addEventListener("mouseleave", () => {
						hideTooltip();
						const line = svg.querySelector(`.${NS}-hover-line`);
						if (line) line.setAttribute("opacity", "0");
					});
				});
			};
			let dragMoved = false;
			let dragPointerY = 0;
			let dragStartTop = 0;
			const onBallPointerDown = (event) => {
				dragMoved = false;
				dragPointerY = event.clientY;
				dragStartTop = ball.getBoundingClientRect().top;
				ball.setPointerCapture(event.pointerId);
			};
			const onBallPointerMove = (event) => {
				if (!ball.hasPointerCapture(event.pointerId)) return;
				const delta = event.clientY - dragPointerY;
				if (Math.abs(delta) > 4) dragMoved = true;
				const maxTop = Math.max(0, window.innerHeight - ball.offsetHeight);
				ball.style.top = `${Math.max(0, Math.min(maxTop, dragStartTop + delta))}px`;
			};
			const onBallPointerUp = (event) => {
				if (!ball.hasPointerCapture(event.pointerId)) return;
				ball.releasePointerCapture(event.pointerId);
				if (!dragMoved) return;
				const side = event.clientX < window.innerWidth / 2 ? "left" : "right";
				if (side === "left") {
					ball.style.right = "auto";
					ball.style.left = "0";
					ball.style.borderRadius = "0 999px 999px 0";
				} else {
					ball.style.left = "auto";
					ball.style.right = "0";
					ball.style.borderRadius = "999px 0 0 999px";
				}
				writeStoredValue("ballTop", String(Math.round(ball.getBoundingClientRect().top)));
				writeStoredValue("ballSide", side);
			};
			ball.addEventListener("click", () => {
				if (!dragMoved) toggle();
			});
			ball.addEventListener("pointerdown", onBallPointerDown);
			ball.addEventListener("pointermove", onBallPointerMove);
			ball.addEventListener("pointerup", onBallPointerUp);
			ball.addEventListener("keydown", (event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					toggle();
				}
			});
			host.querySelector("[data-action=\"login\"]")?.addEventListener("click", () => void startLogin());
			host.querySelector("[data-action=\"logout\"]")?.addEventListener("click", () => void logout());
			host.querySelectorAll("[data-action=\"refresh\"]").forEach((el) => el.addEventListener("click", () => void refresh()));
			stateFields.modelSelect.addEventListener("change", () => {
				selectedModel = stateFields.modelSelect.value;
				if (lastState) render(lastState);
			});
			bindTooltip(stateFields.r0Total);
			bindTooltip(stateFields.r0Today);
			bindTooltip(stateFields.ballR0);
			host.querySelector("[data-action=\"close\"]")?.addEventListener("click", () => toggle(false));
			host.querySelector("[data-action=\"granularity\"][data-granularity=\"hour\"]")?.classList.add("active");
			host.querySelector("[data-action=\"page\"]")?.addEventListener("click", () => {
				switchPage(currentPage === "overview" ? "trends" : "overview");
			});
			host.querySelector("[data-action=\"range\"]")?.addEventListener("change", (event) => {
				const value = event.target.value;
				applyRange(value);
			});
			host.querySelector("[data-action=\"screenshot\"]")?.addEventListener("click", () => void captureCurrentPage());
			host.querySelectorAll("[data-action=\"granularity\"]").forEach((button) => {
				button.addEventListener("click", () => {
					trendGranularity = button.getAttribute("data-granularity") === "day" ? "day" : "hour";
					host.querySelectorAll("[data-action=\"granularity\"]").forEach((item) => {
						item.classList.toggle("active", item === button);
					});
					loadTrends();
				});
			});
			const resizeHandle = host.querySelector("[data-action=\"resize\"]");
			let resizing = false;
			let resizeStartX = 0;
			let resizeStartWidth = 0;
			const onResizeDown = (event) => {
				resizing = true;
				resizeStartX = event.clientX;
				resizeStartWidth = panel.offsetWidth;
				resizeHandle.setPointerCapture(event.pointerId);
			};
			const onResizeMove = (event) => {
				if (!resizing) return;
				const delta = event.clientX - resizeStartX;
				const nextWidth = Math.max(320, Math.min(900, window.innerWidth - 40, resizeStartWidth - delta));
				panel.style.width = `${nextWidth}px`;
			};
			const onResizeUp = (event) => {
				if (!resizing) return;
				resizing = false;
				resizeHandle.releasePointerCapture(event.pointerId);
				writeStoredValue("panelWidth", String(panel.offsetWidth));
			};
			resizeHandle.addEventListener("pointerdown", onResizeDown);
			resizeHandle.addEventListener("pointermove", onResizeMove);
			resizeHandle.addEventListener("pointerup", onResizeUp);
			const onKeydown = (event) => {
				if (event.key === "Escape" && open) toggle(false);
			};
			document.addEventListener("keydown", onKeydown);
			const onDocumentClick = (event) => {
				if (!open) return;
				const target = event.target;
				if (!panel.contains(target) && !ball.contains(target)) toggle(false);
			};
			document.addEventListener("click", onDocumentClick);
			const disposeOverlay = ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "dsh-deepseek-usage",
				order: 100
			}, () => null));
			const disposeUsageCard = ctx.slots.inject("ventus.settings.item", () => ctx.slots.register({
				name: "ventus.settings.item",
				id: "dsh-deepseek-usage",
				order: 20
			}, DeepSeekUsageSettingsCard));
			let disposeVentusPage;
			const pageTimer = setTimeout(() => {
				if (containsSlot(ctx.slots.snapshot(), "ventus.settings.item")) return;
				disposeVentusPage = ctx.slots.inject("settings.section", () => ctx.slots.register({
					name: "settings.section",
					id: "ventus",
					order: 60,
					label: () => "Ventus",
					children: { "ventus.settings.item": {
						kind: "list",
						scope: "root"
					} }
				}, VentusSettingsPage));
			}, 800);
			const applyUsageEnabled = (enabled) => {
				usageEnabled = enabled;
				host.style.display = enabled ? "" : "none";
				if (enabled) {
					load();
					if (pollTimer === void 0) pollTimer = setInterval(() => {
						load();
					}, POLL_MS);
				} else {
					if (pollTimer !== void 0) {
						clearInterval(pollTimer);
						pollTimer = void 0;
					}
					toggle(false);
				}
			};
			const onVentusPrefs = (event) => {
				const detail = event.detail;
				if (detail !== void 0) applyUsageEnabled(detail.usageEnabled);
			};
			window.addEventListener(VENTUS_PREFS_EVENT, onVentusPrefs);
			applyUsageEnabled(usageEnabled);
			let hourlyTrendTimer;
			const scheduleHourlyTrendRefresh = () => {
				const now = /* @__PURE__ */ new Date();
				const next = new Date(now);
				next.setMinutes(0, 0, 0);
				next.setSeconds(0, 0);
				next.setHours(now.getHours() + 1);
				const delay = Math.max(1e3, next.getTime() - now.getTime() + 250);
				hourlyTrendTimer = setTimeout(() => {
					if (usageEnabled && trendData) loadTrends();
					scheduleHourlyTrendRefresh();
				}, delay);
			};
			scheduleHourlyTrendRefresh();
			ctx.effect(() => () => {
				if (pollTimer !== void 0) clearInterval(pollTimer);
				window.removeEventListener(VENTUS_PREFS_EVENT, onVentusPrefs);
				clearInterval(loginPollTimer);
				clearTimeout(pageTimer);
				clearTimeout(hourlyTrendTimer);
				disposeOverlay();
				disposeUsageCard();
				disposeVentusPage?.();
				document.removeEventListener("keydown", onKeydown);
				document.removeEventListener("click", onDocumentClick);
				disposeVentusPrefs();
				host.remove();
				styleEl?.remove();
			}, "dsh-deepseek-usage: ui");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map