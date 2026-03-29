package com.campus.trade.service;

import com.campus.trade.dto.report.CreateReportRequest;
import com.campus.trade.model.Report;
import com.campus.trade.repository.ReportRepository;
import com.campus.trade.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserService userService;
    private final ItemService itemService;

    public ReportService(ReportRepository reportRepository, UserService userService, ItemService itemService) {
        this.reportRepository = reportRepository;
        this.userService = userService;
        this.itemService = itemService;
    }

    @Transactional
    public Report create(CreateReportRequest request) {
        Report report = new Report();
        report.setReporter(SecurityUtils.currentUser());
        if (request.targetUserId() != null) {
            report.setTargetUser(userService.findById(request.targetUserId()));
        }
        if (request.targetItemId() != null) {
            report.setTargetItem(itemService.getById(request.targetItemId()));
        }
        report.setReason(request.reason());
        return reportRepository.save(report);
    }
}
