const {ResHandler}=require('./resHandler')
Array.prototype.remove = function (value) {
    let w = this.findIndex(client=>client.socketid == id);
    if(w == -1)return;
    return this.splice(w,1)[0]
}
let clients = [];
function Client(uid, name, socketid) {
    this.name = name;
    this.uid = uid;
    this.online = true;
    this.lastOnline = null;
    this.lastlogin = null;
    this.resHandler = new ResHandler();
    this.socketid = socketid;
    this.rooms = [];
}
let chatRooms = [
    {
        name: 'global',
        role:'root',
    }
];
function findClient(id) {
    if (typeof id == 'number') return clients.find(client => client.uid === id);
    return clients.find(client => client.socketid === id);
}
function createClient(uid, name, socketid) {
    if (clients.find(client => client.uid === uid)) return;
    clients.push(new Client(uid, name, socketid))
}
function destroyClient(id) {
    return clients.remove(findClient(id))
}
function updateClient(client, online,socketid) {
    if (online) {
        client.online = online;
        client.lastlogin = Date.now();
        client.socketid = socketid;
    } else if (!online) {
        client.online = online;
        client.lastOnline = Date.now();
    }
}
function resolveClient(id, name, socketid) {
    let client = findClient(id);
    if (client) return updateClient(client,true,socketid);
    createClient(id, name, socketid)
}
function resolveAndJoinRoom(room,socket) {
    let resolved = chatRooms.find(e=>e.name == room);
    if(!resolved)chatRooms.push({name:room,role:'alliance'});
    findClient(socket.id).rooms.push(room)
    socket.join(room);
}
function findRoom(room) {
    chatRooms.find(e =>e.name === room)
}
function isAllichat(room){
    room = findRoom(room) || undefined;
    if(!room)return false;
    if(room.role == 'alliance')return true;
    return false;
}
function debug(server,socket) {
    server.to(socket.id).emit('debug',clients)
}
function findRoomUsers(room) {
    return clients.filter(client=>client.rooms.includes(room))
}
module.exports = {
    isAllichat,
    findClient,
    destroyClient,
    resolveClient,
    updateClient,
    resolveAndJoinRoom,
    debug,
    findRoomUsers,
    chatRooms,
    clients
}
setInterval(()=>{
    chatRooms.forEach(room=>{
        if(!findRoomUsers(room.name) && room.role !=='root')chatRooms.remove(room)
    })
},1000*60*60)