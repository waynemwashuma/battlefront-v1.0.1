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
class Vector {
    constructor(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.mag = function () {
            return Math.sqrt(Math.pow(this.y, 2) + Math.pow(this.x, 2) + Math.pow(this.z, 2));
        };
        Vector.prototype.copy = function () {
            return new Vector(this.x, this.y, this.z)
        }
        Vector.prototype.add = function (v) {
            this.x = this.x + v.x;
            this.y = this.y + v.y;
            this.z = this.z + v.z;
            return this
        };
        Vector.prototype.subtact = function (v) {
            this.x = this.x - v.x;
            this.y = this.y - v.y;
            this.z = this.z - v.z;
            return this
        };
        Vector.prototype.dot = function (v) {
            return this.x * v.x + this.y * v.y + this.z * v.z;
        };
        Vector.prototype.mult = function (n) {
            return new Vector(this.x * n, this.y * n, this.z * n);
        };
        Vector.div = function (n) {
            if (n == 0) {
                return new Vector();
            }
            return new Vector(this.x / n, this.y / n, this.z / z)
        }
        Vector.prototype.normalize = function () {
            return new Vector(this.x / this.mag(), this.y / this.mag(), this.z / this.mag());
        };
        Vector.prototype.tangent2d = function () {
            let v = this.normalize();
            return new Vector(-v.y, v.x);
        };
        Vector.prototype.draw = function (ct, startX = 0, startY = 0, color = 'red') {
            ct.save();
            ct.beginPath();
            ct.moveTo(startX, startY);
            ct.strokeStyle = color;
            ct.lineTo(startX + this.x, startY + this.y);
            ct.stroke();
            ct.closePath();
            ct.restore();
            return this
        };
        Vector.prototype.rotate = function (rad) {
            this.x = this.x * Math.cos(rad) - this.y * Math.sin(rad);
            this.y = this.x * Math.sin(rad) + this.y * Math.cos(rad);
        };
        Vector.prototype.toArr = () => {
            return [
                this.x,
                this.y,
            ];
        };
        Vector.prototype.toObj = () => {
            return {
                x: this.x,
                y: this.y,
                z: this.z
            }
        }
        Vector.prototype.reflectX = () => {
            this.x = -this.x;
        }
        Vector.prototype.reverse = () => {
            this.x = -this.x;
            this.y = -this.y;
            this.z = -this.z;
        }
    }
    get x_axis() {
        return new Vector(1)
    }
    static getDegBtwnVectors(v1, v2) {
        return Math.acos(v1.dot(v2) / (v1.mag() * v2.mag())) * 180 / Math.PI
    }
    static getAbsDegBtwnVectors(v1, v2, t) {
        //goes anticlockwise
        let absDeg = Vector.getDegBtwnVectors(v1, v1.x_axis);
        absDeg = v1.y > 0 ? absDeg : 360 - absDeg;
        if (t) {
            console.log(absdeg);
        }
        v1.rotate(absDeg * Math.PI / 180);
        v2.rotate(absDeg * Math.PI / 180);
        return v2.y > 0 ? Vector.getDegBtwnVectors(v1, v2) : 360 - Vector.getDegBtwnVectors(v1, v2)
    }
    static DegToUN(deg) {
        return new Vector(Math.cos(deg * Math.PI / 180), Math.sin(deg * Math.PI / 180))
    }
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
let mapWidth = 20000, mapHeight = 20000;
let baseWidth = 700, baseHeight = 400, turrentSpacing = 5, turrentRadius = 20, maxFlaks = 10, spawnWidth = 250, spawnHeight = 100;

//variables for flak class
let flakHeight, flakWidth, flakRadius = 20;

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
class Vehicle {
    constructor(x, y, id, whose, deg) {
        this.pos = new Vector(x, y);
        this.deg = deg || 0;
        this.Undeg;
        this.whose = whose;
        this.id = id;
        this.vel = new Vector(1, 1);
        Vehicle.prototype.remove = function (arr) {
            arr.delete(this.id)
        }
        Vehicle.prototype.draw = function (ct, originX, originY, img) {
            ct.save();
            ct.beginPath();
            ct.translate(this.pos.x + originX, this.pos.y + originY);
            ct.rotate(this.deg * Math.PI / 180 + Math.PI / 2);
            ct.fillStyle = "black";
            ct.drawImage(img, -img.width / 2, -img.height / 2);
            ct.closePath();
            ct.restore();
        };
    }
}
//apc class
class APC extends Vehicle {
    constructor(x, y, id, whose, deg) {
        super(x, y, id, whose, deg);
        APC.prototype.capture = function (obj) {
            socket.emit(codes.actioncodes.occupation.toString(), [obj.id, this.id])
            console.log();
        };
    }
}
//tank class
class Tank extends Vehicle {
    constructor(x, y, id, whose, deg) {
        super(x, y, id, whose, deg);
        this.turrent = new Turrent(this.pos);
        Tank.prototype.drawAll = function (ct, originX, originY, img1, img2) {
            this.draw(ct, originX, originY, img1);
            this.turrent.draw(ct, originX, originY, img2);
        }
        Tank.prototype.updateTurrent = function () {
            this.turrent.pos = this.pos;
        }
    }
}
//flak class
function Flak(x, y, deg = 90) {
    this.pos = new Vector(x, y);
    this.deg = deg;
    this.Undeg;
    this.r = flakRadius;
    this.range = 500;
    this.damage = 2;
    this.reload = 0;
    Flak.prototype.draw = function (ct, originX, originY, img1, img2) {
        ct.save();
        ct.beginPath();
        ct.translate(this.pos.x + originX, this.pos.y + originY);
        ct.rotate(Math.PI);
        ct.drawImage(img1, -img1.width / 2, -img1.height / 2);
        ct.arc(0, 0, 5, 0, Math.PI);
        ct.rotate(this.deg * Math.PI / 180 - Math.PI / 2);
        ct.drawImage(img2, -img2.width / 2, -img2.height / 2);
        ct.closePath();
        ct.restore();
    }
    Flak.prototype.track = function (obj, arr) {
        //this should be in the base class:::done
        for (const e of arr.values()) {
            if (circle_collider(this.pos, e.pos, this.range) && !Object.is(obj, e) && !(e.whose.id == obj.whose.id || e.whose.alliance == obj.whose.alliance)) {
                return e;
            }
        }
        return false
    }
    Flak.prototype.removeAsHealth0 = function name(arr, base) {
        if (this.health < 1) {
            this.remove(arr);
        }
    }
    Flak.prototype.remove = function (arr) {
        arr.remove(this)
    }
    Flak.prototype.rotate = function (obj, thisid) {
        this.Undeg = Vector.getDegBtwnVectors(obj.pos.copy().subtact(this.pos), Vector.DegToUN(this.deg))
        if (this.Undeg < 2) {
            return true
        }
        360 - this.deg > 180 ? this.deg-- : this.deg++;
        return false
    }
    Flak.prototype.fireOn = function (obj) {
        if (this.reload <= 0) {
            obj.health -= this.damage;
            console.log('fire');
            this.reload = 10000;
        }
    }

}
//turrent class
class Turrent extends Flak {
    constructor(x, y) {
        super();
        this.range = 500;
        this.reload = 2000;
        Turrent.prototype.draw = function (ct, originX, originY, img) {
            ct.save();
            ct.beginPath();
            ct.translate(this.pos.x + originX, this.pos.y + originY);
            ct.rotate(this.deg * Math.PI / 180 + Math.PI / 2);
            ct.drawImage(img, -img.width / 2, -img.height / 2 - 10)
            ct.closePath();
            ct.restore();
        }
    }
}
//base class
function Base(x, y, id, whose) {
    this.id = id;
    this.pos = new Vector(x, y);
    this.flaks = [];
    this.whose = whose;
    this.w = baseWidth;
    this.h = baseHeight;
    this.center = new Vector(x + this.w / 2, y + this.h / 2);
    this.spawnPoint = new Vector(this.center.x - spawnWidth / 2, this.pos.y + this.h);
    this.fireCenter = new Vector(this.center.x, this.spawnPoint.y);
    this.isSpawning = false;
    function determineFlakpos(that, n) {
        let xt = n % 2 ? that.center.x + spawnWidth / 2 + ((turrentRadius + turrentSpacing) * (n / 2 - 0.5)) + ((n / 2 + 0.5) * turrentRadius) : that.center.x - spawnWidth / 2 - ((turrentRadius + turrentSpacing) * (n / 2)) - ((n / 2 + 1) * turrentRadius);

        return [xt, that.pos.y + that.h + turrentRadius + turrentSpacing]
    }
    function addFlak(that) {
        if (that.flaks.length >= maxFlaks) {
            return alert("flaks have reached its maximum")
        }
        let flak = new Flak(...determineFlakpos(that, that.flaks.length));
        that.flaks.push(flak);
    }
    Base.prototype.draw = function (ct, originX, originY, img1, img2, img3, img4) {
        ct.beginPath();
        ct.fillStyle = "blue";
        ct.drawImage(img1, this.pos.x + originX, this.pos.y + originY)
        //ct.closePath();

        this.drawSpawn(ct, originX, originY, img2);
        if (this.flaks.length) {
            this.flaks.forEach(el => {
                el.draw(ct, originX, originY, img3, img4)
            })
        }
        ct.font = '32px verdana';
        ct.fillStyle = 'rgb(0,255,0)';
        let a = (spawnWidth - ct.measureText(this.whose.name).width) / 2;
        ct.fillText(this.whose.name, this.spawnPoint.x + originX + a, this.spawnPoint.y + originY);
        ct.font = '16px verdana';
        let b = (spawnWidth - ct.measureText(this.whose.alliance).width) / 2;
        ct.fillText(this.whose.alliance, this.spawnPoint.x + originX + b, this.spawnPoint.y + originY + 20);
        ct.closePath();
    }
    Base.prototype.drawSpawn = function (ct, originX, originY, img) {
        ct.beginPath();
        ct.fillStyle = "blue";
        ct.drawImage(img, this.spawnPoint.x + originX, this.spawnPoint.y + originY)
        ct.closePath()
    }
    Base.prototype.addFlakonBase = function () {
        addFlak(this);
    }
}
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