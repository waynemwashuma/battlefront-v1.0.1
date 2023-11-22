import { VehicleType } from "../main.js";
import { Vehicle } from "./Vehicle.js";

//apc class
export class APC extends Vehicle {
    constructor(x, y, id, whose, deg) {
        super(x, y, id, whose, deg);
        this.name = 'APC';
    }
    capture(obj) {
        obj.whose = this.whose;
        this.gameLib.triggerListener('capture', [obj.id, this.whose]);
        this.gameLib.remove(this);
    };
    remove(arr) {
        this.gameLib.remove(this,VehicleType.APC)
    }
    toJson(){
        return [this.pos.x, this.pos.y, this.id, this.whose, this.deg]
    }
    static fromJson(obj){
        return new APC(...obj)
    }
}
