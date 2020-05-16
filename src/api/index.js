import axios from "axios";

const user = "kevin";
const headers = {
    Authentication: JSON.stringify({"type": "noauth", user})
};


function getUrl(path) {
    return `http://127.0.0.1:3980/${path}`;
}

const saveAnnotation = ({url, uid, data}) => {
    return axios.post(getUrl("saveAnnotation"), {
        url, uid, data
    }, {headers: headers});
};

const deleteAnnotation = ({url, uid}) => {
    return axios.post(getUrl("deleteAnnotation"), {
        url, uid,
    }, {headers: headers});
};

const getAnnotationsByUrl = (url) => {
    return axios.post(getUrl("getAnnotationsByUrl"), {
        url,
    }, {headers: headers}).then(item => item.data.result);
};

export {saveAnnotation, deleteAnnotation, getAnnotationsByUrl};