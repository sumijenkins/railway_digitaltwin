package com.railway.digitaltwin.controller;

import com.railway.digitaltwin.dto.SegmentResponseDto;
import com.railway.digitaltwin.service.SegmentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SegmentController.class)
class SegmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SegmentService segmentService;

    @Test
    void getAllSegments_ShouldReturn200AndPaginatedData() throws Exception {
        // Arrange
        SegmentResponseDto mockDto = SegmentResponseDto.builder()
                .segmentId("SEG-TEST")
                .name("Ankara-Eskisehir")
                .riskLevel("LOW")
                .build();
        Page<SegmentResponseDto> pageData = new PageImpl<>(List.of(mockDto));

        when(segmentService.getAllSegments(any(Pageable.class))).thenReturn(pageData);

        // Act & Assert
        mockMvc.perform(get("/segments?page=0&size=10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].segmentId").value("SEG-TEST"))
                .andExpect(jsonPath("$.content[0].name").value("Ankara-Eskisehir"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void getSegment_WhenValidId_ShouldReturn200() throws Exception {
        SegmentResponseDto mockDto = SegmentResponseDto.builder()
                .segmentId("SEG-TEST")
                .name("Ankara-Eskisehir")
                .build();

        when(segmentService.getSegmentById("SEG-TEST")).thenReturn(mockDto);

        mockMvc.perform(get("/segments/SEG-TEST")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.segmentId").value("SEG-TEST"))
                .andExpect(jsonPath("$.name").value("Ankara-Eskisehir"));
    }
}
