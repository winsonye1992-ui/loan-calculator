// 全局变量
let currentSelector = null;
let selectedValue = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded triggered');
    
    // 隐藏选择器遮罩
    const mask = document.getElementById('selector-mask');
    if (mask) {
        mask.classList.remove('show');
    }
    
    // 为所有带onclick的form-item添加点击事件
    const formItems = document.querySelectorAll('.form-item[onclick]');
    formItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
    
    // 监听协议勾选状态
    const agreementCheckbox = document.getElementById('agreement-checkbox');
    const submitBtn = document.getElementById('submit-btn');
    const loanAmountInput = document.getElementById('loan-amount');
    
    if (agreementCheckbox && submitBtn) {
        agreementCheckbox.addEventListener('change', function() {
            updateSubmitButton();
        });
    }

    // 借款金额输入监听
    if (loanAmountInput) {
        loanAmountInput.addEventListener('input', function() {
            // 只允许输入数字和小数点
            this.value = this.value.replace(/[^\d.]/g, '');
            
            // 确保只有一个小数点
            const parts = this.value.split('.');
            if (parts.length > 2) {
                this.value = parts[0] + '.' + parts.slice(1).join('');
            }
            
            // 限制小数点后两位
            if (parts.length === 2 && parts[1].length > 2) {
                this.value = parts[0] + '.' + parts[1].substring(0, 2);
            }
            
            calculateLoanDetails();
            updateSubmitButton();
        });
    }
    
    // 更新提交按钮状态
    function updateSubmitButton() {
        if (!loanAmountInput || !agreementCheckbox || !submitBtn) return;
        
        const isAmountValid = loanAmountInput.value && parseFloat(loanAmountInput.value) > 0;
        const isAgreementChecked = agreementCheckbox.checked;
        
        if (isAmountValid && isAgreementChecked) {
            submitBtn.classList.remove('btn-disabled');
            submitBtn.disabled = false;
        } else {
            submitBtn.classList.add('btn-disabled');
            submitBtn.disabled = true;
        }
    }
    
    // 计算贷款详情
    function calculateLoanDetails() {
        if (!loanAmountInput) return;
        
        const amount = parseFloat(loanAmountInput.value) || 0;
        if (amount > 0) {
            // 模拟计算逻辑
            const principal = amount / 36; // 假设36期
            const interest = amount * 0.048 / 12; // 年化4.8%
            const total = principal + interest;
            
            const principalInput = document.getElementById('first-principal');
            const interestInput = document.getElementById('first-interest-normal');
            const totalInput = document.getElementById('first-total');
            
            if (principalInput) principalInput.value = principal.toFixed(2);
            if (interestInput) interestInput.value = interest.toFixed(2);
            if (totalInput) totalInput.value = total.toFixed(2);
            
            // 确保强调样式
            if (principalInput) principalInput.classList.add('form-input-emphasize');
            if (interestInput) interestInput.classList.add('form-input-emphasize');
            if (totalInput) totalInput.classList.add('form-input-emphasize');
        }
    }
});

// 显示底部选择器
function showBottomSelector(title, options, selectorId, paymentId = null) {
    console.log('showBottomSelector called:', title, options, selectorId, paymentId);
    currentSelector = selectorId;
    
    const titleElement = document.getElementById('selector-title');
    const optionsContainer = document.getElementById('selector-options');
    const mask = document.getElementById('selector-mask');
    
    if (!titleElement || !optionsContainer || !mask) {
        console.error('Required elements not found');
        return;
    }
    
    titleElement.textContent = title;
    optionsContainer.innerHTML = '';
    
    options.forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.className = 'form-option';
        optionElement.onclick = () => selectOption(option);
        
        optionElement.innerHTML = `
            <div class="option-content">${option}</div>
            <div class="option-selected">
                <img src="../src/assets/images/selected.png" alt="选中" class="selected-icon" style="display: none;">
            </div>
        `;
        
        optionsContainer.appendChild(optionElement);
    });
    
    mask.classList.add('show');
}

// 选择选项
function selectOption(value) {
    selectedValue = value;
    
    // 更新选中状态显示
    const options = document.querySelectorAll('.form-option');
    options.forEach(option => {
        const icon = option.querySelector('.selected-icon');
        const text = option.querySelector('.option-content').textContent;
        if (text === value) {
            icon.style.display = 'block';
        } else {
            icon.style.display = 'none';
        }
    });
}

