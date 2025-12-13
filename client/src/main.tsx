import { createRoot } from 'react-dom/client'
import './index.css'
import {layout} from './Layout'
import { RouterProvider } from 'react-router'

createRoot(document.getElementById('root')!).render(
    <RouterProvider router={layout} /> 
)
