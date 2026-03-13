drop extension if exists "pg_net";

create type "public"."categoria_habilidade" as enum ('habilidades', 'softwares');

create type "public"."engine_projeto" as enum ('unity', 'unreal', 'godot', 'gamemaker', 'construct', 'rpg_maker', 'defold', 'cocos', 'pygame', 'custom', 'renpy', 'heaps', 'bevy', 'flax', 'cryengine', 'source_2', 'gdevelop', 'solar2d', 'bitsy', 'pico_8', 'adventure_game_studio', 'openfl', 'monogame', 'stride', 'outro');

create type "public"."especialidade_estudio" as enum ('Mobile', 'PC', 'Console', 'VR', 'Casual', 'Indie', 'AA', 'AAA', 'F2P');

create type "public"."genero_projeto" as enum ('acao', 'aventura', 'rpg', 'estrategia', 'simulacao', 'esportes', 'corrida', 'puzzle', 'plataforma', 'terror', 'ficcao_cientifica', 'casual', 'idle', 'tower_defense', 'battle_royale', 'mmo', 'visual_novel', 'metroidvania', 'roguelike', 'roguelite', 'soulslike', 'sandbox', 'sobrevivencia', 'musical', 'luta', 'tiro_fps', 'tiro_tps', 'card_game', 'party_game', 'educativo', 'hack_and_slash', 'stealth', 'point_and_click', 'walking_simulator', 'bullet_hell', 'shoot_em_up', 'beat_em_up', 'jrpg', 'wrpg', 'tactical_rpg', 'dungeon_crawler', 'arpg', 'rts', 'tbs', 'grand_strategy', '4x', 'auto_battler', 'tycoon', 'life_sim', 'farming_sim', 'god_game', 'immersive_sim', 'survivors_like', 'hidden_object', 'social_deduction', 'trivia', 'pinball', 'ritmo', 'fmv', 'terror_psicologico', 'survival_horror', 'moba', 'clicker', 'deckbuilder', 'metajogo', 'noir', 'fantasia', 'cyberpunk', 'steampunk', 'outro');

create type "public"."modalidade_trabalho" as enum ('presencial', 'hibrido', 'remoto');

create type "public"."nivel_habilidade" as enum ('basico', 'intermediario', 'avancado', 'expert');

create type "public"."nivel_vaga" as enum ('iniciante', 'junior', 'pleno', 'senior', 'lead');

create type "public"."plataforma_projeto" as enum ('pc_windows', 'pc_linux', 'pc_macos', 'mobile_android', 'mobile_ios', 'console_playstation_4', 'console_playstation_5', 'console_xbox_one', 'console_xbox_series', 'console_nintendo_switch', 'web_browser', 'vr_meta_quest', 'vr_steamvr', 'vr_psvr', 'ar_core', 'ar_kit', 'arcade', 'cloud_gaming', 'handheld_retro', 'outro');

create type "public"."status_candidatura" as enum ('pendente', 'visualizada', 'rejeitada', 'entrevista', 'contratado');

create type "public"."status_jogo" as enum ('lancado', 'em_desenvolvimento', 'cancelado');

create type "public"."status_projeto" as enum ('em_andamento', 'concluido', 'pausado');

create type "public"."tamanho_estudio" as enum ('micro', 'pequeno', 'medio', 'grande');

create type "public"."tipo_educacao" as enum ('graduacao', 'pos', 'tecnico', 'curso', 'certificacao', 'ensino_medio', 'mestrado', 'doutorado', 'mba');

create type "public"."tipo_emprego" as enum ('clt', 'pj', 'freelancer', 'estagio', 'tempo_integral');

create type "public"."tipo_projeto" as enum ('profissional', 'pessoal', 'game_jam', 'open_source', 'jogo');

create type "public"."tipo_publicacao_vaga" as enum ('gratuita', 'destaque');

create type "public"."tipo_trabalho" as enum ('presencial', 'hibrido', 'remoto');

create type "public"."user_role" as enum ('super_admin', 'member');


  create table "public"."candidaturas" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "vaga_id" uuid not null,
    "user_id" uuid not null,
    "mensagem" text,
    "status" public.status_candidatura default 'pendente'::public.status_candidatura,
    "criada_em" timestamp with time zone default now(),
    "atualizada_em" timestamp with time zone default now()
      );


alter table "public"."candidaturas" enable row level security;


  create table "public"."cargos_experiencia" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "experiencia_id" uuid not null,
    "titulo_cargo" text not null,
    "tipo_emprego" public.tipo_emprego not null,
    "descricao" text,
    "habilidades_usadas" uuid[],
    "inicio" date not null,
    "fim" date,
    "atualmente_trabalhando" boolean default false,
    "ordem" integer default 0
      );


alter table "public"."cargos_experiencia" enable row level security;


  create table "public"."educacao" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "instituicao" text not null,
    "tipo" public.tipo_educacao not null,
    "titulo" text not null,
    "area" text,
    "inicio" character varying(7),
    "fim" character varying(7),
    "concluido" boolean default false,
    "descricao" text,
    "credencial_url" text,
    "ordem" integer default 0,
    "criado_em" timestamp with time zone default now()
      );


alter table "public"."educacao" enable row level security;


  create table "public"."estudio_convites" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "estudio_id" uuid not null,
    "email_convidado" text not null,
    "role" public.user_role not null,
    "convidado_por" uuid not null,
    "token" text not null default encode(extensions.gen_random_bytes(32), 'hex'::text),
    "aceito" boolean default false,
    "criado_em" timestamp with time zone default now(),
    "expira_em" timestamp with time zone default (now() + '7 days'::interval)
      );


alter table "public"."estudio_convites" enable row level security;


  create table "public"."estudio_membros" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "estudio_id" uuid not null,
    "user_id" uuid not null,
    "role" public.user_role not null default 'member'::public.user_role,
    "adicionado_por" uuid not null,
    "adicionado_em" timestamp with time zone default now(),
    "ativo" boolean default true
      );


alter table "public"."estudio_membros" enable row level security;


  create table "public"."estudios" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "nome" text not null,
    "slug" text not null,
    "logo_url" text,
    "website" text,
    "tamanho" public.tamanho_estudio,
    "sobre" text,
    "fundado_em" date,
    "especialidades" public.especialidade_estudio[],
    "criado_por" uuid not null,
    "criado_em" timestamp with time zone default now(),
    "atualizado_em" timestamp with time zone default now(),
    "estado" text,
    "cidade" text,
    "linkedin_url" text,
    "github_url" text,
    "artstation_url" text,
    "dribbble_url" text,
    "behance_url" text,
    "facebook_url" text,
    "instagram_url" text,
    "itch_url" text,
    "pinterest_url" text,
    "steam_url" text,
    "telegram_url" text,
    "youtube_url" text,
    "twitch_url" text,
    "twitter_url" text,
    "search_vector" tsvector generated always as ((setweight(to_tsvector('portuguese'::regconfig, COALESCE(nome, ''::text)), 'A'::"char") || setweight(to_tsvector('portuguese'::regconfig, COALESCE(sobre, ''::text)), 'B'::"char"))) stored
      );


alter table "public"."estudios" enable row level security;


  create table "public"."eventos" (
    "id" uuid not null default gen_random_uuid(),
    "criado_por" uuid not null,
    "nome" text not null,
    "descricao" text,
    "data_inicio" timestamp with time zone not null,
    "data_fim" timestamp with time zone not null,
    "modalidade" text not null,
    "estado" text,
    "cidade" text,
    "endereco" text,
    "link_externo" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."eventos" enable row level security;


  create table "public"."experiencia" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "estudio_id" uuid,
    "empresa" text not null,
    "remoto" public.modalidade_trabalho,
    "ordem" integer default 0,
    "criado_em" timestamp with time zone default now(),
    "cidade" text,
    "estado" text,
    "cidade_ibge_id" integer,
    "titulo_cargo" text not null,
    "tipo_emprego" public.tipo_emprego not null,
    "inicio" character varying(7),
    "fim" character varying(7),
    "atualmente_trabalhando" boolean default false,
    "descricao" text,
    "habilidades_usadas" uuid[]
      );


alter table "public"."experiencia" enable row level security;


  create table "public"."habilidades" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "nome" text not null,
    "categoria" public.categoria_habilidade not null,
    "icone_url" text
      );


alter table "public"."habilidades" enable row level security;


  create table "public"."import_backups" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "import_history_id" uuid,
    "backup_data" jsonb not null,
    "created_at" timestamp without time zone not null default now(),
    "expires_at" timestamp without time zone not null default (now() + '7 days'::interval)
      );


alter table "public"."import_backups" enable row level security;


  create table "public"."import_history" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "imported_at" timestamp without time zone not null default now(),
    "created_at" timestamp without time zone not null default now(),
    "source_type" text not null default 'linkedin_pdf'::text,
    "status" text not null,
    "error_message" text,
    "items_imported" jsonb,
    "processing_time_ms" integer
      );


alter table "public"."import_history" enable row level security;


  create table "public"."pagamentos" (
    "id" uuid not null default gen_random_uuid(),
    "estudio_id" uuid not null,
    "vaga_id" uuid,
    "stripe_session_id" text not null,
    "stripe_payment_id" text,
    "amount" integer not null,
    "currency" text default 'brl'::text,
    "status" text default 'pending'::text,
    "criado_em" timestamp with time zone default now(),
    "atualizado_em" timestamp with time zone default now(),
    "invoice_url" text,
    "invoice_pdf_url" text
      );


alter table "public"."pagamentos" enable row level security;


  create table "public"."projeto_estudios" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "projeto_id" uuid not null,
    "estudio_id" uuid not null,
    "adicionado_por" uuid not null,
    "adicionado_em" timestamp with time zone default now()
      );


alter table "public"."projeto_estudios" enable row level security;


  create table "public"."projeto_habilidades" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "projeto_id" uuid not null,
    "habilidade_id" uuid not null
      );


alter table "public"."projeto_habilidades" enable row level security;


  create table "public"."projetos" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid,
    "titulo" text not null,
    "slug" text,
    "tipo" public.tipo_projeto not null,
    "papel" text,
    "inicio" date,
    "fim" date,
    "status" public.status_projeto not null,
    "destaque" boolean default false,
    "imagem_capa_url" text,
    "video_url" text,
    "demo_url" text,
    "codigo_url" text,
    "ordem" integer default 0,
    "visualizacoes" integer default 0,
    "criado_em" timestamp with time zone default now(),
    "atualizado_em" timestamp with time zone default now(),
    "descricao" text,
    "descricao_rich" jsonb,
    "estudio_id" uuid,
    "plataformas" public.plataforma_projeto[],
    "genero" public.genero_projeto[],
    "engine" public.engine_projeto,
    "steam_url" text,
    "search_vector" tsvector generated always as ((setweight(to_tsvector('portuguese'::regconfig, COALESCE(titulo, ''::text)), 'A'::"char") || setweight(to_tsvector('portuguese'::regconfig, COALESCE(descricao, ''::text)), 'B'::"char"))) stored
      );


alter table "public"."projetos" enable row level security;


  create table "public"."tipos_funcao" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "nome" text not null,
    "ativo" boolean not null default true,
    "ordem" integer not null default 0
      );


alter table "public"."tipos_funcao" enable row level security;


  create table "public"."user_habilidades" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "habilidade_id" uuid not null,
    "nivel" public.nivel_habilidade not null default 'basico'::public.nivel_habilidade,
    "anos_experiencia" integer,
    "ordem" integer default 0
      );


alter table "public"."user_habilidades" enable row level security;


  create table "public"."user_ui_states" (
    "user_id" uuid not null,
    "key" text not null,
    "seen_at" timestamp with time zone not null default now()
      );


