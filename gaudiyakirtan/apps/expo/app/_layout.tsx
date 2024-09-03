// import { Provider } from 'app/provider'
import { Provider } from 'app/provider/index'
import { Stack } from 'expo-router'

export default function Root() {
  return (
    <Provider>
      <Stack />
    </Provider>
  )
}
