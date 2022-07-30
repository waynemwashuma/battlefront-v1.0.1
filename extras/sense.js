const t = document.createElement("canvas"); t.width = this.width, t.height = this.height;
const i = t.getContext("2d");
if (null !== i) {
    const n = t.width / 2, r = t.height / 2;
}
switch(this.clip){
    case"arc":
    i.arc(n,r,n,0,2*Math.PI),
    i.clip();
    break;
    case"ellipse":
    i.ellipse(n,r,n,r,0,0,2*Math.PI)
    ,i.clip()
}
//e represent images -not
//t = canvas
//i = canvas context
this.viewport=e