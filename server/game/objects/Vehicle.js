import { codes } from "../../constants.js";
import { Vector } from "../math/vector.js";
import {circle_collider} from '../functions.js'
import { gameLib } from "../main.js";


export class Vehicle {
    constructor(x, y, id, whose, deg) {
        this.pos = new Vector(x, y);
        this.deg = deg || 0;
        this.Undeg;
        this.w = 100;
        this.h = 50;
        this.whose = whose;
        this.reload = 1000;
        this.health = 100;
        this.moveTo = [];
        this.id = id;
        this.vel = new Vector(1, 1);
        Vehicle.prototype.move = function () {
            if (this.moveTo.length) {
                if (this.rotate()) {
                    if (circle_collider(this.pos, this.moveTo[0], 5)) {
                        this.moveTo.shift();
                    }
                    this.pos.add(this.vel);
                    this.gameLib.triggerListener("move",[this.id, this.pos])
                }
            }
        };
        Vehicle.prototype.removeAsHealth0 = function name() {
            if (this.health < 1) {
                this.remove();
            }
        };
        Vehicle.prototype.remove = function (arr) {
            throw "Implement 'remove()' in derived class of Vehicle " + this.constructor.name
        };
        Vehicle.prototype.rotate = function () {
            this.Undeg = Vector.getDegBtwnVectors(this.moveTo[0].copy().subtract(this.pos), Vector.DegToUN(this.deg));
            if (this.Undeg < 2) {
                this.vel = Vector.DegToUN(this.deg).mult(5);

                return true;
            }
            --this.deg;
            this.gameLib.triggerListener('rotate', [this.id, this.deg]);
            return false;
        };
    }
}
