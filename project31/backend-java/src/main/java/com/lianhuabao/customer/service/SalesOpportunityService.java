package com.lianhuabao.customer.service;

import com.alibaba.excel.EasyExcel;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.lianhuabao.customer.entity.OpportunityStageHistory;
import com.lianhuabao.customer.entity.SalesOpportunity;
import com.lianhuabao.customer.mapper.SalesOpportunityMapper;
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
public class SalesOpportunityService extends ServiceImpl<SalesOpportunityMapper, SalesOpportunity> {

    private final OpportunityStageHistoryService stageHistoryService;

    public SalesOpportunityService(OpportunityStageHistoryService stageHistoryService) {
        this.stageHistoryService = stageHistoryService;
    }

    public Page<SalesOpportunity> getPage(Integer pageNum, Integer pageSize, String keyword, Integer stage, Long ownerUserId) {
        Page<SalesOpportunity> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<SalesOpportunity> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(SalesOpportunity::getOpportunityName, keyword)
                    .or().like(SalesOpportunity::getCustomerName, keyword));
        }
        if (stage != null) {
            wrapper.eq(SalesOpportunity::getStage, stage);
        }
        if (ownerUserId != null) {
            wrapper.eq(SalesOpportunity::getOwnerUserId, ownerUserId);
        }
        wrapper.orderByDesc(SalesOpportunity::getCreateTime);
        return this.page(page, wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    public void convertFromLead(Long leadId, SalesOpportunity opportunity) {
        opportunity.setLeadId(leadId);
        opportunity.setCreateTime(LocalDateTime.now());
        opportunity.setUpdateTime(LocalDateTime.now());
        this.save(opportunity);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStage(Long id, Integer newStage, Long operateUserId, String operateUserName, String remark) {
        SalesOpportunity opportunity = this.getById(id);
        if (opportunity != null) {
            Integer oldStage = opportunity.getStage();
            opportunity.setStage(newStage);
            opportunity.setUpdateTime(LocalDateTime.now());
            this.updateById(opportunity);

            OpportunityStageHistory history = new OpportunityStageHistory();
            history.setOpportunityId(id);
            history.setFromStage(oldStage);
            history.setToStage(newStage);
            history.setOperateUserId(operateUserId);
            history.setOperateUserName(operateUserName);
            history.setRemark(remark);
            history.setCreateTime(LocalDateTime.now());
            stageHistoryService.save(history);
        }
    }

    public List<OpportunityStageHistory> getStageHistory(Long opportunityId) {
        LambdaQueryWrapper<OpportunityStageHistory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OpportunityStageHistory::getOpportunityId, opportunityId);
        wrapper.orderByDesc(OpportunityStageHistory::getCreateTime);
        return stageHistoryService.list(wrapper);
    }

    public void exportExcel(HttpServletResponse response, String keyword) throws IOException {
        LambdaQueryWrapper<SalesOpportunity> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(SalesOpportunity::getOpportunityName, keyword)
                    .or().like(SalesOpportunity::getCustomerName, keyword));
        }
        List<SalesOpportunity> list = this.list(wrapper);
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        String fileName = URLEncoder.encode("销售商机", StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");
        EasyExcel.write(response.getOutputStream(), SalesOpportunity.class).sheet("销售商机").doWrite(list);
    }
}
