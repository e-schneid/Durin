import { Redirect, Route } from 'react-router-dom'
import { useEffect, FC } from 'react'
import {
  IonApp,
  IonIcon,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import {
  searchOutline,
  cloudUploadOutline,
  settingsOutline,
  listOutline
} from 'ionicons/icons'
import { Filesystem } from '@capacitor/filesystem'
import { SplashScreen } from '@capacitor/splash-screen'
import Browse from './pages/Browse'
import Share from './pages/Share'
import Settings from './pages/Settings'
import Files from './pages/Files'
import File, { Upload } from './pages/File'
import createPersistedState from 'use-persisted-state'
import { SendIntent } from 'send-intent'

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css'
import '@ionic/react/css/float-elements.css'
import '@ionic/react/css/text-alignment.css'
import '@ionic/react/css/text-transformation.css'
import '@ionic/react/css/flex-utils.css'
import '@ionic/react/css/display.css'

/* Theme variables */
import './theme/variables.css'
import './app.scss'
// import upload from './util/upload'

const CID_REGEXP = /(Qm[1-9A-HJ-NP-Za-km-z]{44,}?|b[A-Za-z2-7]{58,}?|B[A-Z2-7]{58,}?|z[1-9A-HJ-NP-Za-km-z]{48,}?|F[0-9A-F]{50,}?)/

setupIonicReact({
  mode: 'ios'
})

const handleIntentReceived = () => {
  SendIntent.checkSendIntentReceived()
    .then((result: any) => {
      if (result) {
        console.log('SendIntent received')
        console.log(JSON.stringify(result))
      }
      if (result.url) {
        const resultUrl = decodeURIComponent(result.url)
        Filesystem.readFile({ path: resultUrl })
          .then((content) => {
            // TODO: Convert this result to a format compatible with upload()
            // upload(...)
          })
          .catch((err) => console.error(err))
      }
    })
    .catch((err) => console.error(err))
}
handleIntentReceived()

window.addEventListener('sendIntentReceived', () => {
  handleIntentReceived()
})

const App: FC = () => {
  const useUploadedFiles = createPersistedState<Upload[]>('uploaded-files')
  const [uploadedFiles, setUploadedFiles] = useUploadedFiles([])
  const hasFiles = uploadedFiles.length > 0

  useEffect(() => {
    SplashScreen.hide()

    if (uploadedFiles.some((f) => !f.cid)) {
      setUploadedFiles(uploadedFiles.map((file: Upload) => {
        if (!file.cid) {
          const extractedCID = CID_REGEXP.exec(file.url)
          if (extractedCID && extractedCID.length) file.cid = extractedCID[0]
        }
        return file
      }))
    }
  })

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/view">
              <Browse />
            </Route>
            <Route exact path="/files">
              <Files />
            </Route>
            <Route path="/files/:id" component={File} />
            <Route exact path="/share">
              <Share />
            </Route>
            <Route path="/settings">
              <Settings />
            </Route>
            <Route exact path="/">
              <Redirect to="/view" />
            </Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="view" href="/view">
              <IonIcon icon={searchOutline} />
            </IonTabButton>
            <IonTabButton tab="share" href="/share">
              <IonIcon icon={cloudUploadOutline} />
            </IonTabButton>
            {hasFiles && (
              <IonTabButton tab="files" href="/files">
                <IonIcon icon={listOutline} />
              </IonTabButton>
            )}
            <IonTabButton tab="settings" href="/settings">
              <IonIcon icon={settingsOutline} />
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  )
}

export default App
