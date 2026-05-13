package com.lianhuabao.customer.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("health_record")
public class HealthRecord {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long customerId;
    @TableField(exist = false)
    private String customerName;
    private LocalDate checkupDate;
    private String checkupHospital;
    private String checkupResult;
    private String medicalHistory;
    private String familyHistory;
    private Double height;
    private Double weight;
    private String bloodPressure;
    private String bloodSugar;
    private String bloodLipid;
    private String remarks;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    @TableLogic
    private Integer isDeleted;
}
