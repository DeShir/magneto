;(function()
{
  try
  {
    var Widget = Magneto.Widget;
    var Utils = Magneto.Utils;
    var Behavior = Magneto.Behavior;
    var Setting = Magneto.Setting;
    var Dom = Magneto.Dom;
    var visualMode = 'undefined' !== typeof Setting.visualMode && true !== Setting.visualMode;

    Magneto.ns = Magneto.ns || {};

    if(Setting.origin)
    {
      var url = visualMode ? (Setting.origin + '/visual/main') : (Setting.origin + '/widget/main');
      var iframe = Magneto.ns.widget = new Widget.IFrame(url);
      iframe
        .load()
          .done(function()
          {
            if(visualMode)
            {
              // visual mode
              Utils.log('widget visual mode');
              iframe.createButton();
              iframe.show();
            }
            else
            {
              Utils.log('widget setting:', iframe.setting);

              // check conditional
              var setting = iframe.setting;
              var date = new Date;
              var d = (date.getDay() + 6) % 7; // 0 - mon, 1 - tue ...
              var h = date.getHours();
              var m = date.getMinutes();
              var timerow = setting.timetable[d];
              var from = timerow.from.split(':').map(Number); // from[0] is hours, from[1] is minutes 
              var to = timerow.to.split(':').map(Number);
              var shown = 'yes' === Dom.getCookie('magneto.shown'); // widget alredy shown
              var reshow = setting.reshow; // reshow widget flag
              var active = !timerow.notActive;
              // widget is embeded to callbo
              // var behaviors = true === Setting.embeded ? {} : setting.behaviors;
              var behaviors = setting.behaviors;
              
              // if to = 00:00:00 then to = 24:00 (begin of the next day or end of the current day)
              if(0 === to[0] && 0 === to[1]) to[0] = 24;

              Utils.log('timetable from', setting.timetable[d].from);
              Utils.log('timetable to', setting.timetable[d].to);
              Utils.log('d', d);
              Utils.log('h', h);
              Utils.log('m', m);
              Utils.log('from', from);
              Utils.log('to', to);
              Utils.log('shown', shown);
              Utils.log('reshow', reshow);
              Utils.log('active', !Boolean(timerow.notActive));
              Utils.log('h >= from[0] || (h === from[0] && m >= from[1])', h >= from[0] || (h === from[0] && m >= from[1]));
              Utils.log('h <= to[0] || (h === to[0] && m <= to[1])', h <= to[0] || (h === to[0] && m <= to[1]));

              if(!Boolean(timerow.notActive) // widget not active in this day
                && (h >= from[0] || (h === from[0] && m >= from[1])) // current time within active interval
                && (h <= to[0] || (h === to[0] && m <= to[1])))
              {
                // special click behavior
                if( 'undefined' !== typeof behaviors.BhCB)
                {
                  behaviors.BhCB = '[data-callbo="callup"]';
                  // init special callbo button behavior
                  //
                  if('undefined' !== typeof Behavior.BhCB)
                  {

                    var behavior = new Behavior['BhCB'](behaviors['BhCB']);

                    Utils.log('start behavior', 'BhCB', behaviors['BhCB']);

                    iframe.createButton();

                    behavior.start();
                    behavior.onstate('fire', function()
                    {
                      iframe.show();
                      Dom.setCookie('magneto.shown', 'yes', {expires: 24 * 3600}); 
                    });
                  }
    
                  delete behaviors.BhCB
                }
                if(!(shown || !reshow) || !reshow) // is true if flag reshow set as true or widget has not been shown)
                {
                  for(var cl in behaviors)
                  {
                    if(behaviors.hasOwnProperty(cl) && 'undefined' !== typeof Behavior[cl])
                    {
                      var behavior = new Behavior[cl](behaviors[cl]);

                      Utils.log('start behavior', cl, behaviors[cl]);

                      behavior.start();
                      behavior.onstate('fire', function()
                      {
                        iframe.show();
                        Dom.setCookie('magneto.shown', 'yes', {expires: 24 * 3600}); 
                      });
                    }
                  }
                }
              }
              else
              {
                Utils.log('behavior not starting, conditions:');
                Utils.log('!Boolean(timerow.notActive)', !Boolean(timerow.notActive));
                Utils.log('(!(shown || !reshow) || !reshow)', (!(shown || !reshow) || !reshow));
                Utils.log('(h >= from[0] || (h === from[0] && m >= from[1]))', (h >= from[0] || (h === from[0] && m >= from[1])));
                Utils.log('(h <= to[0] || (h === to[0] && m <= to[1]))', (h <= to[0] || (h === to[0] && m <= to[1]))); 
              }
            }
          })
          .fail(function(err)
          {
            Utils.error(err);
          });
    }
    else
    {
      Utils.error('Magneto error: Setting.origin not define'); 
    }
  }
  catch(err)
  {
    console.error && console.error(err);
  }
})();
