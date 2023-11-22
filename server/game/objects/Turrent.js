import { Flak } from "./Flak.js";

export class Turrent extends Flak {
    constructor(x, y,parent) {
        super(x, y, 90, parent);
        this.name = 'turrent';
        this.range = 500;
        this.reload = 2000;
    }
}