$(document).ready(() => {
    const token = localStorage.getItem('token');
    const { checkTool, initTools } = Tools;
    const { userAjax, tpls } = AjaxTools;
    const { manage } = manageAlbum;
    let hash = location.hash.slice(-1) || 0;
    if (!token) {
        location.href = '/login.html'
    }
    else {
        checkTool.trigger('userInfo');
    }
    manage();
    checkTool.trigger('part' + hash);
    $('nav ul li').removeClass('active').eq(hash).addClass('active');
    $('nav .navContent').eq(hash).fadeIn().siblings('.navContent').hide();
    $('.rgInfo').on('mouseover', () => { $('.top-user-menu').stop().fadeIn(); })
    $('.rgInfo').on('mouseout', () => { $('.top-user-menu').stop().fadeOut(); })
    $('.rgInfo').on('click', '#imgLogoBoxI', e => {
        $('nav ul li').removeClass('active');
        $('nav .navContent').eq(4).fadeIn().siblings('.navContent').hide();
    })
    let lw, ly, dx, dy, lt, ll, lx, lyy;
    $(' .dot').on('mousedown', (e) => {
        e.stopPropagation();
        lw = $('.layer').width();
        ly = $('.layer').height();
        dx = e.clientX;
        dy = e.clientY;
        $('.toFixImg').off('mousemove', layerMovefn)
        $('.toFixImg').on('mousemove', movefn)
    })
    $(' .layer').on('mousedown', (e) => {
        lt = parseInt($('.layer').css('top'));
        ll = parseInt($('.layer').css('left'));
        lx = e.clientX;
        lyy = e.clientY;
        $('.toFixImg').on('mousemove', layerMovefn)
    })
    function movefn(e) {
        let width = lw + e.clientX - dx;
        let height = ly + e.clientY - dy;
        if (width - 1 < $('.avatar').width() && height - 1 < $('.avatar').height()) {
            $('.layer').css({
                width,
                height
            })
        }
    }
    function layerMovefn(e) {
        let left = lt + e.clientX - lx;
        let top1 = ll + e.clientY - lyy;
        if (left < $('.avatar').width() - $('.layer').width() + 2 && left > -4 && top1 < $('.avatar').height() - $('.layer').height() + 2 && top1 > -4) {
            $('.layer').css({
                'top': top1 + 'px',
                'left': left + 'px',
                'background-position': -left + 'px ' + -top1 + 'px'
            })
        }

    }
    $(document).on('mouseup', () => {
        $('.toFixImg').off('mousemove', movefn);
    })
    $(document).on('mouseup', () => {
        $('.toFixImg').off('mousemove', layerMovefn)
    })
    $('#middle button').on('click', () => {
        x = parseInt($('.layer').css('left')) * 4;
        y = parseInt($('.layer').css('top')) * 4;
        width = parseInt($('.layer').width()) * 4;
        height = parseInt($('.layer').height()) * 4;
        console.log(x, y, width, height);
        $.ajax({
            url: '/tocupImg?token=' + token + '&url=' + $('#toFixImg').data('url'),
            method: 'POST',
            data: { x: x < 0 ? 0 : x, y: y < 0 ? 0 : y, width, height },
            success({ error, data, url }) {
                if (error === 0) {
                    location.reload();
                }
                else {
                    checkTool.myShowModal(data);
                }
            }
        })
    })
    $('nav li').on('click', e => {
        if (+hash !== $(e.currentTarget).index()) {
            checkTool.trigger('part' + $(e.currentTarget).index());
        }
        hash = $(e.currentTarget).index();
        $(e.currentTarget).addClass('active').siblings().removeClass('active');
        $('nav .navContent').eq($(e.currentTarget).index()).fadeIn().siblings('.navContent').hide();
    })

    $('.input-group .input-group-addon').on('click', e => {
        let $input = $(e.currentTarget).siblings('input');
        let $sex = $(e.currentTarget).siblings('.sex-choose').find('input:checked');
        if ($input.attr('name') === 'headImg') {
            let fd = new FormData($input.parents('form')[0]);
            fd.append('token', token);
            if (fd.get('headImg').name) {
                console.log(1);
                $.ajax(
                    {
                        url: '/img/upload',
                        method: 'POST',
                        data: fd,
                        processData: false,
                        contentType: false,
                        success(data) {
                            if (!data.error) {
                                checkTool.myShowModal('成功存入信息')
                                initTools.buttonRefresh();
                            }
                        }
                    })
            }
            else {
                checkTool.myShowModal('请选择文件')
            }
            return;
        }
        else if (($input.prop('name') === 'password' && checkTool.cPassword($input.val())) ||
            ($input.prop('name') === 'age' && checkTool.cAge($input.val())) ||
            $sex.val()) {
            let msg = '';
            if ($sex.val()) {
                msg = $sex.parents('form').serialize();;
            }
            else {
                msg = $input.parents('form').serialize();
            }
            $.ajax(
                {
                    url: '/data/upload',
                    method: 'POST',
                    data: { msg, token },
                    success(data) {
                        if (!data.error) {
                            checkTool.myShowModal('成功修改信息')
                            initTools.buttonRefresh();
                        }
                    }
                }
            )
            return;
        }
        else {
            checkTool.myShowModal(
                `<p>请输入格式为:</p>
                 <p>密码:至少包含一位特殊字符，长度在8-12的密码</p>
                 <p>年龄:0-100的年龄</p>
                 <p>性别:需要选定一个单选框</p> `
            )
            return;
        }
    })

    $('#myAlbum').on('click', '.panel', (e) => {
        $.ajax({
            url: '/album/userAlb?token=' + token,
            method: 'POST',
            data: { _id: $(e.currentTarget).data('_id') },
            success({ error, data }) {
                if (error === 0) {
                    let { name, usrls, userName } = data;
                    let $myAlbumDetail = $('#myAlbumDetail').html('');
                    if (usrls.length) {
                        $('#myAlbum').hide();
                        $('#myAlbumDetail').fadeIn();
                        $myAlbumDetail.append('<div class="spanBox"><button class="btn btn-success" id="backShow">返回</button></div>')
                        usrls.forEach(item => {
                            $myAlbumDetail.append(checkTool.toRender(tpls.tplImg, { userName, name, item }));
                        })
                    }
                    else {
                        checkTool.myShowModal('该相册为空，或者没有该相册');
                    }
                }
                else {
                    checkTool.myShowModal('获取失败');
                }
            },
        });
    })

    $('#allUser').on('click', '.panel', (e) => {
        $.ajax({
            url: '/album/userOne?token=' + token,
            method: 'POST',
            data: { userName: $(e.currentTarget).data('username') },
            success({ error, data }) {
                if (error === 0) {
                    let $shareAlbum = $('#shareAlbum').html('');
                    $('#allUser').hide();
                    $shareAlbum.fadeIn();
                    $shareAlbum.append('<div class="spanBox"><button class="btn btn-success" id="backShow">返回</button></div>')
                    data.forEach(({ _id, name }) => {
                        $shareAlbum.append(checkTool.toRender(tpls.tplMyAlbum, { _id, name }));
                    })
                }
                else if (error === 1) {
                    checkTool.myShowModal('该用户没有共享相册');
                }
                else {
                    checkTool.myShowModal('获取失败');
                }
            },
        });
    })

    $('#shareAlbum').on('click', '.panel', (e) => {
        $.ajax({
            url: '/album/userAlb?token=' + token,
            method: 'POST',
            data: { _id: $(e.currentTarget).data('_id'), share: true },
            success({ error, data }) {
                if (error === 0) {
                    let { name, usrls, userName } = data;
                    let $shareAlbumDetail = $('#shareAlbumDetail').html('');
                    if (usrls.length) {
                        $('#shareAlbum').hide();
                        $('#shareAlbumDetail').fadeIn();
                        $shareAlbumDetail.append('<div class="spanBox"><button class="btn btn-success" id="backShow">返回</button></div>')
                        usrls.forEach(item => {
                            $shareAlbumDetail.append(checkTool.toRender(tpls.tplImg, { userName, name, item }));
                        })
                    }
                    else {
                        checkTool.myShowModal('该相册为空，或者没有该相册');
                    }
                }
                else {
                    checkTool.myShowModal('获取失败');
                }
            },
        });
    })
    $('#myAlbumDetail').on('click', '#backShow', () => {
        $('#myAlbumDetail').hide();
        $('#myAlbum').fadeIn();
    })
    $('#shareAlbum').on('click', '#backShow', () => {
        $('#shareAlbum').hide();
        $('#allUser').fadeIn();
    })

    $('#shareAlbumDetail').on('click', '#backShow', () => {
        $('#shareAlbumDetail').hide();
        $('#allUser').hide();
        $('#shareAlbum').fadeIn();
    })

})