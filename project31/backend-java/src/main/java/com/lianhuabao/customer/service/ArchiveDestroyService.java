package com.lianhuabao.customer.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.lianhuabao.customer.entity.ArchiveDestroy;
import com.lianhuabao.customer.mapper.ArchiveDestroyMapper;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ArchiveDestroyService extends ServiceImpl<ArchiveDestroyMapper, ArchiveDestroy> {

    @Autowired
    private ArchiveService archiveService;

    public Page<ArchiveDestroy> getPage(Integer pageNum, Integer pageSize, String keyword, Integer status) {
        Page<ArchiveDestroy> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<ArchiveDestroy> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(ArchiveDestroy::getArchiveName, keyword)
                    .or().like(ArchiveDestroy::getArchiveNo, keyword)
                    .or().like(ArchiveDestroy::getApplicantName, keyword));
        }
        if (status != null) {
            wrapper.eq(ArchiveDestroy::getStatus, status);
        }
        wrapper.orderByDesc(ArchiveDestroy::getCreateTime);
        return this.page(page, wrapper);
    }

    @Transactional
    public void applyDestroy(ArchiveDestroy destroy, Long userId, String userName) {
        destroy.setApplicantId(userId);
        destroy.setApplicantName(userName);
        destroy.setStatus(1);
        this.save(destroy);
        archiveService.updateStatus(destroy.getArchiveId(), 5, "提交销毁申请", "", userId, userName);
    }

    @Transactional
    public void approveDestroy(Long id, Integer status, String opinion, Long userId, String userName) {
        ArchiveDestroy destroy = this.getById(id);
        destroy.setStatus(status);
        destroy.setApproveUserId(userId);
        destroy.setApproveUserName(userName);
        destroy.setApproveOpinion(opinion);
        destroy.setApproveTime(LocalDateTime.now());
        this.updateById(destroy);

        if (status == 2) {
            archiveService.updateStatus(destroy.getArchiveId(), 6, "销毁审核通过", opinion, userId, userName);
        } else {
            archiveService.updateStatus(destroy.getArchiveId(), 3, "销毁审核驳回", opinion, userId, userName);
        }
    }

    @Transactional
    public void executeDestroy(Long id, Long userId, String userName) {
        ArchiveDestroy destroy = this.getById(id);
        destroy.setStatus(3);
        destroy.setDestroyTime(LocalDateTime.now());
        destroy.setDestroyOperator(userName);
        this.updateById(destroy);
    }
}