// 关闭选择器
function closeSelector() {
    if (selectedValue && currentSelector) {
        const element = document.getElementById(currentSelector);
        if (element) {
            if (element.tagName === 'INPUT') {
                element.value = selectedValue;
            } else {
                element.textContent = selectedValue;
            }
            element.classList.add('form-input-emphasize');
            
            // 特殊处理：支付方式变化时更新协议显示和收款信息字段
            if (currentSelector === 'payment-method') {
                updateAgreementDisplay(selectedValue);
                toggleReceiverFields();
            }
            
            // 特殊处理：收款账户变化时更新网点显示
            if (currentSelector === 'receiver-bank') {
                updateBranchDisplay(selectedValue);
            }
            
            // 特殊处理：优惠券变化时更新首期优惠利息字段显示
            if (currentSelector === 'coupon') {
                updateCouponDisplay(selectedValue);
            }
        }
    }
    
    const mask = document.getElementById('selector-mask');
    if (mask) {
        mask.classList.remove('show');
    }
    
    selectedValue = null;
    currentSelector = null;
}

// 借款期限选择器
function showPeriodSelector() {
    console.log('showPeriodSelector called');
    
    // 检查必要元素是否存在
    const mask = document.getElementById('selector-mask');
    const titleElement = document.getElementById('selector-title');
    const optionsContainer = document.getElementById('selector-options');
    
    console.log('mask element:', mask);
    console.log('title element:', titleElement);
    console.log('options container:', optionsContainer);
    
    const options = ['12个月', '24个月', '36个月'];
    showBottomSelector('请选择借款期限', options, 'loan-period');
}

// 还款方式选择器
function showRepaymentSelector() {
    console.log('showRepaymentSelector called');
    const options = ['等额本息', '等额本金', '先息后本'];
    showBottomSelector('请选择还款方式', options, 'repayment-method');
}

// 优惠券选择器
function showCouponSelector() {
    console.log('showCouponSelector called');
    const options = ['无优惠券', '有优惠券'];
    showBottomSelector('请选择优惠券', options, 'coupon');
}

// 放款账户选择器
function showAccountSelector() {
    console.log('showAccountSelector called');
    const options = ['6222 **** **** 1234', '6222 **** **** 5678'];
    showBottomSelector('请选择放款账户', options, 'loan-account');
}

// 支付方式选择器
function showPaymentSelector() {
    console.log('showPaymentSelector called');
    const options = ['自主支付', '受托支付'];
    showBottomSelector('请选择支付方式', options, 'payment-method');
}

// 银行选择器
function showBankSelector() {
    console.log('showBankSelector called');
    const options = ['东莞银行', '中国工商银行', '中国农业银行', '中国建设银行', '中国银行'];
    showBottomSelector('请选择银行', options, 'receiver-bank');
}

// 网点选择器
function showBranchSelector() {
    console.log('showBranchSelector called');
    const options = ['东莞分行营业部', '东莞东城支行', '东莞南城支行'];
    showBottomSelector('请选择网点', options, 'receiver-branch');
}

// 根据支付方式更新协议显示
function updateAgreementDisplay(paymentMethod) {
    const purposeAgreement = document.getElementById('purpose-agreement-text');
    if (purposeAgreement) {
        if (paymentMethod === '自主支付') {
            purposeAgreement.style.display = 'inline';
        } else {
            purposeAgreement.style.display = 'none';
        }
    }
}

// 根据银行更新网点显示
function updateBranchDisplay(bankName) {
    const branchSection = document.getElementById('receiver-branch-section');
    if (branchSection) {
        if (bankName === '东莞银行') {
            branchSection.style.display = 'none';
        } else {
            branchSection.style.display = 'block';
        }
    }
}

// 根据优惠券选择更新首期优惠利息字段显示
function updateCouponDisplay(couponType) {
    const firstInterestSection = document.getElementById('first-interest-section');
    const couponTip = document.getElementById('coupon-tip');
    
    if (firstInterestSection && couponTip) {
        if (couponType === '无优惠券') {
            // 选择无优惠券时，隐藏首期优惠利息字段和提示
            firstInterestSection.style.display = 'none';
            couponTip.style.display = 'none';
        } else if (couponType === '有优惠券') {
            // 选择有优惠券时，显示首期优惠利息字段和提示
            firstInterestSection.style.display = 'block';
            couponTip.style.display = 'block';
            couponTip.textContent = '前3期利息总计仅需288.96元';
        }
    }
}

