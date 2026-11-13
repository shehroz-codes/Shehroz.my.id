-- Read-only catalog snapshot of the live RPC, 2026-11-13; local test fixture only.
CREATE OR REPLACE FUNCTION public.publish_visitor_message(p_user_id uuid, p_name text, p_text text, p_photo_path text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_message_id UUID;
BEGIN

  IF p_user_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = p_user_id
  ) THEN
    RAISE EXCEPTION 'INVALID_USER';
  END IF;

  IF p_name IS NULL
    OR char_length(btrim(p_name)) NOT BETWEEN 1 AND 80
    OR p_text IS NULL
    OR char_length(btrim(p_text)) NOT BETWEEN 1 AND 300
  THEN
    RAISE EXCEPTION 'INVALID_MESSAGE';
  END IF;

  IF p_photo_path IS NOT NULL AND (
    char_length(p_photo_path) > 255
    OR left(
      p_photo_path,
      char_length(p_user_id::TEXT) + 1
    ) <> p_user_id::TEXT || '/'
  ) THEN
    RAISE EXCEPTION 'INVALID_PHOTO_PATH';
  END IF;

  INSERT INTO public.visitor_cooldowns (
    user_id, last_submitted_at
  )
  VALUES (p_user_id, now())

  ON CONFLICT (user_id)
  DO UPDATE SET
    last_submitted_at = EXCLUDED.last_submitted_at

  WHERE public.visitor_cooldowns.last_submitted_at
    <= now() - INTERVAL '10 minutes';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'COOLDOWN';
  END IF;

  INSERT INTO public.visitor_messages (
    visitor_id,
    name,
    text,
    has_photo,
    photo_path,
    status,
    is_demo
  )
  VALUES (
    p_user_id,
    btrim(p_name),
    btrim(p_text),
    p_photo_path IS NOT NULL,
    p_photo_path,
    'published',
    false
  )
  RETURNING id INTO v_message_id;

  RETURN v_message_id;

END;
$function$
