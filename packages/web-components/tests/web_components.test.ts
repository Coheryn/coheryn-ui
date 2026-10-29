import {
  CynModal,
  CynDrawer,
  CynBottomSheet,
  CynPopover,
  CynDropdown,
  CynSwitch,
  CynTabs,
  CynToastContainer,
  CynNavbar,
  CUSTOM_ELEMENTS_MAP,
  defineCustomElements,
} from '../src/index';

describe('CoherynUI Native Web Component Custom Elements', () => {
  it('exposes all 9 official custom element constructors in the mapping', () => {
    expect(CUSTOM_ELEMENTS_MAP['cyn-modal']).toBe(CynModal);
    expect(CUSTOM_ELEMENTS_MAP['cyn-drawer']).toBe(CynDrawer);
    expect(CUSTOM_ELEMENTS_MAP['cyn-bottom-sheet']).toBe(CynBottomSheet);
    expect(CUSTOM_ELEMENTS_MAP['cyn-popover']).toBe(CynPopover);
    expect(CUSTOM_ELEMENTS_MAP['cyn-dropdown']).toBe(CynDropdown);
    expect(CUSTOM_ELEMENTS_MAP['cyn-switch']).toBe(CynSwitch);
    expect(CUSTOM_ELEMENTS_MAP['cyn-tabs']).toBe(CynTabs);
    expect(CUSTOM_ELEMENTS_MAP['cyn-toast-container']).toBe(CynToastContainer);
    expect(CUSTOM_ELEMENTS_MAP['cyn-navbar']).toBe(CynNavbar);
  });

  it('provides public imperative methods on CynNavbar', () => {
    expect(typeof CynNavbar.prototype.toggle).toBe('function');
    expect(typeof CynNavbar.prototype.show).toBe('function');
    expect(typeof CynNavbar.prototype.close).toBe('function');
    expect(CynNavbar.observedAttributes).toContain('open');
    expect(CynNavbar.observedAttributes).toContain('pattern');
  });

  it('provides public imperative methods on CynModal', () => {
    expect(typeof CynModal.prototype.show).toBe('function');
    expect(typeof CynModal.prototype.close).toBe('function');
    expect(typeof CynModal.prototype.toggle).toBe('function');
    expect(CynModal.observedAttributes).toContain('open');
    expect(CynModal.observedAttributes).toContain('title');
  });

  it('provides public imperative methods on CynDrawer', () => {
    expect(typeof CynDrawer.prototype.show).toBe('function');
    expect(typeof CynDrawer.prototype.close).toBe('function');
    expect(typeof CynDrawer.prototype.toggle).toBe('function');
    expect(CynDrawer.observedAttributes).toContain('open');
    expect(CynDrawer.observedAttributes).toContain('placement');
  });

  it('provides public imperative methods on CynBottomSheet', () => {
    expect(typeof CynBottomSheet.prototype.show).toBe('function');
    expect(typeof CynBottomSheet.prototype.close).toBe('function');
    expect(CynBottomSheet.observedAttributes).toContain('open');
  });

  it('provides public imperative methods on CynPopover and CynDropdown', () => {
    expect(typeof CynPopover.prototype.toggle).toBe('function');
    expect(typeof CynDropdown.prototype.toggle).toBe('function');
    expect(CynPopover.observedAttributes).toContain('open');
    expect(CynDropdown.observedAttributes).toContain('open');
  });

  it('provides toggle method and observedAttributes on CynSwitch', () => {
    expect(typeof CynSwitch.prototype.toggle).toBe('function');
    expect(CynSwitch.observedAttributes).toContain('checked');
    expect(CynSwitch.observedAttributes).toContain('disabled');
  });

  it('provides show method on CynToastContainer', () => {
    expect(typeof CynToastContainer.prototype.show).toBe('function');
  });

  it('executes defineCustomElements safely in test environment without throwing', () => {
    expect(() => defineCustomElements()).not.toThrow();
  });
});
