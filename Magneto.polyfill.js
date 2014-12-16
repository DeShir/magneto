if(!Object.create) 
{
    Object.create = (function()
    {
        function F(){}
        
        return function(o)
        {
            if (arguments.length !== 1) 
            {
                throw new Error('Object.create implementation only accepts one parameter.');
            }
            F.prototype = o;
            return new F()
        }
    })();
}

if(!Function.prototype.bind) 
{
    Function.prototype.bind = function(oThis) 
    {
        if (typeof this !== 'function') 
        {
          // closest thing possible to the ECMAScript 5
          // internal IsCallable function
          throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs = Array.prototype.slice.call(arguments, 1), 
            fToBind = this, 
            fNOP = function () {},
            fBound = function () 
            {
              return fToBind.apply(this instanceof fNOP && oThis
                     ? this
                     : oThis,
                     aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}

// Шаги алгоритма ECMA-262, 5-е издание, 15.4.4.18
// Ссылка (en): http://es5.github.io/#x15.4.4.18
// Ссылка (ru): http://es5.javascript.ru/x15.4.html#x15.4.4.18
if (!Array.prototype.forEach) {

  Array.prototype.forEach = function (callback, thisArg) {

    var T, k;

    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Положим O равным результату вызова ToObject passing the |this| value as the argument.
    var O = Object(this);

    // 2. Положим lenValue равным результату вызова внутреннего метода Get объекта O с аргументом "length".
    // 3. Положим len равным ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. Если IsCallable(callback) равен false, выкинем исключение TypeError.
    // Смотрите: http://es5.github.com/#x9.11
    if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
    }

    // 5. Если thisArg присутствует, положим T равным thisArg; иначе положим T равным undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Положим k равным 0
    k = 0;

    // 7. Пока k < len, будем повторять
    while (k < len) {

      var kValue;

      // a. Положим Pk равным ToString(k).
      //   Это неявное преобразование для левостороннего операнда в операторе in
      // b. Положим kPresent равным результату вызова внутреннего метода HasProperty объекта O с аргументом Pk.
      //   Этот шаг может быть объединён с шагом c
      // c. Если kPresent равен true, то
      if (k in O) {

        // i. Положим kValue равным результату вызова внутреннего метода Get объекта O с аргументом Pk.
        kValue = O[k];

        // ii. Вызовем внутренний метод Call функции callback с объектом T в качестве значения this и
        // списком аргументов, содержащим kValue, k и O.
        callback.call(T, kValue, k, O);
      }
      // d. Увеличим k на 1.
      k++;
    }
    // 8. Вернём undefined.
  };
}

// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {

  Array.prototype.map = function(callback, thisArg) {

    var T, A, k;

    if (this == null) {
      throw new TypeError(" this is null or not defined");
    }

    // 1. Let O be the result of calling ToObject passing the |this| 
    //    value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal 
    //    method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + " is not a function");
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let A be a new array created as if by the expression new Array(len) 
    //    where Array is the standard built-in constructor with that name and 
    //    len is the value of len.
    A = new Array(len);

    // 7. Let k be 0
    k = 0;

    // 8. Repeat, while k < len
    while (k < len) {

      var kValue, mappedValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal 
      //    method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal 
        //    method of O with argument Pk.
        kValue = O[k];

        // ii. Let mappedValue be the result of calling the Call internal 
        //     method of callback with T as the this value and argument 
        //     list containing kValue, k, and O.
        mappedValue = callback.call(T, kValue, k, O);

        // iii. Call the DefineOwnProperty internal method of A with arguments
        // Pk, Property Descriptor 
        // { Value: mappedValue, 
        //   Writable: true, 
        //   Enumerable: true, 
        //   Configurable: true },
        // and false.

        // In browsers that support Object.defineProperty, use the following:
        // Object.defineProperty(A, k, { 
        //   value: mappedValue, 
        //   writable: true, 
        //   enumerable: true, 
        //   configurable: true 
        // });

        // For best browser support, use the following:
        A[k] = mappedValue;
      }
      // d. Increase k by 1.
      k++;
    }

    // 9. return A
    return A;
  };
}


// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
  Object.keys = (function() {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}

"getComputedStyle" in window || function() {
  function c(a, b, g, e) {
    var h = b[g];
    b = parseFloat(h);
    h = h.split(/\d/)[0];
    e = null !== e ? e : /%|em/.test(h) && a.parentElement ? c(a.parentElement, a.parentElement.currentStyle, "fontSize", null) : 16;
    a = "fontSize" == g ? e : /width/i.test(g) ? a.clientWidth : a.clientHeight;
    return "em" == h ? b * e : "in" == h ? 96 * b : "pt" == h ? 96 * b / 72 : "%" == h ? b / 100 * a : b;
  }
  function a(a, c) {
    var b = "border" == c ? "Width" : "", e = c + "Top" + b, h = c + "Right" + b, l = c + "Bottom" + b, b = c + "Left" + b;
    a[c] = (a[e] == a[h] == a[l] == a[b] ? [a[e]] : a[e] == a[l] && a[b] == a[h] ? [a[e], a[h]] : a[b] == a[h] ? [a[e], a[h], a[l]] : [a[e], a[h], a[l], a[b]]).join(" ");
  }
  function b(b) {
    var d, g = b.currentStyle, e = c(b, g, "fontSize", null);
    for (d in g) {
      /width|height|margin.|padding.|border.+W/.test(d) && "auto" !== this[d] ? this[d] = c(b, g, d, e) + "px" : "styleFloat" === d ? this["float"] = g[d] : this[d] = g[d];
    }
    a(this, "margin");
    a(this, "padding");
    a(this, "border");
    this.fontSize = e + "px";
    return this;
  }
  b.prototype = {};
  window.getComputedStyle = function(a) {
    return new b(a);
  };
}();