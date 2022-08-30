let keys;
var initialProductionCost = {
    tank: {
        steel: 45000,
        aluminium: 30000
    },
    APC: {
        steel: 65000,
        aluminium: 100000
    },
    flak: {
        concrete: 45000,
        steel: 20000
    }
};
function ResHandler(initres) {
    this.res = {
        max: {
            steel: 4500000,
            aluminium: 3000000,
            concrete: 4000000,
        },
        actual: {
            concrete: 4000000,
            steel: 4500000,
            aluminium: 3000000,
            military: 0,
            bases: 1
        },
        production: {
            steel: 450,
            aluminium: 300,
            concrete: 400,
        }
    }
    keys = Object.keys(this.res.actual);
    this.diff;
    this.calc;
    this.lastUpdate = Date.now();
    ResHandler.prototype.update = (currentTimeStamp, callback = () => { }) => {
        this.diff = (currentTimeStamp - this.lastUpdate) / 1000;
        for (let i = 0; i < 3; i++) {
            this.calc = Math.round(this.diff * this.res.production[keys[i]] + this.res.actual[keys[i]]);
            this.res.actual[keys[i]] = this.calc > this.res.max[keys[i]] ? this.res.max[keys[i]] : this.calc;
        }
        this.lastUpdate = currentTimeStamp;
        callback(this.res.actual);
    }
}
function deductFromRes(client, objString) {
    let c = Object.keys(initialProductionCost[objString]);
    for (let i = 0; i < c.length; i++) {
        client.resHandler.res.actual[c[i]] -= initialProductionCost[objString][c[i]];
    }
}
module.exports = {
    ResHandler,
    initialProductionCost,
    deductFromRes
}
