-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Jun 10, 2026 at 11:55 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `airport-counter-system`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_verifications`
--

CREATE TABLE `admin_verifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `driver_id` bigint(20) UNSIGNED NOT NULL,
  `nic_verified` tinyint(1) NOT NULL DEFAULT 0,
  `driving_license_verified` tinyint(1) NOT NULL DEFAULT 0,
  `tourist_license_verified` tinyint(1) NOT NULL DEFAULT 0,
  `vehicle_ownership_verified` tinyint(1) NOT NULL DEFAULT 0,
  `vehicle_documents_verified` tinyint(1) NOT NULL DEFAULT 0,
  `insurance_verified` tinyint(1) NOT NULL DEFAULT 0,
  `no_objection_letter_verified` tinyint(1) NOT NULL DEFAULT 0,
  `vehicle_photos_approved` tinyint(1) NOT NULL DEFAULT 0,
  `tourism_registration_verified` tinyint(1) NOT NULL DEFAULT 0,
  `driver_approved` tinyint(1) NOT NULL DEFAULT 0,
  `remarks` text DEFAULT NULL,
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `approval_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_verifications`
--

INSERT INTO `admin_verifications` (`id`, `driver_id`, `nic_verified`, `driving_license_verified`, `tourist_license_verified`, `vehicle_ownership_verified`, `vehicle_documents_verified`, `insurance_verified`, `no_objection_letter_verified`, `vehicle_photos_approved`, `tourism_registration_verified`, `driver_approved`, `remarks`, `approved_by`, `approval_date`, `created_at`, `updated_at`) VALUES
(2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, 2, '2026-06-08', '2026-06-07 22:37:42', '2026-06-07 22:37:42'),
(4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, 2, '2026-06-09', '2026-06-09 02:04:13', '2026-06-09 02:04:13'),
(5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, 2, '2026-06-10', '2026-06-09 22:26:07', '2026-06-09 22:26:07'),
(6, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, 2, '2026-06-10', '2026-06-09 22:45:53', '2026-06-09 22:45:53');

-- --------------------------------------------------------

--
-- Table structure for table `agents`
--

