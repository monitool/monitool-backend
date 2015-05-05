var app = require('../../server/server');
module.exports = function(Data) {
	Data.beforeRemote('create', function(ctx, unused, next) {
		ctx.req.body.date = new Date();
		if(!ctx.req.body.isAvg){
			ctx.req.body.isAvg=false;
		}
		next();
	});

	Data.observe('before save', function(ctx, next) {
	  //Data.getApp(function(err, app){
		Data.app.models.Host.find({"where":{"id":ctx.instance.hostId}},function(err,instances){
			if(instances.length==1){
				next();
			}else{
				next({"status": 403,"message": "Forbidden"});
			}
		});
	  //});
	});

};
