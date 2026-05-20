const API_BASE = '/api';
let currentUser = null;
let token = localStorage.getItem('token');

const roleMap = {
    'employee': '普通员工',
    'department_manager': '部门经理',
    'hr': 'HR',
    'admin': '管理员'
};

const leaveTypeMap = {
    'personal_leave': '事假',
    'sick_leave': '病假',
    'annual_leave': '年假',
    'marriage_leave': '婚假',
    'maternity_leave': '产假',
    'bereavement_leave': '丧假',
    'other': '其他'
};

const statusMap = {
    'normal': '正常',
    'late': '迟到',
    'early_leave': '早退',
    'absent': '缺勤',
    'pending': '待审批',
    'in_approval': '审批中',
    'approved': '已通过',
    'rejected': '已拒绝',
    'cancelled': '已撤销'
};

async function apiRequest(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(`${API_BASE}${url}`, {
            ...options,
            headers
        });
        const data = await response.json();
        if (!data.success) {
            showToast('错误', data.message || '操作失败', 'danger');
        }
        return data;
    } catch (error) {
        console.error('API请求失败:', error);
        showToast('错误', '网络请求失败', 'danger');
        return { success: false, message: '网络请求失败' };
    }
}

function showToast(title, message, type = 'info') {
    const toast = new bootstrap.Toast(document.getElementById('toast'));
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastMessage').textContent = message;
    toast.show();
}

document.addEventListener('DOMContentLoaded', function() {
    if (token) {
        loadUserInfo();
    }
    
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const employeeNo = document.getElementById('employeeNo').value;
        const password = document.getElementById('password').value;
        
        const result = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ employee_no: employeeNo, password })
        });
        
        if (result.success) {
            token = result.data.token;
            localStorage.setItem('token', token);
            await loadUserInfo();
            showToast('成功', '登录成功！', 'success');
        }
    });
    
    document.getElementById('logoutBtn').addEventListener('click', function() {
        token = null;
        localStorage.removeItem('token');
        currentUser = null;
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
        showToast('提示', '已退出登录', 'info');
    });
    
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            switchPage(page);
        });
    });
    
    document.querySelectorAll('[data-tab]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tab = this.dataset.tab;
            document.querySelectorAll('[data-tab]').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('[id^="tab-"]').forEach(t => t.style.display = 'none');
            document.getElementById(`tab-${tab}`).style.display = 'block';
        });
    });
    
    document.getElementById('clockInBtn').addEventListener('click', clockIn);
    document.getElementById('clockOutBtn').addEventListener('click', clockOut);
    document.getElementById('leaveForm').addEventListener('submit', submitLeave);
    
    // 仪表盘卡片点击跳转
    document.querySelectorAll('.stat-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
            const title = this.querySelector('h6').textContent;
            if (title.includes('待我审批')) {
                switchPage('approval');
            } else if (title.includes('请假')) {
                switchPage('leave');
            } else if (title.includes('打卡')) {
                switchPage('attendance');
            } else if (title.includes('出勤')) {
                switchPage('statistics');
            }
        });
    });
    
    updateClock();
    setInterval(updateClock, 1000);
    
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    document.getElementById('startDate').value = firstDay;
    document.getElementById('endDate').value = lastDay;
    document.getElementById('statMonth').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // 页面加载时尝试恢复登录状态
    if (token) {
        loadUserInfo();
    }
});

function updateClock() {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const dateStr = now.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    });
    document.getElementById('clockDisplay').textContent = timeStr;
    document.getElementById('dateDisplay').textContent = dateStr;
}

async function loadUserInfo() {
    try {
        const result = await apiRequest('/auth/me');
        if (result.success) {
            currentUser = result.data;
            
            const userNameEl = document.getElementById('userName');
            const userRoleEl = document.getElementById('userRole');
            if (userNameEl) userNameEl.textContent = currentUser.name;
            if (userRoleEl) userRoleEl.textContent = roleMap[currentUser.role] || currentUser.role;
            
            const loginPage = document.getElementById('loginPage');
            const mainApp = document.getElementById('mainApp');
            if (loginPage) loginPage.style.display = 'none';
            if (mainApp) mainApp.style.display = 'block';
            
            updateMenuByRole();
            loadDashboard();
            return true;
        } else {
            token = null;
            localStorage.removeItem('token');
            return false;
        }
    } catch (error) {
        console.error('加载用户信息失败:', error);
        token = null;
        localStorage.removeItem('token');
        return false;
    }
}

