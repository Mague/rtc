const conf = require('../conf')
const sio_redis = require('socket.io-redis')
var board = require('rtc-switch')();
module.exports = function(server){
	const io_conf = { transports: ['websocket', 'polling'] }
    var sio = require('socket.io')
    // var io = sio.listen(server)
    var io = sio(server,{ transports: ['websocket', 'polling'] })

    // io.adapter(sio_redis({ host: conf.redis.host, port: conf.redis.port }))
    io.on('listening',function(socket){
		console.log("llego una peticion")
    })
    io.on('connection', function (socket) {
    	console.log("Sockets listos")
    	var peer = board.connect();

		socket.on('rtc-signal', peer.process);
		peer.on('data', function(data) {
			console.log("SEÑAL")
			socket.emit('rtc-signal', data);
		});
		socket.on('newFrame',function(img) {
			console.log("hola");
			io.sockets.emit('setFrame',img);
		});
    })
}