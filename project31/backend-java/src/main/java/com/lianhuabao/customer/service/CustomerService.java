package com.lianhuabao.customer.service;

import com.alibaba.excel.EasyExcel;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.lianhuabao.customer.dto.CustomerExcelDTO;
import com.lianhuabao.customer.entity.Customer;
import com.lianhuabao.customer.mapper.CustomerMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class CustomerService extends ServiceImpl<CustomerMapper, Customer> {

    public Page<Customer> getPage(Integer pageNum, Integer pageSize, String keyword) {
        Page<Customer> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Customer> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(Customer::getName, keyword)
                    .or().like(Customer::getPhone, keyword)
                    .or().like(Customer::getIdCard, keyword)
                    .or().like(Customer::getAddress, keyword)
                    .or().like(Customer::getOccupation, keyword));
        }
        wrapper.orderByDesc(Customer::getCreateTime);
        return this.page(page, wrapper);
    }

    public void exportExcel(HttpServletResponse response, String keyword) throws IOException {
        LambdaQueryWrapper<Customer> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(Customer::getName, keyword)
                    .or().like(Customer::getPhone, keyword)
                    .or().like(Customer::getIdCard, keyword)
                    .or().like(Customer::getAddress, keyword)
                    .or().like(Customer::getOccupation, keyword));
        }
        List<Customer> customers = this.list(wrapper);
        List<CustomerExcelDTO> excelList = new ArrayList<>();
        for (Customer customer : customers) {
            CustomerExcelDTO dto = new CustomerExcelDTO();
            dto.setName(customer.getName());
            dto.setIdCard(customer.getIdCard());
            dto.setPhone(customer.getPhone());
            dto.setEmail(customer.getEmail());
            dto.setGenderText(customer.getGender() == 1 ? "男" : "女");
            dto.setAge(customer.getAge());
            dto.setAddress(customer.getAddress());
            dto.setOccupation(customer.getOccupation());
            dto.setStatusText(customer.getStatus() == 1 ? "启用" : "禁用");
            excelList.add(dto);
        }
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        String fileName = URLEncoder.encode("客户信息", StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");
        EasyExcel.write(response.getOutputStream(), CustomerExcelDTO.class).sheet("客户信息").doWrite(excelList);
    }
}
