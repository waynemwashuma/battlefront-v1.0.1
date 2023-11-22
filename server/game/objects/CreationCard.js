import { codes } from "../../constants.js";


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
        this.base.isSpawning = false;
        this.base.spawn(this.code);
        arr.remove(this);
    };
}
