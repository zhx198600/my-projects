package com.lianhuabao.customer.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("sales_opportunity")
public class SalesOpportunity {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long leadId;
    private String opportunityName;
    private String customerName;
    private Long customerId;
    private BigDecimal expectedAmount;
    private BigDecimal probability;
    private Integer stage;
    private Long ownerUserId;
    private String ownerUserName;
    private String remark;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    @TableLogic
    private Integer isDeleted;
}
