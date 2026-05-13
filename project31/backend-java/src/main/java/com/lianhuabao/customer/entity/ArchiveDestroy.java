package com.lianhuabao.customer.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("archive_destroy")
public class ArchiveDestroy {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long archiveId;
    private String archiveName;
    private String archiveNo;
    private Long applicantId;
    private String applicantName;
    private String destroyReason;
    private Integer status;
    private Long approveUserId;
    private String approveUserName;
    private String approveOpinion;
    private LocalDateTime approveTime;
    private LocalDateTime destroyTime;
    private String destroyOperator;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    @TableLogic
    private Integer isDeleted;
}
