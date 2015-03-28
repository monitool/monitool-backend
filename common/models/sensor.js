module.exports = function(Sensor) {
	Sensor.beforeRemote('create', function(ctx, unused, next){
		ctx.req.body.dateJoined = new Date();
		console.log("Date set on " + ctx.req.body.dateJoined);

		next();
	});
};