CREATE TABLE `agents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `customer_passport` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `dropoff_location` varchar(255) DEFAULT NULL,
  `passenger_count` int(11) DEFAULT NULL,
  `luggage_count` int(25) DEFAULT NULL,
  `distance_km` decimal(10,2) DEFAULT NULL,
  `currency` varchar(255) DEFAULT NULL,
  `price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `remarks` text DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `new_currency` varchar(255) DEFAULT NULL,
  `new_price` decimal(12,2) DEFAULT NULL,
  `currency_updated_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `agents`
--

INSERT INTO `agents` (`id`, `user_id`, `customer_passport`, `name`, `dropoff_location`, `passenger_count`, `luggage_count`, `distance_km`, `currency`, `price`, `remarks`, `status`, `new_currency`, `new_price`, `currency_updated_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 2, 'agents/passport_001.png', 'John Smith', 'Bandaranaike International Airport', 2, 3, 6.50, 'USD', 45.00, 'Arriving at Terminal 1', 'Approved', 'USD', 45.00, 2, '2026-06-08 04:50:08', '2026-06-10 09:31:27', NULL),
(2, 2, 'agents/passport_002.png', 'Sarah Johnson', 'Colombo Fort', 1, 1, 7.00, 'LKR', 8500.00, 'VIP customer', 'Approved', 'LKR', 8500.00, 2, '2026-06-08 11:13:38', '2026-06-10 09:45:25', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `bank_details`
--

CREATE TABLE `bank_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `driver_id` bigint(20) UNSIGNED NOT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `branch_name` varchar(255) DEFAULT NULL,
  `account_holder_name` varchar(255) DEFAULT NULL,
  `account_number` varchar(255) DEFAULT NULL,
  `swift_code` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bank_details`
--

INSERT INTO `bank_details` (`id`, `driver_id`, `bank_name`, `branch_name`, `account_holder_name`, `account_number`, `swift_code`, `created_at`, `updated_at`) VALUES
(2, 2, 'HNB', 'Negombo', 'Test', '423423424', NULL, '2026-06-07 22:37:42', '2026-06-07 22:37:42'),
(4, 4, 'test', 'test', 'test', 'test', NULL, '2026-06-09 02:04:12', '2026-06-09 02:04:12'),
(5, 5, 'HNB', 'TEST', 'TEST', 'TEST', NULL, '2026-06-09 22:26:06', '2026-06-09 22:26:06'),
(6, 6, 'test', 'test', 'test', 'test', NULL, '2026-06-09 22:45:53', '2026-06-09 22:45:53');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('airportcountersystem-cache-illuminate:queue:restart', 'i:1781084682;', 2096444683);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `agent_id` bigint(20) UNSIGNED NOT NULL,
  `customer_code` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `mobile_number` varchar(255) DEFAULT NULL,
  `whatsapp_number` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `passport_image` varchar(255) DEFAULT NULL,
  `dropoff_location` varchar(225) DEFAULT NULL,
  `status` enum('New','Contacted','Quoted','Confirmed','Cancelled') NOT NULL DEFAULT 'New',
  `remarks` text DEFAULT NULL,
  `language_preference` varchar(255) DEFAULT NULL,
  `passenger_count` int(11) NOT NULL DEFAULT 1,
  `payment_method` varchar(255) DEFAULT NULL,
  `payment_notes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payment_notes`)),
  `paid_amount` decimal(12,2) DEFAULT 0.00,
  `payment_status` varchar(255) DEFAULT 'Pending',
  `transaction_id` varchar(255) DEFAULT NULL,
  `card_number` varchar(255) DEFAULT NULL,
  `invoice_number` varchar(255) DEFAULT NULL,
  `invoice_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `agent_id`, `customer_code`, `name`, `email`, `mobile_number`, `whatsapp_number`, `country`, `passport_image`, `dropoff_location`, `status`, `remarks`, `language_preference`, `passenger_count`, `payment_method`, `payment_notes`, `paid_amount`, `payment_status`, `transaction_id`, `card_number`, `invoice_number`, `invoice_path`, `created_at`, `updated_at`, `deleted_at`, `created_by`) VALUES
(1, 1, 'CUS-00001', 'John Smith', 'navodyadivyanjali2@gmail.com', NULL, '0761278989', 'Sri Lanka', 'passports/passport_001.png', 'Bandaranaike International Airport', 'New', 'Arriving at Terminal 1', NULL, 2, 'Cash', '[{\"amount\":\"40\",\"count\":\"1\"},{\"amount\":\"5\",\"count\":\"1\"}]', 45.00, 'Paid', NULL, NULL, 'INV-00001', 'invoices/INV-00001.pdf', '2026-06-07 23:26:32', '2026-06-07 23:27:16', NULL, 2),
(2, 1, 'CUS-00002', 'John Smith', 'navodyadivyanjali2@gmail.com', NULL, '0761278989', 'Sri Lanka', 'passports/passport_001.png', 'Bandaranaike International Airport', 'New', 'Arriving at Terminal 1', NULL, 2, 'POS', NULL, 45.00, 'Paid', '852036', '5989', 'INV-00002', 'invoices/INV-00002.pdf', '2026-06-07 23:33:08', '2026-06-07 23:33:26', NULL, 2),
(3, 1, 'CUS-00003', 'John Smith', 'navodyadivyanjali2@gmail.com', NULL, '234234234', 'Sri Lanka', 'passports/passport_001.png', 'Bandaranaike International Airport', 'New', 'Arriving at Terminal 1', NULL, 2, 'POS', NULL, 45.00, 'Paid', '34234234', NULL, 'INV-00003', 'invoices/INV-00003.pdf', '2026-06-07 23:36:57', '2026-06-07 23:37:03', NULL, 2),
(4, 1, 'CUS-00004', 'John Smith', 'navodyadivyanjali2@gmail.com', NULL, '34234', 'Sri Lanka', 'passports/passport_001.png', 'Bandaranaike International Airport', 'New', 'Arriving at Terminal 1', NULL, 2, 'POS', NULL, 45.00, 'Paid', '32423424', NULL, 'INV-00004', 'invoices/INV-00004.pdf', '2026-06-08 03:37:10', '2026-06-08 03:37:21', NULL, 2),
(5, 1, 'CUS-00005', 'John Smith', 'navodyadivyanjali2@gmail.com', NULL, '23234234', 'Sri Lanka', 'passports/passport_001.png', 'Bandaranaike International Airport', 'New', 'Arriving at Terminal 1', NULL, 2, 'POS', NULL, 45.00, 'Paid', '234234', NULL, 'INV-00005', 'invoices/INV-00005.pdf', '2026-06-08 03:45:09', '2026-06-08 03:45:15', NULL, 2),
(6, 2, 'CUS-00006', 'Sarah Johnson', 'navodyadivyanjali2@gmail.com', NULL, '0761278989', 'Sri Lanka', 'passports/passport_002.png', 'Colombo Fort', 'New', 'VIP customer', NULL, 1, 'Cash', '[{\"amount\":\"8500\",\"count\":\"1\"}]', 8500.00, 'Paid', NULL, NULL, 'INV-00006', 'invoices/INV-00006.pdf', '2026-06-08 05:47:17', '2026-06-08 05:47:41', NULL, 2),
(7, 1, 'CUS-00007', 'John Smith', 'navodyadivyanjali2@gmail.com', NULL, '5665', 'Sri Lanka', 'agents/passport_001.png', 'Bandaranaike International Airport', 'New', 'Arriving at Terminal 1', NULL, 2, 'Cash', '[{\"amount\":\"45\",\"count\":\"1\"}]', 45.00, 'Paid', NULL, NULL, 'INV-00007', 'invoices/INV-00007.pdf', '2026-06-09 02:39:54', '2026-06-09 02:40:08', NULL, 2),
(8, 1, 'CUS-00008', 'John Smith', 'navodyadivyanjali2@gmail.com', NULL, '32324', 'Sri Lanka', 'agents/passport_001.png', 'Bandaranaike International Airport', 'New', 'Arriving at Terminal 1', NULL, 2, 'POS', NULL, 45.00, 'Paid', '213123', NULL, 'INV-00008', 'invoices/INV-00008.pdf', '2026-06-09 05:35:02', '2026-06-09 05:35:07', NULL, 2),
(9, 1, 'CUS-00009', 'John Smith', 'navodyadivyanjali2@gmail.com', NULL, '324', 'Sri Lanka', 'agents/passport_001.png', 'Bandaranaike International Airport', 'New', 'Arriving at Terminal 1', NULL, 2, 'Cash', '[{\"amount\":\"45\",\"count\":\"1\"}]', 45.00, 'Paid', NULL, NULL, 'INV-00009', 'invoices/INV-00009.pdf', '2026-06-09 06:49:21', '2026-06-09 06:49:27', NULL, 2),
(10, 1, 'CUS-00010', 'John Smith', 'navodyadivyanjali2@gmail.com', NULL, '213123123', 'Sri Lanka', 'agents/passport_001.png', 'Bandaranaike International Airport', 'New', 'Arriving at Terminal 1', 'German', 2, 'POS', NULL, 45.00, 'Paid', '213123123', NULL, 'INV-00010', 'invoices/INV-00010.pdf', '2026-06-09 22:52:45', '2026-06-09 22:52:55', NULL, 2),
(11, 1, 'CUS-00011', 'John Smith', 'navodyadivyanjali2@gmail.com', NULL, '123213123', 'Sri Lanka', 'agents/passport_001.png', 'Bandaranaike International Airport', 'New', 'Arriving at Terminal 1', NULL, 2, 'POS', NULL, 45.00, 'Paid', '123123', NULL, 'INV-00011', 'invoices/INV-00011.pdf', '2026-06-10 06:14:30', '2026-06-10 06:14:36', NULL, 2),
(12, 1, 'CUS-00012', 'John Smith', 'navodyadivyanjali2@gmail.com', NULL, '123123', 'Sri Lanka', 'agents/passport_001.png', 'Bandaranaike International Airport', 'New', 'Arriving at Terminal 1', 'German', 2, 'POS', NULL, 45.00, 'Paid', '213123', NULL, 'INV-00012', 'invoices/INV-00012.pdf', '2026-06-10 06:14:51', '2026-06-10 06:14:59', NULL, 2),
(13, 2, 'CUS-00013', 'Sarah Johnson', 'navodyadivyanjali2@gmail.com', NULL, '34234234', 'Sri Lanka', 'agents/passport_002.png', 'Colombo Fort', 'New', 'VIP customer', NULL, 1, 'POS', NULL, 8500.00, 'Paid', '2342342', NULL, 'INV-00013', 'invoices/INV-00013.pdf', '2026-06-10 06:21:13', '2026-06-10 06:23:42', NULL, 2),
(14, 2, 'CUS-00014', 'Sarah Johnson', 'navodyadivyanjali2@gmail.com', NULL, '32', 'Sri Lanka', 'agents/passport_002.png', 'Colombo Fort', 'New', 'VIP customer', NULL, 1, 'POS', NULL, 8500.00, 'Paid', '23434', NULL, 'INV-00014', 'invoices/INV-00014.pdf', '2026-06-10 09:01:35', '2026-06-10 09:01:40', NULL, 2),
(15, 1, 'CUS-00015', 'John Smith', 'navodyadivyanjali2@gmail.com', NULL, '32324', 'Sri Lanka', 'agents/passport_001.png', 'Bandaranaike International Airport', 'New', 'Arriving at Terminal 1', NULL, 2, 'POS', NULL, 45.00, 'Paid', '3424', NULL, 'INV-00015', 'invoices/INV-00015.pdf', '2026-06-10 09:08:03', '2026-06-10 09:08:44', NULL, 2),
(16, 2, 'CUS-00016', 'Sarah Johnson', 'navodyadivyanjali2@gmail.com', NULL, '3424234', 'Sri Lanka', 'agents/passport_002.png', 'Colombo Fort', 'New', 'VIP customer', NULL, 1, 'POS', NULL, 8500.00, 'Paid', '234234', NULL, 'INV-00016', 'invoices/INV-00016.pdf', '2026-06-10 09:19:38', '2026-06-10 09:19:43', NULL, 2),
(17, 1, 'CUS-00017', 'John Smith', 'navodyadivyanjali2@gmail.com', NULL, '4875', 'Sri Lanka', 'agents/passport_001.png', 'Bandaranaike International Airport', 'New', 'Arriving at Terminal 1', NULL, 2, 'POS', NULL, 45.00, 'Paid', '25', NULL, 'INV-00017', 'invoices/INV-00017.pdf', '2026-06-10 09:23:08', '2026-06-10 09:23:14', NULL, 2),
(18, 1, 'CUS-00018', 'John Smith', 'navodyadivyanjali2@gmail.com', NULL, '435345', 'Sri Lanka', 'agents/passport_001.png', 'Bandaranaike International Airport', 'New', 'Arriving at Terminal 1', NULL, 2, 'POS', NULL, 45.00, 'Paid', '423224', NULL, 'INV-00018', 'invoices/INV-00018.pdf', '2026-06-10 09:31:17', '2026-06-10 09:31:25', NULL, 2),
(19, 2, 'CUS-00019', 'Sarah Johnson', 'navodyadivyanjali2@gmail.com', NULL, '234234', 'Sri Lanka', 'agents/passport_002.png', 'Colombo Fort', 'New', 'VIP customer', NULL, 1, 'POS', NULL, 8500.00, 'Paid', '324234', NULL, 'INV-00019', 'invoices/INV-00019.pdf', '2026-06-10 09:45:17', '2026-06-10 09:45:23', NULL, 2);

-- --------------------------------------------------------

--
-- Table structure for table `customer_surveys`
--

CREATE TABLE `customer_surveys` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `trip_id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `driver_id` bigint(20) UNSIGNED DEFAULT NULL,
  `journey_rating` tinyint(3) UNSIGNED NOT NULL,
  `driver_rating` tinyint(3) UNSIGNED DEFAULT NULL,
  `driver_charged_extra` tinyint(1) NOT NULL DEFAULT 0,
  `extra_amount` decimal(12,2) DEFAULT NULL,
  `driver_was_polite` tinyint(1) NOT NULL DEFAULT 1,
  `vehicle_was_clean` tinyint(1) NOT NULL DEFAULT 1,
  `felt_safe` tinyint(1) NOT NULL DEFAULT 1,
  `comments` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customer_surveys`
--

INSERT INTO `customer_surveys` (`id`, `trip_id`, `customer_id`, `driver_id`, `journey_rating`, `driver_rating`, `driver_charged_extra`, `extra_amount`, `driver_was_polite`, `vehicle_was_clean`, `felt_safe`, `comments`, `created_at`, `updated_at`) VALUES
(1, 9, 15, 4, 5, 4, 0, NULL, 1, 1, 1, NULL, '2026-06-10 09:16:50', '2026-06-10 09:16:50'),
(2, 12, 18, 4, 5, 3, 1, 2000.00, 1, 1, 1, 'sfdsdfsd', '2026-06-10 09:34:07', '2026-06-10 09:34:07');

-- --------------------------------------------------------

--
-- Table structure for table `drivers`
--

CREATE TABLE `drivers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `registration_number` varchar(255) NOT NULL,
  `registration_date` date DEFAULT NULL,
  `registration_status` enum('Pending','Approved','Rejected','Suspended') NOT NULL DEFAULT 'Pending',
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `nic_number` varchar(255) DEFAULT NULL,
  `passport_number` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `nationality` varchar(255) DEFAULT NULL,
  `marital_status` varchar(255) DEFAULT NULL,
  `mobile_number` varchar(255) DEFAULT NULL,
  `whatsapp_number` varchar(255) DEFAULT NULL,
  `alternative_contact_number` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `permanent_address` text DEFAULT NULL,
  `current_address` text DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `driver_photo` varchar(255) DEFAULT NULL,
  `previous_employer` varchar(255) DEFAULT NULL,
  `previous_tourism_experience` text DEFAULT NULL,
  `accident_history` text DEFAULT NULL,
  `traffic_violation_history` text DEFAULT NULL,
  `driver_status` enum('Active','Inactive','Suspended','Rejected') NOT NULL DEFAULT 'Inactive',
  `duty_status` enum('off_duty','on_duty','on_trip') NOT NULL DEFAULT 'off_duty',
  `checked_in_at` datetime DEFAULT NULL,
  `checked_out_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `drivers`
--

INSERT INTO `drivers` (`id`, `registration_number`, `registration_date`, `registration_status`, `first_name`, `last_name`, `full_name`, `nic_number`, `passport_number`, `date_of_birth`, `gender`, `nationality`, `marital_status`, `mobile_number`, `whatsapp_number`, `alternative_contact_number`, `email`, `permanent_address`, `current_address`, `city`, `driver_photo`, `previous_employer`, `previous_tourism_experience`, `accident_history`, `traffic_violation_history`, `driver_status`, `duty_status`, `checked_in_at`, `checked_out_at`, `created_at`, `updated_at`) VALUES
(2, 'DRV-001', '2026-06-08', 'Pending', 'Navodya', 'Divyanjali', 'Navodya Divyanjali', '200261100012', NULL, '2002-04-20', 'Female', 'Sri Lankan', 'Single', '0759191583', '0759191583', NULL, 'navodyadivyanjali21@gmail.com', '109/1 Andhimulla Katana', '109/1 Andhimulla Katana', 'Katana', 'drivers/DRV-001/profile/drv-001-driver-photo.webp', NULL, NULL, NULL, NULL, 'Active', 'off_duty', '2026-06-10 16:19:42', NULL, '2026-06-07 22:37:41', '2026-06-07 22:37:41'),
(4, 'DRV-002', '2026-06-09', 'Pending', 'Test', 'Test', 'Test Test', '200661000012', NULL, '2006-04-19', 'Female', 'Sri Lankan', 'Single', '0759191583', '0759191583', NULL, 'navodyadivyanjali2s@gmail.com', '109/1 Andhimulla Katana', '109/1 Andhimulla Katana', 'Katana', 'drivers/DRV-002/profile/drv-002-driver-photo.webp', NULL, NULL, NULL, NULL, 'Active', 'on_duty', '2026-06-09 16:19:46', NULL, '2026-06-09 02:04:12', '2026-06-09 02:04:12'),
(5, 'DRV-003', '2026-06-10', 'Pending', 'Navodya', 'Divyanjali', 'Navodya ', '200961100012', NULL, '2009-04-20', 'Female', 'Sri Lankan', 'Single', '0759191583', '0759191583', NULL, 'navodyadivyanjali212@gmail.com', '109/1 Andhimulla Katana', '109/1 Andhimulla Katana', 'Katana', 'drivers/DRV-003/profile/drv-003-driver-photo.webp', NULL, NULL, NULL, NULL, 'Active', 'on_duty', '2026-06-10 09:46:40', NULL, '2026-06-09 22:26:04', '2026-06-09 22:26:04'),
(6, 'DRV-004', '2026-06-10', 'Approved', 'Navodya', 'Divyanjali', 'Navodya Divyanjali', '200131200012', NULL, '2001-11-07', 'Male', 'Sri Lankan', 'Single', '0759191583', '0759191583', NULL, 'navodya2@gmail.com', '109/1 Andhimulla Katana', '109/1 Andhimulla Katana', 'Katana', 'drivers/DRV-004/profile/drv-004-driver-photo.webp', NULL, NULL, NULL, NULL, 'Active', 'off_duty', NULL, NULL, '2026-06-09 22:45:52', '2026-06-09 22:45:52');

-- --------------------------------------------------------

--
-- Table structure for table `driver_availability`
--

CREATE TABLE `driver_availability` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `driver_id` bigint(20) UNSIGNED NOT NULL,
  `monday` tinyint(1) NOT NULL DEFAULT 0,
  `tuesday` tinyint(1) NOT NULL DEFAULT 0,
  `wednesday` tinyint(1) NOT NULL DEFAULT 0,
  `thursday` tinyint(1) NOT NULL DEFAULT 0,
  `friday` tinyint(1) NOT NULL DEFAULT 0,
  `saturday` tinyint(1) NOT NULL DEFAULT 0,
  `sunday` tinyint(1) NOT NULL DEFAULT 0,
  `working_shift` enum('Day Shift','Night Shift','Both') DEFAULT NULL,
  `airport_pickups` tinyint(1) NOT NULL DEFAULT 0,
  `airport_dropoffs` tinyint(1) NOT NULL DEFAULT 0,
  `tours` tinyint(1) NOT NULL DEFAULT 0,
  `long_distance_travel` tinyint(1) NOT NULL DEFAULT 0,
  `overnight_tours` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `driver_availability`
--

INSERT INTO `driver_availability` (`id`, `driver_id`, `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`, `working_shift`, `airport_pickups`, `airport_dropoffs`, `tours`, `long_distance_travel`, `overnight_tours`, `created_at`, `updated_at`) VALUES
(2, 2, 1, 0, 0, 1, 0, 0, 0, 'Day Shift', 0, 0, 0, 0, 0, '2026-06-07 22:37:41', '2026-06-07 22:37:41'),
(4, 4, 1, 0, 0, 0, 0, 0, 0, 'Day Shift', 0, 0, 0, 0, 0, '2026-06-09 02:04:12', '2026-06-09 02:04:12'),
(5, 5, 1, 0, 0, 1, 0, 0, 1, 'Day Shift', 0, 0, 0, 0, 0, '2026-06-09 22:26:05', '2026-06-09 22:26:05'),
(6, 6, 1, 0, 0, 0, 0, 0, 0, 'Night Shift', 0, 0, 0, 0, 0, '2026-06-09 22:45:52', '2026-06-09 22:45:52');

-- --------------------------------------------------------

--
-- Table structure for table `driver_documents`
--

CREATE TABLE `driver_documents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `driver_id` bigint(20) UNSIGNED NOT NULL,
  `nic_copy` varchar(255) DEFAULT NULL,
  `passport_copy` varchar(255) DEFAULT NULL,
  `driver_photo` varchar(255) DEFAULT NULL,
  `driving_license_copy` varchar(255) DEFAULT NULL,
  `tourist_driving_license_copy` varchar(255) DEFAULT NULL,
  `no_objection_letter` varchar(255) DEFAULT NULL,
  `police_clearance_certificate` varchar(255) DEFAULT NULL,
  `medical_fitness_certificate` varchar(255) DEFAULT NULL,
  `tourism_authority_registration` varchar(255) DEFAULT NULL,
  `airport_permit` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `driver_documents`
