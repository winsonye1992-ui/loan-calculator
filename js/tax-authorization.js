// 税务认证授权页面逻辑

// 数据缓存管理器（与application-info.js共享）
const DataStorage = {
    // 从sessionStorage获取表单数据
    getFormData: function() {
        const savedData = sessionStorage.getItem('applicationFormData');
        return savedData ? JSON.parse(savedData) : null;
    },

    // 保存税务认证数据
    saveTaxData: function(taxData) {
        const data = {
            ...taxData,
            timestamp: new Date().toISOString()
        };
        sessionStorage.setItem('taxAuthData', JSON.stringify(data));
        console.log('税务数据已保存:', data);
    },

    // 清空所有缓存数据
    clearAll: function() {
        sessionStorage.removeItem('applicationFormData');
        sessionStorage.removeItem('taxAuthData');
        sessionStorage.removeItem('authStatus');
        console.log('所有缓存数据已清空');
    }
};

// 保存税务认证数据
function saveTaxAuthData() {
    const taxData = {
        creditCode: document.querySelector('input[placeholder*="统一社会信用代码"]').value.trim(),
        taxId: document.querySelector('input[placeholder*="纳税人识别号"]').value.trim(),
        captcha: document.querySelector('input[placeholder*="请输入验证码"]').value.trim(),
        companyName: '', // 从表单数据中获取
        authResult: '待认证'
    };

    // 从缓存中获取企业名称
    const formData = DataStorage.getFormData();
    if (formData && formData.companyName) {
        taxData.companyName = formData.companyName;
    }

    DataStorage.saveTaxData(taxData);
}

// 处理确认授权按钮点击
function handleConfirmAuth() {
    console.log('确认授权按钮被点击');

    // 保存税务认证信息
    try {
        saveTaxAuthData();
        console.log('税务数据保存成功');
    } catch (error) {
        console.error('保存税务数据失败，但继续跳转:', error);
    }

    // 跳转到授权协议页面
    try {
        window.location.href = 'authorization-agreement.html';
        console.log('正在跳转到授权协议页面');
    } catch (error) {
        console.error('跳转失败:', error);
        // 如果跳转失败，尝试其他方式
        window.location.replace('authorization-agreement.html');
    }

    return false; // 防止表单提交或其他默认行为
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('税务认证页面DOM加载完成');

    // 页面加载时恢复表单数据用于税务认证
    const formData = DataStorage.getFormData();
    if (formData) {
        console.log('税务认证页面获取到表单数据:', formData);

        // 如果有企业名称，可以预填到税务表单中
        if (formData.companyName) {
            console.log('企业名称:', formData.companyName);
            // 这里可以根据业务需求预填税务表单
        }
    }

    // 为确认授权按钮添加事件监听
    const confirmAuthBtn = document.getElementById('confirm-auth-btn');
    if (confirmAuthBtn) {
        confirmAuthBtn.addEventListener('click', handleConfirmAuth);
        console.log('确认授权按钮事件监听器已绑定');
    } else {
        console.error('未找到确认授权按钮');
    }
});

// 获取验证码按钮点击处理（如果需要）
function getCaptcha() {
    console.log('获取验证码');
    // 这里可以添加获取验证码的逻辑
}

// 验证码输入处理（如果需要）
function handleCaptchaInput() {
    // 这里可以添加验证码输入验证逻辑
}
