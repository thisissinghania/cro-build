import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Preview,
  Section,
  Button,
} from '@react-email/components';

interface VerifyEmailTemplateProps {
  userFirstname: string;
  confirmLink: string;
}

export const VerifyEmailTemplate = ({
  userFirstname,
  confirmLink,
}: VerifyEmailTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>Verify your CROBuild email address</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>CROBuild</Text>
          <Section style={section}>
            <Text style={text}>Hi {userFirstname},</Text>
            <Text style={text}>
              Welcome to CROBuild! We're excited to have you on board. Please verify your email address to get started and unlock all features.
            </Text>
            <Button style={button} href={confirmLink}>
              Verify Email Address
            </Button>
            <Text style={text}>
              If you didn't create an account, you can safely ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default VerifyEmailTemplate;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
};

const heading = {
  fontSize: '28px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: 'bold',
  color: '#111827',
  padding: '17px 0 0',
  textAlign: 'center' as const,
};

const section = {
  padding: '0 48px',
};

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '26px',
  textAlign: 'left' as const,
};

const button = {
  backgroundColor: '#4f46e5', // indigo-600
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '16px 0',
  marginTop: '24px',
  marginBottom: '24px',
};
