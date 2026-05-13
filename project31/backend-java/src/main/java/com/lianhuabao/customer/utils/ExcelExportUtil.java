package com.lianhuabao.customer.utils;

import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.ExcelWriter;
import com.alibaba.excel.write.metadata.WriteSheet;
import com.alibaba.excel.write.style.column.LongestMatchColumnWidthStyleStrategy;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StopWatch;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;
import java.util.function.Function;

@Slf4j
public class ExcelExportUtil {

    public static final int BATCH_SIZE = 1000;

    public static <T, D> void exportLargeData(
            HttpServletResponse response,
            String fileName,
            String sheetName,
            Class<T> clazz,
            int totalCount,
            Function<Integer, List<D>> batchQueryFunction,
            Function<D, T> convertFunction) throws IOException {

        StopWatch stopWatch = new StopWatch();
        stopWatch.start();

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + encodedFileName + ".xlsx");

        int totalPages = (totalCount + BATCH_SIZE - 1) / BATCH_SIZE;

        try (ExcelWriter excelWriter = EasyExcel.write(response.getOutputStream(), clazz)
                .registerWriteHandler(new LongestMatchColumnWidthStyleStrategy())
                .build()) {

            WriteSheet writeSheet = EasyExcel.writerSheet(sheetName).build();

            for (int pageNum = 1; pageNum <= totalPages; pageNum++) {
                List<D> entityList = batchQueryFunction.apply(pageNum);
                List<T> dataList = new ArrayList<>(entityList.size());

                for (D entity : entityList) {
                    dataList.add(convertFunction.apply(entity));
                }

                excelWriter.write(dataList, writeSheet);

                dataList.clear();
                entityList.clear();

                log.info("导出进度: {}/{} 批次", pageNum, totalPages);
            }
        }

        stopWatch.stop();
        log.info("导出完成，总数据量: {}，耗时: {}ms", totalCount, stopWatch.getTotalTimeMillis());
    }

    public static <T> void exportSimple(HttpServletResponse response, String fileName, String sheetName,
                                        Class<T> clazz, List<T> data) throws IOException {

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + encodedFileName + ".xlsx");

        EasyExcel.write(response.getOutputStream(), clazz)
                .registerWriteHandler(new LongestMatchColumnWidthStyleStrategy())
                .sheet(sheetName)
                .doWrite(data);
    }

    public static <T> void exportWithCallback(
            HttpServletResponse response,
            String fileName,
            String sheetName,
            Class<T> clazz,
            int totalCount,
            Consumer<Consumer<List<T>>> dataProvider) throws IOException {

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + encodedFileName + ".xlsx");

        try (ExcelWriter excelWriter = EasyExcel.write(response.getOutputStream(), clazz)
                .registerWriteHandler(new LongestMatchColumnWidthStyleStrategy())
                .build()) {

            WriteSheet writeSheet = EasyExcel.writerSheet(sheetName).build();

            dataProvider.accept(batchData -> {
                excelWriter.write(batchData, writeSheet);
            });
        }
    }

    public static void exportMultipleSheets(
            HttpServletResponse response,
            String fileName,
            List<SheetConfig<?>> sheetConfigs) throws IOException {

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + encodedFileName + ".xlsx");

        try (ExcelWriter excelWriter = EasyExcel.write(response.getOutputStream())
                .registerWriteHandler(new LongestMatchColumnWidthStyleStrategy())
                .build()) {

            for (int i = 0; i < sheetConfigs.size(); i++) {
                SheetConfig<?> config = sheetConfigs.get(i);
                WriteSheet writeSheet = EasyExcel.writerSheet(i, config.getSheetName())
                        .head(config.getClazz())
                        .build();
                excelWriter.write(config.getData(), writeSheet);
            }
        }
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class SheetConfig<T> {
        private String sheetName;
        private Class<T> clazz;
        private List<T> data;
    }
}
