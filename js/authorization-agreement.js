// 授权书页面交互逻辑

// 数据缓存管理器
const DataStorage = {
    // 保存授权状态
    saveAuthStatus: function(status) {
        const authStatus = {
            agreed: status,
            timestamp: new Date().toISOString()
        };
        sessionStorage.setItem('authStatus', JSON.stringify(authStatus));
        console.log('授权状态已保存:', authStatus);
    },

    // 获取税务认证数据
    getTaxData: function() {
        const savedData = sessionStorage.getItem('taxAuthData');
        return savedData ? JSON.parse(savedData) : null;
    },

    // 更新税务认证结果
    updateTaxAuthResult: function(result) {
        const taxData = this.getTaxData();
        if (taxData) {
            taxData.authResult = result;
            taxData.authTimestamp = new Date().toISOString();
            sessionStorage.setItem('taxAuthData', JSON.stringify(taxData));
            console.log('税务认证结果已更新:', result);
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const agreeCheckbox = document.getElementById('agree-checkbox');
    const nextBtn = document.getElementById('next-btn');
    const redirectModal = document.getElementById('redirect-modal');
    const modalClose = document.getElementById('modal-close');

    // 监听勾选框状态变化
    agreeCheckbox.addEventListener('change', function() {
        if (this.checked) {
            nextBtn.disabled = false;
            nextBtn.classList.remove('btn-disabled');
        } else {
            nextBtn.disabled = true;
            nextBtn.classList.add('btn-disabled');
        }
    });

    // 监听下一步按钮点击
    nextBtn.addEventListener('click', function() {
        if (!this.disabled) {
            // 保存授权状态
            DataStorage.saveAuthStatus(true);
            // 更新税务认证结果
            DataStorage.updateTaxAuthResult('已授权');

            // 显示跳转提示弹窗
            redirectModal.style.display = 'flex';

            // 3秒后自动关闭弹窗并跳转
            setTimeout(function() {
                redirectModal.style.display = 'none';
                // 跳转到金融机构平台
                window.location.href = 'financial-platform.html';
            }, 3000);
        }
    });

    // 监听弹窗关闭按钮
    modalClose.addEventListener('click', function() {
        redirectModal.style.display = 'none';
    });

    // 点击弹窗背景关闭
    redirectModal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });
});