alter table "public"."user_ui_states" enable row level security;


  create table "public"."users" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "email" text not null,
    "nome_completo" text not null,
    "slug" text not null,
    "avatar_url" text,
    "titulo_profissional" text,
    "website" text,
    "bio_curta" text,
    "sobre" text,
    "disponivel_para_trabalho" boolean default false,
    "tipo_trabalho_preferido" public.tipo_trabalho[],
    "linkedin_url" text,
    "github_url" text,
    "portfolio_url" text,
    "telefone" text,
    "mostrar_email" boolean default false,
    "mostrar_telefone" boolean default false,
    "criado_em" timestamp with time zone default now(),
    "atualizado_em" timestamp with time zone default now(),
    "banner_url" text,
    "estado" text,
    "cidade" text,
    "pronomes" text,
    "artstation_url" text,
    "dribbble_url" text,
    "behance_url" text,
    "facebook_url" text,
    "instagram_url" text,
    "itch_url" text,
    "pinterest_url" text,
    "steam_url" text,
    "telegram_url" text,
    "youtube_url" text,
    "twitch_url" text,
    "twitter_url" text,
    "search_vector" tsvector generated always as (((setweight(to_tsvector('portuguese'::regconfig, COALESCE(nome_completo, ''::text)), 'A'::"char") || setweight(to_tsvector('portuguese'::regconfig, COALESCE(titulo_profissional, ''::text)), 'B'::"char")) || setweight(to_tsvector('portuguese'::regconfig, COALESCE(bio_curta, ''::text)), 'C'::"char"))) stored
      );


alter table "public"."users" enable row level security;


  create table "public"."vaga_habilidades" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "vaga_id" uuid not null,
    "habilidade_id" uuid not null,
    "obrigatoria" boolean default true
      );


alter table "public"."vaga_habilidades" enable row level security;


  create table "public"."vaga_tipos_funcao" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "vaga_id" uuid not null,
    "tipo_funcao_id" uuid not null
      );


alter table "public"."vaga_tipos_funcao" enable row level security;


  create table "public"."vagas" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "estudio_id" uuid not null,
    "criada_por" uuid not null,
    "titulo" text not null,
    "slug" text not null,
    "descricao" text not null,
    "nivel" public.nivel_vaga not null,
    "tipo_emprego" public.tipo_emprego not null,
    "remoto" public.modalidade_trabalho not null,
    "salario_min" integer,
    "salario_max" integer,
    "mostrar_salario" boolean default false,
    "tipo_publicacao" public.tipo_publicacao_vaga default 'gratuita'::public.tipo_publicacao_vaga,
    "ativa" boolean default true,
    "visualizacoes" integer default 0,
    "criada_em" timestamp with time zone default now(),
    "atualizada_em" timestamp with time zone default now(),
    "expira_em" timestamp with time zone default (now() + '30 days'::interval),
    "contato_candidatura" text,
    "status" text default 'publicada'::text,
    "estado" text,
    "cidade" text
      );


alter table "public"."vagas" enable row level security;

CREATE UNIQUE INDEX candidaturas_pkey ON public.candidaturas USING btree (id);

CREATE INDEX candidaturas_user_id_idx ON public.candidaturas USING btree (user_id);

CREATE INDEX candidaturas_vaga_id_idx ON public.candidaturas USING btree (vaga_id);

CREATE UNIQUE INDEX candidaturas_vaga_id_user_id_key ON public.candidaturas USING btree (vaga_id, user_id);

CREATE INDEX candidaturas_vaga_status_idx ON public.candidaturas USING btree (vaga_id, status);

CREATE UNIQUE INDEX cargos_experiencia_pkey ON public.cargos_experiencia USING btree (id);

CREATE UNIQUE INDEX educacao_pkey ON public.educacao USING btree (id);

CREATE INDEX educacao_user_id_idx ON public.educacao USING btree (user_id);

CREATE INDEX estudio_convites_convidado_por_idx ON public.estudio_convites USING btree (convidado_por);

CREATE INDEX estudio_convites_estudio_id_idx ON public.estudio_convites USING btree (estudio_id);

CREATE UNIQUE INDEX estudio_convites_pkey ON public.estudio_convites USING btree (id);

CREATE UNIQUE INDEX estudio_convites_token_key ON public.estudio_convites USING btree (token);

CREATE INDEX estudio_membros_adicionado_por_idx ON public.estudio_membros USING btree (adicionado_por);

CREATE INDEX estudio_membros_estudio_id_idx ON public.estudio_membros USING btree (estudio_id);

CREATE UNIQUE INDEX estudio_membros_estudio_id_user_id_key ON public.estudio_membros USING btree (estudio_id, user_id);

CREATE UNIQUE INDEX estudio_membros_pkey ON public.estudio_membros USING btree (id);

CREATE INDEX estudio_membros_user_id_idx ON public.estudio_membros USING btree (user_id);

CREATE INDEX estudios_criado_por_idx ON public.estudios USING btree (criado_por);

CREATE INDEX estudios_especialidades_idx ON public.estudios USING gin (especialidades);

CREATE INDEX estudios_estado_criado_em_idx ON public.estudios USING btree (estado, criado_em DESC);

CREATE UNIQUE INDEX estudios_pkey ON public.estudios USING btree (id);

CREATE INDEX estudios_search_vector_idx ON public.estudios USING gin (search_vector);

CREATE UNIQUE INDEX estudios_slug_key ON public.estudios USING btree (slug);

CREATE INDEX estudios_tamanho_idx ON public.estudios USING btree (tamanho) WHERE (tamanho IS NOT NULL);

CREATE INDEX eventos_criado_por_idx ON public.eventos USING btree (criado_por);

CREATE INDEX eventos_data_inicio_idx ON public.eventos USING btree (data_inicio);

CREATE INDEX eventos_estado_cidade_idx ON public.eventos USING btree (estado, cidade);

CREATE INDEX eventos_modalidade_data_idx ON public.eventos USING btree (modalidade, data_inicio);

CREATE UNIQUE INDEX eventos_pkey ON public.eventos USING btree (id);

CREATE INDEX experiencia_estudio_id_idx ON public.experiencia USING btree (estudio_id);

CREATE UNIQUE INDEX experiencia_pkey ON public.experiencia USING btree (id);

CREATE INDEX experiencia_user_id_idx ON public.experiencia USING btree (user_id);

CREATE INDEX experiencia_user_ordem_idx ON public.experiencia USING btree (user_id, ordem);

CREATE UNIQUE INDEX habilidades_nome_key ON public.habilidades USING btree (nome);

CREATE UNIQUE INDEX habilidades_pkey ON public.habilidades USING btree (id);

CREATE INDEX idx_candidaturas_user ON public.candidaturas USING btree (user_id);

CREATE INDEX idx_candidaturas_vaga ON public.candidaturas USING btree (vaga_id);

CREATE INDEX idx_convites_token ON public.estudio_convites USING btree (token);

CREATE INDEX idx_educacao_user ON public.educacao USING btree (user_id);

CREATE INDEX idx_estudio_membros_estudio ON public.estudio_membros USING btree (estudio_id);

CREATE INDEX idx_estudio_membros_estudio_user ON public.estudio_membros USING btree (estudio_id, user_id);

CREATE INDEX idx_estudio_membros_user ON public.estudio_membros USING btree (user_id);

CREATE INDEX idx_estudio_membros_user_role_ativo ON public.estudio_membros USING btree (user_id, role, ativo);

CREATE INDEX idx_estudios_loc ON public.estudios USING btree (estado, cidade);

CREATE INDEX idx_experiencia_cidade ON public.experiencia USING btree (cidade) WHERE (cidade IS NOT NULL);

CREATE INDEX idx_experiencia_estado ON public.experiencia USING btree (estado) WHERE (estado IS NOT NULL);

CREATE INDEX idx_experiencia_loc ON public.experiencia USING btree (estado, cidade);

CREATE INDEX idx_experiencia_user ON public.experiencia USING btree (user_id);

CREATE INDEX idx_import_backups_expires ON public.import_backups USING btree (expires_at);

CREATE INDEX idx_import_backups_user ON public.import_backups USING btree (user_id);

CREATE INDEX idx_import_history_status ON public.import_history USING btree (status);

CREATE INDEX idx_import_history_user_date ON public.import_history USING btree (user_id, imported_at DESC);

CREATE INDEX idx_projeto_estudios_estudio_id ON public.projeto_estudios USING btree (estudio_id);

CREATE INDEX idx_projeto_estudios_projeto_id ON public.projeto_estudios USING btree (projeto_id);

CREATE INDEX idx_projetos_user ON public.projetos USING btree (user_id);

CREATE INDEX idx_tipos_funcao_ativo_ordem ON public.tipos_funcao USING btree (ativo, ordem);

CREATE INDEX idx_user_habilidades_user ON public.user_habilidades USING btree (user_id);

CREATE INDEX idx_users_loc ON public.users USING btree (estado, cidade);

CREATE INDEX idx_vaga_tipos_funcao_tipo_funcao_id ON public.vaga_tipos_funcao USING btree (tipo_funcao_id);

CREATE INDEX idx_vaga_tipos_funcao_vaga_id ON public.vaga_tipos_funcao USING btree (vaga_id);

CREATE INDEX idx_vagas_ativa ON public.vagas USING btree (ativa);

CREATE INDEX idx_vagas_estudio ON public.vagas USING btree (estudio_id);

CREATE INDEX idx_vagas_estudio_id ON public.vagas USING btree (estudio_id);

CREATE INDEX idx_vagas_expira ON public.vagas USING btree (expira_em);

CREATE INDEX idx_vagas_loc ON public.vagas USING btree (estado, cidade);

CREATE UNIQUE INDEX import_backups_pkey ON public.import_backups USING btree (id);

CREATE UNIQUE INDEX import_history_pkey ON public.import_history USING btree (id);

CREATE INDEX pagamentos_estudio_id_idx ON public.pagamentos USING btree (estudio_id);

CREATE UNIQUE INDEX pagamentos_pkey ON public.pagamentos USING btree (id);

CREATE INDEX pagamentos_stripe_session_id_idx ON public.pagamentos USING btree (stripe_session_id);

CREATE UNIQUE INDEX pagamentos_stripe_session_id_key ON public.pagamentos USING btree (stripe_session_id);

CREATE INDEX pagamentos_vaga_id_idx ON public.pagamentos USING btree (vaga_id);

CREATE UNIQUE INDEX projeto_estudios_pkey ON public.projeto_estudios USING btree (id);

CREATE UNIQUE INDEX projeto_estudios_unique ON public.projeto_estudios USING btree (projeto_id, estudio_id);

CREATE INDEX projeto_habilidades_habilidade_id_idx ON public.projeto_habilidades USING btree (habilidade_id);

CREATE UNIQUE INDEX projeto_habilidades_pkey ON public.projeto_habilidades USING btree (id);

CREATE UNIQUE INDEX projeto_habilidades_projeto_id_habilidade_id_key ON public.projeto_habilidades USING btree (projeto_id, habilidade_id);

CREATE INDEX projeto_habilidades_projeto_id_idx ON public.projeto_habilidades USING btree (projeto_id);

CREATE INDEX projetos_criado_em_idx ON public.projetos USING btree (criado_em DESC, id DESC);

CREATE INDEX projetos_engine_idx ON public.projetos USING btree (engine) WHERE (engine IS NOT NULL);

CREATE INDEX projetos_genero_idx ON public.projetos USING gin (genero);

CREATE UNIQUE INDEX projetos_pkey ON public.projetos USING btree (id);

CREATE INDEX projetos_plataformas_idx ON public.projetos USING gin (plataformas);

CREATE INDEX projetos_search_vector_idx ON public.projetos USING gin (search_vector);

CREATE INDEX projetos_user_id_idx ON public.projetos USING btree (user_id);

CREATE INDEX projetos_user_ordem_idx ON public.projetos USING btree (user_id, ordem);

CREATE UNIQUE INDEX tipos_funcao_nome_unique ON public.tipos_funcao USING btree (nome);

CREATE UNIQUE INDEX tipos_funcao_pkey ON public.tipos_funcao USING btree (id);

CREATE INDEX user_habilidades_habilidade_id_idx ON public.user_habilidades USING btree (habilidade_id);

CREATE UNIQUE INDEX user_habilidades_pkey ON public.user_habilidades USING btree (id);

CREATE UNIQUE INDEX user_habilidades_user_id_habilidade_id_key ON public.user_habilidades USING btree (user_id, habilidade_id);

CREATE INDEX user_habilidades_user_id_idx ON public.user_habilidades USING btree (user_id);

CREATE UNIQUE INDEX user_ui_states_pkey ON public.user_ui_states USING btree (user_id, key);

