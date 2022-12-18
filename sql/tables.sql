drop table if exists team;
create table team
(
    id         serial
        primary key,
    title      varchar(20) not null,
    speciality varchar(40) not null
);

drop table if exists personal_information;
create table personal_information
(
    id           serial
        primary key,
    firstname    varchar(20) not null,
    surname      varchar(40) not null,
    gender       gen         not null,
    birthday     date        not null,
    email        varchar(60) not null,
    phone_number char(10)    not null,
    constraint personal_information_check
        check (((email)::text ~~ '%@%.%'::text) AND (phone_number ~~ '0%'::text))
);

drop table if exists people;
create table people
(
    id               serial
        primary key,
    personal_info    integer
        references personal_information,
    current_position company_role not null,
    team             integer
        references team
);

drop table if exists project;
create table project
(
    id            serial
        primary key,
    title         varchar(20)    not null,
    description   varchar(100)   not null,
    team_assigned integer
        references team,
    status        project_status not null
);

drop table if exists task;
create table task
(
    id              serial
        primary key,
    title           varchar(20)  not null,
    description     varchar(100) not null,
    project         integer
        references project,
    people_assigned integer
        references people,
    status          task_status  not null
);

drop table if exists account;
create table account
(
    username      varchar(32) not null
        primary key,
    password_hash varchar(65) not null,
    account_owner integer
        references people
);