import React from 'react'
import { createBrowserRouter} from 'react-router-dom'
import IndexView from '../templates/IndexView.tsx'
import Login from '../templates/Login.tsx'
import HomeView from '../templates/HomeView.tsx'
const Orders = React.lazy(() => import('../templates/Orders.tsx')) 
const Foods = React.lazy(() => import('../templates/Foods.tsx')) 
const Desks = React.lazy(() => import('../templates/Desks.tsx')) 
const Register = React.lazy(() => import('../templates/Register.tsx')) 



const router = createBrowserRouter([
  {
    path: '/', 
    element: <IndexView />
  },
  {
    path: '/home', 
    element: <HomeView />,
    children: [
      {
        path: 'orders', 
        element: <Orders/>
      }, 
      {
        path: 'foods', 
        element: <Foods/>
      },
      {
        path: 'desks', 
        element: <Desks/>
      },
      {},
    ]
  }, 
  
  {
    path: '/login', 
    element: <Login />,
  }, {
    path: '/register', 
    element: <Register />
  },
])

export default router