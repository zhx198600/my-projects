package com.lianhuabao.customer.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.lianhuabao.customer.entity.ArchiveBorrow;
import com.lianhuabao.customer.mapper.ArchiveBorrowMapper;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ArchiveBorrowService extends ServiceImpl<ArchiveBorrowMapper, ArchiveBorrow> {

    @Autowired
    private ArchiveService archiveService;

    public Page<ArchiveBorrow> getPage(Integer pageNum, Integer pageSize, String keyword, Integer status) {
        Page<ArchiveBorrow> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<ArchiveBorrow> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(ArchiveBorrow::getArchiveName, keyword)
                    .or().like(ArchiveBorrow::getArchiveNo, keyword)
                    .or().like(ArchiveBorrow::getApplicantName, keyword));
        }
        if (status != null) {
            wrapper.eq(ArchiveBorrow::getStatus, status);
        }
        wrapper.orderByDesc(ArchiveBorrow::getCreateTime);
        return this.page(page, wrapper);
    }

    public List<ArchiveBorrow> getExpiringBorrows() {
        return this.list(new LambdaQueryWrapper<ArchiveBorrow>()
                .eq(ArchiveBorrow::getStatus, 2)
                .le(ArchiveBorrow::getExpectReturnTime, LocalDateTime.now().plusDays(3))
                .orderByAsc(ArchiveBorrow::getExpectReturnTime));
    }

    @Transactional
    public void applyBorrow(ArchiveBorrow borrow, Long userId, String userName) {
        borrow.setApplicantId(userId);
        borrow.setApplicantName(userName);
        borrow.setStatus(1);
        this.save(borrow);
    }

    @Transactional
    public void approveBorrow(Long id, Integer status, String opinion, Long userId, String userName) {
        ArchiveBorrow borrow = this.getById(id);
        borrow.setStatus(status);
        borrow.setApproveUserId(userId);
        borrow.setApproveUserName(userName);
        borrow.setApproveOpinion(opinion);
        borrow.setApproveTime(LocalDateTime.now());
        this.updateById(borrow);

        if (status == 2) {
            archiveService.updateStatus(borrow.getArchiveId(), 4, "档案借出", opinion, userId, userName);
        }
    }

    @Transactional
    public void returnArchive(Long id, Long userId, String userName) {
        ArchiveBorrow borrow = this.getById(id);
        borrow.setStatus(3);
        borrow.setActualReturnTime(LocalDateTime.now());
        this.updateById(borrow);
        archiveService.updateStatus(borrow.getArchiveId(), 3, "档案归还", "", userId, userName);
    }
}
