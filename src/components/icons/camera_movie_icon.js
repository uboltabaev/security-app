import React from 'react';
import PropTypes from 'prop-types';
import Svg, { Path } from 'react-native-svg';

const CameraMovieIcon = React.memo(({width, height, color}) => {
    return (
        <Svg height={height} width={width} viewBox="0 0 576 512" fill={color}>
            <Path d="M535.68 260.59L448 321.05V447l87.66 60.39c17 11.68 40.32-.23 40.32-20.63V281.22c.02-20.32-23.25-32.32-40.3-20.63zM368.2 288H16a16 16 0 0 0-16 16v32a16 16 0 0 0 16 16h48v112.2a47.81 47.81 0 0 0 47.8 47.8h256.4a47.81 47.81 0 0 0 47.8-47.8V335.8a47.81 47.81 0 0 0-47.8-47.8zM352 0c-48.57 0-90.31 27.37-112 67.23C218.31 27.37 176.57 0 128 0a128 128 0 0 0 0 256h224a128 128 0 0 0 0-256zM128 192a64 64 0 1 1 64-64 64.07 64.07 0 0 1-64 64zm224 0a64 64 0 1 1 64-64 64.07 64.07 0 0 1-64 64z"></Path>
        </Svg>
    )
})

CameraMovieIcon.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    color: PropTypes.string
}

CameraMovieIcon.defaultProps = {
    color: "#000"
}

export default CameraMovieIcon