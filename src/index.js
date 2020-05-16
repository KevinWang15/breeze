import Highlighter from "web-highlighter";
import * as api from "./api";
import "./styles.less"

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
    document.body.insertAdjacentHTML('beforeend', `<span id="breeze-annotate-popover">HL</span>`);
    annotatePopoverDom = document.getElementById("breeze-annotate-popover");
    annotatePopoverDom.onpointerdown = () => {
        highlighter.highlightSelection();
    }
}

function prepareClearAnnotationPopoverDom() {
    document.body.insertAdjacentHTML('beforeend', `<span id="breeze-clear-annotation-popover">Del</span>`);
    clearAnnotationPopoverDom = document.getElementById("breeze-clear-annotation-popover");
    clearAnnotationPopoverDom.onpointerdown = () => {
        highlighter.remove(window.breezeDeletePopover.forId);
        api.deleteAnnotation({url, uid: window.breezeDeletePopover.forId})
        hideClearAnnotationPopover();
    }
}

function showAnnotatePopover(e) {
    const {offsetX, offsetY} = window.pointerPos;
    annotatePopoverDom.style.display = "initial";
    let y = offsetY - 40;
    if (y < 0) {
        y = 0;
    }
    annotatePopoverDom.style.top = y + "px";
    const x = offsetX + 20;
    annotatePopoverDom.style.left = x + "px";
}

function hideAnnotatePopover(e) {
    annotatePopoverDom.style.display = "none";
}

function showClearAnnotationPopover() {
    const {offsetX, offsetY} = window.pointerPos;
    clearAnnotationPopoverDom.style.display = "initial";
    let y = offsetY - 40;
    if (y < 0) {
        y = 0;
    }
    clearAnnotationPopoverDom.style.top = y + "px";
    const x = offsetX + 20;
    clearAnnotationPopoverDom.style.left = x + "px";
}

function hideClearAnnotationPopover(e) {
    clearAnnotationPopoverDom.style.display = "none";
}

window.addEventListener("pointermove", (e) => {
    const {offsetX, offsetY} = e;
    window.pointerPos = {offsetX, offsetY};
});

window.addEventListener("load", () => {
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