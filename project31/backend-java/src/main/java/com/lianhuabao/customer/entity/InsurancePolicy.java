package com.lianhuabao.customer.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("insurance_policy")
public class InsurancePolicy {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long customerId;
    @TableField(exist = false)
    private String customerName;
    private String policyNo;
    private String insuranceType;
    private BigDecimal coverageAmount;
    private BigDecimal premium;
    private LocalDate policyDate;
    private Integer policyStatus;
    private Integer paymentTerm;
    private String beneficiary;
    private String remarks;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    @TableLogic
    private Integer isDeleted;
}
