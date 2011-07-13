exports.join = function(a, b) {
	if (!/\/$/.test(a)) {
		a += '/';
	}
	if (/^\//.test(b)) {
		b = b.slice(1);
	}
	return a + b;
};
