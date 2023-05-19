import React from 'react';
import PropTypes from 'prop-types';
import Svg, { Path, G } from 'react-native-svg';

const FlashAutoIcon = React.memo(({width, height, color}) => {
    return (
        <Svg height={height} width={width} viewBox="0 0 322.944 322.944" fill={color}>
            <G>
                <G>
                    <Path d="M244.111,136.472c-43.469,0-78.833,35.365-78.833,78.834c0,43.469,35.364,78.833,78.833,78.833
                        c43.469,0,78.833-35.364,78.833-78.833C322.944,171.837,287.58,136.472,244.111,136.472z M244.111,269.139
                        c-29.684,0-53.833-24.149-53.833-53.833c0-29.685,24.149-53.834,53.833-53.834s53.833,24.149,53.833,53.834
                        C297.944,244.99,273.795,269.139,244.111,269.139z"/>
                    <Path d="M125.322,218.488c-0.028-1.057-0.044-2.118-0.044-3.182c0-41.163,21.041-77.5,52.928-98.834h-61.098L154,18.972H56
                        l-56,148l100.205,0.487L48.5,303.972L125.322,218.488z"/>
                </G>
                <Path d="M237.97,178.38l-25.093,64.424h13.799l5.317-14.634h25.752l5.625,14.634h14.15l-25.796-64.424H237.97z M235.992,217.315
                    l8.701-23.906l8.877,23.906H235.992z"/>
            </G>
        </Svg>
    )
})

FlashAutoIcon.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    color: PropTypes.string
}

FlashAutoIcon.defaultProps = {
    color: "#000"
}

export default FlashAutoIcon