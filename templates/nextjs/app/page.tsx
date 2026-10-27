import React from 'react';
import { Button, GlassCard, Stack, Cluster, Badge } from '@coherynui/react';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '3rem 1.5rem', maxWidth: '64rem', margin: '0 auto' }}>
      <Stack gap="8" style={{ alignItems: 'center', textAlign: 'center' }}>
        <Cluster gap="2">
          <Badge variant="brand">Next.js App Router</Badge>
          <Badge variant="success">Zero-FOUC Layers</Badge>
          <Badge variant="warning">WCAG 2.2 Compliant</Badge>
        </Cluster>

        <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
          CoherynUI with Next.js App Router
        </h1>

        <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '42rem' }}>
          Server-safe W3C cascade layers (@layer cyn.*), full accessibility contracts, and fluid mobile touch ergonomics.
        </p>

        <Cluster gap="4" style={{ justifyContent: 'center', marginTop: '1rem' }}>
          <a
            href="https://github.com/Coheryn/coheryn-ui"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <Button variant="primary" size="lg">
              GitHub Repository →
            </Button>
          </a>

          <a
            href="https://coheryntech.com/products/coheryn-ui"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <Button variant="glass" size="lg">
              Explore Docs
            </Button>
          </a>
        </Cluster>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', width: '100%', marginTop: '3rem', textAlign: 'left' }}>
          <GlassCard>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>⚡</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Server-Safe Cascade</h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
              Zero Flash of Unstyled Content (FOUC). All cascade layers evaluated natively by the browser without runtime JS overhead.
            </p>
          </GlassCard>

          <GlassCard>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>📱</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Touch Target Contracts</h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
              Guaranteed 44×44px hit bounds satisfying WCAG 2.2 Success Criterion 2.5.8 across mobile and tablet viewports.
            </p>
          </GlassCard>
        </div>
      </Stack>
    </main>
  );
}
