var media = require('rtc-media');
var crel = require('crel');
var capture = require('rtc-capture');
var attach = require('rtc-attach');
var qsa = require('fdom/qsa');
var local = crel('div', { class: 'local' });
var remote = crel('div', { class: 'remote' });
var peerMedia = {};
var plugins = [
	require('rtc-plugin-temasys')
];
capture({ audio: true, video: true }, { plugins: plugins }, function(err, localStream) {
	  if (err) {
	    return console.error('could not capture media: ', err);
	  }

	  // render the local media
	  attach(localStream, { plugins: plugins }, function(err, el) {
	    local.appendChild(el);
	  });
  	var socket = require('socket.io-client')('https://192.168.0.109:3000');
	var quickconnect = require('rtc-quickconnect');
	var signaller = require('rtc-signaller-socket.io')(socket);
	var freeice = require('freeice');
  // initiate connection
  	
	var qc = quickconnect(signaller, {
		iceServers: freeice(),
		room: 'test-room',
		plugins:plugins
	})
    // broadcast our captured media to other participants in the room
    .addStream(localStream)
    .on('channel:opened:test', function(id, dc) {
    	//alert("channel:opened:test")
		console.log('data channel opened with peer: ' + id);
	})
    // when a peer is connected (and active) pass it to us for use
    .on('call:started', function(id, pc, data) {
    	//alert("call:started")
    	console.log(pc)
    	var pcs = pc.getRemoteStreams();
    	for(var i=0;i<pcs.length;i++){
			attach(pcs[i], { plugins: plugins }, function(err, el) {
				if (err) return;
				//alert("Por aqui paso")
				el.dataset.peer = id;
				remote.appendChild(el);
			});
    	}
    })
    // when a peer leaves, remove teh media
    .on('call:ended', function(id) {
    	//alert("call:ended")
		qsa('*[data-peer="' + id + '"]', remote).forEach(function(el) {
			el.parentNode.removeChild(el);
		});
    });
});

/* extra code to handle dynamic html and css creation */

// add some basic styling
document.head.appendChild(crel('style', [
  '.local { position: absolute;  right: 10px; }',
  '.local video { max-width: 200px; }',
  // '.remote { position: absolute;  right: 10px; }',
  '.remote video { max-width: 300px; }'
].join('\n')));

// add the local and remote elements
document.body.appendChild(local);
document.body.appendChild(remote);