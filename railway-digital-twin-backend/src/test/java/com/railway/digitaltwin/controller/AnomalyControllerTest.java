package com.railway.digitaltwin.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.railway.digitaltwin.dto.AnomalyRequestDto;
import com.railway.digitaltwin.dto.AnomalyResponseDto;
import com.railway.digitaltwin.service.AnomalyService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@WebMvcTest(AnomalyController.class)
@SuppressWarnings("null")
class AnomalyControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockitoBean
        private AnomalyService anomalyService;

        @Test
        void getAllAnomalies_ShouldReturn200AndPaginatedData() throws Exception {
                AnomalyResponseDto mockDto = AnomalyResponseDto.builder()
                                .anomalyId(1)
                                .anomalyType("VIBRATION_SPIKE")
                                .severity("HIGH")
                                .build();
                Page<AnomalyResponseDto> pageData = new PageImpl<>(List.of(mockDto));

                when(anomalyService.getAllAnomalies(any(Pageable.class))).thenReturn(pageData);

                mockMvc.perform(get("/anomalies")
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.content[0].anomalyType").value("VIBRATION_SPIKE"))
                                .andExpect(jsonPath("$.content[0].severity").value("HIGH"));
        }

        @Test
        void createAnomaly_WhenValidPayload_ShouldReturn200() throws Exception {
                AnomalyRequestDto requestDto = new AnomalyRequestDto();
                requestDto.setAnomalyType("VIBRATION_SPIKE");
                requestDto.setSeverity("HIGH");
                requestDto.setSegmentId("SEG-1");

                AnomalyResponseDto responseDto = AnomalyResponseDto.builder()
                                .anomalyId(1)
                                .anomalyType("VIBRATION_SPIKE")
                                .severity("HIGH")
                                .segmentId("SEG-1")
                                .detectedTime(LocalDateTime.now())
                                .build();

                when(anomalyService.saveAnomaly(any(AnomalyRequestDto.class))).thenReturn(responseDto);

                mockMvc.perform(post("/anomalies")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(requestDto)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.anomalyId").value(1))
                                .andExpect(jsonPath("$.severity").value("HIGH"));
        }
}
