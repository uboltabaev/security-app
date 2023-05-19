import { StyleSheet } from 'react-native';

import { 
    APP_MAIN_COLOR, 
    WINDOW_HEIGHT, 
    WINDOW_WIDTH
} from '../constants/app';

export default StyleSheet.create({
    flex: {
        flex: 1
    },
    image: {
        width: '100%',
        height: '100%'
    },
    error: {
        color: '#8e0920',
        paddingLeft: 7
    },
    button: {
        marginTop: 20,
        height: 60
    },
    buttonLabel: {
        paddingVertical: 10,
        fontSize: 16,
        color: '#fff'
    },
    smallButton: {

    },
    smallButtonLabel: {
        paddingVertical: 0,
        fontSize: 13,
        fontWeight: 'normal'
    },
    link: {
        fontWeight: 'bold',
        fontSize: 16,
        color: APP_MAIN_COLOR
    },
    note: {
        marginTop: 18,
        color: APP_MAIN_COLOR,
        fontSize: 12,
        lineHeight: 16
    },
    f: {
        flex: 1,
        flexDirection: 'row'
    },
    fInner: {
        flex: 1,
        marginRight: 10
    },
    dialogueContainer: {
        marginHorizontal: 20,
        padding: 20,
        height: 200,
        backgroundColor: '#fff'
    },
    dialogueHeader: {
        height: 30,
        borderBottomColor: '#f0f0f0',
        borderBottomWidth: 1,
        paddingBottom: 10
    },
    dialogueInnerHeader: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
    },
    dialogueTitle: {
        color: APP_MAIN_COLOR,
        fontWeight: 'bold',
        fontSize: 22,
        lineHeight: 24
    },
    dialogueContent: {
        paddingTop: 10
    },
    flexSingleCentered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    checkCircle: {
        marginTop: 10,
        marginBottom: 20
    },
    "flexRowCentered": {
        flex: 1,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "space-between"
    },
    hidden: {
        position: 'absolute', 
        top: -3000
    },
    backendLayoutTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff'
    },
    backendLayoutSecondText: {
        color: '#fff',
        fontSize: 12,
        marginTop: 7
    },
    backendLayoutBack: {
        marginTop: 5,
        height: 30
    }
});