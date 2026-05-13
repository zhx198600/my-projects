package com.lianhuabao.customer.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("service_ticket_record")
public class ServiceTicketRecord {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long ticketId;
    private Integer recordType;
    private String content;
    private Long operatorId;
    private String operatorName;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
