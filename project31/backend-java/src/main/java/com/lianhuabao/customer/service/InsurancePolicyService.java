package com.lianhuabao.customer.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.lianhuabao.customer.entity.Customer;
import com.lianhuabao.customer.entity.InsurancePolicy;
import com.lianhuabao.customer.mapper.CustomerMapper;
import com.lianhuabao.customer.mapper.InsurancePolicyMapper;
import jakarta.annotation.Resource;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InsurancePolicyService extends ServiceImpl<InsurancePolicyMapper, InsurancePolicy> {

    @Resource
    private CustomerMapper customerMapper;

    public Page<InsurancePolicy> getPage(Integer pageNum, Integer pageSize, String keyword) {
        Page<InsurancePolicy> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<InsurancePolicy> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(InsurancePolicy::getPolicyNo, keyword)
                    .or().like(InsurancePolicy::getInsuranceType, keyword)
                    .or().like(InsurancePolicy::getBeneficiary, keyword));
        }
        wrapper.orderByDesc(InsurancePolicy::getCreateTime);
        Page<InsurancePolicy> resultPage = this.page(page, wrapper);
        for (InsurancePolicy policy : resultPage.getRecords()) {
            Customer customer = customerMapper.selectById(policy.getCustomerId());
            if (customer != null) {
                policy.setCustomerName(customer.getName());
            }
        }
        return resultPage;
    }

    public List<InsurancePolicy> getByCustomerId(Long customerId) {
        LambdaQueryWrapper<InsurancePolicy> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(InsurancePolicy::getCustomerId, customerId);
        wrapper.orderByDesc(InsurancePolicy::getPolicyDate);
        return this.list(wrapper);
    }
}
