-- ==============================================================================
-- RODIPACK CENTRAL - ESQUEMA DE BASE DE DATOS SUPABASE (POSTGRESQL)
-- ==============================================================================
-- Ejecuta este script completo en el SQL Editor de tu proyecto en Supabase
-- (Dashboard -> SQL Editor -> New Query -> Pegar y dar clic en RUN).
-- ==============================================================================

-- 1. EXTENSIONES NECESARIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE PERFILES DE USUARIOS (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'colaborador' CHECK (rol IN ('gerente', 'administrador', 'colaborador')),
    departamento TEXT DEFAULT 'Operaciones',
    cargo TEXT DEFAULT 'Colaborador',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Los perfiles son visibles para todos los usuarios autenticados" ON public.profiles;
CREATE POLICY "Permitir ver perfiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir crear perfiles" ON public.profiles;
CREATE POLICY "Permitir crear perfiles" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;
CREATE POLICY "Permitir actualizar perfiles" ON public.profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir eliminar perfiles" ON public.profiles;
CREATE POLICY "Permitir eliminar perfiles" ON public.profiles FOR DELETE USING (true);

-- Trigger para crear perfil automáticamente al registrarse en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, nombre, rol, cargo, departamento, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'rol', 'colaborador'),
        COALESCE(NEW.raw_user_meta_data->>'cargo', 'Colaborador'),
        COALESCE(NEW.raw_user_meta_data->>'departamento', 'General'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 3. TABLA DE TABLERO DE TAREAS (Tasks)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    descripcion TEXT DEFAULT '',
    prioridad TEXT NOT NULL DEFAULT 'Media' CHECK (prioridad IN ('Alta', 'Media', 'Baja')),
    estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completada')),
    fecha_vencimiento DATE,
    creado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    asignado_a UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    asignado_nombre TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cualquier usuario autenticado puede ver las tareas" ON public.tasks;
DROP POLICY IF EXISTS "Cualquier usuario autenticado puede crear y actualizar tareas" ON public.tasks;
DROP POLICY IF EXISTS "Permitir ver tareas" ON public.tasks;
DROP POLICY IF EXISTS "Permitir crear tareas" ON public.tasks;
DROP POLICY IF EXISTS "Permitir actualizar tareas" ON public.tasks;
DROP POLICY IF EXISTS "Permitir eliminar tareas" ON public.tasks;

CREATE POLICY "Permitir ver tareas" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Permitir crear tareas" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizar tareas" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Permitir eliminar tareas" ON public.tasks FOR DELETE USING (true);


-- 4. TABLA DE CHATS Y CANALES (Chats)
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo TEXT NOT NULL DEFAULT 'directo' CHECK (tipo IN ('directo', 'grupo')),
    nombre TEXT NOT NULL,
    descripcion TEXT DEFAULT '',
    creado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios autenticados pueden ver chats" ON public.chats;
CREATE POLICY "Ver y crear chats"
ON public.chats FOR ALL 
USING (true);


-- 5. TABLA DE PARTICIPANTES DE CHAT (Chat Members)
CREATE TABLE IF NOT EXISTS public.chat_members (
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (chat_id, user_id)
);

ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ver miembros de chat" ON public.chat_members;
CREATE POLICY "Ver miembros de chat"
ON public.chat_members FOR ALL 
USING (true);


-- 6. TABLA DE MENSAJES DE CHAT (Messages)
-- NOTA IMPORTANTE PARA BASE DE DATOS EXISTENTE EN SUPABASE:
-- Si la tabla public.messages ya fue creada anteriormente, ejecuta estas consultas en el SQL Editor de Supabase:
--   ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_chat_id_fkey;
--   ALTER TABLE public.messages ALTER COLUMN chat_id TYPE TEXT;
--   ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS emisor_role TEXT DEFAULT 'colaborador';
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id TEXT NOT NULL DEFAULT 'general',
    emisor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    emisor_nombre TEXT,
    emisor_role TEXT DEFAULT 'colaborador',
    contenido TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ver y enviar mensajes" ON public.messages;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver y enviar mensajes" ON public.messages;
DROP POLICY IF EXISTS "Permitir ver mensajes" ON public.messages;
DROP POLICY IF EXISTS "Permitir enviar mensajes" ON public.messages;
DROP POLICY IF EXISTS "Permitir actualizar mensajes" ON public.messages;
DROP POLICY IF EXISTS "Permitir eliminar mensajes" ON public.messages;

CREATE POLICY "Permitir ver mensajes" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Permitir enviar mensajes" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizar mensajes" ON public.messages FOR UPDATE USING (true);
CREATE POLICY "Permitir eliminar mensajes" ON public.messages FOR DELETE USING (true);


-- 7. TABLA DE REUNIONES (Meetings)
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    link TEXT DEFAULT '',
    participantes TEXT DEFAULT '',
    creado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ver y programar reuniones" ON public.meetings;
DROP POLICY IF EXISTS "Permitir ver reuniones" ON public.meetings;
DROP POLICY IF EXISTS "Permitir programar reuniones" ON public.meetings;
DROP POLICY IF EXISTS "Permitir actualizar reuniones" ON public.meetings;
DROP POLICY IF EXISTS "Permitir eliminar reuniones" ON public.meetings;

CREATE POLICY "Permitir ver reuniones" ON public.meetings FOR SELECT USING (true);
CREATE POLICY "Permitir programar reuniones" ON public.meetings FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizar reuniones" ON public.meetings FOR UPDATE USING (true);
CREATE POLICY "Permitir eliminar reuniones" ON public.meetings FOR DELETE USING (true);


-- 8. TABLA DE CONSECUTIVO DE FACTURACIÓN 2026 (Consecutivo)
CREATE TABLE IF NOT EXISTS public.consecutivo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consecutivo INTEGER NOT NULL,
    factura TEXT NOT NULL,
    fecha_emision DATE,
    cliente TEXT NOT NULL,
    folio_cliente TEXT DEFAULT '',
    subtotal NUMERIC(12, 2) DEFAULT 0,
    iva NUMERIC(12, 2) DEFAULT 0,
    total NUMERIC(12, 2) DEFAULT 0,
    st TEXT DEFAULT 'P',
    fecha_pago DATE,
    referencia_op TEXT DEFAULT '',
    servicio TEXT DEFAULT '',
    detalle TEXT DEFAULT '',
    nota TEXT DEFAULT '',
    porc_rodipak NUMERIC(6, 2) DEFAULT 0,
    rodipak NUMERIC(12, 2) DEFAULT 0,
    hugo_comision NUMERIC(12, 2) DEFAULT 0,
    hugo_total NUMERIC(12, 2) DEFAULT 0,
    porc_hugo NUMERIC(6, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.consecutivo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso a consecutivo para usuarios autenticados"
ON public.consecutivo FOR ALL 
TO authenticated 
USING (true);


-- 9. TABLA DE NÓMINAS Y ARCHIVOS HISTÓRICOS (Nominas)
CREATE TABLE IF NOT EXISTS public.nominas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    archive_id UUID DEFAULT NULL,
    archive_name TEXT DEFAULT NULL,
    folio TEXT NOT NULL,
    empleado TEXT NOT NULL,
    fecha DATE,
    servicio TEXT DEFAULT 'Nomina',
    subtotal NUMERIC(12, 2) DEFAULT 0,
    iva NUMERIC(12, 2) DEFAULT 0,
    ret4 NUMERIC(12, 2) DEFAULT 0,
    ret_isr NUMERIC(12, 2) DEFAULT 0,
    total NUMERIC(12, 2) DEFAULT 0,
    p TEXT DEFAULT 'P',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.nominas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso a nóminas para gerentes y usuarios autenticados"
ON public.nominas FOR ALL 
TO authenticated 
USING (true);


-- 10. TABLA DE PROVEEDORES Y GASTOS (Proveedores)
CREATE TABLE IF NOT EXISTS public.proveedores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    folio_ff TEXT NOT NULL,
    proveedor TEXT NOT NULL,
    fecha DATE,
    servicio TEXT DEFAULT 'Logistic',
    subtotal NUMERIC(12, 2) DEFAULT 0,
    iva NUMERIC(12, 2) DEFAULT 0,
    ret4 NUMERIC(12, 2) DEFAULT 0,
    ret_isr NUMERIC(12, 2) DEFAULT 0,
    total NUMERIC(12, 2) DEFAULT 0,
    p TEXT DEFAULT 'P',
    folio_fe TEXT DEFAULT 'FE-',
    op TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso a proveedores para usuarios autenticados"
ON public.proveedores FOR ALL 
TO authenticated 
USING (true);


-- 11. TABLA DE CORREOS INTERNOS (Emails)
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

DROP POLICY IF EXISTS "Permitir ver correos" ON public.emails;
DROP POLICY IF EXISTS "Permitir enviar correos" ON public.emails;
DROP POLICY IF EXISTS "Permitir actualizar correos" ON public.emails;
DROP POLICY IF EXISTS "Permitir eliminar correos" ON public.emails;

CREATE POLICY "Permitir ver correos" ON public.emails FOR SELECT USING (true);
CREATE POLICY "Permitir enviar correos" ON public.emails FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizar correos" ON public.emails FOR UPDATE USING (true);
CREATE POLICY "Permitir eliminar correos" ON public.emails FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_emails_destinatario ON public.emails(destinatario_email);
CREATE INDEX IF NOT EXISTS idx_emails_emisor ON public.emails(emisor_email);
CREATE INDEX IF NOT EXISTS idx_emails_carpeta ON public.emails(carpeta);
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON public.emails(created_at DESC);


-- 12. HABILITAR SUPABASE REALTIME EN TABLAS CLAVE
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.consecutivo;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.emails;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