--

INSERT INTO `driver_documents` (`id`, `driver_id`, `nic_copy`, `passport_copy`, `driver_photo`, `driving_license_copy`, `tourist_driving_license_copy`, `no_objection_letter`, `police_clearance_certificate`, `medical_fitness_certificate`, `tourism_authority_registration`, `airport_permit`, `created_at`, `updated_at`) VALUES
(2, 2, 'drivers/DRV-001/documents/drv-001-nic-copy.pdf', 'drivers/DRV-001/documents/drv-001-passport-copy.pdf', NULL, 'drivers/DRV-001/documents/drv-001-driving-license-copy.pdf', 'drivers/DRV-001/documents/drv-001-tourist-driving-license-copy.pdf', 'drivers/DRV-001/documents/drv-001-no-objection-letter.pdf', 'drivers/DRV-001/documents/drv-001-police-clearance-certificate.pdf', 'drivers/DRV-001/documents/drv-001-medical-fitness-certificate.webp', 'drivers/DRV-001/documents/drv-001-tourism-authority-registration.pdf', 'drivers/DRV-001/documents/drv-001-airport-permit.pdf', '2026-06-07 22:37:42', '2026-06-07 22:37:42'),
(4, 4, 'drivers/DRV-002/documents/drv-002-nic-copy.pdf', 'drivers/DRV-002/documents/drv-002-passport-copy.pdf', NULL, 'drivers/DRV-002/documents/drv-002-driving-license-copy.webp', 'drivers/DRV-002/documents/drv-002-tourist-driving-license-copy.pdf', 'drivers/DRV-002/documents/drv-002-no-objection-letter.pdf', 'drivers/DRV-002/documents/drv-002-police-clearance-certificate.pdf', 'drivers/DRV-002/documents/drv-002-medical-fitness-certificate.webp', 'drivers/DRV-002/documents/drv-002-tourism-authority-registration.pdf', 'drivers/DRV-002/documents/drv-002-airport-permit.pdf', '2026-06-09 02:04:13', '2026-06-09 02:04:13'),
(5, 5, 'drivers/DRV-003/documents/drv-003-nic-copy.pdf', 'drivers/DRV-003/documents/drv-003-passport-copy.pdf', NULL, 'drivers/DRV-003/documents/drv-003-driving-license-copy.webp', 'drivers/DRV-003/documents/drv-003-tourist-driving-license-copy.webp', 'drivers/DRV-003/documents/drv-003-no-objection-letter.webp', 'drivers/DRV-003/documents/drv-003-police-clearance-certificate.webp', 'drivers/DRV-003/documents/drv-003-medical-fitness-certificate.pdf', 'drivers/DRV-003/documents/drv-003-tourism-authority-registration.pdf', 'drivers/DRV-003/documents/drv-003-airport-permit.pdf', '2026-06-09 22:26:07', '2026-06-09 22:26:07'),
(6, 6, 'drivers/DRV-004/documents/drv-004-nic-copy.webp', 'drivers/DRV-004/documents/drv-004-passport-copy.pdf', NULL, 'drivers/DRV-004/documents/drv-004-driving-license-copy.pdf', 'drivers/DRV-004/documents/drv-004-tourist-driving-license-copy.pdf', 'drivers/DRV-004/documents/drv-004-no-objection-letter.webp', 'drivers/DRV-004/documents/drv-004-police-clearance-certificate.webp', 'drivers/DRV-004/documents/drv-004-medical-fitness-certificate.webp', 'drivers/DRV-004/documents/drv-004-tourism-authority-registration.pdf', 'drivers/DRV-004/documents/drv-004-airport-permit.pdf', '2026-06-09 22:45:53', '2026-06-09 22:45:53');

