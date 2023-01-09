create type gen as enum ('male', 'female', 'other');

create type company_role as enum ('manager', 'team_leader', 'staff');

create type project_status as enum ('not_assigned', 'in_progress', 'done');

create type task_status as enum ('not_assigned', 'in_progress', 'done');

drop table if exists team;
create table team
(
    id         serial
        primary key,
    title      varchar(20) not null,
    speciality varchar(40) not null
);

drop table if exists people;
create table people
(
    id               serial
        primary key,
    firstname    varchar(20) not null,
    surname      varchar(40) not null,
    gender       gen         not null,
    birthday     date        not null,
    email        varchar(60) not null,
    phone_number char(10)    not null,
    current_position company_role not null,
    team             integer
        references team
        constraint email_phone_number_check
            check (((email)::text ~~ '%@%.%'::text) AND (phone_number ~~ '0%'::text))
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