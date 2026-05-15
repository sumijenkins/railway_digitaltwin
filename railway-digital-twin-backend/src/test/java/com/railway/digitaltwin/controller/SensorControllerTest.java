package com.railway.digitaltwin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.railway.digitaltwin.dto.SensorResponseDto;
import com.railway.digitaltwin.dto.SensorChannelResponseDto;
import com.railway.digitaltwin.repository.SensorReadingRepository;
import com.railway.digitaltwin.service.SensorService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SensorController.class)
class SensorControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @MockBean
        private SensorService sensorService;

        @MockBean
        private SensorReadingRepository sensorReadingRepository;

        @Autowired
        private ObjectMapper objectMapper;

        @Test
        void getAllSensors_ShouldReturn200() throws Exception {
                when(sensorService.getAllSensors(org.springframework.data.domain.PageRequest.of(0, 10)))
                                .thenReturn(new PageImpl<>(Collections.emptyList()));

                mockMvc.perform(get("/sensors"))
                                .andExpect(status().isOk());
        }

        @Test
        void getSensor_ShouldReturn200() throws Exception {
                when(sensorService.getSensorById(1))
                                .thenReturn(org.mockito.Mockito.mock(SensorResponseDto.class));

                mockMvc.perform(get("/sensors/1"))
                                .andExpect(status().isOk());
        }

        @Test
        void getChannels_ShouldReturn200() throws Exception {
                when(sensorService.getChannelsBySensor(org.mockito.ArgumentMatchers.eq(1),
                                org.mockito.ArgumentMatchers.any()))
                                .thenReturn(new PageImpl<>(Collections.emptyList()));

                mockMvc.perform(get("/sensors/1/channels"))
                                .andExpect(status().isOk());
        }
}