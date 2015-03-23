// adding to Data model /complexStat method that will return complexStat
// example URL: http://localhost:3000/api/data/complexStat?statSubj=memLoad&statType=med&filter={%22where%22:{%22date%22:{%22gt%22:%222015-03-23T14:42%22}}}
// filter parameter is in JSON format with quotation marks!!!
// more information about filtering data: http://docs.strongloop.com/display/public/LB/Where+filter
// use ONLY stringified JSON format in a REST query.
module.exports = function(Data) {
	Data.complexStat = function(statType, statSubj, filter, cb){
		// try to parse filter
		try{
			filter=JSON.parse(filter);
		}catch(e){
			filter={};
			console.log(e);
		}
		
		// if there aren't statType or statSubj parameters return empty response
		if(!statType || !statSubj){
			cb(null,"{}");
			return;
		} 
		
		collection = Data.find(filter,function(arr, instances){
			values=[];
			for(var i=0; i<instances.length; ++i){
				values[i]=instances[i][statSubj];
			}
			
			// if there is no results return empty response
			if(values.length==0){
				cb(null,"{}");
				return;
			}
			
			// sorting for min or max
			values.sort();
			
			// different stat types
			if(statType=="avg"){
				var sum=0;
				for(var i=0; i<values.length; ++i){
					sum+=values[i];
				}
				cb(null, sum/values.length);
			}else if(statType=="min"){
				cb(null, values[0]);
			}else if(statType=="max"){
				cb(null,values[values.length-1]);
			}else if(statType=="med"){
				var med=0;
				if(statType.length%2==0){
					med=(values[Math.floor(values.length/2)]+values[Math.floor(values.length/2)+1])/2;
				}else{
					med=values[Math.floor(values.length/2)];
				}
				cb(null,med);
			}
		});
	};
	
	// formal definition of out remote method - complexStat
	Data.remoteMethod(
		'complexStat',
		{
			accepts: [
				{arg: 'statType', type: 'string'},
				{arg: 'statSubj', type: 'string'},
				{arg: 'filter',type:'string'}
			],
			returns: {arg: 'response', type: 'string'},
			http: {path: '/complexStat', verb: 'get'}
		}
	);
};
