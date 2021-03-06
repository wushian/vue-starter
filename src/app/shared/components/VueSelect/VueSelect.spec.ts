import { mount, createLocalVue } from '@vue/test-utils';
import VueSelect from './VueSelect.vue';
import $style from 'identity-obj-proxy';

const localVue = createLocalVue();

describe('VueSelect.vue', () => {
  const options = [
    {
      label: 'Foo',
      value: 'foo',
    },
    {
      label: 'Bar',
      value: 'bar',
    },
    {
      label: 'Baz',
      value: 'baz',
    },
    {
      label: 'Bla Bla Bla Bla Bla',
      value: 'bla',
    },
    {
      label: 'Lorem Ipsum la la la',
      value: 'lorem',
    },
  ];

  test('renders component', () => {
    const wrapper = mount(VueSelect, {
      localVue,
      mocks: { $style },
      propsData: {
        options,
      },
    }) as any;

    expect(wrapper.findAll('option')).toHaveLength(5);
    expect(wrapper.find('select').attributes().multiple).toBe(undefined);
  });

  test('renders multi component', () => {
    const wrapper = mount(VueSelect, {
      localVue,
      mocks: { $style },
      propsData: {
        options,
        multiple: true,
      },
    }) as any;

    expect(wrapper.findAll('option')).toHaveLength(5);
    expect(wrapper.find('select').attributes().multiple).toBe('multiple');
  });

});
