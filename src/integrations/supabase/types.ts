export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      candidaturas: {
        Row: {
          atualizada_em: string | null
          criada_em: string | null
          id: string
          mensagem: string | null
          status: Database["public"]["Enums"]["status_candidatura"] | null
          user_id: string
          vaga_id: string
        }
        Insert: {
          atualizada_em?: string | null
          criada_em?: string | null
          id?: string
          mensagem?: string | null
          status?: Database["public"]["Enums"]["status_candidatura"] | null
          user_id: string
          vaga_id: string
        }
        Update: {
          atualizada_em?: string | null
          criada_em?: string | null
          id?: string
          mensagem?: string | null
          status?: Database["public"]["Enums"]["status_candidatura"] | null
          user_id?: string
          vaga_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidaturas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidaturas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidaturas_vaga_id_fkey"
            columns: ["vaga_id"]
            isOneToOne: false
            referencedRelation: "vagas"
            referencedColumns: ["id"]
          },
        ]
      }
      educacao: {
        Row: {
          area: string | null
          concluido: boolean | null
          credencial_url: string | null
          criado_em: string | null
          descricao: string | null
          fim: string | null
          id: string
          inicio: string | null
          instituicao: string
          ordem: number | null
          tipo: Database["public"]["Enums"]["tipo_educacao"]
          titulo: string
          user_id: string
        }
        Insert: {
          area?: string | null
          concluido?: boolean | null
          credencial_url?: string | null
          criado_em?: string | null
          descricao?: string | null
          fim?: string | null
          id?: string
          inicio?: string | null
          instituicao: string
          ordem?: number | null
          tipo: Database["public"]["Enums"]["tipo_educacao"]
          titulo: string
          user_id: string
        }
        Update: {
          area?: string | null
          concluido?: boolean | null
          credencial_url?: string | null
          criado_em?: string | null
          descricao?: string | null
          fim?: string | null
          id?: string
          inicio?: string | null
          instituicao?: string
          ordem?: number | null
          tipo?: Database["public"]["Enums"]["tipo_educacao"]
          titulo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "educacao_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "educacao_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      estudio_convites: {
        Row: {
          aceito: boolean | null
          convidado_por: string
          criado_em: string | null
          email_convidado: string
          estudio_id: string
          expira_em: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          token: string
        }
        Insert: {
          aceito?: boolean | null
          convidado_por: string
          criado_em?: string | null
          email_convidado: string
          estudio_id: string
          expira_em?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          token?: string
        }
        Update: {
          aceito?: boolean | null
          convidado_por?: string
          criado_em?: string | null
          email_convidado?: string
          estudio_id?: string
          expira_em?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "estudio_convites_convidado_por_fkey"
            columns: ["convidado_por"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estudio_convites_convidado_por_fkey"
            columns: ["convidado_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estudio_convites_estudio_id_fkey"
            columns: ["estudio_id"]
            isOneToOne: false
            referencedRelation: "estudios"
            referencedColumns: ["id"]
          },
        ]
      }
      estudio_membros: {
        Row: {
          adicionado_em: string | null
          adicionado_por: string
          ativo: boolean | null
          estudio_id: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          adicionado_em?: string | null
          adicionado_por: string
          ativo?: boolean | null
          estudio_id: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          adicionado_em?: string | null
          adicionado_por?: string
          ativo?: boolean | null
          estudio_id?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estudio_membros_adicionado_por_fkey"
            columns: ["adicionado_por"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estudio_membros_adicionado_por_fkey"
            columns: ["adicionado_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estudio_membros_estudio_id_fkey"
            columns: ["estudio_id"]
            isOneToOne: false
            referencedRelation: "estudios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estudio_membros_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estudio_membros_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      estudios: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          criado_por: string
          descricao: string | null
          especialidades: string[] | null
          fundado_em: string | null
          id: string
          localizacao: string | null
          logo_url: string | null
          nome: string
          slug: string
          sobre: string | null
          tamanho: Database["public"]["Enums"]["tamanho_estudio"] | null
          website: string | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          criado_por: string
          descricao?: string | null
          especialidades?: string[] | null
          fundado_em?: string | null
          id?: string
          localizacao?: string | null
          logo_url?: string | null
          nome: string
          slug: string
          sobre?: string | null
          tamanho?: Database["public"]["Enums"]["tamanho_estudio"] | null
          website?: string | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          criado_por?: string
          descricao?: string | null
          especialidades?: string[] | null
          fundado_em?: string | null
          id?: string
          localizacao?: string | null
          logo_url?: string | null
          nome?: string
          slug?: string
          sobre?: string | null
          tamanho?: Database["public"]["Enums"]["tamanho_estudio"] | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estudios_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estudios_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      experiencia: {
        Row: {
          atualmente_trabalhando: boolean | null
          cidade: string | null
          cidade_ibge_id: number | null
          criado_em: string | null
          descricao: string | null
          empresa: string
          estado: string | null
          estudio_id: string | null
          fim: string | null
          habilidades_usadas: string[] | null
          id: string
          inicio: string
          localizacao: string | null
          ordem: number | null
          remoto: boolean | null
          tipo_emprego: Database["public"]["Enums"]["tipo_emprego"]
          titulo_cargo: string
          user_id: string
        }
        Insert: {
          atualmente_trabalhando?: boolean | null
          cidade?: string | null
          cidade_ibge_id?: number | null
          criado_em?: string | null
          descricao?: string | null
          empresa: string
          estado?: string | null
          estudio_id?: string | null
          fim?: string | null
          habilidades_usadas?: string[] | null
          id?: string
          inicio: string
          localizacao?: string | null
          ordem?: number | null
          remoto?: boolean | null
          tipo_emprego: Database["public"]["Enums"]["tipo_emprego"]
          titulo_cargo: string
          user_id: string
        }
        Update: {
          atualmente_trabalhando?: boolean | null
          cidade?: string | null
          cidade_ibge_id?: number | null
          criado_em?: string | null
          descricao?: string | null
          empresa?: string
          estado?: string | null
          estudio_id?: string | null
          fim?: string | null
          habilidades_usadas?: string[] | null
          id?: string
          inicio?: string
          localizacao?: string | null
          ordem?: number | null
          remoto?: boolean | null
          tipo_emprego?: Database["public"]["Enums"]["tipo_emprego"]
          titulo_cargo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiencia_estudio_id_fkey"
            columns: ["estudio_id"]
            isOneToOne: false
            referencedRelation: "estudios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiencia_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiencia_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      habilidades: {
        Row: {
          categoria: Database["public"]["Enums"]["categoria_habilidade"]
          icone_url: string | null
          id: string
          nome: string
        }
        Insert: {
          categoria: Database["public"]["Enums"]["categoria_habilidade"]
          icone_url?: string | null
          id?: string
          nome: string
        }
        Update: {
          categoria?: Database["public"]["Enums"]["categoria_habilidade"]
          icone_url?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      jogos: {
        Row: {
          criado_em: string | null
          criado_por: string
          data_lancamento: string | null
          descricao: string | null
          destaque: boolean | null
          engine: string | null
          estudio_id: string | null
          genero: string[] | null
          id: string
          imagem_capa_url: string | null
          ordem: number | null
          plataformas: string[] | null
          site_url: string | null
          slug: string | null
          status: Database["public"]["Enums"]["status_jogo"]
          steam_url: string | null
          titulo: string
          trailer_url: string | null
          user_id: string | null
        }
        Insert: {
          criado_em?: string | null
          criado_por: string
          data_lancamento?: string | null
          descricao?: string | null
          destaque?: boolean | null
          engine?: string | null
          estudio_id?: string | null
          genero?: string[] | null
          id?: string
          imagem_capa_url?: string | null
          ordem?: number | null
          plataformas?: string[] | null
          site_url?: string | null
          slug?: string | null
          status: Database["public"]["Enums"]["status_jogo"]
          steam_url?: string | null
          titulo: string
          trailer_url?: string | null
          user_id?: string | null
        }
        Update: {
          criado_em?: string | null
          criado_por?: string
          data_lancamento?: string | null
          descricao?: string | null
          destaque?: boolean | null
          engine?: string | null
          estudio_id?: string | null
          genero?: string[] | null
          id?: string
          imagem_capa_url?: string | null
          ordem?: number | null
          plataformas?: string[] | null
          site_url?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["status_jogo"]
          steam_url?: string | null
          titulo?: string
          trailer_url?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jogos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jogos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jogos_estudio_id_fkey"
            columns: ["estudio_id"]
            isOneToOne: false
            referencedRelation: "estudios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jogos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jogos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      projeto_habilidades: {
        Row: {
          habilidade_id: string
          id: string
          projeto_id: string
        }
        Insert: {
          habilidade_id: string
          id?: string
          projeto_id: string
        }
        Update: {
          habilidade_id?: string
          id?: string
          projeto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projeto_habilidades_habilidade_id_fkey"
            columns: ["habilidade_id"]
            isOneToOne: false
            referencedRelation: "habilidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_habilidades_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      projetos: {
        Row: {
          atualizado_em: string | null
          codigo_url: string | null
          criado_em: string | null
          demo_url: string | null
          descricao_completa: string | null
          descricao_curta: string | null
          destaque: boolean | null
          em_andamento: boolean | null
          fim: string | null
          id: string
          imagem_capa_url: string | null
          inicio: string | null
          ordem: number | null
          papel: string | null
          slug: string | null
          status: Database["public"]["Enums"]["status_projeto"]
          tipo: Database["public"]["Enums"]["tipo_projeto"]
          titulo: string
          user_id: string
          video_url: string | null
          visualizacoes: number | null
        }
        Insert: {
          atualizado_em?: string | null
          codigo_url?: string | null
          criado_em?: string | null
          demo_url?: string | null
          descricao_completa?: string | null
          descricao_curta?: string | null
          destaque?: boolean | null
          em_andamento?: boolean | null
          fim?: string | null
          id?: string
          imagem_capa_url?: string | null
          inicio?: string | null
          ordem?: number | null
          papel?: string | null
          slug?: string | null
          status: Database["public"]["Enums"]["status_projeto"]
          tipo: Database["public"]["Enums"]["tipo_projeto"]
          titulo: string
          user_id: string
          video_url?: string | null
          visualizacoes?: number | null
        }
        Update: {
          atualizado_em?: string | null
          codigo_url?: string | null
          criado_em?: string | null
          demo_url?: string | null
          descricao_completa?: string | null
          descricao_curta?: string | null
          destaque?: boolean | null
          em_andamento?: boolean | null
          fim?: string | null
          id?: string
          imagem_capa_url?: string | null
          inicio?: string | null
          ordem?: number | null
          papel?: string | null
          slug?: string | null
          status?: Database["public"]["Enums"]["status_projeto"]
          tipo?: Database["public"]["Enums"]["tipo_projeto"]
          titulo?: string
          user_id?: string
          video_url?: string | null
          visualizacoes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projetos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_habilidades: {
        Row: {
          anos_experiencia: number | null
          habilidade_id: string
          id: string
          nivel: Database["public"]["Enums"]["nivel_habilidade"]
          ordem: number | null
          user_id: string
        }
        Insert: {
          anos_experiencia?: number | null
          habilidade_id: string
          id?: string
          nivel?: Database["public"]["Enums"]["nivel_habilidade"]
          ordem?: number | null
          user_id: string
        }
        Update: {
          anos_experiencia?: number | null
          habilidade_id?: string
          id?: string
          nivel?: Database["public"]["Enums"]["nivel_habilidade"]
          ordem?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_habilidades_habilidade_id_fkey"
            columns: ["habilidade_id"]
            isOneToOne: false
            referencedRelation: "habilidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_habilidades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_habilidades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          atualizado_em: string | null
          avatar_url: string | null
          bio_curta: string | null
          criado_em: string | null
          disponivel_para_trabalho: boolean | null
          email: string
          github_url: string | null
          id: string
          linkedin_url: string | null
          localizacao: string | null
          mostrar_email: boolean | null
          mostrar_telefone: boolean | null
          nome_completo: string
          nome_exibicao: string | null
          portfolio_url: string | null
          slug: string
          sobre: string | null
          telefone: string | null
          tipo_trabalho_preferido:
            | Database["public"]["Enums"]["tipo_trabalho"][]
            | null
          titulo_profissional: string | null
          website: string | null
        }
        Insert: {
          atualizado_em?: string | null
          avatar_url?: string | null
          bio_curta?: string | null
          criado_em?: string | null
          disponivel_para_trabalho?: boolean | null
          email: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          localizacao?: string | null
          mostrar_email?: boolean | null
          mostrar_telefone?: boolean | null
          nome_completo: string
          nome_exibicao?: string | null
          portfolio_url?: string | null
          slug: string
          sobre?: string | null
          telefone?: string | null
          tipo_trabalho_preferido?:
            | Database["public"]["Enums"]["tipo_trabalho"][]
            | null
          titulo_profissional?: string | null
          website?: string | null
        }
        Update: {
          atualizado_em?: string | null
          avatar_url?: string | null
          bio_curta?: string | null
          criado_em?: string | null
          disponivel_para_trabalho?: boolean | null
          email?: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          localizacao?: string | null
          mostrar_email?: boolean | null
          mostrar_telefone?: boolean | null
          nome_completo?: string
          nome_exibicao?: string | null
          portfolio_url?: string | null
          slug?: string
          sobre?: string | null
          telefone?: string | null
          tipo_trabalho_preferido?:
            | Database["public"]["Enums"]["tipo_trabalho"][]
            | null
          titulo_profissional?: string | null
          website?: string | null
        }
        Relationships: []
      }
      vaga_habilidades: {
        Row: {
          habilidade_id: string
          id: string
          obrigatoria: boolean | null
          vaga_id: string
        }
        Insert: {
          habilidade_id: string
          id?: string
          obrigatoria?: boolean | null
          vaga_id: string
        }
        Update: {
          habilidade_id?: string
          id?: string
          obrigatoria?: boolean | null
          vaga_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaga_habilidades_habilidade_id_fkey"
            columns: ["habilidade_id"]
            isOneToOne: false
            referencedRelation: "habilidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaga_habilidades_vaga_id_fkey"
            columns: ["vaga_id"]
            isOneToOne: false
            referencedRelation: "vagas"
            referencedColumns: ["id"]
          },
        ]
      }
      vagas: {
        Row: {
          ativa: boolean | null
          atualizada_em: string | null
          criada_em: string | null
          criada_por: string
          descricao: string
          estudio_id: string
          expira_em: string | null
          id: string
          localizacao: string | null
          mostrar_salario: boolean | null
          nivel: Database["public"]["Enums"]["nivel_vaga"]
          remoto: Database["public"]["Enums"]["tipo_trabalho"]
          salario_max: number | null
          salario_min: number | null
          slug: string
          tipo_contrato: Database["public"]["Enums"]["tipo_contrato"]
          tipo_funcao: string[]
          tipo_publicacao:
            | Database["public"]["Enums"]["tipo_publicacao_vaga"]
            | null
          titulo: string
          visualizacoes: number | null
        }
        Insert: {
          ativa?: boolean | null
          atualizada_em?: string | null
          criada_em?: string | null
          criada_por: string
          descricao: string
          estudio_id: string
          expira_em?: string | null
          id?: string
          localizacao?: string | null
          mostrar_salario?: boolean | null
          nivel: Database["public"]["Enums"]["nivel_vaga"]
          remoto: Database["public"]["Enums"]["tipo_trabalho"]
          salario_max?: number | null
          salario_min?: number | null
          slug: string
          tipo_contrato: Database["public"]["Enums"]["tipo_contrato"]
          tipo_funcao: string[]
          tipo_publicacao?:
            | Database["public"]["Enums"]["tipo_publicacao_vaga"]
            | null
          titulo: string
          visualizacoes?: number | null
        }
        Update: {
          ativa?: boolean | null
          atualizada_em?: string | null
          criada_em?: string | null
          criada_por?: string
          descricao?: string
          estudio_id?: string
          expira_em?: string | null
          id?: string
          localizacao?: string | null
          mostrar_salario?: boolean | null
          nivel?: Database["public"]["Enums"]["nivel_vaga"]
          remoto?: Database["public"]["Enums"]["tipo_trabalho"]
          salario_max?: number | null
          salario_min?: number | null
          slug?: string
          tipo_contrato?: Database["public"]["Enums"]["tipo_contrato"]
          tipo_funcao?: string[]
          tipo_publicacao?:
            | Database["public"]["Enums"]["tipo_publicacao_vaga"]
            | null
          titulo?: string
          visualizacoes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vagas_criada_por_fkey"
            columns: ["criada_por"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vagas_criada_por_fkey"
            columns: ["criada_por"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vagas_estudio_id_fkey"
            columns: ["estudio_id"]
            isOneToOne: false
            referencedRelation: "estudios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio_curta: string | null
          criado_em: string | null
          disponivel_para_trabalho: boolean | null
          email: string | null
          github_url: string | null
          id: string | null
          linkedin_url: string | null
          localizacao: string | null
          nome_exibicao: string | null
          portfolio_url: string | null
          slug: string | null
          sobre: string | null
          telefone: string | null
          tipo_trabalho_preferido:
            | Database["public"]["Enums"]["tipo_trabalho"][]
            | null
          titulo_profissional: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio_curta?: string | null
          criado_em?: string | null
          disponivel_para_trabalho?: boolean | null
          email?: never
          github_url?: string | null
          id?: string | null
          linkedin_url?: string | null
          localizacao?: string | null
          nome_exibicao?: string | null
          portfolio_url?: string | null
          slug?: string | null
          sobre?: string | null
          telefone?: never
          tipo_trabalho_preferido?:
            | Database["public"]["Enums"]["tipo_trabalho"][]
            | null
          titulo_profissional?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio_curta?: string | null
          criado_em?: string | null
          disponivel_para_trabalho?: boolean | null
          email?: never
          github_url?: string | null
          id?: string | null
          linkedin_url?: string | null
          localizacao?: string | null
          nome_exibicao?: string | null
          portfolio_url?: string | null
          slug?: string | null
          sobre?: string | null
          telefone?: never
          tipo_trabalho_preferido?:
            | Database["public"]["Enums"]["tipo_trabalho"][]
            | null
          titulo_profissional?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_slug_availability: {
        Args: { slug_to_check: string }
        Returns: boolean
      }
      expirar_vagas_antigas: { Args: never; Returns: number }
    }
    Enums: {
      categoria_habilidade: "engine" | "linguagem" | "ferramenta" | "soft_skill"
      nivel_habilidade: "basico" | "intermediario" | "avancado" | "expert"
      nivel_vaga: "iniciante" | "junior" | "pleno" | "senior" | "lead"
      status_candidatura:
        | "pendente"
        | "visualizada"
        | "rejeitada"
        | "entrevista"
        | "contratado"
      status_jogo: "lancado" | "em_desenvolvimento" | "cancelado"
      status_projeto: "publicado" | "em_desenvolvimento" | "arquivado"
      tamanho_estudio: "micro" | "pequeno" | "medio" | "grande"
      tipo_contrato: "clt" | "pj" | "freelance" | "estagio"
      tipo_educacao: "graduacao" | "pos" | "tecnico" | "curso" | "certificacao"
      tipo_emprego: "clt" | "pj" | "freelance" | "estagio"
      tipo_projeto: "profissional" | "pessoal" | "game_jam" | "open_source"
      tipo_publicacao_vaga: "gratuita" | "destaque"
      tipo_trabalho: "presencial" | "hibrido" | "remoto"
      user_role: "super_admin" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      categoria_habilidade: ["engine", "linguagem", "ferramenta", "soft_skill"],
      nivel_habilidade: ["basico", "intermediario", "avancado", "expert"],
      nivel_vaga: ["iniciante", "junior", "pleno", "senior", "lead"],
      status_candidatura: [
        "pendente",
        "visualizada",
        "rejeitada",
        "entrevista",
        "contratado",
      ],
      status_jogo: ["lancado", "em_desenvolvimento", "cancelado"],
      status_projeto: ["publicado", "em_desenvolvimento", "arquivado"],
      tamanho_estudio: ["micro", "pequeno", "medio", "grande"],
      tipo_contrato: ["clt", "pj", "freelance", "estagio"],
      tipo_educacao: ["graduacao", "pos", "tecnico", "curso", "certificacao"],
      tipo_emprego: ["clt", "pj", "freelance", "estagio"],
      tipo_projeto: ["profissional", "pessoal", "game_jam", "open_source"],
      tipo_publicacao_vaga: ["gratuita", "destaque"],
      tipo_trabalho: ["presencial", "hibrido", "remoto"],
      user_role: ["super_admin", "member"],
    },
  },
} as const
