module.exports = function(Sensor) {
	Sensor.beforeRemote('create', function(ctx, unused, next){
		ctx.req.body.dateJoined = new Date();
		next();
	});
};
