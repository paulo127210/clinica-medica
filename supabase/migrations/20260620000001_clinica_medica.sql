-- ============================================================
--  BANCO DE DADOS: CLÍNICA MÉDICA — PostgreSQL / Supabase
--  Convertido de MySQL 8.0 → PostgreSQL 15+
-- ============================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- TIPOS ENUM
-- ============================================================

DO $$ BEGIN
    CREATE TYPE operacao_enum        AS ENUM ('INSERT','UPDATE','DELETE','SELECT');
    CREATE TYPE sexo_enum            AS ENUM ('M','F','O');
    CREATE TYPE estado_civil_enum    AS ENUM ('SOLTEIRO','CASADO','DIVORCIADO','VIUVO','OUTRO');
    CREATE TYPE tipo_sanguineo_enum  AS ENUM ('A+','A-','B+','B-','AB+','AB-','O+','O-');
    CREATE TYPE tipo_sala_enum       AS ENUM ('CONSULTÓRIO','PROCEDIMENTO','CIRURGIA','EXAME');
    CREATE TYPE status_consulta_enum AS ENUM ('AGENDADA','CONFIRMADA','EM_ATENDIMENTO','REALIZADA','CANCELADA','FALTOU');
    CREATE TYPE tipo_consulta_enum   AS ENUM ('PRIMEIRA_VEZ','RETORNO','URGENCIA');
    CREATE TYPE via_enum             AS ENUM ('ORAL','EV','IM','SC','TOPICA','INALATORIA','OUTRO');
    CREATE TYPE status_fatura_enum   AS ENUM ('PENDENTE','PARCIAL','PAGA','CANCELADA','ESTORNADA');
    CREATE TYPE status_repasse_enum  AS ENUM ('CALCULADO','APROVADO','PAGO');
    CREATE TYPE tipo_alergia_enum    AS ENUM ('MEDICAMENTO','ALIMENTO','AMBIENTAL','OUTRO');
    CREATE TYPE severidade_enum      AS ENUM ('LEVE','MODERADA','GRAVE');
    CREATE TYPE tipo_movest_enum     AS ENUM ('ENTRADA','SAIDA','AJUSTE','PERDA');
    CREATE TYPE tipo_notif_enum      AS ENUM ('INFO','ALERTA','URGENTE');
    CREATE TYPE tipo_comunic_enum    AS ENUM ('SMS','EMAIL','WHATSAPP');
    CREATE TYPE status_comunic_enum  AS ENUM ('PENDENTE','ENVIADO','FALHOU');
    CREATE TYPE tipo_plano_enum      AS ENUM ('ENFERMARIA','APARTAMENTO','VIP');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- SEÇÃO 1: SEGURANÇA E CONTROLE DE ACESSO
-- ============================================================

