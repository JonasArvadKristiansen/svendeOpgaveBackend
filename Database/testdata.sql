INSERT INTO users (fullName, password, email, phonenumber, isAdmin) VALUES
('John Doe', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'john.doe@example.com', '1234567890', FALSE),
('Jane Smith', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'jane.smith@example.com', '0987654321', FALSE),
('Alice Johnson', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'alice.johnson@example.com', '1122334455', FALSE),
('Bob Brown', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'bob.brown@example.com', '5566778899', FALSE),
('Charlie Davis', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'charlie.davis@example.com', '2233445566', FALSE),
('Emily Clark', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'emily.clark@example.com', '6677889900', FALSE),
('Frank Harris', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'frank.harris@example.com', '3344556677', FALSE),
('Grace Lewis', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'grace.lewis@example.com', '7788990011', FALSE),
('Hannah Walker', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'hannah.walker@example.com', '4455667788', FALSE),
('Ivy Hall', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'ivy.hall@example.com', '8899001122', FALSE),
('Jack Young', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'jack.young@example.com', '5566778890', FALSE),
('Karen Wright', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'karen.wright@example.com', '3344667788', FALSE),
('Leo King', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'leo.king@example.com', '9988776655', FALSE),
('Mia Scott', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'mia.scott@example.com', '7766554433', FALSE),
('Nina Green', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'nina.green@example.com', '1234432112', FALSE);

-- Insert test data into bannedEmails table
INSERT INTO bannedEmails (email) VALUES
('banned1@example.com'),
('banned2@example.com'),
('banned3@example.com'),
('banned4@example.com'),
('banned5@example.com'),
('banned6@example.com'),
('banned7@example.com'),
('banned8@example.com'),
('banned9@example.com'),
('banned10@example.com'),
('banned11@example.com'),
('banned12@example.com'),
('banned13@example.com'),
('banned14@example.com'),
('banned15@example.com');

-- Insert test data into companys table
INSERT INTO companys (companyName, password, description, address, city, phonenumber, email, numberOfEmployees, cvrNumber, jobtypes, jobpostingCount) VALUES
('Tech Innovators', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'Leading the way in tech innovation.', '123 Tech Lane', 'Techville', 123456789, 'contact@techinnovators.com', 500, 1234567890, 'programmør, backend developer, frontend developer', 3),
('Design Gurus', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'Pioneers in design and aesthetics.', '456 Design St', 'Creativetown', 987654321, 'info@designgurus.com', 200, 9876543210, 'frontend designer, JavaScript, IT-support', 2),
('Infra Solutions', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'Experts in infrastructure management.', '789 Infra Ave', 'Infracity', 564738291, 'support@infrasolutions.com', 1000, 5647382910, 'infrastruktur, C#, IT-support', 4),
('Code Masters', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'Masters in coding and software development.', '101 Code Rd', 'Codetown', 111222333, 'contact@codemasters.com', 300, 1112223330, 'programmør, C#, backend developer', 5),
('Creative Minds', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'Creative solutions for digital needs.', '202 Creative Blvd', 'Creativeland', 222333444, 'info@creativeminds.com', 150, 2223334440, 'frontend designer, frontend developer', 3),
('Network Pros', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'Professional networking services.', '303 Network St', 'Network City', 333444555, 'support@networkpros.com', 250, 3334445550, 'infrastruktur, IT-support', 3),
('SecureTech', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'Security solutions for your business.', '404 Secure Ave', 'Securetown', 444555666, 'contact@securetech.com', 450, 4445556660, 'IT-support, backend developer', 4),
('Web Wonders', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'Creating wonders on the web.', '505 Web Rd', 'Web City', 555666777, 'info@webwonders.com', 100, 5556667770, 'frontend developer, JavaScript', 2),
('Data Dynamos', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'Dynamic data solutions.', '606 Data Blvd', 'Dataville', 666777888, 'contact@datadynamos.com', 600, 6667778880, 'backend developer, programmør', 5),
('App Experts', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'Experts in mobile app development.', '707 App Ave', 'Appland', 777888999, 'info@appexperts.com', 350, 7778889990, 'frontend developer, backend developer', 4),
('Cloud Kings', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'Kings of cloud solutions.', '808 Cloud St', 'Cloud City', 888999000, 'support@cloudkings.com', 700, 8889990000, 'infrastruktur, IT-support', 3),
('AI Pioneers', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'Pioneering the future with AI.', '909 AI Blvd', 'Aitown', 999000111, 'contact@aipioneers.com', 800, 9990001110, 'programmør, backend developer', 4),
('Tech Titans', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'Titans in technology.', '1010 Titan Rd', 'Titansville', 100110012, 'info@techtitans.com', 550, 1001100120, 'programmør, frontend developer', 3),
('Smart Systems', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'Smart solutions for modern problems.', '1111 Smart Ave', 'Smart City', 110110113, 'support@smartsystems.com', 900, 1101101130, 'infrastruktur, C#', 5),
('Cyber Solutions', '$2b$10$ihyKOJriHG15QSF.y2faD.rk62vbkp2yDq0pFtRJTxfmccBPiS1h2', 'Solutions for the cyber world.', '1212 Cyber St', 'Cybertown', 120120124, 'contact@cybersolutions.com', 650, 1201201240, 'IT-support, backend developer', 4);

