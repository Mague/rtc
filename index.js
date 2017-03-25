var express = require('express');
var app = express();
var server = require('http').Server(app);
var port = process.env.PORT || 3000;
var path = require('path')
// create the switchboard
var switchboard = require('rtc-switchboard')(server);
var bunyan = require('bunyan');
var log = bunyan.createLogger({ name: 'rtc-switchboard' });

// we need to expose the primus library
//app.get('/rtc.io/primus.js', switchboard.library());

server.listen(port, function(err) {
  if (err) {
    return;
  }
  console.log('server listening on port: ' + port);
});
app.use('/public', express.static('public'));
app.get("/chat",function(re,res,next){
  res.sendFile(path.join(__dirname + '/index.html'))
})
switchboard.on('data', function(data, peerId, spark) {
  log.info({ peer: peerId }, 'received: ' + data);
});