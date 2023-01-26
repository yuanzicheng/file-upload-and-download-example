import { Result } from '@arco-design/web-react';

export const NotFound = () => {
    return (
        <div>
            <Result
                status='error'
                title='404 Not Found'
            />
        </div>
    );
};
