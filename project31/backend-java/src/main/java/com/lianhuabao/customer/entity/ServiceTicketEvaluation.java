package com.lianhuabao.customer.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("service_ticket_evaluation")
public class ServiceTicketEvaluation {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long ticketId;
    private Integer satisfaction;
    private String content;
    private Long reviewerId;
    private String reviewerName;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