-- --------------------------------------------------------

--
-- Table structure for table `driver_languages`
--

CREATE TABLE `driver_languages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `driver_id` bigint(20) UNSIGNED NOT NULL,
  `language_name` varchar(255) NOT NULL,
  `speaking_level` enum('Basic','Intermediate','Fluent') DEFAULT NULL,
  `reading_level` enum('Basic','Intermediate','Fluent') DEFAULT NULL,
  `writing_level` enum('Basic','Intermediate','Fluent') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `driver_languages`
--

INSERT INTO `driver_languages` (`id`, `driver_id`, `language_name`, `speaking_level`, `reading_level`, `writing_level`, `created_at`, `updated_at`) VALUES
(3, 2, 'English', 'Basic', 'Intermediate', 'Intermediate', '2026-06-07 22:37:41', '2026-06-07 22:37:41'),
(4, 2, 'Russian', 'Intermediate', 'Basic', 'Basic', '2026-06-07 22:37:41', '2026-06-07 22:37:41'),
(6, 4, 'Sinhala', 'Basic', 'Basic', 'Intermediate', '2026-06-09 02:04:12', '2026-06-09 02:04:12'),
(7, 5, 'test', 'Basic', 'Intermediate', 'Basic', '2026-06-09 22:26:04', '2026-06-09 22:26:04'),
(8, 6, 'test', 'Intermediate', 'Intermediate', 'Basic', '2026-06-09 22:45:52', '2026-06-09 22:45:52');

-- --------------------------------------------------------

--
-- Table structure for table `driver_service_categories`
--

CREATE TABLE `driver_service_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `driver_id` bigint(20) UNSIGNED NOT NULL,
  `service_category_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `driver_service_categories`
--

INSERT INTO `driver_service_categories` (`id`, `driver_id`, `service_category_id`, `created_at`, `updated_at`) VALUES
(3, 2, 1, NULL, NULL),
(4, 2, 4, NULL, NULL),
(7, 4, 1, NULL, NULL),
(8, 4, 4, NULL, NULL),
(9, 5, 1, NULL, NULL),
(10, 5, 4, NULL, NULL),
(11, 6, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `driving_licenses`
--

CREATE TABLE `driving_licenses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `driver_id` bigint(20) UNSIGNED NOT NULL,
  `license_number` varchar(255) DEFAULT NULL,
  `license_type` varchar(255) DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `years_of_experience` int(11) DEFAULT NULL,
  `tourist_license_available` tinyint(1) NOT NULL DEFAULT 0,
  `tourist_license_number` varchar(255) DEFAULT NULL,
  `tourist_issue_date` date DEFAULT NULL,
  `tourist_expiry_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `driving_licenses`
--

INSERT INTO `driving_licenses` (`id`, `driver_id`, `license_number`, `license_type`, `issue_date`, `expiry_date`, `years_of_experience`, `tourist_license_available`, `tourist_license_number`, `tourist_issue_date`, `tourist_expiry_date`, `created_at`, `updated_at`) VALUES
(2, 2, '1231214', 'Heavy Vehicle', '2026-05-31', '2026-06-18', 2, 0, NULL, NULL, NULL, '2026-06-07 22:37:41', '2026-06-07 22:37:41'),
(4, 4, '23213213', 'Heavy Vehicle', '2026-05-31', '2026-06-17', 2, 0, NULL, NULL, NULL, '2026-06-09 02:04:12', '2026-06-09 02:04:12'),
(5, 5, '12312323123', 'Heavy Vehicle', '2026-06-01', '2026-06-26', 2, 0, NULL, NULL, NULL, '2026-06-09 22:26:04', '2026-06-09 22:26:04'),
(6, 6, '312312323', 'Heavy Vehicle', '2026-06-01', '2026-06-18', 2, 0, NULL, NULL, NULL, '2026-06-09 22:45:52', '2026-06-09 22:45:52');

-- --------------------------------------------------------

--
-- Table structure for table `emergency_contacts`
--

CREATE TABLE `emergency_contacts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `driver_id` bigint(20) UNSIGNED NOT NULL,
  `contact_name` varchar(255) DEFAULT NULL,
  `relationship` varchar(255) DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `alternative_contact_number` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `emergency_contacts`
--

INSERT INTO `emergency_contacts` (`id`, `driver_id`, `contact_name`, `relationship`, `contact_number`, `alternative_contact_number`, `address`, `created_at`, `updated_at`) VALUES
(2, 2, 'Navodya Divyanjali', 'Test', '0759191583', NULL, '109/1 Andhimulla Katana', '2026-06-07 22:37:41', '2026-06-07 22:37:41'),
(4, 4, 'Navodya Divyanjali', 'Test', '0759191583', NULL, '109/1 Andhimulla Katana', '2026-06-09 02:04:12', '2026-06-09 02:04:12'),
(5, 5, 'Roshan Meerium', 'test', '0759191583', NULL, '109/1 Andhimulla Katana', '2026-06-09 22:26:04', '2026-06-09 22:26:04'),
(6, 6, 'Navodya Divyanjali', 'test', '0759191583', NULL, '109/1 Andhimulla Katana', '2026-06-09 22:45:52', '2026-06-09 22:45:52');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `finances`
--

