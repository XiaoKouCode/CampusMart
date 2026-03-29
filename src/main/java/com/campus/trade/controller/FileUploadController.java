package com.campus.trade.controller;

import com.campus.trade.common.ApiResponse;
import com.campus.trade.service.FileUploadService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    private final FileUploadService fileUploadService;

    public FileUploadController(FileUploadService fileUploadService) {
        this.fileUploadService = fileUploadService;
    }

    @PostMapping
    public ApiResponse<List<String>> uploadFiles(@RequestParam("files") List<MultipartFile> files) {
        List<String> urls = fileUploadService.uploadFiles(files);
        return ApiResponse.ok("上传成功", urls);
    }

    @PostMapping("/single")
    public ApiResponse<String> uploadSingleFile(@RequestParam("file") MultipartFile file) {
        String url = fileUploadService.uploadFile(file);
        return ApiResponse.ok("上传成功", url);
    }
}