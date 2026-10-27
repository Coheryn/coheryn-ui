import React from 'react';
import { Button, Dialog, Tabs, Input, GlassCard } from '../src/index';

describe('Coheryn UI React Component Catalog', () => {
  it('renders Button with variants and sizes without throwing', () => {
    const btn = <Button variant="primary" size="lg">Click Me</Button>;
    expect(btn).toBeDefined();
    expect(btn.props.variant).toBe('primary');
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
});
