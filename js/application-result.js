// 申请结果页面交互逻辑

document.addEventListener('DOMContentLoaded', function() {
    const confirmBtn = document.getElementById('confirm-btn');

    // 监听确认按钮点击
    confirmBtn.addEventListener('click', function() {
        // 直接跳转到产品详情页面
        window.location.href = 'product-detail.html';
    });
});
