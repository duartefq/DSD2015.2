/**
This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org/>
**/

var express = require('express');
var sr = express.Router();

var log4js = require('log4js');

log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'logs/compute.log', maxLogSize:20480, backups:3, category: 'services' }
  ]
});

var logger = log4js.getLogger();
logger.setLevel('TRACE');

sr.get('/add', function(req,res) {
    
					var a = req.query.a ;
				    var b = req.query.b ;
				    var mult = parseFloat(a) + parseFloat(b);
				    res.set( {"Content-Type" : "application/json;charset=UTF-8"} );
				    var respMessage = '{"addResponse":{"ouput":"'+ mult.toString() + '"}}' ;
				    logger.trace("[SERVICE] response from /services/add:"+respMessage);
				    res.send(respMessage);
});


sr.get('/subtract', function(req,res) {
    
					var a = req.query.a ;
				    var b = req.query.b ;
				    var mult = parseFloat(a) - parseFloat(b);
				    res.set( {"Content-Type" : "application/json;charset=UTF-8"} );
				    var respMessage = '{"subtractResponse":{"ouput":"'+ mult.toString() + '"}}' ;
				    logger.trace("[SERVICE] response from /services/add:"+respMessage);
				    res.send(respMessage);
});


sr.get('/multiply', function(req,res) {
    
					var a = req.query.a ;
				    var b = req.query.b ;
				    var mult = parseFloat(a) * parseFloat(b);
				    res.set( {"Content-Type" : "application/json;charset=UTF-8"} );
				    var respMessage = '{"multiplyResponse":{"ouput": "'+ mult.toString() + '"}}' ;
				    logger.trace("[SERVICE] response from /services/add:"+respMessage);
				    res.send(respMessage);
});


sr.get('/divide', function(req,res) {
    
				    var a = req.query.a ;
				    var b = req.query.b ;
				    var mult = parseFloat(a) ;
				    if (parseFloat(b) !== 0) mult = parseFloat(a) / parseFloat(b);
				    res.set( {"Content-Type" : "application/json;charset=UTF-8"} );
				    var respMessage = '{"divideResponse":{"ouput":"'+ mult.toString() + '"}}' ;
				    logger.trace("[SERVICE] response from /services/divide:"+respMessage);
				    res.send(respMessage);
});


sr.get('/square', function(req,res) {
    
				    var a = req.query.a ;
				    var mult = parseFloat(a)*parseFloat(a);
				    res.set( {"Content-Type" : "application/json;charset=UTF-8"} );
				    var respMessage = '{"squareResponse":{"ouput":"'+ mult.toString() + '"}}' ;
				    logger.trace("[SERVICE] response from /services/square:"+respMessage);
				    res.send(respMessage);
});




exports.ServiceRouter = function() { 
    return sr ;
}