// 收款账户卡bin自动识别
function autoDetectBank() {
    const accountInput = document.getElementById('receiver-account');
    const account = accountInput.value.trim();
    
    if (account.length >= 6) {
        const cardBin = account.substring(0, 6);
        
        // 模拟卡bin识别逻辑
        let bankName = '';
        if (cardBin.startsWith('6222')) {
            bankName = '东莞银行';
        } else if (cardBin.startsWith('6225')) {
            bankName = '中国工商银行';
        } else if (cardBin.startsWith('6228')) {
            bankName = '中国农业银行';
        } else if (cardBin.startsWith('6227')) {
            bankName = '中国建设银行';
        } else if (cardBin.startsWith('6226')) {
            bankName = '中国银行';
        }
        
        if (bankName) {
            const bankElement = document.getElementById('receiver-bank');
            if (bankElement) {
                bankElement.textContent = bankName;
                bankElement.classList.add('form-input-emphasize');
                updateBranchDisplay(bankName);
            }
        }
    }
}

// 收款信息编辑功能
function editReceiverInfo() {
    // 启用收款信息字段编辑
    const accountInput = document.getElementById('receiver-account');
    const nameInput = document.getElementById('receiver-name');
    const bankElement = document.getElementById('receiver-bank');
    const actionsSection = document.getElementById('receiver-actions-section');
    
    if (accountInput) accountInput.disabled = false;
    if (nameInput) nameInput.disabled = false;
    if (bankElement) {
        bankElement.textContent = '请选择银行';
        bankElement.classList.remove('form-input-emphasize');
    }
    if (actionsSection) actionsSection.style.display = 'none';
}

// 收款信息删除功能
function deleteReceiverInfo() {
    // 清空收款信息
    const accountInput = document.getElementById('receiver-account');
    const nameInput = document.getElementById('receiver-name');
    const bankElement = document.getElementById('receiver-bank');
    const branchElement = document.getElementById('receiver-branch');
    
    if (accountInput) accountInput.value = '';
    if (nameInput) nameInput.value = '';
    if (bankElement) {
        bankElement.textContent = '请选择银行';
        bankElement.classList.remove('form-input-emphasize');
    }
    if (branchElement) {
        branchElement.textContent = '请选择网点';
        branchElement.classList.remove('form-input-emphasize');
    }
    
    // 隐藏收款信息相关字段
    const sections = [
        'receiver-account-section',
        'receiver-name-section',
        'receiver-bank-section',
        'receiver-branch-section',
        'receiver-actions-section'
    ];
    
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) section.style.display = 'none';
    });
}

// 还款计划查看功能
function showRepaymentPlan() {
    // 跳转到还款计划页面
    window.location.href = 'repayment-plan.html';
}

// 协议查看功能
function showAgreement(type) {
    if (type === 'credit') {
        alert('查看《东莞银行个人在线综合信贷合同》');
    } else if (type === 'purpose') {
        alert('查看《贷款用途说明书》');
    }
}

// 切换收款信息字段显示
function toggleReceiverFields() {
    const paymentMethodElement = document.getElementById('payment-method');
    if (!paymentMethodElement) return;
    
    const paymentMethod = paymentMethodElement.textContent;
    const trusteePaymentSection = document.getElementById('trustee-payment-section');
    
    if (paymentMethod === '受托支付') {
        if (trusteePaymentSection) {
            trusteePaymentSection.style.display = 'block';
            // 初始化受托支付信息
            initializeTrusteePayments();
        }
    } else {
        if (trusteePaymentSection) {
            trusteePaymentSection.style.display = 'none';
        }
    }
}

