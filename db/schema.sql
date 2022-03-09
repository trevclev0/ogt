



-- ---
-- Globals
-- ---

-- SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
-- SET FOREIGN_KEY_CHECKS=0;

-- ---
-- Table 'user_info'
-- Contains information for all users (users, therapists, and admins)
-- ---

DROP TABLE IF EXISTS `user_info`;
    
CREATE TABLE `user_info` (
  `user_id` MEDIUMINT(7) NOT NULL AUTO_INCREMENT,
  `user_first_name` VARCHAR(30) NOT NULL,
  `user_last_name` VARCHAR(30) NOT NULL,
  `user_email` VARCHAR(50) NOT NULL,
  `user_profile_picture` VARCHAR(250) NOT NULL DEFAULT 'profileImages/default.png',
  `user_type` VARCHAR(15) NOT NULL DEFAULT 'User',
  `user_bio` VARCHAR(511) NOT NULL DEFAULT 'No bio here yet!',
  `user_username` VARCHAR(63) NOT NULL,
  `user_password` VARCHAR(512) NULL DEFAULT NULL,
  `user_login_provider` VARCHAR(20) NOT NULL DEFAULT 'Local',
  `user_status` VARCHAR(10) NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY (`user_username`)
) COMMENT 'Contains information for all users (users, therapists, and a';

-- ---
-- Table 'classes'
-- 
-- ---

DROP TABLE IF EXISTS `classes`;
    
CREATE TABLE `classes` (
  `class_id` SMALLINT(5) NOT NULL AUTO_INCREMENT,
  `therapist_id` MEDIUMINT(7) NOT NULL,
  `class_name` VARCHAR(50) NOT NULL,
  `class_size` TINYINT(3) NOT NULL,
  `class_start_date` DATE NOT NULL,
  `class_end_date` DATE NOT NULL,
  `class_status` VARCHAR(10) NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`class_id`),
KEY (`therapist_id`),
  UNIQUE KEY (`class_name`)
);

-- ---
-- Table 'class_media_list'
-- This allows the therapist to upload media without having it associated with a class and also to associate the same media with multiple classes
-- ---

DROP TABLE IF EXISTS `class_media_list`;
    
CREATE TABLE `class_media_list` (
  `class_media_id` INT(10) NOT NULL AUTO_INCREMENT,
  `class_session_id` TINYINT(8) NOT NULL,
  `media_id` INT(10) NOT NULL,
  PRIMARY KEY (`class_media_id`),
KEY (`class_session_id`),
KEY (`media_id`)
) COMMENT 'This allows the therapist to upload media without having it ';

-- ---
-- Table 'user_billing'
-- 
-- ---

DROP TABLE IF EXISTS `user_billing`;
    
CREATE TABLE `user_billing` (
  `billing_id` TINYINT(7) NOT NULL AUTO_INCREMENT,
  `user_id` MEDIUMINT(7) NOT NULL,
  `billing_cc` VARCHAR(16) NOT NULL,
  `billing_cc_exp` DATE NOT NULL,
  `billing_cc_type` VARCHAR(20) NOT NULL,
  `billing_status` VARCHAR(10) NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`billing_id`)
);

-- ---
-- Table 'user_addrs'
-- 
-- ---

DROP TABLE IF EXISTS `user_addrs`;
    
CREATE TABLE `user_addrs` (
  `user_addr_id` MEDIUMINT(7) NOT NULL AUTO_INCREMENT,
  `user_id` MEDIUMINT(7) NOT NULL,
  `user_addr_street` VARCHAR(50) NOT NULL,
  `user_addr_city` VARCHAR(30) NOT NULL,
  `user_addr_state` VARCHAR(20) NOT NULL,
  `user_addr_zip` MEDIUMINT(10) NOT NULL,
  `user_addr_is_billing` bit NOT NULL DEFAULT 1,
  `user_addr_status` VARCHAR(10) NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`user_addr_id`)
);

-- ---
-- Table 'class_registration'
-- 
-- ---

DROP TABLE IF EXISTS `class_registration`;
    
CREATE TABLE `class_registration` (
  `reg_id` SMALLINT(10) NOT NULL AUTO_INCREMENT,
  `class_id` SMALLINT(5) NOT NULL,
  `user_id` MEDIUMINT(7) NOT NULL,
  `reg_date` DATE NOT NULL,
  PRIMARY KEY (`reg_id`),
KEY (`class_id`),
KEY (`user_id`)
);

