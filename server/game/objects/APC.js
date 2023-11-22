import { VehicleType } from "../main.js";
import { Vehicle } from "./Vehicle.js";

//apc class
export class APC extends Vehicle {
    constructor(x, y, id, whose, deg) {
        super(x, y, id, whose, deg);
        this.name = 'APC';
    }
    capture(obj, arr) {
        obj.whose = this.whose;
        this.remove(arr);
        this.gamelib.triggerListener('base-rename', [obj.id, this.whose]);
    };
    remove(arr) {
        this.gameLib.remove(this,VehicleType.APC)
    }
}
