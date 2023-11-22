import { baseHeight, baseWidth, codes, gen, maxFlaks, spawnHeight, spawnWidth, turrentRadius, turrentSpacing } from "../../constants.js";
import { Vector } from "../math/vector.js";
import { objsAreAlly } from "./index.js";
import { Flak } from "./Flak.js";
import { Tank } from "./Tank.js";
import { APC } from "./APC.js";
import { VehicleType } from "../main.js";
import { circle_collider } from "../functions.js";

//base class
function spawnMoveForward(obj) {
    obj.moveTo.push(new Vector(obj.pos.x, obj.pos.y + 300));
}
function determineFlakpos(that, n) {
    let xt = n % 2 ?
        that.center.x + spawnWidth / 2 + ((turrentRadius + turrentSpacing) * (n / 2 - 0.5)) + ((n / 2 + 0.5) * turrentRadius) :
        that.center.x - spawnWidth / 2 - ((turrentRadius + turrentSpacing) * (n / 2)) - ((n / 2 + 1) * turrentRadius)
    return [xt, that.pos.y + that.h + turrentRadius + turrentSpacing];
}
export class Base {
    constructor(x, y, whose,id = gen.next().value) {
        this.gameLib = null
        this.name = 'base';
        this.id = id;
        this.pos = new Vector(x, y);
        this.w = baseWidth;
        this.h = baseHeight;
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
    }
    _addFlak() {
        if (this.flaks.length >= maxFlaks) return;
        let flak = new Flak(...determineFlakpos(this, this.flaks.length), 0, this)
        this.flaks.push(flak);
        this.gameLib.add(
            flak, VehicleType.FLAK
        );
    }
    flakCollider() {
        this.target = this.flakTracker(this.gameLib.APCs);
        this.target = this.target ? this.target : this.flakTracker(this.gameLib.tanks);
        if (!this.target) return;
        this.fireOn(this.target);
    };
    fireOn(obj) {
        for (let i = 0; i < this.flaks.length; i++) {
            if (this.flaks[i].rotate(obj, this.id)) {
                this.flaks[i].fireOn(obj, this.id);
            }
        }
    };
    spawn(code) {
        let obid = gen.next().value, t;
        switch (code) {
            case codes.objcodes.tank:
                t = new Tank(this.actualSpawnPoint.x, this.actualSpawnPoint.y, obid, this.whose, 90);
                this.gameLib.add(t, VehicleType.TANK)
                break;
            case codes.objcodes.APC:
                t = new APC(this.actualSpawnPoint.x, this.actualSpawnPoint.y, obid, this.whose, 90);
                this.gameLib.add(t, VehicleType.APC);
                break;
            default:
                this._addFlak();
                break;
        }
        if (t) spawnMoveForward(t);
    };
    flakTracker(arr) {
        if (!this.flaks.length) return;
        for (const obj of arr.values()) {
            if (circle_collider(this.fireCenter, obj.pos, this.flaks[0].range) && !objsAreAlly(this, obj)) {
                return obj;
            }
        }
        return false;
    };
    toJson() {
        let b = this
        return [b.pos.x, b.pos.y, b.id, b.whose, b.flaks.length]
    }
}