// 上传页面 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const uploadedFiles = document.getElementById('uploaded-files');
    const submitBtn = document.getElementById('submit-btn');
    const uploadCount = document.querySelector('.upload-count');
    
    let files = [];
    const maxFiles = 100;

    // 点击上传区域
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });

    // 文件选择事件
    fileInput.addEventListener('change', function(e) {
        handleFiles(e.target.files);
    });

    // 拖拽上传
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    // 处理文件
    function handleFiles(selectedFiles) {
        const fileArray = Array.from(selectedFiles);
        
        // 检查文件数量限制
        if (files.length + fileArray.length > maxFiles) {
            alert(`最多只能上传${maxFiles}个文件`);
            return;
        }

        fileArray.forEach(file => {
            // 检查文件大小 (10MB限制)
            if (file.size > 10 * 1024 * 1024) {
                alert(`文件 ${file.name} 超过10MB，请选择更小的文件`);
                return;
            }

            // 检查文件类型
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 
                                'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                alert(`文件 ${file.name} 格式不支持`);
                return;
            }

            files.push({
                file: file,
                id: Date.now() + Math.random(),
                progress: 0,
                status: 'pending' // pending, uploading, completed, error
            });
        });

        updateUI();
        simulateUpload();
    }

    // 更新界面
    function updateUI() {
        updateUploadCount();
        renderFileList();
        
        if (files.length > 0) {
            uploadedFiles.style.display = 'block';
        } else {
            uploadedFiles.style.display = 'none';
        }
    }

    // 更新文件计数
    function updateUploadCount() {
        uploadCount.textContent = `${files.length}/${maxFiles}`;
    }

    // 渲染文件列表
    function renderFileList() {
        uploadedFiles.innerHTML = '';
        
        files.forEach(fileObj => {
            const fileItem = createFileItem(fileObj);
            uploadedFiles.appendChild(fileItem);
        });
    }

    // 创建文件项
    function createFileItem(fileObj) {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.dataset.fileId = fileObj.id;

        const fileExtension = getFileExtension(fileObj.file.name);
        const fileSize = formatFileSize(fileObj.file.size);

        div.innerHTML = `
            <div class="file-info">
                <div class="file-icon">${fileExtension.toUpperCase()}</div>
                <div class="file-details">
                    <div class="file-name">${fileObj.file.name}</div>
                    <div class="file-size">${fileSize}</div>
                    ${fileObj.status === 'uploading' ? `
                        <div class="upload-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${fileObj.progress}%"></div>
                            </div>
                            <div class="progress-text">${fileObj.progress}%</div>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="file-actions">
                <button class="file-delete" onclick="removeFile('${fileObj.id}')">
                    <svg viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </div>
        `;

        return div;
    }

    // 删除文件
    window.removeFile = function(fileId) {
        files = files.filter(f => f.id != fileId);
        updateUI();
    };

    // 模拟上传进度
    function simulateUpload() {
        files.forEach(fileObj => {
            if (fileObj.status === 'pending') {
                fileObj.status = 'uploading';
                
                const interval = setInterval(() => {
                    fileObj.progress += Math.random() * 20;
                    
                    if (fileObj.progress >= 100) {
                        fileObj.progress = 100;
                        fileObj.status = 'completed';
                        clearInterval(interval);
                    }
                    
                    updateUI();
                }, 200);
            }
        });
    }

    // 获取文件扩展名
    function getFileExtension(filename) {
        return filename.split('.').pop() || 'FILE';
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 提交按钮点击事件
    submitBtn.addEventListener('click', function() {
        if (files.length === 0) {
            alert('请上传贷款用途材料');
            return;
        }

        const incompleteFiles = files.filter(f => f.status !== 'completed');
        if (incompleteFiles.length > 0) {
            alert('请等待所有文件上传完成');
            return;
        }

        // 显示短信验证弹层
        showSmsModal();
    });

    // 短信验证弹层相关功能
    const smsModal = document.getElementById('sms-modal');
    const smsCodeInput = document.getElementById('sms-code-input');
    const getSmsCodeBtn = document.getElementById('get-sms-code');
    const closeSmsModalBtn = document.getElementById('close-sms-modal');
    const smsError = document.getElementById('sms-error');
    const deleteBtn = document.getElementById('delete-btn');
    
    let countdownTimer = null;
    let countdown = 60;

    // 显示短信验证弹层
    function showSmsModal() {
        smsModal.style.display = 'flex';
        smsCodeInput.value = '';
        smsError.style.display = 'none';
    }

    // 隐藏短信验证弹层
    function hideSmsModal() {
        smsModal.style.display = 'none';
        clearTimeout(countdownTimer);
        getSmsCodeBtn.textContent = '获取验证码';
        getSmsCodeBtn.classList.remove('disabled');
    }

    // 关闭按钮
    closeSmsModalBtn.addEventListener('click', hideSmsModal);

    // 点击蒙层关闭
    smsModal.addEventListener('click', function(e) {
        if (e.target === smsModal) {
            hideSmsModal();
        }
    });

    // 获取验证码
    getSmsCodeBtn.addEventListener('click', function() {
        if (this.classList.contains('disabled')) return;
        
        // 开始倒计时
        countdown = 60;
        this.classList.add('disabled');
        startCountdown();
        
        // 模拟发送验证码
        console.log('发送验证码');
    });

    // 倒计时功能
    function startCountdown() {
        getSmsCodeBtn.textContent = countdown + 's';
        
        countdownTimer = setTimeout(() => {
            countdown--;
            if (countdown > 0) {
                startCountdown();
            } else {
                getSmsCodeBtn.textContent = '获取验证码';
                getSmsCodeBtn.classList.remove('disabled');
            }
        }, 1000);
    }

    // 数字键盘点击事件
    const keyboardBtns = document.querySelectorAll('.keyboard-btn[data-num]');
    keyboardBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const num = this.dataset.num;
            if (smsCodeInput.value.length < 6) {
                smsCodeInput.value += num;
                smsError.style.display = 'none';
                
                // 如果输入满6位，自动验证
                if (smsCodeInput.value.length === 6) {
                    verifySmsCode();
                }
            }
        });
    });

    // 删除按钮
    deleteBtn.addEventListener('click', function() {
        if (smsCodeInput.value.length > 0) {
            smsCodeInput.value = smsCodeInput.value.slice(0, -1);
            smsError.style.display = 'none';
        }
    });

    // 验证短信验证码
    function verifySmsCode() {
        const code = smsCodeInput.value;
        
        // 模拟验证（实际应该调用后端接口）
        if (code === '090909') {
            // 验证成功
            hideSmsModal();
            console.log('提交文件:', files);
            alert('提交成功！');
        } else {
            // 验证失败
            smsError.style.display = 'block';
            smsCodeInput.value = '';
        }
    }
});
