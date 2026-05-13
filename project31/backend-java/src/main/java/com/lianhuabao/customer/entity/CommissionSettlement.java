package com.lianhuabao.customer.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("commission_settlement")
public class CommissionSettlement {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String settlementNo;
    private Long salesUserId;
    private String salesUserName;
    private Long contractId;
    private String contractNo;
    private BigDecimal contractAmount;
    private BigDecimal commissionRate;
    private BigDecimal commissionAmount;
    private Long ruleId;
    private Integer status;
    private LocalDateTime settleTime;
    private String remark;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
