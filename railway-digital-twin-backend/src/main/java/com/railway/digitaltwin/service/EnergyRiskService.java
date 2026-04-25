package com.railway.digitaltwin.service;

import com.railway.digitaltwin.dto.EnergyRiskResponseDto;
import com.railway.digitaltwin.entity.EnergyRisk;
import com.railway.digitaltwin.repository.EnergyRiskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnergyRiskService {

    private final EnergyRiskRepository energyRiskRepository;

    @Transactional(readOnly = true)
    public Page<EnergyRiskResponseDto> getAllEnergyRisks(Pageable pageable) {
        return energyRiskRepository.findAll(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<EnergyRiskResponseDto> getRiskBySegment(String segmentId, Pageable pageable) {
        return energyRiskRepository.findBySegment_SegmentId(segmentId, pageable)
                .map(this::toDto);
    }

    private EnergyRiskResponseDto toDto(EnergyRisk e) {
        return EnergyRiskResponseDto.builder()
                .recordId(e.getRecordId())
                .energyConsumption(e.getEnergyConsumption())
                .riskScore(e.getRiskScore())
                .calculatedTime(e.getCalculatedTime())
                .segmentId(e.getSegment() != null ? e.getSegment().getSegmentId() : null)
                .segmentName(e.getSegment() != null ? e.getSegment().getName() : null)
                .segmentRiskLevel(e.getSegment() != null ? e.getSegment().getRiskLevel() : null)
                .build();
    }
}