function updateMenuByRole() {
    document.querySelectorAll('.nav-item-role').forEach(item => {
        const classes = item.className;
        let show = false;
        if (classes.includes('admin') && currentUser.role === 'admin') show = true;
        if (classes.includes('hr') && (currentUser.role === 'hr' || currentUser.role === 'admin')) show = true;
        if (classes.includes('manager') && (currentUser.role === 'department_manager' || currentUser.role === 'hr' || currentUser.role === 'admin')) show = true;
        item.style.display = show ? 'block' : 'none';
    });
}

function switchPage(page) {
    document.querySelectorAll('[data-page]').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) link.classList.add('active');
    });
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`).classList.add('active');
    
    switch(page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'attendance':
            loadAttendanceStatus();
            loadAttendanceHistory();
            break;
        case 'leave':
            loadMyLeaves();
            break;
        case 'approval':
            loadPendingApprovals();
            loadApprovalHistory();
            break;
        case 'statistics':
            loadStatistics();
            loadDepartmentsForSelect();
            if (currentUser.role !== 'employee') {
                document.getElementById('deptSelectWrapper').style.display = 'block';
            }
            break;
        case 'employees':
            loadEmployees();
            loadDepartmentsForSelect();
            break;
        case 'departments':
            loadDepartments();
            break;
        case 'system':
            loadBackups();
            break;
    }
}

async function loadDashboard() {
    try {
        const statusResult = await apiRequest('/attendance/status');
        if (statusResult.success && statusResult.data) {
            const status = statusResult.data;
            let display = '未打卡';
            if (status.clock_in_time && status.clock_out_time) display = '已完成';
            else if (status.clock_in_time) display = '已上班';
            const todayStatusEl = document.getElementById('todayStatus');
            if (todayStatusEl) todayStatusEl.textContent = display;
        }
    } catch (e) { console.error('加载打卡状态失败:', e); }
    
    try {
        const historyResult = await apiRequest('/attendance/history');
        if (historyResult.success && historyResult.data) {
            // 支持两种返回格式: 直接数组 或 {records: [...], pagination: {...}}
            const records = (historyResult.data.records || historyResult.data).slice(0, 10);
            let html = '';
            records.forEach(rec => {
                html += `
                    <tr>
                        <td>${rec.attendance_date}</td>
                        <td>${rec.clock_in_time ? rec.clock_in_time.substring(0, 8) : '-'}</td>
                        <td>${rec.clock_out_time ? rec.clock_out_time.substring(0, 8) : '-'}</td>
                        <td><span class="badge bg-${rec.status === 'normal' ? 'success' : 'warning'}">${statusMap[rec.status] || rec.status}</span></td>
                    </tr>
                `;
            });
            const recentRecordsEl = document.getElementById('recentRecords');
            if (recentRecordsEl) recentRecordsEl.innerHTML = html || '<tr><td colspan="4" class="text-center">暂无数据</td></tr>';
        }
    } catch (e) { console.error('加载打卡历史失败:', e); }
    
    try {
        const leavesResult = await apiRequest('/leave/my-requests');
        if (leavesResult.success && leavesResult.data) {
            // 支持两种返回格式: 直接数组 或 {requests: [...], total: ...}
            const leaves = (leavesResult.data.requests || leavesResult.data).slice(0, 5);
            let html = '';
            leaves.forEach(leave => {
                const badgeClass = leave.status === 'approved' ? 'success' : 
                                  leave.status === 'rejected' ? 'danger' : 'warning';
                html += `
                    <div class="border-bottom pb-2 mb-2">
                        <div class="d-flex justify-content-between align-items-center">
                            <strong>${leaveTypeMap[leave.leave_type] || leave.leave_type}</strong>
                            <span class="badge bg-${badgeClass}">${statusMap[leave.status] || leave.status}</span>
                        </div>
                        <div class="small text-muted">${leave.start_time} ~ ${leave.end_time}</div>
                        <div class="small">${leave.reason}</div>
                    </div>
                `;
            });
            const recentLeavesEl = document.getElementById('recentLeaves');
            if (recentLeavesEl) recentLeavesEl.innerHTML = html || '<div class="text-center text-muted">暂无请假记录</div>';
        }
    } catch (e) { console.error('加载请假记录失败:', e); }
}

async function loadAttendanceStatus() {
    const result = await apiRequest('/attendance/status');
    if (result.success && result.data) {
        const status = result.data;
        let html = `
            <div class="mb-3">
                <strong>上班打卡：</strong>
                ${status.clock_in_time ? 
                    `<span class="text-success">${status.clock_in_time}</span> (IP: ${status.clock_in_ip})` : 
                    '<span class="text-muted">未打卡</span>'}
            </div>
            <div class="mb-3">
                <strong>下班打卡：</strong>
                ${status.clock_out_time ? 
                    `<span class="text-success">${status.clock_out_time}</span> (IP: ${status.clock_out_ip})` : 
                    '<span class="text-muted">未打卡</span>'}
            </div>
        `;
        if (status.late_minutes > 0) {
            html += `<div class="alert alert-warning">迟到 ${status.late_minutes} 分钟</div>`;
        }
        if (status.early_leave_minutes > 0) {
            html += `<div class="alert alert-warning">早退 ${status.early_leave_minutes} 分钟</div>`;
        }
        document.getElementById('todayDetail').innerHTML = html;
        
        document.getElementById('clockInBtn').disabled = !!status.clock_in_time;
        document.getElementById('clockOutBtn').disabled = !status.clock_in_time || !!status.clock_out_time;
    }
}

async function loadAttendanceHistory() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    const result = await apiRequest(`/attendance/history?start_date=${startDate}&end_date=${endDate}`);
    if (result.success && result.data) {
        let html = '';
        // 支持两种返回格式: 直接数组 或 {records: [...], pagination: {...}}
        const records = result.data.records || result.data;
        records.forEach(rec => {
            const badgeClass = rec.status === 'normal' ? 'success' : 
                              rec.status === 'late' || rec.status === 'early_leave' ? 'warning' : 'danger';
            html += `
                <tr>
                    <td>${rec.attendance_date}</td>
                    <td>${rec.clock_in_time ? rec.clock_in_time.substring(0, 8) : '-'}</td>
                    <td>${rec.clock_out_time ? rec.clock_out_time.substring(0, 8) : '-'}</td>
                    <td>${rec.clock_in_ip || '-'}</td>
                    <td>${rec.clock_out_ip || '-'}</td>
                    <td><span class="badge bg-${badgeClass}">${statusMap[rec.status] || rec.status}</span></td>
                    <td>${(rec.late_minutes || 0) + (rec.early_leave_minutes || 0) || '-'}</td>
                </tr>
            `;
        });
        document.getElementById('attendanceHistory').innerHTML = html || '<tr><td colspan="7" class="text-center">暂无数据</td></tr>';
    }
}

async function clockIn() {
    const result = await apiRequest('/attendance/clock-in', { method: 'POST' });
    if (result.success) {
        showToast('成功', '上班打卡成功！', 'success');
        loadAttendanceStatus();
        loadDashboard();
    }
}

async function clockOut() {
    const result = await apiRequest('/attendance/clock-out', { method: 'POST' });
    if (result.success) {
        showToast('成功', '下班打卡成功！', 'success');
        loadAttendanceStatus();
        loadDashboard();
    }
}

async function exportPersonalAttendance() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    const response = await fetch(`${API_BASE}/export/personal?start_date=${startDate}&end_date=${endDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `考勤记录_${startDate}_${endDate}.csv`;
        a.click();
        showToast('成功', '导出成功！', 'success');
    }
}

