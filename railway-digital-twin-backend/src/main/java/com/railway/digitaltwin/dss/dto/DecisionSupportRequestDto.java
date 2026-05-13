package com.railway.digitaltwin.dss.dto;

import lombok.Data;

@Data
public class DecisionSupportRequestDto {
    private String segmentId;
    private String userRole;
    private String reportType;
}