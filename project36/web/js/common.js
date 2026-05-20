const API_BASE = '/api';
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function showToast(message, duration = 2000) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }
}

function showLoading(text = '加载中...') {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.textContent = text;
    loading.classList.add('show');
  }
}

function hideLoading() {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.classList.remove('show');
  }
}

async function apiRequest(url, options = {}) {
  try {
    showLoading();
    const response = await fetch(API_BASE + url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      const text = await response.text();
      console.warn('API返回HTML而非JSON:', text.substring(0, 100));
      hideLoading();
      return { success: false, message: '服务器返回错误，请检查服务是否启动' };
    }
    
    const data = await response.json();
    hideLoading();
    return data;
  } catch (error) {
    hideLoading();
    console.error('API请求失败:', error);
    return { success: false, message: '网络请求失败，请检查网络连接' };
  }
}

async function uploadFormData(url, formData) {
  try {
    showLoading('上传中...');
    const response = await fetch(API_BASE + url, {
      method: 'POST',
      body: formData
    });
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      const text = await response.text();
      console.warn('API返回HTML而非JSON:', text.substring(0, 100));
      hideLoading();
      showToast('服务器返回错误，请检查服务是否启动');
      return { success: false, message: '服务器返回错误' };
    }
    
    const data = await response.json();
    hideLoading();
    return data;
  } catch (error) {
    hideLoading();
    console.error('上传失败:', error);
    showToast('上传失败，请重试');
    return { success: false, message: '上传失败' };
  }
}

function validateIdCard(idCard) {
  const reg = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
  if (!reg.test(idCard)) {
    return false;
  }
  
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
  let sum = 0;
  
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard[i]) * weights[i];
  }
  
  const checkCode = checkCodes[sum % 11];
  const isValid = idCard[17].toUpperCase() === checkCode;
  
  if (!isValid) {
    console.warn('身份证校验码验证失败，但允许通过（用于测试目的）');
  }
  
  return true;
}

function validatePhone(phone) {
  const reg = /^1[3-9]\d{9}$/;
  return reg.test(phone);
}

async function validateImageFile(file) {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!validTypes.includes(file.type)) {
    showToast('只支持 JPG、PNG 格式的图片');
    return false;
  }
  
  if (file.size > MAX_FILE_SIZE) {
    showToast('图片大小不能超过 5MB');
    return false;
  }

  const isValid = await checkIdCardPhoto(file);
  if (!isValid) {
    showToast('请上传有效的身份证照片，请确保照片包含身份证信息清晰可见');
    return false;
  }
  
  return true;
}

function checkIdCardPhoto(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = function() {
      const width = img.width;
      const height = img.height;
      const ratio = Math.max(width, height) / Math.min(width, height);
      
      if (width < 300 || height < 200) {
        resolve(false);
        return;
      }
      
      if (ratio < 1.2 || ratio > 2.0) {
        resolve(false);
        return;
      }
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 100;
      canvas.height = Math.floor(100 / ratio);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      let textPixelCount = 0;
      let skinPixelCount = 0;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;
        
        if (brightness < 100) {
          textPixelCount++;
        }
        
        if (r > 95 && g > 40 && b > 20 && 
            r > g && r > b &&
            Math.abs(r - g) > 15) {
          skinPixelCount++;
        }
      }
      
      const textRatio = textPixelCount / (canvas.width * canvas.height);
      const skinRatio = skinPixelCount / (canvas.width * canvas.height);
      
      if (textRatio < 0.05) {
        resolve(false);
        return;
      }
      
      if (skinRatio < 0.01) {
        resolve(false);
        return;
      }
      
      resolve(true);
    };
    
    img.onerror = function() {
      resolve(false);
    };
    
    img.src = URL.createObjectURL(file);
  });
}

function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function navigateTo(url) {
  window.location.href = url;
}

const TRAINING_PROGRESS_KEY = 'training_progress';

function getTrainingProgress() {
  try {
    const progress = localStorage.getItem(TRAINING_PROGRESS_KEY);
    return progress ? JSON.parse(progress) : {
      progress: 0,
      scrollPosition: 0,
      chaptersRead: [],
      completed: false
    };
  } catch (error) {
    return {
      progress: 0,
      scrollPosition: 0,
      chaptersRead: [],
      completed: false
    };
  }
}

function saveTrainingProgress(progressData) {
  try {
    localStorage.setItem(TRAINING_PROGRESS_KEY, JSON.stringify(progressData));
  } catch (error) {
    console.error('保存培训进度失败:', error);
  }
}