CREATE TABLE `finances` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `trip_id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `agent_id` bigint(20) UNSIGNED NOT NULL,
  `driver_id` bigint(20) UNSIGNED NOT NULL,
  `currency` varchar(255) NOT NULL DEFAULT 'LKR',
  `trip_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `driver_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `agent_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `company_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `expense_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` varchar(255) NOT NULL DEFAULT 'Pending',
  `remarks` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `finances`
--

INSERT INTO `finances` (`id`, `trip_id`, `customer_id`, `agent_id`, `driver_id`, `currency`, `trip_amount`, `driver_amount`, `agent_amount`, `company_amount`, `expense_amount`, `status`, `remarks`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 5, 6, 2, 2, 'LKR', 8500.00, 1000.00, 1000.00, 6500.00, 0.00, 'Settled', NULL, 2, '2026-06-09 00:04:14', '2026-06-09 00:04:14');

-- --------------------------------------------------------

--
-- Table structure for table `incentives`
--

CREATE TABLE `incentives` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `driver_id` bigint(20) UNSIGNED DEFAULT NULL,
  `agent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `person_type` enum('Driver','Agent') NOT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `currency` varchar(255) NOT NULL DEFAULT 'LKR',
  `remarks` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `incentives`
--

INSERT INTO `incentives` (`id`, `driver_id`, `agent_id`, `person_type`, `amount`, `currency`, `remarks`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 2, NULL, 'Driver', 200.00, 'LKR', NULL, 2, '2026-06-09 00:56:26', '2026-06-09 00:56:26'),
(2, NULL, 2, 'Agent', 300.00, 'LKR', NULL, 2, '2026-06-09 01:02:28', '2026-06-09 01:02:28');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(23, '0001_01_01_000000_create_drivers_table', 1),
(24, '0001_01_01_000000_create_roles_table', 1),
(25, '0001_01_01_000000_create_users_table', 1),
(26, '0001_01_01_000001_create_cache_table', 1),
(27, '0001_01_01_000002_create_jobs_table', 1),
(28, '2026_06_01_054520_create_emergency_contacts_table', 1),
(29, '2026_06_01_054525_create_driving_licenses_table', 1),
(30, '2026_06_01_054531_create_vehicles_table', 1),
(31, '2026_06_01_054537_create_vehicle_features_table', 1),
(32, '2026_06_01_054542_create_vehicle_documents_table', 1),
(33, '2026_06_01_054547_create_vehicle_pictures_table', 1),
(34, '2026_06_01_054552_create_bank_details_table', 1),
(35, '2026_06_01_054558_create_driver_documents_table', 1),
(36, '2026_06_01_054606_create_admin_verifications_table', 1),
(37, '2026_06_01_082734_create_driver_languages_table', 1),
(38, '2026_06_01_083627_create_service_categories_table', 1),
(39, '2026_06_01_083720_create_driver_service_categories_table', 1),
(40, '2026_06_01_084459_create_driver_availability_table', 1),
(41, '2026_06_01_084509_create_technology_info_table', 1),
(42, '2026_06_01_085351_create_tourism_compliance_table', 1),
(43, '2026_06_03_075949_add_role_id_to_users_table', 1),
(44, '2026_06_04_041455_create_agents_table', 1),
(45, '2026_06_04_042536_create_customers_table', 1),
(46, '2026_06_05_000000_add_created_by_to_customers_table', 1),
(47, '2026_06_05_000001_add_pos_payment_fields_to_customers_table', 1),
(48, '2026_06_05_065217_add_payment_fields_to_customers_table', 1),
(49, '2026_06_05_065225_add_updated_currency_fields_to_agents_table', 1),
(50, '2026_06_05_102504_add_invoice_fields_to_customers_table', 1),
(51, '2026_06_07_100636_create_trips_table', 1),
(52, '2026_06_07_104045_add_status_to_drivers_table', 1),
(53, '2026_06_09_051938_create_finances_table', 2),
(54, '2026_06_09_052752_create_finances_table', 3),
(55, '2026_06_09_053344_create_finances_table', 4),
(56, '2026_06_09_062441_create_incentives_table', 5),
(57, '2026_06_10_142017_add_survey_fields_to_trips_table', 6),
(58, '2026_06_10_143516_create_customer_surveys_table', 7);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'driver', '2026-06-07 22:37:32', '2026-06-07 22:37:32'),
(2, 'agent', '2026-06-07 23:03:42', '2026-06-07 23:03:42'),
(3, 'admin', '2026-06-10 05:21:22', '2026-06-10 05:21:22'),
(4, 'finance', '2026-06-10 05:30:54', '2026-06-10 05:30:54'),
(5, 'counter staff', '2026-06-10 05:37:30', '2026-06-10 05:37:30');

-- --------------------------------------------------------

--
-- Table structure for table `service_categories`
--

CREATE TABLE `service_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `service_categories`
--

INSERT INTO `service_categories` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'Airport Transfers', '2026-06-07 05:22:06', '2026-06-07 05:22:06'),
(2, 'Hotel Transfers', '2026-06-07 05:22:06', '2026-06-07 05:22:06'),
(3, 'Point-to-Point Transfers', '2026-06-07 05:22:06', '2026-06-07 05:22:06'),
(4, 'Corporate Transfers', '2026-06-07 05:22:06', '2026-06-07 05:22:06'),
(5, 'City Tours', '2026-06-07 05:22:06', '2026-06-07 05:22:06'),
(6, 'Day Tours', '2026-06-07 05:22:06', '2026-06-07 05:22:06'),
(7, 'Multi-Day Tours', '2026-06-07 05:22:06', '2026-06-07 05:22:06'),
(8, 'Chauffeur Services', '2026-06-07 05:22:06', '2026-06-07 05:22:06'),
(9, 'VIP Transfers', '2026-06-07 05:22:06', '2026-06-07 05:22:06'),
(10, 'Cruise Passenger Transfers', '2026-06-07 05:22:06', '2026-06-07 05:22:06');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('3kveYZJKv4sY0x7yjxDGBvekao7MRKyK4ZSx1kIB', 2, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', 'YTo1OntzOjY6Il90b2tlbiI7czo0MDoiaFBtb0gzUlZMTnkyNmtUVnBrZHE3bW9tUVo3NjNpcVJiNVdHTXN0aCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czozOiJ1cmwiO2E6MDp7fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9zdXJ2ZXkvMTMiO3M6NToicm91dGUiO3M6MTE6InN1cnZleS5zaG93Ijt9fQ==', 1781085246);

-- --------------------------------------------------------

--
-- Table structure for table `technology_info`
--

CREATE TABLE `technology_info` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `driver_id` bigint(20) UNSIGNED NOT NULL,
  `smartphone_available` tinyint(1) NOT NULL DEFAULT 0,
  `device_type` enum('Android','iPhone') DEFAULT NULL,
  `internet_connection_available` tinyint(1) NOT NULL DEFAULT 0,
  `gps_tracking_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `mobile_app_usage_experience` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `technology_info`
--

INSERT INTO `technology_info` (`id`, `driver_id`, `smartphone_available`, `device_type`, `internet_connection_available`, `gps_tracking_enabled`, `mobile_app_usage_experience`, `created_at`, `updated_at`) VALUES
(2, 2, 0, 'iPhone', 0, 0, 0, '2026-06-07 22:37:41', '2026-06-07 22:37:41'),
(4, 4, 0, 'iPhone', 0, 0, 0, '2026-06-09 02:04:12', '2026-06-09 02:04:12'),
(5, 5, 0, 'iPhone', 1, 0, 0, '2026-06-09 22:26:05', '2026-06-09 22:26:05'),
(6, 6, 0, 'iPhone', 0, 0, 0, '2026-06-09 22:45:52', '2026-06-09 22:45:52');

-- --------------------------------------------------------

--
-- Table structure for table `tourism_compliance`
--

