import React from 'react';
import PropTypes from 'prop-types';
import Svg, { Polygon } from 'react-native-svg';

const FlashOffIcon = React.memo(({width, height, color}) => {
    return (
        <Svg height={height} width={width} viewBox="0 0 285 285" fill={color}>
            <Polygon points="82.5,285 251,97.5 151.108,97.5 188,0 90,0 34,148 134.205,148.487 "/>
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