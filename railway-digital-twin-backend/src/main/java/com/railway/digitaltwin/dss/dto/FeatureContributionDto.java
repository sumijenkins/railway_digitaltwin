package com.railway.digitaltwin.dss.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FeatureContributionDto {

    private String feature;
    private String impact;
    private String explanation;
}