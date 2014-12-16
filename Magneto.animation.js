/**
 * module Magneto.Animation
 *
 * dependencies Magneto.Utils Magneto.Dom
 *
 * class
 *  
 */

;(function()
{

  // module name
  var _MODULE_NAME_ = 'Magneto.Animation';

  // resolve namespace 
  Magneto = typeof Magneto === 'undefined' && {} || Magneto;
  var Animation = Magneto.Animation = Magneto.Animation || {};

  // dependencies
  var Utils = Magneto.Utils, Dom = Magneto.Dom;
  if(!Utils || !Dom) throw Error(_MODULE_NAME_ + ' dependencies error');
  
  // Easing class
  var Easing = function()
  {
    this.hTimer = null;

    // initial cb
    this.cb = function(){};
  }

  Easing.prototype.initialState = function(state)
  {
    this.iState = state.slice(0);
  }

  Easing.prototype.completState = function(state)
  {
    this.cState = state.slice(0);
  }

  Easing.prototype.start = function(opts)
  {
    var self = this;
   
    var deffered = new Utils.Deffered; 

    // количество повторений
    var count = (opts.duration / opts.delay) >> 1;
    // текущая позиция
    var pos = 0;
    // диапозон 
    var ranges = [];
    
    this.iState.forEach(function(val, index)
    {
      ranges[index] = self.cState[index] - val;
    });
    
    this.cb(this.iState);

    this.hTimer = window.setInterval(function()
    {
      pos += 1;

      var current = ranges.map(function(range, index)
      {
        return self.iState[index] + range * self.func(pos / count);
      });
      
      self.cb(current);

      if(pos === count)
      {
        self.stop();
        deffered.set('done');
      }

    }, opts.delay);

    return deffered;
  }

  Easing.prototype.stop = function()
  {
    window.clearInterval(this.hTimer);
    this.hTimer = null;
  }

  Easing.prototype.func = function()
  {
    throw Error('must be override')
  }

  Easing.prototype.action = function(cb)
  {
    this.cb = cb;
  }

  var EasingLinear = Animation.EasingLinear = function()
  {
    Easing.call(this);
  }

  // inherits
  EasingLinear.prototype = Object.create(Easing.prototype);
  EasingLinear.prototype.constructor = EasingLinear;


  EasingLinear.prototype.func = function(x)
  {
    return x;
  }

  

  Animation.animate = function(el, properties, duration, easing)
  {
    var keyProperties = Object.keys(properties);
    
    // get resolved(in px) initial css state
    var initialStyle = Dom.computedCss(el, keyProperties);

    // get resolved(in px) complet css state
    Dom.css(el, {'display' : 'none'});
    Dom.css(el, properties);
    var completStyle = Dom.computedCss(el, keyProperties);
    // restore css style
    Dom.css(el, properties);
    Dom.css(el, {'display' : ''});
    
    var initialState = [];
    var completState = [];

    keyProperties
      .forEach(function(key)
      {
        initialState.push(parseFloat(initialStyle[key]));
        completState.push(parseFloat(completStyle[key]));
      });

    easing.initialState(initialState);
    easing.completState(completState);

    easing.action(function(currentState)
    {
      var currentStyle = {};
      currentState.forEach(function(val, index)
      {
        currentStyle[keyProperties[index]] = val;
      });

      Dom.css(el, currentStyle);
    });
    
    return easing.start({duration: duration, delay: 30});
  }
}());
