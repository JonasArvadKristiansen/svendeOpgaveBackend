INSERT INTO users (fullName, password, email, phonenumber, isAdmin) VALUES
('John Doe', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'john.doe@example.com', '1234567890', FALSE),
('Jane Smith', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'jane.smith@example.com', '0987654321', FALSE),
('Alice Johnson', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'alice.johnson@example.com', '1122334455', FALSE),
('Bob Brown', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'bob.brown@example.com', '6677889900', FALSE);

INSERT INTO users (fullName, password, email, phonenumber, isAdmin) VALUES
('Charlie Black', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'charlie.black@example.com', '5566778899', FALSE),
('Dana White', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'dana.white@example.com', '3344556677', FALSE),
('Eve Green', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'eve.green@example.com', '2233445566', FALSE),
('Frank Blue', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'frank.blue@example.com', '9988776655', FALSE);

INSERT INTO users (fullName, password, email, phonenumber, isAdmin) VALUES
('Grace Adams', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'grace.adams@example.com', '5544332211', FALSE),
('Henry Baker', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'henry.baker@example.com', '6677889900', FALSE),
('Ivy Clark', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'ivy.clark@example.com', '9988776655', FALSE),
('Jack Davis', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'jack.davis@example.com', '7766554433', FALSE),
('Karen Evans', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'karen.evans@example.com', '1234567899', FALSE);

INSERT INTO users (fullName, password, email, phonenumber, isAdmin) VALUES
('Liam Wright', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'liam.wright@example.com', '1231231234', FALSE),
('Mia Turner', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'mia.turner@example.com', '2342342345', FALSE),
('Noah Hall', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'noah.hall@example.com', '3453453456', FALSE),
('Olivia Young', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'olivia.young@example.com', '4564564567', FALSE),
('Paul Walker', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'paul.walker@example.com', '5675675678', FALSE);


INSERT INTO bannedEmails (email) VALUES
('banned.email1@example.com'),
('banned.email2@example.com'),
('banned.email3@example.com');

INSERT INTO bannedEmails (email) VALUES
('banned.email4@example.com'),
('banned.email5@example.com'),
('banned.email6@example.com'),
('banned.email7@example.com');

INSERT INTO bannedEmails (email) VALUES
('banned.email8@example.com'),
('banned.email9@example.com'),
('banned.email10@example.com'),
('banned.email11@example.com'),
('banned.email12@example.com');

INSERT INTO bannedEmails (email) VALUES
('banned.email13@example.com'),
('banned.email14@example.com'),
('banned.email15@example.com'),
('banned.email16@example.com'),
('banned.email17@example.com');

INSERT INTO companys (companyName, password, description, address, city, phonenumber, email, numberOfEmployees, cvrNumber, jobtypes, jobpostingCount) VALUES
('Travel Experts', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'Expert travel planning and booking services.', '101 Travel St', 'Travel City', 555123456, 'contact@travelexperts.com', 50, 12309876, 'Travel, Hospitality', 5),
('Food Innovations', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'Innovative solutions for the food industry.', '202 Food Ave', 'Food City', 444654321, 'info@foodinnovations.com', 70, 45678909, 'Food, Technology', 6),
('Fashion Forward', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'Leading fashion trends and retail solutions.', '303 Fashion Blvd', 'Fashion City', 333789012, 'support@fashionforward.com', 90, 78901238, 'Fashion, Retail', 4);

INSERT INTO companys (companyName, password, description, address, city, phonenumber, email, numberOfEmployees, cvrNumber, jobtypes, jobpostingCount) VALUES
('Logistics Hub', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'Comprehensive logistics and supply chain solutions.', '123 Logistic St', 'Logistic City', 123987456, 'contact@logisticshub.com', 200, 67890123, 'Logistics, Supply Chain', 20),
('Cyber Security Inc.', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'Advanced cyber security solutions for businesses.', '456 Secure Ave', 'Secure City', 987321654, 'info@cybersecurityinc.com', 150, 78901234, 'Cyber Security, IT', 10),
('Marketing Wizards', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'Innovative marketing solutions for global brands.', '789 Market Blvd', 'Market City', 192837465, 'support@marketingwizards.com', 120, 89012345, 'Marketing, Advertising', 8);

INSERT INTO companys (companyName, password, description, address, city, phonenumber, email, numberOfEmployees, cvrNumber, jobtypes, jobpostingCount) VALUES
('FinTech Innovators', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'Financial technology solutions for the modern age.', '321 Fin St', 'Financeville', 123123123, 'contact@fintechinnovators.com', 100, 34567890, 'Finance, Technology', 7),
('Green Energy', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'Sustainable energy solutions for a better future.', '654 Green Blvd', 'Green City', 987987987, 'info@greenenergy.com', 120, 45678901, 'Energy, Environment', 12),
('Creative Studios', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'Leading creative agency for digital media.', '987 Creative Rd', 'Creativetown', 192192192, 'support@creativestudios.com', 80, 56789012, 'Media, Design', 8);

