//update client library//
let socket = io.connect('http://localhost:3000');
socket.on('firstConnect-bases',function (data) {
    let flakNo = data.pop(),
    base = new Base(...data);
        for (let i = 0; i < flakNo; i++) {
        base.addFlakonBase();
    }
    gameLib.bases.set(data[2],base);
})
socket.on('firstConnect-tanks',function (data) {
    let tank = new Tank(...data);
    gameLib.tanks.set(data[2],tank)
});
socket.on('firstConnect-APCs',function (data) {
    let A = new APC(...data);
    gameLib.APCs.set(data[2],A)
});
socket.on('vehicle-rotate',data=>{
    if (gameLib.tanks.has(data[0])) return gameLib.tanks.get(data[0]).deg = data[1]; 
    if (gameLib.APCs.has(data[0])) return gameLib.APCs.get(data[0]).deg = data[1]; 

});
socket.on(codes.actioncodes.movement.toString(),data=>{
    if (gameLib.tanks.has(data[0])) {
        gameLib.tanks.get(data[0]).pos.x = data[1].x;
        gameLib.tanks.get(data[0]).pos.y = data[1].y;
    }
    if (gameLib.APCs.has(data[0])) {
        gameLib.APCs.get(data[0]).pos.x = data[1].x;
        gameLib.APCs.get(data[0]).pos.y = data[1].y;
    }
})
socket.on(codes.objcodes.tank.toString() + codes.actioncodes.creation.toString(), data => {
    let tank = new Tank(...data);
    gameLib.tanks.set(data[2],tank);
});
socket.on(codes.objcodes.APC.toString() + codes.actioncodes.creation.toString(), data => {
    let A = new APC(...data);
    gameLib.APCs.set(data[2],A);
});
socket.on(codes.objcodes.flak.toString() + codes.actioncodes.creation.toString(), data => {
    gameLib.bases.get(data[0]).addFlakonBase();
});
socket.on('flak-rotate',function (data) {
    while (data[2] < 360) {
        data[2] += 360;
    }
    while (data[2] > 360) {
        data[2] -= 360;
    }
    if (data[0] == 'flak') {
        gameLib.bases.get(data[3]).flaks[data[1]].deg = data[2];
    }else{
        gameLib.tanks.get(data[1]).turrent.deg = data[2];
    }
});
socket.on(codes.actioncodes.destruction.toString(),data=>{
    if (data[0] =='tank') {
        gameLib.tanks.delete(data[1])
    }else if (data[0] == 'APC') {
        gameLib.APCs.delete(data[1])
    }else{
        gameLib.bases.get(data[1]).flaks.pop();
    }
});
socket.on('fire',data=>{
    if(data[0] == 'turrent'){
        if(data[3])return gameLib.bullets.push(new Bullet(gameLib.tanks.get(data[1]),gameLib.bases.get(data[3]).flaks[gameLib.bases.get(data[3]).flaks.length-1]));
        gameLib.bullets.push(new Bullet(gameLib.tanks.get(data[1]),gameLib.tanks.has(data[2])?gameLib.tanks.get(data[2]):gameLib.APCs.get(data[2])));
    }
    if (data[0]  == 'flak')gameLib.bullets.push(new Bullet(gameLib.bases.get(data[3]).flaks[data[1]],gameLib.tanks.has(data[2])?gameLib.tanks.get(data[2]):gameLib.APCs.get(data[2])))
});
socket.on('base-rename',data=>{
    gameLib.bases.get(data[0]).whose = data[1]
});
socket.on('game-error',data=>{
    alert('Game error',data)
})
socket.on('base-creation',data=>{
    gameLib.bases.set(data[2],new Base(...data))
})
socket.on('log',console.log)
//emit target base intended to produce the vehicle --done//
//placed in creatoncard class{res.js}//

//emit the vehicle id and intended pont to move to ---done///