import Highlighter from "web-highlighter";
import * as api from "./api";
import "./styles.less"
import "toastr/toastr.less"
import trashSvg from "./icons/trash.svg";
import commentsSvg from "./icons/comments.svg";
import {darkenColor, highlighterColors} from "./utils/colors";
import {addOrRemoveDarkReaderClass} from "./integration/dark-reader";
import 'babel-polyfill';
import "simpread_project_workflow"
const url = window.location.href;
const highlighter = new Highlighter();

function enableHoverStyle(target, enable) {
    if (!enable) {
        target.style.backgroundColor = target.attributes["data-highlight-color"].value;
    } else {
        target.style.backgroundColor = darkenColor(target.attributes["data-highlight-color"].value);
    }
}

function registerEvents() {
    highlighter
        .on(Highlighter.event.CREATE, ({sources}, _, event) => {
            sources.forEach(source => {
                api.saveAnnotation({url, uid: source.id, data: source});
            })
        })
        .on(Highlighter.event.HOVER, ({id}, _, event) => {
            enableHoverStyle(event.target, true);
        })
        .on(Highlighter.event.HOVER_OUT, ({id}, _, event) => {
            enableHoverStyle(event.fromElement, false);
        })
        .on(Highlighter.event.CLICK, (e) => {
            window.breezeDeletePopover = {forId: e.id};
            showEditAnnotationPopover(e);
        });
}


function loadAllAnnotationsData() {
    return api.getAnnotationsByUrl(url).then((list) => {
        return Promise.all(list.map(item => {
            const {startMeta, endMeta, text, id, extra} = item;
            if (!text) {
                return Promise.resolve();
            }
            highlighter.fromStore(startMeta, endMeta, text, id, extra);
            return Promise.resolve();
        }))
    });
}

loadAllAnnotationsData().then(() => registerEvents())

let annotatePopoverDom = null;
let editAnnotationPopoverDom = null;

function prepareAnnotatePopoverDom() {
    document.body.insertAdjacentHTML('beforeend',
        `<span id="breeze-annotate-popover">${highlighterColors.map(color => `<span class="color" style="background-color: ${color}"></span>`).join('')}</span>`
    );
    annotatePopoverDom = document.getElementById("breeze-annotate-popover");
    annotatePopoverDom.childNodes.forEach(node => {
        node.onpointerdown = () => {
            highlighter.highlightSelection(node.style.backgroundColor);
        }
    })
}

function prepareEditAnnotationPopoverDom() {
    document.body.insertAdjacentHTML('beforeend', `<span id="breeze-edit-annotation-popover" class="breeze-button"><span id="breeze-button-trash">${trashSvg}</span><span id="breeze-button-comment">${commentsSvg}</span><span id="breeze-annotation-comments"></span></span>`);
    editAnnotationPopoverDom = document.getElementById("breeze-edit-annotation-popover");

    document.getElementById("breeze-button-trash").onpointerdown = () => {
        const source = highlighter.getSourceById(window.breezeDeletePopover.forId);
        if (source.extra.comments) {
            if (!confirm("Are you sure? The comments will also be deleted")) {
                return;
            }
        }
        highlighter.remove(window.breezeDeletePopover.forId);
        api.deleteAnnotation({url, uid: window.breezeDeletePopover.forId})
        hideEditAnnotationPopover();
    }

    document.getElementById("breeze-button-comment").onpointerdown = () => {
        const source = highlighter.getSourceById(window.breezeDeletePopover.forId);
        if (!source.extra) {
            source.extra = {};
        }
        const comments = source.extra.comments || "";
        const value = prompt("write comments", comments);
        if (value === null) {
            return;
        }
        source.extra.comments = value;
        api.saveAnnotation({url, uid: source.id, data: source});
        hideEditAnnotationPopover();
    }
}

function getPopoverPos() {
    let {x, y} = window.pointerPos;
    y -= 48;
    x -= 10;
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
    addOrRemoveDarkReaderClass(annotatePopoverDom);
}

function hideAnnotatePopover() {
    annotatePopoverDom.style.display = "none";
}

function showEditAnnotationPopover() {
    const {x, y} = getPopoverPos();
    editAnnotationPopoverDom.style.display = "initial";
    editAnnotationPopoverDom.style.top = y + "px";
    editAnnotationPopoverDom.style.left = x + "px";
    addOrRemoveDarkReaderClass(editAnnotationPopoverDom);

    const source = highlighter.getSourceById(window.breezeDeletePopover.forId);
    const commentsDom = document.getElementById("breeze-annotation-comments");
    if (source.extra.comments) {
        commentsDom.innerText = source.extra.comments;
        commentsDom.style.display = "block";
    } else {
        commentsDom.innerText = "";
        commentsDom.style.display = "none";
    }
}

function hideEditAnnotationPopover() {
    editAnnotationPopoverDom.style.display = "none";
}

window.addEventListener("pointermove", (e) => {
    const {pageX, pageY} = e;
    window.pointerPos = {x: pageX, y: pageY};
});

setTimeout(() => {
    prepareAnnotatePopoverDom();
    prepareEditAnnotationPopoverDom();
});

window.addEventListener("pointerup", (e) => {
    const selection = document.getSelection();
    if (selection.isCollapsed) {
        hideAnnotatePopover(e);
    } else {
        showAnnotatePopover(e);
    }
    hideEditAnnotationPopover();
});