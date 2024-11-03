const pi = Math.PI;
const hpi = pi / 2;

let sfycache = new Map();
let sfxcache = new Map();

function hexToRgb(hex)
{
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

function rgbToHsv(color)
{
    [r, g, b] = color;

    r /= 255, g /= 255, b /= 255;

    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if (max == min) {
        h = 0; // achromatic
    } else {
        switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
    }

    return [ h, s, v ];
}

function hsvToRgb(color)
{
    [h, s, v] = color;

    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [ r * 255, g * 255, b * 255 ];
}

function setColorForCoord(imgDataData, x, y, color)
{
    const red = y * (1000 * 4) + x * 4;

    imgDataData[red] = color[0];
    imgDataData[red + 1] = color[1];
    imgDataData[red + 2] = color[2];
    imgDataData[red + 3] = 255;
}

function interpolate(A, B, p, w)
{
    // p = part, w = whole

    return A * (p/w) + B * (1 - (p/w));
}

function hueInterpolate(A, B, p, w)
{
    if (A == B) return A;

    let d = p/w;

    let cw, ccw;
    let cws, ccws;
    let cwe, ccwe;

    if (A > B)
    {
        s = A;
        cwe = B + 1;
        
        s = A;
        ccwe = B;
    }
    else
    {
        s = B;
        cwe = A + 1;

        s = B;
        ccwe = A;
    }

    cw = cwe - s;
    ccw = ccwe - s;

    let r;
    if (cw < ccw)
    {
        if (s < cwe)
            r = interpolate(s, cwe, p, w);
        else
            r = interpolate(cwe, s, p, w);
    }
    else
        if (s < ccwe)
            r = interpolate(s, ccwe, p, w);
        else
            r = interpolate(ccwe, s, p, w);
    
    r -= Math.floor(r);

    return r;
}

function colorInterpolate(A, B, p, w)
{
    //console.log("CI", p/w);

    let h = hueInterpolate(A[0], B[0], p, w);
    //let h =    interpolate(A[0], B[0], p, w);
    let s =    interpolate(A[1], B[1], p, w);
    let v =    interpolate(A[2], B[2], p, w);

    return [h, s, v];
}

function getMidpointColor(A, B)
{
    return colorInterpolate(A, B, 1, 2);
}

// currently unused
function mod(x, y)
{
    return x - y * Math.floor(x / y);
}

function arclength(f, a, b)
{
    let n = 10;
    let d = (b - a) / n;
    let dd = d * d;
    let r = 0;
    for (let i = 1; i <= n; i++)
    {
        let x2 = a + d * i;
        let x1 = a + d * (i - 1);
        let dy = f(x2) - f(x1);
        let c = Math.sqrt(dd + dy * dy);
        r += c;
    }
    return r;
}
            
var gradientAlgorithms =
{
    sine:
        function (x, y, width, colors, imgDataData)
        {
            let xt = ((x / width) - 0.5) * Math.PI;
            let yt = (250 - y) / 250;

            let N, S;

            if (colors.length > 4)
            {
                N = colors[4];
                S = colors[5];
            }
            else
            {
                N = getMidpointColor(colors[2], colors[0]);
                S = getMidpointColor(colors[3], colors[1]);
            }

            // center
            if (xt == 0)
            {
                let c = colorInterpolate(N, S, 1 - yt, 2); // 0..2
                setColorForCoord(imgDataData, x, y, hsvToRgb(c));
                return;
            }

            let k = yt / Math.sin(xt);
            
            let y1 = k * Math.sin(-Math.PI / 2);

            let cs, ce, sp, sf, c;

            if (y1 >= -1 && y1 <= 1)
            {
                cs = colorInterpolate(colors[2], colors[3], 1 - y1, 2); // 0..2
                ce = colorInterpolate(colors[1], colors[0], 1 - y1, 2);

                //console.log(cs[0]);

                sp = arclength(n => k * Math.sin(n), -Math.PI / 2, xt);
                
                sf = sfycache.get(y1) || sfycache.get(-y1);
                if (!sf)
                {
                    sf = arclength(n => k * Math.sin(n), -Math.PI / 2, Math.PI / 2);
                    sfycache.set(y1, sf);
                    sfycache.set(-y1, sf);
                }

                //c = colorInterpolate(cs, ce, sp, sf);
            }
            else
            {
                let x1 = Math.asin(1 / k);
                
                //if (Math.abs(xt - 0.1) < 0.1 && Math.abs(yt - 0.2) < 0.1)
                //    console.log(xt, xt);

                cs = colorInterpolate(colors[2], colors[0], Math.PI / 2 + x1, Math.PI); // 0..π
                ce = colorInterpolate(colors[1], colors[3], Math.PI / 2 + x1, Math.PI); 

                // make sure x1 is smaller than x2
                //if (x2 < x1) [x2, x1] = [x1, x2];

                sp = arclength(n => k * Math.sin(n), x1, xt);

                sf = sfycache.get(x1) || sfycache.get(-x1);
                if (!sf)
                {
                    sf = arclength(n => k * Math.sin(n), x1, -x1);
                    sfxcache.set(x1, sf);
                    sfxcache.set(-x1, sf);
                }

            }
            
            c = colorInterpolate(cs, ce, sp, sf);
            if (c)
            {
                setColorForCoord(imgDataData, x, y, hsvToRgb(c));
                //console.log(xt, yt, c);
            }
        },
    sine2:
        function (x, y, width, colors, imgDataData)
        {
            let xt = ((x / width) - 0.5) * Math.PI;
            let yt = (250 - y) / 250;

            // center
            if (xt == 0)
            {
                let c = colorInterpolate(N, S, 1 - yt, 2); // 0..2
                setColorForCoord(x, y, hsvToRgb(c));
                return;
            }
            
            // for Qs var
            let xq = (xt > 0 ? 0 : 1);
            let yq = (yt > 0 ? 0 : 1);

            // corner color
            let cc = Qs[xq][yq][0];

            // x and y axis end colors
            let xc = Qs[xq][yq][1][0];
            let yc = Qs[xq][yq][1][1];

            let cs, ce, sp, sf;
            let c1, c2, c;

            let k = yt / Math.sin(xt);
            let k2 = (2 * xt) / (pi * Math.sin((pi / 2) * yt));

            let y1 = k * Math.sin(pi / 2);

            if (y1 >= -1 && y1 <= 1)
            {
                ce = colorInterpolate(xc, cc, Math.abs(y1), 1); // 0..2

                sp = arclength(n => k * Math.sin(n), 0, Math.abs(xt));
                sf = arclength(n => k * Math.sin(n), 0, pi / 2);
                
                c1 = colorInterpolate(M, ce, sp, sf);
            }
            else
            {
                let x2 = Math.asin(1 / k);
                ce = colorInterpolate(yc, cc, Math.abs(x2), pi / 2);

                sp = arclength(n => k * Math.sin(n), 0, Math.abs(x2));
                sf = arclength(n => k * Math.sin(n), 0, xt);
                
                c1 = colorInterpolate(M, ce, sp, sf);
            }

            let x1 = k2 * pi * Math.sin(0.5 * pi * 1) * 0.5; // 1 = y

            if (x1 >= -hpi && x1 <= hpi)
            {
                ce = colorInterpolate(yc, cc, Math.abs(x1), hpi); // 0..2

                sp = arclength(n => (2 / pi) * Math.asin((2 * n) / (pi * k2)), 0, Math.abs(xt));
                sf = arclength(n => (2 / pi) * Math.asin((2 * n) / (pi * k2)), 0, x1);
                
                c2 = colorInterpolate(M, ce, sp, sf);

                
                sf = sfycache.get(y1) || sfycache.get(-y1);
                if (!sf)
                {
                    //sf = arclength(n => k * Math.sin(n), -Math.PI / 2, Math.PI / 2);
                    sfycache.set(y1, sf);
                    sfycache.set(-y1, sf);
                }

                //c = colorInterpolate(cs, ce, sp, sf);
            }
            else
            {
                let y2 = (2 / pi) * Math.asin(1 / k2); // simplified
                ce = colorInterpolate(yc, cc, Math.abs(y2), 1); // 0..2

                sp = arclength(n => (2 / pi) * Math.asin((2 * n) / (pi * k2)), 0, Math.abs(y2));
                sf = arclength(n => (2 / pi) * Math.asin((2 * n) / (pi * k2)), 0, yt);
                
                c2 = colorInterpolate(M, ce, sp, sf);

                //c = colorInterpolate(cs, ce, sp, sf);
            }
            
            c = getMidpointColor(c1, c2);

            if (c)
            {
                setColorForCoord(imgDataData, x, y, hsvToRgb(c));
                //console.log(xt, yt, c);
            }
        },
    circle:
        function (x, y, width, colors, imgDataData)
        {
            // not finished 
            
            // get edge midpoint colors

            let N, S, E, W, M;
            N = getMidpointColor(colors[2], colors[0]);
            S = getMidpointColor(colors[3], colors[1]);
            E = getMidpointColor(colors[0], colors[1]);
            W = getMidpointColor(colors[2], colors[3]);

            M = getMidpointColor(getMidpointColor(N, S), getMidpointColor(E, W));

            // h|wv "h|w value" = (h|w)^2 / 4
            // x|ya = x|y translated so that center is at origin

            let hv = 500 * 500 / 4;
            let wv = width * width / 4;

            // hh|w = half height|width
            let hh = 250;
            let hw = width / 2;

            // points with center translated to origin
            let xa = x - width / 2;
            let ya = 250 - y;

            // radius
            let r = Math.sqrt(xa * xa + ya * ya);

            // x and y intercepts (with axes or borders)
            let xi, yi;

            // color start, end
            let cs, ce;

            // also need thetas for top point (yi) and current point
            let theta, thetaTop, thetaBottom;
            let startTheta, endTheta;

            // find values
            let deltaTheta, fullTheta;
            
            // start, end, by end angle
            var edges =
            {
                [hpi]:  [[E, colors[0]], [N, colors[0]]],
                [pi]:   [[colors[2], W], [N, colors[2]]],
                [-pi]:  [[W, colors[3]], [S, colors[3]]],
                [-hpi]: [[colors[1], E], [S, colors[1]]]
            };

            
            edges =
            {
                [hpi]:  [[E, colors[0]], [N, colors[0]]],
                [pi]:   [[W, colors[2]], [N, colors[2]]],
                [-pi]:  [[W, colors[3]], [S, colors[3]]],
                [-hpi]: [[E, colors[1]], [S, colors[1]]]
            };

            // by end theta
            const xyse =
            {
                [hpi]:  ["start", "end"],
                [pi]:   ["end", "start"],
                [-pi]:  ["end", "start"],
                [-hpi]: ["start", "end"]
            };
            
            const full =
            {
                0: hw,
                [hpi]: hh,
                [pi]: hw,
                [-pi]: hw,
                [-hpi]: hh
            };
            
            const dirs =
            {
                0: E,
                [hpi]: N,
                [pi]: W,
                [-pi]: W,
                [-hpi]: S
            };

            // atan2 func by end angle
            const funcs =
            {
                [hpi]: Math.atan2,
                [pi]: (b,a)=>Math.atan2(a,b),
                [-pi]: (b,a)=>Math.atan2(a,b),
                [-hpi]: Math.atan2
            };

            // according to end theta
            // constant to scale (mirror) to first quadrant
            const scaleConstants =
                {
                    [pi]: [-1, 1],
                    [hpi]: [1, 1],
                    [-pi]: [-1, -1],
                    [-hpi]: [1, -1]
                };

            // everything else follows
            theta = Math.atan2(ya, xa);

            const absfloor = n => Math.floor(Math.abs(n)) * Math.sign(n);
            const absceil = n => Math.ceil(Math.abs(n)) * Math.sign(n);

            // object to hold start and end info
            let th =
                {
                    start: {},
                    end: {}
                }

            let thstart = absfloor(theta / hpi) * hpi;
            let thend = absceil(theta / hpi) * hpi;

            th.start.ang = thstart;
            th.end.ang = thend;

            // handle axes
            if (thstart == thend)
            {
                let v, f;
                if (th.start % Math.PI == 0)
                {
                    v = x;
                    f = 1000;
                    cs = W;
                    ce = E;
                }
                else
                {
                    v = y;
                    f = 500;
                    cs = N;
                    ce = S;
                }
                setColorForCoord(imgDataData, x, y, hsvToRgb(colorInterpolate(cs, ce, v, f)));
                return;
            }

            if ([50, -50].includes(xa) && [50, -50, 225, -225].includes(ya))
                console.log(theta, xa, ya);
            
            // reflect coords and theta 
            let scx = scaleConstants[thend][0];
            let scy = scaleConstants[thend][1];
            
            let xang = xyse[thend][0];
            let yang = xyse[thend][1];

            let xe = edges[thend][0];
            let ye = edges[thend][1];

            if (r < hw)
                th[xang].color = colorInterpolate(M, dirs[thend], r, hw);
            else
            {
                let int = Math.sqrt(r * r - hw * hw);

                th[xang].ang = Math.atan2(int * scy, hw * scx); //funcs[endTheta](int, hw);

                // "x edge" is parallel to the y-axis
                th[xang].color = colorInterpolate(xe[0], xe[1], int, hh);
            }

            if (r < hh)
                th[yang].color = colorInterpolate(M, dirs[thend], r, hh);
            else
            {
                let int = Math.sqrt(r * r - hh * hh);

                th[yang].ang = Math.atan2(hh * scy, int * scx); //funcs[endTheta](hh, int);

                th[yang].color = colorInterpolate(ye[0], ye[1], int, hw);
            }

            // endTheta - theta?
            deltaTheta = theta - th.start.ang;
            fullTheta = th.end.ang - th.start.ang;

            let c = colorInterpolate(th.start.color, th.end.color, deltaTheta, fullTheta);

            if ([50, -50].includes(xa) && [50, -50, 225, -225].includes(ya))
            {
                console.log(th.start, th.end);
                console.log(fullTheta, deltaTheta);
                console.log(theta);
                setColorForCoord(imgDataData, x, y, [0, 0, 0]);
            }
            else
                setColorForCoord(imgDataData, x, y, hsvToRgb(c));
        },
    bilinear:
        function (x, y, width, colors, imgDataData)
        {
            // Hue(E) = ( Hue(B)*y/a + Hue(A)*(1-y/a) ) * (x/a)  + 
            //      ( Hue(D)*y/a + Hue(C)*(1-y/a) ) * (1-x/a)
            if (colors.length == 6)
            {

                if (x < 500)
                {
                    var h = (colors[5][0] * y / 500 + colors[4][0] * (1 - y / 500)) * (x / 500) +
                            ((colors[3][0] * y / 500) + colors[2][0] * (1 - y / 500)) * (1 - x / 500);

                    var s = (colors[5][1] * y / 500 + colors[4][1] * (1 - y / 500)) * (x / 500) +
                            ((colors[3][1] * y / 500) + colors[2][1] * (1 - y / 500)) * (1 - x / 500);

                    var v = (colors[5][2] * y / 500 + colors[4][2] * (1 - y / 500)) * (x / 500) +
                            ((colors[3][2] * y / 500) + colors[2][2] * (1 - y / 500)) * (1 - x / 500);

                    // set color on c1
                    setColorForCoord(imgDataData, x, y, hsvToRgb([h, s, v]));
                }
                else
                {
                    h = (colors[1][0] * y / 500 + colors[0][0] * (1 - y / 500)) * ((x - 500) / 500) +
                        ((colors[5][0] * y / 500) + colors[4][0] * (1 - y / 500)) * (1 - (x - 500) / 500);

                    s = (colors[1][1] * y / 500 + colors[0][1] * (1 - y / 500)) * ((x - 500) / 500) +
                        ((colors[5][1] * y / 500) + colors[4][1] * (1 - y / 500)) * (1 - (x - 500) / 500);

                    v = (colors[1][2] * y / 500 + colors[0][2] * (1 - y / 500)) * ((x - 500) / 500) +
                        ((colors[5][2] * y / 500) + colors[4][2] * (1 - y / 500)) * (1 - (x - 500) / 500);
                            
                    
                    // set color on c1
                    setColorForCoord(imgDataData, x, y, hsvToRgb([h, s, v]));    
                }

            }
            else
            {
                var h = (colors[1][0] * y / 500 + colors[0][0] * (1 - y / 500)) * (x / width) +
                        ((colors[3][0] * y / 500) + colors[2][0] * (1 - y / 500)) * (1 - x / width);

                var s = (colors[1][1] * y / 500 + colors[0][1] * (1 - y / 500)) * (x / width) +
                        ((colors[3][1] * y / 500) + colors[2][1] * (1 - y / 500)) * (1 - x / width);

                var v = (colors[1][2] * y / 500 + colors[0][2] * (1 - y / 500)) * (x / width) +
                        ((colors[3][2] * y / 500) + colors[2][2] * (1 - y / 500)) * (1 - x / width);

                // set color on c1
                setColorForCoord(imgDataData, x, y, hsvToRgb([h, s, v]));
            }
        },
    l2norm:
        function (x, y, width, colors, imgDataData)
        {
            // L2 norm?

            // may use 4 or 6 of these
            let p = [[1, 0], [1, 1], [0, 0], [0, 1], [0.5, 0], [0.5, 1]];
            let d = [];
            for (let i = 0; i < colors.length; i++)
            {
                d[i] = Math.sqrt(Math.pow(p[i][0]-(x/width), 2) + Math.pow(p[i][1]-(y/500), 2));
            }

            //console.log(d);

            // corner?
            if (d.includes(0))
            {
                let i = d.indexOf(0);
                h = colors[i][0];
                s = colors[i][1];
                v = colors[i][2];
            }
            else
            {
                let d_sum = d.reduce( (a,c) => a + 1/c, 0 );

                h = d.reduce( (a,c,i) => a + colors[i][0] * 1/c, 0 ) / d_sum;
                s = d.reduce( (a,c,i) => a + colors[i][1] * 1/c, 0 ) / d_sum;
                v = d.reduce( (a,c,i) => a + colors[i][2] * 1/c, 0 ) / d_sum;
            }

            // set color on c2
            setColorForCoord(imgDataData, x, y, hsvToRgb([h, s, v]));
        },
    l1norm:
        function (x, y, width, colors, imgDataData)
        {
            let p = [[1, 0], [1, 1], [0, 0], [0, 1], [0.5, 0], [0.5, 1]];
            let d = [];
            for (let i = 0; i < colors.length; i++)
            {
                d[i] = Math.abs(p[i][0]-(x/width)) + Math.abs(p[i][1]-(y/500));
            }

            //console.log(d);

            // corner?
            if (d.includes(0))
            {
                let i = d.indexOf(0);
                h = colors[i][0];
                s = colors[i][1];
                v = colors[i][2];
            }
            else
            {
                let d_sum = d.reduce( (a,c) => a + 1/c, 0 );

                h = d.reduce( (a,c,i) => a + colors[i][0] * 1/c, 0 ) / d_sum;
                s = d.reduce( (a,c,i) => a + colors[i][1] * 1/c, 0 ) / d_sum;
                v = d.reduce( (a,c,i) => a + colors[i][2] * 1/c, 0 ) / d_sum;
            }

            //console.log(h,s,v);

            // set color on c2
            setColorForCoord(imgDataData, x, y, hsvToRgb([h, s, v]));
        }
    }