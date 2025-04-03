import React from 'react'
import { createBrowserRouter} from 'react-router-dom'
import IndexView from '../templates/IndexView.tsx'
import HomeView from '../templates/HomeView.tsx'
import Orders from '../templates/Orders.tsx'
const Foods = React.lazy(() => import('../templates/Foods.tsx')) 
const Desks = React.lazy(() => import('../templates/Desks.tsx')) 
const Register = React.lazy(() => import('../templates/Register.tsx')) 
const Login = React.lazy(() => import('../templates/Login.tsx'))
const AddFoodView = React.lazy(() => import('../templates/AddFoodView.tsx'))
const AddDeskView = React.lazy(() => import('../templates/AddDeskView.tsx'))
const Landing = React.lazy(() => import('../templates/Landing.tsx'))
const OrderingPage = React.lazy(() => import('../templates/OrderingPage.tsx'))



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
        index: true, 
        element: <Orders/>
      },
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
      {
        path: 'add-food', 
        element: <AddFoodView />
      },
      {
        path: 'add-desk', 
        element: <AddDeskView />
      },
    ]
  }, 
  {
    path: '/login', 
    element: <Login />,
  }, {
    path: '/register', 
    element: <Register />
  },


  {
    path: '/landing/r/:restaurantId/d/:deskId', 
    element: <Landing />
  },
  {
    path: '/r/:restaurantId/d/:deskId', 
    element: <OrderingPage />
  },

])

export default router