CREATE INDEX user_ui_states_user_id_idx ON public.user_ui_states USING btree (user_id);

CREATE INDEX users_disponivel_estado_idx ON public.users USING btree (estado, criado_em DESC) WHERE (disponivel_para_trabalho = true);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE INDEX users_search_vector_idx ON public.users USING gin (search_vector);

CREATE UNIQUE INDEX users_slug_key ON public.users USING btree (slug);

CREATE INDEX users_tipo_trabalho_idx ON public.users USING gin (tipo_trabalho_preferido);

CREATE INDEX vaga_habilidades_habilidade_id_idx ON public.vaga_habilidades USING btree (habilidade_id);

CREATE UNIQUE INDEX vaga_habilidades_pkey ON public.vaga_habilidades USING btree (id);

CREATE UNIQUE INDEX vaga_habilidades_vaga_id_habilidade_id_key ON public.vaga_habilidades USING btree (vaga_id, habilidade_id);

CREATE INDEX vaga_habilidades_vaga_id_idx ON public.vaga_habilidades USING btree (vaga_id);

CREATE UNIQUE INDEX vaga_tipos_funcao_pkey ON public.vaga_tipos_funcao USING btree (id);

CREATE UNIQUE INDEX vaga_tipos_funcao_unique ON public.vaga_tipos_funcao USING btree (vaga_id, tipo_funcao_id);

CREATE INDEX vagas_criada_por_idx ON public.vagas USING btree (criada_por);

CREATE INDEX vagas_estudio_ativa_idx ON public.vagas USING btree (estudio_id, ativa) WHERE (ativa = true);

CREATE INDEX vagas_estudio_id_idx ON public.vagas USING btree (estudio_id);

CREATE UNIQUE INDEX vagas_estudio_id_slug_key ON public.vagas USING btree (estudio_id, slug);

CREATE UNIQUE INDEX vagas_pkey ON public.vagas USING btree (id);

alter table "public"."candidaturas" add constraint "candidaturas_pkey" PRIMARY KEY using index "candidaturas_pkey";

alter table "public"."cargos_experiencia" add constraint "cargos_experiencia_pkey" PRIMARY KEY using index "cargos_experiencia_pkey";

alter table "public"."educacao" add constraint "educacao_pkey" PRIMARY KEY using index "educacao_pkey";

alter table "public"."estudio_convites" add constraint "estudio_convites_pkey" PRIMARY KEY using index "estudio_convites_pkey";

alter table "public"."estudio_membros" add constraint "estudio_membros_pkey" PRIMARY KEY using index "estudio_membros_pkey";

alter table "public"."estudios" add constraint "estudios_pkey" PRIMARY KEY using index "estudios_pkey";

alter table "public"."eventos" add constraint "eventos_pkey" PRIMARY KEY using index "eventos_pkey";

alter table "public"."experiencia" add constraint "experiencia_pkey" PRIMARY KEY using index "experiencia_pkey";

alter table "public"."habilidades" add constraint "habilidades_pkey" PRIMARY KEY using index "habilidades_pkey";

alter table "public"."import_backups" add constraint "import_backups_pkey" PRIMARY KEY using index "import_backups_pkey";

alter table "public"."import_history" add constraint "import_history_pkey" PRIMARY KEY using index "import_history_pkey";

alter table "public"."pagamentos" add constraint "pagamentos_pkey" PRIMARY KEY using index "pagamentos_pkey";

alter table "public"."projeto_estudios" add constraint "projeto_estudios_pkey" PRIMARY KEY using index "projeto_estudios_pkey";

alter table "public"."projeto_habilidades" add constraint "projeto_habilidades_pkey" PRIMARY KEY using index "projeto_habilidades_pkey";

alter table "public"."projetos" add constraint "projetos_pkey" PRIMARY KEY using index "projetos_pkey";

alter table "public"."tipos_funcao" add constraint "tipos_funcao_pkey" PRIMARY KEY using index "tipos_funcao_pkey";

alter table "public"."user_habilidades" add constraint "user_habilidades_pkey" PRIMARY KEY using index "user_habilidades_pkey";

alter table "public"."user_ui_states" add constraint "user_ui_states_pkey" PRIMARY KEY using index "user_ui_states_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."vaga_habilidades" add constraint "vaga_habilidades_pkey" PRIMARY KEY using index "vaga_habilidades_pkey";

alter table "public"."vaga_tipos_funcao" add constraint "vaga_tipos_funcao_pkey" PRIMARY KEY using index "vaga_tipos_funcao_pkey";

alter table "public"."vagas" add constraint "vagas_pkey" PRIMARY KEY using index "vagas_pkey";

alter table "public"."candidaturas" add constraint "candidaturas_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."candidaturas" validate constraint "candidaturas_user_id_fkey";

alter table "public"."candidaturas" add constraint "candidaturas_vaga_id_fkey" FOREIGN KEY (vaga_id) REFERENCES public.vagas(id) ON DELETE CASCADE not valid;

alter table "public"."candidaturas" validate constraint "candidaturas_vaga_id_fkey";

alter table "public"."candidaturas" add constraint "candidaturas_vaga_id_user_id_key" UNIQUE using index "candidaturas_vaga_id_user_id_key";

alter table "public"."cargos_experiencia" add constraint "cargos_experiencia_experiencia_id_fkey" FOREIGN KEY (experiencia_id) REFERENCES public.experiencia(id) ON DELETE CASCADE not valid;

alter table "public"."cargos_experiencia" validate constraint "cargos_experiencia_experiencia_id_fkey";

alter table "public"."educacao" add constraint "educacao_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."educacao" validate constraint "educacao_user_id_fkey";

alter table "public"."estudio_convites" add constraint "estudio_convites_convidado_por_fkey" FOREIGN KEY (convidado_por) REFERENCES public.users(id) not valid;

alter table "public"."estudio_convites" validate constraint "estudio_convites_convidado_por_fkey";

alter table "public"."estudio_convites" add constraint "estudio_convites_estudio_id_fkey" FOREIGN KEY (estudio_id) REFERENCES public.estudios(id) ON DELETE CASCADE not valid;

alter table "public"."estudio_convites" validate constraint "estudio_convites_estudio_id_fkey";

alter table "public"."estudio_convites" add constraint "estudio_convites_token_key" UNIQUE using index "estudio_convites_token_key";

alter table "public"."estudio_membros" add constraint "estudio_membros_adicionado_por_fkey" FOREIGN KEY (adicionado_por) REFERENCES public.users(id) not valid;

alter table "public"."estudio_membros" validate constraint "estudio_membros_adicionado_por_fkey";

alter table "public"."estudio_membros" add constraint "estudio_membros_estudio_id_fkey" FOREIGN KEY (estudio_id) REFERENCES public.estudios(id) ON DELETE CASCADE not valid;

alter table "public"."estudio_membros" validate constraint "estudio_membros_estudio_id_fkey";

alter table "public"."estudio_membros" add constraint "estudio_membros_estudio_id_user_id_key" UNIQUE using index "estudio_membros_estudio_id_user_id_key";

alter table "public"."estudio_membros" add constraint "estudio_membros_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."estudio_membros" validate constraint "estudio_membros_user_id_fkey";

alter table "public"."estudios" add constraint "estudios_criado_por_fkey" FOREIGN KEY (criado_por) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."estudios" validate constraint "estudios_criado_por_fkey";

alter table "public"."estudios" add constraint "estudios_estado_check" CHECK ((length(estado) = 2)) not valid;

alter table "public"."estudios" validate constraint "estudios_estado_check";

alter table "public"."estudios" add constraint "estudios_slug_key" UNIQUE using index "estudios_slug_key";

alter table "public"."estudios" add constraint "estudios_sobre_check" CHECK ((length(sobre) <= 5000)) not valid;

alter table "public"."estudios" validate constraint "estudios_sobre_check";

alter table "public"."eventos" add constraint "eventos_criado_por_fkey" FOREIGN KEY (criado_por) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."eventos" validate constraint "eventos_criado_por_fkey";

alter table "public"."eventos" add constraint "eventos_datas_check" CHECK ((data_fim >= data_inicio)) not valid;

alter table "public"."eventos" validate constraint "eventos_datas_check";

alter table "public"."eventos" add constraint "eventos_localizacao_check" CHECK (((modalidade = 'online'::text) OR ((modalidade = ANY (ARRAY['presencial'::text, 'hibrido'::text])) AND (estado IS NOT NULL) AND (cidade IS NOT NULL)))) not valid;

alter table "public"."eventos" validate constraint "eventos_localizacao_check";

alter table "public"."eventos" add constraint "eventos_modalidade_check" CHECK ((modalidade = ANY (ARRAY['presencial'::text, 'hibrido'::text, 'online'::text]))) not valid;

alter table "public"."eventos" validate constraint "eventos_modalidade_check";

alter table "public"."experiencia" add constraint "experiencia_estado_check" CHECK ((length(estado) = 2)) not valid;

alter table "public"."experiencia" validate constraint "experiencia_estado_check";

alter table "public"."experiencia" add constraint "experiencia_estudio_id_fkey" FOREIGN KEY (estudio_id) REFERENCES public.estudios(id) ON DELETE SET NULL not valid;

alter table "public"."experiencia" validate constraint "experiencia_estudio_id_fkey";

alter table "public"."experiencia" add constraint "experiencia_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."experiencia" validate constraint "experiencia_user_id_fkey";

alter table "public"."habilidades" add constraint "habilidades_nome_key" UNIQUE using index "habilidades_nome_key";

alter table "public"."import_backups" add constraint "import_backups_import_history_id_fkey" FOREIGN KEY (import_history_id) REFERENCES public.import_history(id) ON DELETE CASCADE not valid;

alter table "public"."import_backups" validate constraint "import_backups_import_history_id_fkey";

alter table "public"."import_backups" add constraint "import_backups_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."import_backups" validate constraint "import_backups_user_id_fkey";

alter table "public"."import_history" add constraint "import_history_status_check" CHECK ((status = ANY (ARRAY['success'::text, 'error'::text, 'processing'::text]))) not valid;

alter table "public"."import_history" validate constraint "import_history_status_check";

alter table "public"."import_history" add constraint "import_history_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."import_history" validate constraint "import_history_user_id_fkey";

alter table "public"."pagamentos" add constraint "pagamentos_estudio_id_fkey" FOREIGN KEY (estudio_id) REFERENCES public.estudios(id) ON DELETE CASCADE not valid;

alter table "public"."pagamentos" validate constraint "pagamentos_estudio_id_fkey";

alter table "public"."pagamentos" add constraint "pagamentos_stripe_session_id_key" UNIQUE using index "pagamentos_stripe_session_id_key";

alter table "public"."pagamentos" add constraint "pagamentos_vaga_id_fkey" FOREIGN KEY (vaga_id) REFERENCES public.vagas(id) ON DELETE SET NULL not valid;

alter table "public"."pagamentos" validate constraint "pagamentos_vaga_id_fkey";

alter table "public"."projeto_estudios" add constraint "projeto_estudios_adicionado_por_fkey" FOREIGN KEY (adicionado_por) REFERENCES public.users(id) not valid;

alter table "public"."projeto_estudios" validate constraint "projeto_estudios_adicionado_por_fkey";

alter table "public"."projeto_estudios" add constraint "projeto_estudios_estudio_id_fkey" FOREIGN KEY (estudio_id) REFERENCES public.estudios(id) ON DELETE CASCADE not valid;

alter table "public"."projeto_estudios" validate constraint "projeto_estudios_estudio_id_fkey";

alter table "public"."projeto_estudios" add constraint "projeto_estudios_projeto_id_fkey" FOREIGN KEY (projeto_id) REFERENCES public.projetos(id) ON DELETE CASCADE not valid;

alter table "public"."projeto_estudios" validate constraint "projeto_estudios_projeto_id_fkey";

alter table "public"."projeto_estudios" add constraint "projeto_estudios_unique" UNIQUE using index "projeto_estudios_unique";

alter table "public"."projeto_habilidades" add constraint "projeto_habilidades_habilidade_id_fkey" FOREIGN KEY (habilidade_id) REFERENCES public.habilidades(id) ON DELETE CASCADE not valid;

