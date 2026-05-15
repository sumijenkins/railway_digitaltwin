package com.railway.digitaltwin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScenarioRequestDto {
    private String segmentId;
    
    // Kullanıcının oynayacağı 6 ana veri
    private Double raySicakligi;
    private Double rayTitresimi;
    private Double hatEgimi;
    private Double vagonSicakligi;
    private Double trenHizi;
    private Double vagonTitresimi;
}