let Tools = (() => {
    $(document).ready(() => {
        $(".modal-footer button").on('click', () => {
            $('#myModal').modal('hide')
        })
    })
    const token = window.localStorage.getItem('token');

    observer = (() => {
        var msg = {};
        return {
            on: function (type, fn) {
                if (msg[type]) {
                    msg[type].push(fn);
                }
                else {
                    msg[type] = [fn];
                }
            },
            trigger: function (type) {
                if (msg[type]) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    for (var i = 0; i < msg[type].length; i++) {
                        // 传递参数  自动拆分数组，单个传递
                        msg[type][i].apply(null, args);
                    }
                }
                else {
                    return;
                }
            },
            off: function (type, fn) {
                // 无法删除匿名函数
                if (type === undefined) {
                    msg = {};
                    return;
                }
                if (fn) {
                    for (var i = msg[type].length - 1; i >= 0; i--) {
                        if (msg[type][i] === fn) {
                            msg[type].splice(i, 1);
                            return;
                        }
                    }
                }
                else {
                    msg[type] = [];
                    return;
                }
            },
            once: function (type, fn) {
                var me = this;
                function call() {
                    me.off(type, call);
                    fn.apply(null, Array.prototype.slice.call(arguments, 1));
                }
                this.on(type, call)
            }
        }
    }
    )()
    return {
        checkTool: {
            toolbar(eCurrentTarget, numb) {
                let num = numb ? numb : ($(eCurrentTarget).data('index') - 1);
                let str = `rotateY(${num < 4 ? 90 * num : 0}deg) rotateX(${num < 4 ? 0 : num === 4 ? -90 : num ? -270 : 0}deg)`;
                $('.loginMain').css({ transform: str })
            },
            cEmail(val) {
                return /^(\w){4,12}@(\w){2,5}(.com)$/.test(val);
            },
            cPassword(val) {
                return /^(\S){6,10}$/.test(val) && /(\W)+/.test(val);
            },
            cAge(val) {
                return val < 101 && val > 0;
            },
            showLogo(length, boolEmail, cName) {
                if (!length) {
                    $(cName).removeClass('glyphicon-remove');
                }
                else if (boolEmail) {
                    $(cName).addClass('glyphicon-ok').removeClass('glyphicon-remove');
                }
                else {
                    $(cName).addClass('glyphicon-remove').removeClass('glyphicon-ok');
                }
            },
            removeAllLogo() {
                $('.glyphicon').removeClass('glyphicon-ok');
                $('.glyphiconPs').removeClass('glyphicon-ok');
                $('.glyphiconPsAgain').removeClass('glyphicon-ok');
                $('.register input').val('');
            },
            myShowModal(val, boole) {
                if (boole) {
                    $('.modal-content .modal-footer').html(`
                    <button type = "button" class= "btn btn-default" data-dismiss="modal">取消</button>
                    <button type = "button" class= "btn btn-primary" data-dismiss="modal">确定</button>
                    `)
                }
                else {
                    $('.modal-content .modal-footer').html(
                        `
                        <button type="button" class="btn btn-primary" data-dismiss="modal">确定</button>
                        `
                    );
                }
                $('#myModal').find('.modal-body').html(val).end().modal();
                return true;
            },
            toRender(tpl, data) {
                return tpl.replace(/{{(\w+)}}/g, (match, $0) => {
                    return $0 === 'share' ? !data[$0] ? '' : 'checked="checked"' : data[$0];
                });
            },
            ...observer,
            loginInit() {
                let width = $('html').width();
                let height = $('html').height();
                let ary = [];
                let obj = {};
                testAry = (obj) => {
                    let boolean = ary.every((item) => {
                        return (obj.itemWid < item.itemWid || obj.itemWid > (item.itemWid + item.arc))
                            && (obj.itemHei < item.itemHei || obj.itemHei > (item.itemHei + item.arc))
                            && ((obj.itemWid + obj.arc) < item.itemWid || obj.itemWid + obj.arc > item.itemWid + item.arc)
                            && ((obj.itemHei + item.arc) < item.itemHei + obj.arc || obj.itemHei > item.itemHei + item.arc)
                    })
                    return boolean;
                }
                for (i = 0; i < Math.min(width, height) / 100; i++) {
                    let itemWid = Math.random() * (width - 140);
                    let itemHei = Math.random() * (Math.min(width, height) - 140);
                    let arc = Math.random() * (150);
                    obj = { itemWid, itemHei, arc };
                    while (!testAry(obj)) {
                        itemWid = Math.random() * (width - 140);
                        itemHei = Math.random() * (Math.min(width, height) - 140);
                        arc = Math.random() * (150);
                        obj = { itemWid, itemHei, arc };
                    }
                    ary.push(obj)
                    let div = $('<div></div>');
                    div.css({
                        width: arc + 'px',
                        height: arc + 'px',
                        position: 'absolute',
                        top: itemHei + 'px',
                        left: itemWid + 'px'
                    })
                    div.addClass('circle');
                    $('#boxCircle').append(div);
                }
            },
            movefn(e) {
                width = lw + e.clientX - dx;
                height = ly + e.clientY - dy;
                if (width - 1 < $('.avatar').width() && height - 1 < $('.avatar').height()) {
                    $('.layer').css({
                        width,
                        height
                    })
                }
            }
        },
        initTools: {
            buttonRefresh() {
                $(".modal-footer button").on('click', () => {
                    $('#myModal').modal('hide');
                    window.location.href = '/';
                })
            }
        },
        ajaxTo: {

        }
    }
})()