INSERT INTO companys (companyName, password, description, address, city, phonenumber, email, numberOfEmployees, cvrNumber, jobtypes, jobpostingCount) VALUES
('Tech Solutions', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'A leading tech company specializing in innovative solutions.', '123 Tech Street', 'Techville', 123456789, 'contact@techsolutions.com', 150, 12345678, 'IT, Software Development', 10),
('Health Corp', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'Healthcare company providing top-notch medical services.', '456 Health Ave', 'Healthcity', 987654321, 'info@healthcorp.com', 200, 87654321, 'Healthcare, Research', 15),
('Edu Innovators', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'Innovative education solutions for modern learning.', '789 Edu Road', 'Edutown', 192837465, 'support@eduinnovators.com', 50, 23456789, 'Education, E-learning', 5);

INSERT INTO jobpostings (title, description, deadline, jobtype, companyID, address, city, phonenumber, email, salary) VALUES
('Software Developer', 'Develop and maintain web applications.', '2024-12-31', 'Full-time', 1, '123 Tech Street', 'Techville', 123456789, 'hr@techsolutions.com', 60000),
('Medical Researcher', 'Conduct research and clinical trials.', '2024-11-30', 'Full-time', 2, '456 Health Ave', 'Healthcity', 987654321, 'jobs@healthcorp.com', 75000),
('E-learning Specialist', 'Develop and manage online courses.', '2024-10-31', 'Part-time', 3, '789 Edu Road', 'Edutown', 192837465, 'careers@eduinnovators.com', 40000);

INSERT INTO jobpostings (title, description, deadline, jobtype, companyID, address, city, phonenumber, email, salary) VALUES
('Financial Analyst', 'Analyze financial data and create reports.', '2024-09-30', 'Full-time', 4, '321 Fin St', 'Financeville', 123123123, 'hr@fintechinnovators.com', 65000),
('Sustainable Energy Engineer', 'Design and implement sustainable energy solutions.', '2024-08-31', 'Full-time', 5, '654 Green Blvd', 'Green City', 987987987, 'jobs@greenenergy.com', 70000),
('Digital Media Specialist', 'Develop digital media content and strategies.', '2024-07-31', 'Part-time', 6, '987 Creative Rd', 'Creativetown', 192192192, 'careers@creativestudios.com', 50000),
('Project Manager', 'Manage and oversee project development.', '2024-06-30', 'Full-time', 1, '123 Tech Street', 'Techville', 123456789, 'pm@techsolutions.com', 80000),
('Clinical Coordinator', 'Coordinate clinical research activities.', '2024-05-31', 'Full-time', 2, '456 Health Ave', 'Healthcity', 987654321, 'clinical@healthcorp.com', 72000),
('Instructional Designer', 'Design and develop instructional materials.', '2024-04-30', 'Full-time', 3, '789 Edu Road', 'Edutown', 192837465, 'id@eduinnovators.com', 60000);

INSERT INTO jobpostings (title, description, deadline, jobtype, companyID, address, city, phonenumber, email, salary) VALUES
('Logistics Coordinator', 'Coordinate logistics and supply chain operations.', '2024-11-15', 'Full-time', 7, '123 Logistic St', 'Logistic City', 123987456, 'hr@logisticshub.com', 55000),
('Cyber Security Analyst', 'Analyze and mitigate cyber threats.', '2024-10-20', 'Full-time', 8, '456 Secure Ave', 'Secure City', 987321654, 'jobs@cybersecurityinc.com', 70000),
('Marketing Strategist', 'Develop and implement marketing strategies.', '2024-09-25', 'Part-time', 9, '789 Market Blvd', 'Market City', 192837465, 'careers@marketingwizards.com', 60000),
('Product Manager', 'Oversee product development and marketing.', '2024-08-30', 'Full-time', 4, '321 Fin St', 'Financeville', 123123123, 'pm@fintechinnovators.com', 85000),
('Renewable Energy Consultant', 'Advise on renewable energy projects.', '2024-07-31', 'Full-time', 5, '654 Green Blvd', 'Green City', 987987987, 'consult@greenenergy.com', 75000),
('Graphic Designer', 'Create visual concepts and designs.', '2024-06-30', 'Part-time', 6, '987 Creative Rd', 'Creativetown', 192192192, 'graphics@creativestudios.com', 45000);

INSERT INTO jobpostings (title, description, deadline, jobtype, companyID, address, city, phonenumber, email, salary) VALUES
('Travel Consultant', 'Plan and book travel for clients.', '2024-05-31', 'Full-time', 10, '101 Travel St', 'Travel City', 555123456, 'jobs@travelexperts.com', 45000),
('Food Technologist', 'Develop new food products and technologies.', '2024-04-30', 'Full-time', 11, '202 Food Ave', 'Food City', 444654321, 'careers@foodinnovations.com', 55000),
('Fashion Designer', 'Design and create new fashion lines.', '2024-03-31', 'Part-time', 12, '303 Fashion Blvd', 'Fashion City', 333789012, 'design@fashionforward.com', 40000),
('Supply Chain Manager', 'Manage and optimize supply chain operations.', '2024-02-29', 'Full-time', 7, '123 Logistic St', 'Logistic City', 123987456, 'hr@logisticshub.com', 65000),
('IT Security Specialist', 'Protect company data and IT systems.', '2024-01-31', 'Full-time', 8, '456 Secure Ave', 'Secure City', 987321654, 'jobs@cybersecurityinc.com', 75000),
('SEO Specialist', 'Optimize website content for search engines.', '2023-12-31', 'Part-time', 9, '789 Market Blvd', 'Market City', 192837465, 'careers@marketingwizards.com', 50000);
