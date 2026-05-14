package com.railway.digitaltwin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class GeneratedReportDto {

    private String reportType;
    private String generatedAt;
    private String content;
}