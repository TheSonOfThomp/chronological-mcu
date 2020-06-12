function isObject(t) { var e = typeof t; return null != t && ("object" == e || "function" == e) };
var now = function () { return Date.now() }
var NAN = 0 / 0;
var reTrim = /^\s+|\s+$/g;
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
var reIsBinary = /^0b[01]+$/i;
var reIsOctal = /^0o[0-7]+$/i;
var freeParseInt = parseInt;
function toNumber(e) { if ("number" == typeof e) return e; if (isSymbol(e)) return NAN; if (isObject(e)) { var r = "function" == typeof e.valueOf ? e.valueOf() : e; e = isObject(r) ? r + "" : r } if ("string" != typeof e) return 0 === e ? e : +e; e = e.replace(reTrim, ""); var t = reIsBinary.test(e); return t || reIsOctal.test(e) ? freeParseInt(e.slice(2), t ? 2 : 8) : reIsBadHex.test(e) ? NAN : +e }
var FUNC_ERROR_TEXT = "Expected a function";
var nativeMax = Math.max, nativeMin = Math.min; 
function debounce(n, i, t) { var e, r, o, u, a, c, v = 0, f = !1, m = !1, d = !0; if ("function" != typeof n) throw new TypeError(FUNC_ERROR_TEXT); function T(i) { var t = e, o = r; return e = r = void 0, v = i, u = n.apply(o, t) } function s(n) { var t = n - c; return void 0 === c || t >= i || t < 0 || m && n - v >= o } function b() { var n = now(); if (s(n)) return l(n); a = setTimeout(b, function (n) { var t = i - (n - c); return m ? nativeMin(t, o - (n - v)) : t }(n)) } function l(n) { return a = void 0, d && e ? T(n) : (e = r = void 0, u) } function w() { var n = now(), t = s(n); if (e = arguments, r = this, c = n, t) { if (void 0 === a) return function (n) { return v = n, a = setTimeout(b, i), f ? T(n) : u }(c); if (m) return clearTimeout(a), a = setTimeout(b, i), T(c) } return void 0 === a && (a = setTimeout(b, i)), u } return i = toNumber(i) || 0, isObject(t) && (f = !!t.leading, o = (m = "maxWait" in t) ? nativeMax(toNumber(t.maxWait) || 0, i) : o, d = "trailing" in t ? !!t.trailing : d), w.cancel = function () { void 0 !== a && clearTimeout(a), v = 0, e = c = r = a = void 0 }, w.flush = function () { return void 0 === a ? u : l(now()) }, w };
function throttle(e, i, t) { var n = !0, r = !0; if ("function" != typeof e) throw new TypeError(FUNC_ERROR_TEXT); return isObject(t) && (n = "leading" in t ? !!t.leading : n, r = "trailing" in t ? !!t.trailing : r), debounce(e, i, { leading: n, maxWait: i, trailing: r }) };

