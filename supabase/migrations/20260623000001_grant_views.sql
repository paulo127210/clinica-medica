-- Concede permissão de leitura nas views para os roles anon e authenticated

GRANT SELECT ON vw_agenda_diaria         TO anon, authenticated;
GRANT SELECT ON vw_producao_medicos      TO anon, authenticated;
GRANT SELECT ON vw_financeiro_mensal     TO anon, authenticated;
GRANT SELECT ON vw_inadimplencia         TO anon, authenticated;
GRANT SELECT ON vw_pagamentos_por_forma  TO anon, authenticated;
GRANT SELECT ON vw_pacientes_novos_por_mes TO anon, authenticated;
GRANT SELECT ON vw_faturamento_por_convenio TO anon, authenticated;
GRANT SELECT ON vw_dashboard             TO anon, authenticated;
GRANT SELECT ON vw_estoque_critico       TO anon, authenticated;

-- Garante também acesso às tabelas principais
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
