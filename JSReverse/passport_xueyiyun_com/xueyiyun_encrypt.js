function setMaxDigits(n) {
    maxDigits = n;
    ZERO_ARRAY = new Array(maxDigits);
    for (var t = 0; t < ZERO_ARRAY.length; t++)
        ZERO_ARRAY[t] = 0;
    bigZero = new BigInt;
    bigOne = new BigInt;
    bigOne.digits[0] = 1
}

function BigInt(n) {
    this.digits = typeof n == "boolean" && n == !0 ? null : ZERO_ARRAY.slice(0);
    this.isNeg = !1
}

function biFromDecimal(n) {
    for (var u = n.charAt(0) == "-", t = u ? 1 : 0, i, f, r; t < n.length && n.charAt(t) == "0";)
        ++t;
    if (t == n.length)
        i = new BigInt;
    else {
        for (f = n.length - t,
                 r = f % dpl10,
             r == 0 && (r = dpl10),
                 i = biFromNumber(Number(n.substr(t, r))),
                 t += r; t < n.length;)
            i = biAdd(biMultiply(i, lr10), biFromNumber(Number(n.substr(t, dpl10)))),
                t += dpl10;
        i.isNeg = u
    }
    return i
}

function biCopy(n) {
    var t = new BigInt(!0);
    return t.digits = n.digits.slice(0),
        t.isNeg = n.isNeg,
        t
}

function biFromNumber(n) {
    var t = new BigInt, i;
    for (t.isNeg = n < 0,
             n = Math.abs(n),
             i = 0; n > 0;)
        t.digits[i++] = n & maxDigitVal,
            n >>= biRadixBits;
    return t
}

function reverseStr(n) {
    for (var i = "", t = n.length - 1; t > -1; --t)
        i += n.charAt(t);
    return i
}

function biToString(n, t) {
    var r = new BigInt, i, u;
    for (r.digits[0] = t,
             i = biDivideModulo(n, r),
             u = hexatrigesimalToChar[i[1].digits[0]]; biCompare(i[0], bigZero) == 1;)
        i = biDivideModulo(i[0], r),
            digit = i[1].digits[0],
            u += hexatrigesimalToChar[i[1].digits[0]];
    return (n.isNeg ? "-" : "") + reverseStr(u)
}

function biToDecimal(n) {
    var i = new BigInt, t, r;
    for (i.digits[0] = 10,
             t = biDivideModulo(n, i),
             r = String(t[1].digits[0]); biCompare(t[0], bigZero) == 1;)
        t = biDivideModulo(t[0], i),
            r += String(t[1].digits[0]);
    return (n.isNeg ? "-" : "") + reverseStr(r)
}

function digitToHex(n) {
    var t = "";
    for (i = 0; i < 4; ++i)
        t += hexToChar[n & 15],
            n >>>= 4;
    return reverseStr(t)
}

function biToHex(n) {
    for (var i = "", r = biHighIndex(n), t = biHighIndex(n); t > -1; --t)
        i += digitToHex(n.digits[t]);
    return i
}

function charToHex(n) {
    var t = 48
        , u = t + 9
        , i = 97
        , f = i + 25
        , r = 65;
    return n >= t && n <= u ? n - t : n >= r && n <= 90 ? 10 + n - r : n >= i && n <= f ? 10 + n - i : 0
}

function hexToDigit(n) {
    for (var i = 0, r = Math.min(n.length, 4), t = 0; t < r; ++t)
        i <<= 4,
            i |= charToHex(n.charCodeAt(t));
    return i
}

function biFromHex(n) {
    for (var r = new BigInt, u = n.length, t = u, i = 0; t > 0; t -= 4,
        ++i)
        r.digits[i] = hexToDigit(n.substr(Math.max(t - 4, 0), Math.min(t, 4)));
    return r
}

function biFromString(n, t) {
    var f = n.charAt(0) == "-", e = f ? 1 : 0, i = new BigInt, r = new BigInt, u;
    for (r.digits[0] = 1,
             u = n.length - 1; u >= e; u--) {
        var o = n.charCodeAt(u)
            , s = charToHex(o)
            , h = biMultiplyDigit(r, s);
        i = biAdd(i, h);
        r = biMultiplyDigit(r, t)
    }
    return i.isNeg = f,
        i
}

