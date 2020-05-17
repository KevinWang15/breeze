const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const getAuthenticatedUser = require("./auth/getAuthenticatedUser");
const {Client} = require('@elastic/elasticsearch')
const WrapRequestHandler = require("./requesthandling/WrapRequestHandler")
const config = require("./config.js");
const client = new Client(config.elasticSearchConfig)
const INDEX_annotation = 'annotation';

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post('/saveAnnotation', WrapRequestHandler(async function (req, res) {
    const user = getAuthenticatedUser(req);
    await client.index({
        index: INDEX_annotation,
        id: req.body.uid,
        body: {
            user,
            url: req.body.url,
            data: req.body.data
        }
    });
    res.send({});
}));

app.post('/deleteAnnotation', WrapRequestHandler(async function (req, res) {
    const user = getAuthenticatedUser(req);
    let item;
    try {
        item = await client.get({
            index: INDEX_annotation,
            id: req.body.uid,
        });
    } catch (e) {
        if (e.meta.statusCode !== 404) {
            throw e;
        }
    }

    if (!item || item.body._source.user !== user) {
        res.status(404).send({});
        return;
    }

    await client.delete({
        index: INDEX_annotation,
        id: req.body.uid,
    });
    res.send({});
}));

app.post('/getAnnotationsByUrl', WrapRequestHandler(async function (req, res) {
    const user = getAuthenticatedUser(req);
    const result = await client.search({
        index: INDEX_annotation,
        body: {
            query: {
                "bool": {
                    "must": [],
                    "filter": [
                        {
                            "match_all": {}
                        },
                        {
                            "match_phrase": {
                                "url": req.body.url
                            }
                        },
                        {
                            "match_phrase": {
                                "user": user
                            }
                        }
                    ],
                    "should": [],
                    "must_not": []
                }
            }
        }
    })
    res.send({result: result.body.hits.hits.map(item => ({...item._source.data, uid: item._id}))});
}));

app.listen(3980, function () {
    console.log("Listening at :3980")
});
