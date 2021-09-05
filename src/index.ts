import 'normalize.css'
import './styles/main.scss'
import { initMap } from './parking/interface'
import { OurWindow } from './utils/interfaces'

(window as OurWindow).map = initMap()