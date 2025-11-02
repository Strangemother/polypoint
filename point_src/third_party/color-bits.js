/**
 * color-bits v1.1.1
 * High performance color library
 * 
 * @source https://github.com/romgrk/color-bits
 * @license ISC
 * 
 * This is a bundled version of the library for use in this project.
 * See the original repository for full documentation and source code.
 * 
 * Usage:
 *   <script src="./point_src/third_party/color-bits.js"></script>
 *   <script>
 *     // Access via global colorBits object
 *     const color = colorBits.rgb(255, 0, 0);
 *   </script>
 */

"use strict";
var colorBits = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // node_modules/.pnpm/color-bits@1.1.1/node_modules/color-bits/build/bit.js
  var require_bit = __commonJS({
    "node_modules/.pnpm/color-bits@1.1.1/node_modules/color-bits/build/bit.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.cast = cast;
      exports.get = get;
      exports.set = set;
      var INT32_TO_UINT32_OFFSET = 2 ** 32;
      function cast(n) {
        if (n < 0) {
          return n + INT32_TO_UINT32_OFFSET;
        }
        return n;
      }
      function get(n, offset) {
        return n >> offset & 255;
      }
      function set(n, offset, byte) {
        return n ^ (n ^ byte << offset) & 255 << offset;
      }
    }
  });

  // node_modules/.pnpm/color-bits@1.1.1/node_modules/color-bits/build/core.js
  var require_core = __commonJS({
    "node_modules/.pnpm/color-bits@1.1.1/node_modules/color-bits/build/core.js"(exports) {
      "use strict";
      var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      }) : (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      }));
      var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }) : function(o, v) {
        o["default"] = v;
      });
      var __importStar = exports && exports.__importStar || function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        }
        __setModuleDefault(result, mod);
        return result;
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.OFFSET_A = exports.OFFSET_B = exports.OFFSET_G = exports.OFFSET_R = void 0;
      exports.newColor = newColor;
      exports.from = from;
      exports.toNumber = toNumber;
      exports.getRed = getRed;
      exports.getGreen = getGreen;
      exports.getBlue = getBlue;
      exports.getAlpha = getAlpha;
      exports.setRed = setRed;
      exports.setGreen = setGreen;
      exports.setBlue = setBlue;
      exports.setAlpha = setAlpha;
      var bit = __importStar(require_bit());
      var { cast, get, set } = bit;
      exports.OFFSET_R = 24;
      exports.OFFSET_G = 16;
      exports.OFFSET_B = 8;
      exports.OFFSET_A = 0;
      function newColor(r, g, b, a) {
        return (r << exports.OFFSET_R) + (g << exports.OFFSET_G) + (b << exports.OFFSET_B) + (a << exports.OFFSET_A);
      }
      function from(color) {
        return newColor(get(color, exports.OFFSET_R), get(color, exports.OFFSET_G), get(color, exports.OFFSET_B), get(color, exports.OFFSET_A));
      }
      function toNumber(color) {
        return cast(color);
      }
      function getRed(c) {
        return get(c, exports.OFFSET_R);
      }
      function getGreen(c) {
        return get(c, exports.OFFSET_G);
      }
      function getBlue(c) {
        return get(c, exports.OFFSET_B);
      }
      function getAlpha(c) {
        return get(c, exports.OFFSET_A);
      }
      function setRed(c, value) {
        return set(c, exports.OFFSET_R, value);
      }
      function setGreen(c, value) {
        return set(c, exports.OFFSET_G, value);
      }
      function setBlue(c, value) {
        return set(c, exports.OFFSET_B, value);
      }
      function setAlpha(c, value) {
        return set(c, exports.OFFSET_A, value);
      }
    }
  });

  // node_modules/.pnpm/color-bits@1.1.1/node_modules/color-bits/build/convert.js
  var require_convert = __commonJS({
    "node_modules/.pnpm/color-bits@1.1.1/node_modules/color-bits/build/convert.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.labToXyzd50 = labToXyzd50;
      exports.xyzd50ToLab = xyzd50ToLab;
      exports.oklabToXyzd65 = oklabToXyzd65;
      exports.xyzd65ToOklab = xyzd65ToOklab;
      exports.lchToLab = lchToLab;
      exports.labToLch = labToLch;
      exports.displayP3ToXyzd50 = displayP3ToXyzd50;
      exports.xyzd50ToDisplayP3 = xyzd50ToDisplayP3;
      exports.proPhotoToXyzd50 = proPhotoToXyzd50;
      exports.xyzd50ToProPhoto = xyzd50ToProPhoto;
      exports.adobeRGBToXyzd50 = adobeRGBToXyzd50;
      exports.xyzd50ToAdobeRGB = xyzd50ToAdobeRGB;
      exports.rec2020ToXyzd50 = rec2020ToXyzd50;
      exports.xyzd50ToRec2020 = xyzd50ToRec2020;
      exports.xyzd50ToD65 = xyzd50ToD65;
      exports.xyzd65ToD50 = xyzd65ToD50;
      exports.xyzd65TosRGBLinear = xyzd65TosRGBLinear;
      exports.xyzd50TosRGBLinear = xyzd50TosRGBLinear;
      exports.srgbLinearToXyzd50 = srgbLinearToXyzd50;
      exports.srgbToXyzd50 = srgbToXyzd50;
      exports.xyzd50ToSrgb = xyzd50ToSrgb;
      exports.oklchToXyzd50 = oklchToXyzd50;
      exports.xyzd50ToOklch = xyzd50ToOklch;
      var D50_X = 0.9642;
      var D50_Y = 1;
      var D50_Z = 0.8251;
      function multiply(matrix, other) {
        const dst = [0, 0, 0];
        for (let row = 0; row < 3; ++row) {
          dst[row] = matrix[row][0] * other[0] + matrix[row][1] * other[1] + matrix[row][2] * other[2];
        }
        return dst;
      }
      var TransferFunction = class {
        constructor(g, a, b = 0, c = 0, d = 0, e = 0, f = 0) {
          __publicField(this, "g");
          __publicField(this, "a");
          __publicField(this, "b");
          __publicField(this, "c");
          __publicField(this, "d");
          __publicField(this, "e");
          __publicField(this, "f");
          this.g = g;
          this.a = a;
          this.b = b;
          this.c = c;
          this.d = d;
          this.e = e;
          this.f = f;
        }
        eval(val) {
          const sign = val < 0 ? -1 : 1;
          const abs = val * sign;
          if (abs < this.d) {
            return sign * (this.c * abs + this.f);
          }
          return sign * (Math.pow(this.a * abs + this.b, this.g) + this.e);
        }
      };
      var NAMED_TRANSFER_FN = {
        sRGB: new TransferFunction(2.4, 1 / 1.055, 0.055 / 1.055, 1 / 12.92, 0.04045, 0, 0),
        sRGB_INVERSE: new TransferFunction(0.416667, 1.13728, -0, 12.92, 31308e-7, -0.0549698, -0),
        proPhotoRGB: new TransferFunction(1.8, 1),
        proPhotoRGB_INVERSE: new TransferFunction(0.555556, 1, -0, 0, 0, 0, 0),
        k2Dot2: new TransferFunction(2.2, 1),
        k2Dot2_INVERSE: new TransferFunction(0.454545, 1),
        rec2020: new TransferFunction(2.22222, 0.909672, 0.0903276, 0.222222, 0.0812429, 0, 0),
        rec2020_INVERSE: new TransferFunction(0.45, 1.23439, -0, 4.5, 0.018054, -0.0993195, -0)
      };
      var NAMED_GAMUTS = {
        sRGB: [
          [0.436065674, 0.385147095, 0.143066406],
          [0.222488403, 0.716873169, 0.06060791],
          [0.013916016, 0.097076416, 0.714096069]
        ],
        sRGB_INVERSE: [
          [3.134112151374599, -1.6173924597114966, -0.4906334036481285],
          [-0.9787872938826594, 1.9162795854799963, 0.0334547139520088],
          [0.07198304248352326, -0.2289858493321844, 1.4053851325241447]
        ],
        displayP3: [
          [0.515102, 0.291965, 0.157153],
          [0.241182, 0.692236, 0.0665819],
          [-104941e-8, 0.0418818, 0.784378]
        ],
        displayP3_INVERSE: [
          [2.404045155982687, -0.9898986932663839, -0.3976317191366333],
          [-0.8422283799266768, 1.7988505115115485, 0.016048170293157416],
          [0.04818705979712955, -0.09737385156228891, 1.2735066448052303]
        ],
        adobeRGB: [
          [0.60974, 0.20528, 0.14919],
          [0.31111, 0.62567, 0.06322],
          [0.01947, 0.06087, 0.74457]
        ],
        adobeRGB_INVERSE: [
          [1.9625385510109137, -0.6106892546501431, -0.3413827467482388],
          [-0.9787580455521, 1.9161624707082339, 0.03341676594241408],
          [0.028696263137883395, -0.1406807819331586, 1.349252109991369]
        ],
        rec2020: [
          [0.673459, 0.165661, 0.1251],
          [0.279033, 0.675338, 0.0456288],
          [-193139e-8, 0.0299794, 0.797162]
        ],
        rec2020_INVERSE: [
          [1.647275201661012, -0.3936024771460771, -0.23598028884792507],
          [-0.6826176165196962, 1.647617775014935, 0.01281626807852422],
          [0.029662725298529837, -0.06291668721366285, 1.2533964313435522]
        ],
        xyz: [
          [1, 0, 0],
          [0, 1, 0],
          [0, 0, 1]
        ]
      };
      function degToRad(deg) {
        return deg * (Math.PI / 180);
      }
      function radToDeg(rad) {
        return rad * (180 / Math.PI);
      }
      function applyTransferFns(fn, r, g, b) {
        return [fn.eval(r), fn.eval(g), fn.eval(b)];
      }
      var OKLAB_TO_LMS_MATRIX = [
        [0.9999999984505198, 0.39633779217376786, 0.2158037580607588],
        [1.0000000088817609, -0.10556134232365635, -0.06385417477170591],
        [1.0000000546724108, -0.08948418209496575, -1.2914855378640917]
      ];
      var LMS_TO_OKLAB_MATRIX = [
        [0.2104542553, 0.7936177849999999, -0.0040720468],
        [1.9779984951000003, -2.4285922049999997, 0.4505937099000001],
        [0.025904037099999982, 0.7827717662, -0.8086757660000001]
      ];
      var XYZ_TO_LMS_MATRIX = [
        [0.8190224432164319, 0.3619062562801221, -0.12887378261216414],
        [0.0329836671980271, 0.9292868468965546, 0.03614466816999844],
        [0.048177199566046255, 0.26423952494422764, 0.6335478258136937]
      ];
      var LMS_TO_XYZ_MATRIX = [
        [1.226879873374156, -0.5578149965554814, 0.2813910501772159],
        [-0.040575762624313734, 1.1122868293970596, -0.07171106666151703],
        [-0.07637294974672144, -0.4214933239627915, 1.586924024427242]
      ];
      var PRO_PHOTO_TO_XYZD50_MATRIX = [
        [0.7976700747153241, 0.13519395152800417, 0.03135596341127167],
        [0.28803902352472205, 0.7118744007923554, 8661179538844252e-20],
        [2739876695467402e-22, -14405226518969991e-22, 0.825211112593861]
      ];
      var XYZD50_TO_PRO_PHOTO_MATRIX = [
        [1.3459533710138858, -0.25561367037652133, -0.051116041522131374],
        [-0.544600415668951, 1.5081687311475767, 0.020535163968720935],
        [-13975622054109725e-22, 2717590904589903e-21, 1.2118111696814942]
      ];
      var XYZD65_TO_XYZD50_MATRIX = [
        [1.0478573189120088, 0.022907374491829943, -0.050162247377152525],
        [0.029570500050499514, 0.9904755577034089, -0.017061518194840468],
        [-0.00924047197558879, 0.015052921526981566, 0.7519708530777581]
      ];
      var XYZD50_TO_XYZD65_MATRIX = [
        [0.9555366447632887, -0.02306009252137888, 0.06321844147263304],
        [-0.028315378228764922, 1.009951351591575, 0.021026001591792402],
        [0.012308773293784308, -0.02050053471777469, 1.3301947294775631]
      ];
      var XYZD65_TO_SRGB_MATRIX = [
        [3.2408089365140573, -1.5375788839307314, -0.4985609572551541],
        [-0.9692732213205414, 1.876110235238969, 0.041560501141251774],
        [0.05567030990267439, -0.2040007921971802, 1.0571046720577026]
      ];
      function labToXyzd50(l, a, b) {
        let y = (l + 16) / 116;
        let x = y + a / 500;
        let z = y - b / 200;
        function labInverseTransferFunction(t) {
          const delta = 24 / 116;
          if (t <= delta) {
            return 108 / 841 * (t - 16 / 116);
          }
          return t * t * t;
        }
        x = labInverseTransferFunction(x) * D50_X;
        y = labInverseTransferFunction(y) * D50_Y;
        z = labInverseTransferFunction(z) * D50_Z;
        return [x, y, z];
      }
      function xyzd50ToLab(x, y, z) {
        function labTransferFunction(t) {
          const deltaLimit = 24 / 116 * (24 / 116) * (24 / 116);
          if (t <= deltaLimit) {
            return 841 / 108 * t + 16 / 116;
          }
          return Math.pow(t, 1 / 3);
        }
        x = labTransferFunction(x / D50_X);
        y = labTransferFunction(y / D50_Y);
        z = labTransferFunction(z / D50_Z);
        const l = 116 * y - 16;
        const a = 500 * (x - y);
        const b = 200 * (y - z);
        return [l, a, b];
      }
      function oklabToXyzd65(l, a, b) {
        const labInput = [l, a, b];
        const lmsIntermediate = multiply(OKLAB_TO_LMS_MATRIX, labInput);
        lmsIntermediate[0] = lmsIntermediate[0] * lmsIntermediate[0] * lmsIntermediate[0];
        lmsIntermediate[1] = lmsIntermediate[1] * lmsIntermediate[1] * lmsIntermediate[1];
        lmsIntermediate[2] = lmsIntermediate[2] * lmsIntermediate[2] * lmsIntermediate[2];
        const xyzOutput = multiply(LMS_TO_XYZ_MATRIX, lmsIntermediate);
        return xyzOutput;
      }
      function xyzd65ToOklab(x, y, z) {
        const xyzInput = [x, y, z];
        const lmsIntermediate = multiply(XYZ_TO_LMS_MATRIX, xyzInput);
        lmsIntermediate[0] = Math.pow(lmsIntermediate[0], 1 / 3);
        lmsIntermediate[1] = Math.pow(lmsIntermediate[1], 1 / 3);
        lmsIntermediate[2] = Math.pow(lmsIntermediate[2], 1 / 3);
        const labOutput = multiply(LMS_TO_OKLAB_MATRIX, lmsIntermediate);
        return [labOutput[0], labOutput[1], labOutput[2]];
      }
      function lchToLab(l, c, h) {
        if (h === void 0) {
          return [l, 0, 0];
        }
        return [l, c * Math.cos(degToRad(h)), c * Math.sin(degToRad(h))];
      }
      function labToLch(l, a, b) {
        return [l, Math.sqrt(a * a + b * b), radToDeg(Math.atan2(b, a))];
      }
      function displayP3ToXyzd50(r, g, b) {
        const [mappedR, mappedG, mappedB] = applyTransferFns(NAMED_TRANSFER_FN.sRGB, r, g, b);
        const rgbInput = [mappedR, mappedG, mappedB];
        const xyzOutput = multiply(NAMED_GAMUTS.displayP3, rgbInput);
        return xyzOutput;
      }
      function xyzd50ToDisplayP3(x, y, z) {
        const xyzInput = [x, y, z];
        const rgbOutput = multiply(NAMED_GAMUTS.displayP3_INVERSE, xyzInput);
        return applyTransferFns(NAMED_TRANSFER_FN.sRGB_INVERSE, rgbOutput[0], rgbOutput[1], rgbOutput[2]);
      }
      function proPhotoToXyzd50(r, g, b) {
        const [mappedR, mappedG, mappedB] = applyTransferFns(NAMED_TRANSFER_FN.proPhotoRGB, r, g, b);
        const rgbInput = [mappedR, mappedG, mappedB];
        const xyzOutput = multiply(PRO_PHOTO_TO_XYZD50_MATRIX, rgbInput);
        return xyzOutput;
      }
      function xyzd50ToProPhoto(x, y, z) {
        const xyzInput = [x, y, z];
        const rgbOutput = multiply(XYZD50_TO_PRO_PHOTO_MATRIX, xyzInput);
        return applyTransferFns(NAMED_TRANSFER_FN.proPhotoRGB_INVERSE, rgbOutput[0], rgbOutput[1], rgbOutput[2]);
      }
      function adobeRGBToXyzd50(r, g, b) {
        const [mappedR, mappedG, mappedB] = applyTransferFns(NAMED_TRANSFER_FN.k2Dot2, r, g, b);
        const rgbInput = [mappedR, mappedG, mappedB];
        const xyzOutput = multiply(NAMED_GAMUTS.adobeRGB, rgbInput);
        return xyzOutput;
      }
      function xyzd50ToAdobeRGB(x, y, z) {
        const xyzInput = [x, y, z];
        const rgbOutput = multiply(NAMED_GAMUTS.adobeRGB_INVERSE, xyzInput);
        return applyTransferFns(NAMED_TRANSFER_FN.k2Dot2_INVERSE, rgbOutput[0], rgbOutput[1], rgbOutput[2]);
      }
      function rec2020ToXyzd50(r, g, b) {
        const [mappedR, mappedG, mappedB] = applyTransferFns(NAMED_TRANSFER_FN.rec2020, r, g, b);
        const rgbInput = [mappedR, mappedG, mappedB];
        const xyzOutput = multiply(NAMED_GAMUTS.rec2020, rgbInput);
        return xyzOutput;
      }
      function xyzd50ToRec2020(x, y, z) {
        const xyzInput = [x, y, z];
        const rgbOutput = multiply(NAMED_GAMUTS.rec2020_INVERSE, xyzInput);
        return applyTransferFns(NAMED_TRANSFER_FN.rec2020_INVERSE, rgbOutput[0], rgbOutput[1], rgbOutput[2]);
      }
      function xyzd50ToD65(x, y, z) {
        const xyzInput = [x, y, z];
        const xyzOutput = multiply(XYZD50_TO_XYZD65_MATRIX, xyzInput);
        return xyzOutput;
      }
      function xyzd65ToD50(x, y, z) {
        const xyzInput = [x, y, z];
        const xyzOutput = multiply(XYZD65_TO_XYZD50_MATRIX, xyzInput);
        return xyzOutput;
      }
      function xyzd65TosRGBLinear(x, y, z) {
        const xyzInput = [x, y, z];
        const rgbResult = multiply(XYZD65_TO_SRGB_MATRIX, xyzInput);
        return rgbResult;
      }
      function xyzd50TosRGBLinear(x, y, z) {
        const xyzInput = [x, y, z];
        const rgbResult = multiply(NAMED_GAMUTS.sRGB_INVERSE, xyzInput);
        return rgbResult;
      }
      function srgbLinearToXyzd50(r, g, b) {
        const rgbInput = [r, g, b];
        const xyzOutput = multiply(NAMED_GAMUTS.sRGB, rgbInput);
        return xyzOutput;
      }
      function srgbToXyzd50(r, g, b) {
        const [mappedR, mappedG, mappedB] = applyTransferFns(NAMED_TRANSFER_FN.sRGB, r, g, b);
        const rgbInput = [mappedR, mappedG, mappedB];
        const xyzOutput = multiply(NAMED_GAMUTS.sRGB, rgbInput);
        return xyzOutput;
      }
      function xyzd50ToSrgb(x, y, z) {
        const xyzInput = [x, y, z];
        const rgbOutput = multiply(NAMED_GAMUTS.sRGB_INVERSE, xyzInput);
        return applyTransferFns(NAMED_TRANSFER_FN.sRGB_INVERSE, rgbOutput[0], rgbOutput[1], rgbOutput[2]);
      }
      function oklchToXyzd50(lInput, c, h) {
        const [l, a, b] = lchToLab(lInput, c, h);
        const [x65, y65, z65] = oklabToXyzd65(l, a, b);
        return xyzd65ToD50(x65, y65, z65);
      }
      function xyzd50ToOklch(x, y, z) {
        const [x65, y65, z65] = xyzd50ToD65(x, y, z);
        const [l, a, b] = xyzd65ToOklab(x65, y65, z65);
        return labToLch(l, a, b);
      }
    }
  });

  // node_modules/.pnpm/color-bits@1.1.1/node_modules/color-bits/build/parse.js
  var require_parse = __commonJS({
    "node_modules/.pnpm/color-bits@1.1.1/node_modules/color-bits/build/parse.js"(exports) {
      "use strict";
      var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      }) : (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      }));
      var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }) : function(o, v) {
        o["default"] = v;
      });
      var __importStar = exports && exports.__importStar || function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        }
        __setModuleDefault(result, mod);
        return result;
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.parse = parse;
      exports.parseHex = parseHex;
      exports.parseColor = parseColor;
      var core_1 = require_core();
      var convert = __importStar(require_convert());
      var HASH = "#".charCodeAt(0);
      var PERCENT = "%".charCodeAt(0);
      var G = "g".charCodeAt(0);
      var N = "n".charCodeAt(0);
      var D = "d".charCodeAt(0);
      var E = "e".charCodeAt(0);
      var PATTERN = (() => {
        const NAME = "(\\w+)";
        const SEPARATOR = "[\\s,\\/]";
        const VALUE = "([^\\s,\\/]+)";
        const SEPARATOR_THEN_VALUE = `(?:${SEPARATOR}+${VALUE})`;
        return new RegExp(`${NAME}\\(
      ${SEPARATOR}*
      ${VALUE}
      ${SEPARATOR_THEN_VALUE}
      ${SEPARATOR_THEN_VALUE}
      ${SEPARATOR_THEN_VALUE}?
      ${SEPARATOR_THEN_VALUE}?
      ${SEPARATOR}*
    \\)`.replace(/\s/g, ""));
      })();
      function parse(color) {
        if (color.charCodeAt(0) === HASH) {
          return parseHex(color);
        } else {
          return parseColor(color);
        }
      }
      function parseHex(color) {
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 255;
        switch (color.length) {
          // #59f
          case 4: {
            r = (hexValue(color.charCodeAt(1)) << 4) + hexValue(color.charCodeAt(1));
            g = (hexValue(color.charCodeAt(2)) << 4) + hexValue(color.charCodeAt(2));
            b = (hexValue(color.charCodeAt(3)) << 4) + hexValue(color.charCodeAt(3));
            break;
          }
          // #5599ff
          case 7: {
            r = (hexValue(color.charCodeAt(1)) << 4) + hexValue(color.charCodeAt(2));
            g = (hexValue(color.charCodeAt(3)) << 4) + hexValue(color.charCodeAt(4));
            b = (hexValue(color.charCodeAt(5)) << 4) + hexValue(color.charCodeAt(6));
            break;
          }
          // #5599ff88
          case 9: {
            r = (hexValue(color.charCodeAt(1)) << 4) + hexValue(color.charCodeAt(2));
            g = (hexValue(color.charCodeAt(3)) << 4) + hexValue(color.charCodeAt(4));
            b = (hexValue(color.charCodeAt(5)) << 4) + hexValue(color.charCodeAt(6));
            a = (hexValue(color.charCodeAt(7)) << 4) + hexValue(color.charCodeAt(8));
            break;
          }
          default: {
            break;
          }
        }
        return (0, core_1.newColor)(r, g, b, a);
      }
      function hexValue(c) {
        return (c & 15) + 9 * (c >> 6);
      }
      function parseColor(color) {
        const match = PATTERN.exec(color);
        if (match === null) {
          throw new Error(`Color.parse(): invalid CSS color: "${color}"`);
        }
        const format = match[1];
        const p1 = match[2];
        const p2 = match[3];
        const p3 = match[4];
        const p4 = match[5];
        const p5 = match[6];
        switch (format) {
          case "rgb":
          case "rgba": {
            const r = parseColorChannel(p1);
            const g = parseColorChannel(p2);
            const b = parseColorChannel(p3);
            const a = p4 ? parseAlphaChannel(p4) : 255;
            return (0, core_1.newColor)(r, g, b, a);
          }
          case "hsl":
          case "hsla": {
            const h = parseAngle(p1);
            const s = parsePercentage(p2);
            const l = parsePercentage(p3);
            const a = p4 ? parseAlphaChannel(p4) : 255;
            let r, g, b;
            if (s === 0) {
              r = g = b = Math.round(l * 255);
            } else {
              const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
              const p = 2 * l - q;
              r = Math.round(hueToRGB(p, q, h + 1 / 3) * 255);
              g = Math.round(hueToRGB(p, q, h) * 255);
              b = Math.round(hueToRGB(p, q, h - 1 / 3) * 255);
            }
            return (0, core_1.newColor)(r, g, b, a);
          }
          case "hwb": {
            const h = parseAngle(p1);
            const w = parsePercentage(p2);
            const bl = parsePercentage(p3);
            const a = p4 ? parseAlphaChannel(p4) : 255;
            const s = 1;
            const l = 0.5;
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            let r = Math.round(hueToRGB(p, q, h + 1 / 3) * 255);
            let g = Math.round(hueToRGB(p, q, h) * 255);
            let b = Math.round(hueToRGB(p, q, h - 1 / 3) * 255);
            r = hwbApply(r, w, bl);
            g = hwbApply(g, w, bl);
            b = hwbApply(b, w, bl);
            return (0, core_1.newColor)(r, g, b, a);
          }
          case "lab": {
            const l = parsePercentageFor(p1, 100);
            const aa = parsePercentageFor(p2, 125);
            const b = parsePercentageFor(p3, 125);
            const a = p4 ? parseAlphaChannel(p4) : 255;
            return newColorFromArray(a, convert.xyzd50ToSrgb(...convert.labToXyzd50(l, aa, b)));
          }
          case "lch": {
            const l = parsePercentageFor(p1, 100);
            const c = parsePercentageFor(p2, 150);
            const h = parseAngle(p3) * 360;
            const a = p4 ? parseAlphaChannel(p4) : 255;
            return newColorFromArray(a, convert.xyzd50ToSrgb(...convert.labToXyzd50(...convert.lchToLab(l, c, h))));
          }
          case "oklab": {
            const l = parsePercentageFor(p1, 1);
            const aa = parsePercentageFor(p2, 0.4);
            const b = parsePercentageFor(p3, 0.4);
            const a = p4 ? parseAlphaChannel(p4) : 255;
            return newColorFromArray(a, convert.xyzd50ToSrgb(...convert.xyzd65ToD50(...convert.oklabToXyzd65(l, aa, b))));
          }
          case "oklch": {
            const l = parsePercentageOrValue(p1);
            const c = parsePercentageOrValue(p2);
            const h = parsePercentageOrValue(p3);
            const a = p4 ? parseAlphaChannel(p4) : 255;
            return newColorFromArray(a, convert.xyzd50ToSrgb(...convert.oklchToXyzd50(l, c, h)));
          }
          case "color": {
            const colorspace = p1;
            const c1 = parsePercentageOrValue(p2);
            const c2 = parsePercentageOrValue(p3);
            const c3 = parsePercentageOrValue(p4);
            const a = p5 ? parseAlphaChannel(p5) : 255;
            switch (colorspace) {
              // RGB color spaces
              case "srgb": {
                return newColorFromArray(a, [c1, c2, c3]);
              }
              case "srgb-linear": {
                return newColorFromArray(a, convert.xyzd50ToSrgb(...convert.srgbLinearToXyzd50(c1, c2, c3)));
              }
              case "display-p3": {
                return newColorFromArray(a, convert.xyzd50ToSrgb(...convert.displayP3ToXyzd50(c1, c2, c3)));
              }
              case "a98-rgb": {
                return newColorFromArray(a, convert.xyzd50ToSrgb(...convert.adobeRGBToXyzd50(c1, c2, c3)));
              }
              case "prophoto-rgb": {
                return newColorFromArray(a, convert.xyzd50ToSrgb(...convert.proPhotoToXyzd50(c1, c2, c3)));
              }
              case "rec2020": {
                return newColorFromArray(a, convert.xyzd50ToSrgb(...convert.rec2020ToXyzd50(c1, c2, c3)));
              }
              // XYZ color spaces
              case "xyz":
              case "xyz-d65": {
                return newColorFromArray(a, convert.xyzd50ToSrgb(...convert.xyzd65ToD50(c1, c2, c3)));
              }
              case "xyz-d50": {
                return newColorFromArray(a, convert.xyzd50ToSrgb(c1, c2, c3));
              }
              default:
            }
          }
          default:
        }
        throw new Error(`Color.parse(): invalid CSS color: "${color}"`);
      }
      function parseColorChannel(channel) {
        if (channel.charCodeAt(channel.length - 1) === PERCENT) {
          return Math.round(parseFloat(channel) / 100 * 255);
        }
        return Math.round(parseFloat(channel));
      }
      function parseAlphaChannel(channel) {
        return Math.round(parseAlphaValue(channel) * 255);
      }
      function parseAlphaValue(channel) {
        if (channel.charCodeAt(0) === N) {
          return 0;
        }
        if (channel.charCodeAt(channel.length - 1) === PERCENT) {
          return parseFloat(channel) / 100;
        }
        return parseFloat(channel);
      }
      function parseAngle(angle) {
        let factor = 1;
        switch (angle.charCodeAt(angle.length - 1)) {
          case E: {
            return 0;
          }
          case D: {
            if (angle.charCodeAt(Math.max(0, angle.length - 4)) === G) {
              factor = 400;
            } else {
              factor = 2 * Math.PI;
            }
            break;
          }
          case N: {
            factor = 1;
            break;
          }
          // case G: // 'deg', but no need to check as it's also the default
          default: {
            factor = 360;
          }
        }
        return parseFloat(angle) / factor;
      }
      function parsePercentage(value) {
        if (value.charCodeAt(0) === N) {
          return 0;
        }
        return parseFloat(value) / 100;
      }
      function parsePercentageOrValue(value) {
        if (value.charCodeAt(0) === N) {
          return 0;
        }
        if (value.charCodeAt(value.length - 1) === PERCENT) {
          return parseFloat(value) / 100;
        }
        return parseFloat(value);
      }
      function parsePercentageFor(value, range) {
        if (value.charCodeAt(0) === N) {
          return 0;
        }
        if (value.charCodeAt(value.length - 1) === PERCENT) {
          return parseFloat(value) / 100 * range;
        }
        return parseFloat(value);
      }
      function hueToRGB(p, q, t) {
        if (t < 0) {
          t += 1;
        }
        ;
        if (t > 1) {
          t -= 1;
        }
        ;
        if (t < 1 / 6) {
          return p + (q - p) * 6 * t;
        }
        ;
        if (t < 1 / 2) {
          return q;
        }
        ;
        if (t < 2 / 3) {
          return p + (q - p) * (2 / 3 - t) * 6;
        }
        ;
        {
          return p;
        }
        ;
      }
      function hwbApply(channel, w, b) {
        let result = channel / 255;
        result *= 1 - w - b;
        result += w;
        return Math.round(result * 255);
      }
      function clamp(value) {
        return Math.max(0, Math.min(255, value));
      }
      function newColorFromArray(a, rgb) {
        const r = clamp(Math.round(rgb[0] * 255));
        const g = clamp(Math.round(rgb[1] * 255));
        const b = clamp(Math.round(rgb[2] * 255));
        return (0, core_1.newColor)(r, g, b, a);
      }
    }
  });

  // node_modules/.pnpm/color-bits@1.1.1/node_modules/color-bits/build/format.js
  var require_format = __commonJS({
    "node_modules/.pnpm/color-bits@1.1.1/node_modules/color-bits/build/format.js"(exports) {
      "use strict";
      var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      }) : (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      }));
      var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }) : function(o, v) {
        o["default"] = v;
      });
      var __importStar = exports && exports.__importStar || function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        }
        __setModuleDefault(result, mod);
        return result;
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.format = void 0;
      exports.formatHEXA = formatHEXA;
      exports.formatHEX = formatHEX;
      exports.formatRGBA = formatRGBA;
      exports.toRGBA = toRGBA;
      exports.formatHSLA = formatHSLA;
      exports.toHSLA = toHSLA;
      exports.formatHWBA = formatHWBA;
      exports.toHWBA = toHWBA;
      var core = __importStar(require_core());
      var { getRed, getGreen, getBlue, getAlpha } = core;
      var buffer = [0, 0, 0];
      var FORMAT_HEX = Array.from({ length: 256 }).map((_, byte) => byte.toString(16).padStart(2, "0"));
      exports.format = formatHEXA;
      function formatHEXA(color) {
        return "#" + FORMAT_HEX[getRed(color)] + FORMAT_HEX[getGreen(color)] + FORMAT_HEX[getBlue(color)] + FORMAT_HEX[getAlpha(color)];
      }
      function formatHEX(color) {
        return "#" + FORMAT_HEX[getRed(color)] + FORMAT_HEX[getGreen(color)] + FORMAT_HEX[getBlue(color)];
      }
      function formatRGBA(color) {
        return `rgba(${getRed(color)} ${getGreen(color)} ${getBlue(color)} / ${getAlpha(color) / 255})`;
      }
      function toRGBA(color) {
        return {
          r: getRed(color),
          g: getGreen(color),
          b: getBlue(color),
          a: getAlpha(color)
        };
      }
      function formatHSLA(color) {
        rgbToHSL(getRed(color), getGreen(color), getBlue(color));
        const h = buffer[0];
        const s = buffer[1];
        const l = buffer[2];
        const a = getAlpha(color) / 255;
        return `hsla(${h} ${s}% ${l}% / ${a})`;
      }
      function toHSLA(color) {
        rgbToHSL(getRed(color), getGreen(color), getBlue(color));
        const h = buffer[0];
        const s = buffer[1];
        const l = buffer[2];
        const a = getAlpha(color) / 255;
        return { h, s, l, a };
      }
      function formatHWBA(color) {
        rgbToHWB(getRed(color), getGreen(color), getBlue(color));
        const h = buffer[0];
        const w = buffer[1];
        const b = buffer[2];
        const a = getAlpha(color) / 255;
        return `hsla(${h} ${w}% ${b}% / ${a})`;
      }
      function toHWBA(color) {
        rgbToHWB(getRed(color), getGreen(color), getBlue(color));
        const h = buffer[0];
        const w = buffer[1];
        const b = buffer[2];
        const a = getAlpha(color) / 255;
        return { h, w, b, a };
      }
      function rgbToHSL(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const l = Math.max(r, g, b);
        const s = l - Math.min(r, g, b);
        const h = s ? l === r ? (g - b) / s : l === g ? 2 + (b - r) / s : 4 + (r - g) / s : 0;
        buffer[0] = 60 * h < 0 ? 60 * h + 360 : 60 * h;
        buffer[1] = 100 * (s ? l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s)) : 0);
        buffer[2] = 100 * (2 * l - s) / 2;
      }
      function rgbToHWB(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const w = Math.min(r, g, b);
        const v = Math.max(r, g, b);
        const black = 1 - v;
        if (v === w) {
          buffer[0] = 0;
          buffer[1] = w;
          buffer[2] = black;
          return;
        }
        let f = r === w ? g - b : g === w ? b - r : r - g;
        let i = r === w ? 3 : g === w ? 5 : 1;
        buffer[0] = (i - f / (v - w)) / 6;
        buffer[1] = w;
        buffer[2] = black;
      }
    }
  });

  // node_modules/.pnpm/color-bits@1.1.1/node_modules/color-bits/build/functions.js
  var require_functions = __commonJS({
    "node_modules/.pnpm/color-bits@1.1.1/node_modules/color-bits/build/functions.js"(exports) {
      "use strict";
      var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      }) : (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      }));
      var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }) : function(o, v) {
        o["default"] = v;
      });
      var __importStar = exports && exports.__importStar || function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        }
        __setModuleDefault(result, mod);
        return result;
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.alpha = alpha;
      exports.darken = darken;
      exports.lighten = lighten;
      exports.blend = blend;
      exports.getLuminance = getLuminance;
      var core = __importStar(require_core());
      var { getRed, getGreen, getBlue, getAlpha, setAlpha, newColor } = core;
      function alpha(color, value) {
        return setAlpha(color, Math.round(value * 255));
      }
      function darken(color, coefficient) {
        const r = getRed(color);
        const g = getGreen(color);
        const b = getBlue(color);
        const a = getAlpha(color);
        const factor = 1 - coefficient;
        return newColor(r * factor, g * factor, b * factor, a);
      }
      function lighten(color, coefficient) {
        const r = getRed(color);
        const g = getGreen(color);
        const b = getBlue(color);
        const a = getAlpha(color);
        return newColor(r + (255 - r) * coefficient, g + (255 - g) * coefficient, b + (255 - b) * coefficient, a);
      }
      function blend(background, overlay, opacity, gamma = 1) {
        const blendChannel = (b2, o) => Math.round((b2 ** (1 / gamma) * (1 - opacity) + o ** (1 / gamma) * opacity) ** gamma);
        const r = blendChannel(getRed(background), getRed(overlay));
        const g = blendChannel(getGreen(background), getGreen(overlay));
        const b = blendChannel(getBlue(background), getBlue(overlay));
        return newColor(r, g, b, 255);
      }
      function getLuminance(color) {
        const r = getRed(color) / 255;
        const g = getGreen(color) / 255;
        const b = getBlue(color) / 255;
        const apply = (v) => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        const r1 = apply(r);
        const g1 = apply(g);
        const b1 = apply(b);
        return Math.round((0.2126 * r1 + 0.7152 * g1 + 0.0722 * b1) * 1e3) / 1e3;
      }
    }
  });

  // node_modules/.pnpm/color-bits@1.1.1/node_modules/color-bits/build/index.js
  var require_build = __commonJS({
    "node_modules/.pnpm/color-bits@1.1.1/node_modules/color-bits/build/index.js"(exports) {
      var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      }) : (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      }));
      var __exportStar = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      __exportStar(require_core(), exports);
      __exportStar(require_parse(), exports);
      __exportStar(require_format(), exports);
      __exportStar(require_functions(), exports);
    }
  });
  return require_build();
})();
