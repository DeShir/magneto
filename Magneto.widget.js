  /**
 * module Magneto.Widget
 *
 * dependencies Magneto.Dom Magneto.Utils Magneto.Animation
 *
 * class IFrame(url)
 *  method load() return Deffered
 *  method show()
 *  method hide()
 *  method position(left, top)
 *  method size(width, height)
 *  method aligning()
 *
 */

;(function()
{

  // module name
  var _MODULE_NAME_ = 'Magneto.Widget';

  // resolve namespace namespace
  Magneto = typeof Magneto === 'undefined' && {} || Magneto;
  var Widget = Magneto.Widget = Magneto.Widget || {};

  // dependencies
  var Dom = Magneto.Dom, Utils = Magneto.Utils, Animation = Magneto.Animation, Transport = Magneto.Transport, Setting = Magneto.Setting;
  if( !Dom || !Utils || !Animation || !Transport || !Setting) throw Error(_MODULE_NAME_ + ' dependencies error');

  // class Widget.IFrame
  var IFrame = Widget.IFrame = function(url)
  {
    this.url = url;
   
    // setting
    this.setting = {};

    // prepare url
    var a = document.createElement('a');
    a.href = url;
    
    // set origin for sending message to iframe contenWindow
    this.origin = a.protocol + '//' + a.hostname;

    // create iframe element
    var el = this.el = document.createElement('iframe');
    this.width = el.clientWidth;
    this.height = el.clientHeight;

    // set style iframe element
    el.scrolling = 'no'; 
    el.marginHeight = '0';
    el.marginWidth = '0';
    el.frameBorder = '0';
    el.allowTransparency = true;

    // TODO: uncomment border style
    Dom.css(el, {'display' : 'none', 'position' : 'fixed', 'border' : 'none', 'width': '100%', 'overflow' : 'hidden', 'zIndex': '9999'});
    
    // set message handler for process iframe command
    var self = this;
    var origin = this.origin;
   
    Dom.on(window, 'message', function(event)
    {
      if(event.origin !== origin)
        return;
      
      try
      {
        var params = JSON.parse(event.data);
      }
      catch(err)
      {
        Utils.error(err);
        Utils.debug(event.data);
      }
      self.executeDeffered(params);
    });

    // window resize
    //
    Dom.on(window, 'resize', function(event)
    {
      if(self.isShown)
      {
        self.align();
      }
    });

    // deffereds storage object
    //
    this.deffereds = {};

    // hide event
    //
    var hideDeffered = new Utils.Deffered;
    hideDeffered.done(function(data)
    {
      self.hide();
      if('main' === data.state)
      {
        var host = encodeURIComponent(window.location.host);
        Transport.ajax(Setting.origin + '/widget/hide/' + host, {crossdomain: true})
          .fail(function(err)
          {
            Utils.error(err);
          });
      }
    });
      
    this.setDeffered('hide', hideDeffered);
  };

  // overlay 
  //
  IFrame.prototype.createOverlay = function()
  {

  }

  // init callbo button
  //
  IFrame.prototype.createButton = function()
  {
    var callupBtnHtml =
    [
      '  <div class="callup-container">',
      '    <div class="callup-btn" onclick="return false" data-callbo="callup">',
      '      <span class="callup-btn-text">Обратный звонок</span>',
      '      <span class="callup-ico"><i class="callboicon-13" data-callbo-ico></i></span>',                  
      '    </div>',
      '  </div>'
    ].join('\n');

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = Setting.origin + '/stylesheets/magneto.css';
    var head = document.head || document.getElementsByTagName('head')[0];
    head.appendChild(link);

    var callupBtnDiv = document.createElement('div');

    this.callupBtn = callupBtnDiv;

    function isIE () {
      var myNav = navigator.userAgent.toLowerCase();
      return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
    }

    if(8 == isIE())
    {
      callupBtnDiv.className += ' ie8';
    }

    callupBtnDiv.innerHTML = callupBtnHtml;
    document.body.appendChild(callupBtnDiv);
  }  

  IFrame.prototype.setVisualMode = function(mode)
  {
    this.el.src = Setting.origin + '/visual/' + mode;
  }

  IFrame.prototype.setElText = function(sel, text)
  {
    this.command('set-text', {sel: sel, text: text});
  }

  IFrame.prototype.setTitleText = function(text)
  {
    this.setElText('[data-sel="window-title"]', text);
  }

  IFrame.prototype.setBtnText = function(text)
  {
    this.setElText('[data-sel="window-btn"]', text); 
  }

  IFrame.prototype.setTitleFail = function(text)
  {
    this.setElText('[data-sel="window-title-fail"]', text);
  }

  IFrame.prototype.setMsgFail = function(text)
  {
    this.setElText('[data-sel="msg-fail"]', text);
  }

  IFrame.prototype.setTitleDone = function(text)
  {
    this.setElText('[data-sel="window-title-done"]', text);
  }

  IFrame.prototype.setMsgDone = function(text)
  {
    this.setElText('[data-sel="msg-done"]', text);
  }

  // css style
  //

  // btn style 
  //

  // callup button bg color
  IFrame.prototype.cssCallupBtnBgColor = function(r, g, b, a)
  {
    Dom.addCssRule('.callup-btn', 'background-color: rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')');
  }

  // callup button and ico font color
  IFrame.prototype.cssCallupBtnFontColor = function(r, g, b, a)
  {
    Dom.addCssRule('.callup-btn-text', 'color: rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')');
    Dom.addCssRule('.callup-ico', 'color: rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')');
  }

  // callup buttom border radius
  IFrame.prototype.cssCallupBtnBorderRadius = function(r)
  {
    Dom.addCssRule('.callup-btn', 'border-radius: ' + r + 'px ' + r + 'px 0 0');
  }

  // callup btn ico
  IFrame.prototype.cssCallupBtnIco = function(n)
  {
    var btn = document.querySelector('[data-callbo-ico]');
    btn.className = 'callboico-' + n;
  }

  // window style 
  //

  // window width
  IFrame.prototype.cssWindowWidth = function(w)
  {
    Dom.addCssRule('body', 'width: ' + w + 'px');
    this.resize();
  }

  // window bg color
  IFrame.prototype.cssWindowBgColor = function(r, g, b, a)
  {
    Dom.addCssRule('.widow', 'background-color: rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')');
  }

  // window box shadow params
  IFrame.prototype.cssWindowBoxShadowParams = function(s, h, r, g, b, a)
  {
    Dom.addCssRule('.window', 'margin: ' + h + 'px');
    Dom.addCssRule('.window', 'box-shadow: 0 0 ' + s + 'px ' + h +  'px rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')');
    this.resize();
  }

  // window border radius
  IFrame.prototype.cssWindowBorderRadius = function(r)
  {
    Dom.addCssRule('.window-border', 'border-radius: ' + r + 'px');
    this.resize();
  }

  // window border width
  IFrame.prototype.cssWindowBorderWidth = function(w)
  {
    Dom.addCssRule('.window-border', 'border-width: ' + w + 'px');
    this.resize();
  }

  // window border color
  IFrame.prototype.cssWindowBorderColor = function(r, g, b, a)
  {
    Dom.addCssRule('.window-border', 'border-color: rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')');
  }

  // window title font-size
  IFrame.prototype.cssWindowTitleFontSize = function(s)
  {
    Dom.addCssRule('.window-title', 'font-size: ' + s + 'px');
    this.resize();
  }

  // window title font color
  IFrame.prototype.cssWindowTitleFontColor = function(r, g, b, a)
  {
    Dom.addCssRule('.window-title', 'color: rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')');
  }

  // window input font-size
  IFrame.prototype.cssWindowInputFontSize = function(s)
  {
    Dom.addCssRule('.phone-input', 'font-size: ' + s + 'px');
    this.resize();
  }

  // window input font color
  IFrame.prototype.cssWindowInputFontColor = function(r, g, b, a)
  {
    Dom.addCssRule('.phone-input', 'color: rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')');
  }

  // window btn bg color
  IFrame.prototype.cssWindowBtnBgColor = function(r, g, b, a)
  {
    Dom.addCssRule('.callup-btn', 'background-color: rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')');
  }

  // window btn font size
  IFrame.prototype.cssWindowBtnFontSize = function(s)
  {
    Dom.addCssRule('.callup-btn', 'font-size: ' + s + 'px');
    this.resize();
  }

  // window btn font color
  IFrame.prototype.cssWindowBtnFontColor = function(r, g, b, a)
  {
    Dom.addCssRule('.callup-btn', 'color: rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')');
  }

  // window btn width
  IFrame.prototype.cssWindowBtnWidth = function(w)
  {
    Dom.addCssRule('.callup-btn', 'width: ' + w + 'px');
    this.resize();
  }

  // window btn border radius
  IFrame.prototype.cssWindowBtnBoredrRadius = function(r)
  {
    Dom.addCssRule('.callup-btn', 'border-radius: ' + r + 'px');
    this.resize();
  }

  // widget window remark display
  IFrame.prototype.cssWindowRemarkDisplay = function(display)
  {
    Dom.addCssRule('.window-info', 'display: ' + display);
    this.resize();
  }


  IFrame.prototype.resize = function()
  {
    var self = this;

    this.command('size')
      .done(function(size)
      {
        self.resizeAnimate(size.width, size.height);
      })
      .fail(function(err)
      {
        Utils.error(err);
      });
  }
  

  IFrame.prototype.load = function()
  {
    var deffered = new Utils.Deffered;
    var el = this.el;
    var self = this;

    var host = encodeURIComponent(window.location.host);

    // get setting
    Transport.ajax(Setting.origin + '/widget/setting/' + host, {crossdomain: true})
      .done(function(xhr)
      {
        Utils.debug('widget setting: done');
        if('undefined' !== typeof xhr && xhr.responseText)
        {
          try
          {
            self.setting = JSON.parse(xhr.responseText);
            // check allow
            if(self.setting.allow)
            {
              // fire loading
              el.src = self.url + '/' + host;
              // append to body
              document.body.appendChild(el);

            }
            else
            {
              deffered.set('fail', Error('iframe deny, check balans'));
            }
          }
          catch(err)
          {
            Utils.error(err);
            deffered.set('fail', Error('bad response format for setting'));
          }
        }
      });
    
    Dom
      .on(el, 'load', function(event)
      {
        Utils.log('iframe loaded', el.src);
        self
          .command('origin', {origin: window.location.origin || (window.location.protocol + '//' + window.location.hostname)})
            .done(function()
            {
              Utils.log('iframe set origin');
              
              // all done
              deffered.set('done');
            })
            .fail(function(err)
            {
              Utils.error(err);
              deffered.set('fail', Error('set origin command fail'));
            });        
        


          // FIXME load hendler rise when iframe reloaded to set origin 
          //
          Dom
            .once(el, 'load', function(event)
            {
              self
                .command('origin', {origin: window.location.origin || (window.location.protocol + '//' + window.location.hostname)})
                  .done(function()
                  {
                    self.command('size')
                      .done(function(size)
                      {
                        self.resizeAnimate(size.width, size.height);
                      })
                      .fail(function(err)
                      {
                        Utils.error(err);
                      });
                  })
                  .fail(function(err)
                  {
                    Utils.error(err);
                  });
            });
      });

    // fail
    Dom
      .once(el, 'error', function(event)
      {
        deffered.set('fail', Error('iframe not load'));
      });
    return deffered;
  }
  
  IFrame.prototype.show = function()
  {
    var el = this.el;
    var self = this;

    Dom.css(el, {'display': 'block', 'opacity' : 0});

    // get origin size, before showing
    //
    //  If iframe hidden(display:none), Gecko returned zero size, so first set display:block
    this
      .command('size')
        .done(function(size)
        {
          self.size(size.width, size.height);
          self.align();
          // a little up box for effect
          Dom.css(el, {'top': self.top - 10});
          Animation.animate(el, {'opacity' : 1, 'top' : self.top }, 300, new Animation.EasingLinear)
            .done(function()
            {
              self.isShown = true;
            });
          // send show command
          var host = encodeURIComponent(window.location.host);
          Transport.ajax(Setting.origin + '/widget/show/' + host, {crossdomain: true})
            .fail(function(err)
            {
              Utils.error(err);
            });
        })
        .fail(function(err)
        {
          Utils.error(err);
        });
  };
 
  IFrame.prototype.hide = function()
  {
    var el = this.el;
    var self = this;
    Animation.animate(el, {'opacity': 0, 'top': this.top - 10 }, 300, new Animation.EasingLinear)
      .done(function()
      {
        Dom.css(el, {'display': 'none'});
        self.isShown = false;
      });
  }

  IFrame.prototype.position = function(left, top)
  {
    this.top = top;
    this.left = left;
    Dom.css(this.el, {'left': left, 'top': top})
  }

  IFrame.prototype.size = function(width, height)
  {
    this.width = width;
    this.height = height;
    Dom.css(this.el, {'width': width, 'height': height})
  }

  IFrame.prototype.resizeAnimate = function(width, height)
  {
    var self = this;
    var easing = new Animation.EasingLinear;
    var initialState = [this.width, this.height];
    var completState = [width, height];
    
    easing.initialState(initialState);
    easing.completState(completState);
    
    easing.action(function(currentState)
    {
      var width = currentState[0];
      var height = currentState[1];

      self.size(width, height);
      self.align();
    });
    
    easing.start({duration: 300, delay: 30});
  }

  IFrame.prototype.align = function()
  {
    var h = window.innerHeight || document.documentElement.clientHeight;
    var w = window.innerWidth || document.documentElement.clientWidth;
    var l = (w - this.width) >> 1;
    var t = (h - this.height) >> 2;

    this.position(l, t);
  };

  IFrame.prototype.command = function(command, data)
  {
    var msg = JSON.stringify({command: command, data: data});
    var origin = this.origin;
    var deffered = new Utils.Deffered;
    // put deffered into responses storage
    this.setDeffered(command, deffered);
    this.el.contentWindow.postMessage(msg, origin);

    return deffered;
  };

  IFrame.prototype.setDeffered = function(command, deffered)
  {
    this.deffereds[command] = deffered;
  }

  IFrame.prototype.executeDeffered = function(params)
  {
    if(typeof params.command === 'string' 
        && typeof params.data === 'object')
    {
      var deffered = this.deffereds[params.command];
      deffered.set('done', params.data);
    }
  }
}());
