import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import PropTypes from 'prop-types';
import { APP_MAIN_COLOR } from '../constants/app';

const Row = React.memo(({ title, value, lastRow }) => {
    return (
        <View style={[styles.row, lastRow && (styles.lastRow)]}>
            <Text style={styles.rowTitle}>{title}</Text>
            <Text style={styles.rowValue}>{value}</Text>
        </View>
    )
})

const styles = StyleSheet.create({
    row:{
        flex: 1,
        flexDirection: 'row',
        borderTopColor: '#f0f0f0',
        borderTopWidth: 1,
        paddingVertical: 12,
        justifyContent: 'space-between'
    },
    lastRow: {
        borderBottomColor: '#f0f0f0',
        borderBottomWidth: 1,
    },
    rowTitle: {
        color: APP_MAIN_COLOR
    },
    rowValue: {
        color: APP_MAIN_COLOR,
        fontWeight: 'bold'
    }
})

Row.propTypes = {
    title: PropTypes.string,
    value: PropTypes.any,
    lastRow: PropTypes.bool
}

Row.defaultProps = {
    lastRow: false
}

export default Row;