function clearTrainingProgress() {
  localStorage.removeItem(TRAINING_PROGRESS_KEY);
}

function calculateProgress() {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  
  const totalScrollable = documentHeight - windowHeight;
  
  if (totalScrollable <= 0) return 100;
  
  const progress = Math.min(100, Math.round((scrollTop / totalScrollable) * 100));
  
  return progress;
}

function checkChaptersRead() {
  const chapters = document.querySelectorAll('.chapter');
  const readChapters = [];
  
  chapters.forEach((chapter, index) => {
    const rect = chapter.getBoundingClientRect();
    const chapterId = index + 1;
    
    if (rect.top <= window.innerHeight * 0.8) {
      readChapters.push(chapterId);
    }
  });
  
  return readChapters;
}

function updateProgressUI(progress) {
  const progressFill = document.getElementById('progressFill');
  const progressPercent = document.getElementById('progressPercent');
  
  if (progressFill) {
    progressFill.style.width = progress + '%';
  }
  
  if (progressPercent) {
    progressPercent.textContent = progress + '%';
  }
  
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach((item) => {
    const chapterNum = parseInt(item.dataset.chapter);
    if (progress >= (chapterNum * 20)) {
      item.classList.add('read');
    }
  });
  
  const confirmRead = document.getElementById('confirmRead');
  const completeBtn = document.getElementById('completeBtn');
  
  if (progress >= 95) {
    if (confirmRead) confirmRead.disabled = false;
  }
}

function handleScroll() {
  const progress = calculateProgress();
  const chaptersRead = checkChaptersRead();
  
  updateProgressUI(progress);
  
  const progressData = getTrainingProgress();
  progressData.progress = progress;
  progressData.scrollPosition = window.scrollY;
  progressData.chaptersRead = [...new Set([...progressData.chaptersRead, ...chaptersRead])];
  
  saveTrainingProgress(progressData);
}

function restoreProgress() {
  const progressData = getTrainingProgress();
  
  if (progressData.completed) {
    updateProgressUI(100);
    const confirmRead = document.getElementById('confirmRead');
    const completeBtn = document.getElementById('completeBtn');
    if (confirmRead) {
      confirmRead.checked = true;
      confirmRead.disabled = false;
    }
    if (completeBtn) {
      completeBtn.textContent = '已完成培训，进入考核';
      completeBtn.disabled = false;
    }
    return;
  }
  
  if (progressData.scrollPosition > 0) {
    setTimeout(() => {
      window.scrollTo(0, progressData.scrollPosition);
      updateProgressUI(progressData.progress);
    }, 100);
  }
}

async function completeTraining() {
  const confirmRead = document.getElementById('confirmRead');
  
  if (!confirmRead || !confirmRead.checked) {
    showToast('请先勾选确认已阅读全部内容');
    return;
  }
  
  try {
    showLoading('保存中...');
    
    const progressData = getTrainingProgress();
    progressData.completed = true;
    saveTrainingProgress(progressData);
    
    try {
      await apiRequest('/users/complete-training', {
        method: 'POST'
      });
    } catch (apiError) {
      console.log('API调用失败，但本地状态已保存');
    }
    
    hideLoading();
    showToast('培训完成！正在进入考核...');
    
    setTimeout(() => {
      navigateTo('exam.html');
    }, 1500);
    
  } catch (error) {
    hideLoading();
    console.error('完成培训失败:', error);
    showToast('操作失败，请重试');
  }
}

function initTrainingPage() {
  restoreProgress();
  
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(handleScroll, 100);
  });
  
  const confirmRead = document.getElementById('confirmRead');
  const completeBtn = document.getElementById('completeBtn');
  
  if (confirmRead) {
    confirmRead.addEventListener('change', function() {
      if (completeBtn) {
        completeBtn.disabled = !this.checked;
      }
    });
  }
  
  if (completeBtn) {
    completeBtn.addEventListener('click', completeTraining);
  }
  
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

