navigator = {};
window = global;

var JSEncryptExports = {};
(function (a6) {
    var dQ;
    var dg = 244837814094590;
    var dE = ((dg & 16777215) == 15715070);

    function a8(c, b, a) {
        if (c != null) {
            if ("number" == typeof c) {
                this.fromNumber(c, b, a)
            } else {
                if (b == null && "string" != typeof c) {
                    this.fromString(c, 256)
                } else {
                    this.fromString(c, b)
                }
            }
        }
    }

    function dG() {
        return new a8(null)
    }

    function dh(b, d, f, c, g, e) {
        while (--e >= 0) {
            var a = d * this[b++] + f[c] + g;
            g = Math.floor(a / 67108864);
            f[c++] = a & 67108863
        }
        return g
    }

    function cX(d, h, g, e, k, f) {
        var b = h & 32767,
            j = h >> 15;
        while (--f >= 0) {
            var c = this[d] & 32767;
            var i = this[d++] >> 15;
            var a = j * c + i * b;
            c = b * c + ((a & 32767) << 15) + g[e] + (k & 1073741823);
            k = (c >>> 30) + (a >>> 15) + j * i + (k >>> 30);
            g[e++] = c & 1073741823
        }
        return k
    }

    function d6(d, h, g, e, k, f) {
        var b = h & 16383,
            j = h >> 14;
        while (--f >= 0) {
            var c = this[d] & 16383;
            var i = this[d++] >> 14;
            var a = j * c + i * b;
            c = b * c + ((a & 16383) << 14) + g[e] + k;
            k = (c >> 28) + (a >> 14) + j * i;
            g[e++] = c & 268435455
        }
        return k
    }

    if (dE && (navigator.appName == "Microsoft Internet Explorer")) {
        a8.prototype.am = cX;
        dQ = 30
    } else {
        if (dE && (navigator.appName != "Netscape")) {
            a8.prototype.am = dh;
            dQ = 26
        } else {
            a8.prototype.am = d6;
            dQ = 28
        }
    }
    a8.prototype.DB = dQ;
    a8.prototype.DM = ((1 << dQ) - 1);
    a8.prototype.DV = (1 << dQ);
    var cL = 52;
    a8.prototype.FV = Math.pow(2, cL);
    a8.prototype.F1 = cL - dQ;
    a8.prototype.F2 = 2 * dQ - cL;
    var dk = "0123456789abcdefghijklmnopqrstuvwxyz";
    var b1 = new Array();
    var dt, dw;
    dt = "0".charCodeAt(0);
    for (dw = 0; dw <= 9; ++dw) {
        b1[dt++] = dw
    }
    dt = "a".charCodeAt(0);
    for (dw = 10; dw < 36; ++dw) {
        b1[dt++] = dw
    }
    dt = "A".charCodeAt(0);
    for (dw = 10; dw < 36; ++dw) {
        b1[dt++] = dw
    }

    function dp(a) {
        return dk.charAt(a)
    }

    function cy(c, b) {
        var a = b1[c.charCodeAt(b)];
        return (a == null) ? -1 : a
    }

    function dX(b) {
        for (var a = this.t - 1; a >= 0; --a) {
            b[a] = this[a]
        }
        b.t = this.t;
        b.s = this.s
    }

    function d8(a) {
        this.t = 1;
        this.s = (a < 0) ? -1 : 0;
        if (a > 0) {
            this[0] = a
        } else {
            if (a < -1) {
                this[0] = a + DV
            } else {
                this.t = 0
            }
        }
    }

    function bX(a) {
        var b = dG();
        b.fromInt(a);
        return b
    }

    function cR(f, g) {
        var c;
        if (g == 16) {
            c = 4
        } else {
            if (g == 8) {
                c = 3
            } else {
                if (g == 256) {
                    c = 8
                } else {
                    if (g == 2) {
                        c = 1
                    } else {
                        if (g == 32) {
                            c = 5
                        } else {
                            if (g == 4) {
                                c = 2
                            } else {
                                this.fromRadix(f, g);
                                return
                            }
                        }
                    }
                }
            }
        }
        this.t = 0;
        this.s = 0;
        var b = f.length,
            d = false,
            e = 0;
        while (--b >= 0) {
            var a = (c == 8) ? f[b] & 255 : cy(f, b);
            if (a < 0) {
                if (f.charAt(b) == "-") {
                    d = true
                }
                continue
            }
            d = false;
            if (e == 0) {
                this[this.t++] = a
            } else {
                if (e + c > this.DB) {
                    this[this.t - 1] |= (a & ((1 << (this.DB - e)) - 1)) << e;
                    this[this.t++] = (a >> (this.DB - e))
                } else {
                    this[this.t - 1] |= a << e
                }
            }
            e += c;
            if (e >= this.DB) {
                e -= this.DB
            }
        }
        if (c == 8 && (f[0] & 128) != 0) {
            this.s = -1;
            if (e > 0) {
                this[this.t - 1] |= ((1 << (this.DB - e)) - 1) << e
            }
        }
        this.clamp();
        if (d) {
            a8.ZERO.subTo(this, this)
        }
    }

    function cA() {
        var a = this.s & this.DM;
        while (this.t > 0 && this[this.t - 1] == a) {
            --this.t
        }
    }

    function cr(g) {
        if (this.s < 0) {
            return "-" + this.negate().toString(g)
        }
        var b;
        if (g == 16) {
            b = 4
        } else {
            if (g == 8) {
                b = 3
            } else {
                if (g == 2) {
                    b = 1
                } else {
                    if (g == 32) {
                        b = 5
                    } else {
                        if (g == 4) {
                            b = 2
                        } else {
                            return this.toRadix(g)
                        }
                    }
                }
            }
        }
        var d = (1 << b) - 1,
            e,
            h = false,
            c = "",
            a = this.t;
        var f = this.DB - (a * this.DB) % b;
        if (a-- > 0) {
            if (f < this.DB && (e = this[a] >> f) > 0) {
                h = true;
                c = dp(e)
            }
            while (a >= 0) {
                if (f < b) {
                    e = (this[a] & ((1 << f) - 1)) << (b - f);
                    e |= this[--a] >> (f += this.DB - b)
                } else {
                    e = (this[a] >> (f -= b)) & d;
                    if (f <= 0) {
                        f += this.DB;
                        --a
                    }
                }
                if (e > 0) {
                    h = true
                }
                if (h) {
                    c += dp(e)
                }
            }
        }
        return h ? c : "0"
    }

    function eb() {
        var a = dG();
        a8.ZERO.subTo(this, a);
        return a
    }

    function c6() {
        return (this.s < 0) ? this.negate() : this
    }

    function dC(b) {
        var a = this.s - b.s;
        if (a != 0) {
            return a
        }
        var c = this.t;
        a = c - b.t;
        if (a != 0) {
            return (this.s < 0) ? -a : a
        }
        while (--c >= 0) {
            if ((a = this[c] - b[c]) != 0) {
                return a
            }
        }
        return 0
    }

    function c5(c) {
        var b = 1,
            a;
        if ((a = c >>> 16) != 0) {
            c = a;
            b += 16
        }
        if ((a = c >> 8) != 0) {
            c = a;
            b += 8
        }
        if ((a = c >> 4) != 0) {
            c = a;
            b += 4
        }
        if ((a = c >> 2) != 0) {
            c = a;
            b += 2
        }
        if ((a = c >> 1) != 0) {
            c = a;
            b += 1
        }
        return b
    }

    function dd() {
        if (this.t <= 0) {
            return 0
        }
        return this.DB * (this.t - 1) + c5(this[this.t - 1] ^ (this.s & this.DM))
    }

    function b3(a, c) {
        var b;
        for (b = this.t - 1; b >= 0; --b) {
            c[b + a] = this[b]
        }
        for (b = a - 1; b >= 0; --b) {
            c[b] = 0
        }
        c.t = this.t + a;
        c.s = this.s
    }

    function dR(a, c) {
        for (var b = a; b < this.t; ++b) {
            c[b - a] = this[b]
        }
        c.t = Math.max(this.t - a, 0);
        c.s = this.s
    }

    function ck(e, c) {
        var g = e % this.DB;
        var d = this.DB - g;
        var h = (1 << d) - 1;
        var b = Math.floor(e / this.DB),
            f = (this.s << g) & this.DM,
            a;
        for (a = this.t - 1; a >= 0; --a) {
            c[a + b + 1] = (this[a] >> d) | f;
            f = (this[a] & h) << g
        }
        for (a = b - 1; a >= 0; --a) {
            c[a] = 0
        }
        c[b] = f;
        c.t = this.t + b + 1;
        c.s = this.s;
        c.clamp()
    }

    function ca(f, c) {
        c.s = this.s;
        var b = Math.floor(f / this.DB);
        if (b >= this.t) {
            c.t = 0;
            return
        }
        var g = f % this.DB;
        var d = this.DB - g;
        var e = (1 << g) - 1;
        c[0] = this[b] >> g;
        for (var a = b + 1; a < this.t; ++a) {
            c[a - b - 1] |= (this[a] & e) << d;
            c[a - b] = this[a] >> g
        }
        if (g > 0) {
            c[this.t - b - 1] |= (this.s & e) << d
        }
        c.t = this.t - b;
        c.clamp()
    }

    function dv(c, b) {
        var d = 0,
            e = 0,
            a = Math.min(c.t, this.t);
        while (d < a) {
            e += this[d] - c[d];
            b[d++] = e & this.DM;
            e >>= this.DB
        }
        if (c.t < this.t) {
            e -= c.s;
            while (d < this.t) {
                e += this[d];
                b[d++] = e & this.DM;
                e >>= this.DB
            }
            e += this.s
        } else {
            e += this.s;
            while (d < c.t) {
                e -= c[d];
                b[d++] = e & this.DM;
                e >>= this.DB
            }
            e -= c.s
        }
        b.s = (e < 0) ? -1 : 0;
        if (e < -1) {
            b[d++] = this.DV + e
        } else {
            if (e > 0) {
                b[d++] = e
            }
        }
        b.t = d;
        b.clamp()
    }

    function d5(c, b) {
        var d = this.abs(),
            e = c.abs();
        var a = d.t;
        b.t = a + e.t;
        while (--a >= 0) {
            b[a] = 0
        }
        for (a = 0; a < e.t; ++a) {
            b[a + d.t] = d.am(0, e[a], b, a, 0, d.t)
        }
        b.s = 0;
        b.clamp();
        if (this.s != c.s) {
            a8.ZERO.subTo(b, b)
        }
    }

    function c7(a) {
        var c = this.abs();
        var d = a.t = 2 * c.t;
        while (--d >= 0) {
            a[d] = 0
        }
        for (d = 0; d < c.t - 1; ++d) {
            var b = c.am(d, c[d], a, 2 * d, 0, 1);
            if ((a[d + c.t] += c.am(d + 1, 2 * c[d], a, 2 * d + 1, b, c.t - d - 1)) >= c.DV) {
                a[d + c.t] -= c.DV;
                a[d + c.t + 1] = 1
            }
        }
        if (a.t > 0) {
            a[a.t - 1] += c.am(d, c[d], a, 2 * d, 0, 1)
        }
        a.s = 0;
        a.clamp()
    }

    function cc(n, k, l) {
        var d = n.abs();
        if (d.t <= 0) {
            return
        }
        var j = this.abs();
        if (j.t < d.t) {
            if (k != null) {
                k.fromInt(0)
            }
            if (l != null) {
                this.copyTo(l)
            }
            return
        }
        if (l == null) {
            l = dG()
        }
        var m = dG(),
            q = this.s,
            r = n.s;
        var e = this.DB - c5(d[d.t - 1]);
        if (e > 0) {
            d.lShiftTo(e, m);
            j.lShiftTo(e, l)
        } else {
            d.copyTo(m);
            j.copyTo(l)
        }
        var h = m.t;
        var o = m[h - 1];
        if (o == 0) {
            return
        }
        var i = o * (1 << this.F1) + ((h > 1) ? m[h - 2] >> this.F2 : 0);
        var a = this.FV / i,
            b = (1 << this.F1) / i,
            c = 1 << this.F2;
        var f = l.t,
            g = f - h,
            p = (k == null) ? dG() : k;
        m.dlShiftTo(g, p);
        if (l.compareTo(p) >= 0) {
            l[l.t++] = 1;
            l.subTo(p, l)
        }
        a8.ONE.dlShiftTo(h, p);
        p.subTo(m, m);
        while (m.t < h) {
            m[m.t++] = 0
        }
        while (--g >= 0) {
            var s = (l[--f] == o) ? this.DM : Math.floor(l[f] * a + (l[f - 1] + c) * b);
            if ((l[f] += m.am(0, s, l, g, 0, h)) < s) {
                m.dlShiftTo(g, p);
                l.subTo(p, l);
                while (l[f] < --s) {
                    l.subTo(p, l)
                }
            }
        }
        if (k != null) {
            l.drShiftTo(h, k);
            if (q != r) {
                a8.ZERO.subTo(k, k)
            }
        }
        l.t = h;
        l.clamp();
        if (e > 0) {
            l.rShiftTo(e, l)
        }
        if (q < 0) {
            a8.ZERO.subTo(l, l)
        }
    }

    function du(a) {
        var b = dG();
        this.abs().divRemTo(a, null, b);
        if (this.s < 0 && b.compareTo(a8.ZERO) > 0) {
            a.subTo(b, b)
        }
        return b
    }

    function ds(a) {
        this.m = a
    }

    function b2(a) {
        if (a.s < 0 || a.compareTo(this.m) >= 0) {
            return a.mod(this.m)
        } else {
            return a
        }
    }

    function cK(a) {
        return a
    }

    function d4(a) {
        a.divRemTo(this.m, null, a)
    }

    function df(b, a, c) {
        b.multiplyTo(a, c);
        this.reduce(c)
    }

    function b6(a, b) {
        a.squareTo(b);
        this.reduce(b)
    }

    ds.prototype.convert = b2;
    ds.prototype.revert = cK;
    ds.prototype.reduce = d4;
    ds.prototype.mulTo = df;
    ds.prototype.sqrTo = b6;

    function c0() {
        if (this.t < 1) {
            return 0
        }
        var a = this[0];
        if ((a & 1) == 0) {
            return 0
        }
        var b = a & 3;
        b = (b * (2 - (a & 15) * b)) & 15;
        b = (b * (2 - (a & 255) * b)) & 255;
        b = (b * (2 - (((a & 65535) * b) & 65535))) & 65535;
        b = (b * (2 - a * b % this.DV)) % this.DV;
        return (b > 0) ? this.DV - b : -b
    }

    function dV(a) {
        this.m = a;
        this.mp = a.invDigit();
        this.mpl = this.mp & 32767;
        this.mph = this.mp >> 15;
        this.um = (1 << (a.DB - 15)) - 1;
        this.mt2 = 2 * a.t
    }

    function dO(a) {
        var b = dG();
        a.abs().dlShiftTo(this.m.t, b);
        b.divRemTo(this.m, null, b);
        if (a.s < 0 && b.compareTo(a8.ZERO) > 0) {
            this.m.subTo(b, b)
        }
        return b
    }

    function z(a) {
        var b = dG();
        a.copyTo(b);
        this.reduce(b);
        return b
    }

    function ct(c) {
        while (c.t <= this.mt2) {
            c[c.t++] = 0
        }
        for (var a = 0; a < this.m.t; ++a) {
            var d = c[a] & 32767;
            var b = (d * this.mpl + (((d * this.mph + (c[a] >> 15) * this.mpl) & this.um) << 15)) & c.DM;
            d = a + this.m.t;
            c[d] += this.m.am(0, b, c, a, 0, this.m.t);
            while (c[d] >= c.DV) {
                c[d] -= c.DV;
                c[++d]++
            }
        }
        c.clamp();
        c.drShiftTo(this.m.t, c);
        if (c.compareTo(this.m) >= 0) {
            c.subTo(this.m, c)
        }
    }

    function cE(a, b) {
        a.squareTo(b);
        this.reduce(b)
    }

    function d0(b, a, c) {
        b.multiplyTo(a, c);
        this.reduce(c)
    }

    dV.prototype.convert = dO;
    dV.prototype.revert = z;
    dV.prototype.reduce = ct;
    dV.prototype.mulTo = d0;
    dV.prototype.sqrTo = cE;

    function c2() {
        return ((this.t > 0) ? (this[0] & 1) : this.s) == 0
    }

    function dy(g, d) {
        if (g > 4294967295 || g < 1) {
            return a8.ONE
        }
        var f = dG(),
            b = dG(),
            e = d.convert(this),
            c = c5(g) - 1;
        e.copyTo(f);
        while (--c >= 0) {
            d.sqrTo(f, b);
            if ((g & (1 << c)) > 0) {
                d.mulTo(b, e, f)
            } else {
                var a = f;
                f = b;
                b = a
            }
        }
        return d.revert(f)
    }

    function d2(a, c) {
        var b;
        if (a < 256 || c.isEven()) {
            b = new ds(c)
        } else {
            b = new dV(c)
        }
        return this.exp(a, b)
    }

    a8.prototype.copyTo = dX;
    a8.prototype.fromInt = d8;
    a8.prototype.fromString = cR;
    a8.prototype.clamp = cA;
    a8.prototype.dlShiftTo = b3;
    a8.prototype.drShiftTo = dR;
    a8.prototype.lShiftTo = ck;
    a8.prototype.rShiftTo = ca;
    a8.prototype.subTo = dv;
    a8.prototype.multiplyTo = d5;
    a8.prototype.squareTo = c7;
    a8.prototype.divRemTo = cc;
    a8.prototype.invDigit = c0;
    a8.prototype.isEven = c2;
    a8.prototype.exp = dy;
    a8.prototype.toString = cr;
    a8.prototype.negate = eb;
    a8.prototype.abs = c6;
    a8.prototype.compareTo = dC;
    a8.prototype.bitLength = dd;
    a8.prototype.mod = du;
    a8.prototype.modPowInt = d2;
    a8.ZERO = bX(0);
    a8.ONE = bX(1);

    function b0() {
        var a = dG();
        this.copyTo(a);
        return a
    }

    function dj() {
        if (this.s < 0) {
            if (this.t == 1) {
                return this[0] - this.DV
            } else {
                if (this.t == 0) {
                    return -1
                }
            }
        } else {
            if (this.t == 1) {
                return this[0]
            } else {
                if (this.t == 0) {
                    return 0
                }
            }
        }
        return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0]
    }

    function dZ() {
        return (this.t == 0) ? this.s : (this[0] << 24) >> 24
    }

    function ec() {
        return (this.t == 0) ? this.s : (this[0] << 16) >> 16
    }

    function dn(a) {
        return Math.floor(Math.LN2 * this.DB / Math.log(a))
    }

    function cw() {
        if (this.s < 0) {
            return -1
        } else {
            if (this.t <= 0 || (this.t == 1 && this[0] <= 0)) {
                return 0
            } else {
                return 1
            }
        }
    }

    function dA(d) {
        if (d == null) {
            d = 10
        }
        if (this.signum() == 0 || d < 2 || d > 36) {
            return "0"
        }
        var c = this.chunkSize(d);
        var b = Math.pow(d, c);
        var f = bX(b),
            g = dG(),
            e = dG(),
            a = "";
        this.divRemTo(f, g, e);
        while (g.signum() > 0) {
            a = (b + e.intValue()).toString(d).substr(1) + a;
            g.divRemTo(f, g, e)
        }
        return e.intValue().toString(d) + a
    }

    function cH(a, d) {
        this.fromInt(0);
        if (d == null) {
            d = 10
        }
        var f = this.chunkSize(d);
        var e = Math.pow(d, f),
            h = false,
            i = 0,
            b = 0;
        for (var g = 0; g < a.length; ++g) {
            var c = cy(a, g);
            if (c < 0) {
                if (a.charAt(g) == "-" && this.signum() == 0) {
                    h = true
                }
                continue
            }
            b = d * b + c;
            if (++i >= f) {
                this.dMultiply(e);
                this.dAddOffset(b, 0);
                i = 0;
                b = 0
            }
        }
        if (i > 0) {
            this.dMultiply(Math.pow(d, i));
            this.dAddOffset(b, 0)
        }
        if (h) {
            a8.ZERO.subTo(this, this)
        }
    }

    function cJ(c, b, d) {
        if ("number" == typeof b) {
            if (c < 2) {
                this.fromInt(1)
            } else {
                this.fromNumber(c, d);
                if (!this.testBit(c - 1)) {
                    this.bitwiseTo(a8.ONE.shiftLeft(c - 1), c4, this)
                }
                if (this.isEven()) {
                    this.dAddOffset(1, 0)
                }
                while (!this.isProbablePrime(b)) {
                    this.dAddOffset(2, 0);
                    if (this.bitLength() > c) {
                        this.subTo(a8.ONE.shiftLeft(c - 1), this)
                    }
                }
            }
        } else {
            var e = new Array(),
                a = c & 7;
            e.length = (c >> 3) + 1;
            b.nextBytes(e);
            if (a > 0) {
                e[0] &= ((1 << a) - 1)
            } else {
                e[0] = 0
            }
            this.fromString(e, 256)
        }
    }

    function cB() {
        var c = this.t,
            b = new Array();
        b[0] = this.s;
        var d = this.DB - (c * this.DB) % 8,
            e,
            a = 0;
        if (c-- > 0) {
            if (d < this.DB && (e = this[c] >> d) != (this.s & this.DM) >> d) {
                b[a++] = e | (this.s << (this.DB - d))
            }
            while (c >= 0) {
                if (d < 8) {
                    e = (this[c] & ((1 << d) - 1)) << (8 - d);
                    e |= this[--c] >> (d += this.DB - 8)
                } else {
                    e = (this[c] >> (d -= 8)) & 255;
                    if (d <= 0) {
                        d += this.DB;
                        --c
                    }
                }
                if ((e & 128) != 0) {
                    e |= -256
                }
                if (a == 0 && (this.s & 128) != (e & 128)) {
                    ++a
                }
                if (a > 0 || e != this.s) {
                    b[a++] = e
                }
            }
        }
        return b
    }

    function dY(a) {
        return (this.compareTo(a) == 0)
    }

    function cO(a) {
        return (this.compareTo(a) < 0) ? this : a
    }

    function cQ(a) {
        return (this.compareTo(a) > 0) ? this : a
    }

    function cn(d, f, b) {
        var a, c, e = Math.min(d.t, this.t);
        for (a = 0; a < e; ++a) {
            b[a] = f(this[a], d[a])
        }
        if (d.t < this.t) {
            c = d.s & this.DM;
            for (a = e; a < this.t; ++a) {
                b[a] = f(this[a], c)
            }
            b.t = this.t
        } else {
            c = this.s & this.DM;
            for (a = e; a < d.t; ++a) {
                b[a] = f(c, d[a])
            }
            b.t = d.t
        }
        b.s = f(this.s, d.s);
        b.clamp()
    }

    function dI(a, b) {
        return a & b
    }

    function ce(a) {
        var b = dG();
        this.bitwiseTo(a, dI, b);
        return b
    }

    function c4(a, b) {
        return a | b
    }

    function cY(a) {
        var b = dG();
        this.bitwiseTo(a, c4, b);
        return b
    }

    function cZ(a, b) {
        return a ^ b
    }

    function dl(a) {
        var b = dG();
        this.bitwiseTo(a, cZ, b);
        return b
    }

    function cg(a, b) {
        return a & ~b
    }

    function dM(a) {
        var b = dG();
        this.bitwiseTo(a, cg, b);
        return b
    }

    function ee() {
        var b = dG();
        for (var a = 0; a < this.t; ++a) {
            b[a] = this.DM & ~this[a]
        }
        b.t = this.t;
        b.s = ~this.s;
        return b
    }

    function b9(b) {
        var a = dG();
        if (b < 0) {
            this.rShiftTo(-b, a)
        } else {
            this.lShiftTo(b, a)
        }
        return a
    }

    function bY(b) {
        var a = dG();
        if (b < 0) {
            this.lShiftTo(-b, a)
        } else {
            this.rShiftTo(b, a)
        }
        return a
    }

    function cf(a) {
        if (a == 0) {
            return -1
        }
        var b = 0;
        if ((a & 65535) == 0) {
            a >>= 16;
            b += 16
        }
        if ((a & 255) == 0) {
            a >>= 8;
            b += 8
        }
        if ((a & 15) == 0) {
            a >>= 4;
            b += 4
        }
        if ((a & 3) == 0) {
            a >>= 2;
            b += 2
        }
        if ((a & 1) == 0) {
            ++b
        }
        return b
    }

    function cj() {
        for (var a = 0; a < this.t; ++a) {
            if (this[a] != 0) {
                return a * this.DB + cf(this[a])
            }
        }
        if (this.s < 0) {
            return this.t * this.DB
        }
        return -1
    }

    function dT(a) {
        var b = 0;
        while (a != 0) {
            a &= a - 1;
            ++b
        }
        return b
    }

    function t() {
        var a = 0,
            b = this.s & this.DM;
        for (var c = 0; c < this.t; ++c) {
            a += dT(this[c] ^ b)
        }
        return a
    }

    function bV(b) {
        var a = Math.floor(b / this.DB);
        if (a >= this.t) {
            return (this.s != 0)
        }
        return ((this[a] & (1 << (b % this.DB))) != 0)
    }

    function eh(a, c) {
        var b = a8.ONE.shiftLeft(a);
        this.bitwiseTo(b, c, b);
        return b
    }

    function b7(a) {
        return this.changeBit(a, c4)
    }

    function dz(a) {
        return this.changeBit(a, cg)
    }

    function dP(a) {
        return this.changeBit(a, cZ)
    }

    function db(c, b) {
        var d = 0,
            e = 0,
            a = Math.min(c.t, this.t);
        while (d < a) {
            e += this[d] + c[d];
            b[d++] = e & this.DM;
            e >>= this.DB
        }
        if (c.t < this.t) {
            e += c.s;
            while (d < this.t) {
                e += this[d];
                b[d++] = e & this.DM;
                e >>= this.DB
            }
            e += this.s
        } else {
            e += this.s;
            while (d < c.t) {
                e += c[d];
                b[d++] = e & this.DM;
                e >>= this.DB
            }
            e += c.s
        }
        b.s = (e < 0) ? -1 : 0;
        if (e > 0) {
            b[d++] = e
        } else {
            if (e < -1) {
                b[d++] = this.DV + e
            }
        }
        b.t = d;
        b.clamp()
    }

    function cT(a) {
        var b = dG();
        this.addTo(a, b);
        return b
    }

    function cU(a) {
        var b = dG();
        this.subTo(a, b);
        return b
    }

    function cq(a) {
        var b = dG();
        this.multiplyTo(a, b);
        return b
    }

    function c1() {
        var a = dG();
        this.squareTo(a);
        return a
    }

    function cD(a) {
        var b = dG();
        this.divRemTo(a, b, null);
        return b
    }

    function dm(a) {
        var b = dG();
        this.divRemTo(a, null, b);
        return b
    }

    function dD(b) {
        var a = dG(),
            c = dG();
        this.divRemTo(b, a, c);
        return new Array(a, c)
    }

    function cP(a) {
        this[this.t] = this.am(0, a - 1, this, 0, 0, this.t);
        ++this.t;
        this.clamp()
    }

    function dK(b, a) {
        if (b == 0) {
            return
        }
        while (this.t <= a) {
            this[this.t++] = 0
        }
        this[a] += b;
        while (this[a] >= this.DV) {
            this[a] -= this.DV;
            if (++a >= this.t) {
                this[this.t++] = 0
            }
            ++this[a]
        }
    }

    function cN() {
    }

    function dL(a) {
        return a
    }

    function bU(b, a, c) {
        b.multiplyTo(a, c)
    }

    function dq(a, b) {
        a.squareTo(b)
    }

    cN.prototype.convert = dL;
    cN.prototype.revert = dL;
    cN.prototype.mulTo = bU;
    cN.prototype.sqrTo = dq;

    function dN(a) {
        return this.exp(a, new cN())
    }

    function cV(d, b, c) {
        var a = Math.min(this.t + d.t, b);
        c.s = 0;
        c.t = a;
        while (a > 0) {
            c[--a] = 0
        }
        var e;
        for (e = c.t - this.t; a < e; ++a) {
            c[a + this.t] = this.am(0, d[a], c, a, 0, this.t)
        }
        for (e = Math.min(d.t, b); a < e; ++a) {
            this.am(0, d[a], c, a, 0, b - a)
        }
        c.clamp()
    }

    function d1(c, b, a) {
        --b;
        var d = a.t = this.t + c.t - b;
        a.s = 0;
        while (--d >= 0) {
            a[d] = 0
        }
        for (d = Math.max(b - this.t, 0); d < c.t; ++d) {
            a[this.t + d - b] = this.am(b - d, c[d], a, 0, 0, this.t + d - b)
        }
        a.clamp();
        a.drShiftTo(1, a)
    }

    function dH(a) {
        this.r2 = dG();
        this.q3 = dG();
        a8.ONE.dlShiftTo(2 * a.t, this.r2);
        this.mu = this.r2.divide(a);
        this.m = a
    }

    function dr(a) {
        if (a.s < 0 || a.t > 2 * this.m.t) {
            return a.mod(this.m)
        } else {
            if (a.compareTo(this.m) < 0) {
                return a
            } else {
                var b = dG();
                a.copyTo(b);
                this.reduce(b);
                return b
            }
        }
    }

    function a7(a) {
        return a
    }

    function dU(a) {
        a.drShiftTo(this.m.t - 1, this.r2);
        if (a.t > this.m.t + 1) {
            a.t = this.m.t + 1;
            a.clamp()
        }
        this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
        this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
        while (a.compareTo(this.r2) < 0) {
            a.dAddOffset(1, this.m.t + 1)
        }
        a.subTo(this.r2, a);
        while (a.compareTo(this.m) >= 0) {
            a.subTo(this.m, a)
        }
    }

    function de(a, b) {
        a.squareTo(b);
        this.reduce(b)
    }

    function dB(b, a, c) {
        b.multiplyTo(a, c);
        this.reduce(c)
    }

    dH.prototype.convert = dr;
    dH.prototype.revert = a7;
    dH.prototype.reduce = dU;
    dH.prototype.mulTo = dB;
    dH.prototype.sqrTo = de;

    function cW(e, d) {
        var c = e.bitLength(),
            n,
            l = bX(1),
            k;
        if (c <= 0) {
            return l
        } else {
            if (c < 18) {
                n = 1
            } else {
                if (c < 48) {
                    n = 3
                } else {
                    if (c < 144) {
                        n = 4
                    } else {
                        if (c < 768) {
                            n = 5
                        } else {
                            n = 6
                        }
                    }
                }
            }
        }
        if (c < 8) {
            k = new ds(d)
        } else {
            if (d.isEven()) {
                k = new dH(d)
            } else {
                k = new dV(d)
            }
        }
        var a = new Array(),
            f = 3,
            m = n - 1,
            j = (1 << n) - 1;
        a[1] = k.convert(this);
        if (n > 1) {
            var b = dG();
            k.sqrTo(a[1], b);
            while (f <= j) {
                a[f] = dG();
                k.mulTo(b, a[f - 2], a[f]);
                f += 2
            }
        }
        var p = e.t - 1,
            h, g = true,
            i = dG(),
            o;
        c = c5(e[p]) - 1;
        while (p >= 0) {
            if (c >= m) {
                h = (e[p] >> (c - m)) & j
            } else {
                h = (e[p] & ((1 << (c + 1)) - 1)) << (m - c);
                if (p > 0) {
                    h |= e[p - 1] >> (this.DB + c - m)
                }
            }
            f = n;
            while ((h & 1) == 0) {
                h >>= 1;
                --f
            }
            if ((c -= f) < 0) {
                c += this.DB;
                --p
            }
            if (g) {
                a[h].copyTo(l);
                g = false
            } else {
                while (f > 1) {
                    k.sqrTo(l, i);
                    k.sqrTo(i, l);
                    f -= 2
                }
                if (f > 0) {
                    k.sqrTo(l, i)
                } else {
                    o = l;
                    l = i;
                    i = o
                }
                k.mulTo(i, a[h], l)
            }
            while (p >= 0 && (e[p] & (1 << c)) == 0) {
                k.sqrTo(l, i);
                o = l;
                l = i;
                i = o;
                if (--c < 0) {
                    c = this.DB - 1;
                    --p
                }
            }
        }
        return k.revert(l)
    }

    function ef(b) {
        var d = (this.s < 0) ? this.negate() : this.clone();
        var f = (b.s < 0) ? b.negate() : b.clone();
        if (d.compareTo(f) < 0) {
            var c = d;
            d = f;
            f = c
        }
        var a = d.getLowestSetBit(),
            e = f.getLowestSetBit();
        if (e < 0) {
            return d
        }
        if (a < e) {
            e = a
        }
        if (e > 0) {
            d.rShiftTo(e, d);
            f.rShiftTo(e, f)
        }
        while (d.signum() > 0) {
            if ((a = d.getLowestSetBit()) > 0) {
                d.rShiftTo(a, d)
            }
            if ((a = f.getLowestSetBit()) > 0) {
                f.rShiftTo(a, f)
            }
            if (d.compareTo(f) >= 0) {
                d.subTo(f, d);
                d.rShiftTo(1, d)
            } else {
                f.subTo(d, f);
                f.rShiftTo(1, f)
            }
        }
        if (e > 0) {
            f.lShiftTo(e, f)
        }
        return f
    }

    function cp(b) {
        if (b <= 0) {
            return 0
        }
        var a = this.DV % b,
            d = (this.s < 0) ? b - 1 : 0;
        if (this.t > 0) {
            if (a == 0) {
                d = this[0] % b
            } else {
                for (var c = this.t - 1; c >= 0; --c) {
                    d = (a * d + this[c]) % b
                }
            }
        }
        return d
    }

    function bZ(g) {
        var h = g.isEven();
        if ((this.isEven() && h) || g.signum() == 0) {
            return a8.ZERO
        }
        var b = g.clone(),
            c = this.clone();
        var d = bX(1),
            e = bX(0),
            a = bX(0),
            f = bX(1);
        while (b.signum() != 0) {
            while (b.isEven()) {
                b.rShiftTo(1, b);
                if (h) {
                    if (!d.isEven() || !e.isEven()) {
                        d.addTo(this, d);
                        e.subTo(g, e)
                    }
                    d.rShiftTo(1, d)
                } else {
                    if (!e.isEven()) {
                        e.subTo(g, e)
                    }
                }
                e.rShiftTo(1, e)
            }
            while (c.isEven()) {
                c.rShiftTo(1, c);
                if (h) {
                    if (!a.isEven() || !f.isEven()) {
                        a.addTo(this, a);
                        f.subTo(g, f)
                    }
                    a.rShiftTo(1, a)
                } else {
                    if (!f.isEven()) {
                        f.subTo(g, f)
                    }
                }
                f.rShiftTo(1, f)
            }
            if (b.compareTo(c) >= 0) {
                b.subTo(c, b);
                if (h) {
                    d.subTo(a, d)
                }
                e.subTo(f, e)
            } else {
                c.subTo(b, c);
                if (h) {
                    a.subTo(d, a)
                }
                f.subTo(e, f)
            }
        }
        if (c.compareTo(a8.ONE) != 0) {
            return a8.ZERO
        }
        if (f.compareTo(g) >= 0) {
            return f.subtract(g)
        }
        if (f.signum() < 0) {
            f.addTo(g, f)
        } else {
            return f
        }
        if (f.signum() < 0) {
            return f.add(g)
        } else {
            return f
        }
    }

    var cI = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997];
    var cC = (1 << 26) / cI[cI.length - 1];

    function da(c) {
        var b, d = this.abs();
        if (d.t == 1 && d[0] <= cI[cI.length - 1]) {
            for (b = 0; b < cI.length; ++b) {
                if (d[0] == cI[b]) {
                    return true
                }
            }
            return false
        }
        if (d.isEven()) {
            return false
        }
        b = 1;
        while (b < cI.length) {
            var a = cI[b],
                e = b + 1;
            while (e < cI.length && a < cC) {
                a *= cI[e++]
            }
            a = d.modInt(a);
            while (b < e) {
                if (a % cI[b++] == 0) {
                    return false
                }
            }
        }
        return d.millerRabin(c)
    }

    function c8(h) {
        var g = this.subtract(a8.ONE);
        var b = g.getLowestSetBit();
        if (b <= 0) {
            return false
        }
        var e = g.shiftRight(b);
        h = (h + 1) >> 1;
        if (h > cI.length) {
            h = cI.length
        }
        var c = dG();
        for (var d = 0; d < h; ++d) {
            c.fromInt(cI[Math.floor(Math.random() * cI.length)]);
            var a = c.modPow(e, this);
            if (a.compareTo(a8.ONE) != 0 && a.compareTo(g) != 0) {
                var f = 1;
                while (f++ < b && a.compareTo(g) != 0) {
                    a = a.modPowInt(2, this);
                    if (a.compareTo(a8.ONE) == 0) {
                        return false
                    }
                }
                if (a.compareTo(g) != 0) {
                    return false
                }
            }
        }
        return true
    }

    a8.prototype.chunkSize = dn;
    a8.prototype.toRadix = dA;
    a8.prototype.fromRadix = cH;
    a8.prototype.fromNumber = cJ;
    a8.prototype.bitwiseTo = cn;
    a8.prototype.changeBit = eh;
    a8.prototype.addTo = db;
    a8.prototype.dMultiply = cP;
    a8.prototype.dAddOffset = dK;
    a8.prototype.multiplyLowerTo = cV;
    a8.prototype.multiplyUpperTo = d1;
    a8.prototype.modInt = cp;
    a8.prototype.millerRabin = c8;
    a8.prototype.clone = b0;
    a8.prototype.intValue = dj;
    a8.prototype.byteValue = dZ;
    a8.prototype.shortValue = ec;
    a8.prototype.signum = cw;
    a8.prototype.toByteArray = cB;
    a8.prototype.equals = dY;
    a8.prototype.min = cO;
    a8.prototype.max = cQ;
    a8.prototype.and = ce;
    a8.prototype.or = cY;
    a8.prototype.xor = dl;
    a8.prototype.andNot = dM;
    a8.prototype.not = ee;
    a8.prototype.shiftLeft = b9;
    a8.prototype.shiftRight = bY;
    a8.prototype.getLowestSetBit = cj;
    a8.prototype.bitCount = t;
    a8.prototype.testBit = bV;
    a8.prototype.setBit = b7;
    a8.prototype.clearBit = dz;
    a8.prototype.flipBit = dP;
    a8.prototype.add = cT;
    a8.prototype.subtract = cU;
    a8.prototype.multiply = cq;
    a8.prototype.divide = cD;
    a8.prototype.remainder = dm;
    a8.prototype.divideAndRemainder = dD;
    a8.prototype.modPow = cW;
    a8.prototype.modInverse = bZ;
    a8.prototype.pow = dN;
    a8.prototype.gcd = ef;
    a8.prototype.isProbablePrime = da;
    a8.prototype.square = c1;

    function cS() {
        this.i = 0;
        this.j = 0;
        this.S = new Array()
    }

    function dF(b) {
        var c, d, a;
        for (c = 0; c < 256; ++c) {
            this.S[c] = c
        }
        d = 0;
        for (c = 0; c < 256; ++c) {
            d = (d + this.S[c] + b[c % b.length]) & 255;
            a = this.S[c];
            this.S[c] = this.S[d];
            this.S[d] = a
        }
        this.i = 0;
        this.j = 0
    }

    function cl() {
        var a;
        this.i = (this.i + 1) & 255;
        this.j = (this.j + this.S[this.i]) & 255;
        a = this.S[this.i];
        this.S[this.i] = this.S[this.j];
        this.S[this.j] = a;
        return this.S[(a + this.S[this.i]) & 255]
    }

    cS.prototype.init = dF;
    cS.prototype.next = cl;

    function di() {
        return new cS()
    }

    var dc = 256;
    var cu;
    var c3;
    var dx;
    if (c3 == null) {
        c3 = new Array();
        dx = 0;
        var dJ;
        if (window.crypto && window.crypto.getRandomValues) {
            var dS = new Uint32Array(256);
            window.crypto.getRandomValues(dS);
            for (dJ = 0; dJ < dS.length; ++dJ) {
                c3[dx++] = dS[dJ] & 255
            }
        }
        var cs = function (b) {
            this.count = this.count || 0;
            if (this.count >= 256 || dx >= dc) {
                if (window.removeEventListener) {
                    window.removeEventListener("mousemove", cs)
                } else {
                    if (window.detachEvent) {
                        window.detachEvent("onmousemove", cs)
                    }
                }
                return
            }
            this.count += 1;
            var a = b.x + b.y;
            c3[dx++] = a & 255
        };
        if (window.addEventListener) {
            window.addEventListener("mousemove", cs)
        } else {
            if (window.attachEvent) {
                window.attachEvent("onmousemove", cs)
            }
        }
    }

    function d7() {
        if (cu == null) {
            cu = di();
            while (dx < dc) {
                var a = Math.floor(65536 * Math.random());
                c3[dx++] = a & 255
            }
            cu.init(c3);
            for (dx = 0; dx < c3.length; ++dx) {
                c3[dx] = 0
            }
            dx = 0
        }
        return cu.next()
    }

    function cb(b) {
        var a;
        for (a = 0; a < b.length; ++a) {
            b[a] = d7()
        }
    }

    function dW() {
    }

    dW.prototype.nextBytes = cb;

    function d9(b, a) {
        return new a8(b, a)
    }

    function ch(a, b) {
        var c = "";
        var d = 0;
        while (d + b < a.length) {
            c += a.substring(d, d + b) + "\n";
            d += b
        }
        return c + a.substring(d, a.length)
    }

    function ed(a) {
        if (a < 16) {
            return "0" + a.toString(16)
        } else {
            return a.toString(16)
        }
    }

    function d3(c, f) {
        if (f < c.length + 11) {
            console.error("Message too long for RSA");
            return null
        }
        var g = new Array();
        var b = c.length - 1;
        while (b >= 0 && f > 0) {
            var d = c.charCodeAt(b--);
            if (d < 128) {
                g[--f] = d
            } else {
                if ((d > 127) && (d < 2048)) {
                    g[--f] = (d & 63) | 128;
                    g[--f] = (d >> 6) | 192
                } else {
                    g[--f] = (d & 63) | 128;
                    g[--f] = ((d >> 6) & 63) | 128;
                    g[--f] = (d >> 12) | 224
                }
            }
        }
        g[--f] = 0;
        var e = new dW();
        var a = new Array();
        while (f > 2) {
            a[0] = 0;
            while (a[0] == 0) {
                e.nextBytes(a)
            }
            g[--f] = a[0]
        }
        g[--f] = 2;
        g[--f] = 0;
        return new a8(g)
    }

    function b5() {
        this.n = null;
        this.e = 0;
        this.d = null;
        this.p = null;
        this.q = null;
        this.dmp1 = null;
        this.dmq1 = null;
        this.coeff = null
    }

    function cM(b, a) {
        if (b != null && a != null && b.length > 0 && a.length > 0) {
            this.n = d9(b, 16);
            this.e = parseInt(a, 16)
        } else {
            console.error("Invalid RSA public key")
        }
    }

    function bT(a) {
        return a.modPowInt(this.e, this.n)
    }

    function cx(a) {
        var c = d3(a, (this.n.bitLength() + 7) >> 3);
        if (c == null) {
            return null
        }
        var b = this.doPublic(c);
        if (b == null) {
            return null
        }
        var d = b.toString(16);
        if ((d.length & 1) == 0) {
            return d
        } else {
            return "0" + d
        }
    }

    b5.prototype.doPublic = bT;
    b5.prototype.setPublic = cM;
    b5.prototype.encrypt = cx;

    function cG(b, d) {
        var e = b.toByteArray();
        var a = 0;
        while (a < e.length && e[a] == 0) {
            ++a
        }
        if (e.length - a != d - 1 || e[a] != 2) {
            return null
        }
        ++a;
        while (e[a] != 0) {
            if (++a >= e.length) {
                return null
            }
        }
        var f = "";
        while (++a < e.length) {
            var c = e[a] & 255;
            if (c < 128) {
                f += String.fromCharCode(c)
            } else {
                if ((c > 191) && (c < 224)) {
                    f += String.fromCharCode(((c & 31) << 6) | (e[a + 1] & 63));
                    ++a
                } else {
                    f += String.fromCharCode(((c & 15) << 12) | ((e[a + 1] & 63) << 6) | (e[a + 2] & 63));
                    a += 2
                }
            }
        }
        return f
    }

    function cv(h, i) {
        var g = new dW();
        var c = h >> 1;
        this.e = parseInt(i, 16);
        var f = new a8(i, 16);
        for (; ;) {
            for (; ;) {
                this.p = new a8(h - c, 1, g);
                if (this.p.subtract(a8.ONE).gcd(f).compareTo(a8.ONE) == 0 && this.p.isProbablePrime(10)) {
                    break
                }
            }
            for (; ;) {
                this.q = new a8(c, 1, g);
                if (this.q.subtract(a8.ONE).gcd(f).compareTo(a8.ONE) == 0 && this.q.isProbablePrime(10)) {
                    break
                }
            }
            if (this.p.compareTo(this.q) <= 0) {
                var a = this.p;
                this.p = this.q;
                this.q = a
            }
            var b = this.p.subtract(a8.ONE);
            var e = this.q.subtract(a8.ONE);
            var d = b.multiply(e);
            if (d.gcd(f).compareTo(a8.ONE) == 0) {
                this.n = this.p.multiply(this.q);
                this.d = f.modInverse(d);
                this.dmp1 = this.d.mod(b);
                this.dmq1 = this.d.mod(e);
                this.coeff = this.q.modInverse(this.p);
                break
            }
        }
    }

    function cd(c) {
        var a = d9(c, 16);
        var b = this.doPrivate(a);
        if (b == null) {
            return null
        }
        return cG(b, (this.n.bitLength() + 7) >> 3)
    }

    b5.prototype.generate = cv;
    b5.prototype.decrypt = cd;
    (function () {
        var c = function (j, d, k) {
            var f = new dW();
            var i = j >> 1;
            this.e = parseInt(d, 16);
            var g = new a8(d, 16);
            var e = this;
            var h = function () {
                var m = function () {
                    if (e.p.compareTo(e.q) <= 0) {
                        var p = e.p;
                        e.p = e.q;
                        e.q = p
                    }
                    var r = e.p.subtract(a8.ONE);
                    var q = e.q.subtract(a8.ONE);
                    var o = r.multiply(q);
                    if (o.gcd(g).compareTo(a8.ONE) == 0) {
                        e.n = e.p.multiply(e.q);
                        e.d = g.modInverse(o);
                        e.dmp1 = e.d.mod(r);
                        e.dmq1 = e.d.mod(q);
                        e.coeff = e.q.modInverse(e.p);
                        setTimeout(function () {
                                k()
                            },
                            0)
                    } else {
                        setTimeout(h, 0)
                    }
                };
                var l = function () {
                    e.q = dG();
                    e.q.fromNumberAsync(i, 1, f,
                        function () {
                            e.q.subtract(a8.ONE).gcda(g,
                                function (o) {
                                    if (o.compareTo(a8.ONE) == 0 && e.q.isProbablePrime(10)) {
                                        setTimeout(m, 0)
                                    } else {
                                        setTimeout(l, 0)
                                    }
                                })
                        })
                };
                var n = function () {
                    e.p = dG();
                    e.p.fromNumberAsync(j - i, 1, f,
                        function () {
                            e.p.subtract(a8.ONE).gcda(g,
                                function (o) {
                                    if (o.compareTo(a8.ONE) == 0 && e.p.isProbablePrime(10)) {
                                        setTimeout(l, 0)
                                    } else {
                                        setTimeout(n, 0)
                                    }
                                })
                        })
                };
                setTimeout(n, 0)
            };
            setTimeout(h, 0)
        };
        b5.prototype.generateAsync = c;
        var b = function (h, j) {
            var i = (this.s < 0) ? this.negate() : this.clone();
            var k = (h.s < 0) ? h.negate() : h.clone();
            if (i.compareTo(k) < 0) {
                var f = i;
                i = k;
                k = f
            }
            var g = i.getLowestSetBit(),
                e = k.getLowestSetBit();
            if (e < 0) {
                j(i);
                return
            }
            if (g < e) {
                e = g
            }
            if (e > 0) {
                i.rShiftTo(e, i);
                k.rShiftTo(e, k)
            }
            var d = function () {
                if ((g = i.getLowestSetBit()) > 0) {
                    i.rShiftTo(g, i)
                }
                if ((g = k.getLowestSetBit()) > 0) {
                    k.rShiftTo(g, k)
                }
                if (i.compareTo(k) >= 0) {
                    i.subTo(k, i);
                    i.rShiftTo(1, i)
                } else {
                    k.subTo(i, k);
                    k.rShiftTo(1, k)
                }
                if (!(i.signum() > 0)) {
                    if (e > 0) {
                        k.lShiftTo(e, k)
                    }
                    setTimeout(function () {
                            j(k)
                        },
                        0)
                } else {
                    setTimeout(d, 0)
                }
            };
            setTimeout(d, 10)
        };
        a8.prototype.gcda = b;
        var a = function (e, h, j, k) {
            if ("number" == typeof h) {
                if (e < 2) {
                    this.fromInt(1)
                } else {
                    this.fromNumber(e, j);
                    if (!this.testBit(e - 1)) {
                        this.bitwiseTo(a8.ONE.shiftLeft(e - 1), c4, this)
                    }
                    if (this.isEven()) {
                        this.dAddOffset(1, 0)
                    }
                    var f = this;
                    var g = function () {
                        f.dAddOffset(2, 0);
                        if (f.bitLength() > e) {
                            f.subTo(a8.ONE.shiftLeft(e - 1), f)
                        }
                        if (f.isProbablePrime(h)) {
                            setTimeout(function () {
                                    k()
                                },
                                0)
                        } else {
                            setTimeout(g, 0)
                        }
                    };
                    setTimeout(g, 0)
                }
            } else {
                var i = new Array(),
                    d = e & 7;
                i.length = (e >> 3) + 1;
                h.nextBytes(i);
                if (d > 0) {
                    i[0] &= ((1 << d) - 1)
                } else {
                    i[0] = 0
                }
                this.fromString(i, 256)
            }
        };
        a8.prototype.fromNumberAsync = a
    })();
    var L = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var cz = "=";

    function cF(a) {
        var d;
        var b;
        var c = "";
        for (d = 0; d + 3 <= a.length; d += 3) {
            b = parseInt(a.substring(d, d + 3), 16);
            c += L.charAt(b >> 6) + L.charAt(b & 63)
        }
        if (d + 1 == a.length) {
            b = parseInt(a.substring(d, d + 1), 16);
            c += L.charAt(b << 2)
        } else {
            if (d + 2 == a.length) {
                b = parseInt(a.substring(d, d + 2), 16);
                c += L.charAt(b >> 2) + L.charAt((b & 3) << 4)
            }
        }
        while ((c.length & 3) > 0) {
            c += cz
        }
        return c
    }

    function ci(b) {
        var d = "";
        var c;
        var a = 0;
        var e;
        for (c = 0; c < b.length; ++c) {
            if (b.charAt(c) == cz) {
                break
            }
            v = L.indexOf(b.charAt(c));
            if (v < 0) {
                continue
            }
            if (a == 0) {
                d += dp(v >> 2);
                e = v & 3;
                a = 1
            } else {
                if (a == 1) {
                    d += dp((e << 2) | (v >> 4));
                    e = v & 15;
                    a = 2
                } else {
                    if (a == 2) {
                        d += dp(e);
                        d += dp(v >> 2);
                        e = v & 3;
                        a = 3
                    } else {
                        d += dp((e << 2) | (v >> 4));
                        d += dp(v & 15);
                        a = 0
                    }
                }
            }
        }
        if (a == 1) {
            d += dp(e << 2)
        }
        return d
    }

    function b8(b) {
        var a = ci(b);
        var d;
        var c = new Array();
        for (d = 0; 2 * d < a.length; ++d) {
            c[d] = parseInt(a.substring(2 * d, 2 * d + 2), 16)
        }
        return c
    };
    var c9 = c9 || {};
    c9.env = c9.env || {};
    var cm = c9,
        bW = Object.prototype,
        b4 = "[object Function]",
        co = ["toString", "valueOf"];
    c9.env.parseUA = function (c) {
        var b = function (j) {
                var i = 0;
                return parseFloat(j.replace(/\./g,
                    function () {
                        return (i++ == 1) ? "" : "."
                    }))
            },
            e = navigator,
            g = {
                ie: 0,
                opera: 0,
                gecko: 0,
                webkit: 0,
                chrome: 0,
                mobile: null,
                air: 0,
                ipad: 0,
                iphone: 0,
                ipod: 0,
                ios: null,
                android: 0,
                webos: 0,
                caja: e && e.cajaVersion,
                secure: false,
                os: null
            },
            d = c || (navigator && navigator.userAgent),
            h = window && window.location,
            f = h && h.href,
            a;
        g.secure = f && (f.toLowerCase().indexOf("https") === 0);
        if (d) {
            if ((/windows|win32/i).test(d)) {
                g.os = "windows"
            } else {
                if ((/macintosh/i).test(d)) {
                    g.os = "macintosh"
                } else {
                    if ((/rhino/i).test(d)) {
                        g.os = "rhino"
                    }
                }
            }
            if ((/KHTML/).test(d)) {
                g.webkit = 1
            }
            a = d.match(/AppleWebKit\/([^\s]*)/);
            if (a && a[1]) {
                g.webkit = b(a[1]);
                if (/ Mobile\//.test(d)) {
                    g.mobile = "Apple";
                    a = d.match(/OS ([^\s]*)/);
                    if (a && a[1]) {
                        a = b(a[1].replace("_", "."))
                    }
                    g.ios = a;
                    g.ipad = g.ipod = g.iphone = 0;
                    a = d.match(/iPad|iPod|iPhone/);
                    if (a && a[0]) {
                        g[a[0].toLowerCase()] = g.ios
                    }
                } else {
                    a = d.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/);
                    if (a) {
                        g.mobile = a[0]
                    }
                    if (/webOS/.test(d)) {
                        g.mobile = "WebOS";
                        a = d.match(/webOS\/([^\s]*);/);
                        if (a && a[1]) {
                            g.webos = b(a[1])
                        }
                    }
                    if (/ Android/.test(d)) {
                        g.mobile = "Android";
                        a = d.match(/Android ([^\s]*);/);
                        if (a && a[1]) {
                            g.android = b(a[1])
                        }
                    }
                }
                a = d.match(/Chrome\/([^\s]*)/);
                if (a && a[1]) {
                    g.chrome = b(a[1])
                } else {
                    a = d.match(/AdobeAIR\/([^\s]*)/);
                    if (a) {
                        g.air = a[0]
                    }
                }
            }
            if (!g.webkit) {
                a = d.match(/Opera[\s\/]([^\s]*)/);
                if (a && a[1]) {
                    g.opera = b(a[1]);
                    a = d.match(/Version\/([^\s]*)/);
                    if (a && a[1]) {
                        g.opera = b(a[1])
                    }
                    a = d.match(/Opera Mini[^;]*/);
                    if (a) {
                        g.mobile = a[0]
                    }
                } else {
                    a = d.match(/MSIE\s([^;]*)/);
                    if (a && a[1]) {
                        g.ie = b(a[1])
                    } else {
                        a = d.match(/Gecko\/([^\s]*)/);
                        if (a) {
                            g.gecko = 1;
                            a = d.match(/rv:([^\s\)]*)/);
                            if (a && a[1]) {
                                g.gecko = b(a[1])
                            }
                        }
                    }
                }
            }
        }
        return g
    };
    c9.env.ua = c9.env.parseUA();
    c9.isFunction = function (a) {
        return (typeof a === "function") || bW.toString.apply(a) === b4
    };
    c9._IEEnumFix = (c9.env.ua.ie) ?
        function (b, c) {
            var d, a, e;
            for (d = 0; d < co.length; d = d + 1) {
                a = co[d];
                e = c[a];
                if (cm.isFunction(e) && e != bW[a]) {
                    b[a] = e
                }
            }
        } : function () {
        };
    c9.extend = function (c, b, d) {
        if (!b || !c) {
            throw new Error("extend failed, please check that all dependencies are included.")
        }
        var e = function () {
            },
            a;
        e.prototype = b.prototype;
        c.prototype = new e();
        c.prototype.constructor = c;
        c.superclass = b.prototype;
        if (b.prototype.constructor == bW.constructor) {
            b.prototype.constructor = b
        }
        if (d) {
            for (a in d) {
                if (cm.hasOwnProperty(d, a)) {
                    c.prototype[a] = d[a]
                }
            }
            cm._IEEnumFix(c.prototype, d)
        }
    };
    if (typeof KJUR == "undefined" || !KJUR) {
        KJUR = {}
    }
    if (typeof KJUR.asn1 == "undefined" || !KJUR.asn1) {
        KJUR.asn1 = {}
    }
    KJUR.asn1.ASN1Util = new
    function () {
        this.integerToByteHex = function (a) {
            var b = a.toString(16);
            if ((b.length % 2) == 1) {
                b = "0" + b
            }
            return b
        };
        this.bigIntToMinTwosComplementsHex = function (e) {
            var h = e.toString(16);
            if (h.substr(0, 1) != "-") {
                if (h.length % 2 == 1) {
                    h = "0" + h
                } else {
                    if (!h.match(/^[0-7]/)) {
                        h = "00" + h
                    }
                }
            } else {
                var d = h.substr(1);
                var b = d.length;
                if (b % 2 == 1) {
                    b += 1
                } else {
                    if (!h.match(/^[0-7]/)) {
                        b += 2
                    }
                }
                var g = "";
                for (var c = 0; c < b; c++) {
                    g += "f"
                }
                var a = new a8(g, 16);
                var f = a.xor(e).add(a8.ONE);
                h = f.toString(16).replace(/^-/, "")
            }
            return h
        }
    };
    KJUR.asn1.ASN1Object = function () {
        var b = true;
        var c = null;
        var d = "00";
        var e = "00";
        var a = "";
        this.getLengthHexFromValue = function () {
            if (typeof this.hV == "undefined" || this.hV == null) {
                throw "this.hV is null or undefined."
            }
            if (this.hV.length % 2 == 1) {
                throw "value hex must be even length: n=" + a.length + ",v=" + this.hV
            }
            var f = this.hV.length / 2;
            var g = f.toString(16);
            if (g.length % 2 == 1) {
                g = "0" + g
            }
            if (f < 128) {
                return g
            } else {
                var h = g.length / 2;
                if (h > 15) {
                    throw "ASN.1 length too long to represent by 8x: n = " + f.toString(16)
                }
                var i = 128 + h;
                return i.toString(16) + g
            }
        };
        this.getEncodedHex = function () {
            if (this.hTLV == null || this.isModified) {
                this.hV = this.getFreshValueHex();
                this.hL = this.getLengthHexFromValue();
                this.hTLV = this.hT + this.hL + this.hV;
                this.isModified = false
            }
            return this.hTLV
        };
        this.getValueHex = function () {
            this.getEncodedHex();
            return this.hV
        };
        this.getFreshValueHex = function () {
            return ""
        }
    };
    KJUR.asn1.DERAbstractString = function (a) {
        KJUR.asn1.DERAbstractString.superclass.constructor.call(this);
        var c = null;
        var b = null;
        this.getString = function () {
            return this.s
        };
        this.setString = function (d) {
            this.hTLV = null;
            this.isModified = true;
            this.s = d;
            this.hV = stohex(this.s)
        };
        this.setStringHex = function (d) {
            this.hTLV = null;
            this.isModified = true;
            this.s = null;
            this.hV = d
        };
        this.getFreshValueHex = function () {
            return this.hV
        };
        if (typeof a != "undefined") {
            if (typeof a.str != "undefined") {
                this.setString(a.str)
            } else {
                if (typeof a.hex != "undefined") {
                    this.setStringHex(a.hex)
                }
            }
        }
    };
    c9.extend(KJUR.asn1.DERAbstractString, KJUR.asn1.ASN1Object);
    KJUR.asn1.DERAbstractTime = function (a) {
        KJUR.asn1.DERAbstractTime.superclass.constructor.call(this);
        var c = null;
        var b = null;
        this.localDateToUTC = function (d) {
            utc = d.getTime() + (d.getTimezoneOffset() * 60000);
            var e = new Date(utc);
            return e
        };
        this.formatDate = function (l, j) {
            var g = this.zeroPadding;
            var k = this.localDateToUTC(l);
            var i = String(k.getFullYear());
            if (j == "utc") {
                i = i.substr(2, 2)
            }
            var m = g(String(k.getMonth() + 1), 2);
            var h = g(String(k.getDate()), 2);
            var f = g(String(k.getHours()), 2);
            var e = g(String(k.getMinutes()), 2);
            var d = g(String(k.getSeconds()), 2);
            return i + m + h + f + e + d + "Z"
        };
        this.zeroPadding = function (d, e) {
            if (d.length >= e) {
                return d
            }
            return new Array(e - d.length + 1).join("0") + d
        };
        this.getString = function () {
            return this.s
        };
        this.setString = function (d) {
            this.hTLV = null;
            this.isModified = true;
            this.s = d;
            this.hV = stohex(this.s)
        };
        this.setByDateValue = function (i, g, e, f, d, j) {
            var h = new Date(Date.UTC(i, g - 1, e, f, d, j, 0));
            this.setByDate(h)
        };
        this.getFreshValueHex = function () {
            return this.hV
        }
    };
    c9.extend(KJUR.asn1.DERAbstractTime, KJUR.asn1.ASN1Object);
    KJUR.asn1.DERAbstractStructured = function (b) {
        KJUR.asn1.DERAbstractString.superclass.constructor.call(this);
        var a = null;
        this.setByASN1ObjectArray = function (c) {
            this.hTLV = null;
            this.isModified = true;
            this.asn1Array = c
        };
        this.appendASN1Object = function (c) {
            this.hTLV = null;
            this.isModified = true;
            this.asn1Array.push(c)
        };
        this.asn1Array = new Array();
        if (typeof b != "undefined") {
            if (typeof b.array != "undefined") {
                this.asn1Array = b.array
            }
        }
    };
    c9.extend(KJUR.asn1.DERAbstractStructured, KJUR.asn1.ASN1Object);
    KJUR.asn1.DERBoolean = function () {
        KJUR.asn1.DERBoolean.superclass.constructor.call(this);
        this.hT = "01";
        this.hTLV = "0101ff"
    };
    c9.extend(KJUR.asn1.DERBoolean, KJUR.asn1.ASN1Object);
    KJUR.asn1.DERInteger = function (a) {
        KJUR.asn1.DERInteger.superclass.constructor.call(this);
        this.hT = "02";
        this.setByBigInteger = function (b) {
            this.hTLV = null;
            this.isModified = true;
            this.hV = KJUR.asn1.ASN1Util.bigIntToMinTwosComplementsHex(b)
        };
        this.setByInteger = function (b) {
            var c = new a8(String(b), 10);
            this.setByBigInteger(c)
        };
        this.setValueHex = function (b) {
            this.hV = b
        };
        this.getFreshValueHex = function () {
            return this.hV
        };
        if (typeof a != "undefined") {
            if (typeof a.bigint != "undefined") {
                this.setByBigInteger(a.bigint)
            } else {
                if (typeof a["int"] != "undefined") {
                    this.setByInteger(a["int"])
                } else {
                    if (typeof a.hex != "undefined") {
                        this.setValueHex(a.hex)
                    }
                }
            }
        }
    };
    c9.extend(KJUR.asn1.DERInteger, KJUR.asn1.ASN1Object);
    KJUR.asn1.DERBitString = function (a) {
        KJUR.asn1.DERBitString.superclass.constructor.call(this);
        this.hT = "03";
        this.setHexValueIncludingUnusedBits = function (b) {
            this.hTLV = null;
            this.isModified = true;
            this.hV = b
        };
        this.setUnusedBitsAndHexValue = function (d, c) {
            if (d < 0 || 7 < d) {
                throw "unused bits shall be from 0 to 7: u = " + d
            }
            var b = "0" + d;
            this.hTLV = null;
            this.isModified = true;
            this.hV = b + c
        };
        this.setByBinaryString = function (c) {
            c = c.replace(/0+$/, "");
            var d = 8 - c.length % 8;
            if (d == 8) {
                d = 0
            }
            for (var f = 0; f <= d; f++) {
                c += "0"
            }
            var g = "";
            for (var f = 0; f < c.length - 1; f += 8) {
                var b = c.substr(f, 8);
                var e = parseInt(b, 2).toString(16);
                if (e.length == 1) {
                    e = "0" + e
                }
                g += e
            }
            this.hTLV = null;
            this.isModified = true;
            this.hV = "0" + d + g
        };
        this.setByBooleanArray = function (c) {
            var b = "";
            for (var d = 0; d < c.length; d++) {
                if (c[d] == true) {
                    b += "1"
                } else {
                    b += "0"
                }
            }
            this.setByBinaryString(b)
        };
        this.newFalseArray = function (c) {
            var d = new Array(c);
            for (var b = 0; b < c; b++) {
                d[b] = false
            }
            return d
        };
        this.getFreshValueHex = function () {
            return this.hV
        };
        if (typeof a != "undefined") {
            if (typeof a.hex != "undefined") {
                this.setHexValueIncludingUnusedBits(a.hex)
            } else {
                if (typeof a.bin != "undefined") {
                    this.setByBinaryString(a.bin)
                } else {
                    if (typeof a.array != "undefined") {
                        this.setByBooleanArray(a.array)
                    }
                }
            }
        }
    };
    c9.extend(KJUR.asn1.DERBitString, KJUR.asn1.ASN1Object);
    KJUR.asn1.DEROctetString = function (a) {
        KJUR.asn1.DEROctetString.superclass.constructor.call(this, a);
        this.hT = "04"
    };
    c9.extend(KJUR.asn1.DEROctetString, KJUR.asn1.DERAbstractString);
    KJUR.asn1.DERNull = function () {
        KJUR.asn1.DERNull.superclass.constructor.call(this);
        this.hT = "05";
        this.hTLV = "0500"
    };
    c9.extend(KJUR.asn1.DERNull, KJUR.asn1.ASN1Object);
    KJUR.asn1.DERObjectIdentifier = function (a) {
        var c = function (e) {
            var d = e.toString(16);
            if (d.length == 1) {
                d = "0" + d
            }
            return d
        };
        var b = function (d) {
            var e = "";
            var h = new a8(d, 10);
            var i = h.toString(2);
            var g = 7 - i.length % 7;
            if (g == 7) {
                g = 0
            }
            var j = "";
            for (var f = 0; f < g; f++) {
                j += "0"
            }
            i = j + i;
            for (var f = 0; f < i.length - 1; f += 7) {
                var k = i.substr(f, 7);
                if (f != i.length - 7) {
                    k = "1" + k
                }
                e += c(parseInt(k, 2))
            }
            return e
        };
        KJUR.asn1.DERObjectIdentifier.superclass.constructor.call(this);
        this.hT = "06";
        this.setValueHex = function (d) {
            this.hTLV = null;
            this.isModified = true;
            this.s = null;
            this.hV = d
        };
        this.setValueOidString = function (d) {
            if (!d.match(/^[0-9.]+$/)) {
                throw "malformed oid string: " + d
            }
            var h = "";
            var f = d.split(".");
            var g = parseInt(f[0]) * 40 + parseInt(f[1]);
            h += c(g);
            f.splice(0, 2);
            for (var e = 0; e < f.length; e++) {
                h += b(f[e])
            }
            this.hTLV = null;
            this.isModified = true;
            this.s = null;
            this.hV = h
        };
        this.setValueName = function (d) {
            if (typeof KJUR.asn1.x509.OID.name2oidList[d] != "undefined") {
                var e = KJUR.asn1.x509.OID.name2oidList[d];
                this.setValueOidString(e)
            } else {
                throw "DERObjectIdentifier oidName undefined: " + d
            }
        };
        this.getFreshValueHex = function () {
            return this.hV
        };
        if (typeof a != "undefined") {
            if (typeof a.oid != "undefined") {
                this.setValueOidString(a.oid)
            } else {
                if (typeof a.hex != "undefined") {
                    this.setValueHex(a.hex)
                } else {
                    if (typeof a.name != "undefined") {
                        this.setValueName(a.name)
                    }
                }
            }
        }
    };
    c9.extend(KJUR.asn1.DERObjectIdentifier, KJUR.asn1.ASN1Object);
    KJUR.asn1.DERUTF8String = function (a) {
        KJUR.asn1.DERUTF8String.superclass.constructor.call(this, a);
        this.hT = "0c"
    };
    c9.extend(KJUR.asn1.DERUTF8String, KJUR.asn1.DERAbstractString);
    KJUR.asn1.DERNumericString = function (a) {
        KJUR.asn1.DERNumericString.superclass.constructor.call(this, a);
        this.hT = "12"
    };
    c9.extend(KJUR.asn1.DERNumericString, KJUR.asn1.DERAbstractString);
    KJUR.asn1.DERPrintableString = function (a) {
        KJUR.asn1.DERPrintableString.superclass.constructor.call(this, a);
        this.hT = "13"
    };
    c9.extend(KJUR.asn1.DERPrintableString, KJUR.asn1.DERAbstractString);
    KJUR.asn1.DERTeletexString = function (a) {
        KJUR.asn1.DERTeletexString.superclass.constructor.call(this, a);
        this.hT = "14"
    };
    c9.extend(KJUR.asn1.DERTeletexString, KJUR.asn1.DERAbstractString);
    KJUR.asn1.DERIA5String = function (a) {
        KJUR.asn1.DERIA5String.superclass.constructor.call(this, a);
        this.hT = "16"
    };
    c9.extend(KJUR.asn1.DERIA5String, KJUR.asn1.DERAbstractString);
    KJUR.asn1.DERUTCTime = function (a) {
        KJUR.asn1.DERUTCTime.superclass.constructor.call(this, a);
        this.hT = "17";
        this.setByDate = function (b) {
            this.hTLV = null;
            this.isModified = true;
            this.date = b;
            this.s = this.formatDate(this.date, "utc");
            this.hV = stohex(this.s)
        };
        if (typeof a != "undefined") {
            if (typeof a.str != "undefined") {
                this.setString(a.str)
            } else {
                if (typeof a.hex != "undefined") {
                    this.setStringHex(a.hex)
                } else {
                    if (typeof a.date != "undefined") {
                        this.setByDate(a.date)
                    }
                }
            }
        }
    };
    c9.extend(KJUR.asn1.DERUTCTime, KJUR.asn1.DERAbstractTime);
    KJUR.asn1.DERGeneralizedTime = function (a) {
        KJUR.asn1.DERGeneralizedTime.superclass.constructor.call(this, a);
        this.hT = "18";
        this.setByDate = function (b) {
            this.hTLV = null;
            this.isModified = true;
            this.date = b;
            this.s = this.formatDate(this.date, "gen");
            this.hV = stohex(this.s)
        };
        if (typeof a != "undefined") {
            if (typeof a.str != "undefined") {
                this.setString(a.str)
            } else {
                if (typeof a.hex != "undefined") {
                    this.setStringHex(a.hex)
                } else {
                    if (typeof a.date != "undefined") {
                        this.setByDate(a.date)
                    }
                }
            }
        }
    };
    c9.extend(KJUR.asn1.DERGeneralizedTime, KJUR.asn1.DERAbstractTime);
    KJUR.asn1.DERSequence = function (a) {
        KJUR.asn1.DERSequence.superclass.constructor.call(this, a);
        this.hT = "30";
        this.getFreshValueHex = function () {
            var b = "";
            for (var d = 0; d < this.asn1Array.length; d++) {
                var c = this.asn1Array[d];
                b += c.getEncodedHex()
            }
            this.hV = b;
            return this.hV
        }
    };
    c9.extend(KJUR.asn1.DERSequence, KJUR.asn1.DERAbstractStructured);
    KJUR.asn1.DERSet = function (a) {
        KJUR.asn1.DERSet.superclass.constructor.call(this, a);
        this.hT = "31";
        this.getFreshValueHex = function () {
            var d = new Array();
            for (var b = 0; b < this.asn1Array.length; b++) {
                var c = this.asn1Array[b];
                d.push(c.getEncodedHex())
            }
            d.sort();
            this.hV = d.join("");
            return this.hV
        }
    };
    c9.extend(KJUR.asn1.DERSet, KJUR.asn1.DERAbstractStructured);
    KJUR.asn1.DERTaggedObject = function (a) {
        KJUR.asn1.DERTaggedObject.superclass.constructor.call(this);
        this.hT = "a0";
        this.hV = "";
        this.isExplicit = true;
        this.asn1Object = null;
        this.setASN1Object = function (d, b, c) {
            this.hT = b;
            this.isExplicit = d;
            this.asn1Object = c;
            if (this.isExplicit) {
                this.hV = this.asn1Object.getEncodedHex();
                this.hTLV = null;
                this.isModified = true
            } else {
                this.hV = null;
                this.hTLV = c.getEncodedHex();
                this.hTLV = this.hTLV.replace(/^../, b);
                this.isModified = false
            }
        };
        this.getFreshValueHex = function () {
            return this.hV
        };
        if (typeof a != "undefined") {
            if (typeof a.tag != "undefined") {
                this.hT = a.tag
            }
            if (typeof a.explicit != "undefined") {
                this.isExplicit = a.explicit
            }
            if (typeof a.obj != "undefined") {
                this.asn1Object = a.obj;
                this.setASN1Object(this.isExplicit, this.hT, this.asn1Object)
            }
        }
    };
    c9.extend(KJUR.asn1.DERTaggedObject, KJUR.asn1.ASN1Object);
    (function (c) {
        var b = {},
            a;
        b.decode = function (i) {
            var g;
            if (a === c) {
                var f = "0123456789ABCDEF",
                    j = " \f\n\r\t\u00A0\u2028\u2029";
                a = [];
                for (g = 0; g < 16; ++g) {
                    a[f.charAt(g)] = g
                }
                f = f.toLowerCase();
                for (g = 10; g < 16; ++g) {
                    a[f.charAt(g)] = g
                }
                for (g = 0; g < j.length; ++g) {
                    a[j.charAt(g)] = -1
                }
            }
            var h = [],
                e = 0,
                k = 0;
            for (g = 0; g < i.length; ++g) {
                var d = i.charAt(g);
                if (d == "=") {
                    break
                }
                d = a[d];
                if (d == -1) {
                    continue
                }
                if (d === c) {
                    throw "Illegal character at offset " + g
                }
                e |= d;
                if (++k >= 2) {
                    h[h.length] = e;
                    e = 0;
                    k = 0
                } else {
                    e <<= 4
                }
            }
            if (k) {
                throw "Hex encoding incomplete: 4 bits missing"
            }
            return h
        };
        Hex = b
    })();
    (function (c) {
        var b = {},
            a;
        b.decode = function (i) {
            var f;
            if (a === c) {
                var g = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
                    j = "= \f\n\r\t\u00A0\u2028\u2029";
                a = [];
                for (f = 0; f < 64; ++f) {
                    a[g.charAt(f)] = f
                }
                for (f = 0; f < j.length; ++f) {
                    a[j.charAt(f)] = -1
                }
            }
            var h = [];
            var e = 0,
                k = 0;
            for (f = 0; f < i.length; ++f) {
                var d = i.charAt(f);
                if (d == "=") {
                    break
                }
                d = a[d];
                if (d == -1) {
                    continue
                }
                if (d === c) {
                    throw "Illegal character at offset " + f
                }
                e |= d;
                if (++k >= 4) {
                    h[h.length] = (e >> 16);
                    h[h.length] = (e >> 8) & 255;
                    h[h.length] = e & 255;
                    e = 0;
                    k = 0
                } else {
                    e <<= 6
                }
            }
            switch (k) {
                case 1:
                    throw "Base64 encoding incomplete: at least 2 bits missing";
                case 2:
                    h[h.length] = (e >> 10);
                    break;
                case 3:
                    h[h.length] = (e >> 16);
                    h[h.length] = (e >> 8) & 255;
                    break
            }
            return h
        };
        b.re = /-----BEGIN [^-]+-----([A-Za-z0-9+\/=\s]+)-----END [^-]+-----|begin-base64[^\n]+\n([A-Za-z0-9+\/=\s]+)====/;
        b.unarmor = function (d) {
            var e = b.re.exec(d);
            if (e) {
                if (e[1]) {
                    d = e[1]
                } else {
                    if (e[2]) {
                        d = e[2]
                    } else {
                        throw "RegExp out of sync"
                    }
                }
            }
            return b.decode(d)
        };
        Base64 = b
    })();
    (function (d) {
        var f = 100,
            e = "\u2026",
            b = {
                tag: function (h, g) {
                    var i = document.createElement(h);
                    i.className = g;
                    return i
                },
                text: function (g) {
                    return document.createTextNode(g)
                }
            };

        function c(h, g) {
            if (h instanceof c) {
                this.enc = h.enc;
                this.pos = h.pos
            } else {
                this.enc = h;
                this.pos = g
            }
        }

        c.prototype.get = function (g) {
            if (g === d) {
                g = this.pos++
            }
            if (g >= this.enc.length) {
                throw "Requesting byte offset " + g + " on a stream of length " + this.enc.length
            }
            return this.enc[g]
        };
        c.prototype.hexDigits = "0123456789ABCDEF";
        c.prototype.hexByte = function (g) {
            return this.hexDigits.charAt((g >> 4) & 15) + this.hexDigits.charAt(g & 15)
        };
        c.prototype.hexDump = function (g, k, j) {
            var h = "";
            for (var i = g; i < k; ++i) {
                h += this.hexByte(this.get(i));
                if (j !== true) {
                    switch (i & 15) {
                        case 7:
                            h += "  ";
                            break;
                        case 15:
                            h += "\n";
                            break;
                        default:
                            h += " "
                    }
                }
            }
            return h
        };
        c.prototype.parseStringISO = function (g, j) {
            var h = "";
            for (var i = g; i < j; ++i) {
                h += String.fromCharCode(this.get(i))
            }
            return h
        };
        c.prototype.parseStringUTF = function (g, k) {
            var i = "";
            for (var j = g; j < k;) {
                var h = this.get(j++);
                if (h < 128) {
                    i += String.fromCharCode(h)
                } else {
                    if ((h > 191) && (h < 224)) {
                        i += String.fromCharCode(((h & 31) << 6) | (this.get(j++) & 63))
                    } else {
                        i += String.fromCharCode(((h & 15) << 12) | ((this.get(j++) & 63) << 6) | (this.get(j++) & 63))
                    }
                }
            }
            return i
        };
        c.prototype.parseStringBMP = function (g, k) {
            var h = "";
            for (var i = g; i < k; i += 2) {
                var l = this.get(i);
                var j = this.get(i + 1);
                h += String.fromCharCode((l << 8) + j)
            }
            return h
        };
        c.prototype.reTime = /^((?:1[89]|2\d)?\d\d)(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([01]\d|2[0-3])(?:([0-5]\d)(?:([0-5]\d)(?:[.,](\d{1,3}))?)?)?(Z|[-+](?:[0]\d|1[0-2])([0-5]\d)?)?$/;
        c.prototype.parseTime = function (g, i) {
            var h = this.parseStringISO(g, i),
                j = this.reTime.exec(h);
            if (!j) {
                return "Unrecognized time: " + h
            }
            h = j[1] + "-" + j[2] + "-" + j[3] + " " + j[4];
            if (j[5]) {
                h += ":" + j[5];
                if (j[6]) {
                    h += ":" + j[6];
                    if (j[7]) {
                        h += "." + j[7]
                    }
                }
            }
            if (j[8]) {
                h += " UTC";
                if (j[8] != "Z") {
                    h += j[8];
                    if (j[9]) {
                        h += ":" + j[9]
                    }
                }
            }
            return h
        };
        c.prototype.parseInteger = function (g, k) {
            var l = k - g;
            if (l > 4) {
                l <<= 3;
                var i = this.get(g);
                if (i === 0) {
                    l -= 8
                } else {
                    while (i < 128) {
                        i <<= 1;
                        --l
                    }
                }
                return "(" + l + " bit)"
            }
            var h = 0;
            for (var j = g; j < k; ++j) {
                h = (h << 8) | this.get(j)
            }
            return h
        };
        c.prototype.parseBitString = function (i, h) {
            var m = this.get(i),
                o = ((h - i - 1) << 3) - m,
                j = "(" + o + " bit)";
            if (o <= 20) {
                var k = m;
                j += " ";
                for (var n = h - 1; n > i; --n) {
                    var l = this.get(n);
                    for (var g = k; g < 8; ++g) {
                        j += (l >> g) & 1 ? "1" : "0"
                    }
                    k = 0
                }
            }
            return j
        };
        c.prototype.parseOctetString = function (g, j) {
            var k = j - g,
                h = "(" + k + " byte) ";
            if (k > f) {
                j = g + f
            }
            for (var i = g; i < j; ++i) {
                h += this.hexByte(this.get(i))
            }
            if (k > f) {
                h += e
            }
            return h
        };
        c.prototype.parseOID = function (i, g) {
            var l = "",
                j = 0,
                k = 0;
            for (var m = i; m < g; ++m) {
                var n = this.get(m);
                j = (j << 7) | (n & 127);
                k += 7;
                if (!(n & 128)) {
                    if (l === "") {
                        var h = j < 80 ? j < 40 ? 0 : 1 : 2;
                        l = h + "." + (j - h * 40)
                    } else {
                        l += "." + ((k >= 31) ? "bigint" : j)
                    }
                    j = k = 0
                }
            }
            return l
        };

        function a(h, g, i, k, j) {
            this.stream = h;
            this.header = g;
            this.length = i;
            this.tag = k;
            this.sub = j
        }

        a.prototype.typeName = function () {
            if (this.tag === d) {
                return "unknown"
            }
            var g = this.tag >> 6,
                i = (this.tag >> 5) & 1,
                h = this.tag & 31;
            switch (g) {
                case 0:
                    switch (h) {
                        case 0:
                            return "EOC";
                        case 1:
                            return "BOOLEAN";
                        case 2:
                            return "INTEGER";
                        case 3:
                            return "BIT_STRING";
                        case 4:
                            return "OCTET_STRING";
                        case 5:
                            return "NULL";
                        case 6:
                            return "OBJECT_IDENTIFIER";
                        case 7:
                            return "ObjectDescriptor";
                        case 8:
                            return "EXTERNAL";
                        case 9:
                            return "REAL";
                        case 10:
                            return "ENUMERATED";
                        case 11:
                            return "EMBEDDED_PDV";
                        case 12:
                            return "UTF8String";
                        case 16:
                            return "SEQUENCE";
                        case 17:
                            return "SET";
                        case 18:
                            return "NumericString";
                        case 19:
                            return "PrintableString";
                        case 20:
                            return "TeletexString";
                        case 21:
                            return "VideotexString";
                        case 22:
                            return "IA5String";
                        case 23:
                            return "UTCTime";
                        case 24:
                            return "GeneralizedTime";
                        case 25:
                            return "GraphicString";
                        case 26:
                            return "VisibleString";
                        case 27:
                            return "GeneralString";
                        case 28:
                            return "UniversalString";
                        case 30:
                            return "BMPString";
                        default:
                            return "Universal_" + h.toString(16)
                    }
                case 1:
                    return "Application_" + h.toString(16);
                case 2:
                    return "[" + h + "]";
                case 3:
                    return "Private_" + h.toString(16)
            }
        };
        a.prototype.reSeemsASCII = /^[ -~]+$/;
        a.prototype.content = function () {
            if (this.tag === d) {
                return null
            }
            var g = this.tag >> 6,
                j = this.tag & 31,
                h = this.posContent(),
                k = Math.abs(this.length);
            if (g !== 0) {
                if (this.sub !== null) {
                    return "(" + this.sub.length + " elem)"
                }
                var i = this.stream.parseStringISO(h, h + Math.min(k, f));
                if (this.reSeemsASCII.test(i)) {
                    return i.substring(0, 2 * f) + ((i.length > 2 * f) ? e : "")
                } else {
                    return this.stream.parseOctetString(h, h + k)
                }
            }
            switch (j) {
                case 1:
                    return (this.stream.get(h) === 0) ? "false" : "true";
                case 2:
                    return this.stream.parseInteger(h, h + k);
                case 3:
                    return this.sub ? "(" + this.sub.length + " elem)" : this.stream.parseBitString(h, h + k);
                case 4:
                    return this.sub ? "(" + this.sub.length + " elem)" : this.stream.parseOctetString(h, h + k);
                case 6:
                    return this.stream.parseOID(h, h + k);
                case 16:
                case 17:
                    return "(" + this.sub.length + " elem)";
                case 12:
                    return this.stream.parseStringUTF(h, h + k);
                case 18:
                case 19:
                case 20:
                case 21:
                case 22:
                case 26:
                    return this.stream.parseStringISO(h, h + k);
                case 30:
                    return this.stream.parseStringBMP(h, h + k);
                case 23:
                case 24:
                    return this.stream.parseTime(h, h + k)
            }
            return null
        };
        a.prototype.toString = function () {
            return this.typeName() + "@" + this.stream.pos + "[header:" + this.header + ",length:" + this.length + ",sub:" + ((this.sub === null) ? "null" : this.sub.length) + "]"
        };
        a.prototype.print = function (h) {
            if (h === d) {
                h = ""
            }
            document.writeln(h + this);
            if (this.sub !== null) {
                h += "  ";
                for (var g = 0,
                         i = this.sub.length; g < i; ++g) {
                    this.sub[g].print(h)
                }
            }
        };
        a.prototype.toPrettyString = function (i) {
            if (i === d) {
                i = ""
            }
            var g = i + this.typeName() + " @" + this.stream.pos;
            if (this.length >= 0) {
                g += "+"
            }
            g += this.length;
            if (this.tag & 32) {
                g += " (constructed)"
            } else {
                if (((this.tag == 3) || (this.tag == 4)) && (this.sub !== null)) {
                    g += " (encapsulates)"
                }
            }
            g += "\n";
            if (this.sub !== null) {
                i += "  ";
                for (var h = 0,
                         j = this.sub.length; h < j; ++h) {
                    g += this.sub[h].toPrettyString(i)
                }
            }
            return g
        };
        a.prototype.toDOM = function () {
            var l = b.tag("div", "node");
            l.asn1 = this;
            var p = b.tag("div", "head");
            var n = this.typeName().replace(/_/g, " ");
            p.innerHTML = n;
            var h = this.content();
            if (h !== null) {
                h = String(h).replace(/</g, "&lt;");
                var i = b.tag("span", "preview");
                i.appendChild(b.text(h));
                p.appendChild(i)
            }
            l.appendChild(p);
            this.node = l;
            this.head = p;
            var o = b.tag("div", "value");
            n = "Offset: " + this.stream.pos + "<br/>";
            n += "Length: " + this.header + "+";
            if (this.length >= 0) {
                n += this.length
            } else {
                n += (-this.length) + " (undefined)"
            }
            if (this.tag & 32) {
                n += "<br/>(constructed)"
            } else {
                if (((this.tag == 3) || (this.tag == 4)) && (this.sub !== null)) {
                    n += "<br/>(encapsulates)"
                }
            }
            if (h !== null) {
                n += "<br/>Value:<br/><b>" + h + "</b>";
                if ((typeof oids === "object") && (this.tag == 6)) {
                    var k = oids[h];
                    if (k) {
                        if (k.d) {
                            n += "<br/>" + k.d
                        }
                        if (k.c) {
                            n += "<br/>" + k.c
                        }
                        if (k.w) {
                            n += "<br/>(warning!)"
                        }
                    }
                }
            }
            o.innerHTML = n;
            l.appendChild(o);
            var m = b.tag("div", "sub");
            if (this.sub !== null) {
                for (var j = 0,
                         g = this.sub.length; j < g; ++j) {
                    m.appendChild(this.sub[j].toDOM())
                }
            }
            l.appendChild(m);
            p.onclick = function () {
                l.className = (l.className == "node collapsed") ? "node" : "node collapsed"
            };
            return l
        };
        a.prototype.posStart = function () {
            return this.stream.pos
        };
        a.prototype.posContent = function () {
            return this.stream.pos + this.header
        };
        a.prototype.posEnd = function () {
            return this.stream.pos + this.header + Math.abs(this.length)
        };
        a.prototype.fakeHover = function (g) {
            this.node.className += " hover";
            if (g) {
                this.head.className += " hover"
            }
        };
        a.prototype.fakeOut = function (g) {
            var h = / ?hover/;
            this.node.className = this.node.className.replace(h, "");
            if (g) {
                this.head.className = this.head.className.replace(h, "")
            }
        };
        a.prototype.toHexDOM_sub = function (i, j, h, g, l) {
            if (g >= l) {
                return
            }
            var k = b.tag("span", j);
            k.appendChild(b.text(h.hexDump(g, l)));
            i.appendChild(k)
        };
        a.prototype.toHexDOM = function (k) {
            var h = b.tag("span", "hex");
            if (k === d) {
                k = h
            }
            this.head.hexNode = h;
            this.head.onmouseover = function () {
                this.hexNode.className = "hexCurrent"
            };
            this.head.onmouseout = function () {
                this.hexNode.className = "hex"
            };
            h.asn1 = this;
            h.onmouseover = function () {
                var m = !k.selected;
                if (m) {
                    k.selected = this.asn1;
                    this.className = "hexCurrent"
                }
                this.asn1.fakeHover(m)
            };
            h.onmouseout = function () {
                var m = (k.selected == this.asn1);
                this.asn1.fakeOut(m);
                if (m) {
                    k.selected = null;
                    this.className = "hex"
                }
            };
            this.toHexDOM_sub(h, "tag", this.stream, this.posStart(), this.posStart() + 1);
            this.toHexDOM_sub(h, (this.length >= 0) ? "dlen" : "ulen", this.stream, this.posStart() + 1, this.posContent());
            if (this.sub === null) {
                h.appendChild(b.text(this.stream.hexDump(this.posContent(), this.posEnd())))
            } else {
                if (this.sub.length > 0) {
                    var g = this.sub[0];
                    var i = this.sub[this.sub.length - 1];
                    this.toHexDOM_sub(h, "intro", this.stream, this.posContent(), g.posStart());
                    for (var j = 0,
                             l = this.sub.length; j < l; ++j) {
                        h.appendChild(this.sub[j].toHexDOM(k))
                    }
                    this.toHexDOM_sub(h, "outro", this.stream, i.posEnd(), this.posEnd())
                }
            }
            return h
        };
        a.prototype.toHexString = function (g) {
            return this.stream.hexDump(this.posStart(), this.posEnd(), true)
        };
        a.decodeLength = function (g) {
            var i = g.get(),
                j = i & 127;
            if (j == i) {
                return j
            }
            if (j > 3) {
                throw "Length over 24 bits not supported at position " + (g.pos - 1)
            }
            if (j === 0) {
                return -1
            }
            i = 0;
            for (var h = 0; h < j; ++h) {
                i = (i << 8) | g.get()
            }
            return i
        };
        a.hasContent = function (l, m, g) {
            if (l & 32) {
                return true
            }
            if ((l < 3) || (l > 4)) {
                return false
            }
            var h = new c(g);
            if (l == 3) {
                h.get()
            }
            var i = h.get();
            if ((i >> 6) & 1) {
                return false
            }
            try {
                var j = a.decodeLength(h);
                return ((h.pos - g.pos) + j == m)
            } catch (k) {
                return false
            }
        };
        a.decode = function (p) {
            if (!(p instanceof c)) {
                p = new c(p, 0)
            }
            var g = new c(p),
                n = p.get(),
                i = a.decodeLength(p),
                j = p.pos - g.pos,
                m = null;
            if (a.hasContent(n, i, p)) {
                var l = p.pos;
                if (n == 3) {
                    p.get()
                }
                m = [];
                if (i >= 0) {
                    var k = l + i;
                    while (p.pos < k) {
                        m[m.length] = a.decode(p)
                    }
                    if (p.pos != k) {
                        throw "Content size is not correct for container starting at offset " + l
                    }
                } else {
                    try {
                        for (; ;) {
                            var o = a.decode(p);
                            if (o.tag === 0) {
                                break
                            }
                            m[m.length] = o
                        }
                        i = l - p.pos
                    } catch (h) {
                        throw "Exception while decoding undefined length content: " + h
                    }
                }
            } else {
                p.pos += i
            }
            return new a(g, j, i, n, m)
        };
        a.test = function () {
            var g = [{
                value: [39],
                expected: 39
            },
                {
                    value: [129, 201],
                    expected: 201
                },
                {
                    value: [131, 254, 220, 186],
                    expected: 16702650
                }];
            for (var j = 0,
                     l = g.length; j < l; ++j) {
                var h = 0,
                    i = new c(g[j].value, 0),
                    k = a.decodeLength(i);
                if (k != g[j].expected) {
                    document.write("In test[" + j + "] expected " + g[j].expected + " got " + k + "\n")
                }
            }
        };
        window.ASN1 = a
    })();
ASN1.prototype.getHexStringValue = function() {
   var b = this.toHexString();
   var a = this.header * 2;
   var c = this.length * 2;
   return b.substr(a, c)
};
    b5.prototype.parseKey = function (a) {
        try {
            var d = 0;
            var o = 0;
            var i = /^\s*(?:[0-9A-Fa-f][0-9A-Fa-f]\s*)+$/;
            var f = i.test(a) ? Hex.decode(a) : Base64.unarmor(a);
            var n = ASN1.decode(f);
            if (n.sub.length === 9) {
                d = n.sub[1].getHexStringValue();
                this.n = d9(d, 16);
                o = n.sub[2].getHexStringValue();
                this.e = parseInt(o, 16);
                var l = n.sub[3].getHexStringValue();
                this.d = d9(l, 16);
                var j = n.sub[4].getHexStringValue();
                this.p = d9(j, 16);
                var k = n.sub[5].getHexStringValue();
                this.q = d9(k, 16);
                var e = n.sub[6].getHexStringValue();
                this.dmp1 = d9(e, 16);
                var c = n.sub[7].getHexStringValue();
                this.dmq1 = d9(c, 16);
                var m = n.sub[8].getHexStringValue();
                this.coeff = d9(m, 16)
            } else {
                if (n.sub.length === 2) {
                    var g = n.sub[1];
                    var b = g.sub[0];
                    d = b.sub[0].getHexStringValue();
                    this.n = d9(d, 16);
                    o = b.sub[1].getHexStringValue();
                    this.e = parseInt(o, 16)
                } else {
                    return false
                }
            }
            return true
        } catch (h) {
            return false
        }
    };
    b5.prototype.getPublicBaseKey = function () {
        var b = {
            array: [new KJUR.asn1.DERObjectIdentifier({
                oid: "1.2.840.113549.1.1.1"
            }), new KJUR.asn1.DERNull()]
        };
        var d = new KJUR.asn1.DERSequence(b);
        b = {
            array: [new KJUR.asn1.DERInteger({
                bigint: this.n
            }), new KJUR.asn1.DERInteger({
                "int": this.e
            })]
        };
        var c = new KJUR.asn1.DERSequence(b);
        b = {
            hex: "00" + c.getEncodedHex()
        };
        var a = new KJUR.asn1.DERBitString(b);
        b = {
            array: [d, a]
        };
        var e = new KJUR.asn1.DERSequence(b);
        return e.getEncodedHex()
    };
    b5.prototype.getPublicBaseKeyB64 = function () {
        return cF(this.getPublicBaseKey())
    };
    b5.prototype.wordwrap = function (a, b) {
        b = b || 64;
        if (!a) {
            return a
        }
        var c = "(.{1," + b + "})( +|$\n?)|(.{1," + b + "})";
        return a.match(RegExp(c, "g")).join("\n")
    };
    b5.prototype.getPublicKey = function () {
        var a = "-----BEGIN PUBLIC KEY-----\n";
        a += this.wordwrap(this.getPublicBaseKeyB64()) + "\n";
        a += "-----END PUBLIC KEY-----";
        return a
    };
    b5.prototype.hasPublicKeyProperty = function (a) {
        a = a || {};
        return (a.hasOwnProperty("n") && a.hasOwnProperty("e"))
    };
    b5.prototype.parsePropertiesFrom = function (a) {
        this.n = a.n;
        this.e = a.e;
        if (a.hasOwnProperty("d")) {
            this.d = a.d;
            this.p = a.p;
            this.q = a.q;
            this.dmp1 = a.dmp1;
            this.dmq1 = a.dmq1;
            this.coeff = a.coeff
        }
    };
    var eg = function (a) {
        b5.call(this);
        if (a) {
            if (typeof a === "string") {
                this.parseKey(a)
            } else {
                if (this.hasPublicKeyProperty(a)) {
                    this.parsePropertiesFrom(a)
                }
            }
        }
    };
    eg.prototype = new b5();
    eg.prototype.constructor = eg;
    var ea = function (a) {
        a = a || {};
        this.default_key_size = parseInt(a.default_key_size) || 1024;
        this.default_public_exponent = a.default_public_exponent || "010001";
        this.log = a.log || false;
        this.key = null
    };
    ea.prototype.setKey = function (a) {
        if (this.log && this.key) {
            console.warn("A key was already set, overriding existing.")
        }
        this.key = new eg(a)
    };
    ea.prototype.setPublicKey = function (a) {
        this.setKey(a)
    };
    ea.prototype.decrypt = function (a) {
        try {
            return this.getKey().decrypt(ci(a))
        } catch (b) {
            return false
        }
    };
    ea.prototype.encrypt = function (a) {
        try {
            return cF(this.getKey().encrypt(a))
        } catch (b) {
            return false
        }
    };
    ea.prototype.getKey = function (a) {
        if (!this.key) {
            this.key = new eg();
            if (a && {}.toString.call(a) === "[object Function]") {
                this.key.generateAsync(this.default_key_size, this.default_public_exponent, a);
                return
            }
            this.key.generate(this.default_key_size, this.default_public_exponent)
        }
        return this.key
    };
    ea.prototype.getPublicKey = function () {
        return this.getKey().getPublicKey()
    };
    ea.prototype.getPublicKeyB64 = function () {
        return this.getKey().getPublicBaseKeyB64()
    };
    a6.JSEncrypt = ea
})(JSEncryptExports);
var JSEncrypt = JSEncryptExports.JSEncrypt;

function getEncryptedData(username, password) {
    var pubkey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDXQG8rnxhslm+2f7Epu3bB0inrnCaTHhUQCYE+2X+qWQgcpn+Hvwyks3A67mvkIcyvV0ED3HFDf+ANoMWV1Ex56dKqOmSUmjrk7s5cjQeiIsxX7Q3hSzO61/kLpKNH+NE6iAPpm96Fg15rCjbm+5rR96DhLNG7zt2JgOd2o1wXkQIDAQAB"
    var i = new JSEncrypt();
    i.setPublicKey(pubkey);
    result = {
        encryptedUsername: i.encrypt(username),
        encryptedPassword: i.encrypt(password)
    }
    return result
}

// 测试样例
// console.log(getEncryptedData("15576767676", "12345678"))