const express = require('express');
const bodyPare = require('body-parser')
const fsc = require('fs')
const qs = require('querystring')
const mongo = require('./web/js/mongoSave')
const path = require('path');
const db = mongo();
const dbAlbum = mongo('album');
const fs = express();
const jwt = require('jsonwebtoken');
const STR = 'ICKTYYDS';
const Formidable = require('formidable');
const { ObjectID } = require('mongodb/node_modules/bson');
const del = require('./web/js/del');
const gm = require('gm');
const http = require('http');
const socket_io = require('socket.io');

fs.use(bodyPare.urlencoded({ extended: true }));
fs.use(express.static('./web/'));
fs.use('/upload', express.static('./upload/'));
fs.get('/userInfo', (req, res) => {
    jwt.verify(req.query.token, STR, (err, data) => {
        if (err) {
            res.json({ error: 4 })
        }
        else {
            let { userName, headUrl, password } = data;
            db.then(
                suc => {
                    suc.findOne({ userName }, (err, data) => {
                        if (data.userName === userName && data.password === password) {
                            res.json({ error: 0, userName, headUrl: data.headUrl })
                        }
                        else {
                            res.json({ error: 4 })
                        }
                    })
                },
                fail => {
                    res.json({ error: 4 })
                }
            )
        }
    })
})
fs.post('/data/upload', (req, res) => {
    jwt.verify(req.body.token, STR, (err, data) => {
        if (err) {
            res.json({ error: 4 });
        }
        else {
            let newVlaue = Object.values(qs.parse(req.body.msg))[0];
            if (newVlaue && newVlaue !== data.password) {
                db.then(
                    suc => suc.updateOne({ userName: data.userName }, { $set: qs.parse(req.body.msg) }),
                    fail => res.json({ error: 6, data: "修改失败" })
                )
                res.json({ error: 0, data: "success to change" })
            }
            else {
                res.json({ error: 5, data: "重新输入" })
            }
        }
    })
})
fs.post('/img/upload', (req, res) => {
    let fm = new Formidable();
    fm.uploadDir = path.join(process.cwd(), 'upload');
    fm.parse(req, (err, filds, file) => {
        jwt.verify(filds.token, STR, (err, { userName }) => {
            if (err) {
                res.json({ error: 4, data: '解析用户信息失败' })
            }
            else {
                fsc.rename(file.headImg.path, path.join(process.cwd(), `upload`, userName, 'head', file.headImg.name),
                    err => {
                        if (err) {
                            res.json({ error: 7, data: '存入失败' })
                        }
                        else {
                            db.then(
                                suc => {
                                    suc.updateOne({ userName }, { $set: { headUrl: `/upload/${userName}/head/${file.headImg.name}` } });
                                    res.json({ error: 0, data: '头像数据修改成功' })
                                },
                                fail => {
                                    res.json({ error: 8, data: 'mongo数据库链接失败' })
                                }
                            )
                        }
                    });
            }
        })
    })
})
// 
fs.post('/toLogin', (req, res) => {
    let obj = qs.parse(req.body.data);
    db.then(suc => suc.find({ userName: obj.email }).toArray((err, data) => {
        if (data.length !== 0) {
            let { password } = data[0];
            password === obj.password ? jwt.sign(data[0], STR, (err, data) => {
                if (err) {
                    res.json({ error: 3, data: '创建用户失败' })
                }
                res.json({ error: 0, data });
            })
                : res.json({ error: 1 });
        }
        else {
            res.json({ error: 2 });
        }
    }))
})
fs.post('/album/creat', (req, res) => {
    jwt.verify(req.query.token, STR, (err, { userName }) => {
        if (err) {
            res({ error: 3, data: '无效凭证，重新登录' })
        }
        else {
            fsc.mkdir(path.join(process.cwd(), 'upload', userName, 'selfAlbum', req.body.albumName), err => {
                if (err) {
                    return res.json({ error: 101, data: '创建相册失败，请重试' })
                }
                dbAlbum.then(
                    suc => {
                        suc.findOne({ userName, name: req.body.albumName }, (err, data) => {
                            if (err) {
                                return res.json({ error: 501, data: '数据查询失败' })
                            }
                            if (data) {
                                return res.json({ error: 102, data: '数据库存在该相册信息' })
                            }
                            else {
                                suc.insertOne({
                                    userName,
                                    name: req.body.albumName,
                                    share: false,
                                    num: 0,
                                    usrls: []
                                }, (err, data) => {
                                    if (err) {
                                        fsc.rmdir(path.join(process.cwd(), 'upload/selfAlbum', userName, req.body.albumName), (err, data) => {
                                            if (err) {
                                                return res.json({ error: 111, data: '创建相册成功，但读取失败后删除相册失败' })
                                            }
                                            return res.json({ error: 110, data: '创建相册成功，但读取失败，已删除相册' })
                                        })
                                    }
                                    else {
                                        return res.json({ error: 0, data: { name: req.body.albumName } })
                                    }
                                })
                            }
                        })
                    }
                    ,
                    fail => {
                        return res.json({ error: 501, data: '数据查询失败' })
                    }
                )
            })
        }
    })
})
fs.get('/album/getName', (req, res) => {
    jwt.verify(req.query.token, STR, (err, { userName }) => {
        if (err) {
            // 解析失败 跳转页面
            res.json({ error: 4 });
        }
        else {
            dbAlbum.then(
                suc => {
                    suc.find({ userName }).sort({ name: 1 }).toArray((err, data) => {
                        if (err) {
                            res.json({ error: 10, data: '查询失败' })
                        }
                        res.json({ error: 0, data })
                        return;
                    })

                }
                ,
                fail => {
                    res.json({ error: 8, data: 'mongo数据库链接失败' })
                    return;
                }
            )
        }
    })
})
fs.post('/album/changeMsg', (req, res) => {
    jwt.verify(req.query.token, STR, err => {
        if (err) {
            res.json({ error: 4, data: '解析用户信息失败' })
        }
        else {
            console.log(req.body);
            let { share, _id } = req.body.cType;
            dbAlbum.then(
                suc => {
                    suc.updateOne({ _id: new ObjectID(_id) }, { $set: { share: share === '1' } },
                        err => {
                            if (err) {
                                return res.json({ error: 9, data: 'mongo数据库更新数据失败' });
                            }
                            else {
                                dbAlbum.then(
                                )
                                return res.json({ error: 0, data: '修改成功' });
                            }
                        })
                },
                fial => {
                    return res.json({ error: 8, data: 'mongo数据库链接失败' });
                }
            )
        }
    })
    return;
})
fs.post('/toRegister', (req, res) => {
    let obj = qs.parse(req.body.data);
    db.then(suc => suc.find({ userName: obj.email }).toArray(async (err, data) => {
        if (data.length === 0) {
            // 定义文件路径
            let userFile = path.join(process.cwd(), 'upload', obj.email);
            let result = await new Promise((resolve, reject) => {
                fsc.mkdir(userFile, err => {
                    if (!err) {
                        resolve({ error: 0 })
                    }
                    else {
                        resolve({ errpr: 1, data, err })
                    }
                })
            })
            if (result.error === 0) {
                result = await new Promise((resolve, reject) => {
                    fsc.mkdir(path.join(userFile, 'head'), (err, data) => {
                        if (!err) {
                            resolve({ error: 0 })
                        }
                        else {
                            resolve({ error: 1, data: err })
                        }
                    })
                    fsc.mkdir(path.join(userFile, 'selfAlbum'), (err, data) => {
                        if (!err) {
                            resolve({ error: 0 })
                        }
                        else {
                            resolve({ error: 1, data: err })
                        }
                    })
                })
                if (result.error === 0) {
                    result = await new Promise((resolve, reject) => {
                        fsc.readFile(path.join(process.cwd(), 'web\\image\\log.png'), (err, data) => {
                            if (!err) {
                                resolve({ error: 0, data })
                            }
                            else {
                                resolve({ error: 1, data: err })
                            }
                        })
                    })
                    if (result.error === 0) {
                        result = await new Promise((resolve, reject) => {
                            fsc.appendFile(path.join(userFile, 'head/head_default.png'), result.data, (err, data) => {
                                if (!err) {
                                    resolve({ error: 0 })
                                }
                                else {
                                    resolve({ error: 1, data: err })
                                }
                            })
                        })
                        if (result.error === 0) {
                            suc.insertOne({
                                userName: obj.email,
                                password: obj.password,
                                headUrl: `/upload/${obj.email}/head/head_default.png`,
                                age: 'secret',
                                sex: 'secret'
                            })
                            res.json('success')
                        }
                        else {
                            res.json('存入头像数据失败')
                        }
                    }
                    else {
                        res.json('读取头像数据失败')
                    }
                }
                else {
                    res.json('创建用户文件失败')
                }
            }
            else {
                res.json('创建用户文件失败')
            }
        }
        else {
            res.json('fail')
        }
    }))
})
fs.post('/album/upImgs', (req, res) => {
    console.log(1);
    jwt.verify(req.query.token, STR, (err, { userName }) => {
        if (err) {
            res.json({ error: 4, data: '解析用户信息失败' })
        }
        else {
            let fils = new Formidable();
            fils.uploadDir = path.join(process.cwd(), 'upload', userName, 'selfAlbum')
            let ary = [];
            fils.on('file', ($1, $2) => ary.push($2));
            fils.parse(req, (err, fild, filds) => {
                if (err) {
                    res.json({ error: 502, data: '文件解析失败' })
                }
                else {
                    if (ary.length) {
                        ary = ary.map(item => new Promise((resolve, reject) => {
                            fsc.rename(item.path, path.join(path.parse(item.path).dir, fild.name, path.parse(item.path).name + path.extname(item.name)), err => {
                                err ? reject(err) : resolve(path.parse(item.path).name + path.extname(item.name));
                            })
                        }))
                        Promise.all(ary).then(
                            usrls => {
                                dbAlbum.then(
                                    suc => {
                                        suc.findOne({ _id: new ObjectID(fild._id) }, (err, data) => {
                                            usrls = data.usrls.concat(usrls);
                                            suc.updateOne({ _id: new ObjectID(fild._id) }, { $set: { usrls, num: usrls.length } }, err => {
                                                if (err) {
                                                    return res.json({ error: 302, data: '数据库更新失败' })
                                                }
                                                else {
                                                    return res.json({ error: 0, data: { num: ary.length, msg: '更新成功' }, })
                                                }
                                            })
                                        })
                                    },
                                    fail => {
                                        return res.json({ error: 8, data: 'mongo数据库链接失败' });
                                    })
                            },
                            fail => {
                                return res.json({ error: 502, data: '文件解析失败' })
                            }
                        )
                    }
                    else {
                        return res.json({ error: 502, data: '文件解析失败' })
                    }
                }
            })
        }
    })
})
fs.post('/album/delecte', (req, res) => {
    jwt.verify(req.query.token, STR, (err, { userName }) => {
        if (err) {
            res.json({ error: 4, data: '解析用户信息失败' })
        }
        else {
            let { _id, deleteEle, name } = req.body.cType;
            if (deleteEle) {
                del(path.join(process.cwd(), 'upload', userName, 'selfAlbum', name)).then(
                    suc => {
                        dbAlbum.then(
                            suc => {
                                suc.deleteOne({ _id: new ObjectID(_id) },
                                    (err, data) => {
                                        if (err) {
                                            return res.json({ error: 9, data: '数据库数据更新失败' });
                                        }
                                        else {
                                            console.log(data);
                                            return res.json({ error: 0, data: '修改成功' });
                                        }
                                    })
                            })
                    },
                    fail => {
                        return res.json({ error: 5000, data: '服务器文件删除失败' });
                    }
                )

            }
            else {
                return res.json({ error: 505, data: '未知错误app.js  325' })
            }
        }
    })
})
fs.get('/album/user', (req, res) => {
    jwt.verify(req.query.token, STR, (err, { userName }) => {
        if (err) {
            res.json({ error: 4, data: '解析用户信息失败' })
        }
        else {
            dbAlbum.then(
                suc => {
                    let ary = [];
                    suc.find({ userName }).sort({ num: -1 }).toArray((err, item) => {
                        if (err) {
                            res.json({ error: 101, data: '转化数组失败' })
                        }
                        else {
                            data = item.map(({ name, _id }) => ({ name, _id }))
                            res.json({ error: 0, data })
                        }
                    })
                },
                fail => {
                    res.json({ error: 300, data: '数据库连接失败' })
                }
            )
        }
    })
})

