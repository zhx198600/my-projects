package com.lianhuabao.customer.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("archive")
public class Archive {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String archiveNo;
    private String name;
    private String category;
    private String description;
    private Long customerId;
    private String customerName;
    private String location;
    private Integer status;
    private Long createUserId;
    private String createUserName;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    @TableLogic
    private Integer isDeleted;
}