CREATE TABLE IF NOT EXISTS perfis (
    id          SERIAL PRIMARY KEY,
    nome        VARCHAR(50)  NOT NULL UNIQUE,
    descricao   VARCHAR(255),
    ativo       BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMP    NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE perfis IS 'Perfis de acesso ao sistema';

CREATE TABLE IF NOT EXISTS permissoes (
    id          SERIAL PRIMARY KEY,
    modulo      VARCHAR(60)  NOT NULL,
    acao        VARCHAR(60)  NOT NULL,
    descricao   VARCHAR(255),
    UNIQUE (modulo, acao)
);
COMMENT ON TABLE permissoes IS 'Permissões granulares por módulo e ação';

CREATE TABLE IF NOT EXISTS perfil_permissoes (
    perfil_id     INTEGER NOT NULL REFERENCES perfis(id)    ON DELETE CASCADE,
    permissao_id  INTEGER NOT NULL REFERENCES permissoes(id) ON DELETE CASCADE,
    PRIMARY KEY (perfil_id, permissao_id)
);
COMMENT ON TABLE perfil_permissoes IS 'Relação N:N entre perfis e permissões';

CREATE TABLE IF NOT EXISTS usuarios (
    id               SERIAL PRIMARY KEY,
    perfil_id        INTEGER NOT NULL REFERENCES perfis(id),
    nome             VARCHAR(120) NOT NULL,
    email            VARCHAR(120) NOT NULL UNIQUE,
    senha_hash       VARCHAR(255) NOT NULL,
    salt             VARCHAR(64)  NOT NULL,
    ativo            BOOLEAN      NOT NULL DEFAULT TRUE,
    tentativas_login SMALLINT     NOT NULL DEFAULT 0,
    bloqueado_ate    TIMESTAMP,
    ultimo_login     TIMESTAMP,
    token_reset      VARCHAR(128),
    token_expira_em  TIMESTAMP,
    criado_em        TIMESTAMP    NOT NULL DEFAULT NOW(),
    atualizado_em    TIMESTAMP    NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE usuarios IS 'Usuários do sistema com controle de segurança';

CREATE TABLE IF NOT EXISTS logs_auditoria (
    id           BIGSERIAL PRIMARY KEY,
    usuario_id   INTEGER,
    tabela       VARCHAR(60)    NOT NULL,
    operacao     operacao_enum  NOT NULL,
    registro_id  VARCHAR(40),
    dados_antes  JSONB,
    dados_depois JSONB,
    ip           VARCHAR(45),
    user_agent   VARCHAR(255),
    criado_em    TIMESTAMP      NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE logs_auditoria IS 'Auditoria completa de todas as operações';
CREATE INDEX IF NOT EXISTS idx_audit_tabela     ON logs_auditoria (tabela);
CREATE INDEX IF NOT EXISTS idx_audit_usuario    ON logs_auditoria (usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_criado_em  ON logs_auditoria (criado_em);

CREATE TABLE IF NOT EXISTS sessoes (
    id          VARCHAR(128) PRIMARY KEY,
    usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    ip          VARCHAR(45),
    user_agent  VARCHAR(255),
    criado_em   TIMESTAMP NOT NULL DEFAULT NOW(),
    expira_em   TIMESTAMP NOT NULL
);
COMMENT ON TABLE sessoes IS 'Sessões ativas dos usuários';
CREATE INDEX IF NOT EXISTS idx_sessoes_usuario    ON sessoes (usuario_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_expira_em  ON sessoes (expira_em);

-- ============================================================
-- SEÇÃO 2: ENDEREÇOS
-- ============================================================

CREATE TABLE IF NOT EXISTS enderecos (
    id          SERIAL PRIMARY KEY,
    logradouro  VARCHAR(150) NOT NULL,
    numero      VARCHAR(20),
    complemento VARCHAR(80),
    bairro      VARCHAR(80)  NOT NULL,
    cidade      VARCHAR(80)  NOT NULL,
    estado      CHAR(2)      NOT NULL,
    cep         VARCHAR(9)   NOT NULL,
    pais        VARCHAR(60)  NOT NULL DEFAULT 'Brasil'
);
COMMENT ON TABLE enderecos IS 'Endereços centralizados';
CREATE INDEX IF NOT EXISTS idx_end_cep    ON enderecos (cep);
CREATE INDEX IF NOT EXISTS idx_end_cidade ON enderecos (cidade);

-- ============================================================
-- SEÇÃO 3: ESPECIALIDADES E PROCEDIMENTOS
-- ============================================================

CREATE TABLE IF NOT EXISTS especialidades (
    id         SERIAL PRIMARY KEY,
    nome       VARCHAR(120) NOT NULL UNIQUE,
    codigo_cfm VARCHAR(20),
    ativa      BOOLEAN NOT NULL DEFAULT TRUE
);
COMMENT ON TABLE especialidades IS 'Especialidades médicas';

CREATE TABLE IF NOT EXISTS categorias_procedimentos (
    id   SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);
COMMENT ON TABLE categorias_procedimentos IS 'Categorias de procedimentos';

CREATE TABLE IF NOT EXISTS procedimentos (
    id               SERIAL PRIMARY KEY,
    categoria_id     INTEGER NOT NULL REFERENCES categorias_procedimentos(id),
    codigo_tuss      VARCHAR(20),
    codigo_cbhpm     VARCHAR(20),
    nome             VARCHAR(200) NOT NULL,
    descricao        TEXT,
    valor_particular NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    duracao_minutos  INTEGER       NOT NULL DEFAULT 30,
    ativo            BOOLEAN       NOT NULL DEFAULT TRUE
);
COMMENT ON TABLE procedimentos IS 'Tabela de procedimentos com códigos TUSS/CBHPM';
CREATE INDEX IF NOT EXISTS idx_proc_tuss  ON procedimentos (codigo_tuss);
CREATE INDEX IF NOT EXISTS idx_proc_cbhpm ON procedimentos (codigo_cbhpm);

-- ============================================================
-- SEÇÃO 4: CONVÊNIOS / PLANOS DE SAÚDE
-- ============================================================

CREATE TABLE IF NOT EXISTS convenios (
    id        SERIAL PRIMARY KEY,
    nome      VARCHAR(120) NOT NULL UNIQUE,
    cnpj      VARCHAR(18)  UNIQUE,
    telefone  VARCHAR(20),
    email     VARCHAR(120),
    ativo     BOOLEAN   NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE convenios IS 'Convênios / Operadoras de plano de saúde';

CREATE TABLE IF NOT EXISTS planos_convenio (
    id          SERIAL PRIMARY KEY,
    convenio_id INTEGER NOT NULL REFERENCES convenios(id) ON DELETE CASCADE,
    nome        VARCHAR(120) NOT NULL,
    tipo        tipo_plano_enum NOT NULL DEFAULT 'ENFERMARIA',
    ativo       BOOLEAN NOT NULL DEFAULT TRUE
);
COMMENT ON TABLE planos_convenio IS 'Planos dentro de cada convênio';

CREATE TABLE IF NOT EXISTS convenio_procedimentos (
    plano_id             INTEGER       NOT NULL REFERENCES planos_convenio(id) ON DELETE CASCADE,
    procedimento_id      INTEGER       NOT NULL REFERENCES procedimentos(id)   ON DELETE CASCADE,
    valor_convenio       NUMERIC(10,2) NOT NULL,
    percentual_cobertura NUMERIC(5,2)  NOT NULL DEFAULT 100.00,
    PRIMARY KEY (plano_id, procedimento_id)
);
COMMENT ON TABLE convenio_procedimentos IS 'Tabela de valores por convênio/procedimento';

-- ============================================================
-- SEÇÃO 5: FUNCIONÁRIOS E MÉDICOS
-- ============================================================

CREATE TABLE IF NOT EXISTS cargos (
    id    SERIAL PRIMARY KEY,
    nome  VARCHAR(80) NOT NULL UNIQUE,
    nivel SMALLINT    NOT NULL DEFAULT 1
);
COMMENT ON TABLE cargos IS 'Cargos e hierarquia interna';

CREATE TABLE IF NOT EXISTS funcionarios (
    id              SERIAL PRIMARY KEY,
    usuario_id      INTEGER UNIQUE REFERENCES usuarios(id),
    cargo_id        INTEGER NOT NULL REFERENCES cargos(id),
    endereco_id     INTEGER REFERENCES enderecos(id),
    nome            VARCHAR(120) NOT NULL,
    cpf             VARCHAR(14)  NOT NULL UNIQUE,
    rg              VARCHAR(20),
    data_nascimento DATE,
    sexo            sexo_enum,
    telefone        VARCHAR(20),
    celular         VARCHAR(20),
    email           VARCHAR(120),
    data_admissao   DATE    NOT NULL,
    data_demissao   DATE,
    salario         NUMERIC(10,2),
    ativo           BOOLEAN   NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE funcionarios IS 'Funcionários da clínica';
CREATE INDEX IF NOT EXISTS idx_func_cpf  ON funcionarios (cpf);
CREATE INDEX IF NOT EXISTS idx_func_nome ON funcionarios (nome);

CREATE TABLE IF NOT EXISTS medicos (
    id                 SERIAL PRIMARY KEY,
    funcionario_id     INTEGER NOT NULL UNIQUE REFERENCES funcionarios(id) ON DELETE CASCADE,
    especialidade_id   INTEGER NOT NULL REFERENCES especialidades(id),
    crm                VARCHAR(20)   NOT NULL UNIQUE,
    crm_estado         CHAR(2)       NOT NULL,
    rqe                VARCHAR(20),
    valor_consulta     NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    percentual_repasse NUMERIC(5,2)  NOT NULL DEFAULT 60.00,
    ativo              BOOLEAN       NOT NULL DEFAULT TRUE
);
COMMENT ON TABLE medicos IS 'Dados profissionais dos médicos';
CREATE INDEX IF NOT EXISTS idx_medicos_crm ON medicos (crm);

CREATE TABLE IF NOT EXISTS medico_especialidades (
    medico_id        INTEGER NOT NULL REFERENCES medicos(id)       ON DELETE CASCADE,
    especialidade_id INTEGER NOT NULL REFERENCES especialidades(id) ON DELETE CASCADE,
    PRIMARY KEY (medico_id, especialidade_id)
);
COMMENT ON TABLE medico_especialidades IS 'Médicos com múltiplas especialidades';

-- ============================================================
-- SEÇÃO 6: PACIENTES
-- ============================================================

CREATE TABLE IF NOT EXISTS pacientes (
    id                  SERIAL PRIMARY KEY,
    endereco_id         INTEGER REFERENCES enderecos(id),
    nome                VARCHAR(120) NOT NULL,
    cpf                 VARCHAR(14)  UNIQUE,
    rg                  VARCHAR(20),
    data_nascimento     DATE NOT NULL,
    sexo                sexo_enum NOT NULL,
    estado_civil        estado_civil_enum,
    telefone            VARCHAR(20),
    celular             VARCHAR(20),
    email               VARCHAR(120),
    nome_mae            VARCHAR(120),
    nome_pai            VARCHAR(120),
    contato_emergencia  VARCHAR(120),
    telefone_emergencia VARCHAR(20),
    tipo_sanguineo      tipo_sanguineo_enum,
    observacoes         TEXT,
    foto_url            VARCHAR(255),
    ativo               BOOLEAN   NOT NULL DEFAULT TRUE,
    criado_em           TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em       TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE pacientes IS 'Cadastro completo de pacientes';
CREATE INDEX IF NOT EXISTS idx_pac_cpf  ON pacientes (cpf);
CREATE INDEX IF NOT EXISTS idx_pac_nome ON pacientes (nome);

CREATE TABLE IF NOT EXISTS paciente_convenios (
    id                 SERIAL PRIMARY KEY,
    paciente_id        INTEGER NOT NULL REFERENCES pacientes(id)       ON DELETE CASCADE,
    plano_id           INTEGER NOT NULL REFERENCES planos_convenio(id),
    numero_carteirinha VARCHAR(40) NOT NULL,
    validade           DATE,
    titular            BOOLEAN NOT NULL DEFAULT TRUE,
    nome_titular       VARCHAR(120),
    ativo              BOOLEAN NOT NULL DEFAULT TRUE
);
COMMENT ON TABLE paciente_convenios IS 'Convênios dos pacientes';
CREATE INDEX IF NOT EXISTS idx_pc_carteirinha ON paciente_convenios (numero_carteirinha);

CREATE TABLE IF NOT EXISTS alergias (
    id          SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    tipo        tipo_alergia_enum NOT NULL,
    descricao   VARCHAR(255) NOT NULL,
    severidade  severidade_enum NOT NULL DEFAULT 'LEVE',
    criado_em   TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE alergias IS 'Alergias dos pacientes';

-- ============================================================
-- SEÇÃO 7: AGENDA E CONSULTAS
-- ============================================================

CREATE TABLE IF NOT EXISTS salas (
    id         SERIAL PRIMARY KEY,
    nome       VARCHAR(60) NOT NULL UNIQUE,
    tipo       tipo_sala_enum NOT NULL,
    capacidade SMALLINT NOT NULL DEFAULT 1,
    ativa      BOOLEAN  NOT NULL DEFAULT TRUE
);
COMMENT ON TABLE salas IS 'Salas e consultórios da clínica';

CREATE TABLE IF NOT EXISTS horarios_medico (
    id                SERIAL PRIMARY KEY,
    medico_id         INTEGER NOT NULL REFERENCES medicos(id) ON DELETE CASCADE,
    sala_id           INTEGER REFERENCES salas(id),
    dia_semana        SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    hora_inicio       TIME NOT NULL,
    hora_fim          TIME NOT NULL,
    intervalo_minutos SMALLINT NOT NULL DEFAULT 30,
    ativo             BOOLEAN  NOT NULL DEFAULT TRUE
);
COMMENT ON TABLE horarios_medico IS 'Grade de horários dos médicos';
CREATE INDEX IF NOT EXISTS idx_hor_medico_dia ON horarios_medico (medico_id, dia_semana);

CREATE TABLE IF NOT EXISTS consultas (
    id                   SERIAL PRIMARY KEY,
    paciente_id          INTEGER NOT NULL REFERENCES pacientes(id),
    medico_id            INTEGER NOT NULL REFERENCES medicos(id),
    sala_id              INTEGER REFERENCES salas(id),
    paciente_convenio_id INTEGER REFERENCES paciente_convenios(id),
    procedimento_id      INTEGER REFERENCES procedimentos(id),
    data_hora            TIMESTAMP NOT NULL,
    duracao_minutos      INTEGER   NOT NULL DEFAULT 30,
    status               status_consulta_enum NOT NULL DEFAULT 'AGENDADA',
    tipo                 tipo_consulta_enum   NOT NULL DEFAULT 'PRIMEIRA_VEZ',
    motivo               TEXT,
    observacoes          TEXT,
    cancelamento_motivo  TEXT,
    cancelado_por        INTEGER REFERENCES usuarios(id),
    criado_por           INTEGER REFERENCES usuarios(id),
    criado_em            TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em        TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE consultas IS 'Agendamento e registro de consultas';
CREATE INDEX IF NOT EXISTS idx_cons_data_hora   ON consultas (data_hora);
CREATE INDEX IF NOT EXISTS idx_cons_medico_data ON consultas (medico_id, data_hora);
CREATE INDEX IF NOT EXISTS idx_cons_paciente    ON consultas (paciente_id);
CREATE INDEX IF NOT EXISTS idx_cons_status      ON consultas (status);

-- ============================================================
-- SEÇÃO 8: PRONTUÁRIO ELETRÔNICO
-- ============================================================

CREATE TABLE IF NOT EXISTS prontuarios (
    id                   SERIAL PRIMARY KEY,
    consulta_id          INTEGER NOT NULL UNIQUE REFERENCES consultas(id) ON DELETE CASCADE,
    paciente_id          INTEGER NOT NULL REFERENCES pacientes(id),
    medico_id            INTEGER NOT NULL REFERENCES medicos(id),
    queixa_principal     TEXT,
    historia_doenca      TEXT,
    exame_fisico         TEXT,
    hipotese_diagnostica TEXT,
    cid10_principal      VARCHAR(10),
    cid10_secundario     VARCHAR(10),
    conduta              TEXT,
    observacoes          TEXT,
    criado_em            TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE prontuarios IS 'Prontuário eletrônico do paciente';
CREATE INDEX IF NOT EXISTS idx_pront_paciente ON prontuarios (paciente_id);
CREATE INDEX IF NOT EXISTS idx_pront_cid10    ON prontuarios (cid10_principal);

CREATE TABLE IF NOT EXISTS prescricoes (
    id              SERIAL PRIMARY KEY,
    prontuario_id   INTEGER NOT NULL REFERENCES prontuarios(id) ON DELETE CASCADE,
    medicamento     VARCHAR(200) NOT NULL,
    principio_ativo VARCHAR(200),
    dosagem         VARCHAR(100),
    via             via_enum NOT NULL DEFAULT 'ORAL',
    frequencia      VARCHAR(100),
    duracao         VARCHAR(100),
    observacoes     TEXT
);
COMMENT ON TABLE prescricoes IS 'Prescrições médicas vinculadas ao prontuário';

CREATE TABLE IF NOT EXISTS solicitacoes_exame (
    id              SERIAL PRIMARY KEY,
    prontuario_id   INTEGER NOT NULL REFERENCES prontuarios(id) ON DELETE CASCADE,
    procedimento_id INTEGER NOT NULL REFERENCES procedimentos(id),
    urgente         BOOLEAN   NOT NULL DEFAULT FALSE,
    observacoes     TEXT,
    realizado       BOOLEAN   NOT NULL DEFAULT FALSE,
    realizado_em    TIMESTAMP,
    criado_em       TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE solicitacoes_exame IS 'Solicitações de exames';

CREATE TABLE IF NOT EXISTS resultados_exame (
    id                SERIAL PRIMARY KEY,
    solicitacao_id    INTEGER NOT NULL UNIQUE REFERENCES solicitacoes_exame(id) ON DELETE CASCADE,
    laudo             TEXT,
    arquivo_url       VARCHAR(255),
    responsavel_laudo VARCHAR(120),
    data_resultado    TIMESTAMP NOT NULL,
    criado_em         TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE resultados_exame IS 'Resultados dos exames solicitados';

-- ============================================================
-- SEÇÃO 9: FINANCEIRO
-- ============================================================

CREATE TABLE IF NOT EXISTS formas_pagamento (
    id    SERIAL PRIMARY KEY,
    nome  VARCHAR(60) NOT NULL UNIQUE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);
COMMENT ON TABLE formas_pagamento IS 'Formas de pagamento aceitas';

CREATE TABLE IF NOT EXISTS faturas (
    id                   SERIAL PRIMARY KEY,
    consulta_id          INTEGER NOT NULL REFERENCES consultas(id),
    paciente_id          INTEGER NOT NULL REFERENCES pacientes(id),
    paciente_convenio_id INTEGER REFERENCES paciente_convenios(id),
    numero               VARCHAR(20) NOT NULL UNIQUE,
    status               status_fatura_enum NOT NULL DEFAULT 'PENDENTE',
    valor_bruto          NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    desconto             NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    acrescimo            NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    valor_convenio       NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    valor_paciente       NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    valor_pago           NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    vencimento           DATE,
    observacoes          TEXT,
    criado_por           INTEGER REFERENCES usuarios(id),
    criado_em            TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em        TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE faturas IS 'Faturas geradas por consulta/procedimento';
CREATE INDEX IF NOT EXISTS idx_fat_status   ON faturas (status);
CREATE INDEX IF NOT EXISTS idx_fat_paciente ON faturas (paciente_id);
CREATE INDEX IF NOT EXISTS idx_fat_consulta ON faturas (consulta_id);
CREATE INDEX IF NOT EXISTS idx_fat_numero   ON faturas (numero);

CREATE TABLE IF NOT EXISTS itens_fatura (
    id              SERIAL PRIMARY KEY,
    fatura_id       INTEGER NOT NULL REFERENCES faturas(id) ON DELETE CASCADE,
    procedimento_id INTEGER REFERENCES procedimentos(id),
    descricao       VARCHAR(200)  NOT NULL,
    quantidade      NUMERIC(8,2)  NOT NULL DEFAULT 1,
    valor_unitario  NUMERIC(10,2) NOT NULL,
    desconto        NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    valor_total     NUMERIC(10,2) NOT NULL
);
COMMENT ON TABLE itens_fatura IS 'Itens detalhados de cada fatura';

CREATE TABLE IF NOT EXISTS pagamentos (
    id                 SERIAL PRIMARY KEY,
    fatura_id          INTEGER NOT NULL REFERENCES faturas(id),
    forma_pagamento_id INTEGER NOT NULL REFERENCES formas_pagamento(id),
    valor              NUMERIC(10,2) NOT NULL,
    troco              NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    nsu                VARCHAR(40),
    codigo_autorizacao VARCHAR(40),
    bandeira_cartao    VARCHAR(40),
    parcelas           SMALLINT NOT NULL DEFAULT 1,
    data_pagamento     TIMESTAMP NOT NULL DEFAULT NOW(),
    operador_id        INTEGER REFERENCES usuarios(id),
    observacoes        TEXT,
    estornado          BOOLEAN NOT NULL DEFAULT FALSE,
    estornado_em       TIMESTAMP,
    estornado_por      INTEGER REFERENCES usuarios(id)
);
COMMENT ON TABLE pagamentos IS 'Registros de pagamentos e estornos';
CREATE INDEX IF NOT EXISTS idx_pag_fatura ON pagamentos (fatura_id);
CREATE INDEX IF NOT EXISTS idx_pag_data   ON pagamentos (data_pagamento);

CREATE TABLE IF NOT EXISTS repasses_medicos (
    id             SERIAL PRIMARY KEY,
    medico_id      INTEGER NOT NULL REFERENCES medicos(id),
    periodo_inicio DATE NOT NULL,
    periodo_fim    DATE NOT NULL,
    valor_producao NUMERIC(10,2) NOT NULL,
    percentual     NUMERIC(5,2)  NOT NULL,
    valor_repasse  NUMERIC(10,2) NOT NULL,
    status         status_repasse_enum NOT NULL DEFAULT 'CALCULADO',
    pago_em        TIMESTAMP,
    observacoes    TEXT,
    criado_em      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE repasses_medicos IS 'Repasses financeiros para os médicos';
CREATE INDEX IF NOT EXISTS idx_rep_medico  ON repasses_medicos (medico_id);
CREATE INDEX IF NOT EXISTS idx_rep_periodo ON repasses_medicos (periodo_inicio, periodo_fim);

-- ============================================================
-- SEÇÃO 10: ESTOQUE E INSUMOS
-- ============================================================

CREATE TABLE IF NOT EXISTS categorias_estoque (
    id   SERIAL PRIMARY KEY,
    nome VARCHAR(80) NOT NULL UNIQUE
);
COMMENT ON TABLE categorias_estoque IS 'Categorias de itens do estoque';

CREATE TABLE IF NOT EXISTS fornecedores (
    id            SERIAL PRIMARY KEY,
    endereco_id   INTEGER REFERENCES enderecos(id),
    razao_social  VARCHAR(150) NOT NULL,
    nome_fantasia VARCHAR(150),
    cnpj          VARCHAR(18) UNIQUE,
    telefone      VARCHAR(20),
    email         VARCHAR(120),
    contato       VARCHAR(80),
    ativo         BOOLEAN   NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE fornecedores IS 'Fornecedores de insumos e medicamentos';

CREATE TABLE IF NOT EXISTS produtos (
    id             SERIAL PRIMARY KEY,
    categoria_id   INTEGER NOT NULL REFERENCES categorias_estoque(id),
    fornecedor_id  INTEGER REFERENCES fornecedores(id),
    nome           VARCHAR(150) NOT NULL,
    descricao      TEXT,
    codigo_barras  VARCHAR(60),
    unidade        VARCHAR(20)   NOT NULL DEFAULT 'UN',
    estoque_minimo NUMERIC(10,3) NOT NULL DEFAULT 0,
    estoque_atual  NUMERIC(10,3) NOT NULL DEFAULT 0,
    valor_custo    NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    valor_venda    NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    ativo          BOOLEAN NOT NULL DEFAULT TRUE
);
COMMENT ON TABLE produtos IS 'Produtos e insumos em estoque';
CREATE INDEX IF NOT EXISTS idx_prod_barras ON produtos (codigo_barras);
CREATE INDEX IF NOT EXISTS idx_prod_nome   ON produtos (nome);

CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
    id             BIGSERIAL PRIMARY KEY,
    produto_id     INTEGER NOT NULL REFERENCES produtos(id),
    usuario_id     INTEGER REFERENCES usuarios(id),
    tipo           tipo_movest_enum NOT NULL,
    quantidade     NUMERIC(10,3) NOT NULL,
    estoque_antes  NUMERIC(10,3) NOT NULL,
    estoque_depois NUMERIC(10,3) NOT NULL,
    valor_unitario NUMERIC(10,2),
    lote           VARCHAR(40),
    validade       DATE,
    nota_fiscal    VARCHAR(60),
    observacoes    TEXT,
    criado_em      TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE movimentacoes_estoque IS 'Entrada, saída e ajustes do estoque';
CREATE INDEX IF NOT EXISTS idx_movest_produto   ON movimentacoes_estoque (produto_id);
CREATE INDEX IF NOT EXISTS idx_movest_criado_em ON movimentacoes_estoque (criado_em);
CREATE INDEX IF NOT EXISTS idx_movest_tipo      ON movimentacoes_estoque (tipo);

-- ============================================================
-- SEÇÃO 11: NOTIFICAÇÕES E COMUNICAÇÃO
-- ============================================================

CREATE TABLE IF NOT EXISTS notificacoes (
    id         BIGSERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo       tipo_notif_enum NOT NULL DEFAULT 'INFO',
    titulo     VARCHAR(120) NOT NULL,
    mensagem   TEXT         NOT NULL,
    lida       BOOLEAN   NOT NULL DEFAULT FALSE,
    lida_em    TIMESTAMP,
    criado_em  TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE notificacoes IS 'Notificações internas para usuários';
CREATE INDEX IF NOT EXISTS idx_notif_usuario_lida ON notificacoes (usuario_id, lida);

CREATE TABLE IF NOT EXISTS comunicados_paciente (
    id          SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id),
    consulta_id INTEGER REFERENCES consultas(id),
    tipo        tipo_comunic_enum   NOT NULL,
    assunto     VARCHAR(120),
    mensagem    TEXT NOT NULL,
    status      status_comunic_enum NOT NULL DEFAULT 'PENDENTE',
    enviado_em  TIMESTAMP,
    erro        TEXT,
    criado_em   TIMESTAMP NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE comunicados_paciente IS 'Comunicados enviados aos pacientes';

-- ============================================================
-- SEÇÃO 12: TRIGGER FUNCTION — atualizado_em
-- ============================================================

CREATE OR REPLACE FUNCTION fn_set_atualizado_em()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.atualizado_em := NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_usuarios_atualizado_em
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

CREATE OR REPLACE TRIGGER trg_pacientes_atualizado_em
    BEFORE UPDATE ON pacientes
    FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

CREATE OR REPLACE TRIGGER trg_consultas_atualizado_em
    BEFORE UPDATE ON consultas
    FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

CREATE OR REPLACE TRIGGER trg_faturas_atualizado_em
    BEFORE UPDATE ON faturas
    FOR EACH ROW EXECUTE FUNCTION fn_set_atualizado_em();

-- ============================================================
-- SEÇÃO 12: TRIGGERS DE AUDITORIA
-- ============================================================

CREATE OR REPLACE FUNCTION fn_audit_pacientes()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO logs_auditoria (tabela, operacao, registro_id, dados_depois)
        VALUES ('pacientes', 'INSERT', NEW.id::text,
            jsonb_build_object('nome', NEW.nome, 'cpf', NEW.cpf, 'criado_em', NEW.criado_em));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO logs_auditoria (tabela, operacao, registro_id, dados_antes, dados_depois)
        VALUES ('pacientes', 'UPDATE', NEW.id::text,
            jsonb_build_object('nome', OLD.nome, 'email', OLD.email, 'ativo', OLD.ativo),
            jsonb_build_object('nome', NEW.nome, 'email', NEW.email, 'ativo', NEW.ativo));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO logs_auditoria (tabela, operacao, registro_id, dados_antes)
        VALUES ('pacientes', 'DELETE', OLD.id::text,
            jsonb_build_object('nome', OLD.nome, 'cpf', OLD.cpf));
        RETURN OLD;
    END IF;
END;
$$;

CREATE OR REPLACE TRIGGER trg_pacientes_audit
    AFTER INSERT OR UPDATE OR DELETE ON pacientes
    FOR EACH ROW EXECUTE FUNCTION fn_audit_pacientes();

CREATE OR REPLACE FUNCTION fn_audit_consultas()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO logs_auditoria (tabela, operacao, registro_id, dados_antes, dados_depois)
        VALUES ('consultas', 'UPDATE', NEW.id::text,
            jsonb_build_object('status', OLD.status),
            jsonb_build_object('status', NEW.status));
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_consultas_audit
    AFTER UPDATE ON consultas
    FOR EACH ROW EXECUTE FUNCTION fn_audit_consultas();

CREATE OR REPLACE FUNCTION fn_pagamento_atualiza_fatura()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    UPDATE faturas
    SET valor_pago = valor_pago + NEW.valor,
        status = CASE
            WHEN (valor_pago + NEW.valor) >= valor_paciente THEN 'PAGA'::status_fatura_enum
            WHEN (valor_pago + NEW.valor) > 0              THEN 'PARCIAL'::status_fatura_enum
            ELSE status
        END
    WHERE id = NEW.fatura_id;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_pagamentos_insert
    AFTER INSERT ON pagamentos
    FOR EACH ROW EXECUTE FUNCTION fn_pagamento_atualiza_fatura();

CREATE OR REPLACE FUNCTION fn_movimentacao_estoque()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.tipo = 'ENTRADA' THEN
        UPDATE produtos SET estoque_atual = estoque_atual + NEW.quantidade WHERE id = NEW.produto_id;
    ELSIF NEW.tipo IN ('SAIDA','PERDA') THEN
        UPDATE produtos SET estoque_atual = estoque_atual - NEW.quantidade WHERE id = NEW.produto_id;
    ELSE
        UPDATE produtos SET estoque_atual = NEW.estoque_depois WHERE id = NEW.produto_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_estoque_movimentacao
    AFTER INSERT ON movimentacoes_estoque
    FOR EACH ROW EXECUTE FUNCTION fn_movimentacao_estoque();

-- ============================================================
-- SEÇÃO 13: VIEWS DE RELATÓRIOS
-- ============================================================

CREATE OR REPLACE VIEW vw_agenda_diaria AS
SELECT
    c.id                  AS consulta_id,
    c.data_hora,
    c.status,
    c.tipo,
    p.nome                AS paciente,
    p.celular             AS celular_paciente,
    f.nome                AS medico,
    e.nome                AS especialidade,
    s.nome                AS sala,
    cv.nome               AS convenio,
    pc.numero_carteirinha,
    pr.nome               AS procedimento
FROM consultas c
JOIN pacientes    p  ON p.id  = c.paciente_id
JOIN medicos      m  ON m.id  = c.medico_id
JOIN funcionarios f  ON f.id  = m.funcionario_id
JOIN especialidades e ON e.id = m.especialidade_id
LEFT JOIN salas              s  ON s.id  = c.sala_id
LEFT JOIN paciente_convenios pc ON pc.id = c.paciente_convenio_id
LEFT JOIN planos_convenio    pl ON pl.id = pc.plano_id
LEFT JOIN convenios          cv ON cv.id = pl.convenio_id
LEFT JOIN procedimentos      pr ON pr.id = c.procedimento_id;

CREATE OR REPLACE VIEW vw_producao_medicos AS
SELECT
    m.id                                        AS medico_id,
    f.nome                                      AS medico,
    e.nome                                      AS especialidade,
    m.crm,
    COUNT(c.id)                                 AS total_consultas,
    SUM(CASE WHEN c.status = 'REALIZADA' THEN 1 ELSE 0 END) AS consultas_realizadas,
    SUM(CASE WHEN c.status = 'CANCELADA' THEN 1 ELSE 0 END) AS consultas_canceladas,
    SUM(CASE WHEN c.status = 'FALTOU'    THEN 1 ELSE 0 END) AS faltas,
    COALESCE(SUM(fa.valor_bruto),    0)         AS faturamento_bruto,
    COALESCE(SUM(fa.valor_convenio), 0)         AS faturamento_convenio,
    COALESCE(SUM(fa.valor_paciente), 0)         AS faturamento_particular,
    COALESCE(SUM(fa.valor_pago),     0)         AS total_recebido,
    m.percentual_repasse,
    ROUND(COALESCE(SUM(fa.valor_pago), 0) * m.percentual_repasse / 100, 2) AS repasse_estimado
FROM medicos m
JOIN funcionarios   f ON f.id = m.funcionario_id
JOIN especialidades e ON e.id = m.especialidade_id
LEFT JOIN consultas c  ON c.medico_id = m.id
LEFT JOIN faturas   fa ON fa.consulta_id = c.id AND fa.status <> 'CANCELADA'
GROUP BY m.id, f.nome, e.nome, m.crm, m.percentual_repasse;

CREATE OR REPLACE VIEW vw_financeiro_mensal AS
SELECT
    EXTRACT(YEAR  FROM fa.criado_em)::int AS ano,
    EXTRACT(MONTH FROM fa.criado_em)::int AS mes,
    TO_CHAR(fa.criado_em, 'YYYY-MM')      AS periodo,
    COUNT(DISTINCT fa.id)                 AS total_faturas,
    COUNT(DISTINCT CASE WHEN fa.status = 'PAGA'    THEN fa.id END) AS faturas_pagas,
    COUNT(DISTINCT CASE WHEN fa.status = 'PENDENTE' THEN fa.id END) AS faturas_pendentes,
    SUM(fa.valor_bruto)                   AS receita_bruta,
    SUM(fa.desconto)                      AS total_descontos,
    SUM(fa.valor_convenio)                AS receita_convenio,
    SUM(fa.valor_paciente)                AS receita_particular,
    SUM(fa.valor_pago)                    AS receita_recebida,
    SUM(fa.valor_paciente - fa.valor_pago) AS inadimplencia,
    COUNT(DISTINCT fa.paciente_id)        AS total_pacientes_atendidos
FROM faturas fa
WHERE fa.status <> 'CANCELADA'
GROUP BY EXTRACT(YEAR FROM fa.criado_em), EXTRACT(MONTH FROM fa.criado_em)
ORDER BY ano DESC, mes DESC;

CREATE OR REPLACE VIEW vw_inadimplencia AS
SELECT
    fa.id                              AS fatura_id,
    fa.numero                          AS numero_fatura,
    p.nome                             AS paciente,
    p.celular,
    fa.valor_paciente                  AS valor_total,
    fa.valor_pago,
    (fa.valor_paciente - fa.valor_pago) AS valor_pendente,
    fa.vencimento,
    (CURRENT_DATE - fa.vencimento)     AS dias_atraso,
    fa.status
FROM faturas fa
JOIN pacientes p ON p.id = fa.paciente_id
WHERE fa.status IN ('PENDENTE','PARCIAL')
  AND fa.vencimento < CURRENT_DATE
ORDER BY dias_atraso DESC;

CREATE OR REPLACE VIEW vw_pagamentos_por_forma AS
SELECT
    fp.nome                                    AS forma_pagamento,
    COUNT(pg.id)                               AS total_transacoes,
    SUM(pg.valor)                              AS total_recebido,
    AVG(pg.valor)                              AS ticket_medio,
    SUM(CASE WHEN pg.estornado THEN pg.valor ELSE 0 END) AS total_estornado,
    EXTRACT(YEAR  FROM pg.data_pagamento)::int AS ano,
    EXTRACT(MONTH FROM pg.data_pagamento)::int AS mes
FROM pagamentos pg
JOIN formas_pagamento fp ON fp.id = pg.forma_pagamento_id
WHERE NOT pg.estornado
GROUP BY fp.nome, EXTRACT(YEAR FROM pg.data_pagamento), EXTRACT(MONTH FROM pg.data_pagamento);

CREATE OR REPLACE VIEW vw_pacientes_novos_por_mes AS
SELECT
    EXTRACT(YEAR  FROM criado_em)::int AS ano,
    EXTRACT(MONTH FROM criado_em)::int AS mes,
    TO_CHAR(criado_em, 'YYYY-MM')      AS periodo,
    COUNT(id)                          AS novos_pacientes
FROM pacientes
GROUP BY EXTRACT(YEAR FROM criado_em), EXTRACT(MONTH FROM criado_em)
ORDER BY ano DESC, mes DESC;

CREATE OR REPLACE VIEW vw_faturamento_por_convenio AS
SELECT
    COALESCE(cv.nome, 'PARTICULAR')  AS convenio,
    COUNT(DISTINCT fa.id)            AS total_faturas,
    SUM(fa.valor_bruto)              AS valor_bruto,
    SUM(fa.valor_convenio)           AS valor_convenio,
    SUM(fa.valor_pago)               AS valor_recebido,
    COUNT(DISTINCT fa.paciente_id)   AS total_pacientes
FROM faturas fa
LEFT JOIN paciente_convenios pc ON pc.id = fa.paciente_convenio_id
LEFT JOIN planos_convenio    pl ON pl.id = pc.plano_id
LEFT JOIN convenios          cv ON cv.id = pl.convenio_id
WHERE fa.status <> 'CANCELADA'
GROUP BY cv.nome;

CREATE OR REPLACE VIEW vw_dashboard AS
SELECT
    (SELECT COUNT(*) FROM pacientes  WHERE ativo)                                    AS total_pacientes,
    (SELECT COUNT(*) FROM medicos    WHERE ativo)                                    AS total_medicos,
    (SELECT COUNT(*) FROM consultas  WHERE DATE(data_hora) = CURRENT_DATE)          AS consultas_hoje,
    (SELECT COUNT(*) FROM consultas  WHERE DATE(data_hora) = CURRENT_DATE
        AND status = 'REALIZADA')                                                    AS atendimentos_hoje,
    (SELECT COALESCE(SUM(valor_pago),0) FROM faturas
        WHERE DATE(criado_em) = CURRENT_DATE)                                        AS receita_hoje,
    (SELECT COALESCE(SUM(valor_pago),0) FROM faturas
        WHERE EXTRACT(MONTH FROM criado_em) = EXTRACT(MONTH FROM CURRENT_DATE)
          AND EXTRACT(YEAR  FROM criado_em) = EXTRACT(YEAR  FROM CURRENT_DATE))     AS receita_mes,
    (SELECT COUNT(*) FROM faturas    WHERE status IN ('PENDENTE','PARCIAL')
        AND vencimento < CURRENT_DATE)                                               AS titulos_vencidos,
    (SELECT COUNT(*) FROM produtos   WHERE estoque_atual <= estoque_minimo)         AS estoque_critico;

CREATE OR REPLACE VIEW vw_estoque_critico AS
SELECT
    p.id,
    p.nome,
    c.nome                                AS categoria,
    p.unidade,
    p.estoque_atual,
    p.estoque_minimo,
    (p.estoque_minimo - p.estoque_atual)  AS deficit,
    f.razao_social                        AS fornecedor,
    f.telefone                            AS telefone_fornecedor
FROM produtos p
JOIN categorias_estoque c ON c.id = p.categoria_id
LEFT JOIN fornecedores  f ON f.id = p.fornecedor_id
WHERE p.estoque_atual <= p.estoque_minimo AND p.ativo
ORDER BY deficit DESC;

-- ============================================================
-- SEÇÃO 14: FUNCTIONS (Stored Procedures → PL/pgSQL)
-- ============================================================

CREATE OR REPLACE FUNCTION sp_gerar_fatura(p_consulta_id INTEGER, p_usuario_id INTEGER)
RETURNS TABLE(fatura_id INTEGER, numero VARCHAR) LANGUAGE plpgsql AS $$
DECLARE
    v_fatura_id   INTEGER;
    v_numero      VARCHAR(20);
    v_paciente_id INTEGER;
    v_pc_id       INTEGER;
    v_proc_id     INTEGER;
    v_valor_bruto NUMERIC(10,2);
    v_val_conv    NUMERIC(10,2) := 0;
BEGIN
    SELECT c.paciente_id, c.paciente_convenio_id, c.procedimento_id
      INTO v_paciente_id, v_pc_id, v_proc_id
      FROM consultas c WHERE c.id = p_consulta_id;

    SELECT pr.valor_particular INTO v_valor_bruto
      FROM procedimentos pr WHERE pr.id = v_proc_id;

    IF v_pc_id IS NOT NULL THEN
        SELECT cp.valor_convenio INTO v_val_conv
          FROM convenio_procedimentos cp
          JOIN paciente_convenios pc ON pc.plano_id = cp.plano_id
         WHERE pc.id = v_pc_id AND cp.procedimento_id = v_proc_id LIMIT 1;
        v_val_conv := COALESCE(v_val_conv, 0);
    END IF;

    v_numero := 'FAT' || LPAD(p_consulta_id::text, 8, '0') || TO_CHAR(NOW(), 'YYYYMM');

    INSERT INTO faturas (
        consulta_id, paciente_id, paciente_convenio_id, numero,
        valor_bruto, valor_convenio, valor_paciente, criado_por
    ) VALUES (
        p_consulta_id, v_paciente_id, v_pc_id, v_numero,
        v_valor_bruto, v_val_conv, (v_valor_bruto - v_val_conv), p_usuario_id
    ) RETURNING id INTO v_fatura_id;

    INSERT INTO itens_fatura (fatura_id, procedimento_id, descricao, quantidade, valor_unitario, valor_total)
    SELECT v_fatura_id, pr.id, pr.nome, 1, pr.valor_particular, pr.valor_particular
      FROM procedimentos pr WHERE pr.id = v_proc_id;

    RETURN QUERY SELECT v_fatura_id, v_numero;
END;
$$;

CREATE OR REPLACE FUNCTION sp_relatorio_financeiro(p_data_inicio DATE, p_data_fim DATE)
RETURNS TABLE(
    data DATE, total_faturas BIGINT, receita_bruta NUMERIC,
    receita_recebida NUMERIC, saldo_pendente NUMERIC,
    total_descontos NUMERIC, pacientes BIGINT
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE(fa.criado_em),
        COUNT(DISTINCT fa.id),
        SUM(fa.valor_bruto),
        SUM(fa.valor_pago),
        SUM(fa.valor_paciente - fa.valor_pago),
        SUM(fa.desconto),
        COUNT(DISTINCT fa.paciente_id)
    FROM faturas fa
    WHERE DATE(fa.criado_em) BETWEEN p_data_inicio AND p_data_fim
      AND fa.status <> 'CANCELADA'
    GROUP BY DATE(fa.criado_em)
    ORDER BY DATE(fa.criado_em);
END;
$$;

CREATE OR REPLACE FUNCTION sp_calcular_repasse(
    p_medico_id INTEGER, p_periodo_inicio DATE, p_periodo_fim DATE
)
RETURNS TABLE(producao NUMERIC, percentual NUMERIC, valor_repasse NUMERIC)
LANGUAGE plpgsql AS $$
DECLARE
    v_producao   NUMERIC(10,2);
    v_percentual NUMERIC(5,2);
    v_repasse    NUMERIC(10,2);
BEGIN
    SELECT m.percentual_repasse, COALESCE(SUM(fa.valor_pago), 0)
      INTO v_percentual, v_producao
      FROM medicos m
      LEFT JOIN consultas c  ON c.medico_id = m.id
      LEFT JOIN faturas   fa ON fa.consulta_id = c.id
                            AND fa.status = 'PAGA'
                            AND DATE(fa.atualizado_em) BETWEEN p_periodo_inicio AND p_periodo_fim
     WHERE m.id = p_medico_id
     GROUP BY m.percentual_repasse;

    v_repasse := v_producao * v_percentual / 100;

    INSERT INTO repasses_medicos (
        medico_id, periodo_inicio, periodo_fim, valor_producao, percentual, valor_repasse
    ) VALUES (p_medico_id, p_periodo_inicio, p_periodo_fim, v_producao, v_percentual, v_repasse);

    RETURN QUERY SELECT v_producao, v_percentual, v_repasse;
END;
$$;

-- ============================================================
-- SEÇÃO 15: DADOS INICIAIS (SEEDS)
-- ============================================================

INSERT INTO perfis (nome, descricao) VALUES
('ADMIN',        'Administrador do sistema — acesso total'),
('MEDICO',       'Médico — acesso ao prontuário e agenda'),
('RECEPCIONISTA','Recepcionista — agendamento e faturamento'),
('FINANCEIRO',   'Financeiro — relatórios e pagamentos'),
('ENFERMAGEM',   'Técnico de enfermagem')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO permissoes (modulo, acao) VALUES
('PACIENTES','VISUALIZAR'), ('PACIENTES','CADASTRAR'),
('PACIENTES','EDITAR'),     ('PACIENTES','EXCLUIR'),
('CONSULTAS','VISUALIZAR'), ('CONSULTAS','AGENDAR'),
('CONSULTAS','CANCELAR'),   ('PRONTUARIO','VISUALIZAR'),
('PRONTUARIO','ESCREVER'),  ('FINANCEIRO','VISUALIZAR'),
('FINANCEIRO','LANCAR'),    ('FINANCEIRO','ESTORNAR'),
('RELATORIOS','VISUALIZAR'),('RELATORIOS','EXPORTAR'),
('ESTOQUE','VISUALIZAR'),   ('ESTOQUE','MOVIMENTAR'),
('USUARIOS','GERENCIAR')
ON CONFLICT (modulo, acao) DO NOTHING;

INSERT INTO especialidades (nome, codigo_cfm) VALUES
('Clínica Geral','001'), ('Cardiologia','012'),
('Dermatologia','020'),  ('Ginecologia','025'),
('Ortopedia','057'),     ('Pediatria','061'),
('Neurologia','049'),    ('Oftalmologia','053'),
('Urologia','084'),      ('Psiquiatria','066')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO categorias_procedimentos (nome) VALUES
('Consulta'), ('Exame Laboratorial'), ('Exame de Imagem'),
('Procedimento Cirúrgico'), ('Vacina'), ('Fisioterapia')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO formas_pagamento (nome) VALUES
('Dinheiro'), ('Cartão de Débito'), ('Cartão de Crédito'),
('PIX'), ('Convênio'), ('Transferência Bancária'), ('Boleto')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO cargos (nome, nivel) VALUES
('Médico',5), ('Enfermeiro',4), ('Técnico de Enfermagem',3),
('Recepcionista',2), ('Auxiliar Administrativo',1),
('Gerente',5), ('Contador',4), ('TI',4)
ON CONFLICT (nome) DO NOTHING;

INSERT INTO salas (nome, tipo) VALUES
('Consultório 01','CONSULTÓRIO'), ('Consultório 02','CONSULTÓRIO'),
('Consultório 03','CONSULTÓRIO'), ('Sala de Exames','EXAME'),
('Centro Cirúrgico','CIRURGIA'),  ('Sala de Procedimentos','PROCEDIMENTO')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO categorias_estoque (nome) VALUES
('Medicamentos'), ('Material de Escritório'), ('EPI'),
('Material Cirúrgico'), ('Higiene e Limpeza'), ('Equipamentos')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO procedimentos (categoria_id, nome, valor_particular, duracao_minutos) VALUES
(1, 'Consulta Clínica Geral',   150.00, 30),
(1, 'Consulta Cardiologia',     250.00, 45),
(1, 'Consulta Dermatologia',    200.00, 30),
(1, 'Consulta Ginecologia',     220.00, 40),
(1, 'Consulta Pediatria',       180.00, 30),
(2, 'Hemograma Completo',        45.00, 15),
(2, 'Glicemia em Jejum',         20.00, 10),
(2, 'Perfil Lipídico',           60.00, 15),
(3, 'Eletrocardiograma',         80.00, 20),
(3, 'Raio-X Tórax',              90.00, 15),
(3, 'Ultrassom Abdominal',      180.00, 30),
(5, 'Vacina Influenza',          50.00, 10),
(6, 'Sessão Fisioterapia',       80.00, 60);

-- ============================================================
-- SEÇÃO 16: USUÁRIO ADMIN PADRÃO
-- Senha: Admin@2024  ← TROQUE IMEDIATAMENTE EM PRODUÇÃO!
-- ============================================================

INSERT INTO usuarios (perfil_id, nome, email, senha_hash, salt)
VALUES (
    (SELECT id FROM perfis WHERE nome = 'ADMIN'),
    'Administrador',
    'admin@clinica.local',
    encode(digest('Admin@2024' || 'salt_fixo_troque_em_prod', 'sha256'), 'hex'),
    'salt_fixo_troque_em_prod'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- FIM DA MIGRATION
-- ============================================================
