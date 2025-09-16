/**
 * 存贷组合产品测算器 - 汇总收益页面逻辑
 */

class SummaryPage {
    constructor() {
        this.products = [];
        this.currencyIncomes = {};
        this.exchangeRates = {};
        this.init();
    }

    /**
     * 初始化页面
     */
    async init() {
        try {
            // 初始化数据库
            await window.productDB.init();
            
            // 绑定事件
            this.bindEvents();
            
            // 加载产品数据并计算收益
            await this.loadAndCalculate();
            
        } catch (error) {
            console.error('页面初始化失败:', error);
            this.showError('页面初始化失败，请刷新重试');
        }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 返回按钮
        document.getElementById('backBtn').addEventListener('click', () => {
            this.goBack();
        });

        // 首页按钮
        document.getElementById('homeBtn').addEventListener('click', () => {
            this.goHome();
        });
    }

    /**
     * 加载产品数据并计算收益
     */
    async loadAndCalculate() {
        try {
            // 显示加载状态
            this.showLoading();
            
            // 获取所有产品
            this.products = await window.productDB.getAllProducts();
            
            // 计算各币种收益
            this.calculateCurrencyIncomes();
            
            // 渲染币种收益列表
            this.renderCurrencyList();
            
            // 计算人民币汇总收益
            this.calculateCNYSummary();
            
            // 隐藏加载状态
            this.hideLoading();
            
        } catch (error) {
            console.error('加载数据失败:', error);
            this.showError('加载数据失败');
            this.hideLoading();
        }
    }

    /**
     * 计算各币种收益
     */
    calculateCurrencyIncomes() {
        this.currencyIncomes = {};
        
        this.products.forEach(product => {
            const income = this.getProductIncome(product);
            const currency = this.getProductCurrency(product);
            
            if (!this.currencyIncomes[currency]) {
                this.currencyIncomes[currency] = {
                    income: 0,
                    total: 0
                };
            }
            
            // 计算收益（已包含手续费）
            this.currencyIncomes[currency].income += income;
            this.currencyIncomes[currency].total = this.currencyIncomes[currency].income;
        });
    }

    /**
     * 获取产品收益
     */
    getProductIncome(product) {
        // 获取手续费金额，如果没有录入则为0
        const feeAmount = parseFloat(product.feeAmount) || 0;
        
        switch (product.type) {
            case 'deposit':
                // 存款收益 = 利息 - 手续费
                return (product.interest || 0) - feeAmount;
            case 'loan':
                // 贷款收益 = -(利息 + 手续费)，贷款是支出
                return -((product.interest || 0) + feeAmount);
            case 'foreign_swap':
                // 掉期收益 = 期末收益 - 手续费
                return (product.finalIncome || 0) - feeAmount;
            case 'foreign_spot':
            case 'foreign_forward':
                // 即期/远期交易通常没有直接收益，但可能有手续费支出
                return -feeAmount;
            default:
                return 0;
        }
    }

    /**
     * 获取产品币种
     */
    getProductCurrency(product) {
        switch (product.type) {
            case 'deposit':
            case 'loan':
                return product.currency;
            case 'foreign_spot':
            case 'foreign_forward':
                return product.buyCurrency; // 以买入币种为准
            case 'foreign_swap':
                return product.nearBuyCurrency; // 以近端买入币种为准
            default:
                return 'CNY';
        }
    }



    /**
     * 渲染币种收益列表
     */
    renderCurrencyList() {
        const currencyList = document.getElementById('currencyList');
        const emptyState = document.getElementById('emptyState');
        
        if (Object.keys(this.currencyIncomes).length === 0) {
            currencyList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        currencyList.style.display = 'block';
        
        const currencyItems = Object.entries(this.currencyIncomes)
            .filter(([currency, data]) => data.total !== 0) // 只显示非零收益
            .map(([currency, data]) => this.renderCurrencyItem(currency, data))
            .join('');
        
        currencyList.innerHTML = currencyItems;
        
        // 绑定汇率输入事件
        this.bindRateInputEvents();
    }

    /**
     * 渲染币种收益项
     */
    renderCurrencyItem(currency, data) {
        const currencyName = this.getCurrencyName(currency);
        const incomeClass = this.getIncomeClass(data.total);
        const isCNY = currency === 'CNY';
        const hasRate = this.exchangeRates[currency] && this.exchangeRates[currency] > 0;
        const cnyConverted = hasRate ? data.total * this.exchangeRates[currency] : (isCNY ? data.total : 0);
        
        return `
            <div class="currency-item ${hasRate ? 'has-rate' : 'no-rate'}" data-currency="${currency}">
                <div class="currency-header">
                    <div class="currency-info">
                        <div class="currency-name">${currencyName}</div>
                    </div>
                    <div class="currency-income">
                        <div class="income-amount ${incomeClass}">${this.formatAmountWithSign(data.total)} ${currency}</div>
                        ${!isCNY && hasRate ? `
                            <div class="income-label">≈ ${this.formatCNYAmountWithSign(cnyConverted)}</div>
                        ` : ''}
                    </div>
                </div>
                
                ${!isCNY ? `
                    <div class="exchange-rate-section">
                        <div class="rate-input-group">
                            <div class="rate-label">汇率</div>
                            <input type="number" 
                                   class="rate-input" 
                                   data-currency="${currency}"
                                   placeholder="请输入${currency}对人民币汇率"
                                   step="0.01" 
                                   min="0.01" 
                                   max="9999.99"
                                   value="${this.exchangeRates[currency] || ''}">
                        </div>
                        <div class="rate-error" data-currency="${currency}" style="display: none;"></div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * 获取币种名称
     */
    getCurrencyName(currency) {
        const currencyNames = {
            'CNY': '人民币',
            'USD': '美元',
            'EUR': '欧元',
            'GBP': '英镑',
            'HKD': '港币',
            'JPY': '日元',
            'AUD': '澳元',
            'CAD': '加元',
            'SGD': '新加坡元',
            'CHF': '瑞士法郎'
        };
        return currencyNames[currency] || currency;
    }

    /**
     * 获取收益样式类
     */
    getIncomeClass(amount) {
        if (amount > 0) return 'positive';
        if (amount < 0) return 'negative';
        return 'zero';
    }

    /**
     * 绑定汇率输入事件
     */
    bindRateInputEvents() {
        // 先移除所有现有的事件监听器
        document.querySelectorAll('.rate-input').forEach(input => {
            input.removeEventListener('input', this.handleRateInput);
            input.removeEventListener('blur', this.handleRateBlur);
        });
        
        // 重新绑定事件监听器
        document.querySelectorAll('.rate-input').forEach(input => {
            input.addEventListener('input', this.handleRateInput.bind(this));
            input.addEventListener('blur', this.handleRateBlur.bind(this));
        });
    }

    /**
     * 处理汇率输入事件
     */
    handleRateInput(e) {
        const currency = e.target.dataset.currency;
        const value = e.target.value;
        
        // 清除之前的定时器
        if (this.inputTimers && this.inputTimers[currency]) {
            clearTimeout(this.inputTimers[currency]);
        }
        
        // 初始化定时器对象
        if (!this.inputTimers) {
            this.inputTimers = {};
        }
        
        // 设置3秒延迟计算
        this.inputTimers[currency] = setTimeout(() => {
            const rate = parseFloat(value);
            this.onRateChange(currency, rate, e.target);
        }, 3000);
    }

    /**
     * 处理汇率失焦事件
     */
    handleRateBlur(e) {
        const currency = e.target.dataset.currency;
        const value = e.target.value;
        
        // 清除定时器
        if (this.inputTimers && this.inputTimers[currency]) {
            clearTimeout(this.inputTimers[currency]);
        }
        
        // 失焦时立即计算
        const rate = parseFloat(value);
        this.onRateChange(currency, rate, e.target);
        
        // 验证汇率
        this.validateRate(e.target);
    }

    /**
     * 汇率变化处理
     */
    onRateChange(currency, rate, inputElement) {
        // 清除错误状态
        this.clearRateError(currency);
        
        // 更新汇率
        if (rate && rate > 0) {
            this.exchangeRates[currency] = rate;
        } else {
            delete this.exchangeRates[currency];
        }
        
        // 更新汇率转换显示
        this.updateRateConversionDisplay(currency);
        
        // 重新计算人民币汇总
        this.calculateCNYSummary();
    }

    /**
     * 更新汇率转换显示
     */
    updateRateConversionDisplay(currency) {
        const currencyItem = document.querySelector(`[data-currency="${currency}"].currency-item`);
        if (!currencyItem || !this.currencyIncomes[currency]) {
            return;
        }
        
        const incomeElement = currencyItem.querySelector('.currency-income');
        const data = this.currencyIncomes[currency];
        const rate = this.exchangeRates[currency];
        
        if (rate && rate > 0) {
            const cnyConverted = data.total * rate;
            const incomeLabel = incomeElement.querySelector('.income-label');
            
            if (incomeLabel) {
                incomeLabel.textContent = `≈ ${this.formatCNYAmountWithSign(cnyConverted)}`;
            } else {
                const newLabel = document.createElement('div');
                newLabel.className = 'income-label';
                newLabel.textContent = `≈ ${this.formatCNYAmountWithSign(cnyConverted)}`;
                incomeElement.appendChild(newLabel);
            }
        } else {
            const incomeLabel = incomeElement.querySelector('.income-label');
            if (incomeLabel) {
                incomeLabel.remove();
            }
        }
    }

    /**
     * 验证汇率
     */
    validateRate(inputElement) {
        const currency = inputElement.dataset.currency;
        const rate = parseFloat(inputElement.value);
        
        if (inputElement.value && (!rate || rate <= 0)) {
            this.showRateError(currency, '汇率需为正数');
            inputElement.classList.add('error');
        } else if (rate && rate > 9999.99) {
            this.showRateError(currency, '汇率不能超过9999.99');
            inputElement.classList.add('error');
        } else {
            this.clearRateError(currency);
            inputElement.classList.remove('error');
        }
    }

    /**
     * 显示汇率错误
     */
    showRateError(currency, message) {
        const errorElement = document.querySelector(`[data-currency="${currency}"].rate-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    /**
     * 清除汇率错误
     */
    clearRateError(currency) {
        const errorElement = document.querySelector(`[data-currency="${currency}"].rate-error`);
        if (errorElement) {
            errorElement.style.display = 'none';
            errorElement.textContent = '';
        }
    }

    /**
     * 更新币种项
     */
    updateCurrencyItem(currency) {
        const currencyItem = document.querySelector(`[data-currency="${currency}"].currency-item`);
        if (currencyItem && this.currencyIncomes[currency]) {
            const newHtml = this.renderCurrencyItem(currency, this.currencyIncomes[currency]);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = newHtml;
            const newItem = tempDiv.firstElementChild;
            
            // 保持汇率输入框的值
            const oldInput = currencyItem.querySelector('.rate-input');
            const newInput = newItem.querySelector('.rate-input');
            if (oldInput && newInput) {
                newInput.value = oldInput.value;
            }
            
            currencyItem.outerHTML = newItem.outerHTML;
            
            // 重新绑定事件
            this.bindRateInputEvents();
        }
    }

    /**
     * 计算人民币汇总收益
     */
    calculateCNYSummary() {
        const cnyTotalAmount = document.getElementById('cnyTotalAmount');
        const cnyBreakdown = document.getElementById('cnyBreakdown');
        
        let totalCNY = 0;
        const breakdownItems = [];
        
        // 计算各币种的人民币等值
        Object.entries(this.currencyIncomes).forEach(([currency, data]) => {
            if (data.total !== 0) {
                if (currency === 'CNY') {
                    // 人民币直接计入总收益
                    totalCNY += data.total;
                    breakdownItems.push({
                        currency: currency,
                        amount: data.total
                    });
                } else {
                    // 其他币种需要汇率转换
                    const rate = this.exchangeRates[currency];
                    if (rate && rate > 0) {
                        const cnyAmount = data.total * rate;
                        totalCNY += cnyAmount;
                        breakdownItems.push({
                            currency: currency,
                            amount: cnyAmount
                        });
                    }
                }
            }
        });
        
        // 更新总金额
        cnyTotalAmount.textContent = this.formatCNYAmountWithSign(totalCNY);
        
        // 更新总金额的颜色样式
        cnyTotalAmount.className = 'cny-amount';
        if (totalCNY > 0) {
            cnyTotalAmount.classList.add('positive');
        } else if (totalCNY < 0) {
            cnyTotalAmount.classList.add('negative');
        } else {
            cnyTotalAmount.classList.add('zero');
        }
        
        // 更新明细
        if (breakdownItems.length > 0) {
            const breakdownHtml = breakdownItems
                .map(item => {
                    const amountClass = item.amount > 0 ? 'positive' : (item.amount < 0 ? 'negative' : 'zero');
                    return `
                        <div class="cny-breakdown-item">
                            <div class="breakdown-currency">${item.currency}</div>
                            <div class="breakdown-amount ${amountClass}">${this.formatCNYAmountWithSign(item.amount)}</div>
                        </div>
                    `;
                })
                .join('');
            cnyBreakdown.innerHTML = breakdownHtml;
        } else {
            cnyBreakdown.innerHTML = `
                <div class="cny-breakdown-item">
                    <div class="breakdown-currency">暂无数据</div>
                    <div class="breakdown-amount zero">0.00 CNY</div>
                </div>
            `;
        }
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        const currencyList = document.getElementById('currencyList');
        currencyList.innerHTML = '<div class="loading">计算收益中...</div>';
    }

    /**
     * 隐藏加载状态
     */
    hideLoading() {
        // 加载状态会在renderCurrencyList中被清除
    }

    /**
     * 格式化金额
     */
    formatAmount(amount) {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return '0.00';
        }
        return parseFloat(amount).toFixed(2);
    }

    /**
     * 格式化带符号的金额
     */
    formatAmountWithSign(amount) {
        const formatted = this.formatAmount(amount);
        if (amount > 0) {
            return `+${formatted}`;
        }
        return formatted;
    }

    /**
     * 格式化人民币金额
     */
    formatCNYAmount(amount) {
        const formatted = this.formatAmount(amount);
        return `${formatted} CNY`;
    }

    /**
     * 格式化带符号的人民币金额
     */
    formatCNYAmountWithSign(amount) {
        const formatted = this.formatAmount(amount);
        if (amount > 0) {
            return `+${formatted} CNY`;
        }
        return `${formatted} CNY`;
    }

    /**
     * 返回上一页
     */
    goBack() {
        window.location.href = 'index.html';
    }

    /**
     * 跳转到首页
     */
    goHome() {
        window.location.href = 'index.html';
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        this.showMessage(message, 'error');
    }

    /**
     * 显示成功信息
     */
    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    /**
     * 显示消息
     */
    showMessage(message, type) {
        const messageElement = document.createElement('div');
        messageElement.className = `${type}-message`;
        messageElement.textContent = message;
        
        const container = document.querySelector('.main-content');
        container.insertBefore(messageElement, container.firstChild);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 3000);
    }

    /**
     * 清理定时器
     */
    cleanup() {
        if (this.inputTimers) {
            Object.values(this.inputTimers).forEach(timer => {
                if (timer) {
                    clearTimeout(timer);
                }
            });
            this.inputTimers = {};
        }
    }
}

// 页面加载完成后初始化
let summaryPageInstance;

document.addEventListener('DOMContentLoaded', () => {
    summaryPageInstance = new SummaryPage();
});

// 页面卸载时清理定时器
window.addEventListener('beforeunload', () => {
    if (summaryPageInstance) {
        summaryPageInstance.cleanup();
    }
});
