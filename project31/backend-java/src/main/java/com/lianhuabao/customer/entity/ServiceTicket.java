package com.lianhuabao.customer.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("service_ticket")
public class ServiceTicket {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String ticketNo;
    private Integer ticketType;
    private String title;
    private String content;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private Long policyId;
    private Integer priority;
    private Integer status;
    private Long assigneeId;
    private String assigneeName;
    private LocalDateTime firstResponseTime;
    private LocalDateTime resolvedTime;
    private LocalDateTime closedTime;
    private Integer slaFirstResponse;
    private Integer slaResolve;
    private Long createBy;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    @TableLogic
    private Integer isDeleted;
}
