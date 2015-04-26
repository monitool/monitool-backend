module.exports = function(ComplexStat) {
	/*
	ComplexStat.intervObjs = [];
	
	ComplexStat.beforeRemote('deleteById',function(ctx, unused, next) {

		if(ctx.req.route.methods.delete){
			if(ctx.req.accessToken){
				var id=ctx.req.params.id || ctx.req.body.id;
				//console.log("id: "+id);
				ComplexStat.find({"where":{"id":id}},function(err, instances){
					if(instances.length==1){
						if(String(instances[0].userId)==String(ctx.req.accessToken.userId)){
							clearInterval(ComplexStat.intervObjs[instances[0].id]);
							console.log("interval func cleared for complexStat: "+instances[0].id);
							next();
						}else{
							console.log(instances[0].userId+", "+ctx.req.accessToken.userId);
							next({"status": 403,"message": "Forbidden"});
						}
					}else{
						console.log(instances+" instances");
						next({"status": 403,"message": "Forbidden"});
					}
				});
			}else{
				console.log("no access token");
				next({"status": 403,"message": "Forbidden"});
			}
			
		}else{
			next();
		}
	});

	ComplexStat.beforeRemote('create', function(ctx, unused, next){
		if(ctx.req.accessToken){
			var error = validateComplexStat(ctx)
			if (error) {
				next(error);
				return
			}

			ctx.req.body.userId=ctx.req.accessToken.userId;
			console.log("userId set to "+ctx.req.body.userId);

			next();
		}else{
			next({"status": 401,"message": "Authorization Required"});
		}
	});
	
	// after creating complexStat instance
	ComplexStat.afterRemote('create',function(ctx,instance,next){
		// get app object
		createNewJob(instance);
		next();
	});


	ComplexStat.beforeRemote('upsert', function(ctx, unused, next){
		if(ctx.req.accessToken){
			var error = validateComplexStat(ctx)
			if (error) {
				next(error);
				return
			}

			ctx.req.body.userId=ctx.req.accessToken.userId;
			console.log("userId set to "+ctx.req.body.userId);

			next();
		}else{
			next({"status": 401,"message": "Authorization Required"});
		}
	});

	ComplexStat.afterRemote('upsert', function(ctx, instance, next){
		// remove job if exists
		var intervJob = ComplexStat.intervObjs[instance.id]
		if (intervJob) {
			if(String(instance.userId)==String(ctx.req.accessToken.userId)){
				clearInterval(ComplexStat.intervObjs[instance.id]);
				console.log("interval func cleared for complexStat: "+instance.id);
			}
		}

		// create job
		createNewJob(instance);
				
		// call next function
		next();
	});
	
	
	
	
	function validateComplexStat(ctx){
		var itemType=String(ctx.req.body.itemType);
		var sensorId = String(ctx.req.body.sensorId);
		var period = ctx.req.body.period;
		var repeat = ctx.req.body.repeat;

		if (period <= 0) {
			return new Error('Wrong period value ('+period+') for complexStat');
		}

		if (repeat <= 0) {
			return new Error('Wrong repeat value ('+repeat+') for complexStat');
		}

		if (itemType!='memLoad' && itemType!='cpuLoad' &&  itemType!='discLoad') {
			return new Error('Wrong item type ('+itemType+') for complexStat');
		}
		
		ComplexStat.getApp(function(err, app){
			app.models.Sensor.find({"where":{"id":sensorId}},function(err, instances){
				if(instances.length==0){
					return new Error('Wrong sensorId ('+sensorId+') for complexStat');
				}
			});
		});

		return;
	}

	function createNewJob(instance) {
		ComplexStat.getApp(function(err, app){
			var period=instance.period;
			var repeat=instance.repeat;
			var itemType=String(instance.itemType);
			
			// set interval function
			var fId=setInterval(function(){
			
				// set proper date			
				var now = new Date();
				var millis=now.getTime();
				millis-=period;
				var gtDate=new Date(millis);
							
				// get data with proper date
				app.models.Data.find({"where":{"and":[{"sensorId":instance.sensorId},{"date":{"gt":gtDate}}]}},function(err, dataInstances){
					if(dataInstances.length<1){
						console.log("no data found");
						return;
					}
					
					// compute data average
					var sum=0;
					for(var i=0; i<dataInstances.length; ++i){
						sum+=dataInstances[i][itemType];
					}
								
					// update array of complexStat instance
					if(!instance.data){
						instance.data=[];
					}
					instance.data.push({"avg":sum/dataInstances.length,"date":now});
					console.log("Average: "+" "+itemType+": "+(sum/dataInstances.length)+", for stat: "+instance.id);
					instance.updateAttribute("data",instance.data,function(err, newInst){if(err){console.log(err)}})
				})
			}, repeat);
		
			// save interval object to array
			ComplexStat.intervObjs[instance.id]=fId;
		});
	}*/
};

