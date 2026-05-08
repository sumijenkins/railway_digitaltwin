package com.railway.digitaltwin.controller;

import com.railway.digitaltwin.dto.TrainLocationResponseDto;
import com.railway.digitaltwin.dto.TrainResponseDto;
import com.railway.digitaltwin.entity.Train;
import com.railway.digitaltwin.service.TrainService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;


@RestController
@RequestMapping("/trains")
@RequiredArgsConstructor
public class TrainController {

    private final TrainService trainService;

    /** GET /api/trains — tüm trenler */
    @GetMapping
    public ResponseEntity<Page<TrainResponseDto>> getAllTrains(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(trainService.getAllTrains(pageable));
    }

    /** GET /api/trains/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<TrainResponseDto> getTrain(@PathVariable Integer id) {
        return ResponseEntity.ok(trainService.getTrainById(id));
    }

    /** POST /api/trains — yeni tren ekle */
    @PostMapping
    public ResponseEntity<TrainResponseDto> createTrain(@RequestBody Train train) {
        return ResponseEntity.ok(trainService.saveTrain(train));
    }

    /** PUT /api/trains/{id} — tren güncelle */
    @PutMapping("/{id}")
    public ResponseEntity<TrainResponseDto> updateTrain(@PathVariable Integer id, @RequestBody Train train) {
        train.setTrainId(id);
        return ResponseEntity.ok(trainService.saveTrain(train));
    }

    /** DELETE /api/trains/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrain(@PathVariable Integer id) {
        trainService.deleteTrain(id);
        return ResponseEntity.noContent().build();
    }

    /** GET /api/trains/locations — tüm tren konumları */
    @GetMapping("/locations")
    public ResponseEntity<Page<TrainLocationResponseDto>> getAllLocations(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(trainService.getAllLocations(pageable));
    }

    /** GET /api/trains/locations/segment/{segmentId} — segmentteki trenler */
    @GetMapping("/locations/segment/{segmentId}")
    public ResponseEntity<Page<TrainLocationResponseDto>> getLocationsBySegment(
            @PathVariable String segmentId, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(trainService.getLocationsBySegment(segmentId, pageable));
    }
}
