package com.railway.digitaltwin.service;

import com.railway.digitaltwin.entity.Locomotive;
import com.railway.digitaltwin.exception.ResourceNotFoundException;
import com.railway.digitaltwin.repository.LocomotiveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
public class LocomotiveService {

    private final LocomotiveRepository locomotiveRepository;

    /** Tüm lokomotifleri getirir. */
    @Transactional(readOnly = true)
    public Page<Locomotive> getAllLocomotives(Pageable pageable) {
        return locomotiveRepository.findAll(pageable);
    }

    /** ID'ye göre tek lokomotif getirir; bulunamazsa 404 fırlatır. */
    @Transactional(readOnly = true)
    public Locomotive getLocomotiveById(Integer locomotiveId) {
        return locomotiveRepository.findById(locomotiveId)
                .orElseThrow(() -> new ResourceNotFoundException("Locomotive", "locomotiveId", locomotiveId));
    }

    /** Duruma göre lokomotifleri filtreler (ACTIVE, MAINTENANCE vs.). */
    @Transactional(readOnly = true)
    public Page<Locomotive> getLocomotivesByStatus(String status, Pageable pageable) {
        return locomotiveRepository.findByStatus(status, pageable);
    }

    /** Yeni lokomotif kaydeder veya mevcutu günceller. */
    @Transactional
    public Locomotive saveLocomotive(Locomotive locomotive) {
        return locomotiveRepository.save(locomotive);
    }

    /** Lokomotifi siler; bulunamazsa 404 fırlatır. */
    @Transactional
    public void deleteLocomotive(Integer locomotiveId) {
        if (!locomotiveRepository.existsById(locomotiveId)) {
            throw new ResourceNotFoundException("Locomotive", "locomotiveId", locomotiveId);
        }
        locomotiveRepository.deleteById(locomotiveId);
    }
}
