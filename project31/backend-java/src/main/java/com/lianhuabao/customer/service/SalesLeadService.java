package com.lianhuabao.customer.service;

import com.alibaba.excel.EasyExcel;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.lianhuabao.customer.entity.SalesLead;
import com.lianhuabao.customer.entity.SalesLeadFollow;
import com.lianhuabao.customer.mapper.SalesLeadMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SalesLeadService extends ServiceImpl<SalesLeadMapper, SalesLead> {

    private final SalesLeadFollowService leadFollowService;

    public SalesLeadService(SalesLeadFollowService leadFollowService) {
        this.leadFollowService = leadFollowService;
    }

    public Page<SalesLead> getPage(Integer pageNum, Integer pageSize, String keyword, Integer status, Long assignedUserId) {
        Page<SalesLead> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<SalesLead> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(SalesLead::getCustomerName, keyword)
                    .or().like(SalesLead::getPhone, keyword)
                    .or().like(SalesLead::getEmail, keyword)
                    .or().like(SalesLead::getCompany, keyword)
                    .or().like(SalesLead::getInterestProduct, keyword));
        }
        if (status != null) {
            wrapper.eq(SalesLead::getStatus, status);
        }
        if (assignedUserId != null) {
            wrapper.eq(SalesLead::getAssignedUserId, assignedUserId);
        }
        wrapper.orderByDesc(SalesLead::getCreateTime);
        return this.page(page, wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    public void assignLead(Long id, Long userId, String userName) {
        SalesLead lead = this.getById(id);
        if (lead != null) {
            lead.setAssignedUserId(userId);
            lead.setAssignedUserName(userName);
            lead.setUpdateTime(LocalDateTime.now());
            this.updateById(lead);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStatus(Long id, Integer status) {
        SalesLead lead = this.getById(id);
        if (lead != null) {
            lead.setStatus(status);
            lead.setUpdateTime(LocalDateTime.now());
            this.updateById(lead);
        }
    }

    public List<SalesLeadFollow> getFollowRecords(Long leadId) {
        LambdaQueryWrapper<SalesLeadFollow> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SalesLeadFollow::getLeadId, leadId);
        wrapper.orderByDesc(SalesLeadFollow::getCreateTime);
        return leadFollowService.list(wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    public void addFollowRecord(SalesLeadFollow follow) {
        follow.setCreateTime(LocalDateTime.now());
        leadFollowService.save(follow);
    }

    public void exportExcel(HttpServletResponse response, String keyword) throws IOException {
        LambdaQueryWrapper<SalesLead> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(SalesLead::getCustomerName, keyword)
                    .or().like(SalesLead::getPhone, keyword)
                    .or().like(SalesLead::getEmail, keyword)
                    .or().like(SalesLead::getCompany, keyword));
        }
        List<SalesLead> list = this.list(wrapper);
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        String fileName = URLEncoder.encode("销售线索", StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");
        EasyExcel.write(response.getOutputStream(), SalesLead.class).sheet("销售线索").doWrite(list);
    }
}
