-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: mysql
-- Generation Time: Feb 28, 2026 at 04:55 PM
-- Server version: 9.5.0
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `Check_activities`
--

-- --------------------------------------------------------

--
-- Table structure for table `department`
--

CREATE TABLE `department` (
  `department_id` int NOT NULL,
  `department_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `department`
--

INSERT INTO `department` (`department_id`, `department_name`) VALUES
(2, 'เทคโนโลยีธุรกิจดิจิทัล'),
(1, 'เทคโนโลยีสารสนเทศ');

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `role_id` int NOT NULL,
  `role_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`role_id`, `role_name`) VALUES
(1, 'student'),
(2, 'teacher'),
(3, 'admin');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` varchar(20) NOT NULL,
  `user_rfid` varchar(255) DEFAULT NULL,
  `user_prefix` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `user_group_code` varchar(255) DEFAULT NULL,
  `user_group_name` varchar(255) DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `role_id` int NOT NULL,
  `admin_user` varchar(255) DEFAULT NULL,
  `admin_password` varchar(255) DEFAULT NULL,
  `admin_super` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `user_rfid`, `user_prefix`, `first_name`, `last_name`, `user_group_code`, `user_group_name`, `department_id`, `role_id`, `admin_user`, `admin_password`, `admin_super`) VALUES
('67219010001', NULL, 'นาย', 'วชิรวิทย์', 'หอมคำ', NULL, NULL, 1, 1, NULL, NULL, 0),
('67219010002', NULL, 'นาย', 'ทินกฤต', 'บุษบงก์', NULL, NULL, 1, 1, NULL, NULL, 0),
('67219010010', NULL, 'นาย', 'วีระกิตต์', 'ศรีภิรมย์', NULL, NULL, 1, 1, NULL, NULL, 0),
('67219010013', NULL, 'นาย', 'พงศ์วรา', 'ยะมา', NULL, NULL, 1, 1, NULL, NULL, 0),
('67219100013', NULL, 'นางสาว', 'นรมน', 'บุญสมเชื้อ', NULL, NULL, 2, 1, NULL, NULL, 0),
('admin_1772292038699', NULL, NULL, 'pla', 'molk', NULL, NULL, NULL, 3, 'ยอด', '$2b$10$t3B/V7W0JQYs64kxGyNtLuHi0PmyXaLX5KBV.20QVRkWeH9YHYewO', 0),
('super_admin', NULL, NULL, 'veerakit', 'Sriphirom', NULL, NULL, NULL, 3, 'plamolk', '$2b$10$xRecSsOCe3fFMxbj11KzDu1JhnxEvuqN7HW9bPFcQ15PniiRmPXAi', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `department`
--
ALTER TABLE `department`
  ADD PRIMARY KEY (`department_id`),
  ADD UNIQUE KEY `department_name` (`department_name`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `admin_user` (`admin_user`),
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `department`
--
ALTER TABLE `department`
  MODIFY `department_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `role_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
