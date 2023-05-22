import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, compose, createStore } from 'redux'
import { createBrowserHistory } from 'history'
import { routerMiddleware } from 'connected-react-router'
import { Provider } from 'react-redux'

import './styles/styles.scss';
import App from './js/App';
import rootReducer from './js/reducers'

import * as serviceWorker from './serviceWorker';

const history = createBrowserHistory()

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(
	rootReducer(history),
	composeEnhancer(
		applyMiddleware(
			routerMiddleware(history),
		),
 	),
)

const render = () => {
	ReactDOM.render(
		<Provider store={store}>
				<App history={history} />
		</Provider>,
		document.getElementById('root')
	)
}

render()

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
//reportWebVitals();

