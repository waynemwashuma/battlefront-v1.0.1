import { Vehicle } from "./Vehicle.js";

//apc class
export class APC extends Vehicle {
    constructor(x, y, id, whose, deg) {
        super(x, y, id, whose, deg);
        this.name = 'APC';
        APC.prototype.capture = function (obj, arr) {
            obj.whose = this.whose;
            this.remove(arr);
            server.emit('base-rename', [obj.id, this.whose]);
        };
    }
}
