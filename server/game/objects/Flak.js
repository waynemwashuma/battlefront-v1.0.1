import { codes, flakRadius } from "../../constants.js";
import { Vector } from "../math/vector.js";
export function objsAreAlly(obj1, obj2) {
    if (
        (obj1.whose.id === obj2.whose.id || obj1.whose.alliance === obj2.whose.alliance) &&
        (obj2.whose.alliance.length || obj1.whose.id === obj2.whose.id)
    ) return true;
    return false
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
            return [base.flaks[base.flaks.length - 1], base.id];
        }
        return false;
    };
    Flak.prototype.trackFlaks = (obj, arr) => {
        let flak;
        for (const e of arr.values()) {
            if (flak = this.trackFlak(obj, e)) {
                return flak;
            }
        }
        return false;
    };
    Flak.prototype.track = function (obj, arr) {
        //this should be in the base class:::done
        for (const e of arr.values()) {
            if (circle_collider(this.pos, e.pos, this.range) && !Object.is(obj, e) && !objsAreAlly(obj, e)) {
                return e;
            }
        }
        return false;
    };
    Flak.prototype.removeAsHealth0 = function name(arr, base) {
        if (this.health < 1) {
            this.remove(arr);
            server.emit(codes.actioncodes.destruction.toString(), [this.name, base.id]);
        }
    };
    Flak.prototype.remove = function (arr) {
        arr.remove(this);
    };
    Flak.prototype.rotate = function (obj, thisid) {
        this.Undeg = Vector.getDegBtwnVectors(obj.pos.copy().subtract(this.pos), Vector.DegToUN(this.deg));
        if (this.Undeg < 2) {
            return true;
        }
        this.deg++;
        server.emit('flak-rotate', [this.name, this.id, this.deg, thisid]);
        return false;
    };
    Flak.prototype.fireOn = function (obj, thisid) {
        if (this.reload <= 0) {
            server.emit('fire', [this.name, this.id, obj.id, thisid]);
            obj.health -= this.damage;
            this.reload = 10000;
        }
    };
}
