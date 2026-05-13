package com.lianhuabao.customer.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("archive_borrow")
public class ArchiveBorrow {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long archiveId;
    private String archiveName;
    private String archiveNo;
    private Long applicantId;
    private String applicantName;
    private String borrowReason;
    private LocalDateTime expectReturnTime;
    private LocalDateTime actualReturnTime;
    private Integer status;
    private Long approveUserId;
    private String approveUserName;
    private String approveOpinion;
    private LocalDateTime approveTime;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    @TableLogic
    private Integer isDeleted;
}
