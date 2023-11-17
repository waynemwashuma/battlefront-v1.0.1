import { DBpool } from "../constants.js";

export function updatePlayerBaseNoInSql(conn,name, number) {
    DBpool.query('UPDATE players SET bases = ? WHERE  name=? ', [number, name], (err) => {
        if (err) console.log(err);
    })
}
export function updatePlayerAllianceInSql(name, alliance) {
    DBpool.query('UPDATE players SET alliance = ? WHERE  name=? ', [alliance, name], (err) => {
        if (err) console.log(err);
    })
}