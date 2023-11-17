export class Vector {
    constructor(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.mag = function () {
            return Math.sqrt(Math.pow(this.y, 2) + Math.pow(this.x, 2) + Math.pow(this.z, 2));
        };
        Vector.prototype.copy = function () {
            return new Vector(this.x, this.y, this.z)
        }
        Vector.prototype.add = function (v) {
            this.x = this.x + v.x;
            this.y = this.y + v.y;
            this.z = this.z + v.z;
            return this
        };
        Vector.prototype.subtract = function (v) {
            this.x = this.x - v.x;
            this.y = this.y - v.y;
            this.z = this.z - v.z;
            return this
        };
        Vector.prototype.dot = function (v) {
            return this.x * v.x + this.y * v.y + this.z * v.z;
        };
        Vector.prototype.mult = function (n) {
            return new Vector(this.x * n, this.y * n, this.z * n);
        };
        Vector.div = function (n) {
            if (n == 0) {
                return new Vector();
            }
            return new Vector(this.x / n, this.y / n, this.z / z)
        }
        Vector.prototype.normalize = function () {
            return new Vector(this.x / this.mag(), this.y / this.mag(), this.z / this.mag());
        };
        Vector.prototype.tangent2d = function () {
            let v = this.normalize();
            return new Vector(-v.y, v.x);
        };
        Vector.prototype.draw = function (ct, startX = 0, startY = 0, color = 'red') {
            ct.save();
            ct.beginPath();
            ct.moveTo(startX, startY);
            ct.strokeStyle = color;
            ct.lineTo(startX + this.x, startY + this.y);
            ct.stroke();
            ct.closePath();
            ct.restore();
            return this
        };
        Vector.prototype.rotate = function (rad) {
            this.x = this.x * Math.cos(rad) - this.y * Math.sin(rad);
            this.y = this.x * Math.sin(rad) + this.y * Math.cos(rad);
        };
        Vector.prototype.toArr = () => {
            return [
                this.x,
                this.y,
            ];
        };
        Vector.prototype.toObj = () => {
            return {
                x: this.x,
                y: this.y,
                z: this.z
            }
        }
        Vector.prototype.reflectX = () => {
            this.x = -this.x;
        }
        Vector.prototype.reverse = () => {
            this.x = -this.x;
            this.y = -this.y;
            this.z = -this.z;
        }
    }
    get x_axis() {
        return new Vector(1)
    }
    static getDegBtwnVectors(v1, v2) {
        return Math.acos(v1.dot(v2) / (v1.mag() * v2.mag())) * 180 / Math.PI
    }
    static getAbsDegBtwnVectors(v1, v2, t) {
        //goes anticlockwise
        let absDeg = Vector.getDegBtwnVectors(v1, v1.x_axis);
        absDeg = v1.y > 0 ? absDeg : 360 - absDeg;
        v1.rotate(absDeg * Math.PI / 180);
        v2.rotate(absDeg * Math.PI / 180);
        return v2.y > 0 ? Vector.getDegBtwnVectors(v1, v2) : 360 - Vector.getDegBtwnVectors(v1, v2)
    }
    static DegToUN(deg) {
        return new Vector(Math.cos(deg * Math.PI / 180), Math.sin(deg * Math.PI / 180))
    }
}