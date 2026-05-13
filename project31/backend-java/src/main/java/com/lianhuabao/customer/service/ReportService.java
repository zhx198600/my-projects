package com.lianhuabao.customer.service;

import com.lianhuabao.customer.dto.report.*;
import com.lianhuabao.customer.entity.*;
import com.lianhuabao.customer.mapper.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final CustomerMapper customerMapper;
    private final SalesLeadMapper salesLeadMapper;
    private final SalesOpportunityMapper salesOpportunityMapper;
    private final SalesContractMapper salesContractMapper;
    private final ServiceTicketMapper serviceTicketMapper;
    private final ServiceTicketEvaluationMapper serviceTicketEvaluationMapper;
    private final ArchiveMapper archiveMapper;
    private final ArchiveBorrowMapper archiveBorrowMapper;
    private final ArchiveDestroyMapper archiveDestroyMapper;

    private LocalDateTime getStartDate(String timeRange, LocalDate endDate) {
        return switch (timeRange) {
            case "day" -> endDate.minusDays(30).atStartOfDay();
            case "week" -> endDate.minusWeeks(12).atStartOfDay();
            case "month" -> endDate.minusMonths(12).atStartOfDay();
            case "quarter" -> endDate.minusMonths(24).atStartOfDay();
            case "year" -> endDate.minusYears(5).atStartOfDay();
            default -> endDate.minusMonths(12).atStartOfDay();
        };
    }

    private String formatDate(LocalDateTime date, String timeRange) {
        DateTimeFormatter formatter = switch (timeRange) {
            case "day" -> DateTimeFormatter.ofPattern("MM-dd");
            case "week" -> DateTimeFormatter.ofPattern("'第'w'周'");
            case "month", "quarter" -> DateTimeFormatter.ofPattern("yyyy-MM");
            case "year" -> DateTimeFormatter.ofPattern("yyyy");
            default -> DateTimeFormatter.ofPattern("yyyy-MM");
        };
        return date.format(formatter);
    }

    public ChartDataDTO getCustomerTrend(String timeRange) {
        LocalDateTime endDate = LocalDate.now().atTime(23, 59, 59);
        LocalDateTime startDate = getStartDate(timeRange, LocalDate.now());

        List<Customer> customers = customerMapper.selectList(null).stream()
                .filter(c -> c.getCreateTime().isAfter(startDate) && c.getCreateTime().isBefore(endDate))
                .toList();

        Map<String, Integer> dateCount = new LinkedHashMap<>();
        LocalDateTime current = startDate;
        while (current.isBefore(endDate)) {
            String key = formatDate(current, timeRange);
            dateCount.put(key, 0);
            current = switch (timeRange) {
                case "day" -> current.plusDays(1);
                case "week" -> current.plusWeeks(1);
                case "month" -> current.plusMonths(1);
                case "quarter" -> current.plusMonths(3);
                case "year" -> current.plusYears(1);
                default -> current.plusMonths(1);
            };
        }

        for (Customer customer : customers) {
            String key = formatDate(customer.getCreateTime(), timeRange);
            dateCount.put(key, dateCount.getOrDefault(key, 0) + 1);
        }

        ChartDataDTO dto = new ChartDataDTO();
        dto.setXAxis(new ArrayList<>(dateCount.keySet()));
        dto.setSeries(List.of(new ChartDataDTO.SeriesData("新增客户",
                new ArrayList<>(dateCount.values().stream().map(v -> (Object) v).toList()), "line")));
        return dto;
    }

    public PieChartDataDTO getCustomerProfile() {
        List<Customer> customers = customerMapper.selectList(null);

        Map<String, Integer> ageGroups = new HashMap<>();
        ageGroups.put("18-25岁", 0);
        ageGroups.put("26-35岁", 0);
        ageGroups.put("36-45岁", 0);
        ageGroups.put("46-55岁", 0);
        ageGroups.put("55岁以上", 0);

        for (Customer customer : customers) {
            Integer age = customer.getAge();
            if (age == null) continue;
            String group = age <= 25 ? "18-25岁" :
                    age <= 35 ? "26-35岁" :
                    age <= 45 ? "36-45岁" :
                    age <= 55 ? "46-55岁" : "55岁以上";
            ageGroups.put(group, ageGroups.get(group) + 1);
        }

        PieChartDataDTO dto = new PieChartDataDTO();
        dto.setLegend(new ArrayList<>(ageGroups.keySet()));
        dto.setSeries(ageGroups.entrySet().stream()
                .map(e -> new PieChartDataDTO.PieItem(e.getKey(), e.getValue()))
                .collect(Collectors.toList()));
        return dto;
    }

    public ChartDataDTO getCustomerRegion() {
        List<Customer> customers = customerMapper.selectList(null);

        Map<String, Integer> regionCount = new HashMap<>();
        for (Customer customer : customers) {
            String address = customer.getAddress();
            if (address == null || address.isEmpty()) continue;
            String region = address.length() >= 3 ? address.substring(0, 3) : address;
            regionCount.put(region, regionCount.getOrDefault(region, 0) + 1);
        }

        List<Map.Entry<String, Integer>> sorted = regionCount.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(10)
                .toList();

        ChartDataDTO dto = new ChartDataDTO();
        dto.setXAxis(sorted.stream().map(Map.Entry::getKey).collect(Collectors.toList()));
        dto.setSeries(List.of(new ChartDataDTO.SeriesData("客户数量",
                sorted.stream().map(e -> (Object) e.getValue()).collect(Collectors.toList()), "bar")));
        return dto;
    }

    public ChartDataDTO getSalesRanking() {
        List<SalesContract> contracts = salesContractMapper.selectList(null).stream()
                .filter(c -> c.getStatus() == 2)
                .toList();

        Map<String, Double> userAmount = new HashMap<>();
        for (SalesContract contract : contracts) {
            String user = contract.getCreateUserName();
            if (user == null) continue;
            double amount = contract.getAmount() != null ? contract.getAmount().doubleValue() : 0;
            userAmount.put(user, userAmount.getOrDefault(user, 0.0) + amount);
        }

        List<Map.Entry<String, Double>> sorted = userAmount.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(10)
                .toList();

        ChartDataDTO dto = new ChartDataDTO();
        dto.setXAxis(sorted.stream().map(Map.Entry::getKey).collect(Collectors.toList()));
        dto.setSeries(List.of(new ChartDataDTO.SeriesData("销售额",
                sorted.stream().map(e -> (Object) e.getValue()).collect(Collectors.toList()), "bar")));
        return dto;
    }

    public ChartDataDTO getPerformanceTrend(String timeRange) {
        LocalDateTime endDate = LocalDate.now().atTime(23, 59, 59);
        LocalDateTime startDate = getStartDate(timeRange, LocalDate.now());

        List<SalesContract> contracts = salesContractMapper.selectList(null).stream()
                .filter(c -> c.getStatus() == 2 && c.getCreateTime().isAfter(startDate))
                .toList();

        Map<String, Double> dateAmount = new LinkedHashMap<>();
        LocalDateTime current = startDate;
        while (current.isBefore(endDate)) {
            String key = formatDate(current, timeRange);
            dateAmount.put(key, 0.0);
            current = switch (timeRange) {
                case "day" -> current.plusDays(1);
                case "week" -> current.plusWeeks(1);
                case "month" -> current.plusMonths(1);
                case "quarter" -> current.plusMonths(3);
                case "year" -> current.plusYears(1);
                default -> current.plusMonths(1);
            };
        }

        for (SalesContract contract : contracts) {
            String key = formatDate(contract.getCreateTime(), timeRange);
            double amount = contract.getAmount() != null ? contract.getAmount().doubleValue() : 0;
            dateAmount.put(key, dateAmount.getOrDefault(key, 0.0) + amount);
        }

        ChartDataDTO dto = new ChartDataDTO();
        dto.setXAxis(new ArrayList<>(dateAmount.keySet()));
        dto.setSeries(List.of(new ChartDataDTO.SeriesData("销售额",
                new ArrayList<>(dateAmount.values().stream().map(v -> (Object) v).toList()), "line")));
        return dto;
    }

    public FunnelChartDataDTO getConversionFunnel() {
        int leads = Math.toIntExact(salesLeadMapper.selectCount(null));
        int opportunities = Math.toIntExact(salesOpportunityMapper.selectCount(null));
        int contracts = Math.toIntExact(salesContractMapper.selectList(null).stream()
                .filter(c -> c.getStatus() == 2).count());

        FunnelChartDataDTO dto = new FunnelChartDataDTO();
        dto.setData(List.of(
                new FunnelChartDataDTO.FunnelItem("销售线索", leads),
                new FunnelChartDataDTO.FunnelItem("销售机会", opportunities),
                new FunnelChartDataDTO.FunnelItem("成交合同", contracts)
        ));
        return dto;
    }

    public ChartDataDTO getTicketResponseTrend(String timeRange) {
        LocalDateTime endDate = LocalDate.now().atTime(23, 59, 59);
        LocalDateTime startDate = getStartDate(timeRange, LocalDate.now());

        List<ServiceTicket> tickets = serviceTicketMapper.selectList(null).stream()
                .filter(t -> t.getCreateTime().isAfter(startDate) && t.getFirstResponseTime() != null)
                .toList();

        Map<String, List<Long>> dateResponse = new LinkedHashMap<>();
        LocalDateTime current = startDate;
        while (current.isBefore(endDate)) {
            String key = formatDate(current, timeRange);
            dateResponse.put(key, new ArrayList<>());
            current = switch (timeRange) {
                case "day" -> current.plusDays(1);
                case "week" -> current.plusWeeks(1);
                case "month" -> current.plusMonths(1);
                case "quarter" -> current.plusMonths(3);
                case "year" -> current.plusYears(1);
                default -> current.plusMonths(1);
            };
        }

        for (ServiceTicket ticket : tickets) {
            String key = formatDate(ticket.getCreateTime(), timeRange);
            long minutes = ChronoUnit.MINUTES.between(ticket.getCreateTime(), ticket.getFirstResponseTime());
            dateResponse.get(key).add(minutes);
        }

        Map<String, Double> avgResponse = new LinkedHashMap<>();
        for (Map.Entry<String, List<Long>> entry : dateResponse.entrySet()) {
            OptionalDouble avg = entry.getValue().stream().mapToLong(Long::longValue).average();
            avgResponse.put(entry.getKey(), avg.isPresent() ? Math.round(avg.getAsDouble() * 100) / 100.0 : 0);
        }

        ChartDataDTO dto = new ChartDataDTO();
        dto.setXAxis(new ArrayList<>(avgResponse.keySet()));
        dto.setSeries(List.of(new ChartDataDTO.SeriesData("平均响应时间(分钟)",
                new ArrayList<>(avgResponse.values().stream().map(v -> (Object) v).toList()), "line")));
        return dto;
    }

    public PieChartDataDTO getTicketResolveRate() {
        long total = serviceTicketMapper.selectCount(null);
        long resolved = serviceTicketMapper.selectList(null).stream()
                .filter(t -> t.getStatus() == 3).count();
        long unresolved = total - resolved;

        PieChartDataDTO dto = new PieChartDataDTO();
        dto.setLegend(List.of("已解决", "未解决"));
        dto.setSeries(List.of(
                new PieChartDataDTO.PieItem("已解决", (int) resolved),
                new PieChartDataDTO.PieItem("未解决", (int) unresolved)
        ));
        return dto;
    }

    public PieChartDataDTO getSatisfactionDistribution() {
        List<ServiceTicketEvaluation> evaluations = serviceTicketEvaluationMapper.selectList(null);

        Map<Integer, Integer> starCount = new HashMap<>();
        for (int i = 1; i <= 5; i++) starCount.put(i, 0);

        for (ServiceTicketEvaluation eval : evaluations) {
            Integer star = eval.getSatisfaction();
            if (star != null && star >= 1 && star <= 5) {
                starCount.put(star, starCount.get(star) + 1);
            }
        }

        PieChartDataDTO dto = new PieChartDataDTO();
        dto.setLegend(List.of("1星", "2星", "3星", "4星", "5星"));
        dto.setSeries(List.of(
                new PieChartDataDTO.PieItem("1星", starCount.get(1)),
                new PieChartDataDTO.PieItem("2星", starCount.get(2)),
                new PieChartDataDTO.PieItem("3星", starCount.get(3)),
                new PieChartDataDTO.PieItem("4星", starCount.get(4)),
                new PieChartDataDTO.PieItem("5星", starCount.get(5))
        ));
        return dto;
    }

    public ChartDataDTO getArchiveTrend(String timeRange) {
        LocalDateTime endDate = LocalDate.now().atTime(23, 59, 59);
        LocalDateTime startDate = getStartDate(timeRange, LocalDate.now());

        List<Archive> archives = archiveMapper.selectList(null).stream()
                .filter(a -> a.getCreateTime().isAfter(startDate))
                .toList();

        Map<String, Integer> dateCount = new LinkedHashMap<>();
        LocalDateTime current = startDate;
        while (current.isBefore(endDate)) {
            String key = formatDate(current, timeRange);
            dateCount.put(key, 0);
            current = switch (timeRange) {
                case "day" -> current.plusDays(1);
                case "week" -> current.plusWeeks(1);
                case "month" -> current.plusMonths(1);
                case "quarter" -> current.plusMonths(3);
                case "year" -> current.plusYears(1);
                default -> current.plusMonths(1);
            };
        }

        for (Archive archive : archives) {
            String key = formatDate(archive.getCreateTime(), timeRange);
            dateCount.put(key, dateCount.getOrDefault(key, 0) + 1);
        }

        ChartDataDTO dto = new ChartDataDTO();
        dto.setXAxis(new ArrayList<>(dateCount.keySet()));
        dto.setSeries(List.of(new ChartDataDTO.SeriesData("档案数量",
                new ArrayList<>(dateCount.values().stream().map(v -> (Object) v).toList()), "line")));
        return dto;
    }

    public PieChartDataDTO getBorrowRate() {
        long total = archiveMapper.selectCount(null);
        long borrowed = archiveBorrowMapper.selectCount(null);

        PieChartDataDTO dto = new PieChartDataDTO();
        dto.setLegend(List.of("已借阅", "未借阅"));
        dto.setSeries(List.of(
                new PieChartDataDTO.PieItem("已借阅", (int) borrowed),
                new PieChartDataDTO.PieItem("未借阅", (int) (total - borrowed))
        ));
        return dto;
    }

    public ChartDataDTO getDestroyStatistics(String timeRange) {
        LocalDateTime endDate = LocalDate.now().atTime(23, 59, 59);
        LocalDateTime startDate = getStartDate(timeRange, LocalDate.now());

        List<ArchiveDestroy> destroys = archiveDestroyMapper.selectList(null).stream()
                .filter(d -> d.getCreateTime() != null && d.getCreateTime().isAfter(startDate) && d.getStatus() == 2)
                .toList();

        Map<String, Integer> dateCount = new LinkedHashMap<>();
        LocalDateTime current = startDate;
        while (current.isBefore(endDate)) {
            String key = formatDate(current, timeRange);
            dateCount.put(key, 0);
            current = switch (timeRange) {
                case "day" -> current.plusDays(1);
                case "week" -> current.plusWeeks(1);
                case "month" -> current.plusMonths(1);
                case "quarter" -> current.plusMonths(3);
                case "year" -> current.plusYears(1);
                default -> current.plusMonths(1);
            };
        }

        for (ArchiveDestroy destroy : destroys) {
            String key = formatDate(destroy.getCreateTime(), timeRange);
            dateCount.put(key, dateCount.getOrDefault(key, 0) + 1);
        }

        ChartDataDTO dto = new ChartDataDTO();
        dto.setXAxis(new ArrayList<>(dateCount.keySet()));
        dto.setSeries(List.of(new ChartDataDTO.SeriesData("销毁数量",
                new ArrayList<>(dateCount.values().stream().map(v -> (Object) v).toList()), "bar")));
        return dto;
    }
}
