package com.lianhuabao.customer.service;

import com.alibaba.excel.EasyExcel;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.lianhuabao.customer.entity.SalesContract;
import com.lianhuabao.customer.mapper.SalesContractMapper;
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
public class SalesContractService extends ServiceImpl<SalesContractMapper, SalesContract> {

    public Page<SalesContract> getPage(Integer pageNum, Integer pageSize, String keyword, Integer status, Long customerId) {
        Page<SalesContract> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<SalesContract> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(SalesContract::getContractNo, keyword)
                    .or().like(SalesContract::getContractName, keyword)
                    .or().like(SalesContract::getCustomerName, keyword));
        }
        if (status != null) {
            wrapper.eq(SalesContract::getStatus, status);
        }
        if (customerId != null) {
            wrapper.eq(SalesContract::getCustomerId, customerId);
        }
        wrapper.orderByDesc(SalesContract::getCreateTime);
        return this.page(page, wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    public void audit(Long id, Long auditUserId, String auditUserName, Integer status, String remark) {
        SalesContract contract = this.getById(id);
        if (contract != null) {
            contract.setStatus(status);
            contract.setAuditUserId(auditUserId);
            contract.setAuditUserName(auditUserName);
            contract.setAuditTime(LocalDateTime.now());
            contract.setAuditRemark(remark);
            contract.setUpdateTime(LocalDateTime.now());
            this.updateById(contract);
        }
    }

    public void exportExcel(HttpServletResponse response, String keyword) throws IOException {
        LambdaQueryWrapper<SalesContract> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(SalesContract::getContractNo, keyword)
                    .or().like(SalesContract::getContractName, keyword)
                    .or().like(SalesContract::getCustomerName, keyword));
        }
        List<SalesContract> list = this.list(wrapper);
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        String fileName = URLEncoder.encode("销售合同", StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");
        EasyExcel.write(response.getOutputStream(), SalesContract.class).sheet("销售合同").doWrite(list);
    }
}