fs.post('/album/userAlb', (req, res) => {
    jwt.verify(req.query.token, STR, (err) => {
        if (err) {
            res.json({ error: 4, data: '解析用户信息失败' })
        }
        else {
            dbAlbum.then(
                suc => {
                    let _id = req.body._id;
                    suc.findOne({ _id: new ObjectID(_id) }, (err, { name, usrls, userName }) => {
                        if (err) {
                            res.json({ error: 101, data: '转化数组失败' })
                        }
                        else {

                            res.json({ error: 0, data: { name, usrls, userName } })
                        }
                    })

                },
                fail => {
                    res.json({ error: 300, data: '数据库连接失败' })
                }
            )
        }
    })
})
fs.get('/user/getAll', (req, res) => {
    jwt.verify(req.query.token, STR, (err, { userName }) => {
        if (err) {
            res.json({ error: 4, data: '解析用户信息失败' })
        }
        else {
            db.then(
                suc => {
                    suc.find({}).toArray((err, item) => {
                        if (err) {
                            res.json({ error: 101, data: '转化数组失败' })
                        }
                        else {
                            let ary = item.map(({ userName, headUrl }) => ({ userName, headUrl }))
                            console.log(ary);
                            res.json({ error: 0, data: ary })
                        }
                    })
                },
                fail => {
                    res.json({ error: 300, data: '数据库连接失败' })
                }
            )
        }
    })
})

