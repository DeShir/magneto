/**
 * module Magneto.Transport
 *
 * dependencies Magneto.Utils
 *
 */

;(function()
{
  // module name
  var _MODULE_NAME_ = 'Magneto.Transport';

  // resolve namespace 
  Magneto = typeof Magneto === 'undefined' && {} || Magneto; 
  var Transport = Magneto.Transport = Magneto.Transport || {};

  // dependencies
  var Utils = Magneto.Utils;
  if(!Utils) throw Error(_MODULE_NAME_ + ' dependencies error');

  function XHR(crossdomain)
  {
    if(crossdomain)
    {
      if('undefined' === typeof XDomainRequest)
      {
        xhr = new XMLHttpRequest;
      }
      else
      {
        xhr = new XDomainRequest;

        xhr.readyState = 0;
        xhr.magentoDebugInformation = 'instance of XDomainRequest';

        xhr.onprogress = function()
        {
          xhr.readyState = 3;
          xhr.onreadystatechange && xhr.onreadystatechange();
        };

        xhr.onload = function()
        {
          xhr.readyState = 4;
          xhr.status = 200;
          xhr.onreadystatechange && xhr.onreadystatechange();
        };

        xhr.onerror = function()
        {
          xhr.readyState = 4;
          xhr.status = 400;
          xhr.onreadystatechange && xhr.onreadystatechange();
        };
      }
    }
    else
    {
      xhr = new XMLHttpRequest;
    }

    return xhr;
  }

  // ajax function
  //
  Transport.ajax = function(url, options, data)
  {
    var o = options || {method: 'GET', contenType: 'json', crossdomain: false};
    var xhr = XHR(o.crossdomain);

    var method = 
    {
      undefined : 'GET', 
      'get'     : 'GET',
      'GET'     : 'GET',
      'post'    : 'POST',
      'POST'    : 'POST' 
    }[o.method];

    var contentType = o.contentType  || 'aplication/json';
    
    var deffered = new Utils.Deffered;

    xhr.open(method, url, true);

    if(method === 'POST')
      xhr.setRequestHeader('Content-Type', contentType);

    xhr.onreadystatechange = function()
    {
      Utils.debug('xhr: change state', xhr.readyState);
      if(+xhr.readyState === 4)
      {
        if(+xhr.status >= 400)
        {
          Utils.debug('xhr: fail');
          deffered.set('fail', xhr);
        }
        else
        {
          Utils.debug('xhr: done');
          deffered.set('done', xhr);
        }
      }
    };
    if(+xhr.readyState !== 4) xhr.send(JSON.stringify(data));
    return deffered;
  };
}());