-- Insert test data into jobpostings table
INSERT INTO jobpostings (title, description, deadline, jobtype, companyID, address, city, phonenumber, email, salary) VALUES
('Senior Backend Developer', 'Looking for an experienced backend developer proficient in C#.', '2024-12-31', 'backend developer', 1, '123 Tech Lane', 'Techville', 123456789, 'hr@techinnovators.com', 70000),
('Frontend Developer', 'Seeking a creative frontend developer with JavaScript skills.', '2024-11-30', 'frontend developer', 1, '123 Tech Lane', 'Techville', 123456789, 'hr@techinnovators.com', 65000),
('Infrastructure Engineer', 'Join our team to manage and innovate our infrastructure.', '2024-10-15', 'infrastruktur', 3, '789 Infra Ave', 'Infracity', 564738291, 'jobs@infrasolutions.com', 80000),
('IT Support Specialist', 'Providing top-notch IT support for our clients.', '2024-08-20', 'IT-support', 3, '789 Infra Ave', 'Infracity', 564738291, 'jobs@infrasolutions.com', 50000),
('Frontend Designer', 'Creative and experienced frontend designer needed.', '2024-09-25', 'frontend designer', 2, '456 Design St', 'Creativetown', 987654321, 'careers@designgurus.com', 60000),
('Junior Programmer', 'Looking for a junior programmer to join our dynamic team.', '2024-12-01', 'programmør', 4, '101 Code Rd', 'Codetown', 111222333, 'hr@codemasters.com', 55000),
('Mid-level Backend Developer', 'Seeking a mid-level backend developer for our software team.', '2024-11-15', 'backend developer', 1, '123 Tech Lane', 'Techville', 123456789, 'hr@techinnovators.com', 68000),
('Senior Infrastructure Specialist', 'Experienced infrastructure specialist needed.', '2024-10-01', 'infrastruktur', 3, '789 Infra Ave', 'Infracity', 564738291, 'jobs@infrasolutions.com', 90000),
('Full Stack Developer', 'We need a full stack developer with expertise in JavaScript and C#.', '2024-12-20', 'backend developer', 4, '101 Code Rd', 'Codetown', 111222333, 'hr@codemasters.com', 75000),
('Junior IT Support', 'Looking for a junior IT support specialist.', '2024-09-30', 'IT-support', 3, '789 Infra Ave', 'Infracity', 564738291, 'jobs@infrasolutions.com', 45000),
('Creative Frontend Designer', 'Creative and passionate frontend designer wanted.', '2024-10-10', 'frontend designer', 2, '456 Design St', 'Creativetown', 987654321, 'careers@designgurus.com', 65000),
('Senior JavaScript Developer', 'Looking for an experienced JavaScript developer.', '2024-11-05', 'JavaScript', 8, '505 Web Rd', 'Web City', 555666777, 'hr@webwonders.com', 70000),
('Mid-level IT Support Specialist', 'Providing IT support to our growing team.', '2024-10-25', 'IT-support', 6, '303 Network St', 'Network City', 333444555, 'jobs@networkpros.com', 48000),
('Lead Programmer', 'Looking for a lead programmer with 5+ years of experience.', '2024-12-15', 'programmør', 4, '101 Code Rd', 'Codetown', 111222333, 'hr@codemasters.com', 80000),
('Junior Frontend Developer', 'Join our team as a junior frontend developer.', '2024-11-10', 'frontend developer', 5, '202 Creative Blvd', 'Creativeland', 222333444, 'jobs@creativeminds.com', 50000);