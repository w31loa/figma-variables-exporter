/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 61:
/***/ ((__unused_webpack_module, exports) => {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.


var _process;
if(typeof process === 'undefined') {
    _process = {
        env: {},
        cwd: function() {
            return (typeof window !== 'undefined' && window.location.pathname) || "";
        }
    };
}else {
    _process = process;
}

var isWindows =  false && (0);

function isString(obj) {
    return typeof obj === 'string';
}


// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}


if (isWindows) {
  // Regex to split a windows path into three parts: [*, device, slash,
  // tail] windows-only
  var splitDeviceRe =
      /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;

  // Regex to split the tail part of the above into [*, dir, basename, ext]
  var splitTailRe =
      /^([\s\S]*?)((?:\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))(?:[\\\/]*)$/;

  // Function to split a filename into [root, dir, basename, ext]
  // windows version
  var splitPath = function(filename) {
    // Separate device+slash from tail
    var result = splitDeviceRe.exec(filename),
        device = (result[1] || '') + (result[2] || ''),
        tail = result[3] || '';
    // Split the tail into dir, basename and extension
    var result2 = splitTailRe.exec(tail),
        dir = result2[1],
        basename = result2[2],
        ext = result2[3];
    return [device, dir, basename, ext];
  };

  var normalizeUNCRoot = function(device) {
    return '\\\\' + device.replace(/^[\\\/]+/, '').replace(/[\\\/]+/g, '\\');
  };

  // path.resolve([from ...], to)
  // windows version
  exports.resolve = function() {
    var resolvedDevice = '',
        resolvedTail = '',
        resolvedAbsolute = false;

    for (var i = arguments.length - 1; i >= -1; i--) {
      var path;
      if (i >= 0) {
        path = arguments[i];
      } else if (!resolvedDevice) {
        path = _process.cwd();
      } else {
        // Windows has the concept of drive-specific current working
        // directories. If we've resolved a drive letter but not yet an
        // absolute path, get cwd for that drive. We're sure the device is not
        // an unc path at this points, because unc paths are always absolute.
        path = _process.env['=' + resolvedDevice];
        // Verify that a drive-local cwd was found and that it actually points
        // to our drive. If not, default to the drive's root.
        if (!path || path.substr(0, 3).toLowerCase() !==
            resolvedDevice.toLowerCase() + '\\') {
          path = resolvedDevice + '\\';
        }
      }

      // Skip empty and invalid entries
      if (!isString(path)) {
        throw new TypeError('Arguments to path.resolve must be strings');
      } else if (!path) {
        continue;
      }

      var result = splitDeviceRe.exec(path),
          device = result[1] || '',
          isUnc = device && device.charAt(1) !== ':',
          isAbsolute = exports.isAbsolute(path),
          tail = result[3];

      if (device &&
          resolvedDevice &&
          device.toLowerCase() !== resolvedDevice.toLowerCase()) {
        // This path points to another device so it is not applicable
        continue;
      }

      if (!resolvedDevice) {
        resolvedDevice = device;
      }
      if (!resolvedAbsolute) {
        resolvedTail = tail + '\\' + resolvedTail;
        resolvedAbsolute = isAbsolute;
      }

      if (resolvedDevice && resolvedAbsolute) {
        break;
      }
    }

    // Convert slashes to backslashes when `resolvedDevice` points to an UNC
    // root. Also squash multiple slashes into a single one where appropriate.
    if (isUnc) {
      resolvedDevice = normalizeUNCRoot(resolvedDevice);
    }

    // At this point the path should be resolved to a full absolute path,
    // but handle relative paths to be safe (might happen when process.cwd()
    // fails)

    // Normalize the tail path

    function f(p) {
      return !!p;
    }

    resolvedTail = normalizeArray(resolvedTail.split(/[\\\/]+/).filter(f),
                                  !resolvedAbsolute).join('\\');

    return (resolvedDevice + (resolvedAbsolute ? '\\' : '') + resolvedTail) ||
           '.';
  };

  // windows version
  exports.normalize = function(path) {
    var result = splitDeviceRe.exec(path),
        device = result[1] || '',
        isUnc = device && device.charAt(1) !== ':',
        isAbsolute = exports.isAbsolute(path),
        tail = result[3],
        trailingSlash = /[\\\/]$/.test(tail);

    // If device is a drive letter, we'll normalize to lower case.
    if (device && device.charAt(1) === ':') {
      device = device[0].toLowerCase() + device.substr(1);
    }

    // Normalize the tail path
    tail = normalizeArray(tail.split(/[\\\/]+/).filter(function(p) {
      return !!p;
    }), !isAbsolute).join('\\');

    if (!tail && !isAbsolute) {
      tail = '.';
    }
    if (tail && trailingSlash) {
      tail += '\\';
    }

    // Convert slashes to backslashes when `device` points to an UNC root.
    // Also squash multiple slashes into a single one where appropriate.
    if (isUnc) {
      device = normalizeUNCRoot(device);
    }

    return device + (isAbsolute ? '\\' : '') + tail;
  };

  // windows version
  exports.isAbsolute = function(path) {
    var result = splitDeviceRe.exec(path),
        device = result[1] || '',
        isUnc = device && device.charAt(1) !== ':';
    // UNC paths are always absolute
    return !!result[2] || isUnc;
  };

  // windows version
  exports.join = function() {
    function f(p) {
      if (!isString(p)) {
        throw new TypeError('Arguments to path.join must be strings');
      }
      return p;
    }

    var paths = Array.prototype.filter.call(arguments, f);
    var joined = paths.join('\\');

    // Make sure that the joined path doesn't start with two slashes, because
    // normalize() will mistake it for an UNC path then.
    //
    // This step is skipped when it is very clear that the user actually
    // intended to point at an UNC path. This is assumed when the first
    // non-empty string arguments starts with exactly two slashes followed by
    // at least one more non-slash character.
    //
    // Note that for normalize() to treat a path as an UNC path it needs to
    // have at least 2 components, so we don't filter for that here.
    // This means that the user can use join to construct UNC paths from
    // a server name and a share name; for example:
    //   path.join('//server', 'share') -> '\\\\server\\share\')
    if (!/^[\\\/]{2}[^\\\/]/.test(paths[0])) {
      joined = joined.replace(/^[\\\/]{2,}/, '\\');
    }

    return exports.normalize(joined);
  };

  // path.relative(from, to)
  // it will solve the relative path from 'from' to 'to', for instance:
  // from = 'C:\\orandea\\test\\aaa'
  // to = 'C:\\orandea\\impl\\bbb'
  // The output of the function should be: '..\\..\\impl\\bbb'
  // windows version
  exports.relative = function(from, to) {
    from = exports.resolve(from);
    to = exports.resolve(to);

    // windows is not case sensitive
    var lowerFrom = from.toLowerCase();
    var lowerTo = to.toLowerCase();

    function trim(arr) {
      var start = 0;
      for (; start < arr.length; start++) {
        if (arr[start] !== '') break;
      }

      var end = arr.length - 1;
      for (; end >= 0; end--) {
        if (arr[end] !== '') break;
      }

      if (start > end) return [];
      return arr.slice(start, end - start + 1);
    }

    var toParts = trim(to.split('\\'));

    var lowerFromParts = trim(lowerFrom.split('\\'));
    var lowerToParts = trim(lowerTo.split('\\'));

    var length = Math.min(lowerFromParts.length, lowerToParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
      if (lowerFromParts[i] !== lowerToParts[i]) {
        samePartsLength = i;
        break;
      }
    }

    if (samePartsLength == 0) {
      return to;
    }

    var outputParts = [];
    for (var i = samePartsLength; i < lowerFromParts.length; i++) {
      outputParts.push('..');
    }

    outputParts = outputParts.concat(toParts.slice(samePartsLength));

    return outputParts.join('\\');
  };

  exports.sep = '\\';
  exports.delimiter = ';';

} else /* posix */ {

  // Split a filename into [root, dir, basename, ext], unix version
  // 'root' is just a slash, or nothing.
  var splitPathRe =
      /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
  var splitPath = function(filename) {
    return splitPathRe.exec(filename).slice(1);
  };

  // path.resolve([from ...], to)
  // posix version
  exports.resolve = function() {
    var resolvedPath = '',
        resolvedAbsolute = false;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path = (i >= 0) ? arguments[i] : _process.cwd();
      // Skip empty and invalid entries
      if (!isString(path)) {
        throw new TypeError('Arguments to path.resolve must be strings');
      } else if (!path) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charAt(0) === '/';
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeArray(resolvedPath.split('/').filter(function(p) {
      return !!p;
    }), !resolvedAbsolute).join('/');

    return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
  };

  // path.normalize(path)
  // posix version
  exports.normalize = function(path) {
    var isAbsolute = exports.isAbsolute(path),
        trailingSlash = path[path.length - 1] === '/',
        segments = path.split('/'),
        nonEmptySegments = [];

    // Normalize the path
    for (var i = 0; i < segments.length; i++) {
      if (segments[i]) {
        nonEmptySegments.push(segments[i]);
      }
    }
    path = normalizeArray(nonEmptySegments, !isAbsolute).join('/');

    if (!path && !isAbsolute) {
      path = '.';
    }
    if (path && trailingSlash) {
      path += '/';
    }

    return (isAbsolute ? '/' : '') + path;
  };

  // posix version
  exports.isAbsolute = function(path) {
    return path.charAt(0) === '/';
  };

  // posix version
  exports.join = function() {
    var path = '';
    for (var i = 0; i < arguments.length; i++) {
      var segment = arguments[i];
      if (!isString(segment)) {
        throw new TypeError('Arguments to path.join must be strings');
      }
      if (segment) {
        if (!path) {
          path += segment;
        } else {
          path += '/' + segment;
        }
      }
    }
    return exports.normalize(path);
  };


  // path.relative(from, to)
  // posix version
  exports.relative = function(from, to) {
    from = exports.resolve(from);
    to = exports.resolve(to);

    function trim(arr) {
      var start = 0;
      for (; start < arr.length; start++) {
        if (arr[start] !== '') break;
      }

      var end = arr.length - 1;
      for (; end >= 0; end--) {
        if (arr[end] !== '') break;
      }

      if (start > end) return [];
      return arr.slice(start, end - start + 1);
    }

    var fromParts = trim(from.split('/'));
    var toParts = trim(to.split('/'));

    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i;
        break;
      }
    }

    var outputParts = [];
    for (var i = samePartsLength; i < fromParts.length; i++) {
      outputParts.push('..');
    }

    outputParts = outputParts.concat(toParts.slice(samePartsLength));

    return outputParts.join('/');
  };

  exports.sep = '/';
  exports.delimiter = ':';
}

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(f.length - ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};