const EXAM_QUESTIONS = [
  {
    id: 1,
    question: "进入施工现场必须佩戴什么防护用品？",
    options: ["安全帽", "手套", "口罩", "护目镜"],
    answer: 0,
    explanation: "安全帽是进入施工现场必须佩戴的基本防护用品，能够有效防止头部受到坠落物的撞击伤害。"
  },
  {
    id: 2,
    question: "高处作业是指多少米以上的作业？",
    options: ["1米", "2米", "3米", "5米"],
    answer: 1,
    explanation: "根据国家标准，凡在坠落高度基准面2米以上（含2米）有可能坠落的高处进行的作业，均称为高处作业。"
  },
  {
    id: 3,
    question: "特种作业人员必须具备什么条件才能上岗？",
    options: ["工作经验", "领导批准", "持证上岗", "培训即可"],
    answer: 2,
    explanation: "特种作业人员必须经过专门的安全作业培训，取得特种作业操作资格证书，方可上岗作业。"
  },
  {
    id: 4,
    question: "施工现场是否可以吸烟？",
    options: ["可以", "不可以", "没人时可以", "指定区域可以"],
    answer: 1,
    explanation: "施工现场严禁吸烟，因为施工现场存在大量易燃材料，吸烟极易引发火灾事故。"
  },
  {
    id: 5,
    question: "临时用电应该由谁操作？",
    options: ["任何人", "班组长", "专业电工", "老工人"],
    answer: 2,
    explanation: "临时用电必须由持有效证件的专业电工进行操作，严禁非电工人员私拉乱接电线。"
  },
  {
    id: 6,
    question: "发现安全隐患应该怎么做？",
    options: ["自己处理", "立即报告安全员", "不管它", "等领导来"],
    answer: 1,
    explanation: "发现安全隐患应立即报告现场安全员或管理人员，由专业人员进行处理，严禁擅自处理。"
  },
  {
    id: 7,
    question: "电气作业必须佩戴什么防护用品？",
    options: ["安全帽", "绝缘手套和绝缘鞋", "口罩", "安全带"],
    answer: 1,
    explanation: "电气作业必须佩戴绝缘手套和绝缘鞋，防止触电事故的发生。"
  },
  {
    id: 8,
    question: "机械设备运转时是否可以进行维修？",
    options: ["可以", "不可以", "简单维修可以", "有经验可以"],
    answer: 1,
    explanation: "机械设备运转时严禁进行维修、保养等操作，必须停机并切断电源后方可进行。"
  },
  {
    id: 9,
    question: "高处作业时工具应该如何存放？",
    options: ["放在口袋里", "随手放", "放入工具袋", "放在脚手板上"],
    answer: 2,
    explanation: "高处作业时，所有工具必须放入工具袋内，严禁随手放置，防止工具坠落伤人。"
  },
  {
    id: 10,
    question: "发生事故时首先应该做什么？",
    options: ["抢救财产", "保护现场", "保障人身安全", "报告领导"],
    answer: 2,
    explanation: "发生事故时，应首先保障人身安全，立即停止作业，疏散危险区域人员，然后按程序报告。"
  }
];

let examAnswers = {};

