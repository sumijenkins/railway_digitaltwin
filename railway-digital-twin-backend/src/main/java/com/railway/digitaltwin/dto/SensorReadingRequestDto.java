package com.railway.digitaltwin.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * POST /api/telemetry endpoint'i için istek gövdesi.
 * channelId bilinmelidir; value ve isteğe bağlı olarak recordedAt sağlanır.
 */
@Data
public class SensorReadingRequestDto {

    @NotNull(message = "channelId zorunludur")
    private Integer channelId;

    @NotNull(message = "value zorunludur")
    private Double value;

    // Sağlanmazsa sunucu tarafında NOW() kullanılır
    private LocalDateTime recordedAt;
}
