package com.lianhuabao.customer.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.lianhuabao.customer.entity.ArchiveArchive;
import com.lianhuabao.customer.mapper.ArchiveArchiveMapper;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ArchiveArchiveService extends ServiceImpl<ArchiveArchiveMapper, ArchiveArchive> {

    @Autowired
    private ArchiveService archiveService;

    public Page<ArchiveArchive> getPage(Integer pageNum, Integer pageSize, String keyword, Integer status) {
        Page<ArchiveArchive> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<ArchiveArchive> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(ArchiveArchive::getArchiveName, keyword)
                    .or().like(ArchiveArchive::getArchiveNo, keyword)
                    .or().like(ArchiveArchive::getApplicantName, keyword));
        }
        if (status != null) {
            wrapper.eq(ArchiveArchive::getStatus, status);
        }
        wrapper.orderByDesc(ArchiveArchive::getCreateTime);
        return this.page(page, wrapper);
    }

    @Transactional
    public void applyArchive(ArchiveArchive archiveArchive, Long userId, String userName) {
        archiveArchive.setApplicantId(userId);
        archiveArchive.setApplicantName(userName);
        archiveArchive.setStatus(1);
        this.save(archiveArchive);
        archiveService.updateStatus(archiveArchive.getArchiveId(), 2, "提交归档申请", "", userId, userName);
    }

    @Transactional
    public void approveArchive(Long id, Integer status, String opinion, Long userId, String userName) {
        ArchiveArchive archiveArchive = this.getById(id);
        archiveArchive.setStatus(status);
        archiveArchive.setApproveUserId(userId);
        archiveArchive.setApproveUserName(userName);
        archiveArchive.setApproveOpinion(opinion);
        archiveArchive.setApproveTime(LocalDateTime.now());
        this.updateById(archiveArchive);

        if (status == 2) {
            ArchiveArchive aa = this.getById(id);
            archiveService.updateStatus(aa.getArchiveId(), 3, "归档审核通过", opinion, userId, userName);
        } else {
            ArchiveArchive aa = this.getById(id);
            archiveService.updateStatus(aa.getArchiveId(), 1, "归档审核驳回", opinion, userId, userName);
        }
    }
}