function biToBytes(n) {
    for (var i = "", t = biHighIndex(n); t > -1; --t)
        i += digitToBytes(n.digits[t]);
    return i
}

function digitToBytes(n) {
    var i = String.fromCharCode(n & 255), t;
    return n >>>= 8,
        t = String.fromCharCode(n & 255),
    t + i
}

function biDump(n) {
    return (n.isNeg ? "-" : "") + n.digits.join(" ")
}

function biAdd(n, t) {
    var r, u, f, i;
    if (n.isNeg != t.isNeg)
        t.isNeg = !t.isNeg,
            r = biSubtract(n, t),
            t.isNeg = !t.isNeg;
    else {
        for (r = new BigInt,
                 u = 0,
                 i = 0; i < n.digits.length; ++i)
            f = n.digits[i] + t.digits[i] + u,
                r.digits[i] = f & 65535,
                u = Number(f >= biRadix);
        r.isNeg = n.isNeg
    }
    return r
}

function biSubtract(n, t) {
    var r, f, u, i;
    if (n.isNeg != t.isNeg)
        t.isNeg = !t.isNeg,
            r = biAdd(n, t),
            t.isNeg = !t.isNeg;
    else {
        for (r = new BigInt,
                 u = 0,
                 i = 0; i < n.digits.length; ++i)
            f = n.digits[i] - t.digits[i] + u,
                r.digits[i] = f & 65535,
            r.digits[i] < 0 && (r.digits[i] += biRadix),
                u = 0 - Number(f < 0);
        if (u == -1) {
            for (u = 0,
                     i = 0; i < n.digits.length; ++i)
                f = 0 - r.digits[i] + u,
                    r.digits[i] = f & 65535,
                r.digits[i] < 0 && (r.digits[i] += biRadix),
                    u = 0 - Number(f < 0);
            r.isNeg = !n.isNeg
        } else
            r.isNeg = n.isNeg
    }
    return r
}

function biHighIndex(n) {
    for (var t = n.digits.length - 1; t > 0 && n.digits[t] == 0;)
        --t;
    return t
}

function biNumBits(n) {
    for (var i = biHighIndex(n), r = n.digits[i], u = (i + 1) * bitsPerDigit, t = u; t > u - bitsPerDigit; --t) {
        if ((r & 32768) != 0)
            break;
        r <<= 1
    }
    return t
}

function biMultiply(n, t) {
    for (var r = new BigInt, u, o = biHighIndex(n), s = biHighIndex(t), e, f, i = 0; i <= s; ++i) {
        for (u = 0,
                 f = i,
                 j = 0; j <= o; ++j,
                 ++f)
            e = r.digits[f] + n.digits[j] * t.digits[i] + u,
                r.digits[f] = e & maxDigitVal,
                u = e >>> biRadixBits;
        r.digits[i + o + 1] = u
    }
    return r.isNeg = n.isNeg != t.isNeg,
        r
}

function biMultiplyDigit(n, t) {
    var u, r, f, i;
    for (result = new BigInt,
             u = biHighIndex(n),
             r = 0,
             i = 0; i <= u; ++i)
        f = result.digits[i] + n.digits[i] * t + r,
            result.digits[i] = f & maxDigitVal,
            r = f >>> biRadixBits;
    return result.digits[1 + u] = r,
        result
}

function arrayCopy(n, t, i, r, u) {
    for (var o = Math.min(t + u, n.length), f = t, e = r; f < o; ++f,
        ++e)
        i[e] = n[f]
}

function biShiftLeft(n, t) {
    var e = Math.floor(t / bitsPerDigit), i = new BigInt, u, o, r, f;
    for (arrayCopy(n.digits, 0, i.digits, e, i.digits.length - e),
             u = t % bitsPerDigit,
             o = bitsPerDigit - u,
             r = i.digits.length - 1,
             f = r - 1; r > 0; --r,
             --f)
        i.digits[r] = i.digits[r] << u & maxDigitVal | (i.digits[f] & highBitMasks[u]) >>> o;
    return i.digits[0] = i.digits[r] << u & maxDigitVal,
        i.isNeg = n.isNeg,
        i
}

