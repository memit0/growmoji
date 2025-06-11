import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

// This is a simple example component to demonstrate testing
const ExampleComponent = () => (
  <Text testID="example-text">Hello, Testing!</Text>
);

describe('ExampleComponent', () => {
  it('renders correctly', () => {
    render(<ExampleComponent />);
    const element = screen.getByTestId('example-text');
    expect(element).toBeTruthy();
    expect(element.props.children).toBe('Hello, Testing!');
  });
}); 