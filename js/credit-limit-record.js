// 授信额度记录页面交互逻辑

document.addEventListener('DOMContentLoaded', function() {
    // 获取所有的去借钱按钮
    const borrowButtons = document.querySelectorAll('.credit-btn.btn-active');

    // 为每个去借钱按钮添加点击事件
    borrowButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            // 跳转到借款申请页面
            console.log('用户点击去借钱，即将跳转到借款页面');
            window.location.href = 'loan-application.html';
        });
    });

    // 可以添加其他交互逻辑，比如下拉刷新、上拉加载更多等
    console.log('授信额度记录页面已加载');
});
