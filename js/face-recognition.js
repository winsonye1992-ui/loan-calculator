// 人脸识别页面交互逻辑

document.addEventListener('DOMContentLoaded', function() {
    const agreeCheckbox = document.getElementById('face-agree-checkbox');
    const startBtn = document.getElementById('start-face-btn');
    const statusMessage = document.getElementById('status-message');
    const faceCircle = document.getElementById('face-circle');

    // 监听勾选框状态变化
    agreeCheckbox.addEventListener('change', function() {
        if (this.checked) {
            startBtn.disabled = false;
            startBtn.classList.remove('btn-disabled');
        } else {
            startBtn.disabled = true;
            startBtn.classList.add('btn-disabled');
        }
    });

    // 监听开始人脸识别按钮点击
    startBtn.addEventListener('click', function() {
        if (!this.disabled) {
            // 开始人脸识别流程
            startFaceRecognition();
        }
    });

    // 人脸识别流程
    function startFaceRecognition() {
        // 禁用按钮
        startBtn.disabled = true;
        startBtn.classList.add('btn-disabled');
        startBtn.querySelector('.btn-text').textContent = '识别中...';
        
        // 更新状态提示
        statusMessage.innerHTML = '<div class="status-text recognizing">正在人脸识别...</div>';
        
        // 添加识别中的动画效果
        faceCircle.classList.add('recognizing');
        
        // 模拟人脸识别过程（3秒后完成）
        setTimeout(function() {
            // 识别成功
            statusMessage.innerHTML = '<div class="status-text success">人脸识别成功</div>';
            faceCircle.classList.remove('recognizing');
            faceCircle.classList.add('success');
            
            // 2秒后自动跳转到申请结果页
            setTimeout(function() {
                window.location.href = 'application-result.html';
            }, 2000);
        }, 3000);
    }
});