function biShiftRight(n, t) {
    var e = Math.floor(t / bitsPerDigit), i = new BigInt, u, o, r, f;
    for (arrayCopy(n.digits, e, i.digits, 0, n.digits.length - e),
             u = t % bitsPerDigit,
             o = bitsPerDigit - u,
             r = 0,
             f = r + 1; r < i.digits.length - 1; ++r,
             ++f)
        i.digits[r] = i.digits[r] >>> u | (i.digits[f] & lowBitMasks[u]) << o;
    return i.digits[i.digits.length - 1] >>>= u,
        i.isNeg = n.isNeg,
        i
}

function biMultiplyByRadixPower(n, t) {
    var i = new BigInt;
    return arrayCopy(n.digits, 0, i.digits, t, i.digits.length - t),
        i
}

function biDivideByRadixPower(n, t) {
    var i = new BigInt;
    return arrayCopy(n.digits, t, i.digits, 0, i.digits.length - t),
        i
}

function biModuloByRadixPower(n, t) {
    var i = new BigInt;
    return arrayCopy(n.digits, 0, i.digits, 0, t),
        i
}

function biCompare(n, t) {
    if (n.isNeg != t.isNeg)
        return 1 - 2 * Number(n.isNeg);
    for (var i = n.digits.length - 1; i >= 0; --i)
        if (n.digits[i] != t.digits[i])
            return n.isNeg ? 1 - 2 * Number(n.digits[i] > t.digits[i]) : 1 - 2 * Number(n.digits[i] < t.digits[i]);
    return 0
}

function biDivideModulo(n, t) {
    var a = biNumBits(n), s = biNumBits(t), v = t.isNeg, r, i, u, e, h, o, f, p, w;
    if (a < s)
        return n.isNeg ? (r = biCopy(bigOne),
            r.isNeg = !t.isNeg,
            n.isNeg = !1,
            t.isNeg = !1,
            i = biSubtract(t, n),
            n.isNeg = !0,
            t.isNeg = v) : (r = new BigInt,
            i = biCopy(n)),
            [r, i];
    for (r = new BigInt,
             i = n,
             u = Math.ceil(s / bitsPerDigit) - 1,
             e = 0; t.digits[u] < biHalfRadix;)
        t = biShiftLeft(t, 1),
            ++e,
            ++s,
            u = Math.ceil(s / bitsPerDigit) - 1;
    for (i = biShiftLeft(i, e),
             a += e,
             h = Math.ceil(a / bitsPerDigit) - 1,
             o = biMultiplyByRadixPower(t, h - u); biCompare(i, o) != -1;)
        ++r.digits[h - u],
            i = biSubtract(i, o);
    for (f = h; f > u; --f) {
        var c = f >= i.digits.length ? 0 : i.digits[f]
            , y = f - 1 >= i.digits.length ? 0 : i.digits[f - 1]
            , b = f - 2 >= i.digits.length ? 0 : i.digits[f - 2]
            , l = u >= t.digits.length ? 0 : t.digits[u]
            , k = u - 1 >= t.digits.length ? 0 : t.digits[u - 1];
        for (r.digits[f - u - 1] = c == l ? maxDigitVal : Math.floor((c * biRadix + y) / l),
                 p = r.digits[f - u - 1] * (l * biRadix + k),
                 w = c * biRadixSquared + (y * biRadix + b); p > w;)
            --r.digits[f - u - 1],
                p = r.digits[f - u - 1] * (l * biRadix | k),
                w = c * biRadix * biRadix + (y * biRadix + b);
        o = biMultiplyByRadixPower(t, f - u - 1);
        i = biSubtract(i, biMultiplyDigit(o, r.digits[f - u - 1]));
        i.isNeg && (i = biAdd(i, o),
            --r.digits[f - u - 1])
    }
    return i = biShiftRight(i, e),
        r.isNeg = n.isNeg != v,
    n.isNeg && (r = v ? biAdd(r, bigOne) : biSubtract(r, bigOne),
        t = biShiftRight(t, e),
        i = biSubtract(t, i)),
    i.digits[0] == 0 && biHighIndex(i) == 0 && (i.isNeg = !1),
        [r, i]
}

