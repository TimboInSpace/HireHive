# HireHive

*Hyperlocal job board - Helping neighbors to help each other*.

@timboinspace 2025



## Problem

I wanted a way to organize the folks around the neighborhood that wanted to *do jobs*. Where I live, there are simultaneously:

- lots of jobs for people to do 
- lots of people that want to do jobs

Unfortunately, it's too disorganized - very few jobs actually get done. *It's a perfect opportunity to organize a market!* :thumbsup:



## Overview

HireHive seeks to match workers to jobs, **with as little friction as possible**. It's meant to be used in a **highly local context**: mowing a neighbor's lawn, taking out someone else's recycling bins, etc - all those small jobs to help each other out. 

> #### :x: Payment Processing
>
> The platform does not handle payment processing. Instead, it provides convenient avenues for users to choose whichever third-party service works for them. 



## Configuration

### Supabase

Create a new project and database. Be sure to include the Data API when configuring it initially. 

Immediately after configuring the DB, go **enable** **the** **`postgis`** extension. Enable it for the `public` schema when prompted:

![enabling postgis supabase extension](images/enabling postgis supabase extension.png)

Run this through the SQL Editor after:

```postgresql
-- Create profiles first (no FK to employer_locations yet)
create table if not exists profiles (
    id uuid references auth.users on delete cascade primary key,
    username text unique,
    role text, -- 'worker', 'employer', or null
    tools text,
    specialties text,
    primary_location uuid, -- temporarily no FK
    default_rate numeric,
    building_type text,
    created_at timestamptz default now()
);

CREATE TABLE employer_locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner uuid,
  address text,
  geo USER-DEFINED,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT employer_locations_pkey PRIMARY KEY (id),
  CONSTRAINT employer_locations_owner_fkey FOREIGN KEY (owner) REFERENCES public.profiles(id)
);

CREATE TABLE jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  employer_id uuid,
  title text NOT NULL,
  description text,
  location uuid,
  compensation numeric,
  payment_method text,
  approx_duration text,
  due_by timestamp with time zone,
  work_within tstzrange,
  tools text,
  claimed_by uuid,
  completed_by_worker boolean DEFAULT false,
  completed_by_employer boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  claimed_at timestamp with time zone,
  CONSTRAINT jobs_pkey PRIMARY KEY (id),
  CONSTRAINT jobs_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public.profiles(id),
  CONSTRAINT jobs_location_fkey FOREIGN KEY (location) REFERENCES public.employer_locations(id),
  CONSTRAINT jobs_claimed_by_fkey FOREIGN KEY (claimed_by) REFERENCES public.profiles(id)
);

CREATE TABLE ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid,
  worker_id uuid,
  employer_id uuid,
  job_rating integer CHECK (job_rating >= 1 AND job_rating <= 5),
  worker_rating integer CHECK (worker_rating >= 1 AND worker_rating <= 5),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ratings_pkey PRIMARY KEY (id),
  CONSTRAINT ratings_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id),
  CONSTRAINT ratings_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.profiles(id),
  CONSTRAINT ratings_employer_id_fkey FOREIGN KEY (employer_id) REFERENCES public.profiles(id)
);

CREATE TABLE spatial_ref_sys (
  srid integer NOT NULL CHECK (srid > 0 AND srid <= 998999),
  auth_name character varying,
  auth_srid integer,
  srtext character varying,
  proj4text character varying,
  CONSTRAINT spatial_ref_sys_pkey PRIMARY KEY (srid)
);

-- Lastly, add the FK constraint back in
alter table profiles
add constraint fk_primary_location
foreign key (primary_location) references employer_locations(id);
```





## TO-DO

- [ ] index page should be more like a homepage
- [ ] Why is the profile button there?
- [ ] Acknowledge email verification in a more sensible way
- [ ] Add location_text to the locations table