// 计算贷款详情
function calculateLoanDetails() {
    const amount = parseFloat(document.getElementById('loan-amount')?.value) || 0;
    const period = document.getElementById('loan-period')?.textContent;
    const coupon = document.getElementById('coupon')?.textContent;
    
    if (amount > 0 && period !== '请选择借款期限') {
        // 模拟计算逻辑
        const monthlyRate = 0.048 / 12; // 年化4.8%
        const months = parseInt(period);
        
        let monthlyPayment = 0;
        if (months > 0) {
            monthlyPayment = amount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
        }
        
        const firstInterest = amount * monthlyRate;
        const firstPrincipal = monthlyPayment - firstInterest;
        const firstTotal = monthlyPayment;
        
        // 优惠券处理
        if (coupon !== '请选择优惠券' && coupon !== '无优惠券') {
            const discountInterest = firstInterest * 0.2; // 20%优惠
            const firstInterestElement = document.getElementById('first-interest');
            const firstInterestSection = document.getElementById('first-interest-section');
            const couponTip = document.getElementById('coupon-tip');
            
            if (firstInterestElement) firstInterestElement.value = discountInterest.toFixed(2);
            if (firstInterestSection) firstInterestSection.style.display = 'block';
            if (couponTip) couponTip.style.display = 'block';
        } else {
            const firstInterestSection = document.getElementById('first-interest-section');
            const couponTip = document.getElementById('coupon-tip');
            
            if (firstInterestSection) firstInterestSection.style.display = 'none';
            if (couponTip) couponTip.style.display = 'none';
        }
        
        const elements = {
            'first-principal': firstPrincipal.toFixed(2),
            'first-interest-normal': firstInterest.toFixed(2),
            'first-total': firstTotal.toFixed(2)
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.value = value;
        });
    }
}

// 提交贷款申请
function submitLoanApplication() {
    // 验证受托支付金额（如果选择受托支付）
    const paymentMethod = document.getElementById('payment-method')?.textContent;
    if (paymentMethod === '受托支付') {
        // 验证所有受托支付金额的总和
        if (!validateAllTrusteeAmounts()) {
            return;
        }
    }

    window.location.href = 'material-upload.html';
}

// 验证所有受托支付金额的总和
function validateAllTrusteeAmounts() {
    const loanAmountInput = document.getElementById('loan-amount');
    const loanAmount = parseFloat(loanAmountInput?.value) || 0;

    if (loanAmount <= 0) {
        showToast('请输入有效的借款金额');
        return false;
    }

    // 获取所有受托支付卡片中的金额输入框
    const trusteeCards = document.querySelectorAll('.trustee-payment-card');
    let totalTrusteeAmount = 0;
    let emptyCount = 0;

    trusteeCards.forEach(card => {
        const amountInput = card.querySelector('input[placeholder*="受托支付金额"]');
        if (amountInput) {
            const amount = parseFloat(amountInput.value) || 0;
            if (amount > 0) {
                totalTrusteeAmount += amount;
            } else {
                emptyCount++;
            }
        }
    });

    // 检查是否有未填写的金额
    if (emptyCount === trusteeCards.length) {
        showToast('请至少填写一组受托支付金额');
        return false;
    }

    // 检查总金额是否超过借款金额
    if (totalTrusteeAmount > loanAmount) {
        showToast(`受托支付金额总和(${totalTrusteeAmount.toFixed(2)}元)不能超过借款金额(${loanAmount.toFixed(2)}元)`);
        return false;
    }

    return true;
}

