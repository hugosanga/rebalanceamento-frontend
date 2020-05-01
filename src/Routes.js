import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'

import Logon from './pages/Logon'
import Register from './pages/Register'
import Stocks from './pages/Stocks'
import Composition from './pages/Composition'

import { isAuthenticated } from './services/auth'

const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route
        {...rest}
        render={props =>
            isAuthenticated() ? (
                <Component {...props} />
            ) : (
                <Redirect to={{ pathname: '/', state: { from: props.location } }} />
            )
        }
    />
)

export default function App() {
  return (
      <BrowserRouter>
          <Switch>
              <Route path="/" exact component={Logon} />
              <Route path="/register" component={Register} />
              <PrivateRoute path="/stocks" component={Stocks} />
              <PrivateRoute path="/composition" component={Composition} />
          </Switch>
      </BrowserRouter>
  )
}
