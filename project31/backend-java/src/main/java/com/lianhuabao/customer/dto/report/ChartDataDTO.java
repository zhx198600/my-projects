package com.lianhuabao.customer.dto.report;

import lombok.Data;
import java.util.List;

@Data
public class ChartDataDTO {
    private List<String> xAxis;
    private List<SeriesData> series;

    @Data
    public static class SeriesData {
        private String name;
        private List<Object> data;
        private String type;

        public SeriesData(String name, List<Object> data, String type) {
            this.name = name;
            this.data = data;
            this.type = type;
        }
    }
}