// 借款金额校验函数
function validateLoanAmount(input) {
    // 只允许输入数字和小数点
    input.value = input.value.replace(/[^\d.]/g, '');
    
    // 确保只有一个小数点
    const parts = input.value.split('.');
    if (parts.length > 2) {
        input.value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // 限制小数点后两位
    if (parts.length === 2 && parts[1].length > 2) {
        input.value = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    // 实时校验金额范围
    const amount = parseFloat(input.value);
    if (amount > 0) {
        // 这里应该根据实际业务逻辑获取授信额度
        // 暂时使用模拟值进行演示
        const creditLimit = 300000; // 模拟授信额度30万
        const maxAmount = Math.min(creditLimit, 200000); // 借款合同最大20万
        
        if (amount < 1) {
            showToast('借款金额不能少于1元');
            input.value = '';
            return false;
        }
        
        if (amount > creditLimit) {
            showToast('借款金额不能超过授信额度');
            input.value = '';
            return false;
        }
        
        if (amount > maxAmount) {
            showToast('借款合同金额不能超过20万元');
            input.value = '';
            return false;
        }
    }
    
    // 触发计算和按钮状态更新
    calculateLoanDetails();
    updateSubmitButton();
    return true;
}

// 格式化借款金额
function formatLoanAmount(input) {
    const amount = parseFloat(input.value);
    if (amount > 0) {
        // 格式化为两位小数
        input.value = amount.toFixed(2);
    }
}

// 显示Toast提示
function showToast(message) {
    // 创建或获取toast元素
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-info-icon">
                <img src="../src/assets/icons/info.svg" alt="提示">
            </div>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
    } else {
        toast.querySelector('span').textContent = message;
    }
    
    // 显示toast
    toast.classList.add('show');
    
    // 3秒后自动隐藏
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 显示借款金额帮助提示
function showAmountHelp() {
    const helpContent = `
        <div class="help-content">
            <div class="help-title">借款金额说明</div>
            <div class="help-item">
                <span class="help-label">• 借款金额范围：</span>
                <span class="help-text">1元 ≤ 金额 ≤ 授信额度</span>
            </div>
            <div class="help-item">
                <span class="help-label">• 借款合同限制：</span>
                <span class="help-text">金额 ≤ 授信额度 且 ≤ 20万元</span>
            </div>
            <div class="help-item">
                <span class="help-label">• 输入要求：</span>
                <span class="help-text">仅支持数字，最多两位小数</span>
            </div>
        </div>
    `;
    
    showHelpPopup(helpContent);
}

// 显示帮助弹窗
function showHelpPopup(content) {
    // 创建或获取帮助弹窗
    let helpPopup = document.querySelector('.help-popup');
    if (!helpPopup) {
        helpPopup = document.createElement('div');
        helpPopup.className = 'help-popup';
        helpPopup.innerHTML = `
            <div class="help-popup-content">
                <div class="help-popup-header">
                    <span class="help-popup-title">帮助说明</span>
                    <img src="../src/assets/icons/close.svg" alt="关闭" class="help-popup-close" onclick="closeHelpPopup()">
                </div>
                <div class="help-popup-body"></div>
            </div>
        `;
        document.body.appendChild(helpPopup);
    }
    
    // 更新内容
    helpPopup.querySelector('.help-popup-body').innerHTML = content;
    
    // 显示弹窗
    helpPopup.classList.add('show');
}

// 关闭帮助弹窗
function closeHelpPopup() {
    const helpPopup = document.querySelector('.help-popup');
    if (helpPopup) {
        helpPopup.classList.remove('show');
    }
}

// 更新提交按钮状态
function updateSubmitButton() {
    const loanAmountInput = document.getElementById('loan-amount');
    const agreementCheckbox = document.getElementById('agreement-checkbox');
    const submitBtn = document.getElementById('submit-btn');
    
    if (!loanAmountInput || !agreementCheckbox || !submitBtn) return;
    
    const isAmountValid = loanAmountInput.value && parseFloat(loanAmountInput.value) > 0;
    const isAgreementChecked = agreementCheckbox.checked;
    
    if (isAmountValid && isAgreementChecked) {
        submitBtn.classList.remove('btn-disabled');
        submitBtn.disabled = false;
    } else {
        submitBtn.classList.add('btn-disabled');
        submitBtn.disabled = true;
    }
}

// 验证受托支付金额


// 受托支付信息管理
let trusteePaymentCounter = 0;

// 初始化受托支付信息
function initializeTrusteePayments() {
    const list = document.getElementById('trustee-payment-list');
    if (list && list.children.length === 0) {
        addTrusteePayment();
    }
}

// 新增受托支付信息
function addTrusteePayment() {
    const list = document.getElementById('trustee-payment-list');
    if (!list) return;
    
    trusteePaymentCounter++;
    const paymentId = `trustee-payment-${trusteePaymentCounter}`;
    
    const paymentCard = document.createElement('div');
    paymentCard.className = 'trustee-payment-card';
    paymentCard.id = paymentId;
    
    paymentCard.innerHTML = `
        <div class="form-item">
            <div class="form-label">受托支付金额(元)</div>
            <div class="form-input">
                <input type="text" placeholder="请输入受托支付金额" onblur="validateTrusteePaymentAmount(this, '${paymentId}')">
            </div>
        </div>

        <div class="form-item">
            <div class="form-label">收款账户</div>
            <div class="form-input">
                <input type="text" placeholder="请输入收款账户" onblur="autoDetectBankForTrustee(this, '${paymentId}')">
            </div>
        </div>

        <div class="form-item">
            <div class="form-label">户名</div>
            <div class="form-input">
                <input type="text" placeholder="请输入户名">
            </div>
        </div>

        <div class="form-item">
            <div class="form-label">银行</div>
            <div class="form-input form-input-readonly" onclick="showBankSelectorForTrustee('${paymentId}')">
                <div class="form-input-text" id="receiver-bank-${paymentId}">请选择银行</div>
                <img src="../src/assets/icons/arrow-down.svg" alt="选择" class="input-arrow">
            </div>
        </div>

        <div class="form-item" onclick="showBranchSelectorForTrustee('${paymentId}')">
            <div class="form-label">网点</div>
            <div class="form-input form-input-readonly">
                <div class="form-input-text" id="receiver-branch-${paymentId}">请选择网点</div>
                <img src="../src/assets/icons/arrow-down.svg" alt="选择" class="input-arrow">
            </div>
        </div>

        <div class="trustee-payment-actions">
            <div class="trustee-payment-card-actions">
                <button class="btn-delete" onclick="deleteTrusteePayment('${paymentId}')">删除</button>
            </div>
            <button class="btn-add" onclick="addTrusteePayment()">新增</button>
        </div>
    `;
    
    list.appendChild(paymentCard);
}

// 验证受托支付金额
function validateTrusteePaymentAmount(input, paymentId) {
    input.value = input.value.replace(/[^\d.]/g, '');
    
    const parts = input.value.split('.');
    if (parts.length > 2) {
        input.value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    if (parts.length === 2 && parts[1].length > 2) {
        input.value = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    const trusteeAmount = parseFloat(input.value);
    const loanAmount = parseFloat(document.getElementById('loan-amount')?.value) || 0;
    
    if (trusteeAmount > 0 && loanAmount > 0) {
        if (trusteeAmount > loanAmount) {
            showToast('受托支付金额不能超过借款金额');
            input.value = '';
            return false;
        }
    }
    
    return true;
}

// 受托支付收款账户卡bin自动识别
function autoDetectBankForTrustee(input, paymentId) {
    const account = input.value.trim();
    
    if (account.length >= 6) {
        const cardBin = account.substring(0, 6);
        
        let bankName = '';
        if (cardBin.startsWith('6222')) {
            bankName = '东莞银行';
        } else if (cardBin.startsWith('6225')) {
            bankName = '中国工商银行';
        } else if (cardBin.startsWith('6228')) {
            bankName = '中国农业银行';
        } else if (cardBin.startsWith('6227')) {
            bankName = '中国建设银行';
        } else if (cardBin.startsWith('6226')) {
            bankName = '中国银行';
        }
        
        if (bankName) {
            const card = document.getElementById(paymentId);
            const bankElement = card.querySelector('.form-input-text');
            if (bankElement) {
                bankElement.textContent = bankName;
                bankElement.classList.add('form-input-emphasize');
                updateBranchDisplayForTrustee(bankName, paymentId);
            }
        }
    }
}

// 根据银行更新网点显示（受托支付）
function updateBranchDisplayForTrustee(bankName, paymentId) {
    const card = document.getElementById(paymentId);
    if (!card) return;
    
    const branchItem = card.querySelector('.form-item:last-child');
    if (branchItem) {
        if (bankName === '东莞银行') {
            branchItem.style.display = 'none';
        } else {
            branchItem.style.display = 'block';
        }
    }
}



// 删除受托支付信息
function deleteTrusteePayment(paymentId) {
    const card = document.getElementById(paymentId);
    if (!card) return;
    
    const list = document.getElementById('trustee-payment-list');
    if (list && list.children.length <= 1) {
        showToast('至少需要保留一组受托支付信息');
        return;
    }
    
    if (confirm('确定要删除这组受托支付信息吗？')) {
        card.remove();
    }
}



// 银行选择器（受托支付）
function showBankSelectorForTrustee(paymentId) {
    const options = ['东莞银行', '中国工商银行', '中国农业银行', '中国建设银行', '中国银行'];
    showBottomSelector('请选择银行', options, 'receiver-bank-' + paymentId, paymentId);
}

// 网点选择器（受托支付）
function showBranchSelectorForTrustee(paymentId) {
    const options = ['东莞分行营业部', '东莞东城支行', '东莞南城支行'];
    showBottomSelector('请选择网点', options, 'receiver-branch-' + paymentId, paymentId);
}
