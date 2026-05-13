package com.lianhuabao.customer.dto;

import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;

@Data
public class ServiceTicketExcelDTO {
    @ExcelProperty("工单编号")
    private String ticketNo;
    @ExcelProperty("工单类型")
    private String ticketType;
    @ExcelProperty("工单标题")
    private String title;
    @ExcelProperty("客户姓名")
    private String customerName;
    @ExcelProperty("客户电话")
    private String customerPhone;
    @ExcelProperty("优先级")
    private String priority;
    @ExcelProperty("状态")
    private String status;
    @ExcelProperty("处理人")
    private String assigneeName;
    @ExcelProperty("首次响应时长(分钟)")
    private Integer slaFirstResponse;
    @ExcelProperty("解决时长(分钟)")
    private Integer slaResolve;
    @ExcelProperty("创建时间")
    private String createTime;
}
