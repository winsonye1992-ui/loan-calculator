// 金融机构平台页面逻辑

// 数据缓存管理器
const DataStorage = {
    // 获取表单数据
    getFormData: function() {
        const savedData = sessionStorage.getItem('applicationFormData');
        return savedData ? JSON.parse(savedData) : null;
    },

    // 获取税务认证数据
    getTaxData: function() {
        const savedData = sessionStorage.getItem('taxAuthData');
        return savedData ? JSON.parse(savedData) : null;
    },

    // 清空所有缓存数据
    clearAll: function() {
        sessionStorage.removeItem('applicationFormData');
        sessionStorage.removeItem('taxAuthData');
        sessionStorage.removeItem('authStatus');
        console.log('所有缓存数据已清空');
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // 页面加载时显示税务认证信息
    displayTaxInfo();

    // 为确认返回按钮添加事件监听
    const returnBtn = document.getElementById('return-btn');
    if (returnBtn) {
        returnBtn.addEventListener('click', handleReturnToApplication);
        console.log('确认返回按钮事件监听器已绑定');
    } else {
        console.error('未找到确认返回按钮');
    }
});

// 显示税务认证信息
function displayTaxInfo() {
    const taxData = DataStorage.getTaxData();
    const formData = DataStorage.getFormData();

    console.log('显示税务认证信息:', { taxData, formData });

    if (taxData || formData) {
        // 更新页面显示的企业信息（查询企业 = 税务授权企业）
        const companyElements = document.querySelectorAll('.info-value');
        if (companyElements.length >= 2) {
            // 第一个info-value显示企业名称（税务授权企业）
            const companyName = (taxData && taxData.companyName) || (formData && formData.companyName) || '东莞皮皮虾科技有限公司';
            companyElements[0].textContent = companyName;

            // 第二个info-value显示统一社会信用代码
            const creditCode = (taxData && taxData.creditCode) || '91441900MA4W123456';
            companyElements[1].textContent = creditCode;

            console.log('页面显示已更新:', {
                税务授权企业: companyName,
                统一社会信用代码: creditCode
            });
        }

        // 如果有税务数据，显示认证状态
        if (taxData) {
            console.log('税务认证状态:', taxData.authResult || '待认证');
        }
    } else {
        console.log('未找到税务认证数据');
    }
}

// 处理返回申请信息页面的逻辑
function handleReturnToApplication() {
    console.log('确认返回按钮被点击');

    try {
        // 获取现有的税务数据
        const taxData = DataStorage.getTaxData();
        const formData = DataStorage.getFormData();

        if (taxData) {
            // 更新税务认证结果为"认证成功"
            taxData.authResult = '认证成功';
            taxData.finalTimestamp = new Date().toISOString();

            // 确保税务授权企业信息正确
            if (formData && formData.companyName && !taxData.companyName) {
                taxData.companyName = formData.companyName;
            }

            // 保存更新后的税务数据
            sessionStorage.setItem('taxAuthData', JSON.stringify(taxData));
            console.log('税务认证结果已更新为"认证成功":', taxData);
        } else {
            console.log('未找到税务数据，创建新的税务认证记录');
            // 如果没有税务数据，创建新的
            const newTaxData = {
                companyName: (formData && formData.companyName) || '东莞皮皮虾科技有限公司',
                creditCode: '91441900MA4W123456',
                authResult: '认证成功',
                timestamp: new Date().toISOString(),
                finalTimestamp: new Date().toISOString()
            };
            sessionStorage.setItem('taxAuthData', JSON.stringify(newTaxData));
            console.log('新的税务认证记录已创建:', newTaxData);
        }

        // 跳转回申请信息登记页面
        console.log('准备跳转回申请信息登记页面');
        window.location.href = 'application-info.html';

    } catch (error) {
        console.error('处理返回申请信息页面时出错:', error);
        // 即使出错也要尝试跳转
        window.location.href = 'application-info.html';
    }
}
