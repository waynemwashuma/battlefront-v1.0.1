//////utility functions///////
let imgs = {
    tank: new Image(),
    turrent: new Image(),
    apc: new Image(),
    flak1: new Image(),
    flak2: new Image(),
    base: new Image(),
    garage: new Image()
}
window.onload = function () {
    imgs.tank.src = '/res/img/tank.png';
    imgs.flak1.src = '/res/img/flak1.png';
    imgs.base.src = '/res/img/base.png';
    imgs.flak2.src = '/res/img/flak2.png';
    imgs.turrent.src = '/res/img/bitmap.png';
    imgs.garage.src = '/res/img/spawn.png';
    imgs.apc.src = '/res/img/APC.png';

}

//rectangle collider
function rect(obj1, obj2) {
    if (
        obj1.pos.x + obj1.h <= obj2.pos.x ||
        obj2.pos.x >= obj1.pos.x ||
        pos.y - width <= origin.y - padding ||
        pos.y + width >= origin.y + innerHeight + padding) {
        return true
    }
    return false
}
function rectToPoint(rect, point) {
    if (
        rect.pos.x < point.x &&
        rect.pos.x + rect.w > point.x &&
        rect.pos.y < point.y &&
        rect.pos.y + rect.h > point.y
    ) {
        return true
    }
    return false
}
//circle colider system

let dirtyvect;
function circle_collider(v1, v2, l) {
    //console.log(v2.copy());
    dirtyvect = v2.copy().subtact(v1).mag();
    if (dirtyvect <= l) {
        return true
    }
    return false
}
Array.prototype.remove = function (value) {
    let w = this.splice(0, this.indexOf(value));
    this.shift();
    this.push(...w);
}
/////global variables/////
//game objects` library
let gameLib = {
    bases: new Map(),
    tanks: new Map(),
    bullets: new Array(),
    APCs: new Map()
}
//////closure variables///////
//variables for base class;
//bullet variable
let bulletDecreaseWidthTime = 200;

/////classes for game objects///////
//bullet class
function Bullet(from, to) {
    this.pos = from.pos.copy();
    this.t = 10;
    this.pos1 = to.pos.copy();
    Bullet.prototype.draw = function (ct, originX, originY) {
        ct.save();
        ct.beginPath();
        ct.strokeStyle = "yellow";
        ct.moveTo(this.pos.x + originX, this.pos.y + originY);
        ct.lineWidth = 4;
        ct.lineTo(this.pos1.x + originX, this.pos1.y + originY);
        ct.stroke();
        ct.closePath();
        ct.restore();
    }
    Bullet.prototype.update = function () {
        if (this.t <= 0) {
            gameLib.bullets.remove(this)
        }
        this.t--
    }
}
//vehicle class

///////////game object initialization here////////////
let lastcall;
////////////the game animation loops/////////////
///for game canvas
; (function loop(dt) {
    ctx[0].clearRect(0, 0, innerWidth, innerHeight);
    gameLib.bases.forEach(base => {
        base.draw(ctx[0], windowRenderer.x, windowRenderer.y, imgs.base, imgs.garage, imgs.flak1, imgs.flak2);
    }

    )
    lastcall = dt;
    requestAnimationFrame(loop);
})();
//for fast canvas
; (function mainloop(dt) {
    ctx[1].clearRect(0, 0, innerWidth, innerHeight);
    ctx[1].arc(0, 0, 5, 0, Math.PI * 2);
    ctx[1].fill();
    gameLib.tanks.forEach((tank) => {
        tank.updateTurrent();
        tank.drawAll(ctx[1], windowRenderer.x, windowRenderer.y, imgs.tank, imgs.turrent);
    });
    gameLib.APCs.forEach(apc => {
        apc.draw(ctx[1], windowRenderer.x, windowRenderer.y, imgs.tank);
    })
    requestAnimationFrame(mainloop);
})();
; (function bulletloop() {
    ctx[2].clearRect(0, 0, c[2].width, c[2].height)
    gameLib.bullets.forEach(bullet => {
        bullet.draw(ctx[2], windowRenderer.x, windowRenderer.y);
    })
    requestAnimationFrame(bulletloop)
})();
/////interactive code for the user input/////
mouse.on('click', () => {
    if (!mouse.getObjs.length) {
        gameLib.tanks.forEach(tank => {
            if (circle_collider(new Vector(mouse.x, mouse.y).subtact(new Vector(windowRenderer.x, windowRenderer.y)), tank.pos, 50)) {
                mouse.addObjs(tank)
            }
        });
        gameLib.APCs.forEach(apc => {
            if (circle_collider(new Vector(mouse.x, mouse.y).subtact(new Vector(windowRenderer.x, windowRenderer.y)), apc.pos, 45)) {
                mouse.addObjs(apc)
            }
        })
        return
    };
    let collidetobase = false;
    gameLib.bases.forEach(base => {
        if (rectToPoint(base, new Vector(mouse.x, mouse.y).subtact(new Vector(windowRenderer.x, windowRenderer.y)))) {
            mouse.getObjs.forEach(ob => {
                if (ob instanceof APC) {
                    //socket.emit(codes.actioncodes.movement.toString(), [ob.id, new Vector(mouse.x, mouse.y).subtact(new Vector(windowRenderer.x, windowRenderer.y))])
                    ob.capture(base);
                }
                collidetobase = true;

            })
        }
    })
    if (collidetobase) return mouse.clearObjs();
    mouse.getObjs.forEach(ob => {
        socket.emit(codes.actioncodes.movement.toString(), [ob.id, new Vector(mouse.x, mouse.y).subtact(new Vector(windowRenderer.x, windowRenderer.y))])
    });
    mouse.clearObjs();
}, c.item(3))
setInterval(() => {
    gameLib.bullets.forEach(bullet => {
        bullet.update()
    })
}, bulletDecreaseWidthTime);
setInterval(function () {
    gameLib.bases.forEach(base => {
        base.flaks.forEach(flak => {
            flak.reload -= 1000
        })
    });
    gameLib.tanks.forEach(tank => {
        tank.turrent.reload -= 1000
    })
}, 1000);
setInterval(() => {
    for (let i = 0; i < ctx.length; i++) {

        c.item(i).width = innerWidth;
        c.item(i).height = innerHeight;
    }

}, 100);
function getcookie(key) {
    let pairs = document.cookie.split(';');
    for (let i = 0; i < pairs.length; i++) {
        if (pairs[i].includes(key)) {
            return pairs[i].split('=')[1]
        }
    }
}
function loop() {
    for (let val of gameLib.bases.values()) {
        for (let val of gameLib.bases.values()) {
            if (val.whose.name == user.name) return true
        }
    }
}

setTimeout(() => {
    user.name = getcookie('name');
    user.level = getcookie('lvl') || '';
    user.alliance = getcookie('alliance') || '';
    mainMenu.updateUserData(user.name, user.alliance, user.level);
    console.log(loop());
}, 2000)