var chorus = 'chorus' ;

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

//modules
var express = require('express');
var app = express();

var mongojs = require('mongojs');

var http = require('http'), 
    https = require('https'),
    bodyParser = require('body-parser');
    validator = require('validator');

var log4js = require('log4js');

app.use(bodyParser());
app.disable('x-powered-by');

//Generated services
var computeServices = require('./compute_v1_0');

//Connection to MongoDB (local)
var databaseUrl = chorus; // "username:password@example.com/mydb"
var collections = ["instances"]
var db = mongojs(databaseUrl, collections);




log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'logs/'+chorus+'.log', maxLogSize:20480, backups:3, category: chorus }
  ]
});

var logger = log4js.getLogger();
logger.setLevel('TRACE');

//Process Admin Router
var pr = express.Router();
app.use('/'+chorus+'/calculateArea2', pr);

//Services Router
var sr = computeServices.ServiceRouter() ;
app.use('/services/compute', sr);


//activity paths
var processName = 'calculateArea2' ;
var processVersion = 'v1' ;
logger.warn('------------ Process Endpoints ---------------');
var calculateArea2_calculateShapeArea_receive = '/'+processName+'/'+processVersion+'/receive/calculateShapeArea' ;
logger.warn('[ENDPOINT] calculateArea2_calculateShapeArea_receive') ;
var calculateArea2_calculateRectArea_invoke = '/'+processName+'/'+processVersion+'/invoke/calculateRectArea' ;
logger.warn('[ENDPOINT] calculateArea2_calculateRectArea_invoke') ;
var calculateArea2_calculateElipseArea_invoke = '/'+processName+'/'+processVersion+'/invoke/calculateElipseArea' ;
logger.warn('[ENDPOINT] calculateArea2_calculateElipseArea_invoke') ;
var calculateArea2_subractAreas_invoke = '/'+processName+'/'+processVersion+'/invoke/subractAreas' ;
logger.warn('[ENDPOINT] calculateArea2_subractAreas_invoke') ;
logger.warn('\n------------ Admin Console -------------------');
logger.warn('[ENDPOINT] /chorus/calculateArea2/util/instances') ;
logger.warn('\n------------ Server started ------------------');

//Root structure of a process instance
function Process(name, initActivity, version,request) {
    this.name = name ;
    this.version = version ;
    //this.receive = request ;
    this.main = {} ;
    this.main[initActivity] = request ;
    var d = new Date();
    this.startTime = d.getTime() ;
}

pr.use(function(req, res, next) {
  // .. some logic here .. like any other middleware

  next();
});


pr.get('/util/events', function(req, res, next) {
  // ..
  var output = '<p>Process: calculateArea2</p>'
  //output += '<p>'+ JSON.stringify(collection) +'</p>' ;
  res.send(output);
  next();
}); 

pr.get('/util/instances', function(req, res, next) {
  // ..
    var pid = req.query.id ;

    var output = '<p>Process: calculateArea2</p>'
    
    if (pid === undefined) {
        var collection = db.instances.find(function(err, instances) {
        if (err || !instances) { 
        	logger.warn("no instance found") ;
        	res.send("no instance found");
        } else { 
            output += '<p>found '+instances.length+' records</p>'
 			output += '<table><tbody><tr><th>id</th><th>status</th><th>last activity</th></tr>'
            instances.forEach(function(instance) {
                output += '<tr><td><a href="instances/'+instance._id+'">'+instance._id+'</a></td><td><a href="instances/state/'+instance.status+'">'+instance.status+'</a></td><td>'+instance.last+'</td></tr>' ;
            });
            output += '</tbody></table>';   //note foreach is blocking
            res.send(output);
        }
    }); //end find-function        
    } else {
        next() ;
     }
}); 

pr.get('/util/instances/:id', function(req, res, next) {
  // ..
  var pid = req.param("id") ;
  var output = '<h2>Process: calculateArea2</h2>'
  output += '<p>Looking for process instance:'+ pid +'</p>' ;
  if (pid !== null) {
      db.instances.findOne({
          _id:mongojs.ObjectId(pid)
      }, function(err, doc) {
          if (doc !== null) {
          output += '<p>found instance:'+ pid +'</p>' ;
          output += '<p>'+JSON.stringify(doc)+'</p>';
          res.send(output);
          } else {
          		logger.warn('process id:'+pid+' not found');
                res.send(404,output+"<p>process instance not found, please check instance ID</p>");
          }
      });
  } else {
      next() ;
  }
  
}); 