function biDivide(n, t) {
    return biDivideModulo(n, t)[0]
}

function biModulo(n, t) {
    return biDivideModulo(n, t)[1]
}

function biMultiplyMod(n, t, i) {
    return biModulo(biMultiply(n, t), i)
}

function biPow(n, t) {
    for (var r = bigOne, i = n; ;) {
        if ((t & 1) != 0 && (r = biMultiply(r, i)),
            t >>= 1,
        t == 0)
            break;
        i = biMultiply(i, i)
    }
    return r
}

function biPowMod(n, t, i) {
    for (var f = bigOne, u = n, r = t; ;) {
        if ((r.digits[0] & 1) != 0 && (f = biMultiplyMod(f, u, i)),
            r = biShiftRight(r, 1),
        r.digits[0] == 0 && biHighIndex(r) == 0)
            break;
        u = biMultiplyMod(u, u, i)
    }
    return f
}

function BarrettMu(n) {
    this.modulus = biCopy(n);
    this.k = biHighIndex(this.modulus) + 1;
    var t = new BigInt;
    t.digits[2 * this.k] = 1;
    this.mu = biDivide(t, this.modulus);
    this.bkplus1 = new BigInt;
    this.bkplus1.digits[this.k + 1] = 1;
    this.modulo = BarrettMu_modulo;
    this.multiplyMod = BarrettMu_multiplyMod;
    this.powMod = BarrettMu_powMod
}

function BarrettMu_modulo(n) {
    var r = biDivideByRadixPower(n, this.k - 1), u = biMultiply(r, this.mu), f = biDivideByRadixPower(u, this.k + 1),
        e = biModuloByRadixPower(n, this.k + 1), o = biMultiply(f, this.modulus),
        s = biModuloByRadixPower(o, this.k + 1), t = biSubtract(e, s), i;
    for (t.isNeg && (t = biAdd(t, this.bkplus1)),
             i = biCompare(t, this.modulus) >= 0; i;)
        t = biSubtract(t, this.modulus),
            i = biCompare(t, this.modulus) >= 0;
    return t
}

function BarrettMu_multiplyMod(n, t) {
    var i = biMultiply(n, t);
    return this.modulo(i)
}

function BarrettMu_powMod(n, t) {
    var u = new BigInt, r, i;
    for (u.digits[0] = 1,
             r = n,
             i = t; ;) {
        if ((i.digits[0] & 1) != 0 && (u = this.multiplyMod(u, r)),
            i = biShiftRight(i, 1),
        i.digits[0] == 0 && biHighIndex(i) == 0)
            break;
        r = this.multiplyMod(r, r)
    }
    return u
}

function RSAKeyPair(n, t, i, r) {
    this.e = biFromHex(n);
    this.d = biFromHex(t);
    this.m = biFromHex(i);
    this.chunkSize = typeof r != "number" ? 2 * biHighIndex(this.m) : r / 8;
    this.radix = 16;
    this.barrett = new BarrettMu(this.m)
}

