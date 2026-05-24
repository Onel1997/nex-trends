-- Increase documented free tier limit context (enforced in edge function code)

comment on column public.profiles.monthly_usage_count is
  'Anzahl AI-Analysen im aktuellen Abrechnungsmonat (Free User, Limit: 10)';
