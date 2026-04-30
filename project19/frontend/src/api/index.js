const API_BASE = '/api';

export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return await response.json();
  } catch (error) {
    throw new Error('无法连接到后端服务器');
  }
}

export async function addResume(resumeData) {
  const response = await fetch(`${API_BASE}/resumes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(resumeData)
  });
  return await response.json();
}

export async function getJobs() {
  const response = await fetch(`${API_BASE}/jobs`);
  return await response.json();
}

export async function addJob(jobData) {
  const response = await fetch(`${API_BASE}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData)
  });
  return await response.json();
}

export async function matchResumeJob(resumeId, jobId) {
  const response = await fetch(`${API_BASE}/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeId, jobId })
  });
  return await response.json();
}

export async function initTestData() {
  await addResume({
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138000',
    skills: 'Vue, JavaScript, Node.js, CSS',
    experience: '3年前端开发经验'
  });
  
  await addJob({
    title: '高级前端工程师',
    company: 'ABC科技公司',
    description: '负责公司核心产品的前端开发',
    requirements: 'Vue, React, JavaScript, TypeScript, CSS'
  });
}

export async function uploadZipFile(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('zipFile', file);

    xhr.open('POST', `${API_BASE}/upload`, true);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(xhr.statusText || '上传失败'));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('上传失败')));
    xhr.addEventListener('abort', () => reject(new Error('上传已取消')));

    xhr.send(formData);
  });
}

export async function getUploadedFiles() {
  const response = await fetch(`${API_BASE}/uploaded-files`);
  return await response.json();
}

export async function getResumes(page = 1, pageSize = 10, filters = {}) {
  const params = new URLSearchParams({ page, pageSize });
  
  if (filters.ageMax) params.append('ageMax', filters.ageMax);
  if (filters.position) params.append('position', filters.position);
  if (filters.workYearsMin) params.append('workYearsMin', filters.workYearsMin);
  if (filters.workYearsMax) params.append('workYearsMax', filters.workYearsMax);
  
  const response = await fetch(`${API_BASE}/resumes?${params}`);
  return await response.json();
}

export async function exportResumes(filters = {}) {
  const params = new URLSearchParams();
  
  if (filters.ageMax) params.append('ageMax', filters.ageMax);
  if (filters.position) params.append('position', filters.position);
  if (filters.workYearsMin) params.append('workYearsMin', filters.workYearsMin);
  if (filters.workYearsMax) params.append('workYearsMax', filters.workYearsMax);
  
  window.open(`${API_BASE}/resumes/export?${params}`, '_blank');
}

export async function batchParse(uploadId, saveToDb = true) {
  const response = await fetch(`${API_BASE}/batch-parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uploadId, saveToDb })
  });
  return await response.json();
}

export async function getResumePreview(id) {
  const response = await fetch(`${API_BASE}/resumes/${id}/preview`);
  return await response.json();
}

export async function deleteResume(id) {
  const response = await fetch(`${API_BASE}/resumes/${id}`, {
    method: 'DELETE'
  });
  return await response.json();
}

export async function uploadSingleResume(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('resumeFile', file);

    xhr.open('POST', `${API_BASE}/parse-resume`, true);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(xhr.statusText || '上传失败'));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('上传失败')));
    xhr.addEventListener('abort', () => reject(new Error('上传已取消')));

    xhr.send(formData);
  });
}