function encryptedString(n, t, i, r) {
    var f = [], o = t.length, u, e, h, s, v, c, y, p = "", l, a, w;
    for (s = typeof i == "string" ? i == RSAAPP.NoPadding ? 1 : i == RSAAPP.PKCS1Padding ? 2 : 0 : 0,
             v = typeof r == "string" && r == RSAAPP.RawEncoding ? 1 : 0,
             s == 1 ? o > n.chunkSize && (o = n.chunkSize) : s == 2 && o > n.chunkSize - 11 && (o = n.chunkSize - 11),
             u = 0,
             e = s == 2 ? o - 1 : n.chunkSize - 1; u < o;)
        s ? f[e] = t.charCodeAt(u) : f[u] = t.charCodeAt(u),
            u++,
            e--;
    for (s == 1 && (u = 0),
             e = n.chunkSize - o % n.chunkSize; e > 0;) {
        if (s == 2) {
            for (c = Math.floor(Math.random() * 256); !c;)
                c = Math.floor(Math.random() * 256);
            f[u] = c
        } else
            f[u] = 0;
        u++;
        e--
    }
    for (s == 2 && (f[o] = 0,
        f[n.chunkSize - 2] = 2,
        f[n.chunkSize - 1] = 0),
             y = f.length,
             u = 0; u < y; u += n.chunkSize) {
        for (l = new BigInt,
                 e = 0,
                 h = u; h < u + n.chunkSize; ++e)
            l.digits[e] = f[h++],
                l.digits[e] += f[h++] << 8;
        a = n.barrett.powMod(l, n.e);
        w = v == 1 ? biToBytes(a) : n.radix == 16 ? biToHex(a) : biToString(a, n.radix);
        p += w
    }
    return p
}

function decryptedString(n, t) {
    for (var e = t.split(" "), f, u, o, i = "", r = 0; r < e.length; ++r)
        for (o = n.radix == 16 ? biFromHex(e[r]) : biFromString(e[r], n.radix),
                 f = n.barrett.powMod(o, n.d),
                 u = 0; u <= biHighIndex(f); ++u)
            i += String.fromCharCode(f.digits[u] & 255, f.digits[u] >> 8);
    return i.charCodeAt(i.length - 1) == 0 && (i = i.substring(0, i.length - 1)),
        i
}

var lookup = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", dpl10, lr10, hexatrigesimalToChar,
    hexToChar, highBitMasks, lowBitMasks, RSAAPP;

(function (n) {
        "use strict";

        function t(n) {
            var t = n.charCodeAt(0);
            return t === e || t === s ? 62 : t === o || t === h ? 63 : t < i ? -1 : t < i + 10 ? t - i + 26 + 26 : t < u + 26 ? t - u : t < r + 26 ? t - r + 26 : void 0
        }

        function c(n, t) {
            for (var f = [], r, u, i = 0, e = n.length; i < e; i++)
                typeof n != "string" || !n.charAt(i) ? typeof n != "string" && i in n && (r = n[i],
                    u = t(r, i, n),
                    f[i] = u) : (r = n.charAt(i),
                    u = t(r, i, n),
                    f[i] = u);
            return f
        }

        function l(n) {
            function u(n) {
                o[l++] = n
            }

            var i, h, c, r, e, o, s, l;
            if (n.length % 4 > 0)
                throw new Error("Invalid string. Length must be a multiple of 4");
            for (s = n.length,
                     e = n.charAt(s - 2) === "=" ? 2 : n.charAt(s - 1) === "=" ? 1 : 0,
                     o = new f(n.length * 3 / 4 - e),
                     c = e > 0 ? n.length - 4 : n.length,
                     l = 0,
                     i = 0,
                     h = 0; i < c; i += 4,
                     h += 3)
                r = t(n.charAt(i)) << 18 | t(n.charAt(i + 1)) << 12 | t(n.charAt(i + 2)) << 6 | t(n.charAt(i + 3)),
                    u((r & 16711680) >> 16),
                    u((r & 65280) >> 8),
                    u(r & 255);
            return e === 2 ? (r = t(n.charAt(i)) << 2 | t(n.charAt(i + 1)) >> 4,
                u(r & 255)) : e === 1 && (r = t(n.charAt(i)) << 10 | t(n.charAt(i + 1)) << 4 | t(n.charAt(i + 2)) >> 2,
                u(r >> 8 & 255),
                u(r & 255)),
                o
        }

        function a(n) {
            function r(n) {
                return lookup.charAt(n)
            }

            function o(n) {
                return r(n >> 18 & 63) + r(n >> 12 & 63) + r(n >> 6 & 63) + r(n & 63)
            }

            Object.prototype.toString.call(n) != "[object Array]" && (n = c(n, function (n) {
                return n.charCodeAt(0)
            }));
            for (var f = n.length % 3, t = "", i, u = 0, e = n.length - f; u < e; u += 3)
                i = (n[u] << 16) + (n[u + 1] << 8) + n[u + 2],
                    t += o(i);
            switch (f) {
                case 1:
                    i = n[n.length - 1];
                    t += r(i >> 2);
                    t += r(i << 4 & 63);
                    t += "==";
                    break;
                case 2:
                    i = (n[n.length - 2] << 8) + n[n.length - 1];
                    t += r(i >> 10);
                    t += r(i >> 4 & 63);
                    t += r(i << 2 & 63);
                    t += "="
            }
            return t
        }

        var f = typeof Uint8Array != "undefined" ? Uint8Array : Array
            , e = "+".charCodeAt(0)
            , o = "/".charCodeAt(0)
            , i = "0".charCodeAt(0)
            , r = "a".charCodeAt(0)
            , u = "A".charCodeAt(0)
            , s = "-".charCodeAt(0)
            , h = "_".charCodeAt(0);
        n.toByteArray = l;
        n.fromByteArray = a
    }
)(typeof exports == "undefined" ? this.base64js = {} : exports);

