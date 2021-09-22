// 表单校验
$(document).ready(() => {
    let { checkTool } = Tools;
    let boolEmail = false, boolPs = false, boolPsAgain = false;
    $('#toLogin').on('click', () => {
        $.ajax({
            url: 'toLogin',
            method: 'POST',
            data: { data: $('.login form').serialize() },
            success: ({ error, data }) => {
                if (error === 0) {
                    localStorage.setItem('token', data);
                    window.location.href = 'http://localhost:3000';
                }
                else if (error === 1) {
                    let div = $('<div class="revSection"> <p class="rg">密码错误</p> <p><button class="toLoginBtn">重新输入</button></p></div>');
                    div.css({ padding: '4rem 3rem' });
                    div.find('.toLoginBtn').on('click', () => div.hide())
                    $('.login').append(div);
                }
                else {
                    let div = $('<div class="revSection"> <p class="rg">无此用户</p><p><button class="toRegisterNew">立即注册</button></p> <p><button class="toLoginBtn">重新输入</button></p></div>');
                    div.css({ padding: '1rem 3rem' });
                    div.find('.toLoginBtn').on('click', () => div.hide())
                    div.find('.toRegisterNew').on('click', () => {
                        div.hide();
                        $('#rgNew').addClass('boxShadow').siblings().removeClass('boxShadow')
                        checkTool.toolbar($('.loginMain'), 3);
                    })
                    $('.login').append(div);
                }
            }
        })
    })

    $('#toRegister').on('click', () => {
        if (boolEmail && boolPs && boolPsAgain) {
            $.ajax({
                url: 'toRegister',
                method: 'POST',
                data: { data: $('.register form').serialize() },
                success: (data) => {
                    console.log(1);
                    if (data === 'success') {
                        checkTool.removeAllLogo();
                        let div = $('<div class="revSection">注册成功<p><button class="toLoginBtn">立即登录</button></p></div>');
                        div.css({ padding: '6rem 3rem' });
                        div.find('.toLoginBtn').on('click', () => {
                            div.hide();
                            $('#lg').addClass('boxShadow').siblings().removeClass('boxShadow')
                            checkTool.toolbar($('.loginMain'), 0);
                        })
                        $('.register').append(div);
                    }
                    else {

                    }
                }
                ,
                fail: (err) => {
                    console.log(err);
                }
            })
        }
    })

    $('.register #email')
        .on('input', e => {
            boolEmail = checkTool.cEmail($(e.target).val())
            checkTool.showLogo($(e.target).val().length, boolEmail, '.glyphicon')
        })
        .siblings('#userPs')
        .on('input', e => {
            boolPs = checkTool.cPassword($(e.target).val());
            checkTool.showLogo($(e.target).val().length, boolPs, '.glyphiconPs')
        })
        .siblings('#confirPs')
        .on('input', e => {
            boolPsAgain = ($(e.target).val() === $(e.target).siblings('#userPs').val()) && boolPs;
            checkTool.showLogo($(e.target).val().length, boolPsAgain, '.glyphiconPsAgain')
        })

})