const express = require('express');
const bodyPare = require('body-parser')
const fsc = require('fs')
const qs = require('querystring')
const path = require('path');
const fs = express();
const jwt = require('jsonwebtoken');
const STR = 'ICKTYYDS';
const Formidable = require('formidable');
const gm = require('gm');
const http = require('http');
const socket_io = require('socket.io');
fs.use(express.static('./web/'));
fs.use('/upload', express.static('./upload/'));
fsLisen = http.createServer(fs);
let io = socket_io(fsLisen);
fs.use('/gif', express.static('./images'))
fs.use(express.static('./web'))
let aryUsers = [];
let aryMsgs = [];
io.on('connect', client => {

    fsc.readdir('./images', (err, data) => {
        if (err) {
            io.emit('ickt', { error: 1 })
        }
        io.emit('ickt', { error: 0, data })
    })
    client.on('addName', args => {
        aryUsers.push([args, client]);
        io.emit('userEnter', aryUsers.map(item => item[0]));
    })
    client.on('disconnect', () => {
        let index = aryUsers.findIndex(item => item[1] === client);
        if (index >= 0) {
            aryUsers.splice(index, 1);
        }
        io.emit('userEnter', aryUsers.map(item => item[0]));
    })
    client.on('sendMsg', msg => {
        aryMsgs.push(msg);
        let item = aryUsers.find(item => item[1] === client)
        io.emit('pubMsg', item[0] + ' 说: ' + msg);
    })
})
fsLisen.listen(3000);