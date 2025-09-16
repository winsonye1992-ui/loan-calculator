// 结果页 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const loadingSection = document.getElementById('loading-section');
    const successSection = document.getElementById('success-section');
    const completeBtn = document.getElementById('complete-btn');
    
    // 模拟加载到成功的过程
    function showLoadingProcess() {
        // 显示加载状态
        loadingSection.style.display = 'flex';
        successSection.style.display = 'none';
        
        // 3秒后切换到成功状态
        setTimeout(() => {
            showSuccessState();
        }, 3000);
    }
    
    // 显示成功状态
    function showSuccessState() {
        // 淡出加载状态
        loadingSection.classList.add('fade-out');
        
        setTimeout(() => {
            loadingSection.style.display = 'none';
            loadingSection.classList.remove('fade-out');
            
            // 淡入成功状态
            successSection.style.display = 'flex';
            successSection.classList.add('fade-in');
            
            // 清理动画类
            setTimeout(() => {
                successSection.classList.remove('fade-in');
            }, 500);
        }, 300);
    }
    
    // 完成按钮点击事件
    completeBtn.addEventListener('click', function() {
        console.log('用户点击完成按钮');
        // 这里可以添加返回首页或其他页面的逻辑
        alert('操作完成！');
    });
    
    // 页面加载时开始流程
    showLoadingProcess();
    
    // 可以通过URL参数控制直接显示成功状态（用于调试）
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('state') === 'success') {
        loadingSection.style.display = 'none';
        successSection.style.display = 'flex';
    }
});