alter table "public"."projeto_habilidades" validate constraint "projeto_habilidades_habilidade_id_fkey";

alter table "public"."projeto_habilidades" add constraint "projeto_habilidades_projeto_id_fkey" FOREIGN KEY (projeto_id) REFERENCES public.projetos(id) ON DELETE CASCADE not valid;

alter table "public"."projeto_habilidades" validate constraint "projeto_habilidades_projeto_id_fkey";

alter table "public"."projeto_habilidades" add constraint "projeto_habilidades_projeto_id_habilidade_id_key" UNIQUE using index "projeto_habilidades_projeto_id_habilidade_id_key";

alter table "public"."projetos" add constraint "projetos_descricao_check" CHECK ((length(descricao) <= 1000)) not valid;

alter table "public"."projetos" validate constraint "projetos_descricao_check";

alter table "public"."projetos" add constraint "projetos_estudio_id_fkey" FOREIGN KEY (estudio_id) REFERENCES public.estudios(id) not valid;

alter table "public"."projetos" validate constraint "projetos_estudio_id_fkey";

alter table "public"."projetos" add constraint "projetos_owner_check" CHECK (((user_id IS NOT NULL) OR (estudio_id IS NOT NULL))) not valid;

alter table "public"."projetos" validate constraint "projetos_owner_check";

alter table "public"."projetos" add constraint "projetos_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."projetos" validate constraint "projetos_user_id_fkey";

alter table "public"."tipos_funcao" add constraint "tipos_funcao_nome_unique" UNIQUE using index "tipos_funcao_nome_unique";

alter table "public"."user_habilidades" add constraint "user_habilidades_anos_experiencia_check" CHECK ((anos_experiencia >= 0)) not valid;

alter table "public"."user_habilidades" validate constraint "user_habilidades_anos_experiencia_check";

alter table "public"."user_habilidades" add constraint "user_habilidades_habilidade_id_fkey" FOREIGN KEY (habilidade_id) REFERENCES public.habilidades(id) ON DELETE CASCADE not valid;

alter table "public"."user_habilidades" validate constraint "user_habilidades_habilidade_id_fkey";

alter table "public"."user_habilidades" add constraint "user_habilidades_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_habilidades" validate constraint "user_habilidades_user_id_fkey";

alter table "public"."user_habilidades" add constraint "user_habilidades_user_id_habilidade_id_key" UNIQUE using index "user_habilidades_user_id_habilidade_id_key";

alter table "public"."user_ui_states" add constraint "user_ui_states_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_ui_states" validate constraint "user_ui_states_user_id_fkey";

alter table "public"."users" add constraint "users_bio_curta_check" CHECK ((length(bio_curta) <= 200)) not valid;

alter table "public"."users" validate constraint "users_bio_curta_check";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

alter table "public"."users" add constraint "users_estado_check" CHECK ((length(estado) = 2)) not valid;

alter table "public"."users" validate constraint "users_estado_check";

alter table "public"."users" add constraint "users_pronomes_check" CHECK ((length(pronomes) <= 30)) not valid;

alter table "public"."users" validate constraint "users_pronomes_check";

alter table "public"."users" add constraint "users_slug_key" UNIQUE using index "users_slug_key";

alter table "public"."users" add constraint "users_sobre_check" CHECK ((length(sobre) <= 2000)) not valid;

alter table "public"."users" validate constraint "users_sobre_check";

alter table "public"."vaga_habilidades" add constraint "vaga_habilidades_habilidade_id_fkey" FOREIGN KEY (habilidade_id) REFERENCES public.habilidades(id) ON DELETE CASCADE not valid;

alter table "public"."vaga_habilidades" validate constraint "vaga_habilidades_habilidade_id_fkey";

alter table "public"."vaga_habilidades" add constraint "vaga_habilidades_vaga_id_fkey" FOREIGN KEY (vaga_id) REFERENCES public.vagas(id) ON DELETE CASCADE not valid;

alter table "public"."vaga_habilidades" validate constraint "vaga_habilidades_vaga_id_fkey";

alter table "public"."vaga_habilidades" add constraint "vaga_habilidades_vaga_id_habilidade_id_key" UNIQUE using index "vaga_habilidades_vaga_id_habilidade_id_key";

alter table "public"."vaga_tipos_funcao" add constraint "vaga_tipos_funcao_tipo_funcao_id_fkey" FOREIGN KEY (tipo_funcao_id) REFERENCES public.tipos_funcao(id) ON DELETE RESTRICT not valid;

alter table "public"."vaga_tipos_funcao" validate constraint "vaga_tipos_funcao_tipo_funcao_id_fkey";

alter table "public"."vaga_tipos_funcao" add constraint "vaga_tipos_funcao_unique" UNIQUE using index "vaga_tipos_funcao_unique";

alter table "public"."vaga_tipos_funcao" add constraint "vaga_tipos_funcao_vaga_id_fkey" FOREIGN KEY (vaga_id) REFERENCES public.vagas(id) ON DELETE CASCADE not valid;

alter table "public"."vaga_tipos_funcao" validate constraint "vaga_tipos_funcao_vaga_id_fkey";

alter table "public"."vagas" add constraint "vagas_check" CHECK (((salario_min IS NULL) OR (salario_max IS NULL) OR (salario_max >= salario_min))) not valid;

alter table "public"."vagas" validate constraint "vagas_check";

alter table "public"."vagas" add constraint "vagas_criada_por_fkey" FOREIGN KEY (criada_por) REFERENCES public.users(id) not valid;

alter table "public"."vagas" validate constraint "vagas_criada_por_fkey";

alter table "public"."vagas" add constraint "vagas_estado_check" CHECK ((length(estado) = 2)) not valid;

alter table "public"."vagas" validate constraint "vagas_estado_check";

alter table "public"."vagas" add constraint "vagas_estudio_id_fkey" FOREIGN KEY (estudio_id) REFERENCES public.estudios(id) ON DELETE CASCADE not valid;

alter table "public"."vagas" validate constraint "vagas_estudio_id_fkey";

alter table "public"."vagas" add constraint "vagas_estudio_id_slug_key" UNIQUE using index "vagas_estudio_id_slug_key";

alter table "public"."vagas" add constraint "vagas_salario_min_check" CHECK ((salario_min >= 0)) not valid;

alter table "public"."vagas" validate constraint "vagas_salario_min_check";

alter table "public"."vagas" add constraint "vagas_status_check" CHECK ((status = ANY (ARRAY['rascunho'::text, 'aguardando_pagamento'::text, 'publicada'::text, 'expirada'::text]))) not valid;

