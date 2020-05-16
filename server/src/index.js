const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const getAuthenticatedUser = require("./auth/getAuthenticatedUser");

const app = express();

app.listen(3980);
app.use(bodyParser.json());
app.use(cors());

app.get('/queryByUrl', function (req, res) {
    res.end(getAuthenticatedUser(req));
});

console.log("Listening at :3980")
