module.exports = function(Data) {
	Data.observe('before save', function(ctx, next) {
	  Data.getApp(function(err, app){
		app.models.Sensor.find({"where":{"id":ctx.instance.sensorId}},function(err,instances){
			if(instances.length==1){
				next();
			}else{
				next({"status": 403,"message": "Forbidden"});
			}
		});
	  });
	});

};
