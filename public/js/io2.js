let sock = io();
let room = document.querySelector('#room');
let box = document.querySelector('#chat-box');
let form = document.querySelector('#chat');
document.querySelector('#chat-butt').onclick = e=>{
    sock.emit('pl-message',form.value);
    if (room.value) sock.emit('room-join',room.value)
    form.value = '';
    
}
sock.on('sys-message',(...data)=>{
    let t = document.createElement('li');
    t.innerHTML = data[1] +' has '+(data[0]?'connected':'disconnected');
    box.append(t)
})
sock.on('message',(...data)=>{
    if (!data[0] || !data[1]) return;
    let t = document.createElement('li');
        t.innerHTML = data[0] +':'+data[1];
    if (data[0] == sock.id) {
        t.innerHTML =data[1];
    }
    box.append(t)
});
sock.on('debug',console.log);