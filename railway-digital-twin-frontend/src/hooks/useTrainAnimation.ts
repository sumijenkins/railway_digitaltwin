//src/hooks/useTrainAnimation.ts   
import { useEffect, useRef, useState } from "react";

export interface TrainPosition {
    lat: number;
    lng: number;
    bearing: number;
}

function interpolate(coords: [number, number][], progress: number): TrainPosition {
    if (coords.length < 2) return { lat: 0, lng: 0, bearing: 0 };

    const total = coords.length - 1;
    const scaled = progress * total;
    const i = Math.min(Math.floor(scaled), total - 1);
    const t = scaled - i;

    const [lat1, lng1] = coords[i];
    const [lat2, lng2] = coords[i + 1] || coords[i];

    const lat = lat1 + (lat2 - lat1) * t;
    const lng = lng1 + (lng2 - lng1) * t;

    const dLng = lng2 - lng1;
    const dLat = lat2 - lat1;
    const bearing = Math.atan2(dLng, dLat) * (180 / Math.PI);

    return { lat, lng, bearing };
}

export function useTrainAnimation(
    coords: [number, number][],
    speedMs: number = 90000
) {
    // Başlangıç değerlerini ilk koordinata set edelim ki [0,0]'da görünmesinler
    const [trainA, setTrainA] = useState<TrainPosition>(() =>
        coords.length > 0 ? { lat: coords[0][0], lng: coords[0][1], bearing: 0 } : { lat: 38.4237, lng: 27.1428, bearing: 0 }
    );
    const [trainB, setTrainB] = useState<TrainPosition>(() =>
        coords.length > 0 ? { lat: coords[coords.length - 1][0], lng: coords[coords.length - 1][1], bearing: 0 } : { lat: 40.3522, lng: 27.9767, bearing: 0 }
    );

    const startTimeRef = useRef<number>(performance.now());
    const rafRef = useRef<number>();

    useEffect(() => {
        if (coords.length < 2) return;

        // Koordinatlar yüklendiğinde trenleri hat başına çek
        setTrainA(interpolate(coords, 0));
        setTrainB(interpolate(coords, 1));

        startTimeRef.current = performance.now();

        const animate = () => {
            const now = performance.now();
            const elapsed = now - startTimeRef.current;
            const progressA = (elapsed % speedMs) / speedMs;
            const progressB = 1 - progressA;

            setTrainA(interpolate(coords, progressA));
            setTrainB(interpolate(coords, progressB));

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [coords, speedMs]);

    return { trainA, trainB };
}