fs.post('/album/userOne', (req, res) => {
    jwt.verify(req.query.token, STR, err => {
        if (err) {
            res.json({ error: 4, data: '解析用户信息失败' })
        }
        else {
            dbAlbum.then(
                suc => {
                    suc.find({ userName: req.body.userName, share: true }).toArray((err, data) => {
                        if (err) {
                            res.json({ error: 5, data: '该用户没有相册' })
                        }
                        else {
                            if (data.length) {
                                data = data.map(({ _id, name }) => ({ _id, name }));
                                res.json({
                                    error: 0, data
                                })
                            }
                            else {
                                res.json({ error: 1, data: '该用户没有共享相册' })
                            }
                        }
                    });
                }
            )
        }
    })
})
fs.post('/tocupImg', (req, res) => {
    let { url, token } = req.query;
    jwt.verify(token, STR, (err, { userName }) => {
        if (err) {
        }
        else {
            let { width, height, x, y } = req.body;
            console.log(width, height, x, y);
            let { dir, base } = path.parse(url);
            let newUrl = path.join(process.cwd(), dir, 'newCup.png');
            gm(path.join(process.cwd(), url)).
                crop(width, height, x, y).
                write(newUrl,
                    err => {
                        if (err) {
                            console.log(err);
                            res.json({ error: 1, data: '写入失败' })
                        }
                        else {
                            db.then(
                                suc => {
                                    console.log(path.join(dir, 'new' + base));
                                    suc.updateOne({ userName }, { $set: { headUrl: `/upload/${userName}/head/newCup.png` } });
                                    res.json({ error: 0, data: 'success', url: `/upload/${userName}/head/newCup.png` });
                                },
                                fail => {
                                    res.json({ error: 1, data: '更新失败' })
                                }
                            )
                        }

                    }
                )
        }
    })
})
fsLisen = http.createServer(fs);
socket_io(fsLisen);
fsLisen.listen(3000);