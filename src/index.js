import Highlighter from "web-highlighter";

let highlights = [];

const highlighter = new Highlighter();
highlighter
    .on(Highlighter.event.CREATE, ({sources}) => {
        console.log("@sources", sources);
        highlights.push(...sources);
        localStorage["highlights"] = JSON.stringify(highlights);
    })
    .on(Highlighter.event.HOVER, ({id}) => {
        // display different bg color when hover
        highlighter.addClass('highlight-wrap-hover', id);
    })
    .on(Highlighter.event.HOVER_OUT, ({id}) => {
        // remove the hover effect when leaving
        highlighter.removeClass('highlight-wrap-hover', id);
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

