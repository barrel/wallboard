# ************************************************************
# Sequel Pro SQL dump
# Version 4096
#
# http://www.sequelpro.com/
# http://code.google.com/p/sequel-pro/
#
# Host: 127.0.0.1 (MySQL 5.6.10)
# Database: wallboard
# Generation Time: 2013-08-04 20:41:33 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table cleaning_days
# ------------------------------------------------------------

DROP TABLE IF EXISTS `cleaning_days`;

CREATE TABLE `cleaning_days` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `cleaning_days` WRITE;
/*!40000 ALTER TABLE `cleaning_days` DISABLE KEYS */;

INSERT INTO `cleaning_days` (`id`, `name`)
VALUES
	(1,'Monday'),
	(2,'Tuesday'),
	(3,'Wednesday'),
	(4,'Thursday'),
	(5,'Friday');

/*!40000 ALTER TABLE `cleaning_days` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table cleaning_meta
# ------------------------------------------------------------

DROP TABLE IF EXISTS `cleaning_meta`;

CREATE TABLE `cleaning_meta` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `cleaning_day_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `cleaning_meta` WRITE;
/*!40000 ALTER TABLE `cleaning_meta` DISABLE KEYS */;

INSERT INTO `cleaning_meta` (`id`, `user_id`, `cleaning_day_id`)
VALUES
	(11,3,5),
	(12,10,5),
	(13,27,5),
	(14,16,5),
	(15,26,5),
	(26,1,4),
	(27,9,4),
	(28,4,4),
	(29,7,4),
	(30,21,4),
	(37,18,3),
	(38,6,3),
	(39,14,3),
	(40,24,3),
	(51,20,2),
	(52,17,2),
	(53,2,2),
	(54,5,2),
	(55,28,2),
	(75,13,1),
	(76,8,1),
	(77,15,1),
	(78,25,1),
	(79,11,1);

/*!40000 ALTER TABLE `cleaning_meta` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table options
# ------------------------------------------------------------

DROP TABLE IF EXISTS `options`;

CREATE TABLE `options` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `content` varchar(255) DEFAULT NULL,
  `placeholder` varchar(255) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `options` WRITE;
/*!40000 ALTER TABLE `options` DISABLE KEYS */;

INSERT INTO `options` (`id`, `name`, `content`, `placeholder`, `label`)
VALUES
	(1,'ticker_rss_url','http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml','http://example.com/feed','News RSS Feed'),
	(2,'calendar_feed_url','http://www.google.com/calendar/feeds/calendar%40barrelny.com/public/basic','http://calendar.com/feed','Main Calendar Feed'),
	(3,'holidays_feed_url','http://www.google.com/calendar/feeds/barrelny.com_bkmdjn1jrs5ffrf0nul4o7levk%40group.calendar.google.com/public/basic','http://holidays.com/feed','Holidays Calendar Feed'),
	(4,'events_feed_url','http://www.google.com/calendar/feeds/barrelny.com_9lfb4ben8gbuu5feudvjfepro0%40group.calendar.google.com/public/full','http://events.com/feed','Events Calendar Feed');

/*!40000 ALTER TABLE `options` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table photos
# ------------------------------------------------------------

DROP TABLE IF EXISTS `photos`;

CREATE TABLE `photos` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `image_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `photos` WRITE;
/*!40000 ALTER TABLE `photos` DISABLE KEYS */;

INSERT INTO `photos` (`id`, `image_url`)
VALUES
	(10,'1374858989_c20a-1374858989.jpg'),
	(11,'1374859296_c74d-1374859296.jpg'),
	(12,'1374859406_2665-1374859406.jpg'),
	(13,'1374859429_d2dd-1374859429.jpg'),
	(17,'1374860769_2a38-1374860769.jpg'),
	(19,'1374861061_f4b9-1374861061.jpg'),
	(20,'1374861136_3769-1374861136.jpg'),
	(21,'1374861446_9bf3-1374861446.jpg'),
	(22,'1374861450_92cc-1374861450.jpg'),
	(23,'1374861453_fc49-1374861453.jpg'),
	(24,'1374861456_e369-1374861456.jpg'),
	(25,'1374861460_6364-1374861460.jpg'),
	(26,'1375377575_b53b-1375377575.jpg'),
	(27,'1375377580_5422-1375377580.jpg'),
	(28,'1375377584_f717-1375377584.jpg'),
	(29,'1375377589_e369-1375377589.jpg'),
	(30,'1375377592_8f14-1375377592.jpg'),
	(31,'1375377595_28dd-1375377595.jpg'),
	(32,'1375377598_fc49-1375377598.jpg');

/*!40000 ALTER TABLE `photos` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(128) DEFAULT NULL,
  `department` varchar(128) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;

INSERT INTO `users` (`id`, `name`, `department`, `image_url`)
VALUES
	(1,'Andrea Horne','design','team_andrea.jpg'),
	(2,'Angel Ng','design','team_angel.jpg'),
	(3,'Aretha Choi','production','team_aretha.jpg'),
	(4,'Boram Kim','operations','team_boram.jpg'),
	(5,'Marianne Do','development','team_marianne.jpg'),
	(6,'Wesley Tuner-Harris','development','team_wesley.jpg'),
	(7,'Diane Wang','production','team_diane.jpg'),
	(8,'Molly Sugar','design','team_molly.jpg'),
	(9,'Betty Chan','production','team_betty.jpg'),
	(10,'Jessie Frazelle','development','team_jessica.jpg'),
	(11,'Sylvia Gacek','web ops','team_sylvia.jpg'),
	(12,'Isha Kasliwal','development',NULL),
	(13,'Jan Cantor','design','team_jan.jpg'),
	(14,'Patrick Kunka','development','team_patrick.jpg'),
	(15,'Sei-Wook Kim','development','team_seiwook.jpg'),
	(16,'Peter Kang','design','team_peter.jpg'),
	(17,'Kevin Kneifel','development','team_kevink.jpg'),
	(18,'Kevin Green','development','team_keving.jpg'),
	(20,'Angela Hum','wep ops','team_angela.jpg'),
	(21,'Jane Song','design','team_jane.jpg'),
	(22,'Cindy Leong','design',NULL),
	(23,'Linda Kong','operations',NULL),
	(24,'Yvonne Weng','design','team_yvonne.jpg'),
	(25,'Zack Lerner','web ops','team_zack.jpg'),
	(26,'Scott Polhemus','development','team_scott.jpg'),
	(27,'Lee Khleang','production','team_lee.jpg'),
	(28,'Matthew Ortega','design','team_matthew.jpg');

/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