var biRadixBase = 2, biRadixBits = 16, bitsPerDigit = biRadixBits, biRadix = 65536, biHalfRadix = biRadix >>> 1,
    biRadixSquared = biRadix * biRadix, maxDigitVal = biRadix - 1, maxInteger = 9999999999999998, maxDigits, ZERO_ARRAY,
    bigZero, bigOne;
setMaxDigits(20);
dpl10 = 15;
lr10 = biFromNumber(1e15);
hexatrigesimalToChar = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
hexToChar = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
highBitMasks = [0, 32768, 49152, 57344, 61440, 63488, 64512, 65024, 65280, 65408, 65472, 65504, 65520, 65528, 65532, 65534, 65535];
lowBitMasks = [0, 1, 3, 7, 15, 31, 63, 127, 255, 511, 1023, 2047, 4095, 8191, 16383, 32767, 65535];
RSAAPP = {};
RSAAPP.NoPadding = "NoPadding";
RSAAPP.PKCS1Padding = "PKCS1Padding";
RSAAPP.RawEncoding = "RawEncoding";
RSAAPP.NumericEncoding = "NumericEncoding"


function getEncryptedCiphertext(rsaPublicKey, password) {
    setMaxDigits(262);
    var key = new RSAKeyPair(rsaPublicKey.exponent, "", rsaPublicKey.modulus, parseInt(rsaPublicKey.dwKeySize));
    var ciphertext = encryptedString(key, password, RSAAPP.PKCS1Padding, RSAAPP.RawEncoding);
    // var encryptedPassword = base64js.fromByteArray(ciphertext);
    // encryptedPassword = encodeURIComponent(encryptedPassword);
    return ciphertext
}

// 测试样例
// rsaPublicKey = {
//     "dwKeySize": 2048,
//     "exponent": "010001",
//     "modulus": "A58A59B6FAF3A111C1B5055F39C425542B21E2817D1E4B5F16B14B649F6C9850A495E506B646E335905851A9A3A9748F7023E495EC3B863025158D354B933AFCFD44C189B038638976083C79BE80379B6BB920682C6CAC3DD449AD888C44514EE01BD00FE8B121741215BDD5A9EFA1CBA4CFB316FD38E6BA27BA7FB9C892211F338AADB3DE943C07850A4B1EAA55EBD386E842E61F714BAB3BEEC54692F6B637B03EF2CCC4120EE9F5827A80F88603ED74E48F262EBD1573F1E1A771A70BFED965467EEF3B37A4F6DFDE29ECDAF95F521EB11E4B3D08B73E846F43434AAE177C7167BEBF6F5D0CAF852EE9944E0D1FC5CC06EB53D16DA90636F0D1FE3411696B"
// }
// password = '23123213'
//
// console.log(getEncryptedCiphertext(rsaPublicKey, password))
