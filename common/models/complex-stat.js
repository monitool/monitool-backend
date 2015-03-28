module.exports = function(ComplexStat) {
	
	var intervObjs=[];
	
	ComplexStat.beforeRemote('deleteById',function(ctx, unused, next) {

		if(ctx.req.route.methods.delete){
			if(ctx.req.accessToken){
				var id=ctx.req.params.id || ctx.req.body.id;
				//console.log("id: "+id);
				ComplexStat.find({"where":{"id":id}},function(err, instances){
					if(instances.length==1){
						if(String(instances[0].userId)==String(ctx.req.accessToken.userId)){
							clearInterval(intervObjs[instances[0].id]);
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
		if(ctx.req.route.methods.post){
			if(ctx.req.accessToken){
				ctx.req.body.userId=ctx.req.accessToken.userId;
				console.log("userId set to "+ctx.req.body.userId);
				next();
			}else{
				next({"status": 401,"message": "Authorization Required"});
			}
		}else{
			next();
		}
	});
	
	// after creating complexStat instance
	ComplexStat.afterRemote('create',function(ctx,instance,next){
		// get app object
		ComplexStat.getApp(function(err, app){
			var period=instance.period;
			var repeat=instance.repeat;
			var itemType=String(instance.itemType);
			
			if(itemType!='memLoad' && itemType!='cpuLoad' &&  itemType!='discLoad'){
				instance.delete();
				next(new Error('Wrong item type ('+itemType+') for complexStat: '+instance.id));
				return;
			}
			
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
			intervObjs[instance.id]=fId;
					
			// call next function
			next();
			return;
		});
	});
	
};
