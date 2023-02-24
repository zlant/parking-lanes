import 'normalize.css'
import { initMap } from './parking/interface'
import { type OurWindow } from './utils/types/interfaces'
import './styles/main.scss'

(window as OurWindow).map = initMap()
