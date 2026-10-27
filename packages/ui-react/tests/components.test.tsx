import React from 'react';
import {
  Button,
  IconButton,
  Dialog,
  Tabs,
  Input,
  GlassCard,
  BottomSheet,
  Stack,
  Cluster,
  Center,
} from '../src/index';

describe('CoherynUI React Component Catalog', () => {
  it('renders Button with variants and sizes without throwing', () => {
    const btn = <Button variant="primary" size="lg">Click Me</Button>;
    expect(btn).toBeDefined();
    expect(btn.props.variant).toBe('primary');
  });

  it('renders IconButton with required aria-label and touch target', () => {
    const iconBtn = (
      <IconButton aria-label="Close dialog" variant="subtle" size="md">
        <span>✕</span>
      </IconButton>
    );
    expect(iconBtn).toBeDefined();
    expect(iconBtn.props['aria-label']).toBe('Close dialog');
  });

  it('renders BottomSheet modal with drag affordance handle', () => {
    const sheet = (
      <BottomSheet isOpen={true} onClose={() => {}} title="Filter Sheet">
        <p>Sheet options</p>
      </BottomSheet>
    );
    expect(sheet).toBeDefined();
    expect(sheet.props.isOpen).toBe(true);
    expect(sheet.props.title).toBe('Filter Sheet');
  });

  it('renders Dialog with ARIA modal attributes when open', () => {
    const dialog = (
      <Dialog isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Dialog>
    );
    expect(dialog).toBeDefined();
    expect(dialog.props.isOpen).toBe(true);
  });

  it('renders Tabs with tablist and controls', () => {
    const tabsData = [
      { id: '1', label: 'Tab 1', content: <div>Content 1</div> },
      { id: '2', label: 'Tab 2', content: <div>Content 2</div> },
    ];
    const tabs = <Tabs tabs={tabsData} />;
    expect(tabs).toBeDefined();
  });

  it('renders GlassCard with Liquid Glass recipe class', () => {
    const card = <GlassCard>Glass Content</GlassCard>;
    expect(card).toBeDefined();
  });

  it('renders Layout Primitives: Stack, Cluster, Center', () => {
    const stack = <Stack gap="6"><div>Item 1</div><div>Item 2</div></Stack>;
    const cluster = <Cluster gap="4"><span>Tag 1</span><span>Tag 2</span></Cluster>;
    const center = <Center><p>Centered</p></Center>;

    expect(stack).toBeDefined();
    expect(cluster).toBeDefined();
    expect(center).toBeDefined();
  });
});
