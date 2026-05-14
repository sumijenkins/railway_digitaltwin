package com.railway.digitaltwin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class SensorHealthDto {
    private String label;
    private Long activeCount;
    private Long totalCount;
    private String status;
    private String color;
}