-- ---
-- Table 'class_media'
-- 
-- ---

DROP TABLE IF EXISTS `class_media`;
    
CREATE TABLE `class_media` (
  `media_id` INT(10) NOT NULL AUTO_INCREMENT,
  `media_name` VARCHAR(50) NOT NULL,
  `media_path` VARCHAR(250) NOT NULL,
  `media_length` TINYINT(4) NOT NULL,
  `media_status` VARCHAR(10) NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`media_id`)
);

-- ---
-- Table 'questions'
-- 
-- ---

DROP TABLE IF EXISTS `questions`;
    
CREATE TABLE `questions` (
  `question_id` INT(15) NOT NULL AUTO_INCREMENT,
  `question_text` VARCHAR(255) NOT NULL,
  `question_type` VARCHAR(20) NOT NULL,
  `question_during_class` bit(1) NOT NULL DEFAULT 1,
  `question_status` VARCHAR(10) NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`question_id`),
  UNIQUE KEY (`question_text`, `question_type`)
);

-- ---
-- Table 'multiple_choice_potential_answers'
-- 
-- ---

DROP TABLE IF EXISTS `multiple_choice_potential_answers`;
    
CREATE TABLE `multiple_choice_potential_answers` (
  `potential_answer_id` MEDIUMINT(7) NOT NULL AUTO_INCREMENT,
  `potential_answer_response` MEDIUMTEXT NOT NULL COMMENT 'Pre-determined answers available for polls',
  `potential_answer_status` VARCHAR(10) NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`potential_answer_id`)
);

-- ---
-- Table 'questions_given_during_class_list'
-- Stores the questions that were asked during a given class
-- ---

DROP TABLE IF EXISTS `questions_given_during_class_list`;
    
CREATE TABLE `questions_given_during_class_list` (
  `question_class_id` SMALLINT(5) NOT NULL AUTO_INCREMENT,
  `question_id` INT(15) NOT NULL,
  `class_session_id` TINYINT(8) NOT NULL,
  PRIMARY KEY (`question_class_id`),
KEY (`question_id`),
KEY (`class_session_id`)
) COMMENT 'Stores the questions that were asked during a given class';

-- ---
-- Table 'user_during_class_question_answers'
-- 
-- ---

DROP TABLE IF EXISTS `user_during_class_question_answers`;
    
CREATE TABLE `user_during_class_question_answers` (
  `user_class_question_answer_id` MEDIUMINT(7) NOT NULL AUTO_INCREMENT,
  `user_id` MEDIUMINT(7) NOT NULL,
  `question_class_id` SMALLINT(5) NOT NULL,
  `user_answer_id` MEDIUMINT(7) NOT NULL,
  PRIMARY KEY (`user_class_question_answer_id`),
KEY (`question_class_id`),
KEY (`user_id`)
);

-- ---
-- Table 'user_survey_question_answers'
-- 
-- ---

DROP TABLE IF EXISTS `user_survey_question_answers`;
    
CREATE TABLE `user_survey_question_answers` (
  `user_survey_answer_id` MEDIUMINT(7) NOT NULL AUTO_INCREMENT,
  `user_id` MEDIUMINT(7) NOT NULL,
  `class_id` SMALLINT(5) NOT NULL,
  `question_id` INT(15) NOT NULL,
  `user_answer_id` MEDIUMINT(7) NOT NULL,
  PRIMARY KEY (`user_survey_answer_id`),
KEY (`class_id`),
KEY (`question_id`),
KEY (`user_id`)
);

-- ---
-- Table 'multiple_choice_question_answers_list'
-- 
-- ---

DROP TABLE IF EXISTS `multiple_choice_question_answers_list`;
    
CREATE TABLE `multiple_choice_question_answers_list` (
  `qa_id` MEDIUMINT(7) NOT NULL AUTO_INCREMENT,
  `question_id` INT(15) NOT NULL,
  `potential_answer_id` MEDIUMINT(7) NOT NULL,
  PRIMARY KEY (`qa_id`),
KEY (`question_id`),
KEY (`potential_answer_id`)
);

-- ---
-- Table 'surveys'
-- 
-- ---

DROP TABLE IF EXISTS `surveys`;
    
CREATE TABLE `surveys` (
  `survey_id` MEDIUMINT(7) NOT NULL AUTO_INCREMENT,
  `survey_name` VARCHAR(50) NOT NULL,
  `survey_status` VARCHAR(10) NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`survey_id`)
);

-- ---
-- Table 'survey_questions_list'
-- 
-- ---

