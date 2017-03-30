var http = require('http'),
	conf = require('./conf'),
	bunyan = require('bunyan'),
	log = bunyan.createLogger({ name: 'rtc-switchboard' }),
	// mongoose = require('mongoose'),
	expressServer = require('./app/index')
var Workers = function(config){
	config = config || {}
	/*"user":"spoint",
    	"pwd":"spoint2017",
        "name": "spoint",
        "host": "ds131320.mlab.com:31320"*/
	// mongoose.connect('mongodb://' + conf.mongoDB.host + '/' + conf.mongoDB.name);
	// mongoose.connect('mongodb://'+conf.mongoDB.user+':'+conf.mongoDB.pwd+"@"+ conf.mongoDB.host + '/' + conf.mongoDB.name);

	// var db = mongoose.connection;
	// db.on('error',console.error.bind(console,'Error de conexion:'));
	// db.once('open',function(){
	// 	console.log("Bd conectada")
	// })
	var app = new expressServer({}).expressServer;

	this.server = http.createServer(app);
	switchboard = require('rtc-switchboard')(this.server)
	switchboard.on('data', function(data, peerId, spark) {
		log.info({ peer: peerId }, /*'received: ' + data*/ '');
	});
}

Workers.prototype.run = function(){
	console.log(conf.port)
	this.server.listen(process.env.PORT || conf.port);
}

if(module.parent){
	module.exports = Workers;
} else {
	new Workers();
	console.log('debugger');
}
