/**
 * module Magneto.Utils
 *
 * method error(err)
 *
 * class Deffered
 *  method done(callback, context)
 *  method fail(callback, context)
 *  method always(callback, context)
 *  method set(state)
 *
 */

;(function()
{
  // module name
  var _MODULE_NAME_ = 'Magneto.Utils';

  // resolve namespace namespace
  Magneto = typeof Magneto === 'undefined' && {} || Magneto;
  var Utils = Magneto.Utils = Magneto.Utils || {};

  Utils.error = function(err)
  {
    console 
      && (
        console.error && (console.error('' + err), true) && console.trace && (console.trace(), true)
        || console.log && console.log('error: ', '' + err)
      )
  }

  Utils.log = function()
  {
    console 
      && (
          console.log && (
            console.log.apply && (console.log.apply(console, arguments), true)
            || (console.log('log: '), true) && console.dir &&  console.dir(arguments)
          )
        );
  }

  Utils.debug = function()
  {
    console
      && (
        (
          (console.log && console.log.apply) && (console.log.apply(console, arguments), true) && console.trace && (console.trace(), true)
          || console.log && (console.log('log: '), true) && console.dir &&  console.dir(arguments)
        )
      );
  }

  var Deffered = Utils.Deffered = function()
  {
    this.callbacks = {done: [], fail: [], always: []};

    this.state = 'wait'; // done, fail
    this.args = null;
  }

  Deffered.prototype.done = function(callback, context)
  {
    if(typeof context === 'undefined')
      context = this;

    if(this.state === 'done')
      this.exec([callback.bind(context)]);
    else if(this.state === 'wait')
      this.callbacks.done.push(callback.bind(context));
    
    return this;
  }
  
  Deffered.prototype.fail = function(callback, context)
  {
   if(typeof context === 'undefined')
    context = this;
  
   if(this.state === 'fail')
      this.exec([callback.bind(context)]);
    else if(this.state === 'wait')
      this.callbacks.fail.push(callback.bind(context));
    
    return this;
 
  }

  Deffered.prototype.always = function(callback, context)
  {
    if(typeof context === 'undefined')
      context = this;

    if(this.state !== 'wait')
      this.exec([callback.bind(context)]);
    else 
      this.callbacks.always.push(callback.bind(context));
    
    return this;
  
  }
 
  Deffered.prototype.set = function(state, args)
  {
    if({'done':true, 'fail':true}[state])
    {
      this.state = state;
      this.args = args;
      this.exec(this.callbacks.always);

      if(this.state === 'done')
        this.exec(this.callbacks.done);
      else 
        this.exec(this.callbacks.fail);
    }
    else
    {
      Utils.error(_MODULE_NAME_ + '.Deffered.set error: state must be done or fail, but its ' + state)
    }
    
    return this;
  }

  Deffered.prototype.exec = function(callbacks, args)
  {
    var self = this;
    callbacks
      .forEach(function(callback)
      {
        callback(self.args);
      });
  }

}());
