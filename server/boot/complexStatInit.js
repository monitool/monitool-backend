module.exports = function(app) {
	
	/*app.models.User.destroyAll();*/
	app.models.Host.destroyAll();
	app.models.Data.destroyAll();
	app.models.ComplexStat.destroyAll();
	
	app.models.ComplexStat.find(function(error, instances){
		var n=instances.length;
		if(n>0){
			for(var i=0; i<n; ++i){
				app.models.Host.createNewJob(instances[i]);
				console.log("complexStat "+ instances[i].name +" recreated");
			}
		}
	});
};