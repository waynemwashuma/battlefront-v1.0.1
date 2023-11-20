import { baseHeight, baseWidth, codes, flakRadius, gen, maxFlaks, spawnHeight, spawnWidth, turrentRadius, turrentSpacing } from "../../constants.js";
import {Vector} from "../math/vector.js"

export function CreationCard(objcode, base) {
    base.isSpawning = true;
    this.base = base;
    this.timer = 0;
    this.code = objcode;
    switch (objcode) {
        case codes.objcodes.tank:
            this.timer = 6;
            break;
        case codes.objcodes.APC:
            this.timer = 2;
            break;
        case codes.objcodes.flak:
            this.timer = 2;
            break;
    }
    CreationCard.prototype.remove = function (arr) {
        console.log('new object added to library');
        this.base.isSpawning = false;
        this.base.spawn(this.code);
        arr.remove(this);
    }
}
export function CaptureCard(base, apc) {
    this.apc = apc;
    this.base = base;
    CaptureCard.prototype.capture = function () {
        if (base.actualSpawnPoint.copy().subtract(apc.pos.copy()).mag() < 10) {
            apc.capture(this.base, this.gameLib.APCs)
            captures.remove(this);
        }
    }
}
export class Vehicle {
    constructor(x, y, id, whose, deg) {
        this.pos = new Vector(x, y);
        this.deg = deg || 0;
        this.Undeg;
        this.w = 100;
        this.h = 50;
        this.whose = whose;
        this.reload = 1000;
        this.health = 100;
        this.moveTo = [];
        this.id = id;
        this.vel = new Vector(1, 1);
        Vehicle.prototype.move = function () {
            if (this.moveTo.length) {
                if (this.rotate()) {
                    if (circle_collider(this.pos, this.moveTo[0], 5)) {
                        this.moveTo.shift();
                    }
                    this.pos.add(this.vel);
                    server.emit(codes.actioncodes.movement, [this.id, this.pos])
                }
            }
        };
        Vehicle.prototype.removeAsHealth0 = function name(arr) {
            if (this.health < 1) {
                this.remove(arr);
                server.emit(codes.actioncodes.destruction.toString(), [this.name, this.id])
            }
        }
        Vehicle.prototype.remove = function (arr) {
            server.emit(codes.actioncodes.destruction.toString(), [this.name, this.id])
            arr.delete(this.id)
        }
        Vehicle.prototype.rotate = function () {
            this.Undeg = Vector.getDegBtwnVectors(this.moveTo[0].copy().subtract(this.pos), Vector.DegToUN(this.deg));
            if (this.Undeg < 2) {
                this.vel = Vector.DegToUN(this.deg).mult(5);

                return true;
            }
            --this.deg;
            server.emit('vehicle-rotate', [this.id, this.deg]);
            return false;
        };
    }
}
//apc class
export class APC extends Vehicle {
    constructor(x, y, id, whose, deg) {
        super(x, y, id, whose, deg);
        this.name = 'APC';
        APC.prototype.capture = function (obj, arr) {
            obj.whose = this.whose;
            this.remove(arr);
            server.emit('base-rename', [obj.id, this.whose])
        };
    }
}
//tank class
export class Tank extends Vehicle {
    constructor(x, y, id, whose, deg) {
        super(x, y, id, whose, deg);
        this.name = 'tank';
        this.turrent = new Turrent(this.pos.x, this.pos.y, this.id);
        Tank.prototype.drawAll = function (ct, originX, originY) {
            this.draw(ct, originX, originY);
            this.turrent.draw(ct, originX, originY);
        }
        Tank.prototype.updateTurrent = function () {
            let id;
            this.turrent.pos = this.pos;
            this.target = this.turrent.track(this, this.gameLib.tanks);
            this.target = this.target ? this.target : this.turrent.track(this, this.gameLib.APCs);
            this.target = this.target ? this.target : this.turrent.trackFlaks(this, this.gameLib.bases)
            if (this.target instanceof Array) {
                id = this.target[1]
                this.target = this.target[0]
            }
            if (this.target) {
                if (this.turrent.rotate(this.target)) {
                    if (this.turrent.reload <= 0) {
                        this.turrent.fireOn(this.target, id)
                    }
                }
            }
        }
    }
}
//flak class
export function Flak(x, y, deg, id) {
    this.id = id;
    this.name = 'flak';
    this.health = 100;
    this.pos = new Vector(x, y);
    this.deg = deg;
    this.Undeg;
    this.r = flakRadius;
    this.range = 500;
    this.damage = 2;
    this.reload = 0;
    Flak.prototype.trackFlak = (obj, base) => {
        if (circle_collider(base.spawnPoint, obj.pos, this.range) && !objsAreAlly(obj, base)) {
            return [base.flaks[base.flaks.length - 1], base.id]
        }
        return false
    }
    Flak.prototype.trackFlaks = (obj, arr) => {
        let flak;
        for (const e of arr.values()) {
            if (flak = this.trackFlak(obj, e)) {
                return flak;
            }
        }
        return false
    }
    Flak.prototype.track = function (obj, arr) {
        //this should be in the base class:::done
        for (const e of arr.values()) {
            if (circle_collider(this.pos, e.pos, this.range) && !Object.is(obj, e) && !objsAreAlly(obj, e)) {
                return e;
            }
        }
        return false
    }
    Flak.prototype.removeAsHealth0 = function name(arr, base) {
        if (this.health < 1) {
            this.remove(arr);
            server.emit(codes.actioncodes.destruction.toString(), [this.name, base.id])
        }
    }
    Flak.prototype.remove = function (arr) {
        arr.remove(this)
    }
    Flak.prototype.rotate = function (obj, thisid) {
        this.Undeg = Vector.getDegBtwnVectors(obj.pos.copy().subtract(this.pos), Vector.DegToUN(this.deg))
        if (this.Undeg < 2) {
            return true
        }
        this.deg++;
        server.emit('flak-rotate', [this.name, this.id, this.deg, thisid]);
        return false
    }
    Flak.prototype.fireOn = function (obj, thisid) {
        if (this.reload <= 0) {
            server.emit('fire', [this.name, this.id, obj.id, thisid])
            obj.health -= this.damage;
            this.reload = 10000;
        }
    }
}
//turrent class
export class Turrent extends Flak {
    constructor(x, y, id) {
        super(x, y, 90, id);
        this.name = 'turrent';
        this.range = 500;
        this.reload = 2000;
    }
}
//base class
export function Base(x, y, id, whose) {
    this.name = 'base';
    this.id = id;
    this.pos = new Vector(x, y);
    this.w = baseHeight;
    this.h = baseWidth;
    this.vertice = [
        new Vector(x, y),
        new Vector(x + this.w, y),
        new Vector(x + this.w, y + this.h),
        new Vector(x, y + this.h)
    ];
    this.movePoints = [
        new Vector(x - 70, y - 70),
        new Vector(x + this.w + 70, y - 70),
        new Vector(x + this.w + 70, y + this.h + 70),
        new Vector(x - 70, y + this.h + 70)
    ]
    this.flaks = [];
    this.whose = whose;
    this.center = new Vector(x + this.w / 2, y + this.h / 2);
    this.spawnPoint = new Vector(this.center.x - spawnWidth / 2, this.pos.y + this.h);
    this.fireCenter = new Vector(this.center.x, this.spawnPoint.y);
    this.isSpawning = false;
    this.actualSpawnPoint = new Vector(this.spawnPoint.x + spawnWidth / 2, this.spawnPoint.y + spawnHeight / 2);
    function spawnMoveForward(obj) {
        obj.moveTo.push(new Vector(obj.pos.x, obj.pos.y + 300))
    }
    function determineFlakpos(that, n) {
        let xt = n % 2 ? that.center.x + spawnWidth / 2 + ((turrentRadius + turrentSpacing) * (n / 2 - 0.5)) + ((n / 2 + 0.5) * turrentRadius) : that.center.x - spawnWidth / 2 - ((turrentRadius + turrentSpacing) * (n / 2)) - ((n / 2 + 1) * turrentRadius);
        return [xt, that.pos.y + that.h + turrentRadius + turrentSpacing];
    }
    function addFlak(that) {
        if (that.flaks.length >= maxFlaks) return;
        let flak = new Flak(...determineFlakpos(that, that.flaks.length), 0, that.flaks.length);
        that.flaks.push(flak);
    }
    Base.prototype.spawn = function (code) {
        let obid = gen.next().value,
            t;
        switch (code) {
            case codes.objcodes.tank:
                t = new Tank(this.actualSpawnPoint.x, this.actualSpawnPoint.y, obid, this.whose, 90);
                this.gameLib.tanks.set(obid, t);
                //server.emit(codes.objcodes.tank.toString() + codes.actioncodes.creation.toString(), [t.pos.x, t.pos.y, t.id, t.whose, t.deg]);
                break;
            case codes.objcodes.APC:
                t = new APC(this.actualSpawnPoint.x, this.actualSpawnPoint.y, obid, this.whose, 90);
                this.gameLib.APCs.set(obid, t);
                //server.emit(codes.objcodes.APC.toString() + codes.actioncodes.creation.toString(), [t.pos.x, t.pos.y, t.id, t.whose, t.deg]);
                break;
            default:
                addFlak(this);
                //server.emit(codes.objcodes.flak.toString() + codes.actioncodes.creation.toString(), [this.id, this.flaks[this.flaks.length - 1].pos]);
                break;
        }
        if (t) spawnMoveForward(t);
    }
    Base.prototype.fireOn = function (obj) {
        for (let i = 0; i < this.flaks.length; i++) {
            if (this.flaks[i].rotate(obj, this.id)) {
                this.flaks[i].fireOn(obj, this.id);
            }
        }
    }
    Base.prototype.flakCollider = () => {
        this.target = this.flakTracker(this.gameLib.APCs)
        this.target = this.target ? this.target : this.flakTracker(this.gameLib.tanks);
        if (!this.target) return;
        this.fireOn(this.target)
    }
    Base.prototype.flakTracker = function (arr) {
        if (!this.flaks.length) return;
        for (const obj of arr.values()) {
            if (circle_collider(this.fireCenter, obj.pos, this.flaks[0].range) && !objsAreAlly(this, obj)) {
                return obj
            }
        }
        return false
    }
}

function objsAreAlly(obj1, obj2) {
    if (
        (obj1.whose.id === obj2.whose.id || obj1.whose.alliance === obj2.whose.alliance) &&
        (obj2.whose.alliance.length || obj1.whose.id === obj2.whose.id)
    ) return true;
    return false
}