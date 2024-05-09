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
companyDescription VARCHAR(255) NOT NULL,
address VARCHAR(255) NOT NULL,
phonenumber INT NOT NULL,
email VARCHAR(255) NOT NULL,
numberOfEmployees INT NOT NULL,
cvrNumber INT NOT NULL
);

CREATE TABLE jobtypes(
id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
name VARCHAR(255) NOT NULL,
companyID INT NOT NULL,
FOREIGN KEY (companyID) REFERENCES companys(id) ON DELETE CASCADE
);

CREATE TABLE JobPostings(
id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
title VARCHAR(255) NOT NULL,
DESCRIPTION VARCHAR(255) NOT NULL,
deadline DATE NOT NULL,
jobtype VARCHAR(255) NOT NULL,
companyID INT NOT NULL,
phonenumber INT NOT NULL,
email VARCHAR(255) NOT NULL,
FOREIGN KEY (companyID) REFERENCES companys(id) ON DELETE CASCADE
);