pr.get('/util/instances/state/:state', function(req, res, next) {
  // ..
    var state = req.param("state") ;

    var output = '<h2>Process: calculateArea<br/>state: '+state+'</h2>'
    var query = { status : state} ;
    if (state !== null) {
        var collection = db.instances.find( query, function(err, instances) {
        if (err || !instances) { 
        	logger.warn("no instances found") ;
        	res.send(output);
        } else { 
                output += '<p>found '+instances.length+' records</p>'
                output += '<table><tbody><tr><th>id</th><th>status</th><th>last activity</th></tr>'
                instances.forEach(function(instance) {
                    output += '<tr><td><a href="instances/'+instance._id+'">'+instance._id+'</a></td><td>'+instance.status+'</td><td>'+instance.last+'</td></tr>' ;
                });
                output += '</tbody></table>';
                res.send(output);
             }
            }); 
        
    } else {
        next() ;
     }
}); 


app.post(calculateArea2_calculateShapeArea_receive, function(req, res){
  var output = '{ "process": "calculateArea2"' ;
  var processInstance = new Process('calculateArea2', 'calculateShapeArea', '1',req.body) ;
  db.instances.save(processInstance, function(err,savedInstance) {
      if (err || !savedInstance) { 
          var error = "Process<calculateArea2> instantiation error" ;
          logger.error(error);
          res.send(output+', "err" : "'+error+'"}');
      }
      else {
       	  savedInstance.status = "running" ;
      	  savedInstance.pid = savedInstance._id ;   
      	  var pid = savedInstance._id ;
          var input = req.body.input ;
          savedInstance.vars = {} ;
savedInstance.vars.input = input ; 
savedInstance.vars.output = "" ;
savedInstance.vars.values = "" ;
savedInstance.vars.values2 = "" ;
savedInstance.vars.values3 = "" ;
savedInstance.vars.rectArea = "" ;
savedInstance.vars.ellipseArea = "" ;
savedInstance.vars.shapeArea = "" ;
          db.instances.save(savedInstance) ;
          logger.trace("[RECEIVE] request<pid:"+savedInstance._id+"> input:"+JSON.stringify(input));
          
          assignInputToValues(input, pid, res, output) ;

      }
  }) ;
});

function assignInputToValues(arg, pid, res, output) {
	logger.trace("[ASSIGN] start InputToValues");
    db.instances.findOne({
        _id:mongojs.ObjectId(pid)
    }, function(err, doc) {
    	if (err || (doc === null)) {
    		logger.warn("[ASSIGN] values") ;
    	} else {

var __values = doc.vars.input ;	
doc.vars.values = __values ;
doc.last = "assignInputToValues" ;
db.instances.save(doc) ;
logger.trace("[ASSIGN] values = "+JSON.stringify(doc.vars.input));
		invokeCalculateRectArea(__values, pid, res, output) ;
		logger.trace("[ASSIGN] exit");
	}});
}

function invokeCalculateRectArea(arg,pid,reply,output) {

    logger.trace('[INVOKE] CalculateRectArea');
     
    var options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: '/calculateArea2/v1/invoke/calculateRectArea',
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=UTF-8' }
    };
    
    //Invoke the next activity
    var invoke = http.request(options, function(res) {
      logger.trace('[INVOKE] result from invoking private endpoint: CalculateRectArea');
      logger.trace('[INVOKE] returned { STATUS: ' + res.statusCode + ', HEADERS: ' + JSON.stringify(res.headers)+'}');
      res.setEncoding('utf8');
      res.on('data', function (data) {
          //Pass control to the next activity
          assignRectAreaToValues2(data,pid,reply,output) ;
      });
    });
    
    invoke.on('error', function(e) {
      logger.error('problem with request: ' + e.message);
    });
    
    var request = '{ "processid" : "'+pid+'", "payload" : '+JSON.stringify(arg)+'}' ;
    // write data to request body
    logger.trace('[INVOKE] request : '+ request);
    invoke.write(request);
    invoke.end();
    
}