DROP TABLE IF EXISTS `survey_questions_list`;
    
CREATE TABLE `survey_questions_list` (
  `question_list_id` MEDIUMINT(7) NOT NULL AUTO_INCREMENT,
  `survey_id` MEDIUMINT(7) NOT NULL,
  `question_id` INT(15) NOT NULL,
  PRIMARY KEY (`question_list_id`),
KEY (`survey_id`),
KEY (`question_id`)
);

-- ---
-- Table 'user_answers'
-- 
-- ---

DROP TABLE IF EXISTS `user_answers`;
    
CREATE TABLE `user_answers` (
  `user_answer_id` MEDIUMINT(7) NOT NULL AUTO_INCREMENT,
  `user_answer` MEDIUMTEXT NOT NULL,
  PRIMARY KEY (`user_answer_id`)
);

-- ---
-- Table 'class_sessions'
-- 
-- ---

DROP TABLE IF EXISTS `class_sessions`;
    
CREATE TABLE `class_sessions` (
  `class_session_id` TINYINT(8) NOT NULL AUTO_INCREMENT,
  `class_id` SMALLINT(5) NOT NULL,
  `class_session_name` VARCHAR(50) NOT NULL,
  `class_session_date` DATE NOT NULL,
  `class_session_time` TIME NOT NULL,
  `class_session_users_attended` TINYINT(3) NOT NULL DEFAULT 0,
  `class_session_status` VARCHAR(10) NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`class_session_id`),
KEY (`class_id`),
  UNIQUE KEY (`class_session_name`)
);

-- ---
-- Table 'class_survey_list'
-- 
-- ---

DROP TABLE IF EXISTS `class_survey_list`;
    
CREATE TABLE `class_survey_list` (
  `class_survey_id` TINYINT(5) NOT NULL AUTO_INCREMENT,
  `class_id` SMALLINT(5) NOT NULL,
  `survey_id` MEDIUMINT(7) NOT NULL,
  PRIMARY KEY (`class_survey_id`),
KEY (`class_id`),
KEY (`survey_id`)
);

-- ---
-- Foreign Keys 
-- ---

ALTER TABLE `classes` ADD FOREIGN KEY (therapist_id) REFERENCES `user_info` (`user_id`);
ALTER TABLE `class_media_list` ADD FOREIGN KEY (class_session_id) REFERENCES `class_sessions` (`class_session_id`);
ALTER TABLE `class_media_list` ADD FOREIGN KEY (media_id) REFERENCES `class_media` (`media_id`);
ALTER TABLE `user_billing` ADD FOREIGN KEY (user_id) REFERENCES `user_info` (`user_id`);
ALTER TABLE `user_addrs` ADD FOREIGN KEY (user_id) REFERENCES `user_info` (`user_id`);
ALTER TABLE `class_registration` ADD FOREIGN KEY (class_id) REFERENCES `classes` (`class_id`);
ALTER TABLE `class_registration` ADD FOREIGN KEY (user_id) REFERENCES `user_info` (`user_id`);
ALTER TABLE `questions_given_during_class_list` ADD FOREIGN KEY (question_id) REFERENCES `questions` (`question_id`);
ALTER TABLE `questions_given_during_class_list` ADD FOREIGN KEY (class_session_id) REFERENCES `class_sessions` (`class_session_id`);
ALTER TABLE `user_during_class_question_answers` ADD FOREIGN KEY (user_id) REFERENCES `user_info` (`user_id`);
ALTER TABLE `user_during_class_question_answers` ADD FOREIGN KEY (question_class_id) REFERENCES `questions_given_during_class_list` (`question_class_id`);
ALTER TABLE `user_during_class_question_answers` ADD FOREIGN KEY (user_answer_id) REFERENCES `user_answers` (`user_answer_id`);
ALTER TABLE `user_survey_question_answers` ADD FOREIGN KEY (user_id) REFERENCES `user_info` (`user_id`);
ALTER TABLE `user_survey_question_answers` ADD FOREIGN KEY (class_id) REFERENCES `classes` (`class_id`);
ALTER TABLE `user_survey_question_answers` ADD FOREIGN KEY (question_id) REFERENCES `questions` (`question_id`);
ALTER TABLE `user_survey_question_answers` ADD FOREIGN KEY (user_answer_id) REFERENCES `user_answers` (`user_answer_id`);
ALTER TABLE `multiple_choice_question_answers_list` ADD FOREIGN KEY (question_id) REFERENCES `questions` (`question_id`);
ALTER TABLE `multiple_choice_question_answers_list` ADD FOREIGN KEY (potential_answer_id) REFERENCES `multiple_choice_potential_answers` (`potential_answer_id`);
ALTER TABLE `survey_questions_list` ADD FOREIGN KEY (survey_id) REFERENCES `surveys` (`survey_id`);
ALTER TABLE `survey_questions_list` ADD FOREIGN KEY (question_id) REFERENCES `questions` (`question_id`);
ALTER TABLE `class_sessions` ADD FOREIGN KEY (class_id) REFERENCES `classes` (`class_id`);
ALTER TABLE `class_survey_list` ADD FOREIGN KEY (class_id) REFERENCES `classes` (`class_id`);
ALTER TABLE `class_survey_list` ADD FOREIGN KEY (survey_id) REFERENCES `surveys` (`survey_id`);

