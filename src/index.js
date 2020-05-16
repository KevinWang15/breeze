import Highlighter from "web-highlighter";
import * as api from "./api";

const url = window.location.href;

const highlighter = new Highlighter();


function registerEvents() {
    highlighter
        .on(Highlighter.event.CREATE, ({sources}) => {
            sources.forEach(source => {
                console.log(source);
                api.saveAnnotation({url, uid: source.id, data: source});
            })
        })
        .on(Highlighter.event.HOVER, ({id}) => {
            // display different bg color when hover
            highlighter.addClass('highlight-wrap-hover', id);
        })
        .on(Highlighter.event.HOVER_OUT, ({id}) => {
            // remove the hover effect when leaving
            highlighter.removeClass('highlight-wrap-hover', id);
        });
}


document.onkeydown = e => {
    if (e.key === "Enter") {
        highlighter.highlightSelection();
    }
}

function loadAllAnnotationsData() {
    return api.getAnnotationsByUrl(url).then((list) => {
        return Promise.all(list.map(item => {
            const {startMeta, endMeta, text, id} = item;
            if (!text) {
                return Promise.resolve();
            }
            highlighter.fromStore(startMeta, endMeta, text, id);
            return Promise.resolve();
        }))
    });
}

loadAllAnnotationsData().then(() => registerEvents())
