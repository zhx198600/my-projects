package com.lianhuabao.customer.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.lianhuabao.customer.entity.ArchiveFile;
import com.lianhuabao.customer.mapper.ArchiveFileMapper;
import com.lianhuabao.customer.utils.MinioUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ArchiveFileService extends ServiceImpl<ArchiveFileMapper, ArchiveFile> {

    @Autowired
    private MinioUtil minioUtil;

    public List<ArchiveFile> getFilesByArchiveId(Long archiveId) {
        return this.list(new LambdaQueryWrapper<ArchiveFile>()
                .eq(ArchiveFile::getArchiveId, archiveId)
                .orderByDesc(ArchiveFile::getCreateTime));
    }

    public String getFileUrl(String objectName) {
        return minioUtil.getFileUrl(objectName);
    }
}
