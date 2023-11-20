import { baseHeight, baseWidth, codes, gen, maxFlaks, spawnHeight, spawnWidth, turrentRadius, turrentSpacing } from "../../constants.js";
import { Vector } from "../math/vector.js";
import { objsAreAlly } from "./index.js";
import { Flak } from "./Flak.js";
import { Tank } from "./Tank.js";
import { APC } from "./APC.js";

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
    ];
    this.flaks = [];
    this.whose = whose;
    this.center = new Vector(x + this.w / 2, y + this.h / 2);
    this.spawnPoint = new Vector(this.center.x - spawnWidth / 2, this.pos.y + this.h);
    this.fireCenter = new Vector(this.center.x, this.spawnPoint.y);
    this.isSpawning = false;
    this.actualSpawnPoint = new Vector(this.spawnPoint.x + spawnWidth / 2, this.spawnPoint.y + spawnHeight / 2);
    function spawnMoveForward(obj) {
        obj.moveTo.push(new Vector(obj.pos.x, obj.pos.y + 300));
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
        let obid = gen.next().value, t;
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
    };
    Base.prototype.fireOn = function (obj) {
        for (let i = 0; i < this.flaks.length; i++) {
            if (this.flaks[i].rotate(obj, this.id)) {
                this.flaks[i].fireOn(obj, this.id);
            }
        }
    };
    Base.prototype.flakCollider = () => {
        this.target = this.flakTracker(this.gameLib.APCs);
        this.target = this.target ? this.target : this.flakTracker(this.gameLib.tanks);
        if (!this.target) return;
        this.fireOn(this.target);
    };
    Base.prototype.flakTracker = function (arr) {
        if (!this.flaks.length) return;
        for (const obj of arr.values()) {
            if (circle_collider(this.fireCenter, obj.pos, this.flaks[0].range) && !objsAreAlly(this, obj)) {
                return obj;
            }
        }
        return false;
    };
}
