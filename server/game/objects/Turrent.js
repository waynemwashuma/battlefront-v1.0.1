import { Flak } from "./Flak.js";

export class Turrent extends Flak {
    constructor(x, y, id) {
        super(x, y, 90, id);
        this.name = 'turrent';
        this.range = 500;
        this.reload = 2000;
    }
}