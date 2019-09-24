import React from 'react';
import { cleanup, render, RenderResult, fireEvent } from '@testing-library/react';
import PersonPod from './PersonPod';

describe('Button', (): void => {
    afterEach(cleanup);

    it('should render correctly', (): void => {
        expect((): RenderResult => render(<PersonPod toggleHandler={jest.fn()} />)).not.toThrow();
    });

    it('should toggle the check if preselected is passed in', async (): Promise<void> => {
        const { container } = render(<PersonPod toggleHandler={jest.fn()} initialySelected={true} />);
        expect(container.querySelectorAll('[data-selected]').length).toBe(1);
    });

    it('should toggle the check if the button is clicked', async (): Promise<void> => {
        const mockHandler = jest.fn();
        const { container } = render(<PersonPod toggleHandler={mockHandler} />);
        await fireEvent.click(container.querySelector('.pod__button'));
        expect(container.querySelectorAll('[data-selected]').length).toBe(1);
    });

    it('should call the callback if the button is clicked', async (): Promise<void> => {
        const mockHandler = jest.fn();
        const { container } = render(<PersonPod toggleHandler={mockHandler} />);
        await fireEvent.click(container.querySelector('.pod__button'));
        expect(mockHandler).toHaveBeenCalled();
    });

    it('should render name prop text', (): void => {
        const { getByText } = render(<PersonPod toggleHandler={jest.fn()} name="A TEST NAME"/>);
        expect(getByText('A TEST NAME')).toBeInTheDocument();
    });

    it('should render institution prop text', (): void => {
        const { getByText } = render(<PersonPod toggleHandler={jest.fn()} institution="A TEST INSTITUTION"/>);
        expect(getByText('A TEST INSTITUTION')).toBeInTheDocument();
    });

    it('should render a comma seperated list of tags', (): void => {
        const { getByText } = render(<PersonPod toggleHandler={jest.fn()} tags={['TagA', 'TagB', 'TagC']}/>);
        expect(getByText('TagA, TagB, TagC')).toBeInTheDocument();
    });
});