if (isWindows) {
  exports._makeLong = function(path) {
    // Note: this will *probably* throw somewhere.
    if (!isString(path))
      return path;

    if (!path) {
      return '';
    }

    var resolvedPath = exports.resolve(path);

    if (/^[a-zA-Z]\:\\/.test(resolvedPath)) {
      // path is local filesystem path, which needs to be converted
      // to long UNC path.
      return '\\\\?\\' + resolvedPath;
    } else if (/^\\\\[^?.]/.test(resolvedPath)) {
      // path is network UNC path, which needs to be converted
      // to long UNC path.
      return '\\\\?\\UNC\\' + resolvedPath.substring(2);
    }

    return path;
  };
} else {
  exports._makeLong = function(path) {
    return path;
  };
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";

// EXTERNAL MODULE: ./src/path.js
var path = __webpack_require__(61);
;// CONCATENATED MODULE: ./src/utils.ts
function unboundRGBA(r, g, b, a = 1) {
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
        a: Math.round(a * 100) / 100
    };
}
function pxToRem(px, multiplier) {
    const value = px / multiplier;
    return value.toFixed(4);
}
function rgbaToHex(value) {
    return '#' + (value.r.toString(16).padStart(2, '0') +
        value.g.toString(16).padStart(2, '0') +
        value.b.toString(16).padStart(2, '0') +
        Math.round(value.a * 255).toString(16).padStart(2, '0')).toUpperCase();
}

