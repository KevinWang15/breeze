import Highlighter from "web-highlighter";
import rangy from "rangy";
import "rangy/lib/rangy-classapplier";
import "rangy/lib/rangy-highlighter";
import "rangy/lib/rangy-serializer";
import * as api from "./api";
import "./styles.less"
import "toastr/toastr.less"
import trashSvg from "./icons/trash.svg";
import uuidv4 from "uuid/v4";
import HighlightSerializer from "./model/serializer"
import commentsSvg from "./icons/comments.svg";
import {darkenColor, highlighterColors} from "./utils/colors";
import {addOrRemoveDarkReaderClass} from "./integration/dark-reader";
import 'babel-polyfill';
import "simpread_project_workflow"

let rangyHighlighter = null;

setTimeout(() => {
    //TODO
    window.BREEZE_rangy = rangy;
    rangy.init();
    rangyHighlighter = rangy.createHighlighter();
    rangyHighlighter.addClassApplier(rangy.createClassApplier("breeze-rangy-highlight", {
        ignoreWhiteSpace: true,
        tagNames: ["span", "a"]
    }));

    rangyHighlighter.on('add', a => {
        api.saveAnnotation(HighlightSerializer.serializeItem(a));
    })

    window.RangyHighlighter = rangyHighlighter;

    window.breezeRefresh = () => api.getAnnotationsByUrl(window.location.href).then(data => {
        rangyHighlighter.deserialize(HighlightSerializer.deserialize(data))
    });

    setTimeout(window.breezeRefresh, 1000);

}, 500);


let hoverId = "";
document.addEventListener("mouseover", e => {
    let newHoverId = e.target.getAttribute("data-highlight-id");
    if (hoverId === newHoverId) {
        return;
    }

    const oldHoverId = hoverId;

    hoverId = newHoverId;
    if (newHoverId) {
        enableHoverStyle(newHoverId, true);
    }
    if (oldHoverId) {
        enableHoverStyle(oldHoverId, false);
    }
});

document.addEventListener("mouseup", e => {
    let id = e.target.getAttribute("data-highlight-id");
    if (!id) {
        return;
    }
    window.breezeDeletePopover = {forId: id};
    showEditAnnotationPopover(e);
});

function resolveHighlightSpans(highlightId) {
    return Array.from(document.getElementsByClassName("breeze-highlight")).filter(element => element.getAttribute("data-highlight-id") === highlightId)
}

function enableHoverStyle(highlightId, enable) {
    for (let element of resolveHighlightSpans(highlightId)) {
        let targetColor = element.getAttribute("data-highlight-color");
        if (enable) {
            targetColor = darkenColor(targetColor);
        }
        element.style.backgroundColor = targetColor;
    }
}


let annotatePopoverDom = null;
let editAnnotationPopoverDom = null;

function prepareAnnotatePopoverDom() {
    document.body.insertAdjacentHTML('beforeend',
        `<span id="breeze-annotate-popover">${highlighterColors.map(color => `<span class="color" style="background-color: ${color}"></span>`).join('')}</span>`
    );
    annotatePopoverDom = document.getElementById("breeze-annotate-popover");
    annotatePopoverDom.childNodes.forEach(node => {
        node.onpointerdown = () => {
            rangyHighlighter.highlightSelection("breeze-rangy-highlight", {
                extra: {
                    id: uuidv4(),
                    color: rgb2hex(node.style.backgroundColor),
                }
            });
        }
    })
}

function prepareEditAnnotationPopoverDom() {
    document.body.insertAdjacentHTML('beforeend', `<span id="breeze-edit-annotation-popover" class="breeze-button"><span id="breeze-button-trash">${trashSvg}</span><span id="breeze-button-comment">${commentsSvg}</span><span id="breeze-annotation-comments"></span></span>`);
    editAnnotationPopoverDom = document.getElementById("breeze-edit-annotation-popover");

    document.getElementById("breeze-button-trash").onpointerdown = () => {
        for (let highlight of rangyHighlighter.highlights) {
            if (highlight.extra.id === window.breezeDeletePopover.forId) {
                rangyHighlighter.removeHighlights([highlight]);
            }
        }
        // const source = highlighter.getSourceById(window.breezeDeletePopover.forId);
        // if (source && source.extra && source.extra.comments) {
        //     if (!confirm("Are you sure? The comments will also be deleted")) {
        //         return;
        //     }
        // }
        // highlighter.remove(window.breezeDeletePopover.forId);
        api.deleteAnnotation({url: window.location.href, id: window.breezeDeletePopover.forId})
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
        api.saveAnnotation({url: window.location.href, id: source.id, data: source});
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
    if (source && source.extra && source.extra.comments) {
        commentsDom.innerText = source.extra.comments;
        commentsDom.style.display = "block";
    } else {
        commentsDom.innerText = "";
        commentsDom.style.display = "none";
    }
}

function rgb2hex(rgb) {
    if (rgb.search("rgb") === -1) {
        return rgb;
    } else {
        rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);

        function hex(x) {
            return ("0" + parseInt(x).toString(16)).slice(-2);
        }

        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
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

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request && request.action === "EnterReadMode") {
            window.EnterReadMode();
            sendResponse({ok: true});
        }
    });