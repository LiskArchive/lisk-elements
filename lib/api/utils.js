module.exports = {
/**
 * @method trimObj
 * @param obj
 *
 * @return trimmed string
 */
	trimObj: function trimIt(obj) {
		if (!Array.isArray(obj) && typeof obj !== 'object') return obj;

		return Object.keys(obj).reduce(function(acc, key) {
			acc[key.trim()] = typeof obj[key] === 'string'
				? obj[key].trim()
				: Number.isInteger(obj[key])
					? obj[key].toString()
					: trimIt(obj[key]);
			return acc;
		}, Array.isArray(obj) ? [] : {});
	},
/**
 * @method toQueryString
 * @param obj
 *
 * @return query string
 */
	toQueryString: function(obj) {
		var parts = [];

		for (var i in obj) {
			parts.push(encodeURIComponent(i) + '=' + encodeURI(obj[i]));
		}

		return parts.join('&');
	},
};
