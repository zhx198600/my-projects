package com.lianhuabao.customer.dto.report;

import lombok.Data;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
public class FunnelChartDataDTO {
    private List<FunnelItem> data;

    @Data
    @AllArgsConstructor
    public static class FunnelItem {
        private String name;
        private Integer value;
    }
}
