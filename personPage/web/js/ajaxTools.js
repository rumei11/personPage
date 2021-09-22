
let AjaxTools = (
    () => {
        const { checkTool } = Tools;
        const token = window.localStorage.getItem('token');
        const tpl = `
        <div class="col-xs-4" id="albumName">{{name}}</div>
        <div class="col-xs-2" id="num">{{num}}</div>
        <div class="col-xs-2"><input type="checkbox" name="ishare" id="isShare" {{share}} data-_id="{{_id}}"></div>
        <div class="col-xs-2">
        <span class="btn btn-success btn-xs"  id="upImg" data-_id="{{_id}}" data-name="{{name}}">上传图片
        <input type="file" class="transpFile" id="toUpMultiImg" multiple='multiple'  accept="image/*" data-_id="{{_id}}" data-name="{{name}}">
        </span></div>
        <div class="col-xs-2">
        <span class="btn btn-danger btn-xs" id="delecteImg" data-_id="{{_id}}" data-name="{{name}}">删除图片
        </span></div>
        `;
        const tplMyAlbum = `
        <dic class="panel panel-default"  data-_id="{{_id}}">
            <div class="panel-body">
            </div>
            <div class="panel-heading">{{name}}</div>
        </div>
        `;
        const tplUser = `
        <dic class="panel panel-default" data-username="{{userName}}">
            <div class="panel-body">
            <img src="http://localhost:3000{{headUrl}}" alt="用户头像">
            </div>
            <div class="panel-heading" data-userName="{{userName}}">{{userName}}</div>
        </div>
        `;
        const tplImg = `
        <dic class="panel panel-default">
        <div class="panel-body">
        <img src="http://localhost:3000{{userName}}/selfAlbum/{{name}}/{{item}}" alt="{{item}}">
        </div>
        </div>
        `;
        function throttle(fn, { targetUrl, time, toggle, data }) {
            clearInterval(fn.__timebar);
            if (!toggle || false) {
                fn.__timebar = setTimeout(() => {
                    fn.call(null, targetUrl, data, false)
                }, time || 3000);
            }
        }
        function qAlbumName() {
            $.ajax({
                url: '/album/getName?token=' + token,
                method: 'GET',
                success({ error, data }) {
                    if (error === 0) {
                        $('#albumBox').html('');
                        data.forEach(element => {
                            let albumEle = $('<div class="row"></div>').html(checkTool.toRender(tpl, element));
                            $('#albumBox').append(albumEle);
                        });
                    }
                    else {
                        checkTool.myShowModal('请求相册数据失败');
                    }
                }
            })
            return;
        }
        function userInfo() {
            $.get(`/userInfo?token=${token}`).then(
                ({ error, userName, headUrl }) => {
                    if (error === 0) {
                        $('.userInfo Strong').html(userName);
                        $('.userInfo img').attr('src', headUrl);
                        let img = new Image();
                        img.onload = () => {
                            console.log(headUrl);
                            $('#toFixImg').css({
                                width: img.width / 4,
                                height: img.height / 4,
                                background: `url(${headUrl})`,
                                backgroundSize: '100%'
                            }).find('.layer').css({
                                width: img.width / 8,
                                height: img.height / 8,
                                background: `url(${headUrl})`,
                                backgroundSize: img.width / 4 + 'px ' + img.height / 4 + 'px '
                            })
                        }
                        img.src = headUrl;
                        $('#toFixImg').data('url', headUrl)
                    }
                    else {
                        location.href = '/login.html'
                    }
                },
                err => {
                    console.log('发送请求失败', err);
                }
            )
        }
        function toAjax(targetUrl, cType, isShow, qA) {
            $.ajax({
                url: targetUrl + '?token=' + token,
                method: 'POST',
                data: { cType },
                success({ error, data }) {
                    if (error === 0) {
                        (!isShow && checkTool.myShowModal('数据修改成功')) || (qA && qA());
                    }
                    else if (error === 4) {
                        window.location.href = '/login.html';
                    }
                    else {
                        checkTool.myShowModal('修改数据失败');
                    }
                }
            })
            return;
        }
        function toGetUser() {
            $.get(`/album/user?token=${token}`).then(
                ({ error, data }) => {
                    if (error === 0) {
                        let $myAlbum = $('#myAlbum');
                        $myAlbum.html('')
                        data.forEach(({ _id, name }) => {
                            $myAlbum.append(checkTool.toRender(tplMyAlbum, { _id, name }));
                        });
                    }
                    else {
                        location.href = '/login.html'
                    }
                },
                err => {
                    console.log('发送请求失败', err);
                })
        }
        function getAllUser() {
            $.get(`/user/getAll?token=${token}`).then(
                ({ error, data }) => {
                    if (error === 0) {
                        let $allUser = $('#allUser');
                        $allUser.html('')
                        data.forEach((item) => {
                            $allUser.append(checkTool.toRender(tplUser, item));
                        })
                    }
                    else {
                        location.href = '/login.html'
                    }
                },
                err => {
                    console.log('发送请求失败', err);
                })
        }
        checkTool.on('part0', getAllUser);
        checkTool.on('part1', toGetUser);
        checkTool.on('part2', qAlbumName);
        checkTool.on('userInfo', userInfo);
        return {
            userAjax: {
                userInfo,
                qAlbumName,
                throttle,
                toAjax,
                toGetUser,
                getAllUser
            },
            tpls: {
                tpl,
                tplMyAlbum,
                tplImg
            }
        }

    }
)()