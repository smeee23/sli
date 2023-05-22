import React from 'react'
import { Route, Switch } from 'react-router'

import Homepage from './Homepage'
import Dashboard from './Dashboard'
import ProvideInsurance from './ProvideInsurance'
import HowItWorks from './HowItWorks'

import Header from '../components/Header'
import LinkSocial from '../components/LinkSocial'

const routes = (
	<main>
		<Switch>
			<Route exact path={"/"} component={Homepage}/>
			<Route exact path={"/howitworks"} component={HowItWorks}/>
			<Route exact path={"/dashboard"} component={Dashboard}/>
			<Route exact path={"/provideinsurance"} component={ProvideInsurance}/>
		</Switch>
		<Header/>
		<LinkSocial/>
	</main>
)


export default routes
