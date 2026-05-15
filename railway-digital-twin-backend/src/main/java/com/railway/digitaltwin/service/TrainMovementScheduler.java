package com.railway.digitaltwin.service;

import com.railway.digitaltwin.entity.TrainLocation;
import com.railway.digitaltwin.repository.TrainLocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TrainMovementScheduler {

    private final TrainLocationRepository trainLocationRepository;
    private final RailwayPathService railwayPathService;

    @Scheduled(fixedRate = 10000) // 10 saniye
    public void moveTrains() {

        List<TrainLocation> trains = trainLocationRepository.findAll();

        for (TrainLocation t : trains) {

            if (t.getSegment() == null) continue;

            var path = railwayPathService.getPath(t.getSegment().getSegmentId());
            if (path == null || path.isEmpty()) continue;

            int index = t.getPathIndex() == null ? 0 : t.getPathIndex();
            index++;

            if (index >= path.size()) index = 0;

            double[] coord = path.get(index);

            t.setLongitude(coord[0]);
            t.setLatitude(coord[1]);
            t.setPathIndex(index);

            trainLocationRepository.save(t);
        }
    }
}