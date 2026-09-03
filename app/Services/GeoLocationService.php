<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeoLocationService
{
    /**
     * Resolve IP address to geographic details.
     *
     * @param string|null $ip
     * @return array
     */
    public static function locate(?string $ip): array
    {
        $default = [
            'city'         => null,
            'region'       => null,
            'country'      => null,
            'country_code' => null,
            'latitude'     => null,
            'longitude'    => null,
            'location'     => 'Unknown Location',
        ];

        if (empty($ip)) {
            return $default;
        }

        // Detect localhost / private airport intranet IPs
        if (
            in_array($ip, ['127.0.0.1', '::1', 'localhost']) ||
            filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false
        ) {
            return [
                'city'         => 'Local Station',
                'region'       => 'Airport Counter',
                'country'      => 'Local Network',
                'country_code' => 'LAN',
                'latitude'     => null,
                'longitude'    => null,
                'location'     => 'Airport Counter LAN',
            ];
        }

        try {
            // Fast external IP geolocation with 1.5s timeout
            $response = Http::timeout(1.5)->get("http://ip-api.com/json/{$ip}?fields=status,country,countryCode,regionName,city,lat,lon");

            if ($response->successful()) {
                $data = $response->json();
                if (($data['status'] ?? '') === 'success') {
                    $city = $data['city'] ?? null;
                    $region = $data['regionName'] ?? null;
                    $country = $data['country'] ?? null;
                    $code = $data['countryCode'] ?? null;
                    $lat = $data['lat'] ?? null;
                    $lon = $data['lon'] ?? null;

                    $locParts = array_filter([$city, $country]);
                    $formatted = !empty($locParts) ? implode(', ', $locParts) : ($country ?? 'Unknown Location');

                    return [
                        'city'         => $city,
                        'region'       => $region,
                        'country'      => $country,
                        'country_code' => $code,
                        'latitude'     => $lat,
                        'longitude'    => $lon,
                        'location'     => $formatted,
                    ];
                }
            }
        } catch (\Throwable $e) {
            // Silently fall back so user experience/login flow is never interrupted
            Log::debug('Geolocation lookup skipped: ' . $e->getMessage());
        }

        return [
            'city'         => null,
            'region'       => null,
            'country'      => null,
            'country_code' => null,
            'latitude'     => null,
            'longitude'    => null,
            'location'     => 'External IP (' . $ip . ')',
        ];
    }

    /**
     * Resolve location prioritizing accurate client-side browser GPS coordinates.
     */
    public static function locateWithGps(?string $ip, $clientLat = null, $clientLng = null): array
    {
        $lat = (is_numeric($clientLat) && (float) $clientLat != 0) ? (float) $clientLat : null;
        $lng = (is_numeric($clientLng) && (float) $clientLng != 0) ? (float) $clientLng : null;

        if ($lat !== null && $lng !== null) {
            try {
                $response = Http::timeout(2.0)->get("https://api.bigdatacloud.net/data/reverse-geocode-client", [
                    'latitude'         => $lat,
                    'longitude'        => $lng,
                    'localityLanguage' => 'en',
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    $locality = $data['locality'] ?? null;
                    $city = $data['city'] ?? $locality ?? null;
                    $region = $data['principalSubdivision'] ?? null;
                    $country = $data['countryName'] ?? null;
                    $code = $data['countryCode'] ?? null;

                    $parts = array_filter([$locality ?: $city, $region, $country]);
                    $formatted = !empty($parts) ? implode(', ', $parts) : ($country ?? 'GPS Coordinates');

                    return [
                        'city'         => $city,
                        'region'       => $region,
                        'country'      => $country,
                        'country_code' => $code,
                        'latitude'     => $lat,
                        'longitude'    => $lng,
                        'location'     => $formatted,
                    ];
                }
            } catch (\Throwable $e) {
                Log::debug('Reverse GPS lookup error: ' . $e->getMessage());
            }

            // If reverse API is unreachable, return GPS coordinates directly
            return [
                'city'         => null,
                'region'       => null,
                'country'      => 'Sri Lanka',
                'country_code' => 'LK',
                'latitude'     => $lat,
                'longitude'    => $lng,
                'location'     => "GPS (" . number_format($lat, 4) . ", " . number_format($lng, 4) . ")",
            ];
        }

        // Fall back to IP lookup if GPS was not provided or permitted
        return self::locate($ip);
    }
}
