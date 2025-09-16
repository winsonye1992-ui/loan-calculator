// 预审批记录页面JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 获取选项卡元素
    const tabItems = document.querySelectorAll('.top-tabs-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // 选项卡切换功能
    tabItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            // 移除所有活动状态
            tabItems.forEach(tab => tab.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 添加当前活动状态
            this.classList.add('active');
            tabContents[index].classList.add('active');
            
            // 更新指示器
            const indicators = document.querySelectorAll('.indicator');
            indicators.forEach(indicator => {
                indicator.remove();
            });
            
            // 为当前活动选项卡添加指示器
            const indicator = document.createElement('div');
            indicator.className = 'indicator';
            indicator.innerHTML = '<img src="../src/assets/images/tab_on.png" class="tab_on_img">';
            this.appendChild(indicator);
        });
    });
});