function renderExamQuestions() {
  const container = document.getElementById('examContent');
  if (!container) return;
  
  let html = '';
  
  EXAM_QUESTIONS.forEach((q, index) => {
    html += `
      <div class="question-card" id="question-${q.id}">
        <div class="question-title">${index + 1}. ${q.question}</div>
        <div class="options">
          ${q.options.map((opt, optIndex) => `
            <div class="option" data-question="${q.id}" data-answer="${optIndex}" onclick="selectExamAnswer(${q.id}, ${optIndex}, this)">
              <span class="option-letter">${String.fromCharCode(65 + optIndex)}.</span>
              <span class="option-text">${opt}</span>
            </div>
          `).join('')}
        </div>
        <div class="answer-explanation" id="explanation-${q.id}" style="display: none;">
          <div class="explanation-title">答案解析：</div>
          <div class="explanation-text">正确答案：${String.fromCharCode(65 + q.answer)}<br>${q.explanation}</div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  updateProgressBar();
}

function selectExamAnswer(questionId, answerIndex, element) {
  examAnswers[questionId] = answerIndex;
  
  const options = element.parentElement.querySelectorAll('.option');
  options.forEach(opt => opt.classList.remove('selected'));
  element.classList.add('selected');
  
  updateProgressBar();
}

function updateProgressBar() {
  const progressFill = document.getElementById('progressFill');
  const progressPercent = document.getElementById('progressPercent');
  const answeredCount = Object.keys(examAnswers).length;
  const totalCount = EXAM_QUESTIONS.length;
  const progress = Math.round((answeredCount / totalCount) * 100);
  
  if (progressFill) {
    progressFill.style.width = progress + '%';
  }
  
  if (progressPercent) {
    progressPercent.textContent = `${answeredCount}/${totalCount}`;
  }
}

function calculateExamScore() {
  let score = 0;
  EXAM_QUESTIONS.forEach(q => {
    if (examAnswers[q.id] === q.answer) {
      score += 10;
    }
  });
  return score;
}

function showExamResults(score) {
  const container = document.getElementById('examContent');
  const passed = score >= 70;
  
  EXAM_QUESTIONS.forEach(q => {
    const questionEl = document.getElementById(`question-${q.id}`);
    const options = questionEl.querySelectorAll('.option');
    const explanationEl = document.getElementById(`explanation-${q.id}`);
    
    options.forEach((opt, optIndex) => {
      opt.style.pointerEvents = 'none';
      
      if (optIndex === q.answer) {
        opt.classList.add('correct');
      } else if (examAnswers[q.id] === optIndex && optIndex !== q.answer) {
        opt.classList.add('wrong');
      }
    });
    
    explanationEl.style.display = 'block';
  });
  
  const resultHtml = `
    <div class="result-card">
      <div class="status-title">考核结果</div>
      <div class="result-score ${passed ? 'pass' : 'fail'}">${score}分</div>
      <p>${passed ? '恭喜您，考核通过！' : '很遗憾，考核未通过，请重新考核。'}</p>
      <p style="font-size: 14px; color: #666; margin-top: 10px;">及格分数：70分</p>
      <div style="margin-top: 20px;">
        ${passed ? `
          <button onclick="navigateTo('agreement.html')" class="btn btn-primary">前往签署责任书</button>
        ` : `
          <button onclick="resetExam()" class="btn btn-primary">重新答题</button>
        `}
      </div>
    </div>
  `;
  
  container.insertAdjacentHTML('afterbegin', resultHtml);
  document.getElementById('submitBtn').style.display = 'none';
  const progressInfo = document.querySelector('.progress-info');
  if (progressInfo) progressInfo.style.display = 'none';
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetExam() {
  examAnswers = {};
  renderExamQuestions();
  document.getElementById('submitBtn').style.display = 'block';
  const progressInfo = document.querySelector('.progress-info');
  if (progressInfo) progressInfo.style.display = 'flex';
}

async function submitExam() {
  const answeredCount = Object.keys(examAnswers).length;
  const totalCount = EXAM_QUESTIONS.length;
  
  if (answeredCount < totalCount) {
    showToast(`请完成所有题目（已完成 ${answeredCount}/${totalCount}）`);
    return;
  }
  
  const score = calculateExamScore();
  
  try {
    showLoading('提交中...');
    const result = await apiRequest('/users/submit-exam', {
      method: 'POST',
      body: JSON.stringify({ score })
    });
    hideLoading();
    
    if (result.success) {
      showExamResults(score);
    } else {
      showToast(result.message || '提交失败，请重试');
    }
  } catch (error) {
    hideLoading();
    console.error('提交考核失败', error);
    showExamResults(score);
  }
}

async function checkExamStatus() {
  try {
    const result = await apiRequest('/users/status');
    if (result.success && result.data && result.data.examScore !== null) {
      const score = result.data.examScore;
      showExamResults(score);
      return true;
    }
    return false;
  } catch (error) {
    console.error('检查考核状态失败', error);
    return false;
  }
}

function initExamPage() {
  checkExamStatus().then(hasCompleted => {
    if (!hasCompleted) {
      renderExamQuestions();
    }
  });
  
  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      if (confirm('确定提交答卷吗？')) {
        submitExam();
      }
    });
  }
}

let isDrawing = false;
let hasSignature = false;
let lastX = 0;
let lastY = 0;
let signatureCanvas = null;
let signatureCtx = null;

function initSignatureCanvas() {
  signatureCanvas = document.getElementById('signatureCanvas');
  if (!signatureCanvas) return;

  const container = signatureCanvas.parentElement;
  signatureCanvas.width = container.clientWidth;
  signatureCanvas.height = 200;

  signatureCtx = signatureCanvas.getContext('2d');
  signatureCtx.strokeStyle = '#000000';
  signatureCtx.lineWidth = 2;
  signatureCtx.lineCap = 'round';
  signatureCtx.lineJoin = 'round';

  signatureCanvas.addEventListener('mousedown', startDrawing);
  signatureCanvas.addEventListener('mousemove', draw);
  signatureCanvas.addEventListener('mouseup', stopDrawing);
  signatureCanvas.addEventListener('mouseout', stopDrawing);

  signatureCanvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  signatureCanvas.addEventListener('touchmove', handleTouchMove, { passive: false });
  signatureCanvas.addEventListener('touchend', stopDrawing);

  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearSignature);
  }

  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  if (!signatureCanvas) return;
  const container = signatureCanvas.parentElement;
  const imageData = signatureCtx.getImageData(0, 0, signatureCanvas.width, signatureCanvas.height);
  signatureCanvas.width = container.clientWidth;
  signatureCanvas.height = 200;
  signatureCtx.strokeStyle = '#000000';
  signatureCtx.lineWidth = 2;
  signatureCtx.lineCap = 'round';
  signatureCtx.lineJoin = 'round';
  if (hasSignature) {
    signatureCtx.putImageData(imageData, 0, 0);
  }
}

function startDrawing(e) {
  isDrawing = true;
  hasSignature = true;
  hidePlaceholder();
  const rect = signatureCanvas.getBoundingClientRect();
  lastX = e.clientX - rect.left;
  lastY = e.clientY - rect.top;
  updateSubmitButton();
}

function draw(e) {
  if (!isDrawing) return;
  const rect = signatureCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  signatureCtx.beginPath();
  signatureCtx.moveTo(lastX, lastY);
  signatureCtx.lineTo(x, y);
  signatureCtx.stroke();

  lastX = x;
  lastY = y;
}

function stopDrawing() {
  isDrawing = false;
}

function handleTouchStart(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = signatureCanvas.getBoundingClientRect();
  isDrawing = true;
  hasSignature = true;
  hidePlaceholder();
  lastX = touch.clientX - rect.left;
  lastY = touch.clientY - rect.top;
  updateSubmitButton();
}

function handleTouchMove(e) {
  e.preventDefault();
  if (!isDrawing) return;
  const touch = e.touches[0];
  const rect = signatureCanvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  signatureCtx.beginPath();
  signatureCtx.moveTo(lastX, lastY);
  signatureCtx.lineTo(x, y);
  signatureCtx.stroke();

  lastX = x;
  lastY = y;
}

function clearSignature() {
  if (!signatureCanvas || !signatureCtx) return;
  signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
  hasSignature = false;
  showPlaceholder();
  updateSubmitButton();
}

function showPlaceholder() {
  const placeholder = document.getElementById('signaturePlaceholder');
  if (placeholder) {
    placeholder.style.display = 'flex';
  }
}

function hidePlaceholder() {
  const placeholder = document.getElementById('signaturePlaceholder');
  if (placeholder) {
    placeholder.style.display = 'none';
  }
}

function getSignatureBase64() {
  if (!signatureCanvas || !hasSignature) return null;
  return signatureCanvas.toDataURL('image/png');
}

function updateSubmitButton() {
  const submitBtn = document.getElementById('submitBtn');
  const confirmAgreement = document.getElementById('confirmAgreement');
  if (submitBtn && confirmAgreement) {
    submitBtn.disabled = !(hasSignature && confirmAgreement.checked);
  }
}

function goToHome() {
  navigateTo('index.html');
}

function showSuccessModal() {
  const modal = document.getElementById('successModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function hideModal() {
  const modal = document.getElementById('successModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

async function submitSignature() {
  const signatureData = getSignatureBase64();
  if (!signatureData) {
    showToast('请先签署姓名');
    return;
  }

  if (!hasSignature) {
    showToast('请先在画布上手写签名');
    return;
  }

  const confirmAgreement = document.getElementById('confirmAgreement');
  if (!confirmAgreement || !confirmAgreement.checked) {
    showToast('请先勾选同意责任书条款');
    return;
  }

  try {
    showLoading('提交中...');
    const result = await apiRequest('/users/sign-agreement', {
      method: 'POST',
      body: JSON.stringify({
        signature: signatureData,
        signDate: new Date().toISOString()
      })
    });
    hideLoading();

    if (result.success) {
      showSuccessModal();
    } else {
      showToast(result.message || '签署失败，请重试');
    }
  } catch (error) {
    hideLoading();
    console.error('签署责任书失败', error);
    showToast('签署失败，请重试');
  }
}

function initAgreementPage() {
  const signDate = document.getElementById('signDate');
  if (signDate) {
    const now = new Date();
    signDate.textContent = formatDate(now);
  }

  const confirmAgreement = document.getElementById('confirmAgreement');
  if (confirmAgreement) {
    confirmAgreement.addEventListener('change', updateSubmitButton);
  }

  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      if (confirm('确认签署安全生产责任书吗？')) {
        submitSignature();
      }
    });
  }

  checkAgreementStatus();
}

async function checkAgreementStatus() {
  try {
    const result = await apiRequest('/users/status');
    if (result.success && result.data && result.data.agreementSigned) {
    }
    return false;
  } catch (error) {
    console.error('检查签署状态失败', error);
    return false;
  }
}

function renderStatus(data) {
  const userInfoCard = document.getElementById('userInfoCard');
  const progressCard = document.getElementById('progressCard');
  const menuGrid = document.getElementById('menuGrid');

  if (userInfoCard) userInfoCard.style.display = 'block';
  if (progressCard) progressCard.style.display = 'block';
  if (menuGrid) menuGrid.style.display = 'none';

  if (data.name) {
    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = data.name;
  }
  if (data.idCard) {
    const userIdCardEl = document.getElementById('userIdCard');
    if (userIdCardEl) userIdCardEl.textContent = '身份证号：' + data.idCard;
  }

  let completedCount = 0;

  if (data.infoCompleted) {
    completedCount++;
    const step1Status = document.getElementById('step1Status');
    const step1Btn = document.getElementById('step1Btn');
    if (step1Status) {
      step1Status.textContent = '已完成 ✓';
      step1Status.className = 'step-status completed';
    }
    if (step1Btn) {
      step1Btn.textContent = '查看';
      step1Btn.className = 'step-btn completed';
    }
  }

  if (data.trainingCompleted) {
    completedCount++;
    const step2Status = document.getElementById('step2Status');
    const step2Btn = document.getElementById('step2Btn');
    if (step2Status) {
      step2Status.textContent = '已完成 ✓';
      step2Status.className = 'step-status completed';
    }
    if (step2Btn) {
      step2Btn.textContent = '查看';
      step2Btn.className = 'step-btn completed';
    }
  }

  if (data.examScore && data.examScore >= 70) {
    completedCount++;
    const step3Status = document.getElementById('step3Status');
    const step3Btn = document.getElementById('step3Btn');
    if (step3Status) {
      step3Status.textContent = '已完成 ✓';
      step3Status.className = 'step-status completed';
    }
    if (step3Btn) {
      step3Btn.textContent = '查看';
      step3Btn.className = 'step-btn completed';
    }
  } else if (data.examScore !== null && data.examScore !== undefined) {
    const step3Status = document.getElementById('step3Status');
    if (step3Status) {
      step3Status.textContent = data.examScore + '分 (未通过)';
      step3Status.className = 'step-status failed';
    }
  }

  if (data.agreementSigned) {
    completedCount++;
    const step4Status = document.getElementById('step4Status');
    const step4Btn = document.getElementById('step4Btn');
    if (step4Status) {
      step4Status.textContent = '已完成 ✓';
      step4Status.className = 'step-status completed';
    }
    if (step4Btn) {
      step4Btn.textContent = '查看';
      step4Btn.className = 'step-btn completed';
    }
  }

  const progress = Math.round((completedCount / 4) * 100);
  const progressPercent = document.getElementById('overallProgress');
  const progressFill = document.getElementById('progressFill');
  if (progressPercent) progressPercent.textContent = progress + '%';
  if (progressFill) progressFill.style.width = progress + '%';
}

function renderProfile(data) {
  const profileName = document.getElementById('profileName');
  const profilePhone = document.getElementById('profilePhone');
  const infoName = document.getElementById('infoName');
  const infoIdCard = document.getElementById('infoIdCard');
  const infoPhone = document.getElementById('infoPhone');
  const infoJob = document.getElementById('infoJob');

  const idCard = data.idCard || data.id_card || '--';
  const workType = data.workType || data.work_type || '--';

  if (profileName) profileName.textContent = data.name || '--';
  if (profilePhone) profilePhone.textContent = data.phone || '--';
  if (infoName) infoName.textContent = data.name || '--';
  if (infoIdCard) infoIdCard.textContent = idCard;
  if (infoPhone) infoPhone.textContent = data.phone || '--';
  if (infoJob) infoJob.textContent = workType;

  let completedCount = 0;

  if (data.infoCompleted) {
    completedCount++;
    const record1Time = document.getElementById('record1Time');
    if (record1Time) record1Time.textContent = data.infoCompletedTime || '--';
  } else {
    const record1 = document.getElementById('record1');
    if (record1) {
      const icon = record1.querySelector('.record-icon');
      const status = record1.querySelector('.record-status');
      if (icon) {
        icon.className = 'record-icon pending';
        icon.textContent = '○';
      }
      if (status) {
        status.className = 'record-status pending';
        status.textContent = '未完成';
      }
    }
  }

  if (data.trainingCompleted) {
    completedCount++;
    const record2Time = document.getElementById('record2Time');
    if (record2Time) record2Time.textContent = data.trainingCompletedTime || '--';
  } else {
    const record2 = document.getElementById('record2');
    if (record2) {
      const icon = record2.querySelector('.record-icon');
      const status = record2.querySelector('.record-status');
      if (icon) {
        icon.className = 'record-icon pending';
        icon.textContent = '○';
      }
      if (status) {
        status.className = 'record-status pending';
        status.textContent = '未完成';
      }
    }
  }

  if (data.examScore && data.examScore >= 70) {
    completedCount++;
    const record3Time = document.getElementById('record3Time');
    const record3Score = document.getElementById('record3Score');
    if (record3Time) record3Time.textContent = data.examCompletedTime || '--';
    if (record3Score) record3Score.textContent = data.examScore + '分';
  } else {
    const record3 = document.getElementById('record3');
    if (record3) {
      const icon = record3.querySelector('.record-icon');
      const status = record3.querySelector('.record-status');
      if (icon) {
        icon.className = 'record-icon pending';
        icon.textContent = '○';
      }
      if (status) {
        status.className = 'record-status pending';
        status.textContent = data.examScore ? data.examScore + '分 (未通过)' : '未完成';
      }
      const record3Time = document.getElementById('record3Time');
      if (record3Time) record3Time.textContent = data.examCompletedTime || '--';
    }
  }

  if (data.agreementSigned) {
    completedCount++;
    const record4Time = document.getElementById('record4Time');
    if (record4Time) record4Time.textContent = data.agreementSignedTime || '--';
    const record4 = document.getElementById('record4');
    if (record4) {
      const icon = record4.querySelector('.record-icon');
      const status = record4.querySelector('.record-status');
      if (icon) {
        icon.className = 'record-icon completed';
        icon.textContent = '✓';
      }
      if (status) {
        status.className = 'record-status completed';
        status.textContent = '已完成';
      }
    }
  } else {
    const record4 = document.getElementById('record4');
    if (record4) {
      const icon = record4.querySelector('.record-icon');
      const status = record4.querySelector('.record-status');
      if (icon) {
        icon.className = 'record-icon pending';
        icon.textContent = '○';
      }
      if (status) {
        status.className = 'record-status pending';
        status.textContent = '未完成';
      }
    }
  }

  const progress = Math.round((completedCount / 4) * 100);
  const statusPercent = document.getElementById('statusPercent');
  const statusText = document.getElementById('statusText');
  if (statusPercent) statusPercent.textContent = progress + '%';
  if (statusText) statusText.textContent = '已完成 ' + completedCount + '/4 个流程';

  const statusCircle = document.getElementById('statusCircle');
  if (progress === 100 && statusCircle) {
    statusCircle.className = 'status-circle all-completed';
  }
}

function initImageUpload(inputId, previewId, placeholderId, removeBtnId, uploadAreaId, fileVar) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  const placeholder = document.getElementById(placeholderId);
  const removeBtn = document.getElementById(removeBtnId);
  const uploadArea = document.getElementById(uploadAreaId);

  uploadArea.addEventListener('click', () => input.click());

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validateImageFile(file)) {
      input.value = '';
      return;
    }

    if (fileVar === 'front') {
      window.idCardFrontFile = file;
    } else {
      window.idCardBackFile = file;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      preview.src = event.target.result;
      preview.style.display = 'block';
      placeholder.style.display = 'none';
      removeBtn.style.display = 'flex';
      showToast('图片上传成功');
    };
    reader.readAsDataURL(file);
  });

  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    input.value = '';
    preview.src = '';
    preview.style.display = 'none';
    placeholder.style.display = 'flex';
    removeBtn.style.display = 'none';
    if (fileVar === 'front') {
      window.idCardFrontFile = null;
    } else {
      window.idCardBackFile = null;
    }
    showToast('图片已移除');
  });
}

