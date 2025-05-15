-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 10, 2025 at 07:29 AM
-- Server version: 8.0.40
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `alfatihah`
--

-- --------------------------------------------------------

--
-- Table structure for table `banks`
--

CREATE TABLE `banks` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `account_holder` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `donasis`
--

CREATE TABLE `donasis` (
  `id` int NOT NULL,
  `donatur_id` int NOT NULL,
  `program_id` int NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `donation_date` date NOT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `donaturs`
--

CREATE TABLE `donaturs` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ocr`
--

CREATE TABLE `ocr` (
  `id` int NOT NULL,
  `transaction_id` int DEFAULT NULL,
  `donasi_id` int DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `extracted_text` text,
  `processed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `programs`
--

CREATE TABLE `programs` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `target_amount` decimal(15,2) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transaksis`
--

CREATE TABLE `transaksis` (
  `id` int NOT NULL,
  `donatur_id` int NOT NULL,
  `program_id` int NOT NULL,
  `bank_id` int DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `transaction_date` date NOT NULL,
  `status` enum('pending','completed','failed') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trusted_devices`
--

CREATE TABLE `trusted_devices` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `device_token` varchar(255) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trusted_devices`
--

INSERT INTO `trusted_devices` (`id`, `user_id`, `device_token`, `ip_address`, `user_agent`, `expires_at`, `created_at`) VALUES
(2, 1, '9ce0b4b4e43e8963d47c3e717813f0ac8c6051cb3d56af4638b322d4e840b334', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-04-07 14:43:27', '2025-03-31 14:43:27'),
(3, 1, '37b0acc07c2df92da00d9b52d8fca09984bffbfea018445b5155cd229027eef3', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-04-07 14:56:10', '2025-03-31 14:56:10'),
(4, 2, '2b469f588e378a64eddd8a6a0e546a041269558f6418e96a7ee70ad92a42ecc0', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-10 12:56:44', '2025-04-03 12:56:44'),
(5, 2, '0b96cb872402c1b84aaf7d0ccafc3dba67c0ac951a1915adb6e5759ed58929c6', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-10 13:00:30', '2025-04-03 13:00:29'),
(6, 2, '13a79138cc5ed1ef38820848e4debbf26467a15b472c66503bd0ce694ec59515', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-10 13:40:09', '2025-04-03 13:40:09'),
(7, 2, '36101064cea9776dc397bd4c1a0443ef12ebdbe7091f462ac88a0e8862df9ee1', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-10 13:40:40', '2025-04-03 13:40:40'),
(8, 2, 'c173df60d7ce2f7c27edeedcb1a172bd4a935265d07ab59a2f30576bfea5f171', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-10 14:09:30', '2025-04-03 14:09:29'),
(9, 2, '0672c35c045bbd11b9f87214ebbc8df6e214523caf6758caed73d6aaaa2713e7', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-10 14:12:47', '2025-04-03 14:12:46'),
(10, 2, '8241d78f126ba45539c7600e819257f8e587728e9a4a3b89d0ae7717198a19ea', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-10 14:26:26', '2025-04-03 14:26:26'),
(11, 2, 'ab1a2c3799a44159e05ca1bac00492ac3738c671da91d9c423d960e85ad327d2', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-10 14:42:59', '2025-04-03 14:42:59'),
(12, 2, 'da4a0764a5afc7a8134fb96ae7fb43118b87e2cd620ca937dbe493fa32a66fde', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-10 14:54:01', '2025-04-03 14:54:01'),
(13, 2, '81127347045242cb5c7e245fe6ec19bab88efbe3620577af53d7beeb7ef9d5c5', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-10 15:04:02', '2025-04-03 15:04:02'),
(14, 2, '9976e02ea9436a948d68a81ab55539e3c698af4f7134b6cf20c9a56b7b8cf097', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-10 15:36:36', '2025-04-03 15:36:36'),
(15, 2, 'bb4824428ebda59d2e164b04dc4d94b4f7cd7247fc49886d66de1ccdd08223c3', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-10 15:43:44', '2025-04-03 15:43:43'),
(16, 2, '16f74e5b4ef25db379ccd40212ecad5a9310ebdab359555a972d96b167642c9a', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-10 15:50:51', '2025-04-03 15:50:50'),
(17, 2, '7c303f43fe9c51269c04b8f0c2cf49a12238e8038d95d9d29b0026561bc8384f', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-10 15:52:43', '2025-04-03 15:52:43'),
(18, 2, '844891274daecb644875acedb2d73bbec3fe9cb9959a7a9adc327ba417ac4c03', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-10 16:01:50', '2025-04-03 16:01:49'),
(19, 2, 'cb517758351aac920af0ef14860d9d86f5f632204c0d002b7d7aa1ded6600ed0', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-10 16:14:01', '2025-04-03 16:14:01'),
(20, 2, '2aaf78d139e9dbde0ac3e964600f6f20de7bfe7ed5a6e074ca68119bb379db8b', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-10 16:25:16', '2025-04-03 16:25:15'),
(21, 2, '97c22b86f0145514c20e578ae593b0b3db8a9ade4bff642c0bf44ab3207813dc', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-10 16:52:44', '2025-04-03 16:52:43'),
(22, 2, '36b57ad87903607168556b797b1d94f0956983874d616a9a20e2e2db40a416bf', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-10 17:01:06', '2025-04-03 17:01:05'),
(23, 2, '4bb046c1cf520a6c83ee51c6b5e4c5d92078b0e210e2cd7c0fcf06cd62926efb', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-13 07:59:37', '2025-04-06 07:59:36'),
(24, 2, '4d3b3085321a624029b949e15e4bb30f41725cf515a8b11093a9eb6d324d3c4c', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-13 13:26:56', '2025-04-06 13:26:56'),
(25, 2, '5fcd32f0933e12bbff88d2a3db89587a544ab0ea2a7018d95600a5046184eb2f', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-13 14:03:32', '2025-04-06 14:03:32'),
(26, 2, 'adbed996b544a6310112160a3aff40678cc8d153c6c4d57cd7f55b0afbd75b09', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', '2025-04-13 14:12:42', '2025-04-06 14:12:41');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `target_horizon` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `role` varchar(50) DEFAULT NULL,
  `secret_key` varchar(255) DEFAULT NULL,
  `temp_otp` varchar(6) DEFAULT NULL,
  `temp_otp_expiry` timestamp NULL DEFAULT NULL,
  `totp_secret` varchar(255) DEFAULT NULL,
  `two_fa_enabled` tinyint(1) DEFAULT '0',
  `backup_codes` text,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `failed_login_attempts` int DEFAULT '0',
  `locked_until` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `approved` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `remember_token`, `target_horizon`, `created_at`, `updated_at`, `role`, `secret_key`, `temp_otp`, `temp_otp_expiry`, `totp_secret`, `two_fa_enabled`, `backup_codes`, `last_login_at`, `failed_login_attempts`, `locked_until`, `is_active`, `approved`) VALUES
(1, 'Super Admin', 'jedifuk@gmail.com', NULL, '$2b$10$9w8fifxwX/zk3iwLEW79Xuel4dj38YUZeK.W0W14AzvCg2j5kvGJ2', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJqZWRpZnVrQGdtYWlsLmNvbSIsImlhdCI6MTc0MzQzMjk3MCwiZXhwIjoxNzQzNDQwMTcwfQ.MrjXAoxQ6Mlbhg17g1jdpT2wqF7BX63j344TFqPmbcM', NULL, '2025-03-31 03:57:04', '2025-03-31 14:56:10', 'superadmin', NULL, NULL, NULL, NULL, 0, NULL, '2025-03-31 14:56:10', 0, NULL, 1, 1),
(2, 'Test User', 'jedifuk@yahoo.com', NULL, '$2b$10$9w8fifxwX/zk3iwLEW79Xuel4dj38YUZeK.W0W14AzvCg2j5kvGJ2', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJqZWRpZnVrQHlhaG9vLmNvbSIsImlhdCI6MTc0Mzk0OTAyNywiZXhwIjoxNzQzOTU2MjI3fQ.A52Fry-7PguTWXRlo5YZ8eQL8yLp_LTgM4_Y1Vgq4ak', NULL, '2025-04-01 06:51:41', '2025-04-06 14:17:07', 'user', NULL, NULL, NULL, NULL, 1, NULL, '2025-04-06 14:17:07', 0, NULL, 1, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `banks`
--
ALTER TABLE `banks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `donasis`
--
ALTER TABLE `donasis`
  ADD PRIMARY KEY (`id`),
  ADD KEY `donatur_id` (`donatur_id`),
  ADD KEY `program_id` (`program_id`);

--
-- Indexes for table `donaturs`
--
ALTER TABLE `donaturs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `ocr`
--
ALTER TABLE `ocr`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `donasi_id` (`donasi_id`);

--
-- Indexes for table `programs`
--
ALTER TABLE `programs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transaksis`
--
ALTER TABLE `transaksis`
  ADD PRIMARY KEY (`id`),
  ADD KEY `donatur_id` (`donatur_id`),
  ADD KEY `program_id` (`program_id`),
  ADD KEY `bank_id` (`bank_id`);

--
-- Indexes for table `trusted_devices`
--
ALTER TABLE `trusted_devices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `banks`
--
ALTER TABLE `banks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `donasis`
--
ALTER TABLE `donasis`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `donaturs`
--
ALTER TABLE `donaturs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ocr`
--
ALTER TABLE `ocr`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `programs`
--
ALTER TABLE `programs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transaksis`
--
ALTER TABLE `transaksis`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trusted_devices`
--
ALTER TABLE `trusted_devices`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `donasis`
--
ALTER TABLE `donasis`
  ADD CONSTRAINT `donasis_ibfk_1` FOREIGN KEY (`donatur_id`) REFERENCES `donaturs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `donasis_ibfk_2` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `donaturs`
--
ALTER TABLE `donaturs`
  ADD CONSTRAINT `donaturs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `ocr`
--
ALTER TABLE `ocr`
  ADD CONSTRAINT `ocr_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `transaksis` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `ocr_ibfk_2` FOREIGN KEY (`donasi_id`) REFERENCES `donasis` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `transaksis`
--
ALTER TABLE `transaksis`
  ADD CONSTRAINT `transaksis_ibfk_1` FOREIGN KEY (`donatur_id`) REFERENCES `donaturs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transaksis_ibfk_2` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transaksis_ibfk_3` FOREIGN KEY (`bank_id`) REFERENCES `banks` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `trusted_devices`
--
ALTER TABLE `trusted_devices`
  ADD CONSTRAINT `trusted_devices_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