alter table "public"."vagas" validate constraint "vagas_status_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.accept_studio_invite(invite_token text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_invite RECORD;
  v_user_email TEXT;
  v_user_id UUID;
  v_existing_member UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  SELECT * INTO v_invite FROM estudio_convites WHERE token = invite_token;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'not_found');
  END IF;

  IF v_invite.expira_em < now() THEN
    RETURN json_build_object('success', false, 'error', 'expired');
  END IF;

  IF v_invite.aceito THEN
    RETURN json_build_object('success', false, 'error', 'already_accepted');
  END IF;

  SELECT email INTO v_user_email FROM users WHERE id = v_user_id;
  IF v_user_email IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'no_profile');
  END IF;

  IF lower(v_user_email) != lower(v_invite.email_convidado) THEN
    RETURN json_build_object('success', false, 'error', 'email_mismatch');
  END IF;

  SELECT id INTO v_existing_member
  FROM estudio_membros
  WHERE user_id = v_user_id AND estudio_id = v_invite.estudio_id AND ativo = true;

  IF v_existing_member IS NOT NULL THEN
    UPDATE estudio_convites SET aceito = true WHERE id = v_invite.id;
    RETURN json_build_object('success', true, 'already_member', true);
  END IF;

  INSERT INTO estudio_membros (estudio_id, user_id, role, adicionado_por, ativo)
  VALUES (v_invite.estudio_id, v_user_id, v_invite.role, v_invite.convidado_por, true);

  UPDATE estudio_convites SET aceito = true WHERE id = v_invite.id;

  RETURN json_build_object('success', true, 'already_member', false);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.auto_add_creator_as_super_admin()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO estudio_membros (estudio_id, user_id, role, adicionado_por)
  VALUES (NEW.id, NEW.criado_por, 'super_admin', NEW.criado_por);
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users WHERE email = email_to_check
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_slug_availability(slug_to_check text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  reserved_slugs text[] := ARRAY[
    'project', 'login', 'signup', 'onboarding', 'dashboard', 'settings',
    'support', 'terms', 'privacy', 'jobs', 'studios', 'professionals',
    'projects', 'events', 'invite', 'auth', 'callback', 'admin', 'api',
    'me', 'about', 'help', 'null', 'undefined', 'new', 'edit',
    'forgot-password', 'reset-password'
  ];
BEGIN
  IF slug_to_check = ANY(reserved_slugs) THEN
    RETURN false;
  END IF;

  RETURN NOT EXISTS (
    SELECT 1 FROM users WHERE slug = slug_to_check
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_studio_slug_availability(slug_to_check text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  reserved_slugs text[] := ARRAY[
    'manage', 'new', 'edit', 'login', 'signup', 'settings', 'support',
    'terms', 'privacy', 'jobs', 'admin', 'api', 'null', 'undefined',
    'dashboard', 'profile', 'team', 'billing', 'invite', 'auth', 'callback',
    'about', 'help'
  ];
BEGIN
  IF slug_to_check = ANY(reserved_slugs) THEN
    RETURN false;
  END IF;

  RETURN NOT EXISTS (
    SELECT 1 FROM studios WHERE slug = slug_to_check
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.count_recent_imports(p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  import_count integer;
BEGIN
  SELECT COUNT(*)
  INTO import_count
  FROM import_history
  WHERE user_id = p_user_id
    AND imported_at >= NOW() - INTERVAL '30 days'
    AND status = 'success';
  
  RETURN import_count;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.delete_expired_backups()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  DELETE FROM import_backups
  WHERE expires_at < NOW();
END;
$function$
;

CREATE OR REPLACE FUNCTION public.expirar_vagas_antigas()
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
  rows_affected integer;
BEGIN
  UPDATE vagas
  SET ativa = false
  WHERE expira_em < now() AND ativa = true;
  
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_invite_by_token(invite_token text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'id', c.id,
    'estudio_id', c.estudio_id,
    'email_convidado', c.email_convidado,
    'role', c.role,
    'aceito', c.aceito,
    'expira_em', c.expira_em,
    'estudio_nome', e.nome,
    'estudio_logo_url', e.logo_url
  ) INTO result
  FROM estudio_convites c
  JOIN estudios e ON e.id = c.estudio_id
  WHERE c.token = invite_token;

  RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_estudio_member(p_estudio_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM estudio_membros
    WHERE estudio_id = p_estudio_id
      AND user_id = (SELECT auth.uid())
      AND ativo = true
  );
$function$
;

CREATE OR REPLACE FUNCTION public.prevent_delete_estudio_creator()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF EXISTS (
    SELECT 1 FROM estudios WHERE criado_por = OLD.id
  ) THEN
    RAISE EXCEPTION 'Não pode deletar usuário que criou estúdio. Transfira ownership primeiro.';
  END IF;
  RETURN OLD;
END;
$function$
;

create or replace view "public"."public_profiles" as  SELECT id,
    nome_completo,
    pronomes,
    slug,
    avatar_url,
    banner_url,
    titulo_profissional,
    bio_curta,
    sobre,
    estado,
    cidade,
    website,
    disponivel_para_trabalho,
    tipo_trabalho_preferido,
    linkedin_url,
    github_url,
    portfolio_url,
    twitter_url,
    instagram_url,
    facebook_url,
    youtube_url,
    twitch_url,
    telegram_url,
    artstation_url,
    behance_url,
    dribbble_url,
    itch_url,
    pinterest_url,
    steam_url,
    mostrar_email,
    mostrar_telefone,
        CASE
            WHEN (mostrar_email = true) THEN email
            ELSE NULL::text
        END AS email,
        CASE
            WHEN (mostrar_telefone = true) THEN telefone
            ELSE NULL::text
        END AS telefone
   FROM public.users;


CREATE OR REPLACE FUNCTION public.search_professionals(p_search text DEFAULT NULL::text, p_disponivel boolean DEFAULT NULL::boolean, p_estado text DEFAULT NULL::text, p_tipo_trabalho text[] DEFAULT NULL::text[], p_habilidades uuid[] DEFAULT NULL::uuid[], p_limit integer DEFAULT 20, p_cursor_criado_em timestamp with time zone DEFAULT NULL::timestamp with time zone, p_cursor_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, nome_completo text, slug text, avatar_url text, titulo_profissional text, bio_curta text, cidade text, estado text, disponivel_para_trabalho boolean, tipo_trabalho_preferido text[], habilidades jsonb, total_habilidades integer, criado_em timestamp with time zone, rank real)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    u.id,
    u.nome_completo,
    u.slug,
    u.avatar_url,
    u.titulo_profissional,
    u.bio_curta,
    u.cidade,
    u.estado,
    u.disponivel_para_trabalho,
    u.tipo_trabalho_preferido::text[],
    (
      SELECT coalesce(jsonb_agg(
        jsonb_build_object('id', h.id, 'nome', h.nome, 'categoria', h.categoria)
        ORDER BY
          CASE uh2.nivel
            WHEN 'expert'        THEN 1
            WHEN 'avancado'      THEN 2
            WHEN 'intermediario' THEN 3
            ELSE 4
          END
      ), '[]'::jsonb)
      FROM (
        SELECT uh2.habilidade_id, uh2.nivel
        FROM user_habilidades uh2
        WHERE uh2.user_id = u.id
        ORDER BY
          CASE uh2.nivel
            WHEN 'expert'        THEN 1
            WHEN 'avancado'      THEN 2
            WHEN 'intermediario' THEN 3
            ELSE 4
          END
        LIMIT 5
      ) uh2
      JOIN habilidades h ON h.id = uh2.habilidade_id
    ) AS habilidades,
    (
      SELECT count(*)::int
      FROM user_habilidades uh3
      WHERE uh3.user_id = u.id
    ) AS total_habilidades,
    u.criado_em,
    CASE
      WHEN p_search IS NOT NULL
      THEN ts_rank_cd(u.search_vector, websearch_to_tsquery('portuguese', p_search))
      ELSE 0
    END AS rank
  FROM users u
  WHERE
    (p_search IS NULL OR u.search_vector @@ websearch_to_tsquery('portuguese', p_search))
    AND (p_disponivel IS NULL OR u.disponivel_para_trabalho = p_disponivel)
    AND (p_estado IS NULL OR u.estado = p_estado)
    AND (p_tipo_trabalho IS NULL OR u.tipo_trabalho_preferido::text[] && p_tipo_trabalho)
    AND (
      p_habilidades IS NULL
      OR EXISTS (
        SELECT 1 FROM user_habilidades uh
        WHERE uh.user_id = u.id
          AND uh.habilidade_id = ANY(p_habilidades)
      )
    )
    AND (
      p_cursor_criado_em IS NULL
      OR (u.criado_em, u.id) < (p_cursor_criado_em, p_cursor_id)
    )
  ORDER BY
    CASE
      WHEN p_search IS NOT NULL
      THEN ts_rank_cd(u.search_vector, websearch_to_tsquery('portuguese', p_search))
    END DESC NULLS LAST,
    u.criado_em DESC,
    u.id DESC
  LIMIT p_limit + 1;
$function$
;

CREATE OR REPLACE FUNCTION public.search_projects(p_search text DEFAULT NULL::text, p_engine text DEFAULT NULL::text, p_plataformas text[] DEFAULT NULL::text[], p_genero text[] DEFAULT NULL::text[], p_limit integer DEFAULT 20, p_cursor_criado_em timestamp with time zone DEFAULT NULL::timestamp with time zone, p_cursor_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, titulo text, slug text, tipo text, status text, engine text, plataformas text[], genero text[], imagem_capa_url text, demo_url text, codigo_url text, steam_url text, descricao text, destaque boolean, visualizacoes integer, criado_em timestamp with time zone, rank real, user_id uuid, user_slug text, user_nome text, user_avatar_url text, estudio_id uuid, estudio_slug text, estudio_nome text, estudio_logo_url text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    p.id,
    p.titulo,
    p.slug,
    p.tipo::text,
    p.status::text,
    p.engine::text,
    p.plataformas::text[],
    p.genero::text[],
    p.imagem_capa_url,
    p.demo_url,
    p.codigo_url,
    p.steam_url,
    p.descricao,
    p.destaque,
    p.visualizacoes,
    p.criado_em,
    CASE
      WHEN p_search IS NOT NULL
      THEN ts_rank_cd(p.search_vector, websearch_to_tsquery('portuguese', p_search))
      ELSE 0
    END AS rank,
    u.id              AS user_id,
    u.slug            AS user_slug,
    u.nome_completo   AS user_nome,
    u.avatar_url      AS user_avatar_url,
    e.id              AS estudio_id,
    e.slug            AS estudio_slug,
    e.nome            AS estudio_nome,
    e.logo_url        AS estudio_logo_url
  FROM projetos p
  LEFT JOIN users u ON u.id = p.user_id
  LEFT JOIN estudios e ON e.id = p.estudio_id
  WHERE
    (p_search IS NULL OR p.search_vector @@ websearch_to_tsquery('portuguese', p_search))
    AND (p_engine IS NULL OR p.engine::text = p_engine)
    AND (p_plataformas IS NULL OR p.plataformas::text[] && p_plataformas)
    AND (p_genero IS NULL OR p.genero::text[] && p_genero)
    AND (
      p_cursor_criado_em IS NULL
      OR (p.criado_em, p.id) < (p_cursor_criado_em, p_cursor_id)
    )
  ORDER BY
    CASE
      WHEN p_search IS NOT NULL
      THEN ts_rank_cd(p.search_vector, websearch_to_tsquery('portuguese', p_search))
    END DESC NULLS LAST,
    p.criado_em DESC,
    p.id DESC
  LIMIT p_limit + 1;
$function$
;

CREATE OR REPLACE FUNCTION public.search_studios(p_search text DEFAULT NULL::text, p_estado text DEFAULT NULL::text, p_tamanho text DEFAULT NULL::text, p_especialidades text[] DEFAULT NULL::text[], p_limit integer DEFAULT 20, p_cursor_criado_em timestamp with time zone DEFAULT NULL::timestamp with time zone, p_cursor_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, nome text, slug text, logo_url text, sobre text, cidade text, estado text, tamanho text, especialidades text[], website text, criado_em timestamp with time zone, rank real)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    e.id,
    e.nome,
    e.slug,
    e.logo_url,
    e.sobre,
    e.cidade,
    e.estado,
    e.tamanho::text,
    e.especialidades::text[],
    e.website,
    e.criado_em,
    CASE
      WHEN p_search IS NOT NULL
      THEN ts_rank_cd(e.search_vector, websearch_to_tsquery('portuguese', p_search))
      ELSE 0
    END AS rank
  FROM estudios e
  WHERE
    (p_search IS NULL OR e.search_vector @@ websearch_to_tsquery('portuguese', p_search))
    AND (p_estado IS NULL OR e.estado = p_estado)
    AND (p_tamanho IS NULL OR e.tamanho::text = p_tamanho)
    AND (p_especialidades IS NULL OR e.especialidades::text[] && p_especialidades)
    AND (
      p_cursor_criado_em IS NULL
      OR (e.criado_em, e.id) < (p_cursor_criado_em, p_cursor_id)
    )
  ORDER BY
    CASE
      WHEN p_search IS NOT NULL
      THEN ts_rank_cd(e.search_vector, websearch_to_tsquery('portuguese', p_search))
    END DESC NULLS LAST,
    e.criado_em DESC,
    e.id DESC
  LIMIT p_limit + 1;
$function$
;

CREATE OR REPLACE FUNCTION public.update_atualizada_em_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.atualizada_em = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."candidaturas" to "anon";

grant insert on table "public"."candidaturas" to "anon";

grant references on table "public"."candidaturas" to "anon";

grant select on table "public"."candidaturas" to "anon";

grant trigger on table "public"."candidaturas" to "anon";

grant truncate on table "public"."candidaturas" to "anon";

grant update on table "public"."candidaturas" to "anon";

grant delete on table "public"."candidaturas" to "authenticated";

grant insert on table "public"."candidaturas" to "authenticated";

grant references on table "public"."candidaturas" to "authenticated";

grant select on table "public"."candidaturas" to "authenticated";

grant trigger on table "public"."candidaturas" to "authenticated";

grant truncate on table "public"."candidaturas" to "authenticated";

grant update on table "public"."candidaturas" to "authenticated";

grant delete on table "public"."candidaturas" to "service_role";

grant insert on table "public"."candidaturas" to "service_role";

grant references on table "public"."candidaturas" to "service_role";

grant select on table "public"."candidaturas" to "service_role";

grant trigger on table "public"."candidaturas" to "service_role";

grant truncate on table "public"."candidaturas" to "service_role";

grant update on table "public"."candidaturas" to "service_role";

grant delete on table "public"."cargos_experiencia" to "anon";

grant insert on table "public"."cargos_experiencia" to "anon";

grant references on table "public"."cargos_experiencia" to "anon";

grant select on table "public"."cargos_experiencia" to "anon";

grant trigger on table "public"."cargos_experiencia" to "anon";

grant truncate on table "public"."cargos_experiencia" to "anon";

grant update on table "public"."cargos_experiencia" to "anon";

grant delete on table "public"."cargos_experiencia" to "authenticated";

grant insert on table "public"."cargos_experiencia" to "authenticated";

grant references on table "public"."cargos_experiencia" to "authenticated";

grant select on table "public"."cargos_experiencia" to "authenticated";

grant trigger on table "public"."cargos_experiencia" to "authenticated";

grant truncate on table "public"."cargos_experiencia" to "authenticated";

grant update on table "public"."cargos_experiencia" to "authenticated";

grant delete on table "public"."cargos_experiencia" to "service_role";

grant insert on table "public"."cargos_experiencia" to "service_role";

grant references on table "public"."cargos_experiencia" to "service_role";

grant select on table "public"."cargos_experiencia" to "service_role";

grant trigger on table "public"."cargos_experiencia" to "service_role";

grant truncate on table "public"."cargos_experiencia" to "service_role";

grant update on table "public"."cargos_experiencia" to "service_role";

grant delete on table "public"."educacao" to "anon";

grant insert on table "public"."educacao" to "anon";

grant references on table "public"."educacao" to "anon";

grant select on table "public"."educacao" to "anon";

grant trigger on table "public"."educacao" to "anon";

grant truncate on table "public"."educacao" to "anon";

grant update on table "public"."educacao" to "anon";

grant delete on table "public"."educacao" to "authenticated";

grant insert on table "public"."educacao" to "authenticated";

grant references on table "public"."educacao" to "authenticated";

grant select on table "public"."educacao" to "authenticated";

grant trigger on table "public"."educacao" to "authenticated";

grant truncate on table "public"."educacao" to "authenticated";

grant update on table "public"."educacao" to "authenticated";

grant delete on table "public"."educacao" to "service_role";

grant insert on table "public"."educacao" to "service_role";

grant references on table "public"."educacao" to "service_role";

grant select on table "public"."educacao" to "service_role";

grant trigger on table "public"."educacao" to "service_role";

grant truncate on table "public"."educacao" to "service_role";

grant update on table "public"."educacao" to "service_role";

grant delete on table "public"."estudio_convites" to "anon";

grant insert on table "public"."estudio_convites" to "anon";

grant references on table "public"."estudio_convites" to "anon";

grant select on table "public"."estudio_convites" to "anon";

grant trigger on table "public"."estudio_convites" to "anon";

grant truncate on table "public"."estudio_convites" to "anon";

grant update on table "public"."estudio_convites" to "anon";

grant delete on table "public"."estudio_convites" to "authenticated";

grant insert on table "public"."estudio_convites" to "authenticated";

grant references on table "public"."estudio_convites" to "authenticated";

grant select on table "public"."estudio_convites" to "authenticated";

grant trigger on table "public"."estudio_convites" to "authenticated";

grant truncate on table "public"."estudio_convites" to "authenticated";

grant update on table "public"."estudio_convites" to "authenticated";

grant delete on table "public"."estudio_convites" to "service_role";

grant insert on table "public"."estudio_convites" to "service_role";

grant references on table "public"."estudio_convites" to "service_role";

grant select on table "public"."estudio_convites" to "service_role";

grant trigger on table "public"."estudio_convites" to "service_role";

grant truncate on table "public"."estudio_convites" to "service_role";

grant update on table "public"."estudio_convites" to "service_role";

grant delete on table "public"."estudio_membros" to "anon";

grant insert on table "public"."estudio_membros" to "anon";

grant references on table "public"."estudio_membros" to "anon";

grant select on table "public"."estudio_membros" to "anon";

grant trigger on table "public"."estudio_membros" to "anon";

grant truncate on table "public"."estudio_membros" to "anon";

grant update on table "public"."estudio_membros" to "anon";

grant delete on table "public"."estudio_membros" to "authenticated";

grant insert on table "public"."estudio_membros" to "authenticated";

grant references on table "public"."estudio_membros" to "authenticated";

grant select on table "public"."estudio_membros" to "authenticated";

grant trigger on table "public"."estudio_membros" to "authenticated";

grant truncate on table "public"."estudio_membros" to "authenticated";

grant update on table "public"."estudio_membros" to "authenticated";

grant delete on table "public"."estudio_membros" to "service_role";

grant insert on table "public"."estudio_membros" to "service_role";

grant references on table "public"."estudio_membros" to "service_role";

grant select on table "public"."estudio_membros" to "service_role";

grant trigger on table "public"."estudio_membros" to "service_role";

grant truncate on table "public"."estudio_membros" to "service_role";

grant update on table "public"."estudio_membros" to "service_role";

grant delete on table "public"."estudios" to "anon";

grant insert on table "public"."estudios" to "anon";

grant references on table "public"."estudios" to "anon";

grant select on table "public"."estudios" to "anon";

grant trigger on table "public"."estudios" to "anon";

grant truncate on table "public"."estudios" to "anon";

grant update on table "public"."estudios" to "anon";

grant delete on table "public"."estudios" to "authenticated";

grant insert on table "public"."estudios" to "authenticated";

grant references on table "public"."estudios" to "authenticated";

grant select on table "public"."estudios" to "authenticated";

grant trigger on table "public"."estudios" to "authenticated";

grant truncate on table "public"."estudios" to "authenticated";

grant update on table "public"."estudios" to "authenticated";

grant delete on table "public"."estudios" to "service_role";

grant insert on table "public"."estudios" to "service_role";

grant references on table "public"."estudios" to "service_role";

grant select on table "public"."estudios" to "service_role";

grant trigger on table "public"."estudios" to "service_role";

grant truncate on table "public"."estudios" to "service_role";

grant update on table "public"."estudios" to "service_role";

grant delete on table "public"."eventos" to "anon";

grant insert on table "public"."eventos" to "anon";

grant references on table "public"."eventos" to "anon";

grant select on table "public"."eventos" to "anon";

grant trigger on table "public"."eventos" to "anon";

grant truncate on table "public"."eventos" to "anon";

grant update on table "public"."eventos" to "anon";

grant delete on table "public"."eventos" to "authenticated";

grant insert on table "public"."eventos" to "authenticated";

grant references on table "public"."eventos" to "authenticated";

grant select on table "public"."eventos" to "authenticated";

grant trigger on table "public"."eventos" to "authenticated";

grant truncate on table "public"."eventos" to "authenticated";

grant update on table "public"."eventos" to "authenticated";

grant delete on table "public"."eventos" to "service_role";

grant insert on table "public"."eventos" to "service_role";

grant references on table "public"."eventos" to "service_role";

grant select on table "public"."eventos" to "service_role";

grant trigger on table "public"."eventos" to "service_role";

grant truncate on table "public"."eventos" to "service_role";

grant update on table "public"."eventos" to "service_role";

grant delete on table "public"."experiencia" to "anon";

grant insert on table "public"."experiencia" to "anon";

grant references on table "public"."experiencia" to "anon";

grant select on table "public"."experiencia" to "anon";

grant trigger on table "public"."experiencia" to "anon";

grant truncate on table "public"."experiencia" to "anon";

grant update on table "public"."experiencia" to "anon";

grant delete on table "public"."experiencia" to "authenticated";

grant insert on table "public"."experiencia" to "authenticated";

grant references on table "public"."experiencia" to "authenticated";

grant select on table "public"."experiencia" to "authenticated";

grant trigger on table "public"."experiencia" to "authenticated";

grant truncate on table "public"."experiencia" to "authenticated";

grant update on table "public"."experiencia" to "authenticated";

grant delete on table "public"."experiencia" to "service_role";

grant insert on table "public"."experiencia" to "service_role";

grant references on table "public"."experiencia" to "service_role";

grant select on table "public"."experiencia" to "service_role";

grant trigger on table "public"."experiencia" to "service_role";

grant truncate on table "public"."experiencia" to "service_role";

grant update on table "public"."experiencia" to "service_role";

grant delete on table "public"."habilidades" to "anon";

grant insert on table "public"."habilidades" to "anon";

grant references on table "public"."habilidades" to "anon";

grant select on table "public"."habilidades" to "anon";

grant trigger on table "public"."habilidades" to "anon";

grant truncate on table "public"."habilidades" to "anon";

grant update on table "public"."habilidades" to "anon";

grant delete on table "public"."habilidades" to "authenticated";

grant insert on table "public"."habilidades" to "authenticated";

grant references on table "public"."habilidades" to "authenticated";

grant select on table "public"."habilidades" to "authenticated";

grant trigger on table "public"."habilidades" to "authenticated";

grant truncate on table "public"."habilidades" to "authenticated";

grant update on table "public"."habilidades" to "authenticated";

grant delete on table "public"."habilidades" to "service_role";

grant insert on table "public"."habilidades" to "service_role";

grant references on table "public"."habilidades" to "service_role";

grant select on table "public"."habilidades" to "service_role";

grant trigger on table "public"."habilidades" to "service_role";

grant truncate on table "public"."habilidades" to "service_role";

grant update on table "public"."habilidades" to "service_role";

grant delete on table "public"."import_backups" to "anon";

grant insert on table "public"."import_backups" to "anon";

grant references on table "public"."import_backups" to "anon";

grant select on table "public"."import_backups" to "anon";

grant trigger on table "public"."import_backups" to "anon";

grant truncate on table "public"."import_backups" to "anon";

grant update on table "public"."import_backups" to "anon";

grant delete on table "public"."import_backups" to "authenticated";

grant insert on table "public"."import_backups" to "authenticated";

grant references on table "public"."import_backups" to "authenticated";

grant select on table "public"."import_backups" to "authenticated";

grant trigger on table "public"."import_backups" to "authenticated";

grant truncate on table "public"."import_backups" to "authenticated";

grant update on table "public"."import_backups" to "authenticated";

grant delete on table "public"."import_backups" to "service_role";

grant insert on table "public"."import_backups" to "service_role";

grant references on table "public"."import_backups" to "service_role";

grant select on table "public"."import_backups" to "service_role";

grant trigger on table "public"."import_backups" to "service_role";

grant truncate on table "public"."import_backups" to "service_role";

grant update on table "public"."import_backups" to "service_role";

grant delete on table "public"."import_history" to "anon";

grant insert on table "public"."import_history" to "anon";

grant references on table "public"."import_history" to "anon";

grant select on table "public"."import_history" to "anon";

grant trigger on table "public"."import_history" to "anon";

grant truncate on table "public"."import_history" to "anon";

grant update on table "public"."import_history" to "anon";

grant delete on table "public"."import_history" to "authenticated";

grant insert on table "public"."import_history" to "authenticated";

grant references on table "public"."import_history" to "authenticated";

grant select on table "public"."import_history" to "authenticated";

grant trigger on table "public"."import_history" to "authenticated";

grant truncate on table "public"."import_history" to "authenticated";

grant update on table "public"."import_history" to "authenticated";

grant delete on table "public"."import_history" to "service_role";

grant insert on table "public"."import_history" to "service_role";

grant references on table "public"."import_history" to "service_role";

grant select on table "public"."import_history" to "service_role";

grant trigger on table "public"."import_history" to "service_role";

grant truncate on table "public"."import_history" to "service_role";

grant update on table "public"."import_history" to "service_role";

grant delete on table "public"."pagamentos" to "anon";

grant insert on table "public"."pagamentos" to "anon";

grant references on table "public"."pagamentos" to "anon";

grant select on table "public"."pagamentos" to "anon";

grant trigger on table "public"."pagamentos" to "anon";

grant truncate on table "public"."pagamentos" to "anon";

grant update on table "public"."pagamentos" to "anon";

grant delete on table "public"."pagamentos" to "authenticated";

grant insert on table "public"."pagamentos" to "authenticated";

grant references on table "public"."pagamentos" to "authenticated";

grant select on table "public"."pagamentos" to "authenticated";

grant trigger on table "public"."pagamentos" to "authenticated";

grant truncate on table "public"."pagamentos" to "authenticated";

grant update on table "public"."pagamentos" to "authenticated";

grant delete on table "public"."pagamentos" to "service_role";

grant insert on table "public"."pagamentos" to "service_role";

grant references on table "public"."pagamentos" to "service_role";

grant select on table "public"."pagamentos" to "service_role";

grant trigger on table "public"."pagamentos" to "service_role";

grant truncate on table "public"."pagamentos" to "service_role";

grant update on table "public"."pagamentos" to "service_role";

grant delete on table "public"."projeto_estudios" to "anon";

grant insert on table "public"."projeto_estudios" to "anon";

grant references on table "public"."projeto_estudios" to "anon";

grant select on table "public"."projeto_estudios" to "anon";

grant trigger on table "public"."projeto_estudios" to "anon";

grant truncate on table "public"."projeto_estudios" to "anon";

grant update on table "public"."projeto_estudios" to "anon";

grant delete on table "public"."projeto_estudios" to "authenticated";

grant insert on table "public"."projeto_estudios" to "authenticated";

grant references on table "public"."projeto_estudios" to "authenticated";

grant select on table "public"."projeto_estudios" to "authenticated";

grant trigger on table "public"."projeto_estudios" to "authenticated";

grant truncate on table "public"."projeto_estudios" to "authenticated";

grant update on table "public"."projeto_estudios" to "authenticated";

grant delete on table "public"."projeto_estudios" to "service_role";

grant insert on table "public"."projeto_estudios" to "service_role";

grant references on table "public"."projeto_estudios" to "service_role";

grant select on table "public"."projeto_estudios" to "service_role";

grant trigger on table "public"."projeto_estudios" to "service_role";

grant truncate on table "public"."projeto_estudios" to "service_role";

grant update on table "public"."projeto_estudios" to "service_role";

grant delete on table "public"."projeto_habilidades" to "anon";

grant insert on table "public"."projeto_habilidades" to "anon";

grant references on table "public"."projeto_habilidades" to "anon";

grant select on table "public"."projeto_habilidades" to "anon";

grant trigger on table "public"."projeto_habilidades" to "anon";

grant truncate on table "public"."projeto_habilidades" to "anon";

grant update on table "public"."projeto_habilidades" to "anon";

grant delete on table "public"."projeto_habilidades" to "authenticated";

grant insert on table "public"."projeto_habilidades" to "authenticated";

grant references on table "public"."projeto_habilidades" to "authenticated";

grant select on table "public"."projeto_habilidades" to "authenticated";

grant trigger on table "public"."projeto_habilidades" to "authenticated";

grant truncate on table "public"."projeto_habilidades" to "authenticated";

grant update on table "public"."projeto_habilidades" to "authenticated";

grant delete on table "public"."projeto_habilidades" to "service_role";

grant insert on table "public"."projeto_habilidades" to "service_role";

grant references on table "public"."projeto_habilidades" to "service_role";

grant select on table "public"."projeto_habilidades" to "service_role";

grant trigger on table "public"."projeto_habilidades" to "service_role";

grant truncate on table "public"."projeto_habilidades" to "service_role";

grant update on table "public"."projeto_habilidades" to "service_role";

grant delete on table "public"."projetos" to "anon";

grant insert on table "public"."projetos" to "anon";

grant references on table "public"."projetos" to "anon";

grant select on table "public"."projetos" to "anon";

grant trigger on table "public"."projetos" to "anon";

grant truncate on table "public"."projetos" to "anon";

grant update on table "public"."projetos" to "anon";

grant delete on table "public"."projetos" to "authenticated";

grant insert on table "public"."projetos" to "authenticated";

grant references on table "public"."projetos" to "authenticated";

grant select on table "public"."projetos" to "authenticated";

grant trigger on table "public"."projetos" to "authenticated";

grant truncate on table "public"."projetos" to "authenticated";

grant update on table "public"."projetos" to "authenticated";

grant delete on table "public"."projetos" to "service_role";

grant insert on table "public"."projetos" to "service_role";

grant references on table "public"."projetos" to "service_role";

grant select on table "public"."projetos" to "service_role";

grant trigger on table "public"."projetos" to "service_role";

grant truncate on table "public"."projetos" to "service_role";

grant update on table "public"."projetos" to "service_role";

grant delete on table "public"."tipos_funcao" to "anon";

grant insert on table "public"."tipos_funcao" to "anon";

grant references on table "public"."tipos_funcao" to "anon";

grant select on table "public"."tipos_funcao" to "anon";

grant trigger on table "public"."tipos_funcao" to "anon";

grant truncate on table "public"."tipos_funcao" to "anon";

grant update on table "public"."tipos_funcao" to "anon";

grant delete on table "public"."tipos_funcao" to "authenticated";

grant insert on table "public"."tipos_funcao" to "authenticated";

grant references on table "public"."tipos_funcao" to "authenticated";

grant select on table "public"."tipos_funcao" to "authenticated";

grant trigger on table "public"."tipos_funcao" to "authenticated";

grant truncate on table "public"."tipos_funcao" to "authenticated";

grant update on table "public"."tipos_funcao" to "authenticated";

grant delete on table "public"."tipos_funcao" to "service_role";

grant insert on table "public"."tipos_funcao" to "service_role";

grant references on table "public"."tipos_funcao" to "service_role";

grant select on table "public"."tipos_funcao" to "service_role";

grant trigger on table "public"."tipos_funcao" to "service_role";

grant truncate on table "public"."tipos_funcao" to "service_role";

grant update on table "public"."tipos_funcao" to "service_role";

grant delete on table "public"."user_habilidades" to "anon";

grant insert on table "public"."user_habilidades" to "anon";

grant references on table "public"."user_habilidades" to "anon";

grant select on table "public"."user_habilidades" to "anon";

grant trigger on table "public"."user_habilidades" to "anon";

grant truncate on table "public"."user_habilidades" to "anon";

grant update on table "public"."user_habilidades" to "anon";

grant delete on table "public"."user_habilidades" to "authenticated";

grant insert on table "public"."user_habilidades" to "authenticated";

grant references on table "public"."user_habilidades" to "authenticated";

grant select on table "public"."user_habilidades" to "authenticated";

grant trigger on table "public"."user_habilidades" to "authenticated";

grant truncate on table "public"."user_habilidades" to "authenticated";

grant update on table "public"."user_habilidades" to "authenticated";

grant delete on table "public"."user_habilidades" to "service_role";

grant insert on table "public"."user_habilidades" to "service_role";

grant references on table "public"."user_habilidades" to "service_role";

grant select on table "public"."user_habilidades" to "service_role";

grant trigger on table "public"."user_habilidades" to "service_role";

grant truncate on table "public"."user_habilidades" to "service_role";

grant update on table "public"."user_habilidades" to "service_role";

grant delete on table "public"."user_ui_states" to "anon";

grant insert on table "public"."user_ui_states" to "anon";

grant references on table "public"."user_ui_states" to "anon";

grant select on table "public"."user_ui_states" to "anon";

grant trigger on table "public"."user_ui_states" to "anon";

grant truncate on table "public"."user_ui_states" to "anon";

grant update on table "public"."user_ui_states" to "anon";

grant delete on table "public"."user_ui_states" to "authenticated";

grant insert on table "public"."user_ui_states" to "authenticated";

grant references on table "public"."user_ui_states" to "authenticated";

grant select on table "public"."user_ui_states" to "authenticated";

grant trigger on table "public"."user_ui_states" to "authenticated";

grant truncate on table "public"."user_ui_states" to "authenticated";

grant update on table "public"."user_ui_states" to "authenticated";

grant delete on table "public"."user_ui_states" to "service_role";

grant insert on table "public"."user_ui_states" to "service_role";

grant references on table "public"."user_ui_states" to "service_role";

grant select on table "public"."user_ui_states" to "service_role";

grant trigger on table "public"."user_ui_states" to "service_role";

grant truncate on table "public"."user_ui_states" to "service_role";

grant update on table "public"."user_ui_states" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

grant delete on table "public"."vaga_habilidades" to "anon";

grant insert on table "public"."vaga_habilidades" to "anon";

grant references on table "public"."vaga_habilidades" to "anon";

grant select on table "public"."vaga_habilidades" to "anon";

grant trigger on table "public"."vaga_habilidades" to "anon";

grant truncate on table "public"."vaga_habilidades" to "anon";

grant update on table "public"."vaga_habilidades" to "anon";

grant delete on table "public"."vaga_habilidades" to "authenticated";

grant insert on table "public"."vaga_habilidades" to "authenticated";

grant references on table "public"."vaga_habilidades" to "authenticated";

grant select on table "public"."vaga_habilidades" to "authenticated";

grant trigger on table "public"."vaga_habilidades" to "authenticated";

grant truncate on table "public"."vaga_habilidades" to "authenticated";

grant update on table "public"."vaga_habilidades" to "authenticated";

grant delete on table "public"."vaga_habilidades" to "service_role";

grant insert on table "public"."vaga_habilidades" to "service_role";

grant references on table "public"."vaga_habilidades" to "service_role";

grant select on table "public"."vaga_habilidades" to "service_role";

grant trigger on table "public"."vaga_habilidades" to "service_role";

grant truncate on table "public"."vaga_habilidades" to "service_role";

grant update on table "public"."vaga_habilidades" to "service_role";

grant delete on table "public"."vaga_tipos_funcao" to "anon";

grant insert on table "public"."vaga_tipos_funcao" to "anon";

grant references on table "public"."vaga_tipos_funcao" to "anon";

grant select on table "public"."vaga_tipos_funcao" to "anon";

grant trigger on table "public"."vaga_tipos_funcao" to "anon";

grant truncate on table "public"."vaga_tipos_funcao" to "anon";

grant update on table "public"."vaga_tipos_funcao" to "anon";

grant delete on table "public"."vaga_tipos_funcao" to "authenticated";

grant insert on table "public"."vaga_tipos_funcao" to "authenticated";

grant references on table "public"."vaga_tipos_funcao" to "authenticated";

grant select on table "public"."vaga_tipos_funcao" to "authenticated";

grant trigger on table "public"."vaga_tipos_funcao" to "authenticated";

grant truncate on table "public"."vaga_tipos_funcao" to "authenticated";

grant update on table "public"."vaga_tipos_funcao" to "authenticated";

grant delete on table "public"."vaga_tipos_funcao" to "service_role";

grant insert on table "public"."vaga_tipos_funcao" to "service_role";

grant references on table "public"."vaga_tipos_funcao" to "service_role";

grant select on table "public"."vaga_tipos_funcao" to "service_role";

grant trigger on table "public"."vaga_tipos_funcao" to "service_role";

grant truncate on table "public"."vaga_tipos_funcao" to "service_role";

grant update on table "public"."vaga_tipos_funcao" to "service_role";

grant delete on table "public"."vagas" to "anon";

grant insert on table "public"."vagas" to "anon";

grant references on table "public"."vagas" to "anon";

grant select on table "public"."vagas" to "anon";

grant trigger on table "public"."vagas" to "anon";

grant truncate on table "public"."vagas" to "anon";

grant update on table "public"."vagas" to "anon";

grant delete on table "public"."vagas" to "authenticated";

grant insert on table "public"."vagas" to "authenticated";

grant references on table "public"."vagas" to "authenticated";

grant select on table "public"."vagas" to "authenticated";

grant trigger on table "public"."vagas" to "authenticated";

grant truncate on table "public"."vagas" to "authenticated";

grant update on table "public"."vagas" to "authenticated";

grant delete on table "public"."vagas" to "service_role";

grant insert on table "public"."vagas" to "service_role";

grant references on table "public"."vagas" to "service_role";

grant select on table "public"."vagas" to "service_role";

grant trigger on table "public"."vagas" to "service_role";

grant truncate on table "public"."vagas" to "service_role";

grant update on table "public"."vagas" to "service_role";


  create policy "Super admin atualiza candidaturas"
  on "public"."candidaturas"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM (public.vagas v
     JOIN public.estudio_membros em ON ((em.estudio_id = v.estudio_id)))
  WHERE ((v.id = candidaturas.vaga_id) AND (em.user_id = ( SELECT auth.uid() AS uid)) AND (em.role = 'super_admin'::public.user_role) AND (em.ativo = true)))));



  create policy "Super admin vê candidaturas do estúdio"
  on "public"."candidaturas"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM (public.vagas v
     JOIN public.estudio_membros em ON ((em.estudio_id = v.estudio_id)))
  WHERE ((v.id = candidaturas.vaga_id) AND (em.user_id = ( SELECT auth.uid() AS uid)) AND (em.role = 'super_admin'::public.user_role) AND (em.ativo = true)))));



  create policy "User atualiza suas candidaturas"
  on "public"."candidaturas"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "User se candidata"
  on "public"."candidaturas"
  as permissive
  for insert
  to public
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "User vê suas candidaturas"
  on "public"."candidaturas"
  as permissive
  for select
  to public
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Cargos são públicos"
  on "public"."cargos_experiencia"
  as permissive
  for select
  to public
