-- ==============================================================================
-- MIGRACION 001 - CORRECCIONES SEGURAS (no rompe el funcionamiento actual)
-- Ejecutar en: Supabase -> SQL Editor -> New query -> pegar -> RUN
-- Es idempotente: se puede ejecutar mas de una vez sin problema.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLAS FALTANTES EN PRODUCCION: emails y operaciones (la API devolvia 404)
--    Se crean con politicas solo para usuarios autenticados (seguro por defecto).
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emisor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    emisor_email TEXT NOT NULL,
    emisor_nombre TEXT NOT NULL,
    destinatario_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    destinatario_email TEXT NOT NULL,
    destinatario_nombre TEXT NOT NULL,
    cc_emails TEXT DEFAULT '',
    asunto TEXT NOT NULL,
    contenido TEXT NOT NULL,
    categoria TEXT DEFAULT 'General',
    prioridad TEXT DEFAULT 'Normal' CHECK (prioridad IN ('Normal', 'Alta', 'Urgente')),
    carpeta TEXT NOT NULL DEFAULT 'inbox' CHECK (carpeta IN ('inbox', 'sent', 'drafts', 'trash', 'notifications')),
    leido BOOLEAN DEFAULT FALSE,
    destacado BOOLEAN DEFAULT FALSE,
    archivos_adjuntos JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "emails_authenticated_all" ON public.emails;
CREATE POLICY "emails_authenticated_all" ON public.emails
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_emails_destinatario ON public.emails(destinatario_email);
CREATE INDEX IF NOT EXISTS idx_emails_emisor ON public.emails(emisor_email);
CREATE INDEX IF NOT EXISTS idx_emails_carpeta ON public.emails(carpeta);
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON public.emails(created_at DESC);

CREATE TABLE IF NOT EXISTS public.operaciones (
    id TEXT PRIMARY KEY,
    consecutivo TEXT NOT NULL,
    tipo_proyecto TEXT NOT NULL DEFAULT 'servicio_local',
    estatus TEXT NOT NULL DEFAULT 'PENDIENTE',
    factura TEXT DEFAULT '',
    orden_compra TEXT DEFAULT '',
    datos JSONB NOT NULL DEFAULT '{}'::jsonb,
    creado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.operaciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "operaciones_authenticated_all" ON public.operaciones;
CREATE POLICY "operaciones_authenticated_all" ON public.operaciones
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_operaciones_consecutivo ON public.operaciones(consecutivo);
CREATE INDEX IF NOT EXISTS idx_operaciones_estatus ON public.operaciones(estatus);

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.emails;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.operaciones;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------------------------
-- 2. ROL 'administrativo': la app lo usa (Diego) pero el CHECK de profiles no lo
--    permitia, asi que el alta/trigger de ese usuario fallaba en silencio.
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_rol_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_rol_check
    CHECK (rol IN ('gerente', 'administrador', 'administrativo', 'colaborador'));

-- ------------------------------------------------------------------------------
-- 3. handle_new_user: search_path fijo (advisor "Function Search Path Mutable"),
--    y se retira el permiso de ejecutarla via API (advisors "Can Execute SECURITY
--    DEFINER Function"). Los triggers NO necesitan ese permiso para funcionar.
--    Si el rol de los metadatos no es valido, cae a 'colaborador' en lugar de
--    abortar el registro.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_rol TEXT := COALESCE(NEW.raw_user_meta_data->>'rol', 'colaborador');
BEGIN
    IF v_rol NOT IN ('gerente', 'administrador', 'administrativo', 'colaborador') THEN
        v_rol := 'colaborador';
    END IF;

    INSERT INTO public.profiles (id, email, nombre, rol, cargo, departamento, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
        v_rol,
        COALESCE(NEW.raw_user_meta_data->>'cargo', 'Colaborador'),
        COALESCE(NEW.raw_user_meta_data->>'departamento', 'General'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- ------------------------------------------------------------------------------
-- 4. CRECIMIENTO INFINITO DE public.messages
--    La app guarda "snapshots" de Operaciones/Consecutivo/Proveedores/documentos
--    como filas de messages en cada edicion (959 filas de consecutivo en un mes).
--    PostgREST devuelve maximo 1000 filas, por eso los mensajes nuevos dejaban de
--    verse. Este trigger conserva solo los ultimos N snapshots por cada chat_id.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prune_internal_messages()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    keep_n INT;
BEGIN
    IF NEW.chat_id LIKE '\_\_cloud\_sync\_%' THEN
        keep_n := 3;
    ELSIF NEW.chat_id LIKE '\_\_doc\_%' THEN
        keep_n := 2;
    ELSE
        RETURN NEW;
    END IF;

    DELETE FROM public.messages m
    WHERE m.chat_id = NEW.chat_id
      AND m.id NOT IN (
          SELECT id FROM public.messages
          WHERE chat_id = NEW.chat_id
          ORDER BY created_at DESC, id DESC
          LIMIT keep_n
      );
    RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.prune_internal_messages() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_prune_internal_messages ON public.messages;
CREATE TRIGGER trg_prune_internal_messages
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.prune_internal_messages();

-- Limpieza unica de lo acumulado (conserva los 3 snapshots mas recientes por chat_id
-- y los 2 documentos mas recientes). Los mensajes de chat reales NO se tocan.
DELETE FROM public.messages m
USING (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY chat_id ORDER BY created_at DESC, id DESC) AS rn,
           chat_id
    FROM public.messages
    WHERE chat_id LIKE '\_\_cloud\_sync\_%' OR chat_id LIKE '\_\_doc\_%'
) old
WHERE m.id = old.id
  AND ((old.chat_id LIKE '\_\_cloud\_sync\_%' AND old.rn > 3)
    OR (old.chat_id LIKE '\_\_doc\_%'        AND old.rn > 2));

-- Indice para las consultas por chat_id / fecha
CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON public.messages(chat_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- VERIFICACION (ejecutar despues, debe mostrar pocas filas internas)
--   SELECT chat_id, count(*) FROM public.messages GROUP BY 1 ORDER BY 2 DESC;
-- ------------------------------------------------------------------------------
