import { captures } from "../main.js";

export function CaptureCard(base, apc) {
    this.apc = apc;
    this.base = base;
    CaptureCard.prototype.capture = function () {
        if (base.actualSpawnPoint.copy().subtract(apc.pos.copy()).mag() < 10) {
            apc.capture(this.base);
            captures.remove(this);
        }
    };
}
