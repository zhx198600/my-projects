package com.lianhuabao.customer.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("archive_status_history")
public class ArchiveStatusHistory {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long archiveId;
    private Integer oldStatus;
    private Integer newStatus;
    private String operationType;
    private String remark;
    private Long operatorId;
    private String operatorName;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
