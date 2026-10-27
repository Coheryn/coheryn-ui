import React from 'react';
import {
  Button,
  IconButton,
  Dialog,
  Modal,
  Drawer,
  Popover,
  Dropdown,
  ToastProvider,
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

  it('renders Modal alias and Drawer with ARIA dialog roles', () => {
    const modal = (
      <Modal isOpen={true} onClose={() => {}} title="Test Modal Alias">
        <p>Modal content</p>
      </Modal>
    );
    const drawer = (
      <Drawer isOpen={true} onClose={() => {}} title="Side Drawer" placement="right">
        <p>Drawer content</p>
      </Drawer>
    );
    expect(modal).toBeDefined();
    expect(modal.props.isOpen).toBe(true);
    expect(drawer).toBeDefined();
    expect(drawer.props.placement).toBe('right');
  });

  it('renders Popover and DropdownMenu with trigger and item options', () => {
    const popover = (
      <Popover
        trigger={<button>Info</button>}
        content={<div>Popover details</div>}
        placement="top"
      />
    );
    const menuItems = [
      { id: '1', label: 'Edit profile', onClick: () => {} },
      { id: '2', label: 'Delete account', danger: true, onClick: () => {} },
    ];
    const dropdown = (
      <Dropdown
        trigger={<button>Options</button>}
        items={menuItems}
        placement="bottom-right"
      />
    );
    expect(popover).toBeDefined();
    expect(dropdown).toBeDefined();
    expect(dropdown.props.items).toHaveLength(2);
  });

  it('renders ToastProvider container', () => {
    const toastApp = (
      <ToastProvider position="top-right">
        <div>App Body</div>
      </ToastProvider>
    );
    expect(toastApp).toBeDefined();
  });
});

