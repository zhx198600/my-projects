package com.lianhuabao.customer.service;

import com.alibaba.excel.EasyExcel;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.lianhuabao.customer.entity.CommissionRule;
import com.lianhuabao.customer.entity.CommissionSettlement;
import com.lianhuabao.customer.entity.SalesContract;
import com.lianhuabao.customer.mapper.CommissionRuleMapper;
import com.lianhuabao.customer.mapper.CommissionSettlementMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class CommissionService extends ServiceImpl<CommissionSettlementMapper, CommissionSettlement> {

    private final CommissionRuleMapper ruleMapper;
    private final SalesContractService contractService;

    public CommissionService(CommissionRuleMapper ruleMapper, SalesContractService contractService) {
        this.ruleMapper = ruleMapper;
        this.contractService = contractService;
    }

    public Page<CommissionRule> getRulePage(Integer pageNum, Integer pageSize, String keyword) {
        Page<CommissionRule> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<CommissionRule> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.like(CommissionRule::getRuleName, keyword);
        }
        wrapper.orderByDesc(CommissionRule::getCreateTime);
        Page<CommissionRule> result = new Page<>();
        result.setRecords(ruleMapper.selectPage(page, wrapper).getRecords());
        result.setTotal(page.getTotal());
        return result;
    }

    public List<CommissionRule> getAllRules() {
        LambdaQueryWrapper<CommissionRule> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CommissionRule::getStatus, 1);
        wrapper.orderByAsc(CommissionRule::getMinAmount);
        return ruleMapper.selectList(wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    public void saveRule(CommissionRule rule) {
        if (rule.getId() == null) {
            rule.setCreateTime(LocalDateTime.now());
        }
        rule.setUpdateTime(LocalDateTime.now());
        if (rule.getId() == null) {
            ruleMapper.insert(rule);
        } else {
            ruleMapper.updateById(rule);
        }
    }

    public Page<CommissionSettlement> getSettlementPage(Integer pageNum, Integer pageSize, String keyword, Integer status, Long salesUserId) {
        Page<CommissionSettlement> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<CommissionSettlement> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(CommissionSettlement::getSettlementNo, keyword)
                    .or().like(CommissionSettlement::getSalesUserName, keyword)
                    .or().like(CommissionSettlement::getContractNo, keyword));
        }
        if (status != null) {
            wrapper.eq(CommissionSettlement::getStatus, status);
        }
        if (salesUserId != null) {
            wrapper.eq(CommissionSettlement::getSalesUserId, salesUserId);
        }
        wrapper.orderByDesc(CommissionSettlement::getCreateTime);
        return this.page(page, wrapper);
    }

    public BigDecimal calculateCommission(BigDecimal amount) {
        List<CommissionRule> rules = getAllRules();
        for (CommissionRule rule : rules) {
            if (amount.compareTo(rule.getMinAmount()) >= 0 &&
                (rule.getMaxAmount() == null || amount.compareTo(rule.getMaxAmount()) < 0)) {
                return amount.multiply(rule.getRate()).divide(new BigDecimal("100"));
            }
        }
        return BigDecimal.ZERO;
    }

    @Transactional(rollbackFor = Exception.class)
    public CommissionSettlement createSettlement(Long contractId) {
        SalesContract contract = contractService.getById(contractId);
        if (contract == null) {
            return null;
        }

        BigDecimal commissionAmount = calculateCommission(contract.getAmount());
        BigDecimal rate = BigDecimal.ZERO;
        Long ruleId = null;

        List<CommissionRule> rules = getAllRules();
        for (CommissionRule rule : rules) {
            if (contract.getAmount().compareTo(rule.getMinAmount()) >= 0 &&
                (rule.getMaxAmount() == null || contract.getAmount().compareTo(rule.getMaxAmount()) < 0)) {
                rate = rule.getRate();
                ruleId = rule.getId();
                break;
            }
        }

        CommissionSettlement settlement = new CommissionSettlement();
        settlement.setSettlementNo("JS" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
        settlement.setContractId(contractId);
        settlement.setContractNo(contract.getContractNo());
        settlement.setContractAmount(contract.getAmount());
        settlement.setCommissionRate(rate);
        settlement.setCommissionAmount(commissionAmount);
        settlement.setRuleId(ruleId);
        settlement.setStatus(1);
        settlement.setCreateTime(LocalDateTime.now());
        settlement.setUpdateTime(LocalDateTime.now());
        this.save(settlement);
        return settlement;
    }

    @Transactional(rollbackFor = Exception.class)
    public void settle(Long id) {
        CommissionSettlement settlement = this.getById(id);
        if (settlement != null) {
            settlement.setStatus(2);
            settlement.setSettleTime(LocalDateTime.now());
            settlement.setUpdateTime(LocalDateTime.now());
            this.updateById(settlement);
        }
    }

    public void exportSettlementExcel(HttpServletResponse response, String keyword) throws IOException {
        LambdaQueryWrapper<CommissionSettlement> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(CommissionSettlement::getSettlementNo, keyword)
                    .or().like(CommissionSettlement::getSalesUserName, keyword)
                    .or().like(CommissionSettlement::getContractNo, keyword));
        }
        List<CommissionSettlement> list = this.list(wrapper);
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        String fileName = URLEncoder.encode("佣金结算记录", StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");
        EasyExcel.write(response.getOutputStream(), CommissionSettlement.class).sheet("佣金结算").doWrite(list);
    }
}
