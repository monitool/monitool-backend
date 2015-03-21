module.exports = {
    /**
     * Insert random number into collection
     * @param {type} coll - collection
     * @param {type} req - http request
     * @param {type} res - http response
     */
    insertRandom: function (coll, req, res) {
        coll.insert({randomNumber: Math.random()}, function (err) {
            res.end('Successful Insert!'); //insert text into http response
        });
    },
      /**
     * Clean given collection
     * @param {type} coll - collection
     * @param {type} req - http request
     * @param {type} res - http response
     */
    cleanDatabase: function (coll, req, res) {
        console.log("Cleaning database started...");
        coll.remove({}, function (err, numberRemoved) {
            res.end("Cleaning database... Number of objects removed: " + numberRemoved);
        });
    },
        /**
     * Show all data from given collection
     * @param {type} coll - collection
     * @param {type} req - http request
     * @param {type} res - http response
     */
    showAllDataFromCollection: function (coll, req, res) {
        coll.find({}, function (err, docs) {
            docs.each(function (err, doc) {
                if (doc) {
                    res.write(JSON.stringify(doc) + "\n");
                }
                else {
                    res.end();
                }
            });
        });
    }
};