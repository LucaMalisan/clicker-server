--
-- PostgreSQL database dump
--

-- Dumped from database version 17beta1 (Debian 17~beta1-1.pgdg120+1)
-- Dumped by pg_dump version 17.2

-- Started on 2025-05-19 11:08:26

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3465 (class 1262 OID 16384)
-- Name: clicker_db; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE clicker_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE clicker_db OWNER TO postgres;

\connect clicker_db

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 3466 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 16434)
-- Name: chat_message; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_message (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    content text NOT NULL,
    "writtenByUuid" uuid NOT NULL,
    "gameSessionUuid" uuid NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.chat_message OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16451)
-- Name: effect; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.effect (
    name character varying NOT NULL,
    description character varying NOT NULL,
    duration integer NOT NULL,
    "maxLevel" integer NOT NULL,
    "googleIcon" character varying NOT NULL,
    "activationRoute" character varying NOT NULL
);


ALTER TABLE public.effect OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16458)
-- Name: effect_detail; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.effect_detail (
    uuid character varying NOT NULL,
    "effectName" character varying NOT NULL,
    level integer NOT NULL,
    price integer NOT NULL,
    efficiency integer NOT NULL,
    probability real
);


ALTER TABLE public.effect_detail OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16424)
-- Name: game_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.game_session (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "hexCode" character varying NOT NULL,
    duration integer NOT NULL,
    "startedAt" timestamp with time zone,
    "endedAt" timestamp with time zone,
    created_by uuid NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.game_session OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16401)
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userName" character varying NOT NULL,
    password character varying NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16487)
-- Name: user_action_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_action_log (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    action character varying NOT NULL,
    "virusDifference" real NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "userGameSessionUuid" uuid
);


ALTER TABLE public.user_action_log OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16476)
-- Name: user_active_effects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_active_effects (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "effectName" character varying NOT NULL,
    "activatedByUuid" uuid NOT NULL,
    "influencedUserUuid" uuid NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_active_effects OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16443)
-- Name: user_game_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_game_session (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userUuid" uuid NOT NULL,
    "gameSessionUuid" uuid NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    rank integer,
    "maxVirus" integer,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    offline boolean DEFAULT false NOT NULL
);