async function loadMyLeaves() {
    const result = await apiRequest('/leave/my-requests');
    if (result.success && result.data) {
        let html = '';
        // 支持两种返回格式: 直接数组 或 {requests: [...], total: ...}
        const leaves = result.data.requests || result.data;
        leaves.forEach(leave => {
            const badgeClass = leave.status === 'approved' ? 'success' : 
                              leave.status === 'rejected' ? 'danger' : 
                              leave.status === 'cancelled' ? 'secondary' : 'warning';
            // 支持两种字段名: leave_days 或 days
            const days = leave.leave_days || leave.days || 0;
            html += `
                <tr>
                    <td>${leaveTypeMap[leave.leave_type] || leave.leave_type}</td>
                    <td>${leave.start_time}</td>
                    <td>${leave.end_time}</td>
                    <td>${days}天</td>
                    <td><span class="badge bg-${badgeClass}">${statusMap[leave.status] || leave.status}</span></td>
                    <td>
                        ${leave.status === 'pending' ? 
                            `<button class="btn btn-sm btn-danger" onclick="cancelLeave(${leave.id})">撤销</button>` : 
                            '-'}
                    </td>
                </tr>
            `;
        });
        document.getElementById('myLeaveRecords').innerHTML = html || '<tr><td colspan="6" class="text-center">暂无请假记录</td></tr>';
    }
}

