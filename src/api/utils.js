module.exports = {
/**
 * @method trimObj
 * @param obj
 *
 * @return trimmed object
 */
	trimObj: function trimObj(obj) {
		const isArray = Array.isArray(obj);
		if (!isArray && typeof obj !== 'object') {
			return Number.isInteger(obj)
				? obj.toString()
				: obj;
		}

		const trim = value => (
			typeof value === 'string'
				? value.trim()
				: trimObj(value)
		);

		return isArray
			? obj.map(trim)
			: Object.keys(obj)
				.reduce((accumulator, key) => {
					const trimmedKey = trim(key);
					const trimmedValue = trim(obj[key]);
					return Object.assign({}, accumulator, {
						[trimmedKey]: trimmedValue,
					});
				}, {});
	},
	/**
	 * @method toQueryString
	 * @param obj
	 *
	 * @return query string
	 */
	toQueryString(obj) {
		const parts = Object.keys(obj)
			.reduce((accumulator, key) => [
				...accumulator,
				`${encodeURIComponent(key)}=${encodeURI(obj[key])}`,
			], []);

		return parts.join('&');
	},

	/**
	 * Extend a JavaScript object with the key/value pairs of another.
	 * @method extend
	 * @param obj
	 * @param src
	 *
	 * @return obj Object
	 */
	extend(obj, src) {
		// clone settings
		const cloneObj = JSON.parse(JSON.stringify(obj));
		Object.keys(src).forEach((key) => { cloneObj[key] = src[key]; });
		return cloneObj;
	},
};