using (true);



  create policy "User atualiza seus cargos"
  on "public"."cargos_experiencia"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.experiencia
  WHERE ((experiencia.id = cargos_experiencia.experiencia_id) AND (experiencia.user_id = auth.uid())))));



  create policy "User cria seus cargos"
  on "public"."cargos_experiencia"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.experiencia
  WHERE ((experiencia.id = cargos_experiencia.experiencia_id) AND (experiencia.user_id = auth.uid())))));



  create policy "User deleta seus cargos"
  on "public"."cargos_experiencia"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.experiencia
  WHERE ((experiencia.id = cargos_experiencia.experiencia_id) AND (experiencia.user_id = auth.uid())))));



  create policy "User vê seus cargos"
  on "public"."cargos_experiencia"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.experiencia
  WHERE ((experiencia.id = cargos_experiencia.experiencia_id) AND (experiencia.user_id = auth.uid())))));



  create policy "Educações são públicas"
  on "public"."educacao"
  as permissive
  for select
  to public
using (true);



  create policy "User atualiza educações"
  on "public"."educacao"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "User cria educações"
  on "public"."educacao"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "User deleta educações"
  on "public"."educacao"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Super admin cria convites"
  on "public"."estudio_convites"
  as permissive
  for insert
  to public
with check (((EXISTS ( SELECT 1
   FROM public.estudio_membros
  WHERE ((estudio_membros.estudio_id = estudio_convites.estudio_id) AND (estudio_membros.user_id = auth.uid()) AND (estudio_membros.role = 'super_admin'::public.user_role) AND (estudio_membros.ativo = true)))) AND (convidado_por = auth.uid())));



  create policy "Super admin deleta convites"
  on "public"."estudio_convites"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.estudio_membros
  WHERE ((estudio_membros.estudio_id = estudio_convites.estudio_id) AND (estudio_membros.user_id = auth.uid()) AND (estudio_membros.role = 'super_admin'::public.user_role) AND (estudio_membros.ativo = true)))));



  create policy "Super admin gerencia convites"
  on "public"."estudio_convites"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.estudio_membros
  WHERE ((estudio_membros.estudio_id = estudio_convites.estudio_id) AND (estudio_membros.user_id = auth.uid()) AND (estudio_membros.role = 'super_admin'::public.user_role) AND (estudio_membros.ativo = true)))));



  create policy "Super admin vê convites"
  on "public"."estudio_convites"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.estudio_membros
  WHERE ((estudio_membros.estudio_id = estudio_convites.estudio_id) AND (estudio_membros.user_id = auth.uid()) AND (estudio_membros.role = 'super_admin'::public.user_role) AND (estudio_membros.ativo = true)))));



  create policy "Membros visíveis para membros do estúdio"
  on "public"."estudio_membros"
  as permissive
  for select
  to public
