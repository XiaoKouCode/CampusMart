package com.campus.trade.service;

import com.campus.trade.common.BusinessException;
import com.campus.trade.model.Report;
import com.campus.trade.model.User;
import com.campus.trade.model.enums.ReportStatus;
import com.campus.trade.repository.ItemRepository;
import com.campus.trade.repository.ReportRepository;
import com.campus.trade.repository.TradeOrderRepository;
import com.campus.trade.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ItemService itemService;
    private final ReportRepository reportRepository;
    private final ItemRepository itemRepository;
    private final TradeOrderRepository tradeOrderRepository;

    public AdminService(UserRepository userRepository, ItemService itemService, ReportRepository reportRepository, ItemRepository itemRepository, TradeOrderRepository tradeOrderRepository) {
        this.userRepository = userRepository;
        this.itemService = itemService;
        this.reportRepository = reportRepository;
        this.itemRepository = itemRepository;
        this.tradeOrderRepository = tradeOrderRepository;
    }

    @Transactional
    public User toggleUser(Long userId, boolean enabled) {
        User user = userRepository.findById(userId).orElseThrow(() -> new BusinessException("用户不存在"));
        user.setEnabled(enabled);
        return user;
    }

    @Transactional
    public Report handleReport(Long reportId, ReportStatus status, String remark) {
        Report report = reportRepository.findById(reportId).orElseThrow(() -> new BusinessException("举报不存在"));
        report.setStatus(status);
        report.setAdminRemark(remark);
        return report;
    }

    @Transactional(readOnly = true)
    public Map<String, Long> stats() {
        return Map.of(
                "userCount", userRepository.count(),
                "itemCount", itemRepository.count(),
                "orderCount", tradeOrderRepository.count()
        );
    }

    public ItemService itemService() {
        return itemService;
    }
}
