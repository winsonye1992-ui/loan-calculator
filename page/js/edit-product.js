/**
 * 存贷组合产品测算器 - 编辑产品页面逻辑
 */

class EditProductPage {
    constructor() {
        this.currentProductType = '';
        this.currentForeignType = '';
        this.currentProductId = null;
        this.init();
    }

    /**
     * 初始化页面
     */
    async init() {
        try {
            // 初始化数据库
            await window.productDB.init();
            
            // 获取产品ID
            this.currentProductId = this.getProductIdFromUrl();
            if (!this.currentProductId) {
                this.showError('产品ID无效');
                return;
            }
            
            // 加载产品数据
            await this.loadProductData();
            
            // 绑定事件
            this.bindEvents();
            
        } catch (error) {
            console.error('页面初始化失败:', error);
            this.showError('页面初始化失败，请刷新重试');
        }
    }

    /**
     * 从URL参数获取产品ID
     */
    getProductIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        return productId ? parseInt(productId) : null;
    }

    /**
     * 加载产品数据
     */
    async loadProductData() {
        try {
            const product = await window.productDB.getProductById(this.currentProductId);
            if (!product) {
                this.showError('产品不存在');
                return;
            }

            // 填充表单数据
            this.fillFormData(product);
            
        } catch (error) {
            console.error('加载产品数据失败:', error);
            this.showError('加载产品数据失败');
        }
    }

    /**
     * 获取产品类型显示文本
     */
    getProductTypeDisplayText(type) {
        const typeMap = {
            'deposit': '存款',
            'loan': '贷款',
            'foreign': '外汇'
        };
        return typeMap[type] || type;
    }

    /**
     * 获取币种显示文本
     */
    getCurrencyDisplayText(currency) {
        const currencyMap = {
            'CNY': 'CNY - 人民币',
            'USD': 'USD - 美元',
            'EUR': 'EUR - 欧元',
            'GBP': 'GBP - 英镑',
            'HKD': 'HKD - 港币',
            'JPY': 'JPY - 日元',
            'AUD': 'AUD - 澳元',
            'CAD': 'CAD - 加元',
            'SGD': 'SGD - 新加坡元',
            'CHF': 'CHF - 瑞士法郎'
        };
        return currencyMap[currency] || currency;
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
        return unitMap[unit] || unit;
    }

    /**
     * 获取外汇类型显示文本
     */
    getForeignTypeDisplayText(type) {
        const typeMap = {
            'foreign_spot': '即期',
            'foreign_forward': '远期',
            'foreign_swap': '掉期'
        };
        return typeMap[type] || type;
    }

    /**
     * 填充表单数据
     */
    fillFormData(product) {
        // 设置产品种类
        let productTypeForSelect = product.type;
        if (product.type === 'foreign_spot' || product.type === 'foreign_forward' || product.type === 'foreign_swap') {
            productTypeForSelect = 'foreign';
        }
        
        const productTypeField = document.getElementById('productType');
        productTypeField.value = this.getProductTypeDisplayText(productTypeForSelect);
        productTypeField.dataset.value = productTypeForSelect;
        this.currentProductType = productTypeForSelect;
        this.onProductTypeChange(productTypeForSelect);

        // 设置产品名称
        document.getElementById('productName').value = product.name;

        // 根据产品类型填充相应字段
        switch (product.type) {
            case 'deposit':
                this.fillDepositData(product);
                break;
            case 'loan':
                this.fillLoanData(product);
                break;
            case 'foreign_spot':
            case 'foreign_forward':
            case 'foreign_swap':
                this.fillForeignData(product);
                break;
        }
    }

    /**
     * 填充存款产品数据
     */
    fillDepositData(product) {
        const currencyField = document.getElementById('depositCurrency');
        currencyField.value = this.getCurrencyDisplayText(product.currency || 'CNY');
        currencyField.dataset.value = product.currency || 'CNY';
        
        document.getElementById('depositAmount').value = product.amount || '';
        document.getElementById('depositRate').value = product.rate || '';
        
        // 设置期限单位
        const periodUnitField = document.getElementById('depositPeriodUnit');
        periodUnitField.value = this.getPeriodUnitDisplayText(product.periodUnit || 'year');
        periodUnitField.dataset.value = product.periodUnit || 'year';
        
        document.getElementById('depositPeriod').value = product.period || '';
        document.getElementById('depositInterest').value = this.formatAmount(product.interest) || '';
        document.getElementById('depositPrincipal').value = this.formatAmount(product.principal) || '';
        
        const feeCurrencyField = document.getElementById('depositFeeCurrency');
        feeCurrencyField.value = this.getCurrencyDisplayText(product.feeCurrency || '');
        feeCurrencyField.dataset.value = product.feeCurrency || '';
        
        document.getElementById('depositFeeAmount').value = product.feeAmount || '';
    }

    /**
     * 填充贷款产品数据
     */
    fillLoanData(product) {
        const currencyField = document.getElementById('loanCurrency');
        currencyField.value = this.getCurrencyDisplayText(product.currency || 'CNY');
        currencyField.dataset.value = product.currency || 'CNY';
        
        document.getElementById('loanAmount').value = product.amount || '';
        document.getElementById('loanRate').value = product.rate || '';
        
        // 设置期限单位
        const periodUnitField = document.getElementById('loanPeriodUnit');
        periodUnitField.value = this.getPeriodUnitDisplayText(product.periodUnit || 'year');
        periodUnitField.dataset.value = product.periodUnit || 'year';
        
        document.getElementById('loanPeriod').value = product.period || '';
        document.getElementById('loanInterest').value = this.formatAmount(product.interest) || '';
        document.getElementById('loanPrincipal').value = this.formatAmount(product.principal) || '';
        
        const feeCurrencyField = document.getElementById('loanFeeCurrency');
        feeCurrencyField.value = this.getCurrencyDisplayText(product.feeCurrency || '');
        feeCurrencyField.dataset.value = product.feeCurrency || '';
        
        document.getElementById('loanFeeAmount').value = product.feeAmount || '';
    }

    /**
     * 填充外汇产品数据
     */
    fillForeignData(product) {
        // 设置外汇类型
        const foreignTypeField = document.getElementById('foreignType');
        foreignTypeField.value = this.getForeignTypeDisplayText(product.type);
        foreignTypeField.dataset.value = product.type;
        this.currentForeignType = product.type;
        this.onForeignTypeChange(product.type);

        if (product.type === 'foreign_swap') {
            // 掉期交易
            const nearSellCurrencyField = document.getElementById('nearSellCurrency');
            nearSellCurrencyField.value = this.getCurrencyDisplayText(product.nearSellCurrency || '');
            nearSellCurrencyField.dataset.value = product.nearSellCurrency || '';
            
            const nearBuyCurrencyField = document.getElementById('nearBuyCurrency');
            nearBuyCurrencyField.value = this.getCurrencyDisplayText(product.nearBuyCurrency || '');
            nearBuyCurrencyField.dataset.value = product.nearBuyCurrency || '';
            
            document.getElementById('nearSellAmount').value = product.nearSellAmount || '';
            document.getElementById('nearRate').value = product.nearRate || '';
            document.getElementById('nearBuyAmount').value = this.formatAmount(product.nearBuyAmount) || '';
            
            const farSellCurrencyField = document.getElementById('farSellCurrency');
            farSellCurrencyField.value = this.getCurrencyDisplayText(product.farSellCurrency || '');
            farSellCurrencyField.dataset.value = product.farSellCurrency || '';
            
            const farBuyCurrencyField = document.getElementById('farBuyCurrency');
            farBuyCurrencyField.value = this.getCurrencyDisplayText(product.farBuyCurrency || '');
            farBuyCurrencyField.dataset.value = product.farBuyCurrency || '';
            
            document.getElementById('farRate').value = product.farRate || '';
            document.getElementById('farBuyAmount').value = this.formatAmount(product.farBuyAmount) || '';
            document.getElementById('farSellAmount').value = this.formatAmount(product.farSellAmount) || '';
            document.getElementById('finalIncome').value = this.formatAmount(product.finalIncome) || '';
        } else {
            // 即期/远期交易
            const sellCurrencyField = document.getElementById('sellCurrency');
            sellCurrencyField.value = this.getCurrencyDisplayText(product.sellCurrency || '');
            sellCurrencyField.dataset.value = product.sellCurrency || '';
            
            const buyCurrencyField = document.getElementById('buyCurrency');
            buyCurrencyField.value = this.getCurrencyDisplayText(product.buyCurrency || '');
            buyCurrencyField.dataset.value = product.buyCurrency || '';
            
            document.getElementById('sellAmount').value = product.sellAmount || '';
            document.getElementById('exchangeRate').value = product.exchangeRate || '';
            document.getElementById('buyAmount').value = this.formatAmount(product.buyAmount) || '';
        }

        // 手续费
        const feeCurrencyField = document.getElementById('foreignFeeCurrency');
        if (product.feeCurrency) {
            feeCurrencyField.value = this.getCurrencyDisplayText(product.feeCurrency);
            feeCurrencyField.dataset.value = product.feeCurrency;
        } else {
            feeCurrencyField.value = '';
            feeCurrencyField.dataset.value = '';
        }
        document.getElementById('foreignFeeAmount').value = product.feeAmount || '';
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

        // 取消按钮
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.goBack();
        });

        // 保存并返回按钮
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.handleSubmit();
        });

        // 产品种类选择
        document.getElementById('productType').addEventListener('click', () => {
            this.showProductTypeOptions();
        });

        // 币种选择
        const currencyFields = [
            'depositCurrency', 'loanCurrency',
            'sellCurrency', 'buyCurrency', 'nearSellCurrency', 'nearBuyCurrency',
            'farSellCurrency', 'farBuyCurrency',
            'depositFeeCurrency', 'loanFeeCurrency', 'foreignFeeCurrency'
        ];
        currencyFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('click', () => {
                    this.showCurrencyOptions(fieldId);
                });
            }
        });

        // 外汇类型选择
        document.getElementById('foreignType').addEventListener('click', () => {
            this.showForeignTypeOptions();
        });

        // 期限单位选择
        const periodUnitFields = ['depositPeriodUnit', 'loanPeriodUnit'];
        periodUnitFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('click', () => {
                    this.showPeriodUnitOptions(fieldId);
                });
            }
        });

        // 表单提交
        document.getElementById('productForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // 存款产品字段变化监听
        this.bindDepositFields();
        
        // 贷款产品字段变化监听
        this.bindLoanFields();
        
        // 外汇产品字段变化监听
        this.bindForeignFields();
    }

    /**
     * 绑定存款产品字段事件
     */
    bindDepositFields() {
        const fields = ['depositAmount', 'depositRate', 'depositPeriod', 'depositPeriodUnit'];
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    this.calculateDeposit();
                });
            }
        });
    }

    /**
     * 绑定贷款产品字段事件
     */
    bindLoanFields() {
        const fields = ['loanAmount', 'loanRate', 'loanPeriod', 'loanPeriodUnit'];
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    this.calculateLoan();
                });
            }
        });
    }

    /**
     * 绑定外汇产品字段事件
     */
    bindForeignFields() {
        // 即期/远期字段
        const spotForwardFields = ['sellAmount', 'exchangeRate'];
        spotForwardFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    this.calculateSpotForward();
                });
            }
        });

        // 掉期近端字段
        const swapNearFields = ['nearSellAmount', 'nearRate'];
        swapNearFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    this.calculateSwap();
                });
            }
        });

        // 掉期远端字段
        const swapFarFields = ['farRate'];
        swapFarFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    this.calculateSwap();
                });
            }
        });
    }

    /**
     * 产品种类变化处理
     */
    onProductTypeChange(type) {
        this.currentProductType = type;
        
        // 隐藏所有产品表单
        document.querySelectorAll('.product-form-section').forEach(section => {
            section.style.display = 'none';
        });

        // 显示对应的产品表单
        if (type === 'deposit') {
            document.getElementById('depositForm').style.display = 'block';
        } else if (type === 'loan') {
            document.getElementById('loanForm').style.display = 'block';
        } else if (type === 'foreign') {
            document.getElementById('foreignForm').style.display = 'block';
        }
    }

    /**
     * 外汇类型变化处理
     */
    onForeignTypeChange(type) {
        this.currentForeignType = type;
        
        // 隐藏所有外汇子表单
        document.getElementById('spotForwardForm').style.display = 'none';
        document.getElementById('swapForm').style.display = 'none';

        // 显示对应的外汇子表单
        if (type === 'foreign_spot' || type === 'foreign_forward') {
            document.getElementById('spotForwardForm').style.display = 'block';
            // 更新即期/远期汇率提示
            this.updateExchangeRatePlaceholder();
        } else if (type === 'foreign_swap') {
            document.getElementById('swapForm').style.display = 'block';
            // 更新掉期汇率提示
            this.updateSwapRatePlaceholders();
        }
    }

    /**
     * 计算存款收益
     */
    calculateDeposit() {
        const amount = parseFloat(document.getElementById('depositAmount').value) || 0;
        const rate = parseFloat(document.getElementById('depositRate').value) || 0;
        const period = parseInt(document.getElementById('depositPeriod').value) || 0;
        const periodUnitField = document.getElementById('depositPeriodUnit');
        const periodUnit = periodUnitField.dataset.value || 'year';

        if (amount > 0 && rate > 0 && period > 0) {
            // 根据期限单位调整计算
            let adjustedPeriod = period;
            if (periodUnit === 'month') {
                adjustedPeriod = period / 12; // 转换为年
            } else if (periodUnit === 'day') {
                adjustedPeriod = period / 365; // 转换为年
            }
            
            const interest = (amount * rate * adjustedPeriod) / 100;
            const principal = amount + interest;

            document.getElementById('depositInterest').value = this.formatAmount(interest);
            document.getElementById('depositPrincipal').value = this.formatAmount(principal);
        } else {
            document.getElementById('depositInterest').value = '';
            document.getElementById('depositPrincipal').value = '';
        }
    }

    /**
     * 计算贷款收益
     */
    calculateLoan() {
        const amount = parseFloat(document.getElementById('loanAmount').value) || 0;
        const rate = parseFloat(document.getElementById('loanRate').value) || 0;
        const period = parseInt(document.getElementById('loanPeriod').value) || 0;
        const periodUnitField = document.getElementById('loanPeriodUnit');
        const periodUnit = periodUnitField.dataset.value || 'year';

        if (amount > 0 && rate > 0 && period > 0) {
            // 根据期限单位调整计算
            let adjustedPeriod = period;
            if (periodUnit === 'month') {
                adjustedPeriod = period / 12; // 转换为年
            } else if (periodUnit === 'day') {
                adjustedPeriod = period / 365; // 转换为年
            }
            
            const interest = (amount * rate * adjustedPeriod) / 100;
            const principal = amount + interest;

            document.getElementById('loanInterest').value = this.formatAmount(interest);
            document.getElementById('loanPrincipal').value = this.formatAmount(principal);
        } else {
            document.getElementById('loanInterest').value = '';
            document.getElementById('loanPrincipal').value = '';
        }
    }

    /**
     * 计算即期/远期交易
     */
    calculateSpotForward() {
        const sellAmount = parseFloat(document.getElementById('sellAmount').value) || 0;
        const exchangeRate = parseFloat(document.getElementById('exchangeRate').value) || 0;

        if (sellAmount > 0 && exchangeRate > 0) {
            const buyAmount = sellAmount * exchangeRate;
            document.getElementById('buyAmount').value = this.formatAmount(buyAmount);
        } else {
            document.getElementById('buyAmount').value = '';
        }
    }

    /**
     * 计算掉期交易
     */
    calculateSwap() {
        const nearSellAmount = parseFloat(document.getElementById('nearSellAmount').value) || 0;
        const nearRate = parseFloat(document.getElementById('nearRate').value) || 0;
        const farRate = parseFloat(document.getElementById('farRate').value) || 0;

        // 计算近端买入金额（近端卖出金额 × 近端汇率）
        if (nearSellAmount > 0 && nearRate > 0) {
            const nearBuyAmount = nearSellAmount * nearRate;
            document.getElementById('nearBuyAmount').value = this.formatAmount(nearBuyAmount);
        } else {
            document.getElementById('nearBuyAmount').value = '';
        }

        // 计算远端相关金额
        if (nearSellAmount > 0 && nearRate > 0 && farRate > 0) {
            const nearBuyAmount = nearSellAmount * nearRate; // 近端买入金额
            
            // 新的远端金额计算逻辑
            const farBuyAmount = nearSellAmount; // 远端买入金额 = 近端卖出金额
            const farSellAmount = farBuyAmount / farRate; // 远端卖出金额 = 远端买入金额 ÷ 远端汇率
            
            document.getElementById('farSellAmount').value = this.formatAmount(farSellAmount);
            document.getElementById('farBuyAmount').value = this.formatAmount(farBuyAmount);
            
            // 期末收益计算公式：近端买入金额 - 近端卖出金额 × (1/远端汇率)
            // 收益币种按照近端买入币种
            const finalIncome = nearBuyAmount - (nearSellAmount / farRate);
            document.getElementById('finalIncome').value = this.formatAmount(finalIncome);
        } else {
            document.getElementById('farSellAmount').value = '';
            document.getElementById('farBuyAmount').value = '';
            document.getElementById('finalIncome').value = '';
        }
        
        // 更新期末收益币种显示
        this.updateFinalIncomeCurrency();
    }

    /**
     * 处理表单提交
     */
    async handleSubmit() {
        try {
            // 验证表单
            if (!this.validateForm()) {
                return;
            }

            // 收集表单数据
            const productData = this.collectFormData();

            // 更新产品数据
            await window.productDB.updateProduct(this.currentProductId, productData);

            // 直接返回首页
            this.goHome();

        } catch (error) {
            console.error('更新产品失败:', error);
            this.showError('更新产品失败');
        }
    }

    /**
     * 验证表单
     */
    validateForm() {
        let isValid = true;
        this.clearAllErrors();

        // 验证产品种类
        const productType = document.getElementById('productType').value;
        if (!productType) {
            this.showFieldError('productType', '请选择产品种类');
            isValid = false;
        }

        // 验证产品名称
        const productName = document.getElementById('productName').value.trim();
        if (!productName) {
            this.showFieldError('productName', '请输入产品名称');
            isValid = false;
        } else if (productName.length > 50) {
            this.showFieldError('productName', '产品名称不能超过50个字符');
            isValid = false;
        }

        // 根据产品类型验证相应字段
        if (productType === 'deposit') {
            isValid = this.validateDepositForm() && isValid;
        } else if (productType === 'loan') {
            isValid = this.validateLoanForm() && isValid;
        } else if (productType === 'foreign') {
            isValid = this.validateForeignForm() && isValid;
        }

        return isValid;
    }

    /**
     * 验证存款表单
     */
    validateDepositForm() {
        let isValid = true;

        const currency = document.getElementById('depositCurrency').value;
        const amount = parseFloat(document.getElementById('depositAmount').value);
        const rate = parseFloat(document.getElementById('depositRate').value);
        const period = parseFloat(document.getElementById('depositPeriod').value);

        if (!currency) {
            this.showFieldError('depositCurrency', '请选择币种');
            isValid = false;
        }

        if (!amount || amount <= 0) {
            this.showFieldError('depositAmount', '请输入有效金额');
            isValid = false;
        }

        if (!rate || rate <= 0) {
            this.showFieldError('depositRate', '请输入有效利率');
            isValid = false;
        }

        if (!period || period <= 0) {
            this.showFieldError('depositPeriod', '请输入有效期限');
            isValid = false;
        }

        return isValid;
    }

    /**
     * 验证贷款表单
     */
    validateLoanForm() {
        let isValid = true;

        const currency = document.getElementById('loanCurrency').value;
        const amount = parseFloat(document.getElementById('loanAmount').value);
        const rate = parseFloat(document.getElementById('loanRate').value);
        const period = parseFloat(document.getElementById('loanPeriod').value);

        if (!currency) {
            this.showFieldError('loanCurrency', '请选择币种');
            isValid = false;
        }

        if (!amount || amount <= 0) {
            this.showFieldError('loanAmount', '请输入有效金额');
            isValid = false;
        }

        if (!rate || rate <= 0) {
            this.showFieldError('loanRate', '请输入有效利率');
            isValid = false;
        }

        if (!period || period <= 0) {
            this.showFieldError('loanPeriod', '请输入有效期限');
            isValid = false;
        }

        return isValid;
    }

    /**
     * 验证外汇表单
     */
    validateForeignForm() {
        let isValid = true;

        const foreignType = document.getElementById('foreignType').value;
        if (!foreignType) {
            this.showFieldError('foreignType', '请选择外汇类型');
            isValid = false;
        }

        if (foreignType === 'foreign_spot' || foreignType === 'foreign_forward') {
            // 验证即期/远期表单
            const sellCurrency = document.getElementById('sellCurrency').value;
            const buyCurrency = document.getElementById('buyCurrency').value;
            const sellAmount = parseFloat(document.getElementById('sellAmount').value);
            const exchangeRate = parseFloat(document.getElementById('exchangeRate').value);

            if (!sellCurrency) {
                this.showFieldError('sellCurrency', '请选择卖出币种');
                isValid = false;
            }

            if (!buyCurrency) {
                this.showFieldError('buyCurrency', '请选择买入币种');
                isValid = false;
            }

            if (sellCurrency === buyCurrency) {
                this.showFieldError('buyCurrency', '买入币种不能与卖出币种相同');
                isValid = false;
            }

            if (!sellAmount || sellAmount <= 0) {
                this.showFieldError('sellAmount', '请输入有效卖出金额');
                isValid = false;
            }

            if (!exchangeRate || exchangeRate <= 0) {
                this.showFieldError('exchangeRate', '请输入有效汇率');
                isValid = false;
            }
        } else if (foreignType === 'foreign_swap') {
            // 验证掉期表单
            const nearSellCurrency = document.getElementById('nearSellCurrency').value;
            const nearBuyCurrency = document.getElementById('nearBuyCurrency').value;
            const nearSellAmount = parseFloat(document.getElementById('nearSellAmount').value);
            const nearRate = parseFloat(document.getElementById('nearRate').value);
            const farRate = parseFloat(document.getElementById('farRate').value);

            if (!nearSellCurrency) {
                this.showFieldError('nearSellCurrency', '请选择近端卖出币种');
                isValid = false;
            }

            if (!nearBuyCurrency) {
                this.showFieldError('nearBuyCurrency', '请选择近端买入币种');
                isValid = false;
            }

            if (nearSellCurrency === nearBuyCurrency) {
                this.showFieldError('nearBuyCurrency', '近端买入币种不能与卖出币种相同');
                isValid = false;
            }

            if (!nearSellAmount || nearSellAmount <= 0) {
                this.showFieldError('nearSellAmount', '请输入有效近端卖出金额');
                isValid = false;
            }

            if (!nearRate || nearRate <= 0) {
                this.showFieldError('nearRate', '请输入有效近端汇率');
                isValid = false;
            }

            if (!farRate || farRate <= 0) {
                this.showFieldError('farRate', '请输入有效远端汇率');
                isValid = false;
            }
        }

        return isValid;
    }

    /**
     * 收集表单数据
     */
    collectFormData() {
        const productTypeField = document.getElementById('productType');
        const productType = productTypeField.dataset.value || productTypeField.value;
        let actualType = productType;
        
        // 如果是外汇类型，需要从foreignType字段获取实际类型
        if (productType === 'foreign') {
            const foreignTypeField = document.getElementById('foreignType');
            actualType = foreignTypeField.dataset.value || foreignTypeField.value;
        }
        
        const productData = {
            name: document.getElementById('productName').value.trim(),
            type: actualType
        };

        // 根据产品类型收集相应数据
        switch (productType) {
            case 'deposit':
                Object.assign(productData, this.collectDepositData());
                break;
            case 'loan':
                Object.assign(productData, this.collectLoanData());
                break;
            case 'foreign':
                Object.assign(productData, this.collectForeignData());
                break;
        }

        return productData;
    }

    /**
     * 收集存款产品数据
     */
    collectDepositData() {
        const amount = parseFloat(document.getElementById('depositAmount').value);
        const rate = parseFloat(document.getElementById('depositRate').value);
        const period = parseFloat(document.getElementById('depositPeriod').value);
        const interest = amount * rate / 100 * period;
        const principal = amount + interest;

        const currencyField = document.getElementById('depositCurrency');
        const currency = currencyField.dataset.value || currencyField.value;
        
        const feeCurrencyField = document.getElementById('depositFeeCurrency');
        const feeCurrency = feeCurrencyField.dataset.value || feeCurrencyField.value;

        return {
            currency: currency,
            amount: amount,
            rate: rate,
            period: period,
            interest: interest,
            principal: principal,
            feeCurrency: feeCurrency || null,
            feeAmount: parseFloat(document.getElementById('depositFeeAmount').value) || null
        };
    }

    /**
     * 收集贷款产品数据
     */
    collectLoanData() {
        const amount = parseFloat(document.getElementById('loanAmount').value);
        const rate = parseFloat(document.getElementById('loanRate').value);
        const period = parseFloat(document.getElementById('loanPeriod').value);
        const interest = amount * rate / 100 * period;
        const principal = amount + interest;

        const currencyField = document.getElementById('loanCurrency');
        const currency = currencyField.dataset.value || currencyField.value;
        
        const feeCurrencyField = document.getElementById('loanFeeCurrency');
        const feeCurrency = feeCurrencyField.dataset.value || feeCurrencyField.value;

        return {
            currency: currency,
            amount: amount,
            rate: rate,
            period: period,
            interest: interest,
            principal: principal,
            feeCurrency: feeCurrency || null,
            feeAmount: parseFloat(document.getElementById('loanFeeAmount').value) || null
        };
    }

    /**
     * 收集外汇产品数据
     */
    collectForeignData() {
        const foreignTypeField = document.getElementById('foreignType');
        const foreignType = foreignTypeField.dataset.value || foreignTypeField.value;
        
        const feeCurrencyField = document.getElementById('foreignFeeCurrency');
        const feeCurrency = feeCurrencyField.dataset.value || feeCurrencyField.value;
        
        const baseData = {
            feeCurrency: feeCurrency || null,
            feeAmount: parseFloat(document.getElementById('foreignFeeAmount').value) || null
        };

        if (foreignType === 'foreign_swap') {
            // 掉期交易数据
            const nearSellAmount = parseFloat(document.getElementById('nearSellAmount').value);
            const nearRate = parseFloat(document.getElementById('nearRate').value);
            const farRate = parseFloat(document.getElementById('farRate').value);
            const nearBuyAmount = nearSellAmount * nearRate;
            
            // 新的远端金额计算逻辑
            const farBuyAmount = nearSellAmount; // 远端买入金额 = 近端卖出金额
            const farSellAmount = farBuyAmount / farRate; // 远端卖出金额 = 远端买入金额 ÷ 远端汇率
            
            // 期末收益计算公式：近端买入金额 - 近端卖出金额 × (1/远端汇率)
            const finalIncome = nearBuyAmount - (nearSellAmount / farRate);

            const nearSellCurrencyField = document.getElementById('nearSellCurrency');
            const nearSellCurrency = nearSellCurrencyField.dataset.value || nearSellCurrencyField.value;
            
            const nearBuyCurrencyField = document.getElementById('nearBuyCurrency');
            const nearBuyCurrency = nearBuyCurrencyField.dataset.value || nearBuyCurrencyField.value;
            
            const farSellCurrencyField = document.getElementById('farSellCurrency');
            const farSellCurrency = farSellCurrencyField.dataset.value || farSellCurrencyField.value;
            
            const farBuyCurrencyField = document.getElementById('farBuyCurrency');
            const farBuyCurrency = farBuyCurrencyField.dataset.value || farBuyCurrencyField.value;

            return {
                ...baseData,
                nearSellCurrency: nearSellCurrency,
                nearBuyCurrency: nearBuyCurrency,
                nearSellAmount: nearSellAmount,
                nearRate: nearRate,
                nearBuyAmount: nearBuyAmount,
                farSellCurrency: farSellCurrency,
                farBuyCurrency: farBuyCurrency,
                farRate: farRate,
                farBuyAmount: farBuyAmount,
                farSellAmount: farSellAmount,
                finalIncome: finalIncome
            };
        } else {
            // 即期/远期交易数据
            const sellAmount = parseFloat(document.getElementById('sellAmount').value);
            const exchangeRate = parseFloat(document.getElementById('exchangeRate').value);
            const buyAmount = sellAmount * exchangeRate;

            const sellCurrencyField = document.getElementById('sellCurrency');
            const sellCurrency = sellCurrencyField.dataset.value || sellCurrencyField.value;
            
            const buyCurrencyField = document.getElementById('buyCurrency');
            const buyCurrency = buyCurrencyField.dataset.value || buyCurrencyField.value;

            return {
                ...baseData,
                sellCurrency: sellCurrency,
                buyCurrency: buyCurrency,
                sellAmount: sellAmount,
                exchangeRate: exchangeRate,
                buyAmount: buyAmount
            };
        }
    }

    /**
     * 显示字段错误
     */
    showFieldError(fieldId, message) {
        const errorElement = document.getElementById(`${fieldId}Error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    /**
     * 清除所有错误提示
     */
    clearAllErrors() {
        const errorElements = document.querySelectorAll('.input-error');
        errorElements.forEach(element => {
            element.style.display = 'none';
        });
    }

    /**
     * 格式化金额
     */
    formatAmount(amount) {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return '';
        }
        return parseFloat(amount).toFixed(2);
    }

    /**
     * 返回上一页
     */
    goBack() {
        window.history.back();
    }

    /**
     * 跳转到首页
     */
    goHome() {
        window.location.href = 'index.html';
    }



    /**
     * 显示错误提示
     */
    showError(message) {
        // 简单的错误提示，可以根据需要扩展
        alert(message);
    }

    /**
     * 显示产品种类选项列表
     */
    showProductTypeOptions() {
        const mask = document.getElementById('productTypeMask');
        mask.style.display = 'flex';
        
        // 绑定确定按钮事件
        const confirmBtn = mask.querySelector('.popup-title-action-btn');
        confirmBtn.onclick = () => {
            this.confirmProductTypeSelection();
        };
        
        // 绑定选项点击事件
        const options = mask.querySelectorAll('.form-option');
        options.forEach(option => {
            option.onclick = () => {
                // 移除其他选中状态
                options.forEach(o => {
                    o.querySelector('.selected-icon').classList.add('not-selected');
                });
                // 添加当前选中状态
                option.querySelector('.selected-icon').classList.remove('not-selected');
            };
        });
        
        // 绑定遮罩点击关闭事件
        mask.onclick = (e) => {
            if (e.target === mask) {
                mask.style.display = 'none';
            }
        };
    }

    /**
     * 确认产品种类选择
     */
    confirmProductTypeSelection() {
        const mask = document.getElementById('productTypeMask');
        const selectedOption = mask.querySelector('.form-option .selected-icon:not(.not-selected)');
        
        if (selectedOption) {
            const optionElement = selectedOption.closest('.form-option');
            const value = optionElement.dataset.value;
            const text = optionElement.querySelector('.option-label').textContent;
            
            // 更新输入框显示和存储实际值
            const inputField = document.getElementById('productType');
            inputField.value = text;
            inputField.dataset.value = value;
            
            // 处理产品种类变化
            this.onProductTypeChange(value);
        }
        
        // 隐藏弹窗
        mask.style.display = 'none';
    }

    /**
     * 显示币种选项列表
     */
    showCurrencyOptions(fieldId) {
        const mask = document.getElementById('currencyMask');
        mask.style.display = 'flex';
        
        // 绑定确定按钮事件
        const confirmBtn = mask.querySelector('.popup-title-action-btn');
        confirmBtn.onclick = () => {
            this.confirmCurrencySelection(fieldId);
        };
        
        // 绑定选项点击事件
        const options = mask.querySelectorAll('.form-option');
        options.forEach(option => {
            option.onclick = () => {
                // 移除其他选中状态
                options.forEach(o => {
                    o.querySelector('.selected-icon').classList.add('not-selected');
                });
                // 添加当前选中状态
                option.querySelector('.selected-icon').classList.remove('not-selected');
            };
        });
        
        // 绑定遮罩点击关闭事件
        mask.onclick = (e) => {
            if (e.target === mask) {
                mask.style.display = 'none';
            }
        };
    }

    /**
     * 确认币种选择
     */
    confirmCurrencySelection(fieldId) {
        const mask = document.getElementById('currencyMask');
        const selectedOption = mask.querySelector('.form-option .selected-icon:not(.not-selected)');
        
        if (selectedOption) {
            const optionElement = selectedOption.closest('.form-option');
            const value = optionElement.dataset.value;
            const text = optionElement.querySelector('.option-label').textContent;
            
            // 更新输入框显示和存储实际值
            const inputField = document.getElementById(fieldId);
            inputField.value = text;
            inputField.dataset.value = value;
            
            // 根据更新的币种更新汇率提示
            this.updateExchangeRatePlaceholders(fieldId);
            
            // 自动填充手续费币种
            this.autoFillFeeCurrency(fieldId, value, text);
        }
        
        // 隐藏弹窗
        mask.style.display = 'none';
    }

    /**
     * 显示外汇类型选项列表
     */
    showForeignTypeOptions() {
        const mask = document.getElementById('foreignTypeMask');
        mask.style.display = 'flex';
        
        // 绑定确定按钮事件
        const confirmBtn = mask.querySelector('.popup-title-action-btn');
        confirmBtn.onclick = () => {
            this.confirmForeignTypeSelection();
        };
        
        // 绑定选项点击事件
        const options = mask.querySelectorAll('.form-option');
        options.forEach(option => {
            option.onclick = () => {
                // 移除其他选中状态
                options.forEach(o => {
                    o.querySelector('.selected-icon').classList.add('not-selected');
                });
                // 添加当前选中状态
                option.querySelector('.selected-icon').classList.remove('not-selected');
            };
        });
        
        // 绑定遮罩点击关闭事件
        mask.onclick = (e) => {
            if (e.target === mask) {
                mask.style.display = 'none';
            }
        };
    }

    /**
     * 确认外汇类型选择
     */
    confirmForeignTypeSelection() {
        const mask = document.getElementById('foreignTypeMask');
        const selectedOption = mask.querySelector('.form-option .selected-icon:not(.not-selected)');
        
        if (selectedOption) {
            const optionElement = selectedOption.closest('.form-option');
            const value = optionElement.dataset.value;
            const text = optionElement.querySelector('.option-label').textContent;
            
            // 更新输入框显示和存储实际值
            const inputField = document.getElementById('foreignType');
            inputField.value = text;
            inputField.dataset.value = value;
            
            // 处理外汇类型变化
            this.onForeignTypeChange(value);
        }
        
        // 隐藏弹窗
        mask.style.display = 'none';
    }

    /**
     * 更新即期/远期汇率提示
     */
    updateExchangeRatePlaceholder() {
        const sellCurrencyField = document.getElementById('sellCurrency');
        const buyCurrencyField = document.getElementById('buyCurrency');
        const sellCurrency = sellCurrencyField.dataset.value || '';
        const buyCurrency = buyCurrencyField.dataset.value || '';
        const exchangeRateField = document.getElementById('exchangeRate');
        
        if (sellCurrency && buyCurrency) {
            const placeholder = `请输入${sellCurrency}兑${buyCurrency}汇率`;
            exchangeRateField.placeholder = placeholder;
        } else {
            exchangeRateField.placeholder = '请输入汇率';
        }
    }

    /**
     * 更新掉期汇率提示
     */
    updateSwapRatePlaceholders() {
        const nearSellCurrencyField = document.getElementById('nearSellCurrency');
        const nearBuyCurrencyField = document.getElementById('nearBuyCurrency');
        
        const nearSellCurrency = nearSellCurrencyField.dataset.value || '';
        const nearBuyCurrency = nearBuyCurrencyField.dataset.value || '';
        
        const nearRateField = document.getElementById('nearRate');
        const farRateField = document.getElementById('farRate');
        
        // 近端汇率提示：近端卖出币种兑近端买入币种
        if (nearSellCurrency && nearBuyCurrency) {
            const nearPlaceholder = `请输入${nearSellCurrency}兑${nearBuyCurrency}汇率`;
            nearRateField.placeholder = nearPlaceholder;
        } else {
            nearRateField.placeholder = '请输入近端汇率';
        }
        
        // 远端汇率提示：远端卖出币种兑远端买入币种
        // 根据掉期币种关联关系：远端卖出币种 = 近端买入币种，远端买入币种 = 近端卖出币种
        if (nearBuyCurrency && nearSellCurrency) {
            const farPlaceholder = `请输入${nearBuyCurrency}兑${nearSellCurrency}汇率`;
            farRateField.placeholder = farPlaceholder;
        } else {
            farRateField.placeholder = '请输入远端汇率';
        }
    }

    /**
     * 更新期末收益币种显示
     */
    updateFinalIncomeCurrency() {
        const currencyLabel = document.getElementById('finalIncomeCurrency');
        if (!currencyLabel) return;
        
        // 掉期产品：期末收益按照近端买入币种计算
        if (this.currentProductType === 'foreign' && this.currentForeignType === 'foreign_swap') {
            const nearBuyCurrencyField = document.getElementById('nearBuyCurrency');
            const nearBuyCurrency = nearBuyCurrencyField.dataset.value || '';
            if (nearBuyCurrency) {
                currencyLabel.textContent = `(${nearBuyCurrency})`;
            } else {
                currencyLabel.textContent = '';
            }
        } else {
            currencyLabel.textContent = '';
        }
    }

    /**
     * 自动填充手续费币种
     */
    autoFillFeeCurrency(fieldId, currencyValue, currencyText) {
        // 存款产品：币种自动带入手续费币种
        if (this.currentProductType === 'deposit' && fieldId === 'depositCurrency') {
            const feeCurrencyField = document.getElementById('depositFeeCurrency');
            feeCurrencyField.value = currencyText;
            feeCurrencyField.dataset.value = currencyValue;
        }
        
        // 贷款产品：币种自动带入手续费币种
        if (this.currentProductType === 'loan' && fieldId === 'loanCurrency') {
            const feeCurrencyField = document.getElementById('loanFeeCurrency');
            feeCurrencyField.value = currencyText;
            feeCurrencyField.dataset.value = currencyValue;
        }
        
        // 外汇产品：即期/远期，卖出币种自动带入手续费币种
        if (this.currentProductType === 'foreign' && 
            (this.currentForeignType === 'foreign_spot' || this.currentForeignType === 'foreign_forward') && 
            fieldId === 'sellCurrency') {
            const feeCurrencyField = document.getElementById('foreignFeeCurrency');
            feeCurrencyField.value = currencyText;
            feeCurrencyField.dataset.value = currencyValue;
        }
        
        // 外汇产品：掉期，近端卖出币种自动带入手续费币种
        if (this.currentProductType === 'foreign' && 
            this.currentForeignType === 'foreign_swap' && 
            fieldId === 'nearSellCurrency') {
            const feeCurrencyField = document.getElementById('foreignFeeCurrency');
            feeCurrencyField.value = currencyText;
            feeCurrencyField.dataset.value = currencyValue;
        }
    }

    /**
     * 更新掉期币种字段关联
     */
    updateSwapCurrencyFields() {
        const nearSellCurrencyField = document.getElementById('nearSellCurrency');
        const nearBuyCurrencyField = document.getElementById('nearBuyCurrency');
        const farSellCurrencyField = document.getElementById('farSellCurrency');
        const farBuyCurrencyField = document.getElementById('farBuyCurrency');
        
        const nearSellCurrency = nearSellCurrencyField.dataset.value || '';
        const nearBuyCurrency = nearBuyCurrencyField.dataset.value || '';
        const nearSellCurrencyText = nearSellCurrencyField.value || '';
        const nearBuyCurrencyText = nearBuyCurrencyField.value || '';
        
        // 当选择近端卖出币种时，自动设置为远端买入币种
        if (nearSellCurrency && nearSellCurrencyText) {
            farBuyCurrencyField.value = nearSellCurrencyText;
            farBuyCurrencyField.dataset.value = nearSellCurrency;
            
            // 自动填充手续费币种
            this.autoFillFeeCurrency('nearSellCurrency', nearSellCurrency, nearSellCurrencyText);
        }
        
        // 当选择近端买入币种时，自动设置为远端卖出币种
        if (nearBuyCurrency && nearBuyCurrencyText) {
            farSellCurrencyField.value = nearBuyCurrencyText;
            farSellCurrencyField.dataset.value = nearBuyCurrency;
            
            // 更新期末收益币种显示
            this.updateFinalIncomeCurrency();
        }
    }

    /**
     * 根据字段ID更新相应的汇率提示
     */
    updateExchangeRatePlaceholders(fieldId) {
        // 即期/远期汇率字段
        if (fieldId === 'sellCurrency' || fieldId === 'buyCurrency') {
            this.updateExchangeRatePlaceholder();
        }
        // 掉期汇率字段
        else if (['nearSellCurrency', 'nearBuyCurrency', 'farSellCurrency', 'farBuyCurrency'].includes(fieldId)) {
            this.updateSwapRatePlaceholders();
            // 对于掉期币种字段，还需要更新币种关联
            if (['nearSellCurrency', 'nearBuyCurrency'].includes(fieldId)) {
                this.updateSwapCurrencyFields();
            }
        }
    }

    /**
     * 显示期限单位选项列表
     */
    showPeriodUnitOptions(fieldId) {
        const mask = document.getElementById('periodUnitMask');
        mask.style.display = 'flex';
        
        // 绑定确定按钮事件
        const confirmBtn = mask.querySelector('.popup-title-action-btn');
        confirmBtn.onclick = () => {
            this.confirmPeriodUnitSelection(fieldId);
        };
        
        // 绑定选项点击事件
        const options = mask.querySelectorAll('.form-option');
        options.forEach(option => {
            option.onclick = () => {
                // 移除其他选中状态
                options.forEach(o => {
                    o.querySelector('.selected-icon').classList.add('not-selected');
                });
                // 添加当前选中状态
                option.querySelector('.selected-icon').classList.remove('not-selected');
            };
        });
        
        // 绑定遮罩点击关闭事件
        mask.onclick = (e) => {
            if (e.target === mask) {
                mask.style.display = 'none';
            }
        };
    }

    /**
     * 确认期限单位选择
     */
    confirmPeriodUnitSelection(fieldId) {
        const mask = document.getElementById('periodUnitMask');
        const selectedOption = mask.querySelector('.form-option .selected-icon:not(.not-selected)');
        
        if (selectedOption) {
            const optionElement = selectedOption.closest('.form-option');
            const value = optionElement.dataset.value;
            const text = optionElement.querySelector('.option-label').textContent;
            
            // 更新输入框显示和存储实际值
            const inputField = document.getElementById(fieldId);
            inputField.value = text;
            inputField.dataset.value = value;
            
            // 重新计算利息和本息
            if (fieldId === 'depositPeriodUnit') {
                this.calculateDeposit();
            } else if (fieldId === 'loanPeriodUnit') {
                this.calculateLoan();
            }
        }
        
        // 隐藏弹窗
        mask.style.display = 'none';
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.editProductPage = new EditProductPage();
});