using (public.is_estudio_member(estudio_id));



  create policy "Super admin atualiza membros"
  on "public"."estudio_membros"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.estudio_membros em
  WHERE ((em.estudio_id = estudio_membros.estudio_id) AND (em.user_id = auth.uid()) AND (em.role = 'super_admin'::public.user_role) AND (em.ativo = true)))));



  create policy "Super admin cria membros"
  on "public"."estudio_membros"
  as permissive
  for insert
  to public
with check (((EXISTS ( SELECT 1
   FROM public.estudio_membros em
  WHERE ((em.estudio_id = estudio_membros.estudio_id) AND (em.user_id = auth.uid()) AND (em.role = 'super_admin'::public.user_role) AND (em.ativo = true)))) AND (adicionado_por = auth.uid())));



  create policy "Super admin remove membros"
  on "public"."estudio_membros"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.estudio_membros em
  WHERE ((em.estudio_id = estudio_membros.estudio_id) AND (em.user_id = auth.uid()) AND (em.role = 'super_admin'::public.user_role) AND (em.ativo = true)))));



  create policy "Estúdios são públicos"
  on "public"."estudios"
  as permissive
  for select
  to public
using (true);



  create policy "Super admin edita estúdio"
  on "public"."estudios"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.estudio_membros
  WHERE ((estudio_membros.estudio_id = estudios.id) AND (estudio_membros.user_id = ( SELECT auth.uid() AS uid)) AND (estudio_membros.role = 'super_admin'::public.user_role) AND (estudio_membros.ativo = true)))));



  create policy "User cria estúdio"
  on "public"."estudios"
  as permissive
  for insert
  to public
