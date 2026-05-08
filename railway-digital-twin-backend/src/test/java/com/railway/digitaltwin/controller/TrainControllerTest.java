package com.railway.digitaltwin.controller;

import com.railway.digitaltwin.dto.TrainLocationResponseDto;
import com.railway.digitaltwin.dto.TrainResponseDto;
import com.railway.digitaltwin.service.TrainService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration Test — Controller Katmanı
 *
 * @WebMvcTest: Yalnızca Web katmanını başlatır; TrainService MockBean ile taklit edilir.
 * HTTP istek/cevap döngüsünü ve JSON serileştirmesini doğrular.
 */
@WebMvcTest(TrainController.class)
@SuppressWarnings("null")
class TrainControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TrainService trainService;

    @Test
    void getAllTrains_ShouldReturn200AndPaginatedData() throws Exception {
        // Arrange
        TrainResponseDto mockDto = TrainResponseDto.builder()
                .trainId(1)
                .wagonCount(8)
                .totalWeight(450.0)
                .currentSpeed(160.0)
                .locomotiveModel("E43000")
                .routeStartPoint("Ankara")
                .routeEndPoint("Istanbul")
                .build();
        List<TrainResponseDto> trainList = List.of(mockDto);
        Page<TrainResponseDto> pageData = new PageImpl<>(trainList);

        when(trainService.getAllTrains(any(Pageable.class))).thenReturn(pageData);

        // Act & Assert
        mockMvc.perform(get("/trains?page=0&size=10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].trainId").value(1))
                .andExpect(jsonPath("$.content[0].wagonCount").value(8))
                .andExpect(jsonPath("$.content[0].locomotiveModel").value("E43000"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void getTrain_WhenValidId_ShouldReturn200() throws Exception {
        // Arrange
        TrainResponseDto mockDto = TrainResponseDto.builder()
                .trainId(7)
                .currentSpeed(120.0)
                .routeStartPoint("Konya")
                .routeEndPoint("Eskisehir")
                .build();

        when(trainService.getTrainById(7)).thenReturn(mockDto);

        // Act & Assert
        mockMvc.perform(get("/trains/7")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trainId").value(7))
                .andExpect(jsonPath("$.currentSpeed").value(120.0));
    }

    @Test
    void getAllLocations_ShouldReturn200AndLocationData() throws Exception {
        // Arrange — GET /trains/locations JSON dönüşümünü test eder
        TrainLocationResponseDto locationDto = TrainLocationResponseDto.builder()
                .trainId(1)
                .latitude(39.9334)
                .longitude(32.8597)
                .segmentId("SEG-1")
                .build();
        List<TrainLocationResponseDto> locationList = List.of(locationDto);
        Page<TrainLocationResponseDto> pageData = new PageImpl<>(locationList);

        when(trainService.getAllLocations(any(Pageable.class))).thenReturn(pageData);

        // Act & Assert
        mockMvc.perform(get("/trains/locations")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].trainId").value(1))
                .andExpect(jsonPath("$.content[0].latitude").value(39.9334))
                .andExpect(jsonPath("$.content[0].segmentId").value("SEG-1"));
    }

    @Test
    void getLocationsBySegment_ShouldReturn200() throws Exception {
        // Arrange
        TrainLocationResponseDto locationDto = TrainLocationResponseDto.builder()
                .trainId(3)
                .segmentId("SEG-1")
                .latitude(40.0)
                .longitude(33.0)
                .build();
        List<TrainLocationResponseDto> locationList = List.of(locationDto);
        Page<TrainLocationResponseDto> pageData = new PageImpl<>(locationList);

        when(trainService.getLocationsBySegment(eq("SEG-1"), any(Pageable.class))).thenReturn(pageData);

        // Act & Assert
        mockMvc.perform(get("/trains/locations/segment/SEG-1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].segmentId").value("SEG-1"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }
}
