// 还款记录页 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const timeTabs = document.querySelectorAll('.time-tab');
    const datePicker = document.getElementById('date-picker');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const queryBtn = document.getElementById('query-btn');
    const historyListSection = document.querySelector('.history-list-section');
    const emptySection = document.getElementById('empty-section');
    const statsSection = document.querySelector('.stats-section');
    
    let currentPeriod = '3months';
    
    // 初始化页面
    function initPage() {
        console.log('还款记录页面已加载');
        
        // 设置默认日期
        setDefaultDates();
        
        // 加载默认数据
        loadRepaymentHistory(currentPeriod);
    }
    
    // 设置默认日期
    function setDefaultDates() {
        const today = new Date();
        const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
        
        endDateInput.value = formatDate(today);
        startDateInput.value = formatDate(threeMonthsAgo);
    }
    
    // 格式化日期
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // 时间选项卡点击事件
    timeTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const period = this.dataset.period;
            
            // 更新选中状态
            timeTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            currentPeriod = period;
            
            // 始终显示日期选择器，但根据选择更新日期范围
            if (period === 'custom') {
                // 自定义日期，保持当前日期不变
                datePicker.style.display = 'block';
            } else {
                // 预设时间段，自动更新日期范围
                datePicker.style.display = 'block';
                updateDateRange(period);
                loadRepaymentHistory(period);
            }
        });
    });
    
    // 更新日期范围
    function updateDateRange(period) {
        const today = new Date();
        let startDate;
        
        switch(period) {
            case '3months':
                startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
                break;
            case '6months':
                startDate = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
                break;
            case '1year':
                startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
                break;
            default:
                return;
        }
        
        startDateInput.value = formatDate(startDate);
        endDateInput.value = formatDate(today);
    }
    
    // 查询按钮点击事件
    queryBtn.addEventListener('click', function() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        if (!startDate || !endDate) {
            alert('请选择查询日期范围');
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            alert('开始日期不能大于结束日期');
            return;
        }
        
        // 检查日期范围是否超过1年
        const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 365) {
            alert('查询时间范围不能超过1年');
            return;
        }
        
        loadRepaymentHistory('custom', startDate, endDate);
    });
    
    // 加载还款记录数据
    function loadRepaymentHistory(period, startDate = null, endDate = null) {
        console.log('加载还款记录:', period, startDate, endDate);
        
        // 显示加载状态
        showLoadingState();
        
        // 模拟API调用
        setTimeout(() => {
            hideLoadingState();
            
            // 模拟数据
            const mockData = generateMockData(period, startDate, endDate);
            
            if (mockData.length === 0) {
                showEmptyState();
            } else {
                showHistoryList(mockData);
            }
            
            updateStatsText(mockData.length);
        }, 800);
    }
    
    // 生成模拟数据
    function generateMockData(period, startDate, endDate) {
        // 根据选择的时间段生成不同数量的数据
        const dataCount = {
            '3months': 3,
            '6months': 5,
            '1year': 8,
            'custom': 2
        };
        
        const count = dataCount[period] || 2;
        const data = [];
        
        for (let i = 0; i < count; i++) {
            data.push({
                date: '2020-03-25',
                year: '2020',
                monthDay: '03-25',
                amount: 2034.32,
                principal: 2000.00,
                interest: 34.32,
                status: '已还金额(元)'
            });
        }
        
        return data;
    }
    
    // 显示加载状态
    function showLoadingState() {
        historyListSection.classList.add('loading');
        emptySection.style.display = 'none';
    }
    
    // 隐藏加载状态
    function hideLoadingState() {
        historyListSection.classList.remove('loading');
    }
    
    // 显示空状态
    function showEmptyState() {
        historyListSection.style.display = 'none';
        emptySection.style.display = 'block';
        emptySection.classList.add('fade-in');
    }
    
    // 显示记录列表
    function showHistoryList(data) {
        emptySection.style.display = 'none';
        historyListSection.style.display = 'block';
        
        // 更新记录列表
        updateHistoryList(data);
    }
    
    // 更新记录列表
    function updateHistoryList(data) {
        if (!data || data.length === 0) return;
        
        // 清空现有内容
        historyListSection.innerHTML = '';
        
        // 生成记录项
        data.forEach((item, index) => {
            const historyItem = createHistoryItem(item, index);
            historyListSection.appendChild(historyItem);
        });
        
        // 添加淡入动画
        historyListSection.classList.add('fade-in');
        setTimeout(() => {
            historyListSection.classList.remove('fade-in');
        }, 300);
    }
    
    // 创建记录项
    function createHistoryItem(data, index) {
        const div = document.createElement('div');
        div.className = 'history-item';
        
        div.innerHTML = `
            <div class="history-date">
                <div class="date-year">${data.year}</div>
                <div class="date-month-day">${data.monthDay}</div>
            </div>
            <div class="history-details">
                <div class="history-amount">￥ ${formatAmount(data.amount)}</div>
                <div class="history-status">${data.status}</div>
                <div class="history-breakdown">
                    <span class="breakdown-item">本金：${formatAmount(data.principal)}</span>
                    <span class="breakdown-item">利息：${formatAmount(data.interest)}</span>
                </div>
            </div>
        `;
        
        return div;
    }
    
    // 格式化金额
    function formatAmount(amount) {
        if (typeof amount === 'number') {
            return amount.toLocaleString('zh-CN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }
        return amount;
    }
    
    // 更新统计文字
    function updateStatsText(count) {
        const statsText = document.querySelector('.stats-text');
        if (statsText) {
            statsText.textContent = `共 ${count} 条记录`;
        }
    }
    
    // 日期输入验证
    startDateInput.addEventListener('change', validateDateRange);
    endDateInput.addEventListener('change', validateDateRange);
    
    function validateDateRange() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        if (startDate && endDate) {
            if (new Date(startDate) > new Date(endDate)) {
                endDateInput.value = startDate;
            }
        }
    }
    
    // 添加点击事件监听（如果需要查看详情）
    function addClickListeners() {
        historyListSection.addEventListener('click', function(e) {
            const historyItem = e.target.closest('.history-item');
            if (historyItem) {
                const amount = historyItem.querySelector('.history-amount').textContent;
                const date = historyItem.querySelector('.date-year').textContent + '-' + 
                           historyItem.querySelector('.date-month-day').textContent;
                
                console.log(`点击了还款记录: ${date}, 金额: ${amount}`);
                // 这里可以添加详情查看逻辑
            }
        });
    }
    
    // 初始化页面
    initPage();
    addClickListeners();
});