with check ((auth.uid() = criado_por));



  create policy "Criador deleta seu evento"
  on "public"."eventos"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = criado_por));



  create policy "Criador edita seu evento"
  on "public"."eventos"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = criado_por));



  create policy "Eventos são públicos"
  on "public"."eventos"
  as permissive
  for select
  to anon, authenticated
using (true);



  create policy "Usuário autenticado cria evento"
  on "public"."eventos"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = criado_por));



  create policy "Experiências são públicas"
  on "public"."experiencia"
  as permissive
  for select
  to public
using (true);



  create policy "User atualiza experiências"
  on "public"."experiencia"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "User cria experiências"
  on "public"."experiencia"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "User deleta experiências"
  on "public"."experiencia"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Habilidades são públicas"
  on "public"."habilidades"
  as permissive
  for select
  to public
using (true);



  create policy "Users can insert own backups"
  on "public"."import_backups"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can view own backups"
  on "public"."import_backups"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert own import history"
  on "public"."import_history"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can view own import history"
  on "public"."import_history"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Studio ve proprios pagamentos"
  on "public"."pagamentos"
  as permissive
  for select
  to public
using ((estudio_id IN ( SELECT estudio_membros.estudio_id
   FROM public.estudio_membros
  WHERE ((estudio_membros.user_id = auth.uid()) AND (estudio_membros.role = 'super_admin'::public.user_role) AND (estudio_membros.ativo = true)))));



  create policy "Super admin pode desvincular projetos"
  on "public"."projeto_estudios"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.estudio_membros
  WHERE ((estudio_membros.estudio_id = projeto_estudios.estudio_id) AND (estudio_membros.user_id = auth.uid()) AND (estudio_membros.role = 'super_admin'::public.user_role) AND (estudio_membros.ativo = true)))));



  create policy "Super admin pode vincular projetos"
  on "public"."projeto_estudios"
  as permissive
  for insert
  to public
with check (((EXISTS ( SELECT 1
   FROM public.estudio_membros
  WHERE ((estudio_membros.estudio_id = projeto_estudios.estudio_id) AND (estudio_membros.user_id = auth.uid()) AND (estudio_membros.role = 'super_admin'::public.user_role) AND (estudio_membros.ativo = true)))) AND (adicionado_por = auth.uid())));



  create policy "Vínculos projeto-estúdio são públicos"
  on "public"."projeto_estudios"
  as permissive
  for select
  to public
using (true);



  create policy "Habilidades de projetos são públicas"
  on "public"."projeto_habilidades"
  as permissive
  for select
  to public
using (true);



  create policy "User gerencia habilidades de seus projetos (DELETE)"
  on "public"."projeto_habilidades"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.projetos
  WHERE ((projetos.id = projeto_habilidades.projeto_id) AND (projetos.user_id = auth.uid())))));



  create policy "User gerencia habilidades de seus projetos (INSERT)"
  on "public"."projeto_habilidades"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.projetos
  WHERE ((projetos.id = projeto_habilidades.projeto_id) AND (projetos.user_id = auth.uid())))));



  create policy "Projetos são públicos"
  on "public"."projetos"
  as permissive
  for select
  to public
using (true);



  create policy "User atualiza projetos"
  on "public"."projetos"
  as permissive
  for update
  to public
using (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM public.estudio_membros
  WHERE ((estudio_membros.estudio_id = projetos.estudio_id) AND (estudio_membros.user_id = auth.uid()) AND (estudio_membros.ativo = true))))));



  create policy "User cria projetos"
  on "public"."projetos"
  as permissive
  for insert
  to public
with check (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM public.estudio_membros
  WHERE ((estudio_membros.estudio_id = projetos.estudio_id) AND (estudio_membros.user_id = auth.uid()) AND (estudio_membros.ativo = true))))));



  create policy "User deleta projetos"
  on "public"."projetos"
  as permissive
  for delete
  to public
using (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM public.estudio_membros
  WHERE ((estudio_membros.estudio_id = projetos.estudio_id) AND (estudio_membros.user_id = auth.uid()) AND (estudio_membros.ativo = true))))));



  create policy "Tipos de função são públicos"
  on "public"."tipos_funcao"
  as permissive
  for select
  to public
using (true);



  create policy "Habilidades de users são públicas"
  on "public"."user_habilidades"
  as permissive
  for select
  to public
using (true);



  create policy "User atualiza suas habilidades"
  on "public"."user_habilidades"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "User cria suas habilidades"
  on "public"."user_habilidades"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "User deleta suas habilidades"
  on "public"."user_habilidades"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "user_ui_states: delete own"
  on "public"."user_ui_states"
  as permissive
  for delete
  to public
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "user_ui_states: insert own"
  on "public"."user_ui_states"
  as permissive
  for insert
  to public
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "user_ui_states: select own"
  on "public"."user_ui_states"
  as permissive
  for select
  to public
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Perfis são públicos"
  on "public"."users"
  as permissive
  for select
  to public
using (true);



  create policy "User cria seu perfil"
  on "public"."users"
  as permissive
  for insert
  to public
with check ((( SELECT auth.uid() AS uid) = id));



  create policy "User deleta seu perfil"
  on "public"."users"
  as permissive
  for delete
  to public
using ((( SELECT auth.uid() AS uid) = id));



  create policy "User edita seu perfil"
  on "public"."users"
  as permissive
  for update
  to public
using ((( SELECT auth.uid() AS uid) = id));



  create policy "Habilidades de vagas são públicas"
  on "public"."vaga_habilidades"
  as permissive
  for select
  to public
using (true);



  create policy "Super admin gerencia habilidades de vagas (DELETE)"
  on "public"."vaga_habilidades"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM (public.vagas v
     JOIN public.estudio_membros em ON ((em.estudio_id = v.estudio_id)))
  WHERE ((v.id = vaga_habilidades.vaga_id) AND (em.user_id = auth.uid()) AND (em.role = 'super_admin'::public.user_role) AND (em.ativo = true)))));



  create policy "Super admin gerencia habilidades de vagas (INSERT)"
  on "public"."vaga_habilidades"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM (public.vagas v
     JOIN public.estudio_membros em ON ((em.estudio_id = v.estudio_id)))
  WHERE ((v.id = vaga_habilidades.vaga_id) AND (em.user_id = auth.uid()) AND (em.role = 'super_admin'::public.user_role) AND (em.ativo = true)))));



  create policy "Super admin insere tipos de função na vaga"
  on "public"."vaga_tipos_funcao"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM (public.vagas v
     JOIN public.estudio_membros em ON ((em.estudio_id = v.estudio_id)))
  WHERE ((v.id = vaga_tipos_funcao.vaga_id) AND (em.user_id = auth.uid()) AND (em.role = 'super_admin'::public.user_role) AND (em.ativo = true)))));



  create policy "Super admin remove tipos de função da vaga"
  on "public"."vaga_tipos_funcao"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM (public.vagas v
     JOIN public.estudio_membros em ON ((em.estudio_id = v.estudio_id)))
  WHERE ((v.id = vaga_tipos_funcao.vaga_id) AND (em.user_id = auth.uid()) AND (em.role = 'super_admin'::public.user_role) AND (em.ativo = true)))));



  create policy "Tipos de função visíveis conforme visibilidade da vaga"
  on "public"."vaga_tipos_funcao"
  as permissive
  for select
  to public
using (((EXISTS ( SELECT 1
   FROM public.vagas v
  WHERE ((v.id = vaga_tipos_funcao.vaga_id) AND (v.ativa = true) AND (v.expira_em > now())))) OR (EXISTS ( SELECT 1
   FROM (public.vagas v
     JOIN public.estudio_membros em ON ((em.estudio_id = v.estudio_id)))
  WHERE ((v.id = vaga_tipos_funcao.vaga_id) AND (em.user_id = auth.uid()) AND (em.role = 'super_admin'::public.user_role) AND (em.ativo = true))))));



  create policy "Super admin cria vagas"
  on "public"."vagas"
  as permissive
  for insert
  to public
with check (((EXISTS ( SELECT 1
   FROM public.estudio_membros
  WHERE ((estudio_membros.estudio_id = vagas.estudio_id) AND (estudio_membros.user_id = ( SELECT auth.uid() AS uid)) AND (estudio_membros.role = 'super_admin'::public.user_role) AND (estudio_membros.ativo = true)))) AND (criada_por = ( SELECT auth.uid() AS uid))));



  create policy "Super admin deleta vagas"
  on "public"."vagas"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.estudio_membros
  WHERE ((estudio_membros.estudio_id = vagas.estudio_id) AND (estudio_membros.user_id = auth.uid()) AND (estudio_membros.role = 'super_admin'::public.user_role) AND (estudio_membros.ativo = true)))));



  create policy "Super admin edita vagas"
  on "public"."vagas"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.estudio_membros
  WHERE ((estudio_membros.estudio_id = vagas.estudio_id) AND (estudio_membros.user_id = auth.uid()) AND (estudio_membros.role = 'super_admin'::public.user_role) AND (estudio_membros.ativo = true)))));



  create policy "Super admin vê todas vagas do estúdio"
  on "public"."vagas"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.estudio_membros
  WHERE ((estudio_membros.estudio_id = vagas.estudio_id) AND (estudio_membros.user_id = ( SELECT auth.uid() AS uid)) AND (estudio_membros.role = 'super_admin'::public.user_role) AND (estudio_membros.ativo = true)))));



  create policy "Vagas ativas são públicas"
  on "public"."vagas"
  as permissive
  for select
  to public
using (((ativa = true) AND (expira_em > now())));


CREATE TRIGGER update_candidaturas_updated_at BEFORE UPDATE ON public.candidaturas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER add_creator_as_super_admin AFTER INSERT ON public.estudios FOR EACH ROW EXECUTE FUNCTION public.auto_add_creator_as_super_admin();

CREATE TRIGGER update_estudios_updated_at BEFORE UPDATE ON public.estudios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projetos_updated_at BEFORE UPDATE ON public.projetos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER check_estudio_creator_before_delete BEFORE DELETE ON public.users FOR EACH ROW EXECUTE FUNCTION public.prevent_delete_estudio_creator();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vagas_atualizada_em BEFORE UPDATE ON public.vagas FOR EACH ROW EXECUTE FUNCTION public.update_atualizada_em_column();


 