//Private endpoint for invoking calculateRectArea
app.post(calculateArea2_calculateRectArea_invoke, function(req,invokeres) { 

	var requestData = {} ;
var values = req.body.payload ;
requestData.values = req.body.payload ;
logger.trace("[INVOKE] request<pid:"+pid+"> values:"+JSON.stringify(values)) ;
    var pid = req.body.processid ;
    
    db.instances.findOne({
        _id:mongojs.ObjectId(pid)
    }, function(err, doc) {
        logger.trace('found process instance:'+doc.name) ;
        doc.main.calculateRectArea = { "service" : "http://localhost:3000/services/calculator/multiply/", "request" : requestData } ;
        //would be payload instead of query for a POST
        db.instances.save(doc) ;
   
   		var multiplyRequest = {} ;
   		multiplyRequest.input = values ;
   		logger.trace("[INVOKE] multiplyRequest: "+JSON.stringify(req.body)) ;
   		
   		//Invoke the service
   		http.get('http://localhost:3000/services/compute/multiply/?a='+multiplyRequest.input.a+'&b='+multiplyRequest.input.b, function(getres) {
            logger.trace("[INVOKE] response code: " + getres.statusCode);
          
            getres.on("data", function(chunk) {
            var results = eval('(' + chunk + ')');
                
            db.instances.findOne({
                _id:mongojs.ObjectId(pid)
            }, function(err, doc) {
                logger.trace('[CONTEXT] updating context for process:'+doc.name+' with'+JSON.stringify(results)) ;
                doc.main.calculateRectArea.response = results.multiplyResponse ;   
                var response = {} ;                         
	            doc.vars.rectArea = { 'res' : results.multiplyResponse.ouput} ;   
logger.trace("[INVOKE] response: " + JSON.stringify(results.multiplyResponse.ouput)) ;
response.rectArea = results.multiplyResponse.ouput ;                       	
       
                db.instances.save(doc, function(err,val) {  //, { writeConcern: { j : 1 }}
                    if (err || !val) logger.error(err+" "+JSON.stringify(val));
                    else { 
                        invokeres.send(200,'{ "response" : '+JSON.stringify(response)+' }');
                    }
                });
                
                
            });
        
          });
          
        }).on('error', function(e) {
          logger.error("[INVOKE] error: " + e.message);
        }).end();   
    });
}) ;

function assignRectAreaToValues2(arg, pid, res, output) {
	logger.trace("[ASSIGN] start RectAreaToValues2");
    db.instances.findOne({
        _id:mongojs.ObjectId(pid)
    }, function(err, doc) {
    	if (err || (doc === null)) {
    		logger.warn("[ASSIGN] values2") ;
    	} else {

 
var __values2 = {} ; 
if (doc.vars.values2 !== "") { 
	    //If rectArea already exists in the process context we modify it
		__values2 = doc.vars.values2 ;	
}
__values2.b = doc.vars.rectArea.res ;
__values2.a = '0.7853975' ;
doc.vars.values2 = __values2 ;
doc.last = "assignRectAreaToValues2" ;
db.instances.save(doc) ;
logger.trace("[ASSIGN] values2 = "+JSON.stringify(__values2));

		invokeCalculateElipseArea(__values2, pid, res, output) ;
		logger.trace("[ASSIGN] exit");
	}});
}

function invokeCalculateElipseArea(arg,pid,reply,output) {

    logger.trace('[INVOKE] CalculateElipseArea');
     
    var options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: '/calculateArea2/v1/invoke/calculateElipseArea',
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=UTF-8' }
    };
    
    //Invoke the next activity
    var invoke = http.request(options, function(res) {
      logger.trace('[INVOKE] result from invoking private endpoint: CalculateElipseArea');
      logger.trace('[INVOKE] returned { STATUS: ' + res.statusCode + ', HEADERS: ' + JSON.stringify(res.headers)+'}');
      res.setEncoding('utf8');
      res.on('data', function (data) {
          //Pass control to the next activity
          assignRectAreaToValues3(data,pid,reply,output) ;
      });
    });
    
    invoke.on('error', function(e) {
      logger.error('problem with request: ' + e.message);
    });
    
    var request = '{ "processid" : "'+pid+'", "payload" : '+JSON.stringify(arg)+'}' ;
    // write data to request body
    logger.trace('[INVOKE] request : '+ request);
    invoke.write(request);
    invoke.end();
    
}

