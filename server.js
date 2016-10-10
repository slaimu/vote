var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    app = express(),
    swig = require('swig'),
    React = require('react'),
    Router = require('react-router'),
    routes = require('./app/routes'),
    server = require('http').createServer(app),
    io = require('socket.io')(server),
    mongoose = require('mongoose'),
    Character = require('./models/character'),
    config = require('./config'),
    onlineUsers = 0;


app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
mongoose.connect(config.database);
mongoose.connection.on('error', function() {
  console.info('Error: Could not connect to MongoDB');
});

app.use(function(req, res) {
  Router.run(routes, req.path, function(Handler) {
    var html = React.renderToString(React.createElement(Handler));
    var page = swig.renderFile('views/index.html', { html: html });
    res.send(page);
  });
});


io.sockets.on('connection', function (socket) {
  onlineUsers += 1;

  io.sockets.emit('onlineUsers', {onlineUsers: onlineUsers});

  socket.on('disconnect', function () {
    onlineUsers -= 1;
    io.sockets.emit('onlineUsers', {onlineUsers: onlineUsers});
  });
});


server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});





  
