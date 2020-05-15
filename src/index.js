import Highlighter from "web-highlighter";

let highlights = [];

const highlighter = new Highlighter();
highlighter.on(Highlighter.event.CREATE, ({sources}) => {
    console.log("@sources", sources);
    highlights.push(...sources);
    localStorage["highlights"] = JSON.stringify(highlights);
});

document.onkeydown = e => {
    if (e.key === "Enter") {
        highlighter.highlightSelection();
    }
}

setTimeout(() => {
    JSON.parse(localStorage["highlights"]).forEach((item) => {
        const {startMeta, endMeta, text, id} = item;
        console.log(startMeta, endMeta, text, id);
        highlighter.fromStore(startMeta, endMeta, text, id);
    });
}, 1000)

