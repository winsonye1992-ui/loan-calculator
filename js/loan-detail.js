// 借款记录详情页 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const prepayBtn = document.getElementById('prepay-btn');
    const returnBtn = document.getElementById('return-btn');
    
    // 提前还款按钮点击事件
    prepayBtn.addEventListener('click', function() {
        console.log('点击提前还款');
        // 这里可以跳转到提前还款页面
        alert('即将跳转到提前还款页面');
    });
    
    // 返回按钮点击事件
    returnBtn.addEventListener('click', function() {
        console.log('点击返回');
        // 这里可以返回上一页或借款记录列表
        if (window.history.length > 1) {
            window.history.back();
        } else {
            alert('返回借款记录列表');
        }
    });
    
    // 可点击项的事件处理
    const clickableItems = document.querySelectorAll('.info-item.clickable');
    clickableItems.forEach(item => {
        item.addEventListener('click', function() {
            const label = this.querySelector('.info-label').textContent;
            console.log('点击了：' + label);
            
            switch(label) {
                case '授信合同':
                    handleContractView('授信合同');
                    break;
                case '抵押合同':
                    handleContractView('抵押合同');
                    break;
                case '还款计划':
                    handleRepaymentPlan();
                    break;
                case '还款记录':
                    handleRepaymentHistory();
                    break;
                default:
                    console.log('未处理的点击项：' + label);
            }
        });
    });
    
    // 处理合同查看
    function handleContractView(contractType) {
        console.log('查看合同：' + contractType);
        // 这里可以调用PDF预览或下载功能
        alert('正在加载' + contractType + '...');
    }
    
    // 处理还款计划查看
    function handleRepaymentPlan() {
        console.log('查看还款计划');
        // 这里可以跳转到还款计划页面
        alert('即将跳转到还款计划页面');
    }
    
    // 处理还款记录查看
    function handleRepaymentHistory() {
        console.log('查看还款记录');
        // 这里可以跳转到还款记录页面
        alert('即将跳转到还款记录页面');
    }
    
    // 添加触觉反馈（如果支持）
    function addHapticFeedback() {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    }
    
    // 为所有可点击项添加触觉反馈
    clickableItems.forEach(item => {
        item.addEventListener('click', addHapticFeedback);
    });
    
    // 按钮点击添加触觉反馈
    [prepayBtn, returnBtn].forEach(btn => {
        btn.addEventListener('click', addHapticFeedback);
    });
    
    // 页面加载完成后的初始化
    function initPage() {
        console.log('借款记录详情页面已加载');
        
        // 可以在这里添加数据加载逻辑
        // loadLoanDetails();
    }
    
    // 模拟数据加载（如果需要从API获取数据）
    function loadLoanDetails() {
        console.log('正在加载借款详情数据...');
        
        // 模拟API调用
        setTimeout(() => {
            console.log('借款详情数据加载完成');
            // 这里可以更新页面数据
        }, 1000);
    }
    
    // 初始化页面
    initPage();
});