//Private endpoint for invoking calculateElipseArea
app.post(calculateArea2_calculateElipseArea_invoke, function(req,invokeres) { 

	var requestData = {} ;
var values2 = req.body.payload ;
requestData.values2 = req.body.payload ;
logger.trace("[INVOKE] request<pid:"+pid+"> values2:"+JSON.stringify(values2)) ;
    var pid = req.body.processid ;
    
    db.instances.findOne({
        _id:mongojs.ObjectId(pid)
    }, function(err, doc) {
        logger.trace('found process instance:'+doc.name) ;
        doc.main.calculateElipseArea = { "service" : "http://localhost:3000/services/calculator/multiply/", "request" : requestData } ;
        //would be payload instead of query for a POST
        db.instances.save(doc) ;
   
   		var multiplyRequest = {} ;
   		multiplyRequest.input = values2 ;
   		logger.trace("[INVOKE] multiplyRequest: "+JSON.stringify(req.body)) ;
   		
   		//Invoke the service
   		http.get('http://localhost:3000/services/compute/multiply/?a='+multiplyRequest.input.a+'&b='+multiplyRequest.input.b, function(getres) {
            logger.trace("[INVOKE] response code: " + getres.statusCode);
          
            getres.on("data", function(chunk) {
            var results = eval('(' + chunk + ')');
                
            db.instances.findOne({
                _id:mongojs.ObjectId(pid)
            }, function(err, doc) {
                logger.trace('[CONTEXT] updating context for process:'+doc.name+' with'+JSON.stringify(results)) ;
                doc.main.calculateElipseArea.response = results.multiplyResponse ;   
                var response = {} ;                         
	            doc.vars.ellipseArea = { 'res' : results.multiplyResponse.ouput} ;   
logger.trace("[INVOKE] response: " + JSON.stringify(results.multiplyResponse.ouput)) ;
response.ellipseArea = results.multiplyResponse.ouput ;                       	
       
                db.instances.save(doc, function(err,val) {  //, { writeConcern: { j : 1 }}
                    if (err || !val) logger.error(err+" "+JSON.stringify(val));
                    else { 
                        invokeres.send(200,'{ "response" : '+JSON.stringify(response)+' }');
                    }
                });
                
                
            });
        
          });
          
        }).on('error', function(e) {
          logger.error("[INVOKE] error: " + e.message);
        }).end();   
    });
}) ;

function assignRectAreaToValues3(arg, pid, res, output) {
	logger.trace("[ASSIGN] start RectAreaToValues3");
    db.instances.findOne({
        _id:mongojs.ObjectId(pid)
    }, function(err, doc) {
    	if (err || (doc === null)) {
    		logger.warn("[ASSIGN] values3") ;
    	} else {

 
var __values3 = {} ; 
if (doc.vars.values3 !== "") { 
	    //If rectArea already exists in the process context we modify it
		__values3 = doc.vars.values3 ;	
}
__values3.a = doc.vars.rectArea.res ;
doc.vars.values3 = __values3 ;
doc.last = "assignRectAreaToValues3" ;
db.instances.save(doc) ;
logger.trace("[ASSIGN] values3 = "+JSON.stringify(__values3));

		assignEllipseAreaToValues3(__values3, pid, res, output) ;
		logger.trace("[ASSIGN] exit");
	}});
}

function assignEllipseAreaToValues3(arg, pid, res, output) {
	logger.trace("[ASSIGN] start EllipseAreaToValues3");
    db.instances.findOne({
        _id:mongojs.ObjectId(pid)
    }, function(err, doc) {
    	if (err || (doc === null)) {
    		logger.warn("[ASSIGN] values3") ;
    	} else {

 
var __values3 = {} ; 
if (doc.vars.values3 !== "") { 
	    //If ellipseArea already exists in the process context we modify it
		__values3 = doc.vars.values3 ;	
}
__values3.b = doc.vars.ellipseArea.res ;
doc.vars.values3 = __values3 ;
doc.last = "assignEllipseAreaToValues3" ;
db.instances.save(doc) ;
logger.trace("[ASSIGN] values3 = "+JSON.stringify(__values3));

		invokeSubractAreas(__values3, pid, res, output) ;
		logger.trace("[ASSIGN] exit");
	}});
}

function invokeSubractAreas(arg,pid,reply,output) {

    logger.trace('[INVOKE] SubractAreas');
     
    var options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: '/calculateArea2/v1/invoke/subractAreas',
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=UTF-8' }
    };
    
    //Invoke the next activity
    var invoke = http.request(options, function(res) {
      logger.trace('[INVOKE] result from invoking private endpoint: SubractAreas');
      logger.trace('[INVOKE] returned { STATUS: ' + res.statusCode + ', HEADERS: ' + JSON.stringify(res.headers)+'}');
      res.setEncoding('utf8');
      res.on('data', function (data) {
          //Pass control to the next activity
          assignShapeAreaToOutput(data,pid,reply,output) ;
      });
    });
    
    invoke.on('error', function(e) {
      logger.error('problem with request: ' + e.message);
    });
    
    var request = '{ "processid" : "'+pid+'", "payload" : '+JSON.stringify(arg)+'}' ;
    // write data to request body
    logger.trace('[INVOKE] request : '+ request);
    invoke.write(request);
    invoke.end();
    
}

