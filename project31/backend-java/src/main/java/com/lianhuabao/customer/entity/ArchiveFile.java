package com.lianhuabao.customer.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("archive_file")
public class ArchiveFile {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long archiveId;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String objectName;
    private Long uploadUserId;
    private String uploadUserName;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableLogic
    private Integer isDeleted;
}
