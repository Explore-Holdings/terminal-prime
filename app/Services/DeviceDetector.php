<?php

namespace App\Services;

class DeviceDetector
{
    /**
     * Parse User-Agent string and return device, OS, and browser details.
     *
     * @param string|null $userAgent
     * @return array
     */
    public static function detect(?string $userAgent): array
    {
        $ua = $userAgent ?? '';

        return [
            'device_type' => self::getDeviceType($ua),
            'device_name' => self::getDeviceName($ua),
            'operating_system' => self::getOperatingSystem($ua),
            'browser' => self::getBrowser($ua),
        ];
    }

    /**
     * Determine device type: Tablet, Mobile, or Desktop.
     */
    protected static function getDeviceType(string $ua): string
    {
        if (preg_match('/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i', $ua)) {
            return 'Tablet';
        }

        if (preg_match('/(mobile|ipod|iphone|android|blackberry|iemobile|kindle|opera mini|windows phone)/i', $ua)) {
            return 'Mobile';
        }

        return 'Desktop';
    }

    /**
     * Determine device name/brand.
     */
    protected static function getDeviceName(string $ua): string
    {
        if (preg_match('/iPhone/i', $ua)) {
            return 'Apple iPhone';
        }
        if (preg_match('/iPad/i', $ua)) {
            return 'Apple iPad';
        }
        if (preg_match('/Macintosh|Mac OS X/i', $ua)) {
            return 'Mac Computer';
        }
        if (preg_match('/Windows NT/i', $ua)) {
            return 'Windows PC';
        }
        if (preg_match('/Android/i', $ua)) {
            // Attempt to extract Android model name
            if (preg_match('/Android[^;]+;\s*([^;\)]+)\)/i', $ua, $matches)) {
                $model = trim($matches[1]);
                return !empty($model) ? $model : 'Android Device';
            }
            return 'Android Device';
        }
        if (preg_match('/Linux/i', $ua)) {
            return 'Linux Workstation';
        }

        return 'Unknown Device';
    }

    /**
     * Determine Operating System and version.
     */
    protected static function getOperatingSystem(string $ua): string
    {
        $osMap = [
            '/windows nt 10/i'      => 'Windows 10/11',
            '/windows nt 6.3/i'     => 'Windows 8.1',
            '/windows nt 6.2/i'     => 'Windows 8',
            '/windows nt 6.1/i'     => 'Windows 7',
            '/windows nt 6.0/i'     => 'Windows Vista',
            '/windows nt 5.1/i'     => 'Windows XP',
            '/macintosh|mac os x/i' => 'macOS',
            '/mac_powerpc/i'        => 'Mac OS 9',
            '/linux/i'              => 'Linux',
            '/ubuntu/i'             => 'Ubuntu',
            '/iphone/i'             => 'iOS (iPhone)',
            '/ipod/i'               => 'iOS (iPod)',
            '/ipad/i'               => 'iPadOS',
            '/android/i'            => 'Android',
            '/blackberry/i'         => 'BlackBerry',
            '/webos/i'              => 'Mobile',
        ];

        foreach ($osMap as $regex => $osName) {
            if (preg_match($regex, $ua)) {
                // If Android or iOS, try to extract version
                if ($osName === 'Android' && preg_match('/Android\s+([0-9\.]+)/i', $ua, $matches)) {
                    return 'Android ' . $matches[1];
                }
                if (str_contains($osName, 'iOS') && preg_match('/OS\s+([0-9_]+)/i', $ua, $matches)) {
                    return 'iOS ' . str_replace('_', '.', $matches[1]);
                }
                if ($osName === 'macOS' && preg_match('/Mac OS X\s+([0-9_]+)/i', $ua, $matches)) {
                    return 'macOS ' . str_replace('_', '.', $matches[1]);
                }
                return $osName;
            }
        }

        return 'Unknown OS';
    }

    /**
     * Determine Browser name and version.
     */
    protected static function getBrowser(string $ua): string
    {
        // Order is important because many browsers include Safari/Chrome in UA
        if (preg_match('/Edg\/([0-9\.]+)/i', $ua, $matches)) {
            return 'Microsoft Edge ' . explode('.', $matches[1])[0];
        }
        if (preg_match('/OPR\/([0-9\.]+)/i', $ua, $matches) || preg_match('/Opera\/([0-9\.]+)/i', $ua, $matches)) {
            return 'Opera ' . explode('.', $matches[1])[0];
        }
        if (preg_match('/Chrome\/([0-9\.]+)/i', $ua, $matches)) {
            return 'Google Chrome ' . explode('.', $matches[1])[0];
        }
        if (preg_match('/Firefox\/([0-9\.]+)/i', $ua, $matches)) {
            return 'Mozilla Firefox ' . explode('.', $matches[1])[0];
        }
        if (preg_match('/Version\/([0-9\.]+).*Safari/i', $ua, $matches)) {
            return 'Apple Safari ' . explode('.', $matches[1])[0];
        }
        if (preg_match('/MSIE\s([0-9\.]+)/i', $ua, $matches) || preg_match('/Trident\/.*rv:([0-9\.]+)/i', $ua, $matches)) {
            return 'Internet Explorer';
        }

        return 'Browser';
    }
}
