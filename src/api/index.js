import axios from "axios";
import toastr from "toastr";

const defaultUser = "guest";
const defaultServer = "https://t.kevinwang.cc:3981/";

function getStorage(key) {
    return new Promise((resolve, reject) => {
        if (chrome && chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.get([key], function (result) {
                resolve(result[key])
            });
        } else {
            resolve(localStorage[key]);
        }
    });
}

async function getUser() {
    const storageKey = "breezeUser";

    const currentValue = await getStorage(storageKey);
    if (currentValue) {
        return currentValue;
    }
    return defaultUser;
}

async function getServer() {
    const storageKey = "breezeServer";

    const currentValue = await getStorage(storageKey);
    if (currentValue) {
        return currentValue;
    }
    return defaultServer;
}

const getHeaders = () => getUser().then(user => ({
    Authentication: JSON.stringify({"type": "noauth", user})
}));

function getEndpoint(path) {
    return new Promise((resolve) => {
        getServer().then(server => {
            resolve(`${server.replace(/\/$/, '')}/${path}`)
        })
    })
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

const saveAnnotation = ({url, id, data}) => {
    return wrapRequestApi(({headers}) => getEndpoint("saveAnnotation").then(endpoint => axios.post(endpoint, {
        url, id, data
    }, {headers: headers})));
};

const deleteAnnotation = ({url, id}) => {
    return wrapRequestApi(({headers}) => getEndpoint("deleteAnnotation").then(endpoint => axios.post(endpoint, {
        url, id,
    }, {headers: headers})));
};

const getAnnotationsByUrl = (url) => {
    return wrapRequestApi(({headers}) => getEndpoint("getAnnotationsByUrl").then(endpoint => axios.post(endpoint, {
        url,
    }, {headers: headers}).then(item => item.data.result)));
};

export {saveAnnotation, deleteAnnotation, getAnnotationsByUrl};