CREATE TABLE `tourism_compliance` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `driver_id` bigint(20) UNSIGNED NOT NULL,
  `tourism_registration_number` varchar(255) DEFAULT NULL,
  `sltda_registered_driver` tinyint(1) NOT NULL DEFAULT 0,
  `tourist_driving_license_copy` varchar(255) DEFAULT NULL,
  `tourism_authority_permit_copy` varchar(255) DEFAULT NULL,
  `airport_access_permit` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tourism_compliance`
--

INSERT INTO `tourism_compliance` (`id`, `driver_id`, `tourism_registration_number`, `sltda_registered_driver`, `tourist_driving_license_copy`, `tourism_authority_permit_copy`, `airport_access_permit`, `created_at`, `updated_at`) VALUES
(2, 2, NULL, 0, NULL, NULL, NULL, '2026-06-07 22:37:41', '2026-06-07 22:37:41'),
(4, 4, NULL, 0, NULL, NULL, NULL, '2026-06-09 02:04:12', '2026-06-09 02:04:12'),
(5, 5, NULL, 0, NULL, NULL, NULL, '2026-06-09 22:26:05', '2026-06-09 22:26:05'),
(6, 6, NULL, 0, NULL, NULL, NULL, '2026-06-09 22:45:52', '2026-06-09 22:45:52');

-- --------------------------------------------------------

--
-- Table structure for table `trips`
--

CREATE TABLE `trips` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `driver_id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `agent_id` bigint(20) UNSIGNED NOT NULL,
  `trip_assigned_at` timestamp NULL DEFAULT NULL,
  `trip_assigned_by` bigint(20) UNSIGNED DEFAULT NULL,
  `accepted_at` datetime DEFAULT NULL,
  `trip_started_at` datetime DEFAULT NULL,
  `trip_ended_at` datetime DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `status` enum('Assigned','Accepted','In_Progress','Completed','Released') NOT NULL DEFAULT 'Assigned',
  `survey_sent_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `trips`
--

INSERT INTO `trips` (`id`, `driver_id`, `customer_id`, `agent_id`, `trip_assigned_at`, `trip_assigned_by`, `accepted_at`, `trip_started_at`, `trip_ended_at`, `remarks`, `status`, `survey_sent_at`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 1, '2026-06-07 23:27:17', 2, NULL, NULL, NULL, NULL, 'Completed', NULL, '2026-06-07 23:27:17', '2026-06-07 23:27:17'),
(2, 2, 2, 1, '2026-06-07 23:33:29', 2, NULL, NULL, NULL, NULL, 'Completed', NULL, '2026-06-07 23:33:29', '2026-06-07 23:33:29'),
(3, 2, 3, 1, '2026-06-07 23:37:05', 2, NULL, NULL, NULL, NULL, 'Completed', NULL, '2026-06-07 23:37:05', '2026-06-07 23:37:05'),
(4, 2, 5, 1, '2026-06-08 03:45:16', 2, NULL, NULL, NULL, NULL, 'Completed', NULL, '2026-06-08 03:45:16', '2026-06-08 03:45:16'),
(5, 2, 6, 2, '2026-06-08 05:47:43', 2, NULL, NULL, NULL, NULL, 'Completed', NULL, '2026-06-08 05:47:43', '2026-06-08 05:47:43'),
(9, 4, 15, 1, '2026-06-10 09:08:47', 2, NULL, NULL, NULL, NULL, 'Completed', '2026-06-10 14:38:47', '2026-06-10 09:08:47', '2026-06-10 09:08:47'),
(10, 5, 16, 2, '2026-06-10 09:19:45', 2, NULL, NULL, NULL, NULL, 'Completed', '2026-06-10 14:49:45', '2026-06-10 09:19:45', '2026-06-10 09:19:45'),
(11, 5, 17, 1, '2026-06-10 09:23:14', 2, NULL, NULL, NULL, NULL, 'Completed', '2026-06-10 14:53:14', '2026-06-10 09:23:14', '2026-06-10 09:23:14'),
(12, 4, 18, 1, '2026-06-10 09:31:27', 2, NULL, NULL, NULL, NULL, 'Completed', '2026-06-10 15:01:27', '2026-06-10 09:31:27', '2026-06-10 09:31:27'),
(13, 4, 19, 2, '2026-06-10 09:45:25', 2, NULL, NULL, NULL, NULL, 'Assigned', '2026-06-10 15:15:25', '2026-06-10 09:45:25', '2026-06-10 09:45:25');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED DEFAULT NULL,
  `driver_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `role_id`, `driver_id`, `name`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, NULL, NULL, 'Test User', 'test@example.com', '2026-06-07 05:22:05', '$2y$12$CvIp02KUWQL61ILyvo1aAepsLCQvDnrBFpuCqVQXYDKMg.VNxb7xu', 'gi4BiHmGCP', '2026-06-07 05:22:05', '2026-06-07 05:22:05'),
(2, 3, NULL, 'Navodya Divyanjali', 'navodyadivyanjali2@gmail.com', NULL, '$2y$12$Dj8PEQd2iSgfSbmUYkabNuqk8GOjdbAJIYAKJNhIzOEPuNR8VJ1B6', NULL, '2026-06-07 05:28:51', '2026-06-10 05:21:29'),
(4, 1, 2, 'Navodya Divyanjali', 'navodyadivyanjali21@gmail.com', NULL, '$2y$12$4VoBYIi0ZHXlNTGs0dghu.m7okhH9rYeInl3MIzfX8RXZycUGt8qK', NULL, '2026-06-07 22:37:42', '2026-06-07 22:37:42'),
(6, 1, 4, 'Test Test', 'navodyadivyanjali2s@gmail.com', NULL, '$2y$12$n5qJOFKpJt7buTutL7vq2ugER7IPauYztpyYv28BN4Qik7u24kRRS', NULL, '2026-06-09 02:04:13', '2026-06-09 02:04:13'),
(7, 1, 5, 'Navodya Divyanjali', 'navodyadivyanjali212@gmail.com', NULL, '$2y$12$OxJhy8eYNtSeM5Xeh6yZAuvXeRw2J01w7NRtm.Be8..M6v2v6/bea', NULL, '2026-06-09 22:26:07', '2026-06-09 22:26:07'),
(8, 1, 6, 'Navodya Divyanjali', 'navodya2@gmail.com', NULL, '$2y$12$GUiHY79dEnlSVlB//Jq9Quu0ofn3j388eY.MCjUUx7Z1bJCicTkSm', NULL, '2026-06-09 22:45:54', '2026-06-09 22:45:54'),
(9, 4, NULL, 'Test', 'test@gmail.com', NULL, '$2y$12$/QvBYF.LZHmH8adtTBo/wOqa6ekJ5Utt1u.mWxNQ6SY6k38keeUo2', NULL, '2026-06-10 05:31:38', '2026-06-10 05:31:38'),
(10, 5, NULL, 'abc', 'abc@gmail.com', NULL, '$2y$12$DamTq9jGJslpGWoTscOEqug9ktmy/96N5NKvg6aD8hs5j/hyEzwyS', NULL, '2026-06-10 05:37:49', '2026-06-10 05:37:49');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `driver_id` bigint(20) UNSIGNED NOT NULL,
  `registration_number` varchar(255) DEFAULT NULL,
  `vehicle_type` enum('Sedan','SUV','Van','Luxury Sedan','Luxury SUV','Mini Coach') DEFAULT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `model` varchar(255) DEFAULT NULL,
  `vehicle_year` year(4) DEFAULT NULL,
  `color` varchar(255) DEFAULT NULL,
  `seating_capacity` int(11) DEFAULT NULL,
  `luggage_capacity` int(11) DEFAULT NULL,
  `fuel_type` varchar(255) DEFAULT NULL,
  `transmission_type` varchar(255) DEFAULT NULL,
  `ownership_type` enum('Company-Owned','Outsourced Vehicle','Personally Owned') DEFAULT NULL,
  `ownership_confirmation_letter` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`id`, `driver_id`, `registration_number`, `vehicle_type`, `brand`, `model`, `vehicle_year`, `color`, `seating_capacity`, `luggage_capacity`, `fuel_type`, `transmission_type`, `ownership_type`, `ownership_confirmation_letter`, `created_at`, `updated_at`) VALUES
