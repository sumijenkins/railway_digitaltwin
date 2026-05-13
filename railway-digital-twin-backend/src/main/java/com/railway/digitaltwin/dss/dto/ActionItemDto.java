package com.railway.digitaltwin.dss.dto;

import com.railway.digitaltwin.dss.model.DecisionSeverity;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ActionItemDto {
    private DecisionSeverity priority;
    private String action;
    private String reason;
}