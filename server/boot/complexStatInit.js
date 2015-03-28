module.exports = function(app) {
	
	app.models.complexStat.find(function(error, instances){
		var n=instances.length;
		if(n>0){
			for(var i=0; i<n; ++i){
				var instance=instances[i];
				
				var fId=setInterval(function(){
				
					// set proper date			
					var now = new Date();
					var millis=now.getTime();
					millis-=instance.period;
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
							sum+=dataInstances[i][instance.itemType];
						}
									
						// update array of complexStat instance
						if(!instance.data){
							instance.data=[];
						}
						instance.data.push({"avg":sum/dataInstances.length,"date":now});
						console.log("Average: "+" "+instance.itemType+": "+(sum/dataInstances.length)+", for stat: "+instance.id);
						instance.updateAttribute("data",instance.data,function(err, newInst){if(err){console.log(err)}})
					})
				}, instance.repeat);
				
				// save interval object to array
				app.models.complexStat.intervObjs[instance.id]=fId;
			}
		}
	});

};