/**
 * module Magneto.Behavior
 *
 * dependencies Magneto.Utils Magneto.Dom
 *
 * class W10MOW extends Base
 *  
 */

;(function()
{

  // module name
  var _MODULE_NAME_ = 'Magneto.Behavior';

  // resolve namespace namespace
  Magneto = typeof Magneto === 'undefined' && {} || Magneto;
  var Behavior = Magneto.Behavior = Magneto.Behavior || {};

  // dependencies
  var Utils = Magneto.Utils, Dom = Magneto.Dom;
  if(!Utils || !Dom) throw Error(_MODULE_NAME_ + ' dependencies error');
  
  // base Behavior class
  var Base = function()
  {
    this.state = 'null';
    this.stateCallbacks = {};
    this.transitionCallbacks ={};
  }
 
  // behavior start function
  Base.prototype.start = function()
  {
  }

  // set state callback 
  Base.prototype.onstate = function(state, callback, context)
  {
    if(typeof this.stateCallbacks[state] === 'undefined')
      this.stateCallbacks[state] = [];

    if(typeof context === 'undefined')
      context = this;

    this.stateCallbacks[state].push(callback.bind(context));
  }

  // set transition callback
  Base.prototype.ontransition = function(from, to, callback, context)
  {
    var transition = from + ':' + to;

    if(typeof this.transitionCallbacks[transition] === 'undefined')
      this.transitionCallbacks[transition] = [];

    if(typeof context === 'undefined')
      context = this;

    this.transitionCallbacks[transition].push(callback.bind(context));
  }

  // move behavior state and exec callbacs
  Base.prototype.move = function(state)
  {
    var transition = this.state + ':' + state;
    
    Utils.log('behavior transition', transition);

    this.state = state;

    if(typeof this.transitionCallbacks[transition] !== 'undefined')
      this.transitionCallbacks[transition]
        .forEach(function(cb)
        {
          cb();
        });

    if(typeof this.stateCallbacks[state] !== 'undefined')
      this.stateCallbacks[state]
        .forEach(function(cb)
        {
          cb();
        });

  }

  // RA behavior class, show right away
  var RA = Behavior.RA = function()
  {
    Base.call(this);
  }

  // inherits
  RA.prototype = Object.create(Base.prototype);
  RA.prototype.constructor = RA;

  RA.prototype.start = function()
  {
    this.move('fire');
  }

  // WM behavior class, show after n seconds
  var BhWM = Behavior.BhWM = function(n)
  {
    Base.call(this);
    this.n = Number(n) || 0;
  }

  // inherits
  BhWM.prototype = Object.create(Base.prototype);
  BhWM.prototype.constructor = BhWM;
  
  BhWM.prototype.start = function()
  {
    var self = this;
    setTimeout(function()
    {
      self.move('fire');
    }, 1000 * this.n)
    this.move('init');    
  }


  // BhUC behavior class, wait 5 seconds, if mouse out window then fire
  var BhUC = Behavior.BhUC = function(s)
  {
    // super constructor call
    Base.call(this);
    this.s = Number(s) || 0;
    this.v = 0;
  }

  // inherits
  BhUC.prototype = Object.create(Base.prototype);
  BhUC.prototype.constructor = BhUC;
  
  BhUC.prototype.start = function()
  {
    var self = this;

    var mouseOutWindowDetect = function(event)
    {
      if(event.toElement === null && event.relatedTarget === null && self.s < self.v * 1.5)
      {
        self.move('fire');
      }
        
    };

    var mouseMoveVelocityCalc = (function()
    {
      var x = 0;
      var y = 0;
      var t = 0;

      return  function(event)
      {
        var dt = event.timeStamp - t;
        var dx = x - event.screenX;
        var dy = y - event.screenY;
        
        x = event.screenX;
        y = event.screenY;
        t = event.timeStamp;

        self.v = Math.sqrt(dx * dx + dy * dy) / dt;
      };
    })();

    this.onstate('init', function()
    {
      setTimeout(function()
      {
        self.move('aim');
      }, 5 * 1000);
    }, this);
    
    this.ontransition('init', 'aim', function()
    {
      Dom.addEventListener(document, 'mouseout', mouseOutWindowDetect);
      Dom.addEventListener(document, 'mousemove', mouseMoveVelocityCalc);
    }, this);

    this.ontransition('aim', 'fire', function()
    {
      this.move('end');
      Dom.removeEventListener(document, 'mouseout', mouseOutWindowDetect);
    }, this);

    this.move('init');
  }


  // BhCB behavior class, fire if click button
  var BhCB = Behavior.BhCB = function(sel)
  {
    // super constructor call
    Base.call(this);
    this.sel = sel;
  }

  // inherits
  BhCB.prototype = Object.create(Base.prototype);
  BhCB.prototype.constructor = BhCB;
  
  BhCB.prototype.start = function()
  {
    var el = document.querySelector(this.sel);
    var self = this;

    el && (this.onstate('init', function()
    {
      Dom.on(el, 'click', function(event)
      {
        self.move('fire');
      });
    }, this), this.move('init'));
  }

}());
