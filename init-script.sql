INSERT INTO public.effect (name, description, duration, "maxLevel", "googleIcon", "activationRoute") VALUES ('autoclick', 'Automatically generates a fixed amount of viruses per second', 0, 5, 'web_traffic', 'start-auto-click');
INSERT INTO public.effect (name, description, duration, "maxLevel", "googleIcon", "activationRoute") VALUES ('critical-hit', 'some critical hits yayy', 0, 5, 'bolt', 'start-critical-hit');
INSERT INTO public.effect (name, description, duration, "maxLevel", "googleIcon", "activationRoute") VALUES ('replication', 'Collects all generated virus for 10 seconds and multiplies them', 15000, 5, 'settings_backup_restore', 'start-replication');
INSERT INTO public.effect (name, description, duration, "maxLevel", "googleIcon", "activationRoute") VALUES ('reverse-engineered', 'Collected viruses of a random player count negative', 10, 1, 'exposure_neg_1', 'start-reverse-engineered');
INSERT INTO public.effect (name, description, duration, "maxLevel", "googleIcon", "activationRoute") VALUES ('popupinator', 'Makes another player angry with popups', 30000, 1, 'tooltip', 'start-popupinator');


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