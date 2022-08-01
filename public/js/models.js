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
        APC.prototype.capture = function (obj, arr) {
            socket.emit(codes.actioncodes.occupation.toString(), [obj.id, this.id])
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