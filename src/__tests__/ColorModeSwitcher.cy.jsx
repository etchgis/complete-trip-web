import { ColorModeSwitcher } from '../components/ColorModeSwitcher/ColorModeSwitcher';
import { TestWrapper } from '../setupTests';
import { mount } from '@cypress/react18';

describe('ColorModeSwitcher', () => {
  it('renders ColorModeSwitcher component', () => {
    mount(
      <TestWrapper>
        <ColorModeSwitcher />
      </TestWrapper>
    );
  });
});
