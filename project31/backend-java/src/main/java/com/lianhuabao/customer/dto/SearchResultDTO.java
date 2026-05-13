package com.lianhuabao.customer.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Schema(description = "全局搜索结果DTO")
public class SearchResultDTO {

    @Schema(description = "搜索关键词")
    private String keyword;

    @Schema(description = "总命中数")
    private Long total;

    @Schema(description = "各模块统计数据")
    private Map<String, Long> moduleStats;

    @Schema(description = "客户搜索结果")
    private List<CustomerSearchVO> customers;

    @Schema(description = "销售机会搜索结果")
    private List<SalesSearchVO> salesOpportunities;

    @Schema(description = "档案搜索结果")
    private List<ArchiveSearchVO> archives;

    @Schema(description = "服务工单搜索结果")
    private List<TicketSearchVO> serviceTickets;

    @Data
    public static class CustomerSearchVO {
        private Long id;
        private String name;
        private String phone;
        private String idCard;
        private Integer gender;
        private Integer age;
        private String address;
        private Integer status;
        private LocalDateTime createTime;
        private final String module = "customer";
        private final String moduleName = "客户信息";
    }

    @Data
    public static class SalesSearchVO {
        private Long id;
        private String opportunityName;
        private String customerName;
        private java.math.BigDecimal expectedAmount;
        private Integer stage;
        private String ownerUserName;
        private LocalDateTime createTime;
        private final String module = "sales";
        private final String moduleName = "销售机会";
    }

    @Data
    public static class ArchiveSearchVO {
        private Long id;
        private String archiveNo;
        private String name;
        private String category;
        private String customerName;
        private Integer status;
        private LocalDateTime createTime;
        private final String module = "archive";
        private final String moduleName = "客户档案";
    }

    @Data
    public static class TicketSearchVO {
        private Long id;
        private String ticketNo;
        private String title;
        private Integer ticketType;
        private String customerName;
        private String customerPhone;
        private Integer priority;
        private Integer status;
        private String assigneeName;
        private LocalDateTime createTime;
        private final String module = "ticket";
        private final String moduleName = "服务工单";
    }
}
