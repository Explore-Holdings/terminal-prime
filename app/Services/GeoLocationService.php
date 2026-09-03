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

                    $locParts = array_filter([$city, $country]);
                    $formatted = !empty($locParts) ? implode(', ', $locParts) : ($country ?? 'Unknown Location');

                    return [
                        'city'         => $city,
                        'region'       => $region,
                        'country'      => $country,
                        'country_code' => $code,
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
            'location'     => 'External IP (' . $ip . ')',
        ];
    }
}
