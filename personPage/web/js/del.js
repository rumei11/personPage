const { readdir, stat, rmdir, unlink } = require('fs')
async function delectDir(ary) {
    let arr = await new Promise(resolve => {
        readdir(ary, (err, data) => {
            resolve(data)
        });
    })
    for (let i = 0; i < arr.length; i++) {
        let k = ary + '\\' + arr[i];
        let state = await new Promise(resolve => {
            stat(k, (err, data) => {
                resolve(data.isDirectory());
            })
        })
        if (state) {
            await delectDir(k)
        }
        else {
            await new Promise(resolve => {
                unlink(k, () => {
                    resolve();
                });
            })
        }
    }
    await new Promise(resolve => {
        rmdir(ary, () => {
            resolve();
        })
    }
    );
}
module.exports = delectDir;