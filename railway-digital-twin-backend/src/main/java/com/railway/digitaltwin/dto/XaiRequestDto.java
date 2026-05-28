package com.railway.digitaltwin.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class XaiRequestDto {
    private Double rms;
    private Double peakToPeak;
    private Double fftEnergy;
    private Double slopeGradient;
    private Double snr;
}
