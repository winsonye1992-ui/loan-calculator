// 数据缓存管理器
const DataStorage = {
    // 保存表单数据到sessionStorage
    saveFormData: function() {
        try {
            // 获取企业名称输入框
            const companyNameInput = document.getElementById('company-name');
            const companyName = companyNameInput ? companyNameInput.value : '';

            // 获取企业地址输入框
            const companyAddressInput = document.querySelector('textarea[placeholder="根据企业名称自动显示"]');
            const companyAddress = companyAddressInput ? companyAddressInput.value : '';

            // 获取是否有房选项
            const hasPropertyRadio = document.querySelector('input[name="hasProperty"]:checked');
            const hasProperty = hasPropertyRadio ? hasPropertyRadio.value : '';

            // 获取推荐人输入框
            const referrerInput = document.querySelector('input[placeholder*="推荐人"]');
            const referrer = referrerInput ? referrerInput.value : '';

            const formData = {
                companyName: companyName,
                companyAddress: companyAddress,
                hasProperty: hasProperty,
                referrer: referrer,
                timestamp: new Date().toISOString()
            };

            sessionStorage.setItem('applicationFormData', JSON.stringify(formData));
            console.log('表单数据已保存:', formData);
        } catch (error) {
            console.error('保存表单数据时出错:', error);
        }
    },

    // 从sessionStorage恢复表单数据
    restoreFormData: function() {
        const savedData = sessionStorage.getItem('applicationFormData');
        if (savedData) {
            try {
                const formData = JSON.parse(savedData);
                console.log('正在恢复表单数据:', formData);

                // 恢复企业名称
                if (formData.companyName) {
                    const companyNameInput = document.getElementById('company-name');
                    if (companyNameInput) {
                        companyNameInput.value = formData.companyName;
                    }
                }

                // 恢复企业地址
                if (formData.companyAddress) {
                    const addressInput = document.querySelector('textarea[placeholder="根据企业名称自动显示"]');
                    if (addressInput) {
                        addressInput.value = formData.companyAddress;
                    }
                }

                // 恢复是否有房选项
                if (formData.hasProperty) {
                    const radioBtn = document.querySelector(`input[name="hasProperty"][value="${formData.hasProperty}"]`);
                    if (radioBtn) {
                        radioBtn.checked = true;
                    }
                }

                // 恢复推荐人信息
                if (formData.referrer) {
                    const referrerInput = document.querySelector('input[placeholder*="推荐人"]');
                    if (referrerInput) {
                        referrerInput.value = formData.referrer;
                    }
                }

                console.log('表单数据恢复完成');
            } catch (error) {
                console.error('恢复表单数据失败:', error);
            }
        }
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

    // 恢复税务认证数据
    restoreTaxData: function() {
        const savedData = sessionStorage.getItem('taxAuthData');
        if (savedData) {
            try {
                const taxData = JSON.parse(savedData);
                console.log('正在恢复税务数据:', taxData);

                // 恢复税务授权企业
                if (taxData.companyName) {
                    const taxCompanyInput = document.getElementById('tax-company-input');
                    if (taxCompanyInput) {
                        taxCompanyInput.value = taxData.companyName;
                        console.log('税务授权企业已恢复:', taxData.companyName);
                    } else {
                        console.error('未找到税务授权企业输入框');
                    }
                }

                // 恢复税务认证结果
                if (taxData.authResult) {
                    const authResultInput = document.getElementById('tax-result-input');
                    if (authResultInput) {
                        authResultInput.value = taxData.authResult;
                        console.log('税务认证结果已恢复:', taxData.authResult);
                    } else {
                        console.error('未找到税务认证结果输入框');
                    }
                }

                console.log('税务数据恢复完成');
            } catch (error) {
                console.error('恢复税务数据失败:', error);
            }
        }
    },

    // 清空所有缓存数据
    clearAll: function() {
        sessionStorage.removeItem('applicationFormData');
        sessionStorage.removeItem('taxAuthData');
        sessionStorage.removeItem('authStatus');
        console.log('所有缓存数据已清空');
    }
};

// 自动调整textarea高度的函数
function autoResizeTextarea(textarea) {
    if (!textarea) return;

    // 保存当前值
    const currentValue = textarea.value;

    // 临时设置一个大的高度来获取准确的scrollHeight
    const originalHeight = textarea.style.height;
    textarea.style.height = 'auto';

    // 获取计算后的样式
    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = parseFloat(computedStyle.lineHeight);
    const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
    const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;

    // 计算内容高度
    const scrollHeight = textarea.scrollHeight;
    const contentHeight = scrollHeight - paddingTop - paddingBottom;

    // 计算行数
    const lines = Math.ceil(contentHeight / lineHeight);

    // 限制最大2行
    const maxLines = 2;
    const actualLines = Math.min(lines, maxLines);

    // 计算最终高度
    const finalHeight = (lineHeight * actualLines) + paddingTop + paddingBottom;

    // 设置最终高度
    textarea.style.height = finalHeight + 'px';

    console.log(`Textarea高度调整: 行数=${lines}, 限制行数=${actualLines}, 最终高度=${finalHeight}px`);
}

// 企业名称自动补充功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面DOM加载完成，开始初始化...');

    const companyNameInput = document.getElementById('company-name');
    const suggestionList = document.getElementById('suggestion-list');
    const companyAddressInput = document.querySelector('textarea[placeholder="根据企业名称自动显示"]');

    // 设置textarea自动高度调整
    if (companyNameInput) {
        companyNameInput.addEventListener('input', function() {
            autoResizeTextarea(this);
        });
        // 初始调整
        autoResizeTextarea(companyNameInput);
    }

    if (companyAddressInput) {
        companyAddressInput.addEventListener('input', function() {
            autoResizeTextarea(this);
        });
        // 初始调整
        autoResizeTextarea(companyAddressInput);
    }

    // 页面加载时恢复数据
    try {
        DataStorage.restoreFormData();
        DataStorage.restoreTaxData();

        // 数据恢复后重新调整高度
        setTimeout(() => {
            if (companyNameInput) autoResizeTextarea(companyNameInput);
            if (companyAddressInput) autoResizeTextarea(companyAddressInput);
        }, 100);

        console.log('数据恢复完成');
    } catch (error) {
        console.error('数据恢复过程中出错:', error);
    }

    // 为税务授权按钮添加额外的事件监听，确保功能正常
    const taxAuthBtn = document.getElementById('tax-auth-btn');
    if (taxAuthBtn) {
        taxAuthBtn.addEventListener('click', function(e) {
            console.log('税务授权按钮被点击（事件监听器）');
            handleTaxAuth();
        });
        console.log('税务授权按钮事件监听器已绑定');
    }

    // 企业数据
    const companyData = [
        {
            name: '东莞市莞城电子科技有限公司',
            address: '广东省东莞市莞城区东正路123号'
        },
        {
            name: '东莞市南城服装贸易有限公司',
            address: '广东省东莞市南城区鸿福路456号'
        },
        {
            name: '东莞市东城食品加工有限公司',
            address: '广东省东莞市东城区东城路789号'
        },
        {
            name: '东莞市虎门物流运输有限公司',
            address: '广东省东莞市虎门镇虎门大道101号'
        },
        {
            name: '东莞市长安机械制造有限公司',
            address: '广东省东莞市长安镇长安大道202号'
        },
        {
            name: '东莞市寮步建材贸易有限公司',
            address: '广东省东莞市寮步镇寮步路303号'
        }
    ];

    // 监听输入事件
    companyNameInput.addEventListener('input', function() {
        const inputValue = this.value.trim();
        
        if (inputValue.length === 0) {
            hideSuggestions();
            return;
        }

        // 过滤匹配的企业
        const matchedCompanies = companyData.filter(company => 
            company.name.toLowerCase().includes(inputValue.toLowerCase())
        );

        if (matchedCompanies.length > 0) {
            showSuggestions(matchedCompanies);
        } else {
            hideSuggestions();
        }
    });

    // 显示建议列表
    function showSuggestions(companies) {
        suggestionList.innerHTML = '';
        
        companies.forEach(company => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.setAttribute('data-company', company.name);
            suggestionItem.setAttribute('data-address', company.address);
            
            suggestionItem.innerHTML = `
                <div class="suggestion-name">${company.name}</div>
            `;
            
            suggestionItem.addEventListener('click', function() {
                selectCompany(company.name, company.address);
            });
            
            suggestionList.appendChild(suggestionItem);
        });
        
        suggestionList.style.display = 'block';
    }

    // 隐藏建议列表
    function hideSuggestions() {
        suggestionList.style.display = 'none';
    }

    // 选择企业
    function selectCompany(companyName, companyAddress) {
        companyNameInput.value = companyName;
        if (companyAddressInput) {
            companyAddressInput.value = companyAddress;
        }
        hideSuggestions();

        // 选择后调整高度
        setTimeout(() => {
            autoResizeTextarea(companyNameInput);
            if (companyAddressInput) {
                autoResizeTextarea(companyAddressInput);
            }
        }, 0);
    }

    // 点击其他地方隐藏建议列表
    document.addEventListener('click', function(e) {
        if (!companyNameInput.contains(e.target) && !suggestionList.contains(e.target)) {
            hideSuggestions();
        }
    });

    // 键盘导航
    companyNameInput.addEventListener('keydown', function(e) {
        const visibleSuggestions = suggestionList.querySelectorAll('.suggestion-item');
        const currentIndex = Array.from(visibleSuggestions).findIndex(item => 
            item.classList.contains('hover')
        );

        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                navigateSuggestions(visibleSuggestions, currentIndex, 1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                navigateSuggestions(visibleSuggestions, currentIndex, -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (currentIndex >= 0) {
                    const selectedItem = visibleSuggestions[currentIndex];
                    const companyName = selectedItem.getAttribute('data-company');
                    const companyAddress = selectedItem.getAttribute('data-address');
                    selectCompany(companyName, companyAddress);
                }
                break;
            case 'Escape':
                hideSuggestions();
                break;
        }
    });

    // 导航建议列表
    function navigateSuggestions(suggestions, currentIndex, direction) {
        suggestions.forEach(item => item.classList.remove('hover'));
        
        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = suggestions.length - 1;
        if (newIndex >= suggestions.length) newIndex = 0;
        
        if (suggestions[newIndex]) {
            suggestions[newIndex].classList.add('hover');
            suggestions[newIndex].scrollIntoView({ block: 'nearest' });
        }
    }
});

