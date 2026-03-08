import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#0f0f0f" }}>
      <Header />

      <main className="px-4 pt-24 pb-16 md:pt-32 md:pb-24">
        <Card className="max-w-[800px] mx-auto bg-card border-border p-8 md:p-12">
          <div className="space-y-8">
            <div>
              <h1 className="font-display font-bold text-3xl text-foreground">Termos de Uso</h1>
              <p className="font-display font-semibold text-xl text-foreground mt-2">Matchmaking</p>
              <p className="text-base text-muted-foreground leading-relaxed mt-4">
                Seja bem-vindo a Matchmaking, um portal que conecta profissionais e talentos do setor de games a
                estúdios e empresas contratantes.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-3">
                Ao criar uma conta e clicar em "Concordo com os Termos de Uso", o usuário reconhece que está firmando um
                contrato eletrônico com valor legal, conforme legislação brasileira aplicável.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-3">
                Recomendamos a leitura atenta deste documento.
              </p>
            </div>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">1. Objetivo da Plataforma</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                A Matchmaking é uma plataforma digital que tem como objetivo facilitar o contato entre candidatos e
                empresas da indústria de games, promovendo a divulgação de vagas e perfis profissionais.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-3">
                A Matchmaking também poderá conceder acesso ao banco de talentos a profissionais ou empresas autorizadas
                para fins de recrutamento, como headhunters e consultorias, desde que respeitem as normas previstas
                nestes Termos e na Política de Privacidade.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">2. Aceitação dos Termos</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Ao se cadastrar ou utilizar qualquer funcionalidade da Matchmaking, você declara que leu, compreendeu e
                aceitou integralmente estes Termos de Uso.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">3. Cadastro de Usuários</h2>

              <h3 className="font-sans font-semibold text-lg text-foreground mt-4 mb-2">3.1 Candidatos</h3>
              <ul className="list-disc list-inside text-base text-muted-foreground leading-relaxed space-y-1">
                <li>Devem fornecer informações verdadeiras, completas e atualizadas em seus perfis.</li>
                <li>São responsáveis pela veracidade dos dados inseridos (currículo, links, redes sociais, etc).</li>
                <li>Concordam em não utilizar a plataforma para fins ilícitos ou fora do escopo profissional.</li>
              </ul>

              <h3 className="font-sans font-semibold text-lg text-foreground mt-4 mb-2">3.2 Estúdios/Empresas</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Devem publicar apenas vagas reais e compatíveis com as práticas legais e éticas de recrutamento.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                Não é permitido solicitar dados excessivos, íntimos ou sensíveis sem justificativa clara.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                Devem utilizar os dados dos candidatos de forma ética e conforme a LGPD.
              </p>

              <h3 className="font-sans font-semibold text-lg text-foreground mt-4 mb-2">
                3.3 Headhunters e Parceiros de Recrutamento
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Os headhunters e parceiros autorizados pela plataforma poderão acessar os perfis dos candidatos mediante
                contrato específico com a Matchmaking, que incluirá cláusulas de confidencialidade, uso restrito dos
                dados e conformidade com a LGPD.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                É expressamente proibido copiar, armazenar, transferir ou utilizar os dados obtidos na plataforma para
                finalidades distintas do recrutamento profissional no setor de games.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                O acesso será monitorado, podendo ser revogado a qualquer momento, sem aviso prévio, em caso de uso
                indevido ou descumprimento destes Termos.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">4. Uso da Plataforma</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                É proibida a prática de discriminação, assédio, divulgação de conteúdos ofensivos, falsos ou ilegais.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                O usuário se compromete a não copiar, reproduzir, modificar ou explorar qualquer conteúdo da plataforma
                sem autorização.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                O acesso a dados de usuários por terceiros (como headhunters ou consultorias) será realizado mediante
                autorização prévia dos titulares, conforme previsto na Política de Privacidade. O uso dos dados deve
                respeitar a finalidade informada, sendo vedada sua reutilização para marketing, prospecção comercial ou
                qualquer fim não relacionado ao recrutamento profissional.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">
                5. Proibição de Conteúdo Relacionado a Apostas e Jogos de Azar
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                A Matchmaking preza pela integridade do seu ecossistema de oportunidades profissionais no setor de games
                e entretenimento digital. Por isso, é expressamente proibida a publicação de vagas, anúncios ou
                conteúdos relacionados, direta ou indiretamente, às seguintes atividades:
              </p>
              <ul className="list-disc list-inside text-base text-muted-foreground leading-relaxed space-y-1 mt-2">
                <li>Plataformas de apostas, apostas esportivas, esportes ou cassinos online;</li>
                <li>Empresas ou produtos relacionados ao setor de iGaming;</li>
                <li>Jogos de azar disfarçados de entretenimento, como o popularmente conhecido "jogo do tigrinho";</li>
                <li>Qualquer outro produto, serviço ou modelo de negócio baseado em mecanismos de sorte ou aposta.</li>
              </ul>
              <p className="text-base text-muted-foreground leading-relaxed mt-3">
                A Matchmaking se reserva o direito de, a seu exclusivo critério, excluir sumariamente qualquer vaga ou
                conteúdo que se enquadre nas categorias acima, independentemente de aviso prévio.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                Nos casos em que já tenha ocorrido o pagamento pela publicação de tais vagas, o valor será integralmente
                reembolsado por meio do mesmo canal utilizado na transação, no prazo previsto pela operadora financeira.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                Além disso, a violação desta cláusula poderá resultar no bloqueio, suspensão ou banimento definitivo da
                conta do usuário infrator, sem prejuízo de outras medidas legais cabíveis.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">
                6. Responsabilidades e Limitações
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                A Matchmaking não garante a contratação de candidatos nem a veracidade das informações publicadas por
                terceiros.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                A Matchmaking atua exclusivamente como uma plataforma de intermediação, conectando empresas e
                profissionais do setor de games.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                A plataforma não participa, direta ou indiretamente, da negociação, elaboração ou execução de contratos
                entre os usuários.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                A responsabilidade por eventuais acordos, pagamentos, entregas ou contratações é integralmente das
                partes envolvidas, eximindo o Matchmaking de qualquer obrigação legal, trabalhista, tributária ou cível
                relacionada a essas interações.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                A Matchmaking poderá suspender ou encerrar contas de usuários que violem estes Termos, sem necessidade
                de aviso prévio, especialmente em casos de:
              </p>
              <ul className="list-disc list-inside text-base text-muted-foreground leading-relaxed space-y-1 mt-2">
                <li>Fraude, uso indevido da plataforma ou tentativa de manipulação de processos seletivos.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">7. Propriedade Intelectual</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Todos os elementos do portal (marca, layout, textos, funcionalidades) são de propriedade exclusiva da
                Matchmaking.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                É proibida a reprodução ou uso indevido de qualquer conteúdo sem autorização prévia.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">
                8. Privacidade e Proteção de Dados
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Todos os dados pessoais coletados estão sujeitos à nossa{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Política de Privacidade
                </Link>
                .
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                Seguimos as diretrizes da Lei Geral de Proteção de Dados (Lei nº 13.709/18).
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                Os dados dos candidatos poderão ser acessados por terceiros autorizados (como empresas e consultores de
                recrutamento), exclusivamente para fins de seleção profissional, mediante consentimento do usuário e em
                conformidade com a Lei Geral de Proteção de Dados.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                Os usuários têm o direito de acessar, corrigir, limitar ou excluir seus dados mediante solicitação.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">9. Alterações nos Termos</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                A Matchmaking se reserva o direito de alterar estes Termos de Uso a qualquer momento, com aviso prévio
                aos usuários via e-mail ou notificação no site.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">
                10. Serviços Pagos e Reembolsos
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                A plataforma poderá oferecer serviços pagos, como planos de destaque, impulsionamento de perfis ou
                acesso prioritário a determinadas funcionalidades.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                Os valores cobrados, prazos e formas de pagamento serão informados previamente.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                Reembolsos serão realizados apenas em casos previstos em lei ou erro técnico comprovado.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                Em caso de cancelamento por violação dos termos, não haverá devolução de valores.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">
                11. Foro e Legislação Aplicável
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca de São Paulo, Estado de
                São Paulo, para dirimir quaisquer dúvidas ou conflitos decorrentes deste documento.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-3">
                Se você tiver dúvidas, entre em contato conosco pelo e-mail:{" "}
                <a href="mailto:lucas.pimenta@matchmaking.games" className="text-primary hover:underline">
                  lucas.pimenta@matchmaking.games
                </a>
              </p>
            </section>
          </div>
        </Card>
      </main>

      {/* Footer — same as Index.tsx */}
      <footer style={{ background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 24px" }}>
        <div className="flex flex-col md:flex-row items-center justify-center gap-5 md:gap-12">
          <img src={matchmakingLogo} alt="Matchmaking" className="h-8" style={{ opacity: 0.65 }} />
          <div className="flex items-center gap-5">
            {socials.map((s) => (
              <a
                key={s.network}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-200"
                style={{ color: "rgba(255,255,255,0.35)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)";
                }}
              >
                <SocialIcon network={s.network} size={18} className="fill-current" />
              </a>
            ))}
          </div>
        </div>
        <p className="text-center" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 16 }}>
          Matchmaking · Feito para quem vive de games
        </p>
        <p className="text-center" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>
          <Link to="/terms" className="hover:underline" style={{ color: "inherit" }}>
            Termos de Uso
          </Link>
          {" · "}
          <Link to="/privacy" className="hover:underline" style={{ color: "inherit" }}>
            Política de Privacidade
          </Link>
        </p>
      </footer>
    </div>
  );
};

export default Terms;
