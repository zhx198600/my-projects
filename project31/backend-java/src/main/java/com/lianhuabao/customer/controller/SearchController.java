package com.lianhuabao.customer.controller;

import com.lianhuabao.customer.common.Result;
import com.lianhuabao.customer.dto.SearchResultDTO;
import com.lianhuabao.customer.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Tag(name = "全局搜索", description = "跨模块全局搜索接口")
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    @Operation(summary = "全局搜索", description = "搜索客户、销售机会、档案、服务工单数据")
    public Result<SearchResultDTO> globalSearch(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "all") String module,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        return Result.success(searchService.globalSearch(keyword, module, pageNum, pageSize));
    }

    @GetMapping("/suggest")
    @Operation(summary = "搜索建议", description = "快速搜索建议，返回前5条")
    public Result<SearchResultDTO> searchSuggest(@RequestParam String keyword) {
        return Result.success(searchService.searchSuggest(keyword));
    }
}
