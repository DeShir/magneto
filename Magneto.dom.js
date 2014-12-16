/**
 * module Magneto.Dom
 *
 * dependencies Magneto.Utils
 *
 * method css(el, properties)
 * method addEventListener(el, eventType, callback)
 *
 */

;(function()
{

  // module name
  var _MODULE_NAME_ = 'Magneto.Dom';

  // resolve namespace namespace
  Magneto = typeof Magneto === 'undefined' && {} || Magneto;
  var Dom = Magneto.Dom = Magneto.Dom || {};

  // dependencies
  var Utils = Magneto.Utils;
  if(!Utils) throw Error(_MODULE_NAME_ + ' dependencies error');

  // private functions
  //
  function steelSheet()
  {
    var style = document.createElement('style');

    // webkit hack
    style.appendChild(document.createTextNode(''));
    document.head.appendChild(style);

    steelSheet = function()
    {
      return style.sheet;
    }

    return style.sheet;
  }

  Dom.addCssRule = function(sel, rule, index)
  {
    var sheet = steelSheet();
    if('undefined' !== typeof sheet.insertRule)
    {
      sheet.insertRule(sel + ' {' + rule + '}', index);
    }
    else if('undefined' !== typeof sheet.addRule) 
    {
      sheet.addRule(sel, rule, index);
    }
  }

  // TODO improve perfomance (loop and render)
  Dom.css = function(el, properties)
  {
    if(!el) return Utils.error(Error(_MODULE_NAME_ + '.addEventListener error: el is undefined'));
    
    var style = el.style;

    for(var key in properties)
    {
      var val = properties[key];
      if({'left': true, 'top': true, 'width': true , 'height': true}[key])
      {
        if(typeof val === 'number')
          val = val + 'px'
      };
      style[key] = val;
    };
  };

  Dom.computedCss = function(el, propertyKeys)
  {
    var style = window.getComputedStyle(el, '');
    var properties = {};
    propertyKeys
      .forEach(function(key)
      {
        properties[key] = style[key];
      });

    return properties;
    
  }
 
  // @deprecated 
  Dom.addEventListener = function(el, eventType, callback)
  {
    if(!el) return Utils.error(Error(_MODULE_NAME_ + '.addEventListener error: el is undefined'));
  	if(el.addEventListener)
		  el.addEventListener(eventType, callback, false);
  	else if (el.attachEvent)
	  	el.attachEvent('on' + eventType, callback);
  };

  // @deprecated
  Dom.removeEventListener = function(el, eventType, callback)
  {
    if(!el) return Utils.error(Error(_MODULE_NAME_ + '.removeEventListener error: el is undefined'));
  	if(el.removeEventListener)
		  el.removeEventListener(eventType, callback, false);
  	else if (el.detachEvent)
	  	el.detachEvent('on' + eventType, callback);
  };

  Dom.on = function(el, eventType, callback)
  {
    Dom.addEventListener(el, eventType, callback);
  };

  Dom.off = function(el, eventType, callback)
  {
    Dom.removeEventListener(el, eventType, callback);
  };

  Dom.once = function(el, eventType, callback)
  {
    var handler = function()
    {
      callback.apply({}, arguments);
      Dom.off(el, eventType, handler);
    };
    Dom.on(el, eventType, handler);
  };

  // setCookie
  //
  // @param {String} key
  // @param {String} val
  // @param {expires: Number|Date, patch: String, domain: String, secure: Boolean} options
  Dom.setCookie = function(key, val, options)
  {
    var o = options || {};
    var expires = o.expires;

    if( 'number' === typeof expires)
    {
      var date = new Date;
      date.setTime(date.getTime() + 1000 * expires);
      expires = o.expires = date;
    }
    if(expires && expires.toUTCString)
    {
      o.expires = expires.toUTCString();
    }
    var cookie = key + '=' + encodeURIComponent(val);
    for(var i in o)
    {
      var k = o[i];
      cookie += ';' + i;
      if(k !== true)
      {
        cookie += '=' + k;
      }
      document.cookie = cookie;
    }
  };

  Dom.getCookie = function(key)
  {
    var matches = document.cookie.match(new RegExp('(?:^|; )' + key.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
    return matches ? decodeURIComponent(matches[1]) : null;
  };

  Dom.unsetCookie = function(key)
  {
    Dom.setCookie(key, '', {expires: -1});
  };
}());
