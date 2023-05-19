import React from 'react';
import PropTypes from 'prop-types';
import Svg, { Path } from 'react-native-svg';

const FolderIcon = React.memo(({width, height, color}) => {
    return (
        <Svg height={height} width={width} viewBox="0 0 512 512" fill={color}>
            <Path d="m30 196c0-24.813 20.187-45 45-45h260c24.813 0 45 20.187 45 45v15h30v-50c0-22.056-17.944-40-40-40h-180v-20c0-22.056-17.944-40-40-40h-110c-22.056 0-40 17.944-40 40v274.069l30-48.032z"/>
            <Path d="m335 181h-260c-8.284 0-15 6.716-15 15v83.004l29.257-46.843c8.278-13.251 22.546-21.161 38.167-21.161h222.576v-15c0-8.284-6.716-15-15-15z"/>
            <Path d="m395.026 451h-380c-5.452 0-10.475-2.958-13.118-7.727s-2.492-10.596.396-15.22l112.424-180c2.741-4.388 7.549-7.054 12.723-7.054h349.543c12.897 0 24.706 7.055 30.818 18.411 6.113 11.357 5.498 25.1-1.604 35.864l-98.674 149.007c-2.779 4.197-7.477 6.719-12.508 6.719z"/>
        </Svg>
    )
})

FolderIcon.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    color: PropTypes.string
}

FolderIcon.defaultProps = {
    color: "#000"
}

export default FolderIcon