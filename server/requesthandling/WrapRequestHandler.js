module.exports = function WrapRequestHandler(func) {
    return (req, res) => {
        return func(req, res).catch(err => {
            res.status(500).send(err);
        }).finally(() => {
            res.end();
        });
    }
}
