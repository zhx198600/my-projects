package com.lianhuabao.customer.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.lianhuabao.customer.entity.Customer;
import com.lianhuabao.customer.entity.HealthRecord;
import com.lianhuabao.customer.mapper.CustomerMapper;
import com.lianhuabao.customer.mapper.HealthRecordMapper;
import jakarta.annotation.Resource;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HealthRecordService extends ServiceImpl<HealthRecordMapper, HealthRecord> {

    @Resource
    private CustomerMapper customerMapper;

    public Page<HealthRecord> getPage(Integer pageNum, Integer pageSize, String keyword) {
        Page<HealthRecord> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<HealthRecord> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(HealthRecord::getCheckupHospital, keyword)
                    .or().like(HealthRecord::getCheckupResult, keyword)
                    .or().like(HealthRecord::getMedicalHistory, keyword)
                    .or().like(HealthRecord::getFamilyHistory, keyword));
        }
        wrapper.orderByDesc(HealthRecord::getCheckupDate);
        Page<HealthRecord> resultPage = this.page(page, wrapper);
        for (HealthRecord record : resultPage.getRecords()) {
            Customer customer = customerMapper.selectById(record.getCustomerId());
            if (customer != null) {
                record.setCustomerName(customer.getName());
            }
        }
        return resultPage;
    }

    public List<HealthRecord> getByCustomerId(Long customerId) {
        LambdaQueryWrapper<HealthRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(HealthRecord::getCustomerId, customerId);
        wrapper.orderByDesc(HealthRecord::getCheckupDate);
        return this.list(wrapper);
    }
}
