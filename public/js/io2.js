let sock = io();
let room;
let box = document.querySelector('#chat-box');
let form = document.querySelector('#chat-message');
document.querySelector('#chat-send').onclick = e=>{
    sock.emit('pl-message',form.value);
    if (room) sock.emit('room-join',room)
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
sock.on('rooms',console.log);