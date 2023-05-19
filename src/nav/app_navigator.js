import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import IndexContainer from '../containers/index_container';
import LoginContainer from '../containers/login_container';
import ForgotPasswordContainer from '../containers/forgot_password_container';
import WelcomeContainer from '../containers/welcome_container';
import ShiftDashboardContainer from '../containers/shift_dashboard_container';
import EndShiftContainer from '../containers/end_shift_container';
import AlarmResponseContainer from '../containers/alarm_response_container';
import ClientContainer from '../containers/client_container';
import LogPatrolContainer from '../containers/log_patrol_container';
import LogPatrolTYContainer from '../containers/log_patrol_ty_container';
import AlarmResponseTYContainer from '../containers/alarm_response_ty_container';
import EndShiftTYContainer from '../containers/end_shift_ty_container';

const Stack = createStackNavigator();

function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Index">
                <Stack.Screen name="Index" component={IndexContainer} options={{header: () => null}}/>
                <Stack.Screen name="Login" component={LoginContainer} options={{header: () => null}}/>
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordContainer} options={{header: () => null}}/>
                <Stack.Screen name="Welcome" component={WelcomeContainer} options={{header: () => null}}/>
                <Stack.Screen name="ShiftDashboard" component={ShiftDashboardContainer} options={{header: () => null}}/>
                <Stack.Screen name="EndShift" component={EndShiftContainer} options={{header: () => null}}/>
                <Stack.Screen name="AlarmResponse" component={AlarmResponseContainer} options={{header: () => null}}/>
                <Stack.Screen name="Client" component={ClientContainer} options={{header: () => null}}/>
                <Stack.Screen name="LogPatrol" component={LogPatrolContainer} options={{header: () => null}}/>
                <Stack.Screen name="LogPatrolTY" component={LogPatrolTYContainer} options={{header: () => null}}/>
                <Stack.Screen name="AlarmResponseTY" component={AlarmResponseTYContainer} options={{header: () => null}}/>
                <Stack.Screen name="EndShiftTY" component={EndShiftTYContainer} options={{header: () => null}}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default AppNavigator;