async function submitLeave(e) {
    e.preventDefault();
    const leaveType = document.getElementById('leaveType').value;
    const startTime = document.getElementById('leaveStart').value;
    const endTime = document.getElementById('leaveEnd').value;
    const reason = document.getElementById('leaveReason').value;
    
    const result = await apiRequest('/leave/request', {
        method: 'POST',
        body: JSON.stringify({
            leave_type: leaveType,
            start_time: startTime,
            end_time: endTime,
            reason
        })
    });
    
    if (result.success) {
        showToast('成功', '请假申请提交成功！', 'success');
        document.getElementById('leaveForm').reset();
        loadMyLeaves();
    }
}

async function cancelLeave(id) {
    if (!confirm('确定要撤销此请假申请吗？')) return;
    
    const result = await apiRequest(`/leave/request/${id}/cancel`, { method: 'PUT' });
    if (result.success) {
        showToast('成功', '申请已撤销', 'success');
        loadMyLeaves();
    }
}

async function loadPendingApprovals() {
    const result = await apiRequest('/leave/pending');
    if (result.success && result.data) {
        let html = '';
        const requests = result.data.requests || result.data;
        requests.forEach(leave => {
            const days = leave.leave_days || leave.days || 0;
            html += `
                <tr>
                    <td>${leave.employee_name}</td>
                    <td>${leave.department_name || '-'}</td>
                    <td>${leaveTypeMap[leave.leave_type] || leave.leave_type}</td>
                    <td>${leave.start_time}</td>
                    <td>${leave.end_time}</td>
                    <td>${days}天</td>
                    <td>${leave.reason}</td>
                    <td>
                        <button class="btn btn-sm btn-success me-1" onclick="showApprovalModal(${leave.id}, ${leave.current_approval_level}, ${JSON.stringify(leave).replace(/"/g, '&quot;')})">
                            审批
                        </button>
                    </td>
                </tr>
            `;
        });
        document.getElementById('pendingApprovalList').innerHTML = html || '<tr><td colspan="8" class="text-center">暂无待审批申请</td></tr>';
        document.getElementById('pendingApproval').textContent = requests.length;
    }
}

async function showApprovalModal(id, level, leaveData) {
    document.getElementById('approvalId').value = id;
    document.getElementById('approvalLevel').value = level;
    document.getElementById('approvalComment').value = '';
    
    // 如果传入了leaveData，直接使用
    if (leaveData) {
        document.getElementById('approvalEmployeeName').textContent = leaveData.employee_name || '-';
        document.getElementById('approvalDeptName').textContent = leaveData.department_name || '-';
        document.getElementById('approvalLeaveType').textContent = leaveTypeMap[leaveData.leave_type] || leaveData.leave_type || '-';
        document.getElementById('approvalLeaveDays').textContent = (leaveData.leave_days || leaveData.days || 0) + '天';
        document.getElementById('approvalStartTime').textContent = leaveData.start_time || '-';
        document.getElementById('approvalEndTime').textContent = leaveData.end_time || '-';
        document.getElementById('approvalReason').textContent = leaveData.reason || '-';
        document.getElementById('approvalCurrentLevel').textContent = level === 1 ? '一级审批（部门经理）' : '二级审批（HR/管理员）';
    } else {
        // 否则加载详情
        const result = await apiRequest(`/leave/request/${id}`);
        if (result.success && result.data) {
            const leave = result.data;
            document.getElementById('approvalEmployeeName').textContent = leave.employee_name || currentUser.name;
            document.getElementById('approvalDeptName').textContent = leave.department_name || '-';
            document.getElementById('approvalLeaveType').textContent = leaveTypeMap[leave.leave_type] || leave.leave_type;
            document.getElementById('approvalLeaveDays').textContent = (leave.days || 0) + '天';
            document.getElementById('approvalStartTime').textContent = leave.start_time;
            document.getElementById('approvalEndTime').textContent = leave.end_time;
            document.getElementById('approvalReason').textContent = leave.reason;
            document.getElementById('approvalCurrentLevel').textContent = level === 1 ? '一级审批（部门经理）' : '二级审批（HR/管理员）';
        }
    }
    
    new bootstrap.Modal(document.getElementById('approvalModal')).show();
}

