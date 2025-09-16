// 还款计划页 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    function initPage() {
        console.log('还款计划页面已加载');
        
        // 可以在这里添加数据加载逻辑
        loadRepaymentPlan();
    }
    
    // 模拟加载还款计划数据
    function loadRepaymentPlan() {
        console.log('正在加载还款计划数据...');
        
        // 显示加载状态
        showLoadingState();
        
        // 模拟API调用
        setTimeout(() => {
            hideLoadingState();
            console.log('还款计划数据加载完成');
            
            // 这里可以动态更新页面数据
            // updateRepaymentPlan(data);
        }, 1000);
    }
    
    // 显示加载状态
    function showLoadingState() {
        const planSection = document.querySelector('.plan-list-section');
        if (planSection) {
            planSection.classList.add('loading');
        }
    }
    
    // 隐藏加载状态
    function hideLoadingState() {
        const planSection = document.querySelector('.plan-list-section');
        if (planSection) {
            planSection.classList.remove('loading');
        }
    }
    
    // 更新还款计划数据（动态生成）
    function updateRepaymentPlan(data) {
        const planSection = document.querySelector('.plan-list-section');
        if (!planSection || !data) return;
        
        // 清空现有内容
        planSection.innerHTML = '';
        
        // 动态生成还款计划项
        data.forEach((item, index) => {
            const planItem = createPlanItem(item, index);
            planSection.appendChild(planItem);
        });
    }
    
    // 创建还款计划项
    function createPlanItem(data, index) {
        const div = document.createElement('div');
        div.className = 'plan-item';
        
        // 根据状态添加特殊类名
        if (data.status === 'completed') {
            div.classList.add('completed');
        } else if (data.status === 'overdue') {
            div.classList.add('overdue');
        }
        
        div.innerHTML = `
            <div class="plan-date">
                <div class="date-year">${data.year}</div>
                <div class="date-month-day">${data.monthDay}</div>
            </div>
            <div class="plan-details">
                <div class="plan-amount">￥ ${formatAmount(data.totalAmount)}</div>
                <div class="plan-status">${data.statusText}</div>
                <div class="plan-breakdown">
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
    
    // 更新概要信息
    function updateSummaryInfo(remainingPeriods, remainingAmount) {
        const summaryText = document.querySelector('.summary-text');
        if (summaryText) {
            summaryText.innerHTML = `
                剩余应还期数<span class="highlight-number">${remainingPeriods}期</span>，
                剩余应还本金￥<span class="highlight-amount">${formatAmount(remainingAmount)}</span>
            `;
        }
    }
    
    // 处理空状态
    function showEmptyState() {
        const planSection = document.querySelector('.plan-list-section');
        if (planSection) {
            planSection.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                        </svg>
                    </div>
                    <div class="empty-state-text">暂无还款计划</div>
                    <div class="empty-state-hint">还款计划将在贷款生效后显示</div>
                </div>
            `;
        }
    }
    
    // 监听页面滚动（如果需要无限滚动）
    function handleScroll() {
        const scrollContainer = document.querySelector('.scrollable-main-content');
        if (!scrollContainer) return;
        
        scrollContainer.addEventListener('scroll', () => {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
            
            // 检查是否滚动到底部
            if (scrollTop + clientHeight >= scrollHeight - 10) {
                console.log('滚动到底部，可以加载更多数据');
                // loadMoreData();
            }
        });
    }
    
    // 添加点击事件监听（如果需要点击查看详情）
    function addClickListeners() {
        const planItems = document.querySelectorAll('.plan-item');
        planItems.forEach(item => {
            item.addEventListener('click', function() {
                const year = this.querySelector('.date-year').textContent;
                const monthDay = this.querySelector('.date-month-day').textContent;
                const amount = this.querySelector('.plan-amount').textContent;
                
                console.log(`点击了还款计划项: ${year}-${monthDay}, 金额: ${amount}`);
                
                // 这里可以添加详情查看逻辑
                // showPlanDetail(planData);
            });
        });
    }
    
    // 示例数据（用于测试）
    const sampleData = [
        {
            year: '2020',
            monthDay: '03-25',
            totalAmount: 2034.32,
            principal: 2000.00,
            interest: 34.32,
            statusText: '应还金额(元)',
            status: 'pending'
        },
        {
            year: '2020',
            monthDay: '04-25',
            totalAmount: 2034.32,
            principal: 2000.00,
            interest: 34.32,
            statusText: '应还金额(元)',
            status: 'pending'
        }
        // 更多数据...
    ];
    
    // 初始化页面
    initPage();
    handleScroll();
    addClickListeners();
    
    // 可以通过URL参数控制显示不同状态（用于调试）
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('empty') === 'true') {
        showEmptyState();
    }
});
