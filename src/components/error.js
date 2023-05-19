import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import PropTypes from 'prop-types';
import CssHelper from '../helpers/css_helper';
import TriangleIcon from '../components/icons/triangle_icon';

const Error = React.memo(({ errorText }) => {
    if (errorText.length > 0) {
        return (
            <View style={styles.container}>
                <TriangleIcon width={16} height={16} color="#8e0920"/>
                <Text style={CssHelper['error']}>{errorText}</Text>
            </View>
        )
    } else {
        return null
    }
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 5
    },
    linkContainer: {
        marginTop: 25
    }
})

Error.propTypes = {
    errorText: PropTypes.string
}

export default Error