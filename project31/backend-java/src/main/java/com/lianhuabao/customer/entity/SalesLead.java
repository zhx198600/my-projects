package com.lianhuabao.customer.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("sales_lead")
public class SalesLead {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String customerName;
    private String phone;
    private String email;
    private String company;
    private String source;
    private String interestProduct;
    private BigDecimal expectedAmount;
    private Long assignedUserId;
    private String assignedUserName;
    private Integer status;
    private String remark;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    @TableLogic
    private Integer isDeleted;
}
