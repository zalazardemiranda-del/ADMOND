-- ==============================================================================
-- MIGRACION 002 - ENDURECIMIENTO DE SEGURIDAD (FASE 2)  ***NO EJECUTAR TODAVIA***
-- ==============================================================================
-- Hoy cualquier persona con la ANON KEY (que esta publica en supabase_config.js)
-- puede leer, modificar y borrar TODAS las tablas sin iniciar sesion, incluso
-- cambiarse el rol a 'gerente'. Este script lo corrige.
--
-- ANTES de ejecutarlo hay que:
--   1. Que TODOS los usuarios tengan cuenta real en Supabase Auth (Authentication
--      -> Users). Hoy hay usuarios "locales" (p. ej. Diego) que entran SIN sesion de
--      Supabase y quedarian bloqueados.
--   2. Quitar del codigo (app.js) las contrasenas fijas y el login local de respaldo.
--   3. Probar en un proyecto Supabase de pruebas (branch / staging), no en produccion.
--
-- Es idempotente.
-- ==============================================================================

-- Helper: rol del usuario actual leido de profiles (no del cliente)
CREATE OR REPLACE FUNCTION public.current_user_rol()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT rol FROM public.profiles WHERE id = auth.uid()
$$;
REVOKE EXECUTE ON FUNCTION public.current_user_rol() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.current_user_rol() TO authenticated;

-- ------------------------------------------------------------------------------
-- PROFILES: todos autenticados leen; cada quien edita SOLO su perfil y NO su rol;
--           solo un gerente puede cambiar roles o borrar perfiles.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Permitir ver perfiles"        ON public.profiles;
DROP POLICY IF EXISTS "Permitir crear perfiles"      ON public.profiles;
DROP POLICY IF EXISTS "Permitir actualizar perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Permitir eliminar perfiles"   ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid() AND rol = 'colaborador');
CREATE POLICY "profiles_update_self_or_manager" ON public.profiles FOR UPDATE TO authenticated
    USING (id = auth.uid() OR public.current_user_rol() = 'gerente')
    WITH CHECK (
        public.current_user_rol() = 'gerente'
        OR (id = auth.uid() AND rol = public.current_user_rol())   -- no puede cambiarse el rol
    );
CREATE POLICY "profiles_delete_manager" ON public.profiles FOR DELETE TO authenticated
    USING (public.current_user_rol() = 'gerente');

-- handle_new_user: nunca confiar en el rol enviado por el navegador
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, nombre, rol, cargo, departamento, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
        'colaborador',
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
-- RESTO DE TABLAS: solo usuarios autenticados (reemplaza todas las politicas abiertas)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    t TEXT;
    p RECORD;
BEGIN
    FOREACH t IN ARRAY ARRAY['tasks','chats','chat_members','messages','meetings',
                             'consecutivo','nominas','proveedores','emails','operaciones']
    LOOP
        IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
        FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, t);
        END LOOP;
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
                       t || '_authenticated_all', t);
    END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- Nominas / Consecutivo / Proveedores contienen datos financieros: restringir a
-- gerente / administrador / administrativo (descomentar cuando se confirme que
-- ningun colaborador necesita verlos):
-- ------------------------------------------------------------------------------
-- DO $$ DECLARE t TEXT; BEGIN
--   FOREACH t IN ARRAY ARRAY['nominas','consecutivo','proveedores'] LOOP
--     EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_authenticated_all', t);
--     EXECUTE format($f$CREATE POLICY %I ON public.%I FOR ALL TO authenticated
--        USING (public.current_user_rol() IN ('gerente','administrador','administrativo'))
--        WITH CHECK (public.current_user_rol() IN ('gerente','administrador','administrativo'))$f$,
--        t || '_finanzas', t);
--   END LOOP;
-- END $$;

-- Ademas, en el Dashboard: Authentication -> Settings -> activar "Leaked password
-- protection" (requiere plan Pro; en Free el aviso no se puede quitar) y
-- desactivar el registro publico (Sign ups) si los usuarios los crea un gerente.
