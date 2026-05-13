package com.lianhuabao.customer.dto.report;

import lombok.Data;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
public class PieChartDataDTO {
    private List<String> legend;
    private List<PieItem> series;

    @Data
    @AllArgsConstructor
    public static class PieItem {
        private String name;
        private Integer value;
    }
}
