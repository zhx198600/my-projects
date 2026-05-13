package com.lianhuabao.customer.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("contact")
public class Contact {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long customerId;
    @TableField(exist = false)
    private String customerName;
    private String name;
    private String phone;
    private String idCard;
    private String relationship;
    private Integer contactType;
    private Integer beneficiaryOrder;
    private Double beneficiaryRatio;
    private String remarks;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    @TableLogic
    private Integer isDeleted;
}
