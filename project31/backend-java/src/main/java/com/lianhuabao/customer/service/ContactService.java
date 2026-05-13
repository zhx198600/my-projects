package com.lianhuabao.customer.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.lianhuabao.customer.entity.Contact;
import com.lianhuabao.customer.entity.Customer;
import com.lianhuabao.customer.mapper.CustomerMapper;
import com.lianhuabao.customer.mapper.ContactMapper;
import jakarta.annotation.Resource;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContactService extends ServiceImpl<ContactMapper, Contact> {

    @Resource
    private CustomerMapper customerMapper;

    public Page<Contact> getPage(Integer pageNum, Integer pageSize, String keyword) {
        Page<Contact> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Contact> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(Contact::getName, keyword)
                    .or().like(Contact::getPhone, keyword)
                    .or().like(Contact::getRelationship, keyword));
        }
        wrapper.orderByDesc(Contact::getCreateTime);
        Page<Contact> resultPage = this.page(page, wrapper);
        for (Contact contact : resultPage.getRecords()) {
            Customer customer = customerMapper.selectById(contact.getCustomerId());
            if (customer != null) {
                contact.setCustomerName(customer.getName());
            }
        }
        return resultPage;
    }

    public List<Contact> getByCustomerId(Long customerId) {
        LambdaQueryWrapper<Contact> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Contact::getCustomerId, customerId);
        wrapper.orderByDesc(Contact::getCreateTime);
        return this.list(wrapper);
    }

    public List<Contact> getByCustomerIdAndType(Long customerId, Integer contactType) {
        LambdaQueryWrapper<Contact> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Contact::getCustomerId, customerId);
        wrapper.eq(Contact::getContactType, contactType);
        wrapper.orderByAsc(Contact::getBeneficiaryOrder);
        return this.list(wrapper);
    }
}
