import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Hr,
  Link,
} from "react-email";

type Props = {
  surveyTitle: string;
  surveyUrl: string;
  responseCount: number;
  submittedAt: Date;
};

export function SubmissionNotification({
  surveyTitle,
  surveyUrl,
  responseCount,
  submittedAt,
}: Props) {
  const date = submittedAt.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Html lang="fr">
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>OpineoDJ · BlyAnalytics</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Nouvelle réponse reçue</Heading>
            <Text style={paragraph}>
              Une nouvelle réponse a été soumise pour le sondage{" "}
              <strong>{surveyTitle}</strong>.
            </Text>

            <Section style={statBox}>
              <Text style={statLabel}>Réponses collectées</Text>
              <Text style={statValue}>{responseCount}</Text>
            </Section>

            <Text style={meta}>Soumis le {date}</Text>

            <Hr style={hr} />

            <Link href={surveyUrl} style={button}>
              Voir les résultats →
            </Link>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              OpineoDJ by BlyAnalytics — L&apos;analyse qui compte.
            </Text>
            <Text style={footerText}>
              Vous recevez cet email car vous êtes analyste sur ce sondage.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const body: React.CSSProperties = {
  backgroundColor: "#F7F6F2",
  fontFamily: "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  margin: 0,
  padding: "32px 0",
};

const container: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  borderRadius: "8px",
  maxWidth: "560px",
  margin: "0 auto",
  overflow: "hidden",
};

const header: React.CSSProperties = {
  backgroundColor: "#2D6A4F",
  padding: "20px 32px",
};

const brand: React.CSSProperties = {
  color: "#FFFFFF",
  fontSize: "13px",
  letterSpacing: "0.08em",
  margin: 0,
};

const content: React.CSSProperties = {
  padding: "32px",
};

const h1: React.CSSProperties = {
  color: "#1C1C1A",
  fontSize: "22px",
  fontWeight: "600",
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  color: "#6B6B63",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 24px",
};

const statBox: React.CSSProperties = {
  backgroundColor: "#F7F6F2",
  borderRadius: "8px",
  padding: "16px 20px",
  marginBottom: "20px",
};

const statLabel: React.CSSProperties = {
  color: "#6B6B63",
  fontSize: "11px",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  margin: "0 0 4px",
};

const statValue: React.CSSProperties = {
  color: "#2D6A4F",
  fontSize: "32px",
  fontWeight: "700",
  margin: 0,
};

const meta: React.CSSProperties = {
  color: "#9A9A8E",
  fontSize: "12px",
  margin: "0 0 24px",
};

const hr: React.CSSProperties = {
  borderColor: "#E0DDD5",
  margin: "0 0 24px",
};

const button: React.CSSProperties = {
  backgroundColor: "#2D6A4F",
  borderRadius: "6px",
  color: "#FFFFFF",
  display: "inline-block",
  fontSize: "13px",
  fontWeight: "600",
  padding: "10px 20px",
  textDecoration: "none",
};

const footer: React.CSSProperties = {
  borderTop: "1px solid #E0DDD5",
  padding: "20px 32px",
};

const footerText: React.CSSProperties = {
  color: "#9A9A8E",
  fontSize: "11px",
  lineHeight: "1.5",
  margin: "0 0 4px",
};
