package com.lianhuabao.customer.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.lianhuabao.customer.dto.SearchResultDTO;
import com.lianhuabao.customer.entity.Archive;
import com.lianhuabao.customer.entity.Customer;
import com.lianhuabao.customer.entity.SalesOpportunity;
import com.lianhuabao.customer.entity.ServiceTicket;
import com.lianhuabao.customer.mapper.ArchiveMapper;
import com.lianhuabao.customer.mapper.CustomerMapper;
import com.lianhuabao.customer.mapper.SalesOpportunityMapper;
import com.lianhuabao.customer.mapper.ServiceTicketMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final CustomerMapper customerMapper;
    private final SalesOpportunityMapper salesOpportunityMapper;
    private final ArchiveMapper archiveMapper;
    private final ServiceTicketMapper serviceTicketMapper;

    public SearchResultDTO globalSearch(String keyword, String module, Integer pageNum, Integer pageSize) {
        SearchResultDTO result = new SearchResultDTO();
        result.setKeyword(keyword);
        Map<String, Long> stats = new HashMap<>();

        if (!StringUtils.hasText(keyword)) {
            result.setTotal(0L);
            result.setModuleStats(stats);
            return result;
        }

        long total = 0L;

        if ("all".equals(module) || "customer".equals(module)) {
            LambdaQueryWrapper<Customer> customerWrapper = buildCustomerWrapper(keyword);
            Page<Customer> customerPage = customerMapper.selectPage(new Page<>(pageNum, pageSize), customerWrapper);
            List<SearchResultDTO.CustomerSearchVO> customerVOs = customerPage.getRecords().stream()
                    .map(this::convertToCustomerVO)
                    .collect(Collectors.toList());
            result.setCustomers(customerVOs);
            stats.put("customer", customerPage.getTotal());
            total += customerPage.getTotal();
        }

        if ("all".equals(module) || "sales".equals(module)) {
            LambdaQueryWrapper<SalesOpportunity> salesWrapper = buildSalesWrapper(keyword);
            Page<SalesOpportunity> salesPage = salesOpportunityMapper.selectPage(new Page<>(pageNum, pageSize), salesWrapper);
            List<SearchResultDTO.SalesSearchVO> salesVOs = salesPage.getRecords().stream()
                    .map(this::convertToSalesVO)
                    .collect(Collectors.toList());
            result.setSalesOpportunities(salesVOs);
            stats.put("sales", salesPage.getTotal());
            total += salesPage.getTotal();
        }

        if ("all".equals(module) || "archive".equals(module)) {
            LambdaQueryWrapper<Archive> archiveWrapper = buildArchiveWrapper(keyword);
            Page<Archive> archivePage = archiveMapper.selectPage(new Page<>(pageNum, pageSize), archiveWrapper);
            List<SearchResultDTO.ArchiveSearchVO> archiveVOs = archivePage.getRecords().stream()
                    .map(this::convertToArchiveVO)
                    .collect(Collectors.toList());
            result.setArchives(archiveVOs);
            stats.put("archive", archivePage.getTotal());
            total += archivePage.getTotal();
        }

        if ("all".equals(module) || "ticket".equals(module)) {
            LambdaQueryWrapper<ServiceTicket> ticketWrapper = buildTicketWrapper(keyword);
            Page<ServiceTicket> ticketPage = serviceTicketMapper.selectPage(new Page<>(pageNum, pageSize), ticketWrapper);
            List<SearchResultDTO.TicketSearchVO> ticketVOs = ticketPage.getRecords().stream()
                    .map(this::convertToTicketVO)
                    .collect(Collectors.toList());
            result.setServiceTickets(ticketVOs);
            stats.put("ticket", ticketPage.getTotal());
            total += ticketPage.getTotal();
        }

        result.setTotal(total);
        result.setModuleStats(stats);
        return result;
    }

    public SearchResultDTO searchSuggest(String keyword) {
        SearchResultDTO result = new SearchResultDTO();
        result.setKeyword(keyword);

        if (!StringUtils.hasText(keyword)) {
            return result;
        }

        int suggestSize = 5;

        LambdaQueryWrapper<Customer> customerWrapper = buildCustomerWrapper(keyword);
        Page<Customer> customerPage = customerMapper.selectPage(new Page<>(1, suggestSize), customerWrapper);
        result.setCustomers(customerPage.getRecords().stream().map(this::convertToCustomerVO).collect(Collectors.toList()));

        LambdaQueryWrapper<SalesOpportunity> salesWrapper = buildSalesWrapper(keyword);
        Page<SalesOpportunity> salesPage = salesOpportunityMapper.selectPage(new Page<>(1, suggestSize), salesWrapper);
        result.setSalesOpportunities(salesPage.getRecords().stream().map(this::convertToSalesVO).collect(Collectors.toList()));

        LambdaQueryWrapper<Archive> archiveWrapper = buildArchiveWrapper(keyword);
        Page<Archive> archivePage = archiveMapper.selectPage(new Page<>(1, suggestSize), archiveWrapper);
        result.setArchives(archivePage.getRecords().stream().map(this::convertToArchiveVO).collect(Collectors.toList()));

        LambdaQueryWrapper<ServiceTicket> ticketWrapper = buildTicketWrapper(keyword);
        Page<ServiceTicket> ticketPage = serviceTicketMapper.selectPage(new Page<>(1, suggestSize), ticketWrapper);
        result.setServiceTickets(ticketPage.getRecords().stream().map(this::convertToTicketVO).collect(Collectors.toList()));

        return result;
    }

    private LambdaQueryWrapper<Customer> buildCustomerWrapper(String keyword) {
        return new LambdaQueryWrapper<Customer>()
                .and(w -> w.like(Customer::getName, keyword)
                        .or().like(Customer::getPhone, keyword)
                        .or().like(Customer::getIdCard, keyword)
                        .or().like(Customer::getEmail, keyword)
                        .or().like(Customer::getAddress, keyword));
    }

    private LambdaQueryWrapper<SalesOpportunity> buildSalesWrapper(String keyword) {
        return new LambdaQueryWrapper<SalesOpportunity>()
                .and(w -> w.like(SalesOpportunity::getOpportunityName, keyword)
                        .or().like(SalesOpportunity::getCustomerName, keyword)
                        .or().like(SalesOpportunity::getRemark, keyword));
    }

    private LambdaQueryWrapper<Archive> buildArchiveWrapper(String keyword) {
        return new LambdaQueryWrapper<Archive>()
                .and(w -> w.like(Archive::getArchiveNo, keyword)
                        .or().like(Archive::getName, keyword)
                        .or().like(Archive::getCategory, keyword)
                        .or().like(Archive::getCustomerName, keyword)
                        .or().like(Archive::getDescription, keyword));
    }

    private LambdaQueryWrapper<ServiceTicket> buildTicketWrapper(String keyword) {
        return new LambdaQueryWrapper<ServiceTicket>()
                .and(w -> w.like(ServiceTicket::getTicketNo, keyword)
                        .or().like(ServiceTicket::getTitle, keyword)
                        .or().like(ServiceTicket::getContent, keyword)
                        .or().like(ServiceTicket::getCustomerName, keyword)
                        .or().like(ServiceTicket::getCustomerPhone, keyword));
    }

    private SearchResultDTO.CustomerSearchVO convertToCustomerVO(Customer customer) {
        SearchResultDTO.CustomerSearchVO vo = new SearchResultDTO.CustomerSearchVO();
        BeanUtils.copyProperties(customer, vo);
        return vo;
    }

    private SearchResultDTO.SalesSearchVO convertToSalesVO(SalesOpportunity sales) {
        SearchResultDTO.SalesSearchVO vo = new SearchResultDTO.SalesSearchVO();
        BeanUtils.copyProperties(sales, vo);
        return vo;
    }

    private SearchResultDTO.ArchiveSearchVO convertToArchiveVO(Archive archive) {
        SearchResultDTO.ArchiveSearchVO vo = new SearchResultDTO.ArchiveSearchVO();
        BeanUtils.copyProperties(archive, vo);
        return vo;
    }

    private SearchResultDTO.TicketSearchVO convertToTicketVO(ServiceTicket ticket) {
        SearchResultDTO.TicketSearchVO vo = new SearchResultDTO.TicketSearchVO();
        BeanUtils.copyProperties(ticket, vo);
        return vo;
    }
}