// 协议预览功能 - 一次性预览所有协议
function previewAgreement(type) {
    const modal = document.getElementById('agreement-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('agreement-content');
    const nextPageBtn = document.getElementById('next-page-btn');
    const confirmReadBtn = document.getElementById('confirm-read-btn');
    
    // 设置标题为"协议预览"
    modalTitle.textContent = '协议预览';
    
    // 定义所有协议内容
    const agreements = [
        {
            title: '个人信用信息(含个人征信)授权书',
            content: `
                <h3>个人信用信息(含个人征信)授权书</h3>
                <p>本人（以下简称"授权人"）因向东莞银行申请个人经营性贷款，特授权东莞银行（以下简称"被授权人"）向中国人民银行金融信用信息基础数据库、其他依法设立的征信机构查询、收集、使用本人的信用信息。</p>
                <p>授权范围包括但不限于：</p>
                <p>1. 个人基本信息：姓名、身份证号码、联系方式等；</p>
                <p>2. 信贷信息：贷款记录、还款记录、逾期记录等；</p>
                <p>3. 其他信用信息：法院判决、行政处罚等。</p>
                <p>授权用途：用于贷款审批、风险管理、贷后管理等银行业务。</p>
                <p>授权期限：自本授权书签署之日起至贷款结清后两年。</p>
                <p>本人已知悉并同意上述授权内容，承诺所提供的信息真实、准确、完整。</p>
            `
        },
        {
            title: '普通个人信息处理授权书',
            content: `
                <h3>普通个人信息处理授权书</h3>
                <p>本人（以下简称"授权人"）因向东莞银行申请个人经营性贷款，特授权东莞银行（以下简称"被授权人"）收集、使用、处理本人的个人信息。</p>
                <p>授权范围包括但不限于：</p>
                <p>1. 身份信息：身份证、户口本、结婚证等；</p>
                <p>2. 联系方式：手机号码、电子邮箱、通讯地址等；</p>
                <p>3. 职业信息：工作单位、职务、收入证明等；</p>
                <p>4. 资产信息：房产、车辆、存款、投资等。</p>
                <p>授权用途：用于贷款审批、风险评估、客户服务等银行业务。</p>
                <p>信息保护：被授权人承诺严格按照相关法律法规保护个人信息安全。</p>
                <p>本人已知悉并同意上述授权内容。</p>
            `
        },
        {
            title: '授权委托书',
            content: `
                <h3>授权委托书</h3>
                <p>本人（以下简称"委托人"）因向东莞银行申请个人经营性贷款，特委托东莞银行（以下简称"受托人"）代为办理相关业务。</p>
                <p>委托事项包括但不限于：</p>
                <p>1. 向相关机构查询、收集委托人的信用信息；</p>
                <p>2. 向相关机构查询、收集委托人的财产信息；</p>
                <p>3. 代为签署相关法律文件；</p>
                <p>4. 代为办理贷款相关手续。</p>
                <p>委托权限：特别授权，受托人有权在授权范围内独立行使相关权利。</p>
                <p>委托期限：自本委托书签署之日起至贷款结清。</p>
                <p>委托人承诺：所提供的信息真实、准确、完整，并承担因虚假信息造成的一切后果。</p>
            `
        }
    ];
    
    // 初始化协议预览状态
    window.currentAgreementIndex = 0;
    window.agreements = agreements;
    
    // 显示第一个协议
    showAgreementPage(0);
    
    // 显示弹层
    modal.style.display = 'block';
    
    // 记录协议预览日志
    logAgreementPreview('all');
}

// 显示指定页面的协议
function showAgreementPage(index) {
    const modalContent = document.getElementById('agreement-content');
    const nextPageBtn = document.getElementById('next-page-btn');
    const confirmReadBtn = document.getElementById('confirm-read-btn');
    
    if (index < window.agreements.length) {
        const agreement = window.agreements[index];
        modalContent.innerHTML = `
            <div class="agreement-page">
                <h2>${agreement.title}</h2>
                ${agreement.content}
            </div>
        `;
        
        // 根据是否是最后一页显示不同的按钮
        if (index === window.agreements.length - 1) {
            // 最后一页，显示"已阅读，本人已知晓上述内容"按钮
            nextPageBtn.style.display = 'none';
            confirmReadBtn.style.display = 'block';
        } else {
            // 不是最后一页，显示"下一页"按钮
            nextPageBtn.style.display = 'block';
            confirmReadBtn.style.display = 'none';
        }
    }
}

// 下一页协议
function nextAgreementPage() {
    if (window.currentAgreementIndex < window.agreements.length - 1) {
        window.currentAgreementIndex++;
        showAgreementPage(window.currentAgreementIndex);
    }
}

function closeAgreementModal() {
    const modal = document.getElementById('agreement-modal');
    modal.style.display = 'none';
}

function logAgreementPreview(type) {
    // 记录协议预览操作日志
    const logData = {
        type: type,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        deviceId: getDeviceId()
    };
    
    console.log('协议预览日志:', logData);
    // 这里可以发送到服务器记录日志
}

function getDeviceId() {
    // 简单的设备ID生成，实际项目中可能需要更复杂的逻辑
    return 'device_' + Math.random().toString(36).substr(2, 9);
}

// 税务授权按钮点击处理函数
function handleTaxAuth() {
    console.log('税务授权按钮被点击');

    // 首先尝试保存表单数据
    try {
        DataStorage.saveFormData();
        console.log('表单数据保存成功');
    } catch (error) {
        console.error('保存表单数据失败，但继续跳转:', error);
    }

    // 无论如何都要跳转
    try {
        window.location.href = 'tax-authorization.html';
        console.log('正在跳转到税务授权页面');
    } catch (error) {
        console.error('跳转失败:', error);
        // 如果跳转失败，尝试其他方式
        window.location.replace('tax-authorization.html');
    }
}

// 提交按钮点击处理函数
function handleSubmit() {
    // 在最终提交前保存一次当前数据
    DataStorage.saveFormData();

    // 获取最终的表单数据和税务数据用于提交
    const formData = sessionStorage.getItem('applicationFormData');
    const taxData = sessionStorage.getItem('taxAuthData');
    const authStatus = sessionStorage.getItem('authStatus');

    console.log('最终提交数据:', {
        formData: formData ? JSON.parse(formData) : null,
        taxData: taxData ? JSON.parse(taxData) : null,
        authStatus: authStatus ? JSON.parse(authStatus) : null
    });

    // 这里可以添加实际的提交逻辑
    // 例如发送到服务器保存数据

    // 清空所有缓存数据
    DataStorage.clearAll();

    // 跳转到人脸识别页面
    window.location.href = 'face-recognition.html';
}
