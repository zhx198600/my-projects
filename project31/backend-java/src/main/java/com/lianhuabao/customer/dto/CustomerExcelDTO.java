package com.lianhuabao.customer.dto;

import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;

@Data
public class CustomerExcelDTO {
    @ExcelProperty("客户姓名")
    private String name;
    @ExcelProperty("身份证号")
    private String idCard;
    @ExcelProperty("手机号码")
    private String phone;
    @ExcelProperty("邮箱")
    private String email;
    @ExcelProperty("性别")
    private String genderText;
    @ExcelProperty("年龄")
    private Integer age;
    @ExcelProperty("地址")
    private String address;
    @ExcelProperty("职业")
    private String occupation;
    @ExcelProperty("状态")
    private String statusText;
}