;// CONCATENATED MODULE: ./src/file/file-style.ts
// @ts-ignore


class FileStyle {
    constructor(directory, filename, options) {
        this.imports = new Set();
        this.aliases = [];
        this.variables = [];
        this.fontStyles = [];
        this.colorStyles = [];
        this.effectStyles = [];
        this.variableEnd = "\n}\n\n";
        this.variableTab = "\n  ";
        this.variableStart = "\n :root {";
        this.options = options;
        this.directory = directory;
        this.filename = filename;
        this.path = path.join(this.directory, this.filename + "." + this.getExtension());
    }
    getExtension() {
        return "css";
    }
    getFileContent() {
        return this.getImportsContent() + this.getVariablesContent() + this.getAliasesContent() + this.getColorStyelsContent() + this.getFontStylesContent() + this.getEffectStylesContent();
    }
    addImport(file) {
        const importPath = path.join(path.relative(this.directory, file.directory), file.filename + "." + file.getExtension());
        if (importPath.length > 0) {
            this.imports.add(importPath);
        }
    }
    addFontStyle(fontStyle) {
        this.fontStyles.push(fontStyle);
    }
    addVariable(variable) {
        this.variables.push(variable);
    }
    addAlias(alias) {
        this.aliases.push(alias);
    }
    addEffectStyle(effectStyle) {
        this.effectStyles.push(effectStyle);
    }
    addColorStyle(colorStyle) {
        this.colorStyles.push(colorStyle);
    }
    getColorStyelsContent() {
        if (this.colorStyles.length > 0) {
            let content = "/* Color Styles  */" + this.variableStart;
            for (const colorStyle of this.colorStyles) {
                content += `${this.variableTab}${this.getFormattedVariableAssigning(colorStyle.name)}: `;
                colorStyle.layers = colorStyle.layers.sort(l => (l.type == "VARIABLE" ? 1 : 0));
                for (let i = 0; i < colorStyle.layers.length; i++) {
                    const layer = colorStyle.layers[i];
                    if (layer.type == "SOLID") {
                        const rgba = unboundRGBA(layer.value.r, layer.value.g, layer.value.b, layer.value.a);
                        if (this.options.color == "RGBA") {
                            content += `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`;
                        }
                        else {
                            content += rgbaToHex(rgba);
                        }
                    }
                    else if (layer.type == "VARIABLE") {
                        content += this.getFormattedVariableAssignable(layer.name);
                    }
                    else {
                        switch (layer.type) {
                            case "GRADIENT_ANGULAR": {
                                content += `conic-gradient(from 180deg at 50% 50%, `;
                                break;
                            }
                            case "GRADIENT_RADIAL": {
                                content += `radial-gradient(50% 50% at 50% 50%, `;
                                break;
                            }
                            case "GRADIENT_LINEAR":
                            default: {
                                content += `linear-gradient(90deg, `;
                                break;
                            }
                        }
                        for (let j = 0; j < layer.gradientStops.length; j++) {
                            const stop = layer.gradientStops[j];
                            const rgba = unboundRGBA(stop.color.r, stop.color.g, stop.color.b, stop.color.a);
                            content += `${stop.position * 100}% rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
                            if (j < layer.gradientStops.length - 1) {
                                content += ", ";
                            }
                        }
                        content += ')';
                    }
                    if (i < colorStyle.layers.length - 1) {
                        content += ", ";
                    }
                }
                content += ";";
            }
            content += this.variableEnd;
            return content;
        }
        return "";
    }
    // и тут
    getEffectStylesContent() {
        if (this.effectStyles.length > 0) {
            let content = "/* Effect Styles  */\n";
            for (const style of this.effectStyles) {
                content += `.${style.name} {\n`;
                const shadowEffects = style.effects.filter(e => e.type == "DROP_SHADOW" || e.type == "INNER_SHADOW");
                if (shadowEffects.length > 0) {
                    content += "  box-shadow:";
                    for (let i = 0; i < shadowEffects.length; i++) {
                        const effect = shadowEffects[i];
                        const effectColor = unboundRGBA(effect.color.r, effect.color.g, effect.color.b, effect.color.a);
                        //тут адовая гадость))
                        if (this.options.units != 'REM') {
                            content += ` ${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${effect.spread || 0}px rgba(${effectColor.r}, ${effectColor.g}, ${effectColor.b}, ${effectColor.a})`;
                        }
                        else if (this.options.remValue) {
                            content += ` ${pxToRem(+effect.offset.x, +this.options.remValue)}rem ${pxToRem(+effect.offset.y, +this.options.remValue)}rem ${pxToRem(+effect.radius, +this.options.remValue)}rem ${effect.spread ? pxToRem(+effect.spread, +this.options.remValue) : 0}rem rgba(${effectColor.r}, ${effectColor.g}, ${effectColor.b}, ${effectColor.a})`;
                        }
                        if (effect.type == "INNER_SHADOW") {
                            content += " inset";
                        }
                        if (i != shadowEffects.length - 1) {
                            content += ",";
                        }
                    }
                    content += ";\n";
                }
                for (const effect of style.effects) {
                    if (effect.visible) {
                        if (effect.type == "LAYER_BLUR") {
                            if (this.options.units != 'REM') {
                                content += `  filter: blur(${effect.radius}px);\n`;
                            }
                            else if (this.options.remValue) {
                                content += `  filter: blur(${pxToRem(+effect.radius, +this.options.remValue)}rem);\n`;
                            }
                        }
                        else if (effect.type == "BACKGROUND_BLUR") {
                            content += `  backdrop-filter: blur(${effect.radius}px);\n`;
                        }
                    }
                }
                content += "}\n\n";
            }
            return content;
        }
        return "";
    }
    // тут тоже пиксели
    getFontStylesContent() {
        if (this.fontStyles.length > 0) {
            let content = "/* Text Styles  */\n";
            for (const style of this.fontStyles) {
                content += `.${style.name} {\n`;
                content += `  font-family: ${style.fontName.family};\n`;
                if (this.options.units != 'REM') {
                    content += `  font-size: ${style.fontSize}px;\n`;
                    content += `  line-height: ${style.lineHeight.unit == "PIXELS" ? `${style.lineHeight.value}px` : style.lineHeight.unit == "PERCENT" ? `${Math.round(style.lineHeight.value * 100) / 100}%` : "normal"};\n`;
                    content += `  letter-spacing: ${style.letterSpacing.value}${style.letterSpacing.unit == "PERCENT" ? "%" : "px"};\n`;
                }
                else if (this.options.remValue) {
                    content += `  filter: blur(${pxToRem(+style.fontSize, +this.options.remValue)}rem);\n`;
                    content += `  line-height: ${style.lineHeight.unit == "PIXELS" ? `${pxToRem(+style.lineHeight.value, +this.options.remValue)}rem` : style.lineHeight.unit == "PERCENT" ? `${Math.round(style.lineHeight.value * 100) / 100}%` : "normal"};\n`;
                    content += `  letter-spacing: ${pxToRem(+style.letterSpacing.value, +this.options.remValue)}${style.letterSpacing.unit == "PERCENT" ? "%" : "px"};\n`;
                }
                content += `  font-weight: ${style.fontWeight};\n`;
                content += "}\n\n";
            }
            return content;
        }
        return "";
    }
    getImportsContent() {
        if (this.imports.size > 0) {
            let content = "";
            for (const importPath of this.imports) {
                content += `@import "${importPath}";\n`;
            }
            content += "\n";
            return content;
        }
        return "";
    }
    getAliasesContent() {
        if (this.aliases.length > 0) {
            let content = " /* Aliases  */" + this.variableStart;
            for (const alias of this.aliases) {
                content += `${this.variableTab}${this.getFormattedVariableAssigning(alias.from)}: ${this.getFormattedVariableAssignable(alias.to)};`;
            }
            return content += this.variableEnd;
        }
        return "";
    }
    //тут добавить проверку опций и если есть передавать в ремамах то просто концертировать пиксили в ремы 1111)))
    getVariablesContent() {
        if (this.variables.length > 0) {
            let content = " /* Variables  */" + this.variableStart;
            for (const variable of this.variables) {
                if (variable.value.type == "HEX") {
                    content += `${this.variableTab}${this.getFormattedVariableAssigning(variable.name)}: ${variable.value.value};`;
                }
                else if (variable.value.type == "RGB") {
                    content += `${this.variableTab}${this.getFormattedVariableAssigning(variable.name)}: rgb(${variable.value.value.r}, ${variable.value.value.g}, ${variable.value.value.b});`;
                }
                else if (variable.value.type == "RGBA") {
                    content += `${this.variableTab}${this.getFormattedVariableAssigning(variable.name)}: rgba(${variable.value.value.r}, ${variable.value.value.g}, ${variable.value.value.b}, ${variable.value.value.a});`;
                }
                else {
                    //вот где обычные перменные
                    if (this.options.units != 'REM') {
                        content += `${this.variableTab}${this.getFormattedVariableAssigning(variable.name)}: ${variable.value.value}px;`;
                    }
                    else if (this.options.remValue) {
                        content += `${this.variableTab}${this.getFormattedVariableAssigning(variable.name)}: ${pxToRem(+variable.value.value, +this.options.remValue)}rem;`;
                    }
                }
            }
            return content += this.variableEnd;
        }
        return "";
    }
    getFormattedVariableAssigning(assigning) {
        return `--${assigning}`;
    }
    getFormattedVariableAssignable(assignable) {
        return `var(--${assignable})`;
    }
}

;// CONCATENATED MODULE: ./src/file/file-style-scss.ts

class FileStyleScss extends FileStyle {
    constructor() {
        super(...arguments);
        this.variableEnd = "\n\n";
        this.variableStart = "";
        this.variableTab = "\n";
    }
    getExtension() {
        return "scss";
    }
    getFormattedVariableAssigning(assigning) {
        return `$${assigning}`;
    }
    getFormattedVariableAssignable(assignable) {
        return `$${assignable}`;
    }
}

;// CONCATENATED MODULE: ./src/exporter/exporter.service.ts
// @ts-ignore




class ExporterService {
    constructor(variables, fontStyles, effectStyles, colorStyles, options) {
        this.files = {};
        this.variables = variables;
        this.fontStyles = fontStyles;
        this.effectStyles = effectStyles;
        this.colorStyles = colorStyles;
        this.options = options;
        this.FileClass = options.lang == "SCSS" ? FileStyleScss : FileStyle;
    }
    getFiles() {
        return Object.values(this.files);
    }
    runPipeline() {
        this.createVariableContent();
        if (this.options.exportTextStyles) {
            this.createFontStylesContent();
        }
        if (this.options.exportEffectStyles) {
            this.createEffectStylesContent();
        }
        if (this.options.exportColorStyles) {
            this.createColorStylesContent();
        }
    }
    createVariableContent() {
        for (const variable of Object.values(this.variables)) {
            if (this.options.collection != "ALL") {
                if (this.options.collection != variable.collection.id) {
                    continue;
                }
            }
            if (this.options.mode != 'ALL') {
                variable.valuesByMode = variable.valuesByMode.filter(e => e.mode == this.options.mode);
            }
            for (const variableValue of variable.valuesByMode) {
                const { directory, filename } = this.getPathFromName(variable.name, "variables", variable.collection.name || "", variableValue.mode || "");
                const file = this.getFileByPath(directory, filename, this.options);
                let formattedName = this.getFormattedName(variable.name || "");
                const formattedValue = this.getFormattedVariableValue(variable, variableValue);
                if (!this.options.sort && this.options.postfix != 'off') {
                    formattedName += "-" + this.getFormattedName(variableValue.mode);
                }
                if (formattedValue.type == "ALIAS") {
                    const formattedAliasName = this.getFormattedName(formattedValue.value.name || "");
                    file.addAlias({ from: formattedName, to: formattedAliasName });
                }
                else {
                    file.addVariable({ name: formattedName, value: formattedValue });
                }
            }
        }
    }
    // заполняет переменную file стилями шрифтов
    createFontStylesContent() {
        for (const fontStyle of this.fontStyles) {
            const { directory, filename } = this.getPathFromName(fontStyle.name, "styles", "texts");
            const file = this.getFileByPath(directory, filename, this.options);
            fontStyle.name = this.getFormattedName(fontStyle.name);
            file.addFontStyle(fontStyle);
        }
    }
    createEffectStylesContent() {
        for (const effectStyle of this.effectStyles) {
            const { directory, filename } = this.getPathFromName(effectStyle.name, "styles", "effects");
            const file = this.getFileByPath(directory, filename, this.options);
            effectStyle.name = this.getFormattedName(effectStyle.name);
            file.addEffectStyle(effectStyle);
        }
    }
    createColorStylesContent() {
        for (const style of this.colorStyles) {
            const name = this.getFormattedName(style.name);
            const colorStyle = {
                name,
                layers: []
            };
            for (const layer of style.layers) {
                if (layer.type == "SOLID") {
                    if (layer.valueType == "VARIABLE") {
                        colorStyle.layers.push({
                            type: "VARIABLE",
                            name: this.getFormattedName(layer.variable.name)
                        });
                        for (const { mode } of layer.variable.valuesByMode) {
                            const { directory, filename } = this.getPathFromName(style.name, "styles", "colors", mode);
                            const file = this.getFileByPath(directory, filename, this.options);
                            file.addColorStyle(colorStyle);
                            const aliasPath = this.getPathFromName(layer.variable.name, "variables", layer.variable.collection.name, mode);
                            const aliasFile = this.getFileByPath(aliasPath.directory, aliasPath.filename, this.options);
                            file.addImport(aliasFile);
                        }
                    }
                    else {
                        colorStyle.layers.push(layer);
                    }
                }
                else {
                    colorStyle.layers.push(layer);
                }
            }
            if (colorStyle.layers.filter(s => s.type == "VARIABLE").length == 0) {
                const { directory, filename } = this.getPathFromName(style.name, "styles", "colors");
                const file = this.getFileByPath(directory, filename, this.options);
                colorStyle.name = this.getFormattedName(colorStyle.name);
                file.addColorStyle(colorStyle);
            }
        }
    }
    getFormattedName(name) {
        return name.replace(/\//g, "-").replace(/\s+/g, "-").toLowerCase();
    }
    getFormattedVariableValue(variable, variableValue) {
        // ?????????????????
        if (variableValue.value.type == "VARIABLE_ALIAS") {
            const alias = this.variables[variableValue.value.id];
            return { type: "ALIAS", value: alias };
        }
        if (variable.resolvedType == "COLOR") {
            if (this.options.color == "HEX") {
                const value = unboundRGBA(variableValue.value.r, variableValue.value.g, variableValue.value.b, variableValue.value.a);
                return {
                    type: "HEX",
                    value: rgbaToHex(value)
                };
            }
            else if (variableValue.value.a) {
                const value = variableValue.value;
                return {
                    type: "RGBA",
                    value: unboundRGBA(value.r, value.g, value.b, value.a)
                };
            }
            else {
                const value = variableValue.value;
                return {
                    type: "RGB",
                    value: unboundRGBA(value.r, value.g, value.b, 1)
                };
            }
        }
        return { type: "PIXELS", value: Math.round(Number(variableValue.value) * 100) / 100 };
    }
    getPathFromName(name, ...prefixes) {
        if (!this.options.sort) {
            return { directory: "", filename: "index" };
        }
        const tokens = [
            ...name.split("/")
        ].slice(0, -1);
        return {
            filename: tokens.length > 0 ? tokens.pop() : "index",
            directory: path.join(...prefixes, ...tokens)
        };
    }
    getFileByPath(directory, filename, options) {
        const pth = path.join(directory, filename);
        if (!this.files[pth]) {
            this.files[pth] = new this.FileClass(directory, filename, options);
        }
        return this.files[pth];
    }
}

;// CONCATENATED MODULE: ./src/index.ts

new class Plugin {
    constructor() {
        this.eventHandlers = new Map();
        console.clear();
        figma.showUI(__html__);
        figma.ui.resize(640, 450);
        figma.ui.onmessage = msg => {
            const handler = this.eventHandlers.get(msg.eventName);
            if (handler)
                handler(...msg.args);
        };
        this.eventHandlers.set("action::setHeight", this.onSetHeight.bind(this));
        this.eventHandlers.set("action::export", this.onExport.bind(this));
        this.eventHandlers.set("action::getModes", this.sendModesToWebView.bind(this));
        this.sendCollectionsToWebView();
    }
    sendCollectionsToWebView() {
        console.log({ rem: figma.currentPage });
        const collections = figma.variables.getLocalVariableCollections().map(e => { return { id: e.id, name: e.name }; });
        figma.ui.postMessage({ type: "collections", collections: collections }, { origin: "*" });
    }
    sendModesToWebView(collectionId) {
        const modes = figma.variables.getLocalVariableCollections().filter((e) => e.id == collectionId).map((e) => e.modes);
        figma.ui.postMessage({ type: "modes", collections: modes }, { origin: "*" });
    }
    onSetHeight(height) {
        figma.ui.resize(420, height);
    }
    onExport(options) {
        console.log(options);
        const variables = this.getExportVariables();
        const fontStyles = this.getExportFontStyles();
        const effectStyles = this.getExportEffectStyles();
        const colorStyles = this.getExportColorStyles();
        const exporterService = new ExporterService(variables, fontStyles, effectStyles, colorStyles, options);
        exporterService.runPipeline();
        figma.ui.postMessage({ type: "ui::save_message", files: exporterService.getFiles().map(file => [file.path, file.getFileContent()]) }, { origin: "*" });
    }
    getExportColorStyles() {
        return figma.getLocalPaintStyles().map(style => ({
            name: style.name,
            layers: style.paints.filter(p => p.type != "VIDEO" && p.type != "IMAGE").map(p => {
                var _a;
                if (p.type == "SOLID") {
                    if ((_a = p.boundVariables) === null || _a === void 0 ? void 0 : _a.color) {
                        const variable = figma.variables.getVariableById(p.boundVariables.color.id);
                        return {
                            type: p.type,
                            valueType: "VARIABLE",
                            variable: this.convertVariable(variable),
                            visible: p.visible
                        };
                    }
                    else {
                        return {
                            type: p.type,
                            valueType: 'COLOR',
                            value: { r: p.color.r, g: p.color.g, b: p.color.b, a: p.opacity || 1 },
                            visible: p.visible
                        };
                    }
                }
                p = p;
                return {
                    type: p.type,
                    gradientTransform: p.gradientTransform,
                    gradientStops: p.gradientStops,
                    visible: p.visible,
                    opacity: p.opacity || 1
                };
            })
        }));
    }
    getExportEffectStyles() {
        return figma.getLocalEffectStyles().map(style => ({
            name: style.name,
            effects: style.effects.map(effect => {
                if (effect.type == "DROP_SHADOW") {
                    return {
                        type: effect.type,
                        color: effect.color,
                        offset: effect.offset,
                        radius: effect.radius,
                        spread: effect.spread,
                        visible: effect.visible,
                    };
                }
                else if (effect.type == "INNER_SHADOW") {
                    return {
                        type: effect.type,
                        color: effect.color,
                        offset: effect.offset,
                        radius: effect.radius,
                        spread: effect.spread,
                        visible: effect.visible,
                    };
                }
                return {
                    type: effect.type,
                    radius: effect.radius,
                    visible: effect.visible
                };
            })
        }));
    }
    getExportFontStyles() {
        return figma.getLocalTextStyles().map(style => {
            return {
                name: style.name,
                fontSize: style.fontSize,
                fontWeight: (() => {
                    try {
                        const text = figma.createText();
                        text.textStyleId = style.id;
                        const result = text.fontWeight;
                        text.remove();
                        return result;
                    }
                    catch (_a) {
                        return 400;
                    }
                })(),
                fontName: {
                    family: style.fontName.family,
                },
                letterSpacing: style.letterSpacing,
                lineHeight: style.lineHeight
            };
        });
    }
    getExportVariables() {
        const entries = figma.variables.getLocalVariables()
            .filter(variable => variable.resolvedType == "FLOAT" || variable.resolvedType == "COLOR")
            .map(variable => {
            const obj = this.convertVariable(variable);
            return [obj.id, obj];
        });
        return Object.fromEntries(entries);
    }
    convertVariable(variable) {
        const collection = figma.variables.getVariableCollectionById(variable.variableCollectionId);
        const valuesByModes = Object.keys(variable.valuesByMode).map(key => ({ mode: collection.modes.filter(mode => mode.modeId == key)[0].name, value: variable.valuesByMode[key] }));
        const obj = {
            id: variable.id,
            name: variable.name,
            resolvedType: variable.resolvedType,
            valuesByMode: valuesByModes,
            collection: {
                id: collection.id,
                name: collection.name,
            }
        };
        return obj;
    }
};

})();

/******/ })()
;