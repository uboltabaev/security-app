import React from 'react';
import PropTypes from 'prop-types';
import Svg, { Path, G, Rect } from 'react-native-svg';

const FlashOffIcon = React.memo(({width, height, color}) => {
    return (
        <Svg height={height} width={width} viewBox="0 0 322.944 322.944" fill={color}>
            <G>
                <Path d="M244.111,136.472c-43.469,0-78.833,35.365-78.833,78.834c0,43.469,35.364,78.833,78.833,78.833
                    c43.469,0,78.833-35.364,78.833-78.833C322.944,171.837,287.58,136.472,244.111,136.472z M244.111,269.139
                    c-29.684,0-53.833-24.149-53.833-53.833c0-29.685,24.149-53.834,53.833-53.834s53.833,24.149,53.833,53.834
                    C297.944,244.99,273.795,269.139,244.111,269.139z"/>
                <Rect x="203.611" y="202.806" width="81" height="25"/>
                <Path d="M178.206,116.472h-61.098L154,18.972H56l-56,148l100.205,0.487L48.5,303.972l76.822-85.484
                    c-0.028-1.057-0.043-2.118-0.043-3.182C125.278,174.143,146.319,137.806,178.206,116.472z"/>
            </G>
        </Svg>
    )
})

FlashOffIcon.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    color: PropTypes.string
}

FlashOffIcon.defaultProps = {
    color: "#000"
}

export default FlashOffIcon