export function commonValues(arr1, arr2) {
    let filteredArray = [];
    for (let i = 0; i < arr1.length; i++) {
        for (let j = 0; j < arr2.length; j++) {
        if (arr1[i].x == arr2[j].x && arr1[i].y == arr2[j].y) {
            filteredArray.push(arr1[i]);
            }
        }
    }
    return filteredArray;
}
export const linesIntersect = (function () {
    let v1, v2, v3, cross, u1, u2;
    v1 = { x: null, y: null };
    v2 = { x: null, y: null };
    v3 = { x: null, y: null };

    function lineSegmentsIntercept(p0, p1, p2, p3) {
        v1.x = p1.x - p0.x; // line p0, p1 as vector
        v1.y = p1.y - p0.y;
        v2.x = p3.x - p2.x; // line p2, p3 as vector
        v2.y = p3.y - p2.y;
        if ((cross = v1.x * v2.y - v1.y * v2.x) === 0) { // cross prod 0 if lines parallel
            return false; // no intercept
        }
        v3 = { x: p0.x - p2.x, y: p0.y - p2.y }; // the line from p0 to p2 as vector
        u2 = (v1.x * v3.y - v1.y * v3.x) / cross; // get unit distance along line p2 p3 

        // code point B
        if (u2 >= 0 && u2 <= 1) { // is intercept on line p2, p3
            u1 = (v2.x * v3.y - v2.y * v3.x) / cross; // get unit distance on line p0, p1;

            // code point A
            return (u1 >= 0 && u1 <= 1); // return true if on line else false.

            // code point A end
        }
        return false; // no intercept;

        // code point B end
    }
    return lineSegmentsIntercept;
})();
export function sortPos(arr, pos) {
    let m = [];
    for (let i = 0; i < arr.length; i++) {
        m.push(arr[i].copy());
    }
    m.sort((a, b) => {
        if (a.copy().subtract(pos).mag() > b.copy().subtract(pos).mag()) return 1;
        if (a.copy().subtract(pos).mag() < b.copy().subtract(pos).mag()) return -1;
        if (a.copy().subtract(pos).mag() === b.copy().subtract(pos).mag()) return 0;
    });
    return m;
}
export function lineToRect(v1, v2, obs) {
    if (linesIntersect(v1, v2, obs.vertice[0], obs.vertice[1]) ||
        linesIntersect(v1, v2, obs.vertice[1], obs.vertice[2]) ||
        linesIntersect(v1, v2, obs.vertice[2], obs.vertice[3]) ||
        linesIntersect(v1, v2, obs.vertice[3], obs.vertice[0])) {
        return true;
    }
    return false;
}
export function avoidCollision(pos, destination, obs) {
    if (!lineToRect(pos, destination, obs)) return [];
    let sorted = sortPos(obs.movePoints, pos);
    sorted.unshift();
    let sorted2 = sortPos(sorted, destination);
    sorted2.pop();
    sorted2.pop();
    sorted.pop();
    if (lineToRect(sorted[0], destination, obs)) {
        let t = commonValues(sorted, sorted2);
        return [sorted[0], t[0]];
    }
    return [sorted[0]];
}
export function avoidAllCollision(destination, obj, arr) {
    let s = [], t = [];
    arr.forEach(e => {
        if (!lineToRect(obj.pos, destination, e)) return;
        t.push(e);
    });
    t.sort((a, b) => {
        if (a.center.copy().subtract(obj.pos).mag() > b.center.copy().subtract(obj.pos).mag()) return -1;
        if (a.center.copy().subtract(obj.pos).mag() < b.center.copy().subtract(obj.pos).mag()) return 1;
        return 0;
    });
    t.forEach(e => {
        s.push(...avoidCollision(obj.pos, destination, e).reverse());
    });
    s.unshift(destination);
    return s.reverse();
}
//circle colider system
let dirtyvect;
export function circle_collider(v1, v2, l) {
    dirtyvect = v2.copy().subtract(v1).mag();
    if (dirtyvect <= l) {
        return true;
    }
    return false;
}
