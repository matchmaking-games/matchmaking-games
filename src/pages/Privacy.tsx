import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";

const Privacy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const linkProps = {
    target: "_blank",
    rel: "noopener noreferrer",
    className: "text-primary hover:underline",
  };

  return (
    <div className="min-h-screen" style={{ background: "#0f0f0f" }}>
      <Header />

      <main className="px-4 pt-24 pb-16 md:pt-32 md:pb-24">
        <Card className="max-w-[800px] mx-auto bg-card border-border p-8 md:p-12">
          <div className="space-y-8">
            <div>
              <h1 className="font-display font-bold text-3xl text-foreground">Política de Privacidade</h1>
              <p className="font-display font-semibold text-xl text-foreground mt-2">Matchmaking</p>
              <p className="text-base text-muted-foreground leading-relaxed mt-4">
                A Política de Privacidade da Empresa foi atualizada em março de 2026. Com o objetivo de proteger os
                direitos fundamentais de liberdade e de privacidade e o livre desenvolvimento da personalidade da pessoa
                natural, a Empresa elaborou a presente Política de Privacidade, observadas as disposições da Lei Geral
                de Proteção de Dados Pessoais (LGPD) – Lei n° 13.709/2018. É fundamental dedicar um momento para se
                familiarizar com nossas práticas de privacidade e fale conosco se tiver dúvidas. Para nós é importante
                ser transparente sobre o tratamento dos dados pessoais dos Usuários que utilizam os Serviços oferecidos
                pela Empresa, nos termos do Artigo 9º da LGPD. Esta Política se aplica quando o Usuário utiliza os
                nossos Serviços.
              </p>
            </div>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">Veracidade das Informações</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Toda e qualquer informação prestada pelo Usuário à Empresa, principalmente seus dados pessoais, deverão
                ser verídicos e não podem violar a legislação brasileira, principalmente à LGPD. Caso a Empresa
                verifique que as informações fornecidas sejam inverídicas, esta poderá excluir os dados pessoais, bem
                como encerrar a conta deste Usuário.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">
                O que são Dados Pessoais e Dados Sensíveis?
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Vamos entender qual o objeto de proteção desta Política. Em primeiro lugar, é importante saber que os
                "DADOS PESSOAIS" são informações que podem ser usadas para identificar uma pessoa natural (física),
                sendo assim, dados de empresas (pessoas jurídicas) como razão social e CNPJ não são abarcados por esta
                política. Os "DADOS PESSOAIS SENSÍVEIS", de acordo com a LGPD, consistem em informações sobre origem
                racial ou étnica, convicção religiosa, opinião política, filiação a sindicato ou organização de caráter
                religioso, filosófico ou político, ou até mesmo dado referente à saúde ou à vida sexual, dado genético
                ou biométrico, e também são abarcados nesta política.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">Empresa como Controladora</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                É importante informar que a Empresa figura como Controladora dos Dados Pessoais coletados. Mas o que
                isso significa? De acordo com a LGPD, a Empresa é responsável por tomar as decisões referentes ao
                tratamento dos Dados Pessoais de seus Usuários.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">
                Quais Tipos de Dados Pessoais são Coletados pela Empresa?
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Considerando que a Empresa oferece seus Serviços por meio de um aplicativo, é necessário que a pessoa
                interessada em utilizar os Serviços da Empresa, em primeiro lugar, realize um cadastro. Esse cadastro
                inicial é chamado de Cadastro do Usuário. No Cadastro do Usuário são coletados os seguintes Dados
                Pessoais:
              </p>
              <ul className="list-disc list-inside text-base text-muted-foreground leading-relaxed space-y-1 mt-2">
                <li>nome da empresa;</li>
                <li>local de sede da empresa;</li>
                <li>logo da empresa;</li>
                <li>nome completo;</li>
                <li>redes sociais;</li>
                <li>telefone.</li>
              </ul>
              <p className="text-base text-muted-foreground leading-relaxed mt-3">
                Referidos Dados Pessoais são coletados com a finalidade de identificar qual o contexto do Usuário em
                relação ao assunto, de forma a permitir que a Empresa consiga oferecer conteúdo específico e apresentar
                Usuários com o mesmo perfil e as mesmas necessidades. O nome completo é importante para identificar a
                empresa do Usuário; o local de sede é importante para que candidatos possam saber a proximidade; a logo
                da empresa é importante para identificá-la dentro do aplicativo; redes sociais são usadas para compor o
                portfólio; telefone é usado para que ambas as partes façam contato.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                A Empresa poderá também coletar e tratar dados adicionais fornecidos voluntariamente pelo Usuário, como
                áreas de atuação, interesses profissionais, habilidades técnicas e histórico de trabalhos anteriores,
                com o objetivo de oferecer conexões e oportunidades mais relevantes.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                É importante informar que os Dados Pessoais acima elencados são tratados, apenas e tão somente, com a
                finalidade de identificar o usuário e otimizar sua experiência com o uso do aplicativo.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">
                Por que a Empresa Trata os Dados Pessoais dos Usuários?
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                O Cadastro de Usuário se submete à hipótese legal de execução do Contrato, ou seja, só é possível a
                Empresa executar os Serviços contratados se o Usuário realizar o Cadastro de Usuário. Neste cenário,
                aplica-se o inciso VI do Artigo 7º da LGPD.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">
                A Empresa Também Pode Coletar Dados Pessoais Sensíveis?
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Como o objeto da Empresa é conectar estúdios com potenciais candidatos, conhecer a fundo qual o Usuário
                é importante para que a Empresa possa oferecer seus serviços de maneira mais adequada.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">
                Como a Empresa Armazena os Dados Pessoais?
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                A Empresa utiliza os serviços da Vercel (
                <a href="https://vercel.com" {...linkProps}>
                  https://vercel.com
                </a>
                ) para hospedagem do frontend, da Supabase (
                <a href="https://supabase.com" {...linkProps}>
                  https://supabase.com
                </a>
                ) para armazenamento e banco de dados utilizando a infraestrutura da Amazon AWS, e da Sentry (
                <a href="https://sentry.io" {...linkProps}>
                  https://sentry.io
                </a>
                ) para monitoramento de erros e estabilidade do aplicativo.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                O Sentry pode coletar automaticamente dados técnicos quando ocorrem falhas, como informações do
                navegador, sistema operacional, URL acessada e identificadores de sessão, com a finalidade exclusiva de
                identificar e corrigir problemas técnicos. Todos esses serviços operam em conformidade com padrões
                internacionais de proteção de dados, conforme suas respectivas políticas de privacidade disponíveis em{" "}
                <a href="https://supabase.com/privacy" {...linkProps}>
                  https://supabase.com/privacy
                </a>
                ,{" "}
                <a href="https://vercel.com/legal/privacy-policy" {...linkProps}>
                  https://vercel.com/legal/privacy-policy
                </a>{" "}
                e{" "}
                <a href="https://sentry.io/privacy/" {...linkProps}>
                  https://sentry.io/privacy/
                </a>
                . Por essa razão, a eventual transferência internacional de dados pessoais pela Empresa para esses
                serviços obedece o inciso I do artigo 33 da LGPD.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">
                A Empresa Pode Realizar Processamento Automático?
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                A Empresa utiliza as informações e os dados que o Usuário forneceu para fazer recomendações de conexões,
                conteúdos e recursos que possam ser úteis para o Usuário. Por exemplo, são utilizados dados e
                informações a respeito do Usuário para recomendar conexões de outros Usuários e recomendar conteúdo
                adequado. O Usuário manter seu perfil atualizado e correto ajudará a tornar essas recomendações mais
                precisas e relevantes.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">
                Compartilhamento de Dados com Terceiros
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                A Empresa poderá compartilhar os dados profissionais dos Usuários com parceiros autorizados, como
                empresas contratantes, consultorias de recrutamento e headhunters, exclusivamente para fins de
                recrutamento profissional no setor de games.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                Esse compartilhamento ocorrerá somente mediante o consentimento prévio, livre e informado do Usuário,
                obtido no momento do cadastro ou por meio das configurações do perfil.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                Os dados compartilhados poderão incluir: nome, portfólio, localização, habilidades, redes sociais
                profissionais e outras informações relacionadas à experiência e qualificação.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                Todos os terceiros que tiverem acesso aos dados deverão cumprir integralmente a LGPD, manter os dados em
                sigilo, e utilizá-los apenas para a finalidade previamente autorizada.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                O Usuário poderá revogar esse consentimento a qualquer momento por meio de solicitação ao Encarregado de
                Dados ou nas configurações do seu perfil.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">
                Qual a Duração do Tratamento de Dados Pessoais pela Empresa?
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Os Dados Pessoais e os Dados Pessoais Sensíveis mencionados nesta Política serão tratados durante a
                execução dos Serviços oferecidos pela Empresa. Após o encerramento dos Serviços, por qualquer motivo, os
                Dados Pessoais permanecerão armazenados pela Empresa pelo período de até 3 anos. Tal período leva em
                consideração o prazo prescricional previsto no inciso V do § 3º do Artigo 206 do Código Civil. Portanto,
                a conservação dos Dados Pessoais por tal período, mesmo após o fim do período de tratamento pela
                Empresa, observa a hipótese prevista no inciso I do Artigo 16 da LGPD. Após referido prazo, a Empresa
                eliminará de seu repositório os Dados Pessoais do Usuário.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">
                Como a Empresa Garante a Segurança das Informações?
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Conforme previsto nos incisos VII e VIII do Artigo 6º da LGPD, que tratam do princípio da segurança e
                prevenção, respectivamente, a Empresa utiliza os mais modernos recursos existentes na área de segurança
                da informação para o ambiente da internet, garantindo assim seu acesso de forma segura. As informações
                transmitidas entre o Usuário e a Empresa passam por um processo de criptografia utilizando o SSL (Secure
                Sockets Layer), permitindo a decodificação dos dados, de forma legível, apenas para o Usuário e para
                nosso site e aplicativo. Assim, a cada acesso realizado, essa chave de segurança não pode ser decifrada
                por terceiros, sendo de uso exclusivo do site e aplicativo Empresa. Essa chave é a garantia de que o
                Usuário está operando em sistema seguro.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">
                Quais São os Browsers Compatíveis Com a Segurança da Informação da Empresa?
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                A utilização de determinados browsers pode criar incompatibilidade com o sistema de segurança e recursos
                utilizados pela Empresa. Os browsers mais adequados para navegar são sempre os navegadores mais modernos
                e conhecidos (Google Chrome, Mozilla Firefox, Microsoft Edge). Os browsers devem ser adquiridos com
                distribuidores autorizados, que podem garantir a autenticidade do software.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                Alguns distribuidores fornecem os browsers através da própria internet, por meio de download. Todos os
                problemas referentes ao browser devem ser reportados aos seus respectivos fornecedores ou
                distribuidores. A Empresa não se responsabiliza por problemas causados pelo browser, ou por problemas
                oriundos da utilização de browser incompatível com navegação segura.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                Também não nos responsabilizamos pela não realização de operações que sejam decorrentes de fatos, atos
                ou omissões ocasionados por outros prestadores de serviços contratados pelo Usuário, tais como
                prestadores de serviços de telecomunicação, inclusive transmissão de dados via cabo ou fibras óticas,
                provedores de acesso à Internet ou, ainda, por falhas do terminal de acesso à Internet do Usuário, entre
                outros.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">A Empresa Utiliza Cookies?</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                A Empresa coleta dados que identifiquem sua visita no site ou aplicativo para lhe oferecer uma
                experiência melhor e personalizada, além de algumas informações, como tipo de navegador, resolução da
                tela e data de acesso, obtidos por meio de relatórios gerados via logs, rotinas javascript e cookies,
                este último também utilizado em relatórios estatísticos para aperfeiçoamento da navegação, dos serviços
                oferecidos e para contagem do número de visitantes e acessos, facilitando assim a definição do parque
                tecnológico instalado para o site. Caso o Usuário preencha voluntariamente algum formulário em nosso
                site, essas informações somente serão usadas para o propósito com o qual elas foram preenchidas e que
                estão esclarecidas na página de cada cadastro. Em nenhuma hipótese os dados fornecidos serão vendidos,
                alugados ou repassados para terceiros para fins comerciais alheios à plataforma.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">
                A Empresa Utiliza Seus Dados Para Fins de Marketing?
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                O site e aplicativo da Empresa não aceitam e nem fazem publicidade de outras marcas ou somente de
                parceiros. Os conteúdos exibidos em suas páginas são de finalidade editorial e caráter informativo. Os
                banners existentes são apenas para dar mais ênfase aos conteúdos que merecem maior atenção dos nossos
                Usuários.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">
                A Empresa Compartilha os Dados Coletados com Terceiros?
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Observado o inciso V do Artigo 9º da LGPD, a Empresa informa que não compartilha, vende, aluga ou
                divulga informações de seus Usuários, salvo nas hipóteses descritas a seguir.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                A Empresa poderá compartilhar os dados profissionais dos Usuários — como nome, portfólio, localização,
                habilidades e redes sociais profissionais — com estúdios, consultorias de recrutamento e headhunters
                cadastrados na plataforma, exclusivamente para fins de recrutamento no setor de games. Esse
                compartilhamento ocorrerá somente mediante consentimento prévio, livre e informado do Usuário, obtido no
                momento do cadastro ou por meio das configurações do perfil, podendo ser revogado a qualquer momento.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-3">
                Faz-se saber que a Empresa utiliza o Google Analytics, uma ferramenta de análise de dados da internet
                (web analytics), para acompanhar os dados de audiência do aplicativo e entender como os visitantes
                interagem e navegam por nossas páginas. O Google Analytics coleta informações de forma anônima, ou seja,
                relata as tendências do site, como páginas visitadas, tempo de permanência no site, entre outras
                informações, sem identificar visitantes individuais. Portanto, os dados pessoais compartilhados pelo
                Google Analytics com a Empresa são anonimizados, nos termos do inciso III do Artigo 5º da LGPD. Neste
                sentido, não se aplica a LGPD, conforme previsto no seu Artigo 12. Mais detalhes sobre a política de
                privacidade do Google Analytics podem ser encontrados em{" "}
                <a href="http://www.google.com/intl/en_uk/analytics/privacyoverview.html" {...linkProps}>
                  http://www.google.com/intl/en_uk/analytics/privacyoverview.html
                </a>
                .
              </p>
              <p className="text-base text-muted-foreground leading-relaxed mt-2">
                O aplicativo da Empresa foi desenvolvido utilizando a Vercel para hospedagem, a Supabase para
                armazenamento de dados e a Sentry para monitoramento de erros e estabilidade do aplicativo. Essas
                empresas poderão ter acesso a determinadas informações inseridas no aplicativo da Empresa apenas quando
                necessário para a prestação de seus serviços, nos estritos termos previstos na LGPD.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">
                Do Direito do Usuário, como Titular dos Dados Pessoais
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Conforme previsto no Artigo 18 da LGPD, é assegurado ao Usuário, a qualquer momento, mediante requisição
                à Empresa por meio do e-mail{" "}
                <a href="mailto:lucas.pimenta@matchmaking.games" className="text-primary hover:underline">
                  lucas.pimenta@matchmaking.games
                </a>
                , requerer:
              </p>
              <ul className="list-disc list-inside text-base text-muted-foreground leading-relaxed space-y-1 mt-2">
                <li>Confirmação da existência de tratamento dos Dados Pessoais;</li>
                <li>Acesso aos Dados Pessoais os quais a Empresa trata;</li>
                <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
                <li>
                  Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em
                  desconformidade com a LGPD;
                </li>
                <li>Portabilidade dos dados a outro fornecedor;</li>
                <li>
                  Eliminação do Dados Pessoais tratados com o consentimento do Usuário, exceto nas hipóteses previstas
                  no Artigo 16 da LGPD;
                </li>
                <li>
                  Informação das entidades públicas e privadas com as quais a Empresa realizou uso compartilhado de
                  dados;
                </li>
                <li>
                  Informação sobre a possibilidade de não fornecer consentimento e sobre as consequências negativa; e
                </li>
                <li>Revogação do consentimento, quando aplicável.</li>
              </ul>
              <p className="text-base text-muted-foreground leading-relaxed mt-3">
                Caso o Usuário queira ter a confirmação de existência ou o acesso aos seus Dados Pessoais, a Empresa
                providenciará em até 5 dias úteis, contado da data do requerimento do Usuário, tais informações em
                formato simplificado; e em até 15 dias, contado da data do requerimento do Usuário, uma declaração clara
                e completa, que indique a origem dos dados, a inexistência de registro, os critérios utilizados e a
                finalidade do tratamento, observados os segredos comercial e industrial.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">
                Alteração nesta Política de Privacidade
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Na hipótese de ocorrer qualquer alteração em relação à finalidade específica do tratamento de Dados
                Pessoais e Dados Pessoais Sensíveis prevista, ou na forma e duração do referido tratamento, na
                identificação da Empresa como controladora dos dados ou nas informações compartilhadas pela Empresa e
                sua finalidade, esta se compromete a informar aos Usuários, com destaque de forma específica do teor das
                alterações, conforme previsto no § 6º do Artigo 8º da LGPD.
              </p>
            </section>

            <section>
              <h2 className="font-display font-semibold text-xl text-foreground mb-3">Encarregado da Empresa</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Caso o Usuário tenha qualquer dúvida em relação ao tratamento de seus Dados Pessoais ou queira exercer
                quaisquer de seus direitos como titular do dado pessoal, basta entrar em contato com o Encarregado da
                Empresa, o Sr. Lucas Pimenta Rodrigues por meio do e-mail{" "}
                <a href="mailto:lucas.pimenta@matchmaking.games" className="text-primary hover:underline">
                  lucas.pimenta@matchmaking.games
                </a>
                .
              </p>
            </section>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
