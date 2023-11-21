let express = require('express');
let userManager = require('./node_utils/chatconfig')
const path = require('path');
let app = express();
let http = require('http').createServer(app);
let port = 8081;
let io = require('socket.io').Server;
let server =new io(http);
http.listen(port,()=>{
    console.log('listening on',port);
});
app.use('/',express.static(path.join(__dirname,'public')))
console.log(__dirname)
app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/public/test.html')
});
server.on('connection',socket=>{
    userManager.resolveClient(socket.id,'sumpyne',socket.id)
    socket.on('pl-message',data=>{
        console.log(data);
        server.emit('message',socket.id,data)
    })
    socket.on('room-join',(room)=>{
        let user = userManager.findClient(socket.id)
        userManager.resolveAndJoinRoom(room,socket);
        server.to(room).emit('sys-message',true,socket.id)
    })
    socket.on('room-leave',room=>{
        let user = userManager.findClient(socket.id);
        
    })
    socket.on('debug',()=>{
        userManager.debug(server,socket)
    })
    socket.broadcast.emit('sys-message',true,socket.id)
    socket.on('disconnect',()=>{
        userManager.updateClient(userManager.findClient(socket.id),false)
        socket.broadcast.emit('sys-message',false,socket.id);
    })
});