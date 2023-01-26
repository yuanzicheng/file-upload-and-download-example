import { Result } from '@arco-design/web-react';
import { IconFaceSmileFill } from '@arco-design/web-react/icon';

export const Home = () => {
    return (
        <div>
            <Result
                status={null}
                icon={<IconFaceSmileFill style={{ color: 'rgb(var(--arcoblue-6))' }} />}
                title='Welcome'
            ></Result>
        </div>
    )
};