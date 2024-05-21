DROP DATABASE IF EXISTS Jobsite;

CREATE DATABASE Jobsite;

USE Jobsite;

CREATE TABLE users(
id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
fullName VARCHAR(255) NOT NULL,
password VARCHAR(255) NOT NULL,
email VARCHAR(255) NOT NULL,
phonenumber VARCHAR(255) NOT NULL,
isAdmin BOOL NOT NULL
);

CREATE TABLE bannedEmails(
id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
email VARCHAR(255) NOT NULL
);

CREATE TABLE companys(
id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
companyName VARCHAR(255) NOT NULL,
password VARCHAR(255) NOT NULL,
companyDescription LONGTEXT NOT NULL,
address VARCHAR(255) NOT NULL,
city VARCHAR(255) NOT NULL,
phonenumber INT NOT NULL,
email VARCHAR(255) NOT NULL,
numberOfEmployees INT NOT NULL,
cvrNumber INT NOT NULL,
jobtypes VARCHAR(255) NOT NULL,
jobpostingCount INT NOT NULL
);

CREATE TABLE jobpostings(
id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
title VARCHAR(255) NOT NULL,
DESCRIPTION LONGTEXT NOT NULL,
deadline DATE NOT NULL,
jobtype VARCHAR(255) NOT NULL,
companyID INT NOT NULL,
address VARCHAR(255) NOT NULL,
city VARCHAR(255) NOT NULL,
phonenumber INT NOT NULL,
email VARCHAR(255) NOT NULL,
salary INT NOT NULL,
FOREIGN KEY (companyID) REFERENCES companys(id) ON DELETE CASCADE
);

INSERT INTO users (fullName, PASSWORD, email, phonenumber, isAdmin) VALUES ("Admin", "$2a$10$tOsbPkE8CtDZWBrlSF3OZuieZGLcwQN5Iqd2pQB.uVd6x2i2fJpRe", "admin@admin.com", 20202020, 1);