//src/hooks/useRailwayPath.ts   
import { useEffect, useState } from "react";

// LineString koordinatlarını [lat, lng] formatına çevirir
function flattenLineString(coordinates: number[][]): [number, number][] {
    return coordinates.map(([lng, lat]) => [lat, lng]);
}

// MultiLineString koordinatlarını düzleştirir
function flattenMultiLineString(coordinates: number[][][]): [number, number][] {
    const result: [number, number][] = [];
    for (const segment of coordinates) {
        for (const [lng, lat] of segment) {
            result.push([lat, lng]);
        }
    }
    return result;
}

function extractMainRoute(geojson: any): [number, number][] {
    if (!geojson || !geojson.features) return [];

    // Önce "route" tipindeki relation'ı bulmaya çalış (OSM exportlarında genellikle en kapsamlısıdır)
    const routeFeature = geojson.features.find((f: any) => f.properties?.type === "route" || f.properties?.route === "railway");

    if (routeFeature) {
        if (routeFeature.geometry.type === "MultiLineString") {
            return flattenMultiLineString(routeFeature.geometry.coordinates);
        } else if (routeFeature.geometry.type === "LineString") {
            return flattenLineString(routeFeature.geometry.coordinates);
        }
    }

    // Bulunamazsa tüm LineString'leri topla (ama bu yol karışık olabilir)
    const allCoords: [number, number][] = [];
    for (const feature of geojson.features) {
        const geom = feature.geometry;
        if (!geom) continue;
        if (geom.type === "LineString") {
            allCoords.push(...flattenLineString(geom.coordinates));
        } else if (geom.type === "MultiLineString") {
            allCoords.push(...flattenMultiLineString(geom.coordinates));
        }
    }
    return allCoords;
}

export function useRailwayPath() {
    const [coords, setCoords] = useState<[number, number][]>([]);

    useEffect(() => {
        Promise.all([
            fetch("/data/basmane-menemen-railway.geojson").then(r => r.ok ? r.json() : null),
            fetch("/data/menemen-bandirma-railway.geojson").then(r => r.ok ? r.json() : null),
        ]).then(([basmane, bandirma]) => {
            const part1 = extractMainRoute(basmane);  // Basmane → Menemen
            const part2 = extractMainRoute(bandirma); // Menemen → Bandırma

            const combined = [...part1, ...part2];

            if (combined.length > 0) {
                setCoords(combined);
            } else {
                // Fallback coordinates
                setCoords([
                    [38.4237, 27.1428], // Basmane
                    [38.6120, 27.0600], // Menemen
                    [39.6484, 27.8826], // Balikesir
                    [40.3522, 27.9767]  // Bandirma
                ]);
            }
        }).catch(err => {
            console.error("Railway path load failed:", err);
            setCoords([[38.42, 27.14], [40.35, 27.97]]);
        });
    }, []);

    return coords;
}