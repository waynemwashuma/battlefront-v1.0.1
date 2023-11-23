import { VehicleType, gameLib } from "../main.js";
import { Turrent } from "./Turrent.js";
import { Vehicle } from "./Vehicle.js";

//tank class
export class Tank extends Vehicle {
    constructor(x, y, id, whose, deg) {
        super(x, y, id, whose, deg);
        this.health = 100;
        this.name = 'tank';
        this.turrent = new Turrent(this.pos.x, this.pos.y, this);
    }
    drawAll = function (ct, originX, originY) {
        this.draw(ct, originX, originY);
        this.turrent.draw(ct, originX, originY);
    }
    updateTurrent() {
        let id;
        this.turrent.pos = this.pos;
        this.target = this.turrent.track(this, this.gameLib.tanks);
        this.target = this.target ? this.target : this.turrent.track(this, this.gameLib.APCs);
        this.target = this.target ? this.target : this.turrent.trackFlaks(this, this.gameLib.bases);
        if (this.target instanceof Array) {
            id = this.target[1];
            this.target = this.target[0];
        }
        if (this.target) {
            if (this.turrent.rotate(this.target)) {
                if (this.turrent.reload <= 0) {
                    this.turrent.fireOn(this.target, id);
                }
            }
        }
    }
    toJson(){
        let b = this
        return [b.pos.x, b.pos.y, b.id, b.whose, b.deg]
    }
    init(gameLib){
        this.turrent.gameLib = gameLib
    }
    remove() {
        this.gameLib.remove(this,VehicleType.TANK)
    };
}
