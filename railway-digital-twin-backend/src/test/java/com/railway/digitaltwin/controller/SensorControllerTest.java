package com.railway.digitaltwin.controller;

import com.railway.digitaltwin.dto.SensorChannelResponseDto;
import com.railway.digitaltwin.dto.SensorResponseDto;
import com.railway.digitaltwin.service.SensorService;
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
 * @WebMvcTest: Yalnızca Web katmanını (Controller, Filter, Jackson) başlatır.
 *              Service katmanını MockBean ile taklit ederek sadece HTTP
 *              istek/cevap
 *              döngüsünü (JSON dönüşümü, HTTP durum kodları) test eder.
 */
@WebMvcTest(SensorController.class)
@SuppressWarnings("null")
class SensorControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private SensorService sensorService;

        @Test
        void getAllSensors_ShouldReturn200AndPaginatedData() throws Exception {
                // Arrange
                SensorResponseDto mockDto = SensorResponseDto.builder()
                                .sensorId(1)
                                .sensorType("VIBRATION")
                                .status("ACTIVE")
                                .segmentId("SEG-1")
                                .segmentName("Ankara-Istanbul")
                                .build();
                Page<SensorResponseDto> pageData = new PageImpl<>(List.of(mockDto));

                when(sensorService.getAllSensors(any(Pageable.class))).thenReturn(pageData);

                // Act & Assert
                mockMvc.perform(get("/sensors?page=0&size=10")
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.content[0].sensorId").value(1))
                                .andExpect(jsonPath("$.content[0].sensorType").value("VIBRATION"))
                                .andExpect(jsonPath("$.content[0].status").value("ACTIVE"))
                                .andExpect(jsonPath("$.totalElements").value(1));
        }

        @Test
        void getSensor_WhenValidId_ShouldReturn200() throws Exception {
                // Arrange
                SensorResponseDto mockDto = SensorResponseDto.builder()
                                .sensorId(42)
                                .sensorType("TEMPERATURE")
                                .status("ACTIVE")
                                .segmentId("SEG-2")
                                .build();

                when(sensorService.getSensorById(42)).thenReturn(mockDto);

                // Act & Assert
                mockMvc.perform(get("/sensors/42")
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.sensorId").value(42))
                                .andExpect(jsonPath("$.sensorType").value("TEMPERATURE"));
        }

        @Test
        void getChannelsBySensor_ShouldReturn200AndChannelList() throws Exception {
                // Arrange — GET /sensors/{id}/channels JSON dönüşümünü test eder
                SensorChannelResponseDto channel = SensorChannelResponseDto.builder()
                                .channelId(10)
                                .channelName("CH-TEMP-1")
                                .unit("°C")
                                .sensorId(42)
                                .sensorType("TEMPERATURE")
                                .build();
                Page<SensorChannelResponseDto> pageData = new PageImpl<>(List.of(channel));

                when(sensorService.getChannelsBySensor(eq(42), any(Pageable.class))).thenReturn(pageData);

                // Act & Assert
                mockMvc.perform(get("/sensors/42/channels")
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.content[0].channelName").value("CH-TEMP-1"))
                                .andExpect(jsonPath("$.content[0].unit").value("°C"))
                                .andExpect(jsonPath("$.totalElements").value(1));
        }

        @Test
        void getSensorsBySegment_ShouldReturn200() throws Exception {
                // Arrange
                SensorResponseDto mockDto = SensorResponseDto.builder()
                                .sensorId(5)
                                .sensorType("PRESSURE")
                                .status("ACTIVE")
                                .segmentId("SEG-1")
                                .build();
                Page<SensorResponseDto> pageData = new PageImpl<>(List.of(mockDto));

                when(sensorService.getSensorsBySegment(eq("SEG-1"), any(Pageable.class))).thenReturn(pageData);

                // Act & Assert
                mockMvc.perform(get("/sensors/segment/SEG-1")
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.content[0].segmentId").value("SEG-1"))
                                .andExpect(jsonPath("$.content[0].sensorType").value("PRESSURE"));
        }
}
