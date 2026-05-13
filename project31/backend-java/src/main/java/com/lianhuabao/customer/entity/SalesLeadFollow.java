package com.lianhuabao.customer.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("sales_lead_follow")
public class SalesLeadFollow {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long leadId;
    private Long followUserId;
    private String followUserName;
    private String followType;
    private String content;
    private LocalDateTime followTime;
    private String nextStep;
    private LocalDateTime nextFollowTime;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableLogic
    private Integer isDeleted;
}
