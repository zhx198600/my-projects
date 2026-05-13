package com.lianhuabao.customer.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("opportunity_stage_history")
public class OpportunityStageHistory {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long opportunityId;
    private Integer fromStage;
    private Integer toStage;
    private Long operateUserId;
    private String operateUserName;
    private String remark;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
