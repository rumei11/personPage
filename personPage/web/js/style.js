$(document).ready(() => {
    let { checkTool } = Tools;
    checkTool.loginInit();
    $('.options span').on('click', (e) => {
        $(e.currentTarget).addClass('boxShadow').siblings().removeClass('boxShadow');
        checkTool.toolbar(e.currentTarget);
    })
    $('.invetNumb input').val('98ASCA8FAVIFD9H89');
    $('.toPic a').on('click', () => {
        checkTool.toolbar({}, 5);
        $('#picSs').addClass('boxShadow').siblings().removeClass('boxShadow')
    });
})