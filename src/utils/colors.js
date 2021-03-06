const hexToRgb = hex =>
    hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
        , (m, r, g, b) => '#' + r + r + g + g + b + b)
        .substring(1).match(/.{2}/g)
        .map(x => parseInt(x, 16))

const rgbToHex = (r, g, b) => '#' + [r, g, b]
    .map(x => x.toString(16).padStart(2, '0')).join('')

function darkenColor(color) {
    const rgb = hexToRgb(color);
    for (let rgbKey in rgb) {
        if (!rgb.hasOwnProperty(rgbKey)) continue;
        rgb[rgbKey] *= 0.8;
    }
    return rgbToHex(...rgb);
}

const highlighterColors = ["#C1EEF7", "#C1F7C1", "#feaec5", "#fee186", "#fffb8e", "#fffb8e", "#fac6fe"];

export {darkenColor, highlighterColors}