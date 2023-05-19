import React, { useReducer, useRef, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import PropTypes from 'prop-types'
import { TextInput, Menu } from 'react-native-paper'
import { GOOGLE_API_KEY } from "@env"
import axios from 'axios'

const GOOGLE_PACES_API_BASE_URL = 'https://maps.googleapis.com/maps/api/place'

const Autocomplete = React.forwardRef((props, ref) => {
    const [state, setState] = useReducer(
        (state, newState) => ({...state, ...newState}),
        {
            visible: false,
            text: '',
            data: [],
            width: 0,
            x: 0,
            y: 0
        }
    )

    const { visible, text, data, width, x, y } = state
    const viewRef = useRef(null)

    useEffect(() => {
        if (text.length > 0) {
            try {
                const apiUrl = `${GOOGLE_PACES_API_BASE_URL}/autocomplete/json?key=${GOOGLE_API_KEY}&components=country:au&input=${text}`
                axios.request({
                    method: 'POST',
                    url: apiUrl
                }).then((result) => {
                    if (result) {
                        const { data: { predictions } } = result
                        setState({
                            data: predictions,
                            visible: predictions.length > 0 ? true : false
                        })            
                    }
                })
            } catch (e) {
                console.log(e)
            }    
        } else if (text.length === 0 && visible) {
            setState({
                visible: false
            })
        }
    }, [text])

    useEffect(() => {
        viewRef.current.measure((fx, fy, width, height, px, py) => {
            setState({
                width,
                x: px,
                y: py + height
            })
        })
    }, [props.scrollY])

    const closeMenu = () => {
        setState({
            visible: false
        })
    }

    const onChange = (e) => {
        props.onChange(e, props.name)
        const { text } = e.nativeEvent

        setState({
            text
        })
    }

    const setText = (text) => {
        const obj = {
            nativeEvent: {
                text
            }
        }
        props.onChange(obj, props.name)
        closeMenu()
    }

    const onLayout = () => {}

    return (
        <View ref={viewRef} onLayout={onLayout}>
            <TextInput {...props} ref={ref} onChange={onChange}/>
            <Menu visible={visible}
                onDismiss={closeMenu}
                anchor={{
                    x: x ? x : 0,
                    y: y ? y : 0
                }}
                style={{width}}
            >
                { data.map((item, index) => 
                    <Menu.Item key={index} onPress={() => setText(item.description)} title={item.description}/>
                )}
            </Menu>
        </View>
    )    
})

const styles = StyleSheet.create({
    container: {
        height: 380
    },
})

Autocomplete.propTypes = {
    disabled: PropTypes.bool
}

Autocomplete.defaultProps = {
    disabled: false
}

export default Autocomplete