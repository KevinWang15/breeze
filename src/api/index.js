import axios from "axios";
import toastr from "toastr";
import 'babel-polyfill';

function getStorage(key) {
    return new Promise((resolve, reject) => {
        if (chrome && chrome.storage) {
            chrome.storage.sync.get([key], function (result) {
                resolve(result[key])
            });
        } else {
            resolve(localStorage[key]);
        }
    });
}

function setStorage(key, value) {
    return new Promise((resolve, reject) => {
        if (chrome && chrome.storage) {
            chrome.storage.sync.set({[key]: value}, function () {
                resolve();
            });
        } else {
            localStorage[key] = value;
            resolve();
        }
    });
}

async function getUser() {
    const storageKey = "breezeUser";

    const currentValue = await getStorage(storageKey);
    if (currentValue) {
        return currentValue;
    }
    throw "please set user and server first, or else this extension will not function properly";
}

let user;
getUser().then(value => user = value);

const getHeaders = () => getUser().then(user => ({
    Authentication: JSON.stringify({"type": "noauth", user})
}));

function getUrl(path) {
    return `http://127.0.0.1:3980/${path}`;
}

function onRequestError(err) {
    setTimeout(() => {
        toastr.error("breeze: " + err.toString());
    })
    throw err;
}

function wrapRequestApi(callback) {
    return getHeaders().then(headers => callback({headers})).catch(onRequestError)
}

const saveAnnotation = ({url, uid, data}) => {
    return wrapRequestApi(({headers}) => axios.post(getUrl("saveAnnotation"), {
        url, uid, data
    }, {headers: headers}));
};

const deleteAnnotation = ({url, uid}) => {
    return wrapRequestApi(({headers}) => axios.post(getUrl("deleteAnnotation"), {
        url, uid,
    }, {headers: headers}));
};

const getAnnotationsByUrl = (url) => {
    return wrapRequestApi(({headers}) => axios.post(getUrl("getAnnotationsByUrl"), {
        url,
    }, {headers: headers}).then(item => item.data.result));
};

export {saveAnnotation, deleteAnnotation, getAnnotationsByUrl};