async function submitApproval(status) {
    const id = document.getElementById('approvalId').value;
    const level = document.getElementById('approvalLevel').value;
    const comment = document.getElementById('approvalComment').value;
    
    if (!comment.trim()) {
        showToast('错误', '请输入审批意见！', 'danger');
        return;
    }
    
    const endpoint = level === 1 ? 
        `/leave/request/${id}/approve-level1` : 
        `/leave/request/${id}/approve-level2`;
    
    const result = await apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify({
            status,
            comment
        })
    });
    
    if (result.success) {
        showToast('成功', '审批完成！', 'success');
        bootstrap.Modal.getInstance(document.getElementById('approvalModal')).hide();
        loadPendingApprovals();
        loadApprovalHistory();
        loadDashboard();
    }
}

async function loadApprovalHistory() {
    const result = await apiRequest('/leave/approval-history');
    if (result.success && result.data) {
        let html = '';
        const history = result.data.history || result.data;
        history.forEach(record => {
            const badgeClass = record.status === 'approved' ? 'success' : 'danger';
            html += `
                <tr>
                    <td>${record.employee_name}</td>
                    <td>${record.leave_type}</td>
                    <td>${record.start_time}</td>
                    <td>${record.end_time}</td>
                    <td>${record.approver_name || '-'}</td>
                    <td>${record.created_at ? record.created_at.substring(0, 19) : '-'}</td>
                    <td><span class="badge bg-${badgeClass}">${statusMap[record.status] || record.status}</span></td>
                    <td>${record.comment || '-'}</td>
                </tr>
            `;
        });
        document.getElementById('approvalHistoryList').innerHTML = html || '<tr><td colspan="8" class="text-center">暂无审批历史</td></tr>';
    }
}

async function loadStatistics() {
    const month = document.getElementById('statMonth').value;
    const deptId = document.getElementById('statDept').value;
    
    if (currentUser.role === 'employee' || !deptId) {
        const result = await apiRequest(`/statistics/personal?month=${month}`);
        if (result.success && result.data) {
            const data = result.data;
            let html = `
                <div class="row">
                    <div class="col-md-3">
                        <div class="card text-center p-3">
                            <h4>${data.total_work_days || 0}</h4>
                            <small class="text-muted">总工作日</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center p-3">
                            <h4 class="text-success">${data.actual_attendance_days || 0}</h4>
                            <small class="text-muted">实际出勤</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center p-3">
                            <h4 class="text-warning">${data.late_count || 0}</h4>
                            <small class="text-muted">迟到次数</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center p-3">
                            <h4 class="text-danger">${data.leave_days || 0}</h4>
                            <small class="text-muted">请假天数</small>
                        </div>
                    </div>
                </div>
                <div class="mt-3">
                    <div class="progress" style="height: 30px;">
                        <div class="progress-bar bg-success" style="width: ${data.attendance_rate || 0}%">
                            出勤率 ${data.attendance_rate || 0}%
                        </div>
                    </div>
                </div>
            `;
            document.getElementById('personalStats').innerHTML = html;
        }
    } else {
        const result = await apiRequest(`/statistics/department/${deptId}?month=${month}`);
        if (result.success && result.data) {
            const data = result.data;
            let html = `
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="card text-center p-3">
                            <h4>${data.total_employees || 0}</h4>
                            <small class="text-muted">部门人数</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center p-3">
                            <h4 class="text-success">${data.total_attendance_count || 0}</h4>
                            <small class="text-muted">总出勤人次</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center p-3">
                            <h4 class="text-warning">${data.total_late_count || 0}</h4>
                            <small class="text-muted">总迟到人次</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center p-3">
                            <h4 class="text-primary">${data.avg_attendance_rate || 0}%</h4>
                            <small class="text-muted">平均出勤率</small>
                        </div>
                    </div>
                </div>
            `;
            document.getElementById('departmentStats').innerHTML = html;
            document.getElementById('departmentStats').style.display = 'block';
        }
    }
}

async function exportStatistics() {
    const month = document.getElementById('statMonth').value;
    const deptId = document.getElementById('statDept').value;
    
    let url = '/export/personal';
    const startDate = `${month}-01`;
    const endDate = new Date(month.substring(0, 4), month.substring(5, 7), 0).toISOString().split('T')[0];
    
    if (deptId && currentUser.role !== 'employee') {
        url = `/export/department/${deptId}`;
    }
    
    const response = await fetch(`${API_BASE}${url}?start_date=${startDate}&end_date=${endDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
        const blob = await response.blob();
        const urlObj = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = urlObj;
        a.download = `考勤统计_${month}.csv`;
        a.click();
        showToast('成功', '导出成功！', 'success');
    }
}

async function loadEmployees() {
    const result = await apiRequest('/employees');
    if (result.success && result.data) {
        let html = '';
        result.data.forEach(emp => {
            html += `
                <tr>
                    <td>${emp.employee_no}</td>
                    <td>${emp.name}</td>
                    <td>${emp.department_name || '-'}</td>
                    <td>${emp.position || '-'}</td>
                    <td>${roleMap[emp.role] || emp.role}</td>
                    <td>${emp.email || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary me-1" onclick="editEmployee(${emp.id})">编辑</button>
                        ${currentUser.role === 'admin' ? 
                            `<button class="btn btn-sm btn-danger" onclick="deleteEmployee(${emp.id})">删除</button>` : ''}
                    </td>
                </tr>
            `;
        });
        document.getElementById('employeeList').innerHTML = html || '<tr><td colspan="7" class="text-center">暂无员工</td></tr>';
    }
}

async function loadDepartmentsForSelect() {
    const result = await apiRequest('/departments');
    if (result.success && result.data) {
        let html = '<option value="">全部部门</option>';
        result.data.forEach(dept => {
            html += `<option value="${dept.id}">${dept.name}</option>`;
        });
        document.getElementById('statDept').innerHTML = html;
        document.getElementById('empDeptFilter').innerHTML = html;
        document.getElementById('empDept').innerHTML = html;
    }
}

function showEmployeeModal() {
    document.getElementById('empModalTitle').textContent = '添加员工';
    document.getElementById('employeeForm').reset();
    document.getElementById('empId').value = '';
    new bootstrap.Modal(document.getElementById('employeeModal')).show();
}

async function editEmployee(id) {
    const result = await apiRequest(`/employees/${id}`);
    if (result.success && result.data) {
        const emp = result.data;
        document.getElementById('empModalTitle').textContent = '编辑员工';
        document.getElementById('empId').value = emp.id;
        document.getElementById('empNo').value = emp.employee_no;
        document.getElementById('empName').value = emp.name;
        document.getElementById('empDept').value = emp.department_id || '';
        document.getElementById('empPosition').value = emp.position || '';
        document.getElementById('empRole').value = emp.role;
        document.getElementById('empEmail').value = emp.email || '';
        document.getElementById('empPhone').value = emp.phone || '';
        new bootstrap.Modal(document.getElementById('employeeModal')).show();
    }
}

async function saveEmployee() {
    const id = document.getElementById('empId').value;
    const data = {
        employee_no: document.getElementById('empNo').value,
        name: document.getElementById('empName').value,
        department_id: document.getElementById('empDept').value || null,
        position: document.getElementById('empPosition').value,
        role: document.getElementById('empRole').value,
        email: document.getElementById('empEmail').value,
        phone: document.getElementById('empPhone').value
    };
    
    const password = document.getElementById('empPassword').value;
    if (password) data.password = password;
    
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/employees/${id}` : '/employees';
    
    const result = await apiRequest(url, {
        method,
        body: JSON.stringify(data)
    });
    
    if (result.success) {
        showToast('成功', id ? '员工信息已更新' : '员工添加成功', 'success');
        bootstrap.Modal.getInstance(document.getElementById('employeeModal')).hide();
        loadEmployees();
    }
}

async function deleteEmployee(id) {
    if (!confirm('确定要删除此员工吗？')) return;
    
    const result = await apiRequest(`/employees/${id}`, { method: 'DELETE' });
    if (result.success) {
        showToast('成功', '员工已删除', 'success');
        loadEmployees();
    }
}

async function loadDepartments() {
    const result = await apiRequest('/departments');
    if (result.success && result.data) {
        let html = '';
        result.data.forEach(dept => {
            html += `
                <tr>
                    <td>${dept.id}</td>
                    <td>${dept.name}</td>
                    <td>${dept.description || '-'}</td>
                    <td>${dept.created_at}</td>
                    <td>
                        <button class="btn btn-sm btn-primary me-1" onclick="editDepartment(${dept.id}, '${dept.name}', '${dept.description || ''}')">编辑</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteDepartment(${dept.id})">删除</button>
                    </td>
                </tr>
            `;
        });
        document.getElementById('departmentList').innerHTML = html || '<tr><td colspan="5" class="text-center">暂无部门</td></tr>';
    }
}

function showDepartmentModal() {
    document.getElementById('deptModalTitle').textContent = '添加部门';
    document.getElementById('deptId').value = '';
    document.getElementById('deptName').value = '';
    document.getElementById('deptDesc').value = '';
    new bootstrap.Modal(document.getElementById('deptModal')).show();
}

function editDepartment(id, name, desc) {
    document.getElementById('deptModalTitle').textContent = '编辑部门';
    document.getElementById('deptId').value = id;
    document.getElementById('deptName').value = name;
    document.getElementById('deptDesc').value = desc;
    new bootstrap.Modal(document.getElementById('deptModal')).show();
}

async function saveDepartment() {
    const id = document.getElementById('deptId').value;
    const data = {
        name: document.getElementById('deptName').value,
        description: document.getElementById('deptDesc').value
    };
    
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/departments/${id}` : '/departments';
    
    const result = await apiRequest(url, {
        method,
        body: JSON.stringify(data)
    });
    
    if (result.success) {
        showToast('成功', id ? '部门已更新' : '部门添加成功', 'success');
        bootstrap.Modal.getInstance(document.getElementById('deptModal')).hide();
        loadDepartments();
    }
}

async function deleteDepartment(id) {
    if (!confirm('确定要删除此部门吗？')) return;
    
    const result = await apiRequest(`/departments/${id}`, { method: 'DELETE' });
    if (result.success) {
        showToast('成功', '部门已删除', 'success');
        loadDepartments();
    }
}

async function loadBackups() {
    const result = await apiRequest('/system/backups');
    if (result.success && result.data) {
        let html = '';
        result.data.forEach(backup => {
            html += `
                <tr>
                    <td>${backup.filename}</td>
                    <td>${backup.created_at}</td>
                    <td>${backup.size}</td>
                    <td>
                        <a href="${API_BASE}/system/backup/${backup.filename}" target="_blank" class="btn btn-sm btn-primary me-1">
                            <i class="bi bi-download"></i> 下载
                        </a>
                        <button class="btn btn-sm btn-danger" onclick="deleteBackup('${backup.filename}')">
                            <i class="bi bi-trash"></i> 删除
                        </button>
                    </td>
                </tr>
            `;
        });
        document.getElementById('backupList').innerHTML = html || '<tr><td colspan="4" class="text-center">暂无备份</td></tr>';
    }
}

async function createBackup() {
    const result = await apiRequest('/system/backup', { method: 'POST' });
    if (result.success) {
        showToast('成功', '备份创建成功', 'success');
        loadBackups();
    }
}

async function deleteBackup(filename) {
    if (!confirm('确定要删除此备份文件吗？')) return;
    
    const result = await apiRequest(`/system/backup/${filename}`, { method: 'DELETE' });
    if (result.success) {
        showToast('成功', '备份已删除', 'success');
        loadBackups();
    }
}
