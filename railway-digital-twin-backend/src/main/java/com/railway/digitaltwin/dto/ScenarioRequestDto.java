package com.railway.digitaltwin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScenarioRequestDto {
    private String segmentId;
    private Double raySicakligi;
    private Double rayTitresimi;
    private Double hatEgimi;
    private Double vagonSicakligi;
    private Double trenHizi;
    private Double vagonTitresimi;
}