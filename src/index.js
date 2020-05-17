import Highlighter from "web-highlighter";
import * as api from "./api";
import "./styles.less"
import "toastr/toastr.less"
import trashSvg from "./icons/trash.svg";
import highlighterSvg from "./icons/highlighter.svg";


const ClassName_hover = 'breeze-annotation-hover';

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
            highlighter.addClass(ClassName_hover, id);
        })
        .on(Highlighter.event.HOVER_OUT, ({id}) => {
            highlighter.removeClass(ClassName_hover, id);
        })
        .on(Highlighter.event.CLICK, (e) => {
            window.breezeDeletePopover = {forId: e.id};
            showClearAnnotationPopover(e);
        });
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

let annotatePopoverDom = null;
let clearAnnotationPopoverDom = null;

function prepareAnnotatePopoverDom() {
    document.body.insertAdjacentHTML('beforeend', `<span id="breeze-annotate-popover" class="breeze-button">${highlighterSvg}</span>`);
    annotatePopoverDom = document.getElementById("breeze-annotate-popover");
    annotatePopoverDom.onpointerdown = () => {
        highlighter.highlightSelection();
    }
}

function prepareClearAnnotationPopoverDom() {
    document.body.insertAdjacentHTML('beforeend', `<span id="breeze-clear-annotation-popover" class="breeze-button">${trashSvg}</span>`);
    clearAnnotationPopoverDom = document.getElementById("breeze-clear-annotation-popover");
    clearAnnotationPopoverDom.onpointerdown = () => {
        highlighter.remove(window.breezeDeletePopover.forId);
        api.deleteAnnotation({url, uid: window.breezeDeletePopover.forId})
        hideClearAnnotationPopover();
    }
}

function getPopoverPos() {
    let {x, y} = window.pointerPos;
    y -= 48;
    x += 12;
    if (y < 0) {
        y = 0;
    }
    return {x, y};
}

function showAnnotatePopover() {
    const {x, y} = getPopoverPos();
    annotatePopoverDom.style.display = "initial";
    annotatePopoverDom.style.top = y + "px";
    annotatePopoverDom.style.left = x + "px";
}

function hideAnnotatePopover() {
    annotatePopoverDom.style.display = "none";
}

function showClearAnnotationPopover() {
    const {x, y} = getPopoverPos();
    clearAnnotationPopoverDom.style.display = "initial";
    clearAnnotationPopoverDom.style.top = y + "px";
    clearAnnotationPopoverDom.style.left = x + "px";
}

function hideClearAnnotationPopover(e) {
    clearAnnotationPopoverDom.style.display = "none";
}

window.addEventListener("pointermove", (e) => {
    const {pageX, pageY} = e;
    window.pointerPos = {x: pageX, y: pageY};
});

setTimeout(() => {
    prepareAnnotatePopoverDom();
    prepareClearAnnotationPopoverDom();
});

window.addEventListener("pointerup", (e) => {
    const selection = document.getSelection();
    if (selection.isCollapsed) {
        hideAnnotatePopover(e);
    } else {
        showAnnotatePopover(e);
    }
    hideClearAnnotationPopover();
});