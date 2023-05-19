import 'react-native-gesture-handler'
import React, { useEffect } from 'react'
import firestore from '@react-native-firebase/firestore'
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper'
import { Provider as MobxProvider } from 'mobx-react'
import MobxStore from './src/mobx/store'
import AppNavigator from './src/nav/app_navigator'

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1d1a1a',
    accent: '#f1c40f',
  },
}

function App() {

  useEffect(() => {
    async function bootstrap() {
      await firestore().settings({
        persistence: true
      })
    }    

    bootstrap()
  }, [])

  return (
    <PaperProvider theme={theme}>
      <MobxProvider mobxStore={new MobxStore()}>
        <AppNavigator/>
      </MobxProvider>
    </PaperProvider>
  )
}

export default App