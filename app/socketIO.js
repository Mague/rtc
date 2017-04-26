const conf = require('../conf')
// const sio_redis = require('socket.io-redis')
var board = require('rtc-switch')();
var rooms = []
var streams = []
module.exports = function(server){
	const io_conf = { transports: ['websocket', 'polling'] }
    var sio = require('socket.io')
    // var io = sio.listen(server)
    var io = sio(server,{ 
    	transports: ['websocket', 'polling','flashsocket','xhr-polling'],
    	origins:'http://*:* https://*:* https://rtcmague.herokuapp.com:*'
    })

    // io.adapter(sio_redis({ host: conf.redis.host, port: conf.redis.port }))
    io.on('listening',function(socket){
		console.log("llego una peticion")
    })
    // io.set('origins','*');
    // io.set('origins',)
    io.on('connection', function (socket) {
    	console.log("Sockets listos")
    	var peer = board.connect();
    	let myRoom;
    	let user;
		socket.on('rtc-signal', peer.process);
		peer.on('data', function(data) {
			console.log("SEÑAL")
			socket.emit('rtc-signal', data);
		});
		socket.on('newFrame',function(img) {
			console.log("hola");
			io.sockets.emit('setFrame',img);
		});


		//Chat de darwin
		console.log('se ha abierto una conexion');
		socket.emit('roomList',rooms);

		socket.on('createRoom',function(data){
			rooms.push(data);
			socket.emit('createRoomRes',rooms);
		});

		socket.on('getRooms',function(data){
		//rooms.push(data);
			socket.emit('createRoomRes',rooms);
		});
		socket.on('disconnect',function(){
			if(myRoom != undefined){
				console.log(socket.id+" se desconecto de "+myRoom)
				socket.leave(myRoom);
				io.in(myRoom).emit('disconnectRoom', {user:user})
			}
		});
		socket.on('joinRoom',function(data){
			console.log('requested join');
			console.log(JSON.stringify(data));
			myRoom = data.room;
			socket.join(data.room);
			user = data.user;
			if(streams.length<5){
				streams.push({user:data.user,video:'',audio:''});
			}
			//Tell all those in the room that a new user joined
			io.in(data.room).emit('user joined', data.user);
		})

		socket.on('newMessage',function(data){
			console.log('nuevo mensaje', data)
			data.date = new Date();
			io.in(data.room).emit('gotMessage', data);
		})

		socket.on('videoTest',function(data){
		//console.log('activad videoTest');
		//console.log(data);
			for(var i=0; i<streams.length;i++){
				if(streams[i].user == data.user){
				  streams[i].video = data.video;
				}
			}
			io.in(data.room).emit('VideoStream', streams);
		})

		socket.on('randomDices',(data)=>{
			var b = data.b
			var countDados=data.countDados
			if (countDados=='') {
				countDados=0;
			}
			var modDados=data.modDados
			// alert(modDados)
			modDados=modDados.toString();
			if (modDados=="NaN") {
				// alert("hola")
				modDados=0;
			}
			modDados=parseInt(modDados);
			var radDados1=data.radDados1
			// var radDados2=document.querySelector("#gender1"+b).value;
			var a=1;
			var array=[];
			var sum=0;
			var op=1;
			var sign="+";
			if (radDados1==true) {
				op=1;
				sign=" + ";
			}else{
				op=0;
				sign=" - ";
			}
			// alert(countDados)
			for(i=0;i<countDados;i++){
				array.push(Math.round(Math.random()*(b-a)+parseInt(a)));
				// alert(JSON.stringify(array));
				sum+=array[i];
				// alert(sum);
			}
			
			if (op==0) {
				sum-=modDados;
			}else if(op==1){
				sum+=modDados;
			}
			var result="Roll "+countDados+"d"+b+sign+modDados+" = "+sum
			var jsonDice={
				countDados:countDados,
				sign:sign,
				modDice:modDados,
				sum:sum,
				result:result,
				array:array,
				typeDice:b,
				user:user
			};
			io.in(myRoom).emit('randomDicesResult',jsonDice);
		})
    })
}