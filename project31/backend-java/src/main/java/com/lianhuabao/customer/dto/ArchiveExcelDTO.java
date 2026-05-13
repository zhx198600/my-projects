package com.lianhuabao.customer.dto;

import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ArchiveExcelDTO {
    @ExcelProperty("档案编号")
    private String archiveNo;
    @ExcelProperty("档案名称")
    private String name;
    @ExcelProperty("档案分类")
    private String category;
    @ExcelProperty("关联客户")
    private String customerName;
    @ExcelProperty("存放位置")
    private String location;
    @ExcelProperty("状态")
    private String statusText;
    @ExcelProperty("创建人")
    private String createUserName;
    @ExcelProperty("创建时间")
    private LocalDateTime createTime;
}
