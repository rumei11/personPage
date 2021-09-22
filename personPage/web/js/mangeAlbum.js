let manageAlbum = (
    () => {
        const token = localStorage.getItem('token');
        const { checkTool, initTools } = Tools;
        const { userAjax, tpls } = AjaxTools;
        function manage() {
            // 管理相册部分
            // 获取本用户相册
            $('#albumBox').on('click', '#isShare', e => {
                userAjax.throttle(
                    userAjax.toAjax,
                    {
                        targetUrl: '/album/changeMsg',
                        time: 300,
                        toggle: false,
                        data: {
                            'share': $(e.currentTarget).prop('checked') === true ? 1 : 0,
                            '_id': $(e.currentTarget).data('_id')
                        }
                    }
                )
            });
            // 删除相册
            $('#albumBox').on('click', '#delecteImg', e => {
                checkTool.myShowModal('是否确认删除该相册，删除后无法找回', true);
                $('.modal-footer .btn-primary').on('click', () => {
                    userAjax.toAjax('/album/delecte', {
                        '_id': $(e.currentTarget).data('_id'),
                        'deleteEle': true,
                        'name': $(e.currentTarget).data('name')
                    }, true, userAjax.qAlbumName)
                })
            });
            // 相册上传
            $("#albumBox").on('change', "#toUpMultiImg", e => {
                let fs = new FormData();
                Array.from(e.currentTarget.files, item => {
                    fs.append('files', item);
                })
                fs.append('_id', $(e.currentTarget).data('_id'));
                fs.append('name', $(e.currentTarget).data('name'));
                $.ajax({
                    url: '/album/upImgs?token=' + token,
                    method: 'POST',
                    data: fs,
                    processData: false,
                    contentType: false,
                    success({ error, data }) {
                        if (error === 0) {
                            checkTool.myShowModal('成功上传' + data.num + '张图片');
                            userAjax.qAlbumName();
                        }
                        else {
                            checkTool.myShowModal('上传失败');
                        }
                    },
                });
                $(e.currentTarget).val('');
            })
            // 创建相册
            $('.manager-top .input-group-addon').off('click').on('click', (e) => {
                let $input = $(e.currentTarget).siblings('input');
                if ($input.val()) {
                    $.ajax({
                        url: '/album/creat?token=' + token,
                        method: 'POST',
                        data: { albumName: $input.val() },
                        success({ error }) {
                            if (error === 0) {
                                userAjax.qAlbumName();
                                checkTool.myShowModal('成功创建新相册');
                            }
                            else if (error === 101) {
                                checkTool.myShowModal('已有该相册，不能重复创建');
                            }
                            else {
                                checkTool.myShowModal('跳转登录');
                                location.href = '/login.html'
                            }
                        }
                    })
                }
                else {
                    checkTool.myShowModal('请文件名称');
                }
            })
            // 创建头像剪辑
        }
        return {
            manage
        };
    }
)()