/**
 * 存贷组合产品测算器 - 主页面逻辑
 */

class MainPage {
    constructor() {
        this.currentDeleteId = null;
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
            
            // 加载产品列表
            await this.loadProductList();
            
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

        // 添加新产品按钮
        document.getElementById('addProductBtn').addEventListener('click', () => {
            this.goToAddProduct();
        });

        // 空状态添加新产品按钮
        document.getElementById('addProductBtnEmpty').addEventListener('click', () => {
            this.goToAddProduct();
        });

        // 汇总收益按钮
        document.getElementById('summaryBtn').addEventListener('click', () => {
            this.goToSummary();
        });

        // 删除确认弹窗
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
            this.hideDeleteDialog();
        });

        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            this.confirmDelete();
        });

        // 帮助弹窗（保留，因为HTML中还有帮助弹窗）
        document.getElementById('closeHelpBtn').addEventListener('click', () => {
            this.hideHelp();
        });
    }

    /**
     * 加载产品列表
     */
    async loadProductList() {
        try {
            const productList = document.getElementById('productList');
            const emptyState = document.getElementById('emptyState');
            const productCount = document.getElementById('productCount');

            // 显示加载状态
            productList.innerHTML = '<div class="loading">加载中...</div>';

            // 获取产品数据
            const products = await window.productDB.getAllProducts();
            
            // 更新产品数量
            productCount.textContent = `共 ${products.length} 个产品`;

            if (products.length === 0) {
                // 显示空状态
                productList.style.display = 'none';
                emptyState.style.display = 'block';
                return;
            }

            // 隐藏空状态
            emptyState.style.display = 'none';
            productList.style.display = 'block';

            // 渲染产品列表
            productList.innerHTML = products.map(product => this.renderProductItem(product)).join('');

            // 绑定产品项事件
            this.bindProductEvents();

        } catch (error) {
            console.error('加载产品列表失败:', error);
            this.showError('加载产品列表失败');
        }
    }

    /**
     * 渲染产品项
     */
    renderProductItem(product) {
        const typeText = this.getProductTypeText(product.type);
        const typeClass = this.getProductTypeClass(product.type);
        const income = this.getProductIncome(product);
        const details = this.getProductDetails(product);

        return `
            <div class="product-item" data-id="${product.id}">
                <!-- 默认状态：一行显示 -->
                <div class="product-row">
                    <div class="product-info-group">
                        <div class="product-name">${product.name}</div>
                        <div class="product-type ${typeClass}">${typeText}</div>
                    </div>
                    <div class="product-income">
                        <div class="income-amount ${this.getIncomeClass(income)}">${this.formatIncomeWithSign(income, product)}</div>
                    </div>
                    <div class="product-expand">
                        <img src="../src/assets/icons/arrow-down.svg" alt="展开" class="expand-icon" data-action="expand" data-id="${product.id}">
                    </div>
                </div>
                
                <!-- 展开状态：详细信息 -->
                <div class="product-details" id="details-${product.id}">
                    <div class="detail-grid">
                        ${details}
                    </div>
                    <div class="product-actions">
                        <button class="action-btn danger" data-action="delete" data-id="${product.id}">删除</button>
                        <button class="action-btn" data-action="edit" data-id="${product.id}">编辑</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 获取产品类型文本
     */
    getProductTypeText(type) {
        const typeMap = {
            'deposit': '存款',
            'loan': '贷款',
            'foreign_spot': '外汇-即期',
            'foreign_forward': '外汇-远期',
            'foreign_swap': '外汇-掉期'
        };
        return typeMap[type] || '未知';
    }

    /**
     * 获取产品类型样式类
     */
    getProductTypeClass(type) {
        if (type.startsWith('foreign')) {
            return 'foreign';
        }
        return type;
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
     * 获取收益样式类
     */
    getIncomeClass(income) {
        const amount = parseFloat(income);
        if (amount > 0) {
            return 'positive';
        } else if (amount < 0) {
            return 'negative';
        }
        return '';
    }

    /**
     * 获取产品币种
     */
    getProductCurrency(product) {
        switch (product.type) {
            case 'deposit':
            case 'loan':
                return product.currency || 'CNY';
            case 'foreign_spot':
            case 'foreign_forward':
                return product.buyCurrency || 'CNY';
            case 'foreign_swap':
                // 掉期交易通常以近端买入币种作为收益币种
                return product.nearBuyCurrency || 'CNY';
            default:
                return 'CNY';
        }
    }

    /**
     * 格式化收益金额并添加符号和币种
     */
    formatIncomeWithSign(income, product) {
        const amount = parseFloat(income);
        const formattedAmount = this.formatAmount(Math.abs(amount));
        const currency = this.getProductCurrency(product);
        
        if (amount > 0) {
            return `+${formattedAmount} ${currency}`;
        } else if (amount < 0) {
            return `-${formattedAmount} ${currency}`;
        }
        return `${formattedAmount} ${currency}`;
    }

    /**
     * 获取产品详情
     */
    getProductDetails(product) {
        let details = '';

        switch (product.type) {
            case 'deposit':
            case 'loan':
                details = `
                    <div class="detail-item">
                        <div class="detail-label">币种</div>
                        <div class="detail-value">${product.currency}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">金额</div>
                        <div class="detail-value">${this.formatAmount(product.amount)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">利率</div>
                        <div class="detail-value">${product.rate}%</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">期限</div>
                        <div class="detail-value">${this.formatPeriodDisplay(product.period, product.periodUnit)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">利息</div>
                        <div class="detail-value">${this.formatAmount(product.interest)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">本息</div>
                        <div class="detail-value">${this.formatAmount(product.principal)}</div>
                    </div>
                `;
                break;

            case 'foreign_spot':
            case 'foreign_forward':
                details = `
                    <div class="detail-item">
                        <div class="detail-label">卖出币种</div>
                        <div class="detail-value">${product.sellCurrency}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">买入币种</div>
                        <div class="detail-value">${product.buyCurrency}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">卖出金额</div>
                        <div class="detail-value">${this.formatAmount(product.sellAmount)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">汇率</div>
                        <div class="detail-value">${product.exchangeRate}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">买入金额</div>
                        <div class="detail-value">${this.formatAmount(product.buyAmount)}</div>
                    </div>
                `;
                break;

            case 'foreign_swap':
                details = `
                    <div class="detail-item">
                        <div class="detail-label">近端卖出币种</div>
                        <div class="detail-value">${product.nearSellCurrency}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">近端买入币种</div>
                        <div class="detail-value">${product.nearBuyCurrency}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">近端卖出金额</div>
                        <div class="detail-value">${this.formatAmount(product.nearSellAmount)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">近端汇率</div>
                        <div class="detail-value">${product.nearRate}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">远端卖出币种</div>
                        <div class="detail-value">${product.farSellCurrency}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">远端买入币种</div>
                        <div class="detail-value">${product.farBuyCurrency}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">远端汇率</div>
                        <div class="detail-value">${product.farRate}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">期末收益</div>
                        <div class="detail-value">${this.formatAmount(product.finalIncome)}</div>
                    </div>
                `;
                break;
        }

        // 添加手续费信息
        if (product.feeAmount && product.feeAmount > 0) {
            details += `
                <div class="detail-item">
                    <div class="detail-label">手续费币种</div>
                    <div class="detail-value">${product.feeCurrency}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">手续费金额</div>
                    <div class="detail-value">${this.formatAmount(product.feeAmount)}</div>
                </div>
            `;
        }

        return details;
    }

    /**
     * 绑定产品项事件
     */
    bindProductEvents() {
        // 产品行点击展开/收起
        document.querySelectorAll('.product-row').forEach(row => {
            row.addEventListener('click', (e) => {
                // 如果点击的是展开图标，不重复触发
                if (e.target.closest('[data-action="expand"]')) {
                    return;
                }
                const productId = row.closest('.product-item').dataset.id;
                this.toggleProductDetails(productId);
            });
        });

        // 展开/收起按钮
        document.querySelectorAll('[data-action="expand"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡
                const productId = e.target.dataset.id;
                this.toggleProductDetails(productId);
            });
        });

        // 编辑按钮
        document.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡
                const productId = e.target.dataset.id;
                this.editProduct(productId);
            });
        });

        // 删除按钮
        document.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止事件冒泡
                const productId = e.target.dataset.id;
                this.showDeleteDialog(productId);
            });
        });
    }

    /**
     * 切换产品详情显示
     */
    toggleProductDetails(productId) {
        const detailsElement = document.getElementById(`details-${productId}`);
        const expandIcon = document.querySelector(`[data-action="expand"][data-id="${productId}"]`);
        const productItem = document.querySelector(`[data-id="${productId}"]`);
        
        if (detailsElement.classList.contains('show')) {
            detailsElement.classList.remove('show');
            productItem.classList.remove('expanded');
            expandIcon.style.transform = 'rotate(0deg)';
        } else {
            detailsElement.classList.add('show');
            productItem.classList.add('expanded');
            expandIcon.style.transform = 'rotate(180deg)';
        }
    }

    /**
     * 编辑产品
     */
    editProduct(productId) {
        // 跳转到编辑页面
        window.location.href = `edit-product.html?id=${productId}`;
    }

    /**
     * 删除产品
     */
    async deleteProduct(productId) {
        try {
            await window.productDB.deleteProduct(parseInt(productId));
            this.showSuccess('产品删除成功');
            await this.loadProductList();
        } catch (error) {
            console.error('删除产品失败:', error);
            this.showError('删除产品失败');
        }
    }

    /**
     * 显示删除确认弹窗
     */
    showDeleteDialog(productId) {
        this.currentDeleteId = productId;
        document.getElementById('deleteMask').style.display = 'flex';
    }

    /**
     * 隐藏删除确认弹窗
     */
    hideDeleteDialog() {
        document.getElementById('deleteMask').style.display = 'none';
        this.currentDeleteId = null;
    }

    /**
     * 确认删除
     */
    async confirmDelete() {
        if (this.currentDeleteId) {
            await this.deleteProduct(this.currentDeleteId);
            this.hideDeleteDialog();
        }
    }

    /**
     * 跳转到首页
     */
    async goHome() {
        try {
            // 清理 IndexedDB 中的所有产品数据
            await window.productDB.clearAllProducts();
            console.log('所有产品数据已清理');
        } catch (error) {
            console.error('清理数据失败:', error);
        }
        
        // 刷新页面（如果当前页面就是 index.html，则刷新；否则跳转到 index.html）
        if (window.location.pathname.includes('index.html')) {
            window.location.reload();
        } else {
            window.location.href = 'index.html';
        }
    }

    /**
     * 显示帮助
     */
    showHelp() {
        document.getElementById('helpMask').style.display = 'flex';
    }

    /**
     * 隐藏帮助
     */
    hideHelp() {
        document.getElementById('helpMask').style.display = 'none';
    }

    /**
     * 跳转到添加产品页面
     */
    goToAddProduct() {
        window.location.href = 'add-product.html';
    }

    /**
     * 跳转到汇总收益页面
     */
    goToSummary() {
        window.location.href = 'summary.html';
    }

    /**
     * 返回上一页
     */
    goBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // 如果没有历史记录，跳转到首页或其他页面
            window.location.href = '../src/components/iphone-preview.html';
        }
    }

    /**
     * 格式化金额
     */
    formatAmount(amount) {
        if (amount === null || amount === undefined) {
            return '0.00';
        }
        return parseFloat(amount).toFixed(2);
    }

    /**
     * 获取期限单位显示文本
     */
    getPeriodUnitDisplayText(unit) {
        const unitMap = {
            'year': '年',
            'month': '月',
            'day': '日'
        };
        return unitMap[unit] || '年'; // 默认为年
    }

    /**
     * 格式化期限显示
     */
    formatPeriodDisplay(period, periodUnit) {
        const unit = this.getPeriodUnitDisplayText(periodUnit);
        return `${period}${unit}`;
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
        
        const container = document.querySelector('.product-list-container');
        container.insertBefore(messageElement, container.firstChild);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 3000);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new MainPage();
});
