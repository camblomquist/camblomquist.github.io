const minDesktopWidth = 800;

function updateSidenotes() {
    if (document.documentElement.clientWidth < minDesktopWidth) return;
    const defs = document.getElementsByClassName("footnote-definition");
    const refs = document.getElementsByClassName("footnote-reference");
    const marginTop = parseFloat(getComputedStyle(defs[0]).getPropertyValue("margin-top"));
    const marginBot = parseFloat(getComputedStyle(defs[0]).getPropertyValue("margin-bottom"));
    let prevDefBot = 0;
    for (let def of defs) {
        const ref = Array.prototype.find.call(refs, ref => ref.children[0].hash.substr(1) == def.id);
        if (ref === undefined) continue;
        def.style.top = "0";
        const defTop = def.getBoundingClientRect().top + scrollY;
        const refTop = ref.getBoundingClientRect().top + scrollY;
        const top = (refTop > prevDefBot ? (refTop + marginTop) : (prevDefBot + marginBot)) - defTop;
        def.style.top = Math.trunc(top) + "px";
        prevDefBot = def.getBoundingClientRect().bottom + scrollY;
    }
}

addEventListener("load", e => {
    document.fonts.addEventListener("loadingdone", e => { updateSidenotes(); });
    updateSidenotes();
});
addEventListener("resize", e => { updateSidenotes(); });