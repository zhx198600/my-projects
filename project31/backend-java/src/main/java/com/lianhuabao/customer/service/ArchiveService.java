package com.lianhuabao.customer.service;

import com.alibaba.excel.EasyExcel;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.lianhuabao.customer.dto.ArchiveExcelDTO;
import com.lianhuabao.customer.entity.*;
import com.lianhuabao.customer.mapper.ArchiveMapper;
import com.lianhuabao.customer.mapper.ArchiveStatusHistoryMapper;
import com.lianhuabao.customer.utils.MinioUtil;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class ArchiveService extends ServiceImpl<ArchiveMapper, Archive> {

    @Autowired
    private ArchiveStatusHistoryMapper statusHistoryMapper;

    @Autowired
    private ArchiveFileService archiveFileService;

    @Autowired
    private MinioUtil minioUtil;

    @Transactional
    public Archive createArchive(Archive archive, MultipartFile[] files, Long userId, String userName) {
        String archiveNo = generateArchiveNo();
        archive.setArchiveNo(archiveNo);
        archive.setStatus(1);
        archive.setCreateUserId(userId);
        archive.setCreateUserName(userName);
        this.save(archive);

        if (files != null && files.length > 0) {
            for (MultipartFile file : files) {
                String objectName = minioUtil.uploadFile(file);
                ArchiveFile archiveFile = new ArchiveFile();
                archiveFile.setArchiveId(archive.getId());
                archiveFile.setFileName(file.getOriginalFilename());
                archiveFile.setFileType(file.getContentType());
                archiveFile.setFileSize(file.getSize());
                archiveFile.setObjectName(objectName);
                archiveFile.setUploadUserId(userId);
                archiveFile.setUploadUserName(userName);
                archiveFileService.save(archiveFile);
            }
        }

        addStatusHistory(archive.getId(), null, 1, "创建档案", userId, userName);
        return archive;
    }

    private String generateArchiveNo() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = this.count(new LambdaQueryWrapper<Archive>()
                .apply("DATE_FORMAT(create_time, '%Y%m%d') = {0}", dateStr));
        return "DA" + dateStr + String.format("%04d", count + 1);
    }

    private void addStatusHistory(Long archiveId, Integer oldStatus, Integer newStatus, 
                                  String operationType, Long operatorId, String operatorName) {
        ArchiveStatusHistory history = new ArchiveStatusHistory();
        history.setArchiveId(archiveId);
        history.setOldStatus(oldStatus);
        history.setNewStatus(newStatus);
        history.setOperationType(operationType);
        history.setOperatorId(operatorId);
        history.setOperatorName(operatorName);
        statusHistoryMapper.insert(history);
    }

    public Page<Archive> getPage(Integer pageNum, Integer pageSize, String keyword, Integer status, String category) {
        Page<Archive> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Archive> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(Archive::getName, keyword)
                    .or().like(Archive::getArchiveNo, keyword)
                    .or().like(Archive::getCustomerName, keyword)
                    .or().like(Archive::getDescription, keyword));
        }
        if (status != null) {
            wrapper.eq(Archive::getStatus, status);
        }
        if (StringUtils.isNotBlank(category)) {
            wrapper.eq(Archive::getCategory, category);
        }
        wrapper.orderByDesc(Archive::getCreateTime);
        return this.page(page, wrapper);
    }

    @Transactional
    public void updateStatus(Long archiveId, Integer newStatus, String operationType, String remark, Long operatorId, String operatorName) {
        Archive archive = this.getById(archiveId);
        Integer oldStatus = archive.getStatus();
        archive.setStatus(newStatus);
        this.updateById(archive);
        addStatusHistory(archiveId, oldStatus, newStatus, operationType, operatorId, operatorName);
    }

    public List<ArchiveStatusHistory> getStatusHistory(Long archiveId) {
        return statusHistoryMapper.selectList(new LambdaQueryWrapper<ArchiveStatusHistory>()
                .eq(ArchiveStatusHistory::getArchiveId, archiveId)
                .orderByDesc(ArchiveStatusHistory::getCreateTime));
    }

    public void exportExcel(HttpServletResponse response, String keyword, Integer status, String category) throws IOException {
        LambdaQueryWrapper<Archive> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(Archive::getName, keyword)
                    .or().like(Archive::getArchiveNo, keyword)
                    .or().like(Archive::getCustomerName, keyword));
        }
        if (status != null) {
            wrapper.eq(Archive::getStatus, status);
        }
        if (StringUtils.isNotBlank(category)) {
            wrapper.eq(Archive::getCategory, category);
        }
        List<Archive> archives = this.list(wrapper);
        List<ArchiveExcelDTO> excelList = new ArrayList<>();
        for (Archive archive : archives) {
            ArchiveExcelDTO dto = new ArchiveExcelDTO();
            dto.setArchiveNo(archive.getArchiveNo());
            dto.setName(archive.getName());
            dto.setCategory(archive.getCategory());
            dto.setCustomerName(archive.getCustomerName());
            dto.setLocation(archive.getLocation());
            dto.setStatusText(getStatusText(archive.getStatus()));
            dto.setCreateUserName(archive.getCreateUserName());
            dto.setCreateTime(archive.getCreateTime());
            excelList.add(dto);
        }
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        String fileName = URLEncoder.encode("档案信息", StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");
        EasyExcel.write(response.getOutputStream(), ArchiveExcelDTO.class).sheet("档案信息").doWrite(excelList);
    }

    private String getStatusText(Integer status) {
        return switch (status) {
            case 1 -> "草稿";
            case 2 -> "待归档审核";
            case 3 -> "已归档";
            case 4 -> "借阅中";
            case 5 -> "待销毁审核";
            case 6 -> "已销毁";
            default -> "未知";
        };
    }
}
