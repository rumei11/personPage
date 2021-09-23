let { MongoClient } = require('mongodb');
function mongoSave(collectionName) {
    return new Promise((resolve, reject) => {
        (MongoClient.connect('mongodb://localhost:27017/', (err, client) => {
            if (!err) {
                resolve(client.db('studentDb').collection(collectionName || 'name'));
            }
            else {
                reject('error')
            }
        }));
    })
}
// collection集合可以 直接修改this.collectionName的值
module.exports = mongoSave;