-- ---
-- Table Properties
-- ---

-- ALTER TABLE `user_info` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `classes` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `class_media_list` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `user_billing` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `user_addrs` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `class_registration` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `class_media` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `questions` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `multiple_choice_potential_answers` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `questions_given_during_class_list` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `user_during_class_question_answers` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `user_survey_question_answers` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `multiple_choice_question_answers_list` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `surveys` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `survey_questions_list` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `user_answers` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `class_sessions` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `class_survey_list` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ---
-- Test Data
-- ---

-- INSERT INTO `user_info` (`user_id`,`user_first_name`,`user_last_name`,`user_email`,`user_profile_picture`,`user_type`,`user_bio`,`user_username`,`user_password`,`user_login_provider`,`user_status`) VALUES
-- ('','','','','','','','','','','');
-- INSERT INTO `classes` (`class_id`,`therapist_id`,`class_name`,`class_size`,`class_start_date`,`class_end_date`,`class_status`) VALUES
-- ('','','','','','','');
-- INSERT INTO `class_media_list` (`class_media_id`,`class_session_id`,`media_id`) VALUES
-- ('','','');
-- INSERT INTO `user_billing` (`billing_id`,`user_id`,`billing_cc`,`billing_cc_exp`,`billing_cc_type`,`billing_status`) VALUES
-- ('','','','','','');
-- INSERT INTO `user_addrs` (`user_addr_id`,`user_id`,`user_addr_street`,`user_addr_city`,`user_addr_state`,`user_addr_zip`,`user_addr_is_billing`,`user_addr_status`) VALUES
-- ('','','','','','','','');
-- INSERT INTO `class_registration` (`reg_id`,`class_id`,`user_id`,`reg_date`) VALUES
-- ('','','','');
-- INSERT INTO `class_media` (`media_id`,`media_name`,`media_path`,`media_length`,`media_status`) VALUES
-- ('','','','','');
-- INSERT INTO `questions` (`question_id`,`question_text`,`question_type`,`question_during_class`,`question_status`) VALUES
-- ('','','','','');
-- INSERT INTO `multiple_choice_potential_answers` (`potential_answer_id`,`potential_answer_response`,`potential_answer_status`) VALUES
-- ('','','');
-- INSERT INTO `questions_given_during_class_list` (`question_class_id`,`question_id`,`class_session_id`) VALUES
-- ('','','');
-- INSERT INTO `user_during_class_question_answers` (`user_class_question_answer_id`,`user_id`,`question_class_id`,`user_answer_id`) VALUES
-- ('','','','');
-- INSERT INTO `user_survey_question_answers` (`user_survey_answer_id`,`user_id`,`class_id`,`question_id`,`user_answer_id`) VALUES
-- ('','','','','');
-- INSERT INTO `multiple_choice_question_answers_list` (`qa_id`,`question_id`,`potential_answer_id`) VALUES
-- ('','','');
-- INSERT INTO `surveys` (`survey_id`,`survey_name`,`survey_status`) VALUES
-- ('','','');
-- INSERT INTO `survey_questions_list` (`question_list_id`,`survey_id`,`question_id`) VALUES
-- ('','','');
-- INSERT INTO `user_answers` (`user_answer_id`,`user_answer`) VALUES
-- ('','');
-- INSERT INTO `class_sessions` (`class_session_id`,`class_id`,`class_session_name`,`class_session_date`,`class_session_time`,`class_session_users_attended`,`class_session_status`) VALUES
-- ('','','','','','','');
-- INSERT INTO `class_survey_list` (`class_survey_id`,`class_id`,`survey_id`) VALUES
-- ('','','');