ALTER TABLE public.user_game_session OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16465)
-- Name: user_purchased_effects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_purchased_effects (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "effectName" character varying NOT NULL,
    "userUuid" uuid NOT NULL,
    "currentLevel" integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_purchased_effects OWNER TO postgres;


--
-- TOC entry 3455 (class 0 OID 16451)
-- Dependencies: 222
-- Data for Name: effect; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.effect (name, description, duration, "maxLevel", "googleIcon", "activationRoute") VALUES ('autoclick', 'Automatically generates a fixed amount of viruses per second', 0, 5, 'web_traffic', 'start-auto-click');
INSERT INTO public.effect (name, description, duration, "maxLevel", "googleIcon", "activationRoute") VALUES ('critical-hit', 'some critical hits yayy', 0, 5, 'bolt', 'start-critical-hit');
INSERT INTO public.effect (name, description, duration, "maxLevel", "googleIcon", "activationRoute") VALUES ('replication', 'Collects all generated virus for 10 seconds and multiplies them', 15000, 5, 'settings_backup_restore', 'start-replication');
INSERT INTO public.effect (name, description, duration, "maxLevel", "googleIcon", "activationRoute") VALUES ('reverse-engineered', 'Collected viruses of a random player count negative', 10, 1, 'exposure_neg_1', 'start-reverse-engineered');
INSERT INTO public.effect (name, description, duration, "maxLevel", "googleIcon", "activationRoute") VALUES ('popupinator', 'Makes another player angry with popups', 30000, 1, 'nothing', 'start-popupinator');


--
-- TOC entry 3456 (class 0 OID 16458)
-- Dependencies: 223
-- Data for Name: effect_detail; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.effect_detail (uuid, "effectName", level, price, efficiency, probability) VALUES ('2e4c2948-1545-49b9-ae82-52fb3678231e', 'autoclick', 1, 50, 1, 1);
INSERT INTO public.effect_detail (uuid, "effectName", level, price, efficiency, probability) VALUES ('8639e2e6-d450-4f11-afb7-c85ae6ec3928', 'autoclick', 5, 1000, 15, 1);
INSERT INTO public.effect_detail (uuid, "effectName", level, price, efficiency, probability) VALUES ('8ba41847-ffe6-48f9-a851-73f31bb91022', 'autoclick', 2, 150, 3, 1);
INSERT INTO public.effect_detail (uuid, "effectName", level, price, efficiency, probability) VALUES ('f41fd072-842a-41e9-b6b1-ef8f00574262', 'autoclick', 3, 400, 6, 1);
INSERT INTO public.effect_detail (uuid, "effectName", level, price, efficiency, probability) VALUES ('f6180ed3-fe05-4e1a-b87c-df9645c8c5c5', 'autoclick', 4, 700, 10, 1);
INSERT INTO public.effect_detail (uuid, "effectName", level, price, efficiency, probability) VALUES ('2e4c2948-1545-49b9-ae82-52fb36782319', 'critical-hit', 5, 900, 9, 0.4);
INSERT INTO public.effect_detail (uuid, "effectName", level, price, efficiency, probability) VALUES ('2e4c2948-1545-49b9-ae82-52fb3678231a', 'critical-hit', 4, 650, 7, 0.35);
INSERT INTO public.effect_detail (uuid, "effectName", level, price, efficiency, probability) VALUES ('2e4c2948-1545-49b9-ae82-52fb3678231b', 'critical-hit', 3, 450, 5, 0.3);
INSERT INTO public.effect_detail (uuid, "effectName", level, price, efficiency, probability) VALUES ('2e4c2948-1545-49b9-ae82-52fb3678231c', 'critical-hit', 2, 300, 3, 0.25);
INSERT INTO public.effect_detail (uuid, "effectName", level, price, efficiency, probability) VALUES ('2e4c2948-1545-49b9-ae82-52fb3678231d', 'critical-hit', 1, 100, 2, 0.2);
INSERT INTO public.effect_detail (uuid, "effectName", level, price, efficiency, probability) VALUES ('8639e2e6-d450-4f11-afb7-c85ae6ec3923', 'replication', 5, 100, 6, 1);
INSERT INTO public.effect_detail (uuid, "effectName", level, price, efficiency, probability) VALUES ('8639e2e6-d450-4f11-afb7-c85ae6ec3924', 'replication', 4, 80, 5, 1);
INSERT INTO public.effect_detail (uuid, "effectName", level, price, efficiency, probability) VALUES ('8639e2e6-d450-4f11-afb7-c85ae6ec3925', 'replication', 3, 60, 4, 1);
INSERT INTO public.effect_detail (uuid, "effectName", level, price, efficiency, probability) VALUES ('8639e2e6-d450-4f11-afb7-c85ae6ec3926', 'replication', 2, 40, 3, 1);
INSERT INTO public.effect_detail (uuid, "effectName", level, price, efficiency, probability) VALUES ('8639e2e6-d450-4f11-afb7-c85ae6ec3927', 'replication', 1, 20, 2, 1);
INSERT INTO public.effect_detail (uuid, "effectName", level, price, efficiency, probability) VALUES ('f41fd072-842a-41e9-b6b1-ef8f00574263', 'reverse-engineered', 1, 100, 1, 1);
INSERT INTO public.effect_detail (uuid, "effectName", level, price, efficiency, probability) VALUES ('2e4c2948-1545-49b9-ae82-52fb36782473', 'popupinator', 1, 200, 0, 1);


--
-- TOC entry 3457 (class 0 OID 16465)
-- Dependencies: 224
-- Data for Name: user_purchased_effects; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3285 (class 2606 OID 16473)
-- Name: user_purchased_effects PK_1035e890a02b2331a98d4b78873; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_purchased_effects
    ADD CONSTRAINT "PK_1035e890a02b2331a98d4b78873" PRIMARY KEY (uuid);


--
-- TOC entry 3293 (class 2606 OID 16495)
-- Name: user_action_log PK_1defe2a6952cc5babfdba4f510a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_action_log
    ADD CONSTRAINT "PK_1defe2a6952cc5babfdba4f510a" PRIMARY KEY (uuid);


--
-- TOC entry 3281 (class 2606 OID 16457)
-- Name: effect PK_458447f7973e7190021adfb1e1f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.effect
    ADD CONSTRAINT "PK_458447f7973e7190021adfb1e1f" PRIMARY KEY (name);


--
-- TOC entry 3289 (class 2606 OID 16484)
-- Name: user_active_effects PK_524c7aa74b48e737275c9a6d8cd; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_active_effects
    ADD CONSTRAINT "PK_524c7aa74b48e737275c9a6d8cd" PRIMARY KEY (uuid);


--
-- TOC entry 3275 (class 2606 OID 16433)
-- Name: game_session PK_782578f9d48238eff0fbfdffbd5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_session
    ADD CONSTRAINT "PK_782578f9d48238eff0fbfdffbd5" PRIMARY KEY (uuid);


--
-- TOC entry 3283 (class 2606 OID 16464)
-- Name: effect_detail PK_7fc9251d90ad54c4a26431deaa5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.effect_detail
    ADD CONSTRAINT "PK_7fc9251d90ad54c4a26431deaa5" PRIMARY KEY (uuid);


--
-- TOC entry 3271 (class 2606 OID 16421)
-- Name: user PK_a95e949168be7b7ece1a2382fed; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_a95e949168be7b7ece1a2382fed" PRIMARY KEY (uuid);


--
-- TOC entry 3279 (class 2606 OID 16450)
-- Name: user_game_session PK_bca6eeaf19a7a1911f7af63e68e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_game_session
    ADD CONSTRAINT "PK_bca6eeaf19a7a1911f7af63e68e" PRIMARY KEY (uuid);


--
-- TOC entry 3277 (class 2606 OID 16442)
-- Name: chat_message PK_c91ea7bef39aaed3601347c1f10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_message
    ADD CONSTRAINT "PK_c91ea7bef39aaed3601347c1f10" PRIMARY KEY (uuid);


--
-- TOC entry 3291 (class 2606 OID 16486)
-- Name: user_active_effects UQ_2a397fba7cbe69aaacd68da3be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_active_effects
    ADD CONSTRAINT "UQ_2a397fba7cbe69aaacd68da3be3" UNIQUE ("effectName", "activatedByUuid", "influencedUserUuid");


--
-- TOC entry 3287 (class 2606 OID 16475)
-- Name: user_purchased_effects UQ_321e4a971bfdc51148fb6428052; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_purchased_effects
    ADD CONSTRAINT "UQ_321e4a971bfdc51148fb6428052" UNIQUE ("effectName", "userUuid");


--
-- TOC entry 3273 (class 2606 OID 16423)
-- Name: user UQ_da5934070b5f2726ebfd3122c80; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_da5934070b5f2726ebfd3122c80" UNIQUE ("userName");


--
-- TOC entry 3302 (class 2606 OID 16541)
-- Name: user_active_effects FK_08689e4bd1fd89e3a6f3b6aad67; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_active_effects
    ADD CONSTRAINT "FK_08689e4bd1fd89e3a6f3b6aad67" FOREIGN KEY ("activatedByUuid") REFERENCES public."user"(uuid);


--
-- TOC entry 3300 (class 2606 OID 16531)
-- Name: user_purchased_effects FK_0b3f111bf53bdeb30766a081bcd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_purchased_effects
    ADD CONSTRAINT "FK_0b3f111bf53bdeb30766a081bcd" FOREIGN KEY ("userUuid") REFERENCES public."user"(uuid);


--
-- TOC entry 3299 (class 2606 OID 16521)
-- Name: effect_detail FK_3edf06a780df1be3080e2a01db7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.effect_detail
    ADD CONSTRAINT "FK_3edf06a780df1be3080e2a01db7" FOREIGN KEY ("effectName") REFERENCES public.effect(name);


--
-- TOC entry 3297 (class 2606 OID 16516)
-- Name: user_game_session FK_6c8e5157da364af58521ea4521a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_game_session
    ADD CONSTRAINT "FK_6c8e5157da364af58521ea4521a" FOREIGN KEY ("gameSessionUuid") REFERENCES public.game_session(uuid);


--
-- TOC entry 3294 (class 2606 OID 16496)
-- Name: game_session FK_79ffc8ccd721faedd375a39e184; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_session
    ADD CONSTRAINT "FK_79ffc8ccd721faedd375a39e184" FOREIGN KEY (created_by) REFERENCES public."user"(uuid);


--
-- TOC entry 3303 (class 2606 OID 16536)
-- Name: user_active_effects FK_8e390f1778f1651319f449d410a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_active_effects
    ADD CONSTRAINT "FK_8e390f1778f1651319f449d410a" FOREIGN KEY ("effectName") REFERENCES public.effect(name);


--
-- TOC entry 3295 (class 2606 OID 16501)
-- Name: chat_message FK_90e10232ebe24f3a647c786f209; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_message
    ADD CONSTRAINT "FK_90e10232ebe24f3a647c786f209" FOREIGN KEY ("writtenByUuid") REFERENCES public."user"(uuid);


--
-- TOC entry 3301 (class 2606 OID 16526)
-- Name: user_purchased_effects FK_9f9594dca1ac579f5e3e772a64a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_purchased_effects
    ADD CONSTRAINT "FK_9f9594dca1ac579f5e3e772a64a" FOREIGN KEY ("effectName") REFERENCES public.effect(name);


--
-- TOC entry 3296 (class 2606 OID 16506)
-- Name: chat_message FK_b8f743d230ebfd99de880c55cf2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_message
    ADD CONSTRAINT "FK_b8f743d230ebfd99de880c55cf2" FOREIGN KEY ("gameSessionUuid") REFERENCES public.game_session(uuid);


--
-- TOC entry 3298 (class 2606 OID 16511)
-- Name: user_game_session FK_d64b86baa445db93672d0d07ec5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_game_session
    ADD CONSTRAINT "FK_d64b86baa445db93672d0d07ec5" FOREIGN KEY ("userUuid") REFERENCES public."user"(uuid);


--
-- TOC entry 3305 (class 2606 OID 16551)
-- Name: user_action_log FK_eeca0b65d5be09a1353291f4a67; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_action_log
    ADD CONSTRAINT "FK_eeca0b65d5be09a1353291f4a67" FOREIGN KEY ("userGameSessionUuid") REFERENCES public.user_game_session(uuid);


--
-- TOC entry 3304 (class 2606 OID 16546)
-- Name: user_active_effects FK_f107b4b286c79b3f37e81ebf47b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_active_effects
    ADD CONSTRAINT "FK_f107b4b286c79b3f37e81ebf47b" FOREIGN KEY ("influencedUserUuid") REFERENCES public."user"(uuid);


-- Completed on 2025-05-19 11:08:26

--
-- PostgreSQL database dump complete
--

