import React, { ReactNode } from 'react';

type ParagraphType = 'small' | 'reading' | 'writing' | 'footer';

interface Props extends React.HTMLAttributes<HTMLParagraphElement> {
    children?: ReactNode;
    secondary?: boolean;
    type: ParagraphType;
}
const Paragraph = ({ children, type, secondary, className, ...rest }: Props): JSX.Element => (
    <p
        {...rest}
        className={`${className} paragraph paragraph--${type} ${
            secondary || type === 'footer' ? 'paragraph--secondary' : ''
        }`}
    >
        {children}
    </p>
);

export default Paragraph;
