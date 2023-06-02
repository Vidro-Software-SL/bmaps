(function() {
'use strict';

	/**
	 * Logger Service
	 */

	angular.module('app').factory('loggerService', ['$http', function ($http) {

		var env;

		function init(_env){
			if(_env!="prod"){
				env 	= true;
			}
			log("loggerService","init("+_env+")","log");
		}

		function log(emitter, msg,level,json){
			if(level=="info"){
				info(emitter,msg,json);
			}else	if(level==="warn"){
				warn(emitter,msg,json);
			}else	if(level==="error"){
				error(emitter,msg,json);
			}else if(level==="success"){
				success(emitter,msg,json);
			}else{
				if(env){
					if(json){
						console.log(emitter,"->",msg,json);
					}else{
						console.log(emitter,"->",msg);
					}
				}
			}
		}

		function warn(emitter, msg,json){
			if(env){
				if(typeof json!="undefined"){
					console.warn(emitter,"->",msg,json);
				}else{
					console.warn(emitter,"->",msg);
				}
			}
		}

		function info(emitter, msg,json){
			if(env){
				if(typeof json!="undefined"){
					console.info(emitter,"->",msg,json);
				}else{
					console.info(emitter,"->",msg);
				}
			}
		}

		function error(emitter, msg,json){
			if(env){
				if(typeof json!="undefined"){
					console.error(emitter,"->",msg,json);
				}else{
					console.error(emitter,"->",msg);
				}
			}
		}

		function success(emitter, msg,json){
			if(env){
				if(typeof json!="undefined"){
					console.log('%c'+emitter+": "+msg,'color: green;font-weight: bold;',json);
				}else{
					console.log('%c'+emitter+": "+msg,'color: green;font-weight: bold;');
				}
			}
		}

		var dataFactory = {
			init		: init,
			log			: log,
			warn		: warn,
			error		: error
		};


		return dataFactory;


	}])

})();