//Private endpoint for invoking subractAreas
app.post(calculateArea2_subractAreas_invoke, function(req,invokeres) { 

	var requestData = {} ;
var values3 = req.body.payload ;
requestData.values3 = req.body.payload ;
logger.trace("[INVOKE] request<pid:"+pid+"> values3:"+JSON.stringify(values3)) ;
    var pid = req.body.processid ;
    
    db.instances.findOne({
        _id:mongojs.ObjectId(pid)
    }, function(err, doc) {
        logger.trace('found process instance:'+doc.name) ;
        doc.main.subractAreas = { "service" : "http://localhost:3000/services/calculator/subtract/", "request" : requestData } ;
        //would be payload instead of query for a POST
        db.instances.save(doc) ;
   
   		var subtractRequest = {} ;
   		subtractRequest.input = values3 ;
   		logger.trace("[INVOKE] subtractRequest: "+JSON.stringify(req.body)) ;
   		
   		//Invoke the service
   		http.get('http://localhost:3000/services/compute/subtract/?a='+subtractRequest.input.a+'&b='+subtractRequest.input.b, function(getres) {
            logger.trace("[INVOKE] response code: " + getres.statusCode);
          
            getres.on("data", function(chunk) {
            var results = eval('(' + chunk + ')');
                
            db.instances.findOne({
                _id:mongojs.ObjectId(pid)
            }, function(err, doc) {
                logger.trace('[CONTEXT] updating context for process:'+doc.name+' with'+JSON.stringify(results)) ;
                doc.main.subractAreas.response = results.subtractResponse ;   
                var response = {} ;                         
	            doc.vars.shapeArea = { 'res' : results.subtractResponse.ouput} ;   
logger.trace("[INVOKE] response: " + JSON.stringify(results.subtractResponse.ouput)) ;
response.shapeArea = results.subtractResponse.ouput ;                       	
       
                db.instances.save(doc, function(err,val) {  //, { writeConcern: { j : 1 }}
                    if (err || !val) logger.error(err+" "+JSON.stringify(val));
                    else { 
                        invokeres.send(200,'{ "response" : '+JSON.stringify(response)+' }');
                    }
                });
                
                
            });
        
          });
          
        }).on('error', function(e) {
          logger.error("[INVOKE] error: " + e.message);
        }).end();   
    });
}) ;

function assignShapeAreaToOutput(arg, pid, res, output) {
	logger.trace("[ASSIGN] start ShapeAreaToOutput");
    db.instances.findOne({
        _id:mongojs.ObjectId(pid)
    }, function(err, doc) {
    	if (err || (doc === null)) {
    		logger.warn("[ASSIGN] output") ;
    	} else {

var __output = doc.vars.shapeArea ;	
doc.vars.output = __output ;
doc.last = "assignShapeAreaToOutput" ;
db.instances.save(doc) ;
logger.trace("[ASSIGN] output = "+JSON.stringify(doc.vars.shapeArea));
		replyCalculateShapeArea(__output,pid, res, output) ;
		logger.trace("[ASSIGN] exit");
	}});
}

function replyCalculateShapeArea(data,pid,res,output) {
    //update process state
    db.instances.findOne({
        _id:mongojs.ObjectId(pid)
    }, function(err, doc) {
	    output += ', "reply" : { "output" : ' + JSON.stringify(doc.vars.output) + '}}' ;
	    
	    logger.trace("[REPLY] ready to return: "+output) ;
	    
	    //How do we make that separate and synchronized? 
	    if (res !== undefined) {
		    res.send(output);
	    
	        if (doc !== undefined) {
	            logger.trace('[CONTEXT] updating context for process:'+doc.name) ;
	            doc.main.reply_calculateShapeArea =  doc.vars.output ; 
	            var d = new Date();
	            doc.status = "completed" ;
	                            doc.endTime = d.getTime() ;
	            doc.last = "replyCalculateShapeArea" ;
	            doc.lastTime = d.getTime() ;
	            
	            db.instances.save(doc) ;//, { writeConcern: { j : 1}});
	            
	            logger.trace("[REPLY] returning response: " + JSON.stringify(doc.main.reply_calculateShapeArea));
	          } else {
	              logger.warn("[REPLY] problem with doc: " + JSON.stringify(doc));
	          }
	    } else {
	        logger.error("[REPLY] res is undefined") ;
	    }
	});
 }


var server = app.listen(process.env.PORT || 3000, function() {
    logger.warn('[SERVER] listening on port %d', server.address().port);
});