(2, 2, 'CBM-5716', 'Van', 'Suzuki', 'Alto', '2005', 'Test', 2, NULL, NULL, NULL, NULL, 'drivers/DRV-001/ownership/drv-001-ownership-confirmation-letter.pdf', '2026-06-07 22:37:41', '2026-06-07 22:37:41'),
(4, 4, 'CAT-2710', 'Van', 'test', 'test', '2003', 'test', 2, 2, NULL, NULL, NULL, NULL, '2026-06-09 02:04:12', '2026-06-09 02:04:12'),
(5, 5, 'CBM-5836', 'Van', 'TEST', 'TEST', '2003', NULL, NULL, NULL, NULL, NULL, 'Outsourced Vehicle', NULL, '2026-06-09 22:26:05', '2026-06-09 22:26:05'),
(6, 6, 'CAT-8520', 'SUV', 'test', 'test', '2003', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-06-09 22:45:52', '2026-06-09 22:45:52');

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_documents`
--

CREATE TABLE `vehicle_documents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `vehicle_id` bigint(20) UNSIGNED NOT NULL,
  `registration_book` varchar(255) DEFAULT NULL,
  `insurance_certificate` varchar(255) DEFAULT NULL,
  `revenue_license` varchar(255) DEFAULT NULL,
  `emission_test_certificate` varchar(255) DEFAULT NULL,
  `driving_license_copy` varchar(255) DEFAULT NULL,
  `insurance_expiry_date` date DEFAULT NULL,
  `revenue_license_expiry_date` date DEFAULT NULL,
  `emission_test_expiry_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicle_documents`
--

INSERT INTO `vehicle_documents` (`id`, `vehicle_id`, `registration_book`, `insurance_certificate`, `revenue_license`, `emission_test_certificate`, `driving_license_copy`, `insurance_expiry_date`, `revenue_license_expiry_date`, `emission_test_expiry_date`, `created_at`, `updated_at`) VALUES
(2, 2, 'drivers/DRV-001/documents/drv-001-registration-book.pdf', 'drivers/DRV-001/documents/drv-001-insurance-certificate.pdf', 'drivers/DRV-001/documents/drv-001-revenue-license.pdf', 'drivers/DRV-001/documents/drv-001-emission-test-certificate.pdf', 'drivers/DRV-001/documents/drv-001-vehicle-driving-license-copy.pdf', '2026-06-01', '2026-06-24', '2026-06-25', '2026-06-07 22:37:41', '2026-06-07 22:37:41'),
(4, 4, 'drivers/DRV-002/documents/drv-002-registration-book.pdf', 'drivers/DRV-002/documents/drv-002-insurance-certificate.pdf', 'drivers/DRV-002/documents/drv-002-revenue-license.pdf', 'drivers/DRV-002/documents/drv-002-emission-test-certificate.pdf', 'drivers/DRV-002/documents/drv-002-vehicle-driving-license-copy.pdf', '2026-07-08', '2026-07-10', '2026-07-09', '2026-06-09 02:04:12', '2026-06-09 02:04:12'),
(5, 5, 'drivers/DRV-003/documents/drv-003-registration-book.pdf', 'drivers/DRV-003/documents/drv-003-insurance-certificate.pdf', 'drivers/DRV-003/documents/drv-003-revenue-license.pdf', 'drivers/DRV-003/documents/drv-003-emission-test-certificate.pdf', 'drivers/DRV-003/documents/drv-003-vehicle-driving-license-copy.pdf', '2026-06-23', '2026-07-09', '2026-07-03', '2026-06-09 22:26:06', '2026-06-09 22:26:06'),
(6, 6, 'drivers/DRV-004/documents/drv-004-registration-book.pdf', 'drivers/DRV-004/documents/drv-004-insurance-certificate.pdf', 'drivers/DRV-004/documents/drv-004-revenue-license.pdf', 'drivers/DRV-004/documents/drv-004-emission-test-certificate.pdf', 'drivers/DRV-004/documents/drv-004-vehicle-driving-license-copy.pdf', '2026-06-17', '2026-07-09', '2026-07-10', '2026-06-09 22:45:53', '2026-06-09 22:45:53');

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_features`
--

CREATE TABLE `vehicle_features` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `vehicle_id` bigint(20) UNSIGNED NOT NULL,
  `air_conditioned` tinyint(1) NOT NULL DEFAULT 0,
  `wifi_available` tinyint(1) NOT NULL DEFAULT 0,
  `gps_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `child_seat_available` tinyint(1) NOT NULL DEFAULT 0,
  `wheelchair_accessible` tinyint(1) NOT NULL DEFAULT 0,
  `pet_friendly` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicle_features`
--

INSERT INTO `vehicle_features` (`id`, `vehicle_id`, `air_conditioned`, `wifi_available`, `gps_enabled`, `child_seat_available`, `wheelchair_accessible`, `pet_friendly`, `created_at`, `updated_at`) VALUES
(4, 2, 1, 0, 1, 1, 0, 0, '2026-06-09 11:39:46', '2026-06-09 11:39:46'),
(5, 4, 1, 0, 0, 1, 0, 0, '2026-06-09 11:39:46', '2026-06-09 11:39:46'),
(6, 5, 0, 1, 0, 0, 1, 0, '2026-06-09 22:26:05', '2026-06-09 22:26:05'),
(7, 6, 1, 0, 0, 0, 0, 0, '2026-06-09 22:45:52', '2026-06-09 22:45:52');

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_pictures`
--

CREATE TABLE `vehicle_pictures` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `vehicle_id` bigint(20) UNSIGNED NOT NULL,
  `front_view` varchar(255) DEFAULT NULL,
  `rear_view` varchar(255) DEFAULT NULL,
  `left_side_view` varchar(255) DEFAULT NULL,
  `right_side_view` varchar(255) DEFAULT NULL,
  `front_interior_view` varchar(255) DEFAULT NULL,
  `passenger_seating_area` varchar(255) DEFAULT NULL,
  `dashboard_view` varchar(255) DEFAULT NULL,
  `luggage_compartment_view` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicle_pictures`
--

INSERT INTO `vehicle_pictures` (`id`, `vehicle_id`, `front_view`, `rear_view`, `left_side_view`, `right_side_view`, `front_interior_view`, `passenger_seating_area`, `dashboard_view`, `luggage_compartment_view`, `created_at`, `updated_at`) VALUES
(2, 2, 'drivers/DRV-001/photos/drv-001-front-view.webp', 'drivers/DRV-001/photos/drv-001-rear-view.webp', 'drivers/DRV-001/photos/drv-001-left-side-view.webp', 'drivers/DRV-001/photos/drv-001-right-side-view.webp', 'drivers/DRV-001/photos/drv-001-front-interior-view.webp', 'drivers/DRV-001/photos/drv-001-passenger-seating-area.webp', 'drivers/DRV-001/photos/drv-001-dashboard-view.webp', 'drivers/DRV-001/photos/drv-001-luggage-compartment-view.webp', '2026-06-07 22:37:42', '2026-06-07 22:37:42'),
(4, 4, 'drivers/DRV-002/photos/drv-002-front-view.webp', 'drivers/DRV-002/photos/drv-002-rear-view.webp', 'drivers/DRV-002/photos/drv-002-left-side-view.webp', 'drivers/DRV-002/photos/drv-002-right-side-view.webp', 'drivers/DRV-002/photos/drv-002-front-interior-view.webp', 'drivers/DRV-002/photos/drv-002-passenger-seating-area.webp', 'drivers/DRV-002/photos/drv-002-dashboard-view.webp', 'drivers/DRV-002/photos/drv-002-luggage-compartment-view.webp', '2026-06-09 02:04:12', '2026-06-09 02:04:12'),
(5, 5, 'drivers/DRV-003/photos/drv-003-front-view.webp', 'drivers/DRV-003/photos/drv-003-rear-view.webp', 'drivers/DRV-003/photos/drv-003-left-side-view.webp', 'drivers/DRV-003/photos/drv-003-right-side-view.webp', 'drivers/DRV-003/photos/drv-003-front-interior-view.webp', 'drivers/DRV-003/photos/drv-003-passenger-seating-area.webp', 'drivers/DRV-003/photos/drv-003-dashboard-view.webp', 'drivers/DRV-003/photos/drv-003-luggage-compartment-view.webp', '2026-06-09 22:26:06', '2026-06-09 22:26:06'),
(6, 6, 'drivers/DRV-004/photos/drv-004-front-view.webp', 'drivers/DRV-004/photos/drv-004-rear-view.webp', 'drivers/DRV-004/photos/drv-004-left-side-view.webp', 'drivers/DRV-004/photos/drv-004-right-side-view.webp', 'drivers/DRV-004/photos/drv-004-front-interior-view.webp', 'drivers/DRV-004/photos/drv-004-passenger-seating-area.webp', 'drivers/DRV-004/photos/drv-004-dashboard-view.webp', 'drivers/DRV-004/photos/drv-004-luggage-compartment-view.webp', '2026-06-09 22:45:53', '2026-06-09 22:45:53');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_verifications`
--
ALTER TABLE `admin_verifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_verifications_driver_id_foreign` (`driver_id`);

--
-- Indexes for table `agents`
--
ALTER TABLE `agents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `agents_user_id_foreign` (`user_id`),
  ADD KEY `agents_currency_updated_by_foreign` (`currency_updated_by`);

--
-- Indexes for table `bank_details`
--
ALTER TABLE `bank_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bank_details_driver_id_foreign` (`driver_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customers_customer_code_unique` (`customer_code`),
  ADD KEY `customers_agent_id_foreign` (`agent_id`),
  ADD KEY `customers_created_by_foreign` (`created_by`);

--
-- Indexes for table `customer_surveys`
--
ALTER TABLE `customer_surveys`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_surveys_trip_id_foreign` (`trip_id`),
  ADD KEY `customer_surveys_customer_id_foreign` (`customer_id`),
  ADD KEY `customer_surveys_driver_id_foreign` (`driver_id`);

--
-- Indexes for table `drivers`
--
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `drivers_registration_number_unique` (`registration_number`);

--
-- Indexes for table `driver_availability`
--
ALTER TABLE `driver_availability`
  ADD PRIMARY KEY (`id`),
  ADD KEY `driver_availability_driver_id_foreign` (`driver_id`);

--
-- Indexes for table `driver_documents`
--
ALTER TABLE `driver_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `driver_documents_driver_id_foreign` (`driver_id`);

--
-- Indexes for table `driver_languages`
--
ALTER TABLE `driver_languages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `driver_languages_driver_id_foreign` (`driver_id`);

--
-- Indexes for table `driver_service_categories`
--
ALTER TABLE `driver_service_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `driver_service_categories_driver_id_foreign` (`driver_id`),
  ADD KEY `driver_service_categories_service_category_id_foreign` (`service_category_id`);

--
-- Indexes for table `driving_licenses`
--
ALTER TABLE `driving_licenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `driving_licenses_driver_id_foreign` (`driver_id`);

--
-- Indexes for table `emergency_contacts`
--
ALTER TABLE `emergency_contacts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `emergency_contacts_driver_id_foreign` (`driver_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `finances`
--
ALTER TABLE `finances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `finances_trip_id_foreign` (`trip_id`),
  ADD KEY `finances_customer_id_foreign` (`customer_id`),
  ADD KEY `finances_agent_id_foreign` (`agent_id`),
  ADD KEY `finances_driver_id_foreign` (`driver_id`),
  ADD KEY `finances_created_by_foreign` (`created_by`);

--
-- Indexes for table `incentives`
--
ALTER TABLE `incentives`
  ADD PRIMARY KEY (`id`),
  ADD KEY `incentives_driver_id_foreign` (`driver_id`),
  ADD KEY `incentives_agent_id_foreign` (`agent_id`),
  ADD KEY `incentives_created_by_foreign` (`created_by`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_unique` (`name`);

--
-- Indexes for table `service_categories`
--
ALTER TABLE `service_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `technology_info`
--
ALTER TABLE `technology_info`
  ADD PRIMARY KEY (`id`),
  ADD KEY `technology_info_driver_id_foreign` (`driver_id`);

--
-- Indexes for table `tourism_compliance`
--
ALTER TABLE `tourism_compliance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tourism_compliance_driver_id_foreign` (`driver_id`);

--
-- Indexes for table `trips`
--
ALTER TABLE `trips`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trips_driver_id_foreign` (`driver_id`),
  ADD KEY `trips_customer_id_foreign` (`customer_id`),
  ADD KEY `trips_agent_id_foreign` (`agent_id`),
  ADD KEY `trips_trip_assigned_by_foreign` (`trip_assigned_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_role_id_foreign` (`role_id`),
  ADD KEY `users_driver_id_foreign` (`driver_id`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vehicles_driver_id_foreign` (`driver_id`);

--
-- Indexes for table `vehicle_documents`
--
ALTER TABLE `vehicle_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vehicle_documents_vehicle_id_foreign` (`vehicle_id`);

--
-- Indexes for table `vehicle_features`
--
ALTER TABLE `vehicle_features`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_vehicle_features_vehicle` (`vehicle_id`);

--
-- Indexes for table `vehicle_pictures`
--
ALTER TABLE `vehicle_pictures`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vehicle_pictures_vehicle_id_foreign` (`vehicle_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_verifications`
--
ALTER TABLE `admin_verifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `agents`
--
ALTER TABLE `agents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `bank_details`
--
ALTER TABLE `bank_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `customer_surveys`
--
ALTER TABLE `customer_surveys`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `drivers`
--
ALTER TABLE `drivers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `driver_availability`
--
ALTER TABLE `driver_availability`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `driver_documents`
--
ALTER TABLE `driver_documents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `driver_languages`
--
ALTER TABLE `driver_languages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `driver_service_categories`
--
ALTER TABLE `driver_service_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `driving_licenses`
--
ALTER TABLE `driving_licenses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `emergency_contacts`
--
ALTER TABLE `emergency_contacts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `finances`
--
ALTER TABLE `finances`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `incentives`
--
ALTER TABLE `incentives`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `service_categories`
--
ALTER TABLE `service_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `technology_info`
--
ALTER TABLE `technology_info`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tourism_compliance`
--
ALTER TABLE `tourism_compliance`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `trips`
--
ALTER TABLE `trips`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `vehicle_documents`
--
ALTER TABLE `vehicle_documents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `vehicle_features`
--
ALTER TABLE `vehicle_features`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `vehicle_pictures`
--
ALTER TABLE `vehicle_pictures`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_verifications`
--
ALTER TABLE `admin_verifications`
  ADD CONSTRAINT `admin_verifications_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `agents`
--
ALTER TABLE `agents`
  ADD CONSTRAINT `agents_currency_updated_by_foreign` FOREIGN KEY (`currency_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `agents_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `bank_details`
--
ALTER TABLE `bank_details`
  ADD CONSTRAINT `bank_details_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `customers_agent_id_foreign` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `customers_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `customer_surveys`
--
ALTER TABLE `customer_surveys`
  ADD CONSTRAINT `customer_surveys_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `customer_surveys_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `customer_surveys_trip_id_foreign` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `driver_availability`
--
ALTER TABLE `driver_availability`
  ADD CONSTRAINT `driver_availability_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `driver_documents`
--
ALTER TABLE `driver_documents`
  ADD CONSTRAINT `driver_documents_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `driver_languages`
--
ALTER TABLE `driver_languages`
  ADD CONSTRAINT `driver_languages_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `driver_service_categories`
--
ALTER TABLE `driver_service_categories`
  ADD CONSTRAINT `driver_service_categories_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `driver_service_categories_service_category_id_foreign` FOREIGN KEY (`service_category_id`) REFERENCES `service_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `driving_licenses`
--
ALTER TABLE `driving_licenses`
  ADD CONSTRAINT `driving_licenses_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `emergency_contacts`
--
ALTER TABLE `emergency_contacts`
  ADD CONSTRAINT `emergency_contacts_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `finances`
--
ALTER TABLE `finances`
  ADD CONSTRAINT `finances_agent_id_foreign` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `finances_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `finances_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `finances_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `finances_trip_id_foreign` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `incentives`
--
ALTER TABLE `incentives`
  ADD CONSTRAINT `incentives_agent_id_foreign` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `incentives_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `incentives_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `technology_info`
--
ALTER TABLE `technology_info`
  ADD CONSTRAINT `technology_info_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tourism_compliance`
--
ALTER TABLE `tourism_compliance`
  ADD CONSTRAINT `tourism_compliance_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trips`
--
ALTER TABLE `trips`
  ADD CONSTRAINT `trips_agent_id_foreign` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trips_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trips_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trips_trip_assigned_by_foreign` FOREIGN KEY (`trip_assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `users_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD CONSTRAINT `vehicles_driver_id_foreign` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `vehicle_documents`
--
ALTER TABLE `vehicle_documents`
  ADD CONSTRAINT `vehicle_documents_vehicle_id_foreign` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `vehicle_features`
--
ALTER TABLE `vehicle_features`
  ADD CONSTRAINT `fk_vehicle_features_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `vehicle_pictures`
--
ALTER TABLE `vehicle_pictures`
  ADD CONSTRAINT `vehicle_pictures_vehicle_id_foreign` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
