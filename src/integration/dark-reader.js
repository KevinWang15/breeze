function addOrRemoveDarkReaderClass(annotatePopoverDom) {
    // support for the dark reader chrome extension
    const classNameToAdd = "dark-reader-enabled";
    let clsName = annotatePopoverDom.className;
    clsName = clsName.split(classNameToAdd).join("");

    const darkReaderEnabled = !!document.getElementById("dark-reader-style");
    if (darkReaderEnabled) {
        clsName += " " + classNameToAdd
    }
    clsName = clsName.replace(/\s+/g, " ");
    annotatePopoverDom.className = clsName;
}

module.exports = {addOrRemoveDarkReaderClass};