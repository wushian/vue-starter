import { mount, createLocalVue } from '@vue/test-utils';
import VueDatePicker from './VueDatePicker.vue';
import $style from 'identity-obj-proxy';

const localVue = createLocalVue();

describe('VueDatePicker.vue', () => {

  test('renders component', () => {
    const wrapper = mount(VueDatePicker, { localVue, mocks: { $style } });

    expect(wrapper.find('h1').text()).toBe('VueDatePicker');
  });

});
