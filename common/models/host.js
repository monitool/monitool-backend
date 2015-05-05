var app = require('../../server/server');
module.exports = function(Host) {
	Host.beforeRemote('create', function(ctx, unused, next){
		ctx.req.body.dateJoined = new Date();
		next();
	});
	
// ========================================================================= //
	// GET    /hosts/{id}/data     /hosts/{id}/data?filter=...
	Host.getData = function(id, filter, req, callback) {
		
		if(!req.accessToken){
			callback({"status": 401,"message": "Authorization Required"});
			return;
		}
		
		var filterSet=true;
		if(!filter){
			filter={"where":{and:[{"hostId":id},{"isAvg":false}]}};
			filterSet=false;
		}else{
			try{
				filter=JSON.parse(filter);
			}catch(e){
				callback(e);
				return;
			}
			if(filter.where){
				var tmpObj=filter.where;
				filter.where={"and":[tmpObj, {"hostId":id},{"isAvg":false}]};
			}else{
				filter.where={and:[{"hostId":id},{"isAvg":false}]};
			}
		}
		 //console.log("filter: "+JSON.stringify(filter));
		Host.app.models.Data.find(filter,function(err, dataInstances){
			if(err){
				callback(err);
				return;
			}
			callback(null,dataInstances);

		});
    }
	
	Host.remoteMethod(
        'getData', 
        {
          accepts: [
			{arg: 'id', type: 'string', required: true},
			{arg: 'filter', type: 'string', required: false},
			{arg: 'req', type: 'object', http: { source: 'req' }}
		  ],
          returns: {arg: 'data', type: 'object', root: true},
		  http: {path: '/:id/data', verb: 'get'}
        }
    );
	
// ========================================================================= //
	// GET    /hosts/data     /hosts/data?filter=...
	Host.getAllData = function(filter, req, callback) {
		
		if(!req.accessToken){
			callback({"status": 401,"message": "Authorization Required"});
			return;
		}
		
		var filterSet=true;
		if(filter){
			try{
				filter=JSON.parse(filter);
				if(filter.where){
					var tmpObj=filter.where;
					filter.where={"and":[tmpObj, {"isAvg":false}]};
				}else{
					filter.where={"isAvg":false};
				}
			}catch(e){
				callback(e);
				return;
			}
		}else{
			filter={"where":{"isAvg":false}};
			filterSet=false;
		}
		Host.app.models.Data.find(filter,function(err, dataInstances){
			if(err){
				callback(err);
				return;
			}
			callback(null,dataInstances);

		});
    }
	
	Host.remoteMethod(
        'getAllData', 
        {
          accepts: [
			{arg: 'filter', type: 'string', required: false},
			{arg: 'req', type: 'object', http: { source: 'req' }}
		  ],
          returns: {arg: 'data', type: 'object', root: true},
		  http: {path: '/data', verb: 'get'}
        }
    );
	
// ========================================================================= //
	// GET    /hosts/{id}/data/{complexStatName}     /hosts/{id}/data/{complexStatName}?filter=...
	Host.getComplexStatData = function(id, csName, filter, req, callback) {
		
		if(!req.accessToken){
			callback({"status": 401,"message": "Authorization Required"});
			return;
		}
		
		Host.app.models.ComplexStat.find( {"where":{"name":csName}} ,function(err, csArr){
			if(err){
				callback(err);
				return;
			}
			
			if(csArr.length!=1){
				callback(new Error("No complexStat named: "+csName));
				return;
			}
			
			if(csArr[0].hostId!=id){
				callback(new Error("No complexStat named: "+csName+" for host: "+id));
				return;
			}
			
			var filterSet=true;
			if(!filter){
				filter={"where":{"complexStatId":String(csArr[0].id)}};
				filterSet=false;
			}else{
				try{
					filter=JSON.parse(filter);
				}catch(e){
					callback(e);
					return;
				}
				
				if(filter.where){
					var tmpObj=filter.where;
					filter.where={"and":[tmpObj, {"complexStatId":String(csArr[0].id)}]};
				}else{
					filter.where={"complexStatId":String(csArr[0].id)};
				}
			 }
			Host.app.models.Data.find(filter,function(err, dataInstances){
				if(err){
					callback(err);
					return;
				}
				var responseArr=[];
				if(filterSet){
					var n=dataInstances.length;
					for(var i=0; i<n; ++i){
						if(dataInstances[i].complexStatId=csArr[0].id){
							responseArr.push(dataInstances[i]);
						}
					}
					callback(null,responseArr);
				}else{
					callback(null,dataInstances);
				}
			});

		});

    }
	
	Host.remoteMethod(
        'getComplexStatData', 
        {
          accepts: [
			{arg: 'id', type: 'string', required: true},
			{arg: 'csName', type: 'string', required: true},
			{arg: 'filter', type: 'string', required: false},
			{arg: 'req', type: 'object', http: { source: 'req' }}
		  ],
          returns: {arg: 'data', type: 'object', root: true},
		  http: {path: '/:id/data/:csName', verb: 'get'}
        }
    );

// ========================================================================= //
	// POST    /hosts/{id}/data
	Host.postData = function(id, instance,callback) {
		instance.hostId=id;
		instance.date = new Date();
		if(!instance.isAvg){
			instance.isAvg=false;
		}
		
		Host.find(  {"where":{"id":id}} ,function(err, hostArr){
			if(err){
				callback(err);
				return;
			}
			if(hostArr.length!=1){
				callback(new Error("Wrong host id: "+id));
				return;
			}else{
				Host.app.models.Data.create(instance, function(err, models){
					if(err){
						callback(err);
						return;
					}
					callback(null,models);
				});
			}
		});

    }
	
	Host.remoteMethod(
        'postData', 
        {
          accepts: [
			{arg: 'id', type: 'string', required: true},
			{arg: 'instance', type: 'object', required: true}
		  ],
          returns: {arg: 'instance', type: 'object', root: true},
		  http: {path: '/:id/data', verb: 'post'}
        }
    );
	
// ========================================================================= //
	// DELETE    /hosts/{hostId}/data/{dataId}
	Host.deleteData = function(hid, did, req ,callback) {
		if(req.accessToken){
			Host.app.models.Data.find({"where":{"id":did}},function(err, dataArr){
				if(err){
					callback(err);
					return;
				}
				if(dataArr.length==1){
					var dataInstance=dataArr[0];
					if(!dataInstance.complexStatId || dataInstance.hostId!=hid){
						callback(null);
						return;
					}
					Host.app.models.ComplexStat.find({"where":{"id":dataInstance.complexStatId}}, function(err, complexArr){
						if(err){
							callback(err);
							return;
						}
						if(complexArr.length==1 && complexArr[0].userId==req.accessToken.userId){
							dataInstance.destroy();
						}
						callback(null);
					});
				}else{
					callback(null);
					return;
				}
			});
		}else{
			callback({"status": 401,"message": "Authorization Required"});
		}
    }
	
	Host.remoteMethod(
        'deleteData', 
        {
          accepts: [
			{arg: 'hid', type: 'string', required: true},
			{arg: 'did', type: 'string', required: true},
			{arg: 'req', type: 'object', http: { source: 'req' }}
		  ],
		  http: {path: '/:hid/data/:did/', verb: 'delete'},
		  returns: {arg: 'info', type: 'object', root: true}
        }
    );
	
// ========================================================================= //
	// GET    /hosts/{id}/complexStats     /hosts/{id}/complexStats?filter=...
	Host.getcomplexStats = function(id, filter, req, callback) {
		
		if(!req.accessToken){
			callback({"status": 401,"message": "Authorization Required"});
			return;
		}
		
		var filterSet=true;
		if(!filter){
			filter={"where":{"hostId":id}};
			filterSet=false;
		}else{
			try{
				filter=JSON.parse(filter);
			}catch(e){
				callback(e);
				return;
			}
			if(filter.where){
				var tmpObj=filter.where;
				filter.where={"and":[tmpObj, {"hostId":id}]};
			}else{
				filter.where={"hostId":id};
			}
		 }
		Host.app.models.ComplexStat.find(filter,function(err, dataInstances){
			if(err){
				callback(err);
				return;
			}
			var responseArr=[];
			if(filterSet){
				var n=dataInstances.length;
				for(var i=0; i<n; ++i){
					if(dataInstances[i].hostId==id){
						responseArr.push(dataInstances[i]);
					}
				}
				callback(null,responseArr);
			}else{
				callback(null,dataInstances);
			}
		});
    }
	
	Host.remoteMethod(
        'getcomplexStats', 
        {
          accepts: [
			{arg: 'id', type: 'string', required: true},
			{arg: 'filter', type: 'string', required: false},
			{arg: 'req', type: 'object', http: { source: 'req' }}
		  ],
          returns: {arg: 'data', type: 'object', root: true},
		  http: {path: '/:id/complexStats', verb: 'get'}
        }
    );
	
// ========================================================================= //
	// POST    /hosts/{id}/complexStats
	Host.postComplexStats = function(id, instance, req, callback) {
		instance.hostId=id;
		instance.date = new Date();
		if(req.accessToken){
			validateComplexStat(instance, function(error){
				if (error) {
					callback(error);
					return;
				}
				instance.userId=req.accessToken.userId;
				Host.app.models.ComplexStat.create(instance, function(err, newStat){
					if(err){
						callback(err);
						return;
					}
					createNewJob(newStat);
					callback(null,newStat);
				});
			})
			
		}else{
			callback({"status": 401,"message": "Authorization Required"});
		}
    }
	
	function validateComplexStat(instance, callback){
		var hostId = String(instance.hostId);
		var period = instance.period;
		var repeat = instance.repeat;
		var name=instance.name;

		if (period <= 0) {
			return new Error('Wrong period value ('+period+') for complexStat');
		}

		if (repeat <= 0) {
			return new Error('Wrong repeat value ('+repeat+') for complexStat');
		}
		
		if(!name || name==""){
			return new Error('Wrong name ('+name+') for complexStat');
		}
		
		Host.app.models.ComplexStat.find({"where":{"name":name}},function(err, csArr){
			if(err){
				callback(err);
				return;
			}
			if(csArr.length>0){
				callback(new Error('Wrong name ('+name+') for complexStat. Must be unique.'));
				return;
			}else{
				Host.find({"where":{"id":hostId}},function(err, instances){
					if(err){
						callback(err);
						return;
					}
					if(instances.length==0){
						callback(new Error('Wrong hostId ('+hostId+') for complexStat'));
						return;
					}else{
						callback();
					}
				});
			}
		});
	}
	
	Host.intervObjs = [];
	
	function createNewJob(instance) {
		var period=instance.period;
		var repeat=instance.repeat;
			
		// set interval function
		var fId=setInterval(function(){
			
			// set proper date			
			var now = new Date();
			var millis=now.getTime();
			millis-=period;
			var gtDate=new Date(millis);
							
			// get data with proper date
			Host.app.models.Data.find({"where":{"and":[{"hostId":instance.hostId},{"date":{"gt":gtDate}}]}},function(err, dataInstances){
				if(err){
					callback(err);
					return;
				}
				if(dataInstances.length<1){
					console.log("no data found");
					return;
				}
					
				// compute data averages
				var cpuLoadSum=0;
				var memLoadSum=0;
				var discLoadSum=0;
				for(var i=0; i<dataInstances.length; ++i){
					cpuLoadSum+=dataInstances[i].cpuLoad;
					memLoadSum+=dataInstances[i].memLoad;
					discLoadSum+=dataInstances[i].discLoad;
				}
						
				var newData={
					"hostId": instance.hostId,
					"date": now,
					"cpuLoad": (cpuLoadSum/dataInstances.length),
					"memLoad": (memLoadSum/dataInstances.length),
					"discLoad": (discLoadSum/dataInstances.length),
					"complexStatId": instance.id,
					"isAvg": false
				  };
				  
				  //console.log("stat value added: "+newData);
				  
				  Host.app.models.Data.create(newData,function(err, obj){
					  console.log("stat value added: "+obj.id+" for complexStat: "+obj.complexStatId);
					  return;
				  });
			})
		}, repeat);
		
		// save interval object to array
		Host.intervObjs[instance.id]=fId;
	}
	
	Host.createNewJob=createNewJob;
	
	Host.remoteMethod(
        'postComplexStats', 
        {
          accepts: [
			{arg: 'id', type: 'string', required: true},
			{arg: 'instance', type: 'object', required: true},
			{arg: 'req', type: 'object', http: { source: 'req' }}
		  ],
          returns: {arg: 'instance', type: 'object', root: true},
		  http: {path: '/:id/complexStats', verb: 'post'}
        }
    );
	
// ========================================================================= //
	// PUT    /hosts/{id}/complexStats/{statId}
	Host.putComplexStats = function(hid, sid, instance, req, callback) {
		instance.hostId=hid;
		instance.date = new Date();
		if(req.accessToken){
			Host.deleteComplexStats(hid,sid,req, function(err, info){
				
				if(err){
					callback(err);
					return;
				}
				
				instance.id=sid;
				Host.postComplexStats(hid, instance, req, function(err, newInst){
					if(err){
						callback(err);
						return;
					}
					callback(null, newInst);
				});
				
			});
			
		}else{
			callback({"status": 401,"message": "Authorization Required"});
		}
    }
	
	Host.remoteMethod(
        'putComplexStats', 
        {
          accepts: [
			{arg: 'hid', type: 'string', required: true},
			{arg: 'sid', type: 'string', required: true},
			{arg: 'instance', type: 'object', required: true},
			{arg: 'req', type: 'object', http: { source: 'req' }}
		  ],
          returns: {arg: 'instance', type: 'object', root: true},
		  http: {path: '/:hid/complexStats/:sid', verb: 'put'}
        }
    );
// ========================================================================= //
	// DELETE    /hosts/{hostId}/complexStats/{statId}
	
	Host.deleteComplexStats = function(hid, sid, req ,callback) {
		
		if(req.accessToken){
			Host.app.models.ComplexStat.find({"where":{"id":sid}},function(err, arr){
				if(err){
					callback(err);
					return;
				}
				if(arr.length==1 && arr[0].userId==req.accessToken.userId){
					var instance=arr[0];
					if(instance.hostId!=hid){
						callback(null);
						return;
					}
					
					clearInterval(Host.intervObjs[instance.id]);
					console.log("interval cleared for "+instance.id);
					
					Host.app.models.Data.find({"where":{"complexStatId":sid}}, function(err, dataArr){
						if(err){
							callback(err);
							return;
						}
						
						console.log(dataArr.length+" instances of data destroyed");
						for(var i=0; i<dataArr.length; ++i){
							dataArr[i].destroy();
						}
						
						instance.destroy();
						console.log("complexStat destroyed");
						callback(null);
					});
				}else{
					console.log("hid:"+hid+", sid"+sid+", uid: "+req.accessToken.userId);
					callback({"status": 401,"message": "Authorization Required"});
					return;
				}
			});
		}else{
			console.log("no access token");
			callback({"status": 401,"message": "Authorization Required"});
		}
    }
	
	Host.remoteMethod(
        'deleteComplexStats', 
        {
          accepts: [
			{arg: 'hid', type: 'string', required: true},
			{arg: 'sid', type: 'string', required: true},
			{arg: 'req', type: 'object', http: { source: 'req' }}
		  ],
		  http: {path: '/:hid/complexStats/:sid/', verb: 'delete'},
		  returns: {arg: 'info', type: 'object', root: true}
        }
    );
};
