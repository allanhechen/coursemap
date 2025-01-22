CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL,
    "userId" INTEGER NOT NULL,
    type VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    "providerAccountId" VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at BIGINT,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL,
    "sessionToken" VARCHAR(255) NOT NULL,
    "userId" INTEGER NOT NULL,
    expires TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier TEXT,
    token TEXT,
    expires TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (identifier, token)
);
CREATE TABLE IF NOT EXISTS users (
    id SERIAL,
    name VARCHAR(255),
    email VARCHAR(255),
    "emailVerified" TIMESTAMPTZ,
    image TEXT,
    PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS institution (
    institutionid SERIAL PRIMARY KEY,
    institutionname VARCHAR(64) NOT NULL,
    institutionphoto VARCHAR(256)
);
CREATE TABLE IF NOT EXISTS program (
    institutionid INT REFERENCES institution(institutionid),
    programname VARCHAR(64),
    startingyear INT,
    faculty VARCHAR(64),
<<<<<<< HEAD
    PRIMARY KEY (institutionid, programname, startingyear)
=======
    PRIMARY KEY (institutionid, programname)
>>>>>>> c34fa89 (Add initialization scripts for local Postgres databases)
);
CREATE TABLE IF NOT EXISTS userprogram (
    userId INT REFERENCES users(id),
    institutionid INT,
    programname VARCHAR(64),
<<<<<<< HEAD
    startingyear INT NOT NULL,
    active BOOLEAN,
    FOREIGN KEY (institutionid, programname, startingyear) REFERENCES program(institutionid, programname, startingyear),
=======
    active BOOLEAN,
    FOREIGN KEY (institutionid, programname) REFERENCES program(institutionid, programname),
>>>>>>> c34fa89 (Add initialization scripts for local Postgres databases)
    PRIMARY KEY (userId, institutionid, programname)
);
CREATE TABLE IF NOT EXISTS course (
    courseid SERIAL PRIMARY KEY,
    institutionid INT REFERENCES institution(institutionid),
    faculty VARCHAR(64) NOT NULL,
    coursecode VARCHAR(10) NOT NULL,
    coursetitle VARCHAR(64) NOT NULL,
    coursedescription VARCHAR(2048),
<<<<<<< HEAD
    courseprerequisites VARCHAR(512)
=======
    courseprerequisites VARCHAR(256)
>>>>>>> c34fa89 (Add initialization scripts for local Postgres databases)
);
CREATE TABLE IF NOT EXISTS coursepostrequisite (
    courseid INT REFERENCES course(courseid),
    postrequisite INT REFERENCES course(courseid),
    PRIMARY KEY (courseid, postrequisite)
);
CREATE TABLE IF NOT EXISTS courseantirequisite (
    courseid INT REFERENCES course(courseid),
    antirequisite INT REFERENCES course(courseid),
    PRIMARY KEY (courseid, antirequisite)
);
<<<<<<< HEAD
=======
CREATE TABLE IF NOT EXISTS coursehistory (
    courseid INT REFERENCES course(courseid),
    pastyear INT,
    pastterm CHAR(2),
    PRIMARY KEY (courseid, pastyear, pastterm)
);
>>>>>>> c34fa89 (Add initialization scripts for local Postgres databases)
CREATE TABLE IF NOT EXISTS courseattribute (
    courseid INT REFERENCES course(courseid),
    attribute CHAR(2),
    PRIMARY KEY (courseid, attribute)
);
CREATE TABLE IF NOT EXISTS semester (
    semesterid SERIAL PRIMARY KEY,
    userId INT,
    institutionid INT,
    programname VARCHAR(64),
    semestername VARCHAR(32) NOT NULL,
    semesteryear INT NOT NULL,
    semesterterm CHAR(2) NOT NULL,
<<<<<<< HEAD
    FOREIGN KEY (userId, institutionid, programname) REFERENCES userprogram(userId, institutionid, programname),
    UNIQUE (userId, institutionid, programname, semesteryear, semesterterm)
);
CREATE TABLE IF NOT EXISTS coursesemester (
=======
    FOREIGN KEY (userId, institutionid, programname) REFERENCES userprogram(userId, institutionid, programname)
);
CREATE TABLE IF NOT EXISTS coursesemester (
    userId INT REFERENCES users(id),
>>>>>>> c34fa89 (Add initialization scripts for local Postgres databases)
    semesterid INT REFERENCES semester(semesterid),
    courseid INT REFERENCES course(courseid),
    sortorder INT,
    PRIMARY KEY (semesterid, courseid)
);
CREATE TABLE IF NOT EXISTS programrequirement (
    institutionid INT,
    programname VARCHAR(64),
    courseid INT,
    recommendedsemester INT NOT NULL,
    requirementyear INT,
    PRIMARY KEY (institutionid, programname, courseid),
<<<<<<< HEAD
    FOREIGN KEY (institutionid, programname, requirementyear) REFERENCES program(institutionid, programname, startingyear)
=======
    FOREIGN KEY (institutionid, programname) REFERENCES program(institutionid, programname)
>>>>>>> c34fa89 (Add initialization scripts for